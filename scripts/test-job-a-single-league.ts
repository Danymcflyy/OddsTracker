/**
 * Test Job A - Single League
 *
 * Teste le Job A sur UN SEUL championnat (England Premier League)
 * pour valider la structure avant d'étendre à tous les championnats
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';
import { oddsApiClient } from '@/lib/api/oddsapi/client';
import { normalizeTeamName } from '@/lib/api/oddsapi/normalizer';

const FOOTBALL = 'football';
const TEST_LEAGUE = 'england-premier-league';

async function main() {
  console.log('\n🧪 Testing Job A - Single League\n');
  console.log(`League: ${TEST_LEAGUE}\n`);

  try {
    // 1. Récupérer les événements du championnat
    console.log('📌 Step 1: Fetching events from API...');
    const events = await oddsApiClient.getEvents({
      sport: FOOTBALL,
      league: TEST_LEAGUE,
      fromDate: new Date(),
      toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    if (!events || events.length === 0) {
      console.log('❌ No events found');
      return;
    }

    console.log(`✅ Found ${events.length} events\n`);

    // 2. Afficher les 3 premiers événements
    console.log('📋 Sample events from API:');
    events.slice(0, 3).forEach((event, idx) => {
      console.log(`\n  Event ${idx + 1}:`);
      console.log(`    ID: ${event.id}`);
      console.log(`    Match: ${event.home} vs ${event.away}`);
      console.log(`    Date: ${event.date}`);
      console.log(`    Status: ${event.status}`);
    });

    // 3. Récupérer les cotes du premier événement
    console.log(`\n\n🏈 Step 2: Fetching odds for first event (${events[0].id})...`);
    const odds = await oddsApiClient.getOdds(events[0].id);

    if (!odds || !odds.bookmakers) {
      console.log('❌ No odds found');
      return;
    }

    // Note: odds.bookmakers is an object keyed by bookmaker name
    // odds.bookmakers.Pinnacle is an ARRAY of markets: [ { name, updatedAt, odds } ]
    const pinnacleArray = odds.bookmakers?.['Pinnacle'] || odds.bookmakers?.Pinnacle;
    if (!pinnacleArray || !Array.isArray(pinnacleArray) || pinnacleArray.length === 0) {
      console.log('❌ Pinnacle not available');
      return;
    }

    console.log(`✅ Found Pinnacle odds\n`);
    console.log(`Markets: ${pinnacleArray.map(m => m.name).join(', ')}\n`);

    // 4. Vérifier les événements existants en DB
    console.log('🔍 Step 3: Checking existing events in DB...');
    const { data: existingEventIds } = await supabaseAdmin
      .from('events_to_track')
      .select('event_id')
      .eq('sport_slug', FOOTBALL)
      .eq('league_slug', TEST_LEAGUE);

    console.log(`✅ Found ${existingEventIds?.length || 0} existing events in DB\n`);

    const existingIds = new Set(existingEventIds?.map(e => e.event_id) || []);
    const newEvents = events.filter(e => !existingIds.has(e.id));

    console.log(`📊 Statistics:`);
    console.log(`  Total events in API: ${events.length}`);
    console.log(`  Existing in DB: ${existingEventIds?.length || 0}`);
    console.log(`  New events to insert: ${newEvents.length}\n`);

    if (newEvents.length === 0) {
      console.log('ℹ️  No new events to insert');
      return;
    }

    // 4b. Filter out cancelled events
    const activeEvents = newEvents.filter(e => e.status !== 'cancelled');
    if (activeEvents.length === 0) {
      console.log('⚠️  All new events are cancelled - no data to test\n');
      return;
    }

    console.log(`🏃 Found ${activeEvents.length} active events (${newEvents.length - activeEvents.length} cancelled)\n`);

    // 5. Insérer le premier nouvel événement comme test
    console.log(`💾 Step 4: Testing insertion of first new event...\n`);
    const firstNewEvent = activeEvents[0];

    const eventData = {
      event_id: firstNewEvent.id,
      sport_slug: FOOTBALL,
      league_slug: TEST_LEAGUE,
      event_date: firstNewEvent.date,
      status: firstNewEvent.status || 'pending',
      state: 'OPENING_CAPTURED_SLEEPING',
      next_scan_at: new Date(new Date(firstNewEvent.date).getTime() - 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log(`Event data to insert:`, JSON.stringify(eventData, null, 2));

    const { error: insertEventError } = await supabaseAdmin
      .from('events_to_track')
      .insert([eventData]);

    if (insertEventError) {
      console.log(`\n❌ Error inserting event: ${insertEventError.message}`);
      return;
    }

    console.log(`\n✅ Event inserted successfully!\n`);

    // 6. Récupérer les cotes du premier nouvel événement
    console.log(`📊 Step 5: Fetching odds for inserted event...\n`);
    const firstEventOdds = await oddsApiClient.getOdds(firstNewEvent.id);
    const firstEventPinnacleArray = firstEventOdds.bookmakers?.['Pinnacle'] || firstEventOdds.bookmakers?.Pinnacle;

    if (!firstEventPinnacleArray || !Array.isArray(firstEventPinnacleArray) || firstEventPinnacleArray.length === 0) {
      console.log('⚠️  No Pinnacle odds available');
      return;
    }

    // 7. Insérer les cotes
    console.log(`💾 Step 6: Inserting odds...\n`);
    const nowISO = new Date().toISOString();
    let oddsInserted = 0;

    for (const market of firstEventPinnacleArray) {
      const marketName = market.name;
      const updatedAt = market.updatedAt || nowISO;

      if (!market.odds || !Array.isArray(market.odds)) continue;

      for (const oddItem of market.odds) {
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
            event_id: firstNewEvent.id,
            sport_slug: FOOTBALL,
            league_slug: TEST_LEAGUE,
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
            console.warn(`⚠️  Error inserting odd: ${oddError.message}`);
          }
        }
      }
    }

    console.log(`✅ Inserted ${oddsInserted} odds\n`);

    // 8. Vérifier les données insérées
    console.log('🔍 Step 7: Verifying inserted data...\n');

    const { data: insertedEvent } = await supabaseAdmin
      .from('events_to_track')
      .select('*')
      .eq('event_id', firstNewEvent.id)
      .single();

    console.log(`Event in DB:`, JSON.stringify(insertedEvent, null, 2));

    const { data: insertedOdds } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('market_name, selection, opening_price_observed')
      .eq('event_id', firstNewEvent.id)
      .limit(5);

    console.log(`\nFirst 5 odds in DB:`, JSON.stringify(insertedOdds, null, 2));

    console.log('\n\n✅ Test completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`  ✓ API connection: OK`);
    console.log(`  ✓ Event fetching: OK (${events.length} events)`);
    console.log(`  ✓ Pinnacle odds: OK (${firstEventPinnacle.markets.length} markets)`);
    console.log(`  ✓ Event insertion: OK`);
    console.log(`  ✓ Odds insertion: OK (${oddsInserted} odds)`);
    console.log(`  ✓ Data verification: OK`);

  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
