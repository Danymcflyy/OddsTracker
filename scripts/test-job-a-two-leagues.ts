/**
 * Test Job A - Two Leagues
 *
 * Teste le Job A sur 2 ligues:
 * - England Premier League
 * - France Ligue 1
 *
 * Simule le comportement réel du Job A sans cron
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';
import { oddsApiClient } from '@/lib/api/oddsapi/client';
import { normalizeTeamName, normalizeMarketKey } from '@/lib/api/oddsapi/normalizer';

const FOOTBALL = 'football';
const LEAGUES = [
  { slug: 'england-premier-league', name: 'England Premier League' },
  { slug: 'france-ligue-1', name: 'France Ligue 1' },
];

interface EventStats {
  league: string;
  totalInApi: number;
  newEvents: number;
  eventsWithOdds: number;
  oddsInserted: number;
  errors: number;
}

async function main() {
  console.log('\n🚀 Testing Job A - Two Leagues\n');
  console.log('Leagues to process:');
  LEAGUES.forEach(l => console.log(`  • ${l.name} (${l.slug})`));
  console.log('');

  const stats: EventStats[] = [];
  const startTime = Date.now();

  for (const league of LEAGUES) {
    const leagueStats = await processLeague(league.slug, league.name);
    stats.push(leagueStats);
  }

  const duration = Date.now() - startTime;

  // Print summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80) + '\n');

  stats.forEach(s => {
    console.log(`${s.league}`);
    console.log(`  Events in API:        ${s.totalInApi}`);
    console.log(`  New events found:     ${s.newEvents}`);
    console.log(`  With Pinnacle odds:   ${s.eventsWithOdds}`);
    console.log(`  Odds inserted:        ${s.oddsInserted}`);
    if (s.errors > 0) {
      console.log(`  Errors:               ${s.errors}`);
    }
    console.log('');
  });

  const totalOdds = stats.reduce((sum, s) => sum + s.oddsInserted, 0);
  const totalNewEvents = stats.reduce((sum, s) => sum + s.eventsWithOdds, 0);

  console.log('Overall:');
  console.log(`  Total new events:     ${totalNewEvents}`);
  console.log(`  Total odds inserted:  ${totalOdds}`);
  console.log(`  Duration:             ${duration}ms`);
  console.log('');

  if (totalOdds > 0) {
    console.log('✅ Test completed successfully!\n');
  } else {
    console.log('⚠️  No odds were inserted. Check API connectivity.\n');
  }
}

async function processLeague(leagueSlug: string, leagueName: string): Promise<EventStats> {
  const stats: EventStats = {
    league: leagueName,
    totalInApi: 0,
    newEvents: 0,
    eventsWithOdds: 0,
    oddsInserted: 0,
    errors: 0,
  };

  try {
    console.log(`\n📋 Processing: ${leagueName}`);
    console.log('-'.repeat(60));

    // 1. Fetch events from API
    console.log('  1️⃣  Fetching events from /v3/events...');
    const events = await oddsApiClient.getEvents({
      sport: FOOTBALL,
      league: leagueSlug,
      fromDate: new Date(),
      toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    if (!events || events.length === 0) {
      console.log('     ℹ️  No events found in API');
      return stats;
    }

    stats.totalInApi = events.length;
    console.log(`     ✅ Found ${events.length} events\n`);

    // 2. Check existing events in DB
    console.log('  2️⃣  Checking existing events in DB...');
    const { data: existingEventIds } = await supabaseAdmin
      .from('events_to_track')
      .select('event_id')
      .eq('sport_slug', FOOTBALL)
      .eq('league_slug', leagueSlug);

    const existingIds = new Set(existingEventIds?.map(e => e.event_id) || []);
    const newEvents = events.filter(e => !existingIds.has(e.id));

    console.log(`     ✅ Found ${existingIds.size} existing events\n`);

    if (newEvents.length === 0) {
      console.log('     ℹ️  No new events to process');
      return stats;
    }

    console.log(`     ✅ ${newEvents.length} new events to process\n`);
    stats.newEvents = newEvents.length;

    // 3. Filter out cancelled events
    const activeEvents = newEvents.filter(e => e.status !== 'cancelled');
    if (activeEvents.length === 0) {
      console.log('     ⚠️  All new events are cancelled');
      return stats;
    }

    console.log(`     🏃 ${activeEvents.length} active events (${newEvents.length - activeEvents.length} cancelled)\n`);
    console.log('  3️⃣  Fetching odds and inserting data...');
    const nowISO = new Date().toISOString();

    for (const event of activeEvents) {
      try {
        // Get odds for this event
        let odds;
        try {
          odds = await oddsApiClient.getOdds(event.id);
        } catch (error) {
          console.log(`     ⚠️  Could not fetch odds for event ${event.id}`);
          stats.errors++;
          continue;
        }

        // Check if Pinnacle is available
        // Note: odds.bookmakers is an object keyed by bookmaker name
        // odds.bookmakers.Pinnacle is an ARRAY of markets: [ { name, updatedAt, odds } ]
        const pinnacleArray = odds.bookmakers?.['Pinnacle'] || odds.bookmakers?.Pinnacle;
        if (!pinnacleArray || !Array.isArray(pinnacleArray) || pinnacleArray.length === 0) {
          console.log(`     ⚠️  No Pinnacle odds for event ${event.id}`);
          stats.errors++;
          continue;
        }

        // Create/fetch teams
        let homeTeamId: string | null = null;
        let awayTeamId: string | null = null;

        if (event.home && event.away) {
          try {
            homeTeamId = await ensureTeam(event.home, FOOTBALL);
            awayTeamId = await ensureTeam(event.away, FOOTBALL);
          } catch (error) {
            console.log(`     ⚠️  Failed to create teams for event ${event.id}: ${error instanceof Error ? error.message : error}`);
            stats.errors++;
            continue;
          }
        }

        // Insert event
        const eventData = {
          event_id: event.id,
          sport_slug: FOOTBALL,
          league_slug: leagueSlug,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          event_date: event.date,
          status: event.status || 'pending',
          state: 'OPENING_CAPTURED_SLEEPING',
          next_scan_at: new Date(new Date(event.date).getTime() - 60 * 60 * 1000).toISOString(),
          created_at: nowISO,
          updated_at: nowISO,
        };

        const { error: insertEventError } = await supabaseAdmin
          .from('events_to_track')
          .insert([eventData]);

        if (insertEventError) {
          console.log(`     ⚠️  Failed to insert event ${event.id}: ${insertEventError.message}`);
          stats.errors++;
          continue;
        }

        stats.eventsWithOdds++;

        // Insert odds
        // pinnacleArray is: [ { name: "ML", updatedAt, odds: [ { home, draw, away } ] }, ... ]
        let oddsCount = 0;
        for (const market of pinnacleArray) {
          const marketName = normalizeMarketKey(market.name);  // e.g., "ML" → "h2h", "Spread" → "spreads"
          const updatedAt = market.updatedAt || nowISO;

          if (!market.odds || !Array.isArray(market.odds)) continue;

          for (const oddItem of market.odds) {
            // Each oddItem can have: home, away, draw (for ML), or home, away, hdp (for Spread), or over, under, hdp (for Totals)
            const hdp = oddItem.hdp !== undefined ? oddItem.hdp : null;

            // Insert one row per outcome (home, away, draw, over, under)
            // Map to normalized names to match outcomes_v2
            const outcomes = [];
            if (oddItem.home !== undefined) outcomes.push({ selection: '1', price: oddItem.home });
            if (oddItem.away !== undefined) outcomes.push({ selection: '2', price: oddItem.away });
            if (oddItem.draw !== undefined) outcomes.push({ selection: 'X', price: oddItem.draw });
            if (oddItem.over !== undefined) outcomes.push({ selection: 'OVER', price: oddItem.over });
            if (oddItem.under !== undefined) outcomes.push({ selection: 'UNDER', price: oddItem.under });

            for (const outcome of outcomes) {
              const price = parseFloat(outcome.price);

              // Check if odd already exists in DB
              let query = supabaseAdmin
                .from('opening_closing_observed')
                .select('id, opening_price_observed')
                .eq('event_id', event.id)
                .eq('bookmaker', 'Pinnacle')
                .eq('market_name', marketName)
                .eq('selection', outcome.selection);

              // Handle NULL line values properly in Supabase
              if (hdp === null) {
                query = query.is('line', null);
              } else {
                query = query.eq('line', hdp);
              }

              const { data: existingOdd, error: searchError } = await query.limit(1);

              if (searchError) {
                console.log(`     ⚠️  Error checking existing odd: ${searchError.message}`);
                continue;
              }

              if (existingOdd && existingOdd.length > 0) {
                // Odd exists: update with closing price
                const { error: updateError } = await supabaseAdmin
                  .from('opening_closing_observed')
                  .update({
                    closing_price_observed: price,
                    closing_time_observed: updatedAt,
                    updated_at: nowISO,
                  })
                  .eq('id', existingOdd[0].id);

                if (!updateError) {
                  oddsCount++;
                } else {
                  console.log(`     ⚠️  Error updating odd: ${updateError.message}`);
                }
              } else {
                // Odd doesn't exist: insert with opening price
                const oddData = {
                  event_id: event.id,
                  sport_slug: FOOTBALL,
                  league_slug: leagueSlug,
                  bookmaker: 'Pinnacle',
                  market_name: marketName,
                  selection: outcome.selection,
                  line: hdp,
                  opening_price_observed: price,
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
                  oddsCount++;
                } else if (!oddError.message.includes('duplicate key')) {
                  console.log(`     ⚠️  Error inserting odd: ${oddError.message}`);
                }
              }
            }
          }
        }

        stats.oddsInserted += oddsCount;
        console.log(`     ✅ Event ${event.id}: ${oddsCount} odds inserted`);

      } catch (error) {
        console.log(`     ❌ Error processing event: ${error instanceof Error ? error.message : error}`);
        stats.errors++;
      }
    }

    console.log('');

  } catch (error) {
    console.error(`❌ Error processing league ${leagueName}:`, error);
    stats.errors++;
  }

  return stats;
}

/**
 * Ensures a team exists in the database
 * Creates if not found, returns the team UUID
 */
