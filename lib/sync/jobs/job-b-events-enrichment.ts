/**
 * Job B - Events Enrichment
 *
 * Fréquence: 30-60 minutes
 * Rôle: Enrichir les données d'événements et récupérer les scores finaux
 *
 * Logique:
 * 1. Pour chaque ligue configurée:
 *    - Poll /v3/events pour upcoming & recent matches
 *    - Mettre à jour teams/players avec les données API
 *    - Mettre à jour scores si status=settled
 *    - Transition vers FINISHED si settled
 */

import { supabaseAdmin } from '@/lib/db';
import { oddsApiClient } from '@/lib/api/oddsapi/client';
import { stateMachineService } from '@/lib/sync/state-machine-service';
import { normalizeOddsApiEvent, normalizeTeamName, normalizePlayerName } from '@/lib/api/oddsapi/normalizer';
import { FOOTBALL_LEAGUES, TENNIS_TOURNAMENTS } from '@/lib/config/leagues-config';
import { addDays, subDays } from 'date-fns';
import type { OddsApiEvent } from '@/lib/api/oddsapi/types';

const FOOTBALL = 'football';
const TENNIS = 'tennis';

export class JobBEventsEnrichment {
  /**
   * Exécute le job B
   */
  async run(): Promise<void> {
    console.log('\n🚀 Job B - Enrichment and finalization via /v3/events polling...\n');

    const startTime = Date.now();
    let totalEnriched = 0;
    let totalSettled = 0;

    // Enrichir Football
    console.log('🏈 Processing Football leagues:');
    const activeFootballLeagues = FOOTBALL_LEAGUES.filter(l => l.active);
    for (const league of activeFootballLeagues) {
      try {
        console.log(`\n  📋 ${league.name}`);
        const [enriched, settled] = await this.enrichLeagueEvents(FOOTBALL, league.slug);
        console.log(`     ✅ ${enriched} enriched, ${settled} settled`);
        totalEnriched += enriched;
        totalSettled += settled;
      } catch (error) {
        console.error(`  ❌ Error enriching ${league.name}:`, error instanceof Error ? error.message : error);
      }
    }

    // Enrichir Tennis
    console.log('\n\n🎾 Processing Tennis tournaments:');
    const activeTennisTournaments = TENNIS_TOURNAMENTS.filter(l => l.active);
    for (const tournament of activeTennisTournaments) {
      try {
        console.log(`\n  📋 ${tournament.name}`);
        const [enriched, settled] = await this.enrichLeagueEvents(TENNIS, tournament.slug);
        console.log(`     ✅ ${enriched} enriched, ${settled} settled`);
        totalEnriched += enriched;
        totalSettled += settled;
      } catch (error) {
        console.error(`  ❌ Error enriching ${tournament.name}:`, error instanceof Error ? error.message : error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`\n✅ Job B completed in ${duration}ms`);
    console.log(`   📊 Total enriched: ${totalEnriched}`);
    console.log(`   🏁 Total settled:  ${totalSettled}`);
  }

  /**
   * Enrichit les événements d'une ligue/tournoi
   */
  private async enrichLeagueEvents(sport: string, leagueSlug: string): Promise<[number, number]> {
    const from = subDays(new Date(), 7);  // Derniers 7 jours
    const to = addDays(new Date(), 30);   // Prochains 30 jours

    let events: OddsApiEvent[] = [];

    try {
      events = await oddsApiClient.getEvents({
        sport,
        league: leagueSlug,
        fromDate: from,
        toDate: to,
      });
    } catch (error) {
      console.warn(`     ⚠️  Could not fetch events: ${error instanceof Error ? error.message : error}`);
      return [0, 0];
    }

    if (!events || events.length === 0) {
      console.log(`     ℹ️  No events found`);
      return [0, 0];
    }

    console.log(`     📌 Processing ${events.length} events`);

    let enriched = 0;
    let settled = 0;

    for (const event of events) {
      try {
        const [isEnriched, isSettled] = await this.enrichEvent(event, sport, leagueSlug);
        if (isEnriched) enriched++;
        if (isSettled) settled++;
      } catch (error) {
        console.warn(`     ⚠️  Error processing event ${event.id}: ${error instanceof Error ? error.message : error}`);
      }
    }

    return [enriched, settled];
  }

  /**
   * Enrichit un événement unique
   * Retourne [enriched, settled]
   */
  private async enrichEvent(event: OddsApiEvent, sport: string, leagueSlug: string): Promise<[boolean, boolean]> {
    const eventId = event.id;
    let enriched = false;
    let settled = false;

    // Récupérer l'événement existant
    const { data: existing } = await supabaseAdmin
      .from('events_to_track')
      .select('*')
      .eq('event_id', eventId)
      .single();

    // Si l'événement n'existe pas, l'ignorer (sera créé par Job A)
    if (!existing) {
      return [false, false];
    }

    // Normaliser les données
    const normalized = normalizeOddsApiEvent(event);

    // Mettre à jour les teams/players si présents
    if (sport === FOOTBALL && event.home_team && event.away_team) {
      const homeTeamId = await this.ensureTeam(event.home_team, sport);
      const awayTeamId = await this.ensureTeam(event.away_team, sport);

      const { error } = await supabaseAdmin
        .from('events_to_track')
        .update({
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          updated_at: new Date().toISOString(),
        })
        .eq('event_id', eventId);

      enriched = !error;
    }

    if (sport === TENNIS && event.player1 && event.player2) {
      const player1Id = await this.ensurePlayer(event.player1);
      const player2Id = await this.ensurePlayer(event.player2);

      const { error } = await supabaseAdmin
        .from('events_to_track')
        .update({
          player1_id: player1Id,
          player2_id: player2Id,
          updated_at: new Date().toISOString(),
        })
        .eq('event_id', eventId);

      enriched = !error;
    }

    // Vérifier si l'événement est settled
    if (event.status === 'settled' && event.scores) {
      const homeScore = event.scores.home ?? 0;
      const awayScore = event.scores.away ?? 0;

      // Transitionner vers FINISHED
      await stateMachineService.finalizeMatch(eventId, {
        home: homeScore,
        away: awayScore,
      });

      // Insérer dans match_results
      const { error } = await supabaseAdmin
        .from('match_results')
        .upsert(
          [
            {
              event_id: eventId,
              sport_slug: sport,
              league_slug: leagueSlug,
              home_score: homeScore,
              away_score: awayScore,
              event_date: normalized.eventDate?.toISOString(),
              status: 'settled',
              settled_at: new Date().toISOString(),
            },
          ],
          { onConflict: 'event_id' }
        );

      settled = !error;
    }

    return [enriched, settled];
  }

  /**
   * Récupère ou crée une équipe
   */
  private async ensureTeam(teamName: string, sport: string): Promise<string> {
    const normalized = normalizeTeamName(teamName);

    const { data: existing } = await supabaseAdmin
      .from('teams_v2')
      .select('id')
      .eq('normalized_name', normalized)
      .eq('sport_id', (await this.getSportId(sport)))
      .single();

    if (existing) {
      return existing.id;
    }

    const { data: created } = await supabaseAdmin
      .from('teams_v2')
      .insert([
        {
          oddsapi_name: teamName,
          normalized_name: normalized,
          display_name: teamName,
          sport_id: await this.getSportId(sport),
        },
      ])
      .select('id')
      .single();

    return created?.id || '';
  }

  /**
   * Récupère ou crée un joueur
   */
  private async ensurePlayer(playerName: string): Promise<string> {
    const normalized = normalizePlayerName(playerName);

    const { data: existing } = await supabaseAdmin
      .from('players_v2')
      .select('id')
      .eq('normalized_name', normalized)
      .single();

    if (existing) {
      return existing.id;
    }

    const { data: created } = await supabaseAdmin
      .from('players_v2')
      .insert([
        {
          oddsapi_name: playerName,
          normalized_name: normalized,
          display_name: playerName,
        },
      ])
      .select('id')
      .single();

    return created?.id || '';
  }

  /**
   * Récupère l'ID du sport
   */
  private async getSportId(sport: string): Promise<string> {
    const { data } = await supabaseAdmin
      .from('sports_v2')
      .select('id')
      .eq('slug', sport.toLowerCase())
      .single();

    return data?.id || '';
  }
}

// Export singleton
export const jobBEventsEnrichment = new JobBEventsEnrichment();
