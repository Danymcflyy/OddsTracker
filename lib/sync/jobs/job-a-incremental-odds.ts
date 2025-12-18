/**
 * Job A - Discover New Events via /v3/events Polling
 *
 * Fréquence: Toutes les heures
 * Rôle: Découvrir nouvelles cotes Pinnacle pour chaque ligue
 *
 * Logique (REFACTORISÉE):
 * 1. Pour chaque ligue football (15 ligues):
 *    - Appeler /v3/events?sport=football&league=SLUG
 *    - Comparer avec events_to_track pour détecter nouveaux matchs
 *    - Pour chaque nouveau match: appeler /v3/odds?eventId=X
 *    - Capturer opening_price_observed + opening_time_observed
 *    - Insérer dans events_to_track + opening_closing_observed
 * 2. Pour tennis: mêmes étapes
 * 3. Transition -> OPENING_CAPTURED_SLEEPING
 *
 * NOTE: /v3/odds/updated n'existe pas! Cette approche est plus robuste de toute façon.
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
import { FOOTBALL_LEAGUES, TENNIS_TOURNAMENTS } from '@/lib/config/leagues-config';
import type { OddsApiEvent } from '@/lib/api/oddsapi/types';

const FOOTBALL = 'football';
const TENNIS = 'tennis';

export class JobAIncrementalOdds {
  /**
   * Exécute le job A - Poll /v3/events pour chaque ligue
   */
  async run(): Promise<void> {
    console.log('\n🚀 Job A - Discover new events via /v3/events polling...\n');

    const startTime = Date.now();
    let totalLeaguesProcessed = 0;
    let totalEventsDiscovered = 0;

    // 1. Poll tous les championnats football
    console.log('🏈 Football leagues:');
    const activeFootballLeagues = FOOTBALL_LEAGUES.filter(l => l.active);
    for (const league of activeFootballLeagues) {
      try {
        console.log(`\n  📋 ${league.name} (${league.slug})`);
        const newEvents = await this.discoverLeagueEvents(FOOTBALL, league.slug);
        console.log(`     ✅ Found ${newEvents} new events with odds`);
        totalEventsDiscovered += newEvents;
      } catch (error) {
        console.error(`  ❌ Error polling ${league.slug}:`, error instanceof Error ? error.message : error);
      }
      totalLeaguesProcessed++;
    }

    // 2. Poll tous les tournois tennis
    console.log('\n\n🎾 Tennis tournaments:');
    const activeTennisTournaments = TENNIS_TOURNAMENTS.filter(l => l.active);
    for (const tournament of activeTennisTournaments) {
      try {
        console.log(`\n  📋 ${tournament.name} (${tournament.slug})`);
        const newEvents = await this.discoverLeagueEvents(TENNIS, tournament.slug);
        console.log(`     ✅ Found ${newEvents} new events with odds`);
        totalEventsDiscovered += newEvents;
      } catch (error) {
        console.error(`  ❌ Error polling ${tournament.slug}:`, error instanceof Error ? error.message : error);
      }
      totalLeaguesProcessed++;
    }

    const duration = Date.now() - startTime;
    console.log(`\n✅ Job A completed in ${duration}ms`);
    console.log(`   📊 Processed ${totalLeaguesProcessed} leagues/tournaments`);
    console.log(`   🎯 Discovered ${totalEventsDiscovered} new events with odds`);
  }

  /**
   * Découvre les nouveaux matchs pour une ligue donnée
   */
  private async discoverLeagueEvents(sport: string, leagueSlug: string): Promise<number> {
    // 1. Récupérer tous les événements de la ligue
    if (!oddsApiClient) {
      throw new Error('Odds API client not initialized');
    }

    const events = await oddsApiClient.getEvents({
      sport,
      league: leagueSlug,
      fromDate: new Date(),
      toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    if (!events || events.length === 0) {
      console.log(`     ℹ️  No events found`);
      return 0;
    }

    console.log(`     📌 ${events.length} events in API`);

    // 2. Comparer avec DB pour trouver nouveaux
    const { data: existingEventIds } = await supabaseAdmin
      .from('events_to_track')
      .select('event_id')
      .eq('sport_slug', sport)
      .eq('league_slug', leagueSlug);

    const existingIds = new Set(existingEventIds?.map(e => e.event_id) || []);
    const newEvents = events.filter(e => !existingIds.has(e.id));

    if (newEvents.length === 0) {
      console.log(`     ℹ️  No new events`);
      return 0;
    }

    // Filter out cancelled events (no odds available)
    const activeEvents = newEvents.filter(e => (e as any).status !== 'cancelled');
    if (activeEvents.length === 0) {
      console.log(`     ⚠️  ${newEvents.length} new events but all cancelled`);
      return 0;
    }

    console.log(`     🆕 ${activeEvents.length} new active events (${newEvents.length - activeEvents.length} cancelled)`);

    // 3. Traiter chaque nouvel événement
    let processedCount = 0;
    for (const event of activeEvents) {
      try {
        const processed = await this.processNewEvent(sport, leagueSlug, event);
        if (processed) {
          processedCount++;
        }
      } catch (error) {
        console.warn(`     ⚠️  Error processing event ${event.id}: ${error instanceof Error ? error.message : error}`);
      }
    }

    return processedCount;
  }

  /**
   * Traite un nouvel événement - récupère les cotes et les enregistre
   */
  private async processNewEvent(sport: string, leagueSlug: string, event: OddsApiEvent): Promise<boolean> {
    // 1. Récupérer les cotes pour cet événement
    if (!oddsApiClient) {
      throw new Error('Odds API client not initialized');
    }

    let odds;
    try {
      odds = await oddsApiClient.getOdds(event.id);
    } catch (error) {
      console.warn(`     ⚠️  Could not fetch odds for event ${event.id}`);
      return false;
    }

    // Vérifier que Pinnacle est disponible
    // Note: odds.bookmakers is an object keyed by bookmaker name
    // odds.bookmakers.Pinnacle is an ARRAY of markets: [ { name, updatedAt, odds } ]
    const pinnacleArray = odds.bookmakers?.['Pinnacle'] || odds.bookmakers?.Pinnacle;
    if (!pinnacleArray || !Array.isArray(pinnacleArray) || pinnacleArray.length === 0) {
      console.warn(`     ⚠️  No Pinnacle odds for event ${event.id}`);
      return false;
    }

    // 2. Normaliser les données
    const normalizedEvent = normalizeOddsApiEvent(odds as any);
    const normalizedOdds = normalizeOddsApiOdds(odds);

    // 3. Préparer les données pour events_to_track
    let eventData: any = {
      event_id: event.id,
      sport_slug: sport,
      league_slug: leagueSlug,
      event_date: event.date || normalizedEvent.eventDate?.toISOString(),
      status: event.status || 'pending',
      state: 'OPENING_CAPTURED_SLEEPING',
      next_scan_at: new Date(new Date(event.date).getTime() - 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 4. Mapper les équipes (Football)
    if (sport === FOOTBALL && normalizedEvent.homeTeam && normalizedEvent.awayTeam) {
      const homeTeamId = await this.ensureTeam(normalizedEvent.homeTeam, sport);
      const awayTeamId = await this.ensureTeam(normalizedEvent.awayTeam, sport);
      eventData.home_team_id = homeTeamId;
      eventData.away_team_id = awayTeamId;
    }

    // 5. Mapper les joueurs (Tennis)
    if (sport === TENNIS && normalizedEvent.player1 && normalizedEvent.player2) {
      const player1Id = await this.ensurePlayer(normalizedEvent.player1);
      const player2Id = await this.ensurePlayer(normalizedEvent.player2);
      eventData.player1_id = player1Id;
      eventData.player2_id = player2Id;
    }

    // 6. Insérer l'événement
    const { error: insertEventError } = await supabaseAdmin
      .from('events_to_track')
      .insert([eventData]);

    if (insertEventError) {
      console.warn(`     ⚠️  Failed to insert event ${event.id}: ${insertEventError.message}`);
      return false;
    }

    // 7. Insérer les cotes observées
    // pinnacleArray is: [ { name: "ML", updatedAt, odds: [ { home, draw, away } ] }, ... ]
    let oddsInserted = 0;
    const nowISO = new Date().toISOString();

    for (const market of pinnacleArray) {
      const marketName = market.name;  // e.g., "ML", "Spread", "Totals"
      const updatedAt = market.updatedAt || nowISO;

      if (!market.odds || !Array.isArray(market.odds)) continue;

      for (const oddItem of market.odds) {
        // Each oddItem can have: home, away, draw (for ML), or home, away, hdp (for Spread), or over, under, hdp (for Totals)
        const hdp = oddItem.hdp !== undefined ? oddItem.hdp : null;

        // Insert one row per outcome
        const outcomes = [];
        if (oddItem.home !== undefined) outcomes.push({ selection: 'home', price: oddItem.home });
        if (oddItem.away !== undefined) outcomes.push({ selection: 'away', price: oddItem.away });
        if (oddItem.draw !== undefined) outcomes.push({ selection: 'draw', price: oddItem.draw });
        if (oddItem.over !== undefined) outcomes.push({ selection: 'over', price: oddItem.over });
        if (oddItem.under !== undefined) outcomes.push({ selection: 'under', price: oddItem.under });

        for (const outcome of outcomes) {
          const oddData = {
            event_id: event.id,
            sport_slug: sport,
            league_slug: leagueSlug,
            bookmaker: 'Pinnacle',
            market_name: marketName,
            selection: outcome.selection,
            line: hdp,
            opening_price_observed: parseFloat(outcome.price),
            opening_time_observed: updatedAt,
            closing_price_observed: null,
            closing_time_observed: null,
            is_winner: null,
            created_at: nowISO,
            updated_at: nowISO,
          };

          const { error: oddError } = await supabaseAdmin
            .from('opening_closing_observed')
            .insert([oddData]);

          if (!oddError) {
            oddsInserted++;
          } else if (!oddError.message.includes('duplicate key')) {
            console.warn(`     ⚠️  Error inserting odd: ${oddError.message}`);
          }
        }
      }
    }

    if (oddsInserted > 0) {
      console.log(`     ✅ Event ${event.id}: inserted with ${oddsInserted} odds`);
      return true;
    }

    return false;
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
  private async ensurePlayer(playerName: string): Promise<string> {
    const normalized = normalizePlayerName(playerName);

    // Chercher le joueur existant
    const { data: existing } = await supabaseAdmin
      .from('players_v2')
      .select('id')
      .eq('normalized_name', normalized)
      .single();

    if (existing) {
      return existing.id;
    }

    // Créer le joueur (gender sera NULL jusqu'à enrichissement)
    const { data: created, error } = await supabaseAdmin
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

}

// Export singleton
export const jobAIncrementalOdds = new JobAIncrementalOdds();
