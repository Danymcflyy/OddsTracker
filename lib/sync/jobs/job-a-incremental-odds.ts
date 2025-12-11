/**
 * Job A - Incremental Odds Polling
 *
 * Fréquence: 60 secondes
 * Rôle: Découvrir nouvelles cotes Pinnacle
 *
 * Logique:
 * 1. Poll /v3/odds/updated pour chaque sport depuis le dernier timestamp
 * 2. Pour chaque événement avec nouvelles cotes:
 *    - Créer entry dans events_to_track (état: DISCOVERED_NO_ODDS)
 *    - Récupérer les cotes complètes via /v3/odds
 *    - Insérer dans opening_closing_observed
 *    - Transition -> OPENING_CAPTURED_SLEEPING
 * 3. Sauvegarder le timestamp pour prochain poll
 */

import { supabaseAdmin } from '@/lib/db';
import { oddsApiClient } from '@/lib/api/oddsapi/client';
import { stateMachineService } from '@/lib/sync/state-machine-service';
import {
  normalizeOddsApiEvent,
  normalizeOddsApiOdds,
  normalizeTeamName,
  normalizePlayerName,
  isValidEvent,
  isValidMarket,
  isValidOdd,
} from '@/lib/api/oddsapi/normalizer';
import type { OddsApiUpdatedEvent } from '@/lib/api/oddsapi/types';

interface JobAState {
  [sport: string]: number;  // sport -> last_since timestamp
}

const SPORTS = ['Football', 'Tennis'];

export class JobAIncrementalOdds {
  private state: JobAState = {};

  /**
   * Initialise l'état du job depuis la base de données
   */
  async initialize(): Promise<void> {
    for (const sport of SPORTS) {
      const lastSync = await this.getLastSyncTimestamp(sport);
      this.state[sport] = lastSync;
    }

    console.log('🔄 Job A initialized with last sync timestamps:', this.state);
  }