async function ensureTeam(teamName: string, sportSlug: string): Promise<string> {
  const normalized = normalizeTeamName(teamName);
  const sportId = await getSportId(sportSlug);

  console.log(`       [DEBUG] Ensuring team: "${teamName}" (normalized: "${normalized}", sportId: ${sportId})`);

  // Try to find existing team - don't use .single() as it throws if not found
  const { data: existingTeams, error: searchError } = await supabaseAdmin
    .from('teams_v2')
    .select('id')
    .eq('sport_id', sportId)
    .eq('normalized_name', normalized)
    .limit(1);

  if (searchError) {
    console.log(`       [DEBUG] Search error: ${searchError.message}`);
  }

  if (existingTeams && existingTeams.length > 0) {
    console.log(`       [DEBUG] Found existing team with ID: ${existingTeams[0].id}`);
    return existingTeams[0].id;
  }

  console.log(`       [DEBUG] Team not found, creating new one...`);

  // Create new team
  const { data: newTeam, error } = await supabaseAdmin
    .from('teams_v2')
    .insert([{
      sport_id: sportId,
      oddsapi_name: teamName,
      normalized_name: normalized,
      display_name: teamName,
      created_at: new Date().toISOString(),
    }])
    .select('id')
    .single();

  if (error) {
    console.log(`       [DEBUG] Insert error: ${error.message}`);
    throw new Error(`Failed to create team ${teamName}: ${error.message}`);
  }

  console.log(`       [DEBUG] Created new team with ID: ${newTeam.id}`);
  return newTeam.id;
}

/**
 * Gets the sport ID for a given slug
 */
async function getSportId(sportSlug: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('sports_v2')
    .select('id')
    .eq('slug', sportSlug)
    .single();

  if (error || !data) {
    throw new Error(`Sport ${sportSlug} not found`);
  }

  return data.id;
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
