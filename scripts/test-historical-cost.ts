
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getTheOddsApiClient } from '@/lib/api/theoddsapi/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const client = getTheOddsApiClient();

  console.log('🔍 Test de coût réel pour Historical API (/historical/...)');

  // Match: Everton vs Leeds (celui qu'on a vu en DB)
  const eventId = 'e90e22b348a38af568f940b4b5d92ca6';
  const sportKey = 'soccer_epl';
  
  // Date dans le passé (hier)
  const date = '2026-01-26T19:55:00Z'; 

  // --- Test A: Marché Standard (h2h) ---
  console.log('\n--- Test A: Historical Standard (h2h) ---');
  try {
    const res1 = await client.getHistoricalOdds(sportKey, eventId, {
      date,
      regions: 'eu',
      markets: 'h2h',
      bookmakers: 'pinnacle',
      oddsFormat: 'decimal'
    });
    console.log(`💰 Coût H2H: ${res1.headers.requestsLast} crédits`);
  } catch (e: any) {
    // Si INVALID_TIMESTAMP (car trop récent), on prend note, mais on regarde si on peut tester autrement
    // ou on se fie à la doc si le test échoue
    console.log('Résultat:', e.message);
    if (e.message.includes('INVALID_HISTORICAL')) {
         console.log('⚠️ Impossible de tester sur ce match (trop récent). Je vais chercher un match plus vieux.');
    }
  }
}

run();
