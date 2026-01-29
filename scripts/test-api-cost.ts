
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getTheOddsApiClient } from '@/lib/api/theoddsapi/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const client = getTheOddsApiClient();

  console.log('🔍 Test de coût réel pour /events/{id}/odds');

  // 1. Trouver un match actif
  const now = new Date();
  const dateStr = now.toISOString().split('.')[0] + 'Z';
  
  const events = await client.getEvents('soccer_uefa_champs_league', {
    commenceTimeFrom: dateStr
  });

  if (!events.data || events.data.length === 0) {
    console.log('❌ Aucun match trouvé pour le test.');
    return;
  }

  const event = events.data[0];
  console.log(`Match: ${event.home_team} vs ${event.away_team} (${event.id})`);

  // 2. Appel avec 1 marché STANDARD (h2h)
  console.log('\n--- Test 1: Marché Standard (h2h) ---');
  const res1 = await client.getEventOdds(event.sport_key, event.id, {
    regions: 'eu',
    markets: 'h2h',
    bookmakers: 'pinnacle',
    oddsFormat: 'decimal'
  });
  console.log(`Coût H2H: ${res1.headers.requestsLast} crédits`);

  // 3. Appel avec 1 marché ALTERNATIF (alternate_spreads)
  console.log('\n--- Test 2: Marché Alternatif (alternate_spreads) ---');
  try {
    const res2 = await client.getEventOdds(event.sport_key, event.id, {
      regions: 'eu',
      markets: 'alternate_spreads', // Normalement plus cher ?
      bookmakers: 'pinnacle',
      oddsFormat: 'decimal'
    });
    console.log(`Coût Alternate: ${res2.headers.requestsLast} crédits`);
  } catch (e: any) {
    console.log('Erreur test 2:', e.message);
  }

  // 4. Appel Mixte (h2h + alternate_spreads)
  console.log('\n--- Test 3: Mixte (h2h + alternate_spreads) ---');
  try {
    const res3 = await client.getEventOdds(event.sport_key, event.id, {
      regions: 'eu',
      markets: 'h2h,alternate_spreads',
      bookmakers: 'pinnacle',
      oddsFormat: 'decimal'
    });
    console.log(`Coût Mixte: ${res3.headers.requestsLast} crédits`);
  } catch (e: any) {
    console.log('Erreur test 3:', e.message);
  }
}

run();
