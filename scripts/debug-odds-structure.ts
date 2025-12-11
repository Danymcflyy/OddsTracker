/**
 * Debug script to inspect the actual structure of odds response from API
 */

import './load-env';
import { oddsApiClient } from '@/lib/api/oddsapi/client';

async function main() {
  try {
    console.log('\n🔍 Debugging Odds-API.io Response Structure\n');

    // Fetch a single event first
    console.log('1️⃣  Fetching events...');
    const events = await oddsApiClient.getEvents({
      sport: 'football',
      league: 'england-premier-league',
      fromDate: new Date(),
      toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    if (!events || events.length === 0) {
      console.log('❌ No events found');
      return;
    }

    console.log(`✅ Found ${events.length} events\n`);

    // Find first event with available odds (not cancelled)
    console.log('📌 Looking for first event with available odds...\n');
    let selectedEvent = null;
    for (let i = 0; i < Math.min(10, events.length); i++) {
      const event = events[i];
      console.log(`  Event ${i + 1}: ${event.id} - ${event.home} vs ${event.away} (status: ${event.status})`);
      if (!selectedEvent && event.status !== 'cancelled') {
        selectedEvent = event;
        console.log(`    ✅ Selected this one (status: ${event.status})`);
      }
    }

    if (!selectedEvent) {
      console.log('\n❌ No non-cancelled events found in first 10!');
      return;
    }

    console.log(`\n✅ Using event: ${selectedEvent.id} - ${selectedEvent.home} vs ${selectedEvent.away}`);
    console.log(`Event date: ${selectedEvent.date}`);
    console.log(`Event status: ${selectedEvent.status}\n`);

    // Now fetch odds for this event
    console.log(`2️⃣  Fetching odds for event ${selectedEvent.id}...\n`);

    try {
      const odds = await oddsApiClient.getOdds(selectedEvent.id);

      console.log('✅ Odds response received\n');
      console.log('Structure of response:');
      console.log(JSON.stringify(odds, null, 2));

      console.log('\n\n3️⃣  Analyzing bookmakers:');

      if (odds.bookmakers) {
        console.log(`bookmakers type: ${typeof odds.bookmakers}`);
        console.log(`Is array: ${Array.isArray(odds.bookmakers)}`);

        if (typeof odds.bookmakers === 'object' && !Array.isArray(odds.bookmakers)) {
          const bookmakerKeys = Object.keys(odds.bookmakers);
          console.log(`Bookmaker keys: ${bookmakerKeys.join(', ')}\n`);

          for (const key of bookmakerKeys) {
            const bm = odds.bookmakers[key];
            console.log(`${key}:`);
            console.log(`  - Markets: ${bm.markets ? bm.markets.length : 0}`);
            if (bm.markets && bm.markets.length > 0) {
              console.log(`  - First market: ${bm.markets[0].key}`);
              console.log(`  - Outcomes: ${bm.markets[0].outcomes?.length || 0}`);
            }
          }

          // Check for Pinnacle specifically
          const pinnacle =
            odds.bookmakers['Pinnacle'] ||
            odds.bookmakers['pinnacle'] ||
            Object.keys(odds.bookmakers).find(k => k.toLowerCase() === 'pinnacle');

          console.log(`\n✅ Pinnacle key found: ${pinnacle}`);

          if (pinnacle) {
            const pinnacleData = odds.bookmakers[pinnacle];
            console.log(`Pinnacle markets: ${pinnacleData.markets?.length || 0}`);
            if (pinnacleData.markets && pinnacleData.markets.length > 0) {
              console.log(`Markets: ${pinnacleData.markets.map(m => m.key).join(', ')}`);
            }
          }
        }
      } else {
        console.log('❌ No bookmakers in response');
      }
    } catch (error) {
      console.error('❌ Error fetching odds:');
      console.error(error instanceof Error ? error.message : error);

      if (error instanceof Error) {
        console.error('\nFull error:');
        console.error(error);
      }
    }
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