  /**
   * Exécute le job A
   */
  async run(): Promise<void> {
    console.log('\n🚀 Job A - Starting incremental odds polling...\n');

    const startTime = Date.now();
    let totalEventsProcessed = 0;

    for (const sport of SPORTS) {
      try {
        const since = this.state[sport];
        console.log(`\n📊 Polling ${sport} since ${new Date(since * 1000).toISOString()}`);

        // 1. Récupérer les cotes mises à jour
        const updated = await oddsApiClient.getOddsUpdated({
          sport: sport.toLowerCase(),
          since,
          bookmakers: ['pinnacle'],
        });

        if (!updated.events_updated || updated.events_updated.length === 0) {
          console.log(`   ℹ️  No new odds for ${sport}`);
          continue;
        }

        console.log(`   ✅ Found ${updated.events_updated.length} events with updated odds`);

        // 2. Traiter chaque événement
        let processed = 0;
        for (const updatedEvent of updated.events_updated) {
          try {
            await this.processEvent(updatedEvent, sport);
            processed++;
          } catch (error) {
            console.error(`   ❌ Error processing event ${updatedEvent.id}:`, error);
            continue;
          }
        }

        // 3. Mettre à jour le timestamp
        this.state[sport] = updated.last_updated;
        await this.saveLastSyncTimestamp(sport, updated.last_updated);

        console.log(`   ✅ Processed ${processed}/${updated.events_updated.length} events`);
        totalEventsProcessed += processed;
      } catch (error) {
        console.error(`❌ Error polling ${sport}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`\n✅ Job A completed in ${duration}ms - Processed ${totalEventsProcessed} events`);
  }

  /**
   * Traite un événement découvert
   */
  private async processEvent(updatedEvent: OddsApiUpdatedEvent, sport: string): Promise<void> {
    const eventId = updatedEvent.id;

    // Vérifier si l'événement existe déjà
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('events_to_track')
      .select('*')
      .eq('event_id', eventId)
      .single();

    if (existing) {
      // L'événement existe déjà, on ne fait rien
      return;
    }

    // 1. Récupérer les détails de l'événement et les cotes
    const sportLower = sport.toLowerCase() === 'tennis' ? 'tennis' : 'football';
    const odds = await oddsApiClient.getOdds(eventId);

    // Valider et normaliser les données
    if (!odds || !odds.bookmakers || odds.bookmakers.length === 0) {
      console.warn(`   ⚠️  No Pinnacle odds found for event ${eventId}`);
      return;
    }

    const normalizedEvent = normalizeOddsApiEvent(odds);
    const normalizedOdds = normalizeOddsApiOdds(odds);

    // Vérifier que l'événement est valide pour ce sport
    if (!isValidEvent(normalizedEvent, sport)) {
      console.warn(`   ⚠️  Invalid event structure for ${sport}: ${eventId}`);
      return;
    }

    // 2. Créer l'entrée event dans events_to_track
    const eventData = {
      event_id: eventId,
      sport_slug: sport,
      league_slug: normalizedEvent.leagueSlug || null,
      home_team_id: null as any,
      away_team_id: null as any,
      player1_id: null as any,
      player2_id: null as any,
      event_date: normalizedEvent.eventDate.toISOString(),
      status: 'pending',
      state: 'DISCOVERED_NO_ODDS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Pour Football: mapper les équipes
    if (sport === 'Football' && normalizedEvent.homeTeam && normalizedEvent.awayTeam) {
      const homeTeamId = await this.ensureTeam(normalizedEvent.homeTeam, sport);
      const awayTeamId = await this.ensureTeam(normalizedEvent.awayTeam, sport);
      eventData.home_team_id = homeTeamId;
      eventData.away_team_id = awayTeamId;
    }

    // Pour Tennis: mapper les joueurs
    if (sport === 'Tennis' && normalizedEvent.player1 && normalizedEvent.player2) {
      const player1Id = await this.ensurePlayer(normalizedEvent.player1, 'match');
      const player2Id = await this.ensurePlayer(normalizedEvent.player2, 'match');
      eventData.player1_id = player1Id;
      eventData.player2_id = player2Id;
    }

    // Insérer l'événement
    const { error: insertError } = await supabaseAdmin
      .from('events_to_track')
      .insert([eventData]);

    if (insertError) {
      console.error(`   ❌ Failed to insert event ${eventId}:`, insertError);
      return;
    }

    // 3. Insérer les cotes observées
    let oddsInserted = 0;
    for (const [bookmakerKey, bookmakerData] of Object.entries(normalizedOdds.bookmakerOdds)) {
      if (bookmakerKey !== 'pinnacle') continue;

      for (const [marketKey, marketData] of Object.entries(bookmakerData.markets)) {
        for (const [outcomeName, outcomeData] of Object.entries(marketData.outcomes)) {
          const oddData = {
            event_id: eventId,
            sport_slug: sport,
            league_slug: normalizedEvent.leagueSlug || null,
            bookmaker: 'Pinnacle',
            market_name: marketKey,
            selection: outcomeName,
            line: outcomeData.line || null,
            opening_price_observed: outcomeData.price,
            opening_time_observed: normalizedOdds.lastUpdated.toISOString(),
            closing_price_observed: null,
            closing_time_observed: null,
            is_winner: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error: oddError } = await supabaseAdmin
            .from('opening_closing_observed')
            .upsert([oddData], {
              onConflict: 'event_id,bookmaker,market_name,selection,line',
            });

          if (!oddError) {
            oddsInserted++;
          } else {
            console.error(`   ❌ Failed to insert odd: ${oddError.message}`);
          }
        }
      }
    }

    if (oddsInserted > 0) {
      // 4. Transition à OPENING_CAPTURED_SLEEPING
      await stateMachineService.captureOpening(eventId, sport);
      console.log(`   ✅ Event ${eventId}: discovered + ${oddsInserted} odds captured`);
    } else {
      console.warn(`   ⚠️  No odds captured for event ${eventId}`);
    }
  }

  /**
   * Récupère ou crée une équipe
   */
  private async ensureTeam(teamName: string, sport: string): Promise<string> {
    const normalized = normalizeTeamName(teamName);

    // Chercher l'équipe existante
    const { data: existing } = await supabaseAdmin
      .from('teams_v2')
      .select('id')
      .eq('normalized_name', normalized)
      .eq('sport_id', (await this.getSportId(sport)))
      .single();

    if (existing) {
      return existing.id;
    }

    // Créer l'équipe
    const { data: created, error } = await supabaseAdmin
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

    if (error || !created) {
      console.error(`Error creating team ${teamName}:`, error);
      return '';
    }

    return created.id;
  }

  /**
   * Récupère ou crée un joueur (Tennis)
   */
  private async ensurePlayer(playerName: string, gender: 'male' | 'female' | 'match'): Promise<string> {
    const normalized = normalizePlayerName(playerName);
    const playerGender = gender === 'match' ? 'male' : gender;  // Default for simplicity

    // Chercher le joueur existant
    const { data: existing } = await supabaseAdmin
      .from('players_v2')
      .select('id')
      .eq('normalized_name', normalized)
      .eq('gender', playerGender)
      .single();

    if (existing) {
      return existing.id;
    }

    // Créer le joueur
    const { data: created, error } = await supabaseAdmin
      .from('players_v2')
      .insert([
        {
          oddsapi_name: playerName,
          normalized_name: normalized,
          display_name: playerName,
          gender: playerGender,
        },
      ])
      .select('id')
      .single();

    if (error || !created) {
      console.error(`Error creating player ${playerName}:`, error);
      return '';
    }

    return created.id;
  }

  /**
   * Récupère l'ID du sport
   */
  private async getSportId(sport: string): Promise<string> {
    const { data, error } = await supabaseAdmin
      .from('sports_v2')
      .select('id')
      .eq('slug', sport.toLowerCase())
      .single();

    if (error || !data) {
      throw new Error(`Sport ${sport} not found`);
    }

    return data.id;
  }

  /**
   * Récupère le dernier timestamp de sync pour un sport
   */
  private async getLastSyncTimestamp(sport: string): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', `job_a_last_sync_${sport.toLowerCase()}`)
      .single();

    if (error || !data?.value) {
      // Retourner 24h avant
      return Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
    }

    return parseInt(data.value, 10);
  }

  /**
   * Sauvegarde le dernier timestamp de sync
   */
  private async saveLastSyncTimestamp(sport: string, timestamp: number): Promise<void> {
    await supabaseAdmin
      .from('settings')
      .upsert(
        [
          {
            key: `job_a_last_sync_${sport.toLowerCase()}`,
            value: String(timestamp),
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'key' }
      );
  }
}

// Export singleton
export const jobAIncrementalOdds = new JobAIncrementalOdds();
