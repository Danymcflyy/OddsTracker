/**
 * StateMachineService - Gère le cycle de vie des événements
 *
 * États:
 * 1. DISCOVERED_NO_ODDS: Événement découvert, attente de premières cotes
 * 2. OPENING_CAPTURED_SLEEPING: Cotes d'ouverture capturées, en sommeil jusqu'à H-1
 * 3. ACTIVE_NEAR_KO: En phase active (1h avant), polling intensif pour closing
 * 4. FINISHED: Match terminé, données finalisées
 */

import { supabaseAdmin } from '@/lib/db';
import type { EventState, EventToTrack, OpeningClosingObserved } from '@/lib/api/oddsapi/types';

const MINUTES_BEFORE_KO = 60;  // Passer à ACTIVE_NEAR_KO 1h avant

export class StateMachineService {
  /**
   * Transition: DISCOVERED_NO_ODDS -> OPENING_CAPTURED_SLEEPING
   * Appelée lorsque les premières cotes sont découvertes
   */
  async captureOpening(eventId: number, sportSlug: string): Promise<void> {
    const { data: event, error: fetchError } = await supabaseAdmin
      .from('events_to_track')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (fetchError || !event) {
      console.warn(`❌ Event ${eventId} not found for opening capture`);
      return;
    }

    // Vérifier qu'on passe de DISCOVERED vers OPENING_CAPTURED
    if (event.state !== 'DISCOVERED_NO_ODDS') {
      console.log(`ℹ️  Event ${eventId} already in state ${event.state}, skipping opening capture`);
      return;
    }

    // Calculer next_scan_at: juste avant le match
    const eventDate = new Date(event.event_date);
    const nextScanTime = new Date(eventDate.getTime() - MINUTES_BEFORE_KO * 60 * 1000);

    // Mettre à jour état
    const { error: updateError } = await supabaseAdmin
      .from('events_to_track')
      .update({
        state: 'OPENING_CAPTURED_SLEEPING',
        next_scan_at: nextScanTime.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', eventId);

    if (updateError) {
      console.error(`❌ Failed to update state for event ${eventId}:`, updateError);
      return;
    }

    console.log(
      `✅ Event ${eventId} transition: DISCOVERED -> OPENING_CAPTURED_SLEEPING\n` +
      `   Next scan: ${nextScanTime.toISOString()}`
    );
  }

  /**
   * Transition: OPENING_CAPTURED_SLEEPING -> ACTIVE_NEAR_KO
   * Appelée pour les matchs à H-1
   */
  async activateNearKickoff(): Promise<number> {
    const now = new Date();
    const { data: eventsToActivate, error } = await supabaseAdmin
      .from('events_to_track')
      .select('*')
      .eq('state', 'OPENING_CAPTURED_SLEEPING')
      .lte('next_scan_at', now.toISOString())
      .order('event_date', { ascending: true });

    if (error) {
      console.error('❌ Failed to fetch events for activation:', error);
      return 0;
    }

    let activated = 0;

    for (const event of eventsToActivate || []) {
      const { error: updateError } = await supabaseAdmin
        .from('events_to_track')
        .update({
          state: 'ACTIVE_NEAR_KO',
          next_scan_at: now.toISOString(),  // Scan immédiatement
          updated_at: now.toISOString(),
        })
        .eq('event_id', event.event_id);

      if (!updateError) {
        activated++;
        console.log(`✅ Event ${event.event_id} activated: OPENING_CAPTURED -> ACTIVE_NEAR_KO`);
      } else {
        console.error(`❌ Failed to activate event ${event.event_id}:`, updateError);
      }
    }

    if (activated > 0) {
      console.log(`\n📊 Activated ${activated} events for pre-KO scanning`);
    }

    return activated;
  }

  /**
   * Transition: ACTIVE_NEAR_KO -> FINISHED
   * Appelée quand le match est terminé (via settlement)
   */
  async finalizeMatch(eventId: number, scores: { home: number; away: number }): Promise<void> {
    const { error } = await supabaseAdmin
      .from('events_to_track')
      .update({
        state: 'FINISHED',
        status: 'settled',
        home_score: scores.home,
        away_score: scores.away,
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', eventId);

    if (error) {
      console.error(`❌ Failed to finalize event ${eventId}:`, error);
      return;
    }

    console.log(
      `✅ Event ${eventId} finalized: ACTIVE_NEAR_KO -> FINISHED\n` +
      `   Score: ${scores.home} - ${scores.away}`
    );

    // Calculer winners pour les cotes
    await this.calculateWinners(eventId, scores);
  }

  /**
   * Récupère les événements en état ACTIVE_NEAR_KO
   * Utilisés par Job C pour le polling intensif
   */
  async getActiveEvents(): Promise<EventToTrack[]> {
    const { data, error } = await supabaseAdmin
      .from('events_to_track')
      .select('*')
      .eq('state', 'ACTIVE_NEAR_KO')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('❌ Failed to fetch active events:', error);
      return [];
    }

    return (data || []) as EventToTrack[];
  }

  /**
   * Récupère les événements à activer (état OPENING_CAPTURED_SLEEPING avec next_scan_at dépassé)
   */
  async getEventsToActivate(): Promise<EventToTrack[]> {
    const now = new Date();
    const { data, error } = await supabaseAdmin
      .from('events_to_track')
      .select('*')
      .eq('state', 'OPENING_CAPTURED_SLEEPING')
      .lte('next_scan_at', now.toISOString())
      .order('event_date', { ascending: true });

    if (error) {
      console.error('❌ Failed to fetch events to activate:', error);
      return [];
    }

    return (data || []) as EventToTrack[];
  }

  /**
   * Calcule is_winner pour les cotes basées sur le score final
   */
  private async calculateWinners(eventId: number, scores: { home: number; away: number }): Promise<void> {
    const { data: odds, error: fetchError } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('*')
      .eq('event_id', eventId)
      .eq('bookmaker', 'Pinnacle');

    if (fetchError || !odds) {
      console.warn(`⚠️  No odds found for event ${eventId} to calculate winners`);
      return;
    }

    const updates: any[] = [];

    for (const odd of odds) {
      let isWinner: boolean | null = null;

      // Déterminer si cette cote est gagnante selon le marché et le score
      switch (odd.market_name) {
        case 'h2h':  // 1X2
          if (odd.selection === '1' && scores.home > scores.away) isWinner = true;
          else if (odd.selection === '2' && scores.away > scores.home) isWinner = true;
          else if (odd.selection === 'X' && scores.home === scores.away) isWinner = true;
          else isWinner = false;
          break;

        case 'h2h_h1':  // Halftime
          // Attendre données halftime (non implémenté pour l'instant)
          break;

        case 'totals':  // Over/Under
          const totalGoals = scores.home + scores.away;
          if (!odd.line) break;
          if (odd.selection === 'OVER' && totalGoals > odd.line) isWinner = true;
          else if (odd.selection === 'UNDER' && totalGoals < odd.line) isWinner = true;
          else isWinner = false;
          break;

        case 'spreads':  // Handicap
          if (!odd.line) break;
          const homeAdjusted = scores.home - odd.line;
          if (homeAdjusted > scores.away) isWinner = true;
          else if (homeAdjusted < scores.away) isWinner = false;
          else isWinner = null;  // Push
          break;

        case 'team_totals_home':
          if (!odd.line) break;
          if (odd.selection === 'OVER' && scores.home > odd.line) isWinner = true;
          else if (odd.selection === 'UNDER' && scores.home < odd.line) isWinner = true;
          else isWinner = false;
          break;

        case 'team_totals_away':
          if (!odd.line) break;
          if (odd.selection === 'OVER' && scores.away > odd.line) isWinner = true;
          else if (odd.selection === 'UNDER' && scores.away < odd.line) isWinner = true;
          else isWinner = false;
          break;
      }

      // Mettre à jour si winner calculé
      if (isWinner !== null) {
        updates.push({
          id: odd.id,
          is_winner: isWinner,
          updated_at: new Date().toISOString(),
        });
      }
    }

    // Batch update
    if (updates.length > 0) {
      for (const update of updates) {
        await supabaseAdmin
          .from('opening_closing_observed')
          .update({ is_winner: update.is_winner, updated_at: update.updated_at })
          .eq('id', update.id);
      }

      console.log(`✅ Calculated winners for ${updates.length} odds (event ${eventId})`);
    }
  }

  /**
   * Obtient la statistique d'état machine
   */
  async getStateStats(): Promise<Record<string, number>> {
    const { data, error } = await supabaseAdmin
      .from('events_to_track')
      .select('state', { count: 'exact' });

    if (error || !data) {
      return {};
    }

    const stats: Record<string, number> = {
      DISCOVERED_NO_ODDS: 0,
      OPENING_CAPTURED_SLEEPING: 0,
      ACTIVE_NEAR_KO: 0,
      FINISHED: 0,
    };

    // Compter par état via query distinctes
    const states: EventState[] = ['DISCOVERED_NO_ODDS', 'OPENING_CAPTURED_SLEEPING', 'ACTIVE_NEAR_KO', 'FINISHED'];

    for (const state of states) {
      const { count, error: countError } = await supabaseAdmin
        .from('events_to_track')
        .select('*', { count: 'exact', head: true })
        .eq('state', state);

      if (!countError && count !== null) {
        stats[state] = count;
      }
    }

    return stats;
  }

  /**
   * Logs les statistiques d'état machine
   */
  async logStateStats(): Promise<void> {
    const stats = await this.getStateStats();
    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    console.log(`
📊 === STATE MACHINE STATISTICS ===
   DISCOVERED_NO_ODDS:        ${stats.DISCOVERED_NO_ODDS}
   OPENING_CAPTURED_SLEEPING: ${stats.OPENING_CAPTURED_SLEEPING}
   ACTIVE_NEAR_KO:            ${stats.ACTIVE_NEAR_KO}
   FINISHED:                  ${stats.FINISHED}
   ─────────────────────────
   TOTAL:                     ${total}
====================================
    `);
  }
}

// Export singleton
export const stateMachineService = new StateMachineService();
