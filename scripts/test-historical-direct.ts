#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi/client');

  console.log('🎯 TEST HISTORICAL API - Direct\n');

  const client = getTheOddsApiClient();

  // Test avec Real Madrid vs Monaco (21 janvier 2026)
  const testEvent = {
    id: 'd1084b9f2949dcdc9e9564abf5f823c1', // ID depuis les logs précédents
    homeTeam: 'Real Madrid',
    awayTeam: 'AS Monaco',
    date: '2026-01-21T03:00:00Z', // Date du match
    sportKey: 'soccer_uefa_champs_league',
  };

  console.log(`🏆 Test avec: ${testEvent.homeTeam} vs ${testEvent.awayTeam}`);
  console.log(`📅 Date: ${testEvent.date}`);
  console.log(`🔑 Event ID: ${testEvent.id}`);
  console.log(`⚽ Sport: ${testEvent.sportKey}\n`);

  try {
    console.log('🔍 Appel Historical API...\n');

    const result = await client.getHistoricalOdds(
      testEvent.sportKey,
      testEvent.id,
      {
        date: testEvent.date,
        regions: 'eu',
        markets: 'h2h,spreads,totals',
        bookmakers: 'pinnacle',
        oddsFormat: 'decimal',
        dateFormat: 'iso',
      }
    );

    console.log('✅ Réponse reçue !\n');
    console.log('📊 Structure de la réponse:');
    console.log(JSON.stringify(result, null, 2));

    if (result.bookmakers && result.bookmakers.length > 0) {
      console.log(`\n✅ ${result.bookmakers.length} bookmaker(s) trouvé(s)`);

      result.bookmakers.forEach(bookmaker => {
        console.log(`\n📚 ${bookmaker.key}:`);
        bookmaker.markets?.forEach(market => {
          console.log(`\n   ${market.key}:`);
          market.outcomes?.forEach(outcome => {
            const point = outcome.point ? ` (${outcome.point})` : '';
            console.log(`     ${outcome.name}: ${outcome.price}${point}`);
          });
        });
      });
    } else {
      console.log('\n⚠️ Aucune donnée de bookmaker');
    }

    console.log(`\n📊 Requêtes effectuées: ${client.getRequestCount()}`);

  } catch (error: any) {
    console.error('\n❌ Erreur:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

run();
