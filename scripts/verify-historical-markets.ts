import * as dotenv from 'dotenv';
import * as path from 'path';
import { getTheOddsApiClient } from '@/lib/api/theoddsapi/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const client = getTheOddsApiClient();

  // Event: Everton vs Leeds United
  // Time: 2026-01-26T20:00:00+00:00
  const eventId = 'e90e22b348a38af568f940b4b5d92ca6';
  const sportKey = 'soccer_epl';
  const commenceTimeStr = '2026-01-26T20:00:00Z'; // Assuming UTC from previous output
  
  const marketsFromEmail = [
    'draw_no_bet',
    'btts',
    'alternate_totals',
    'alternate_spreads',
    'h2h_h1',
    'spreads_h1',
    'totals_h1'
  ];
  
  const standardMarkets = ['h2h', 'spreads', 'totals'];
  
  const allMarkets = [...standardMarkets, ...marketsFromEmail];
  
  console.log('🔍 Testing Historical API with comprehensive markets');
  console.log(`Event: ${eventId} (${sportKey})`);
  console.log(`Kick-off: ${commenceTimeStr}`);
  console.log(`Markets: ${allMarkets.join(',')}`);
  
  // Test timestamps: -5 min, -1 hour, -1 day (if applicable)
  // Since match was yesterday (Jan 26) and today is Jan 27, we can try.
  
  const commenceTime = new Date(commenceTimeStr);
  const timestamps = [
    { label: '5 min before', time: new Date(commenceTime.getTime() - 5 * 60000) },
    { label: '1 hour before', time: new Date(commenceTime.getTime() - 60 * 60000) },
  ];

  for (const { label, time } of timestamps) {
    console.log(`
Testing timestamp: ${time.toISOString()} (${label})`);
    
    try {
      const response = await client.getHistoricalOdds(sportKey, eventId, {
        date: time.toISOString(),
        regions: 'eu',
        markets: allMarkets.join(','),
        bookmakers: 'pinnacle', // Targeting Pinnacle as per email
        oddsFormat: 'decimal'
      });
      
      console.log(`✅ Success! Status: ${response.headers.requestsLast} credits used.`);
      const bookmakers = response.data.bookmakers || [];
      console.log(`Found ${bookmakers.length} bookmakers.`);
      
      if (bookmakers.length > 0) {
        bookmakers.forEach(b => {
          console.log(`   Bookmaker: ${b.key}`);
          console.log(`   Markets: ${b.markets.map(m => m.key).join(', ')}`);
        });
      } else {
        console.log('   ⚠️ Response valid but NO bookmakers/odds found.');
      }
      
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
      if (error.message.includes('INVALID_HISTORICAL_TIMESTAMP')) {
        console.log('   -> Confirmed: Timestamp is likely too recent for Historical API.');
      }
    }
  }
}

run();
