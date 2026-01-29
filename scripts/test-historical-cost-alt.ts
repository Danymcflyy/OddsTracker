
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getTheOddsApiClient } from '@/lib/api/theoddsapi/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const client = getTheOddsApiClient();
  const eventId = 'e90e22b348a38af568f940b4b5d92ca6';
  const sportKey = 'soccer_epl';
  const date = '2026-01-26T19:55:00Z'; 

  console.log('\n--- Test B: Historical Alternate (alternate_spreads) ---');
  try {
    const res2 = await client.getHistoricalOdds(sportKey, eventId, {
      date,
      regions: 'eu',
      markets: 'alternate_spreads',
      bookmakers: 'pinnacle',
      oddsFormat: 'decimal'
    });
    console.log(`💰 Coût Alternate: ${res2.headers.requestsLast} crédits`);
  } catch (e: any) {
    console.log('Erreur:', e.message);
  }
}

run();
