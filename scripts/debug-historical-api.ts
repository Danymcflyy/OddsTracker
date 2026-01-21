#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi/client');

  console.log('🔍 DEBUG HISTORICAL API\n');

  const client = getTheOddsApiClient();

  // Test 1: Essayer avec l'événement Real Madrid vs Monaco
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 1: Real Madrid vs Monaco (21 jan 2026)');
  console.log('═══════════════════════════════════════════════════════\n');

  const test1 = {
    id: 'd1084b9f2949dcdc9e9564abf5f823c1',
    sport: 'soccer_uefa_champs_league',
    // Essayer différents timestamps autour du kick-off
    dates: [
      '2026-01-21T02:00:00Z', // 2h avant kick-off
      '2026-01-21T02:30:00Z', // 1h30 avant
      '2026-01-21T02:55:00Z', // 5 min avant (closing)
      '2026-01-21T03:00:00Z', // Kick-off exact
      '2026-01-21T03:30:00Z', // 30 min après
    ],
  };

  for (const date of test1.dates) {
    console.log(`\n📅 Test avec date: ${date}`);
    try {
      const result = await client.getHistoricalOdds(
        test1.sport,
        test1.id,
        {
          date,
          regions: 'eu',
          markets: 'h2h',
          bookmakers: 'pinnacle',
          oddsFormat: 'decimal',
          dateFormat: 'iso',
        }
      );

      const bookmakers = result.data?.data?.bookmakers || [];
      console.log(`   Bookmakers: ${bookmakers.length}`);

      if (bookmakers.length > 0) {
        console.log('   ✅ DONNÉES TROUVÉES !');
        bookmakers.forEach(b => {
          console.log(`   - ${b.key}: ${b.markets?.length || 0} marchés`);
          b.markets?.forEach(m => {
            console.log(`     ${m.key}:`, m.outcomes?.map(o => `${o.name}:${o.price}`).join(', '));
          });
        });
      } else {
        console.log('   ⚠️ Aucun bookmaker');
      }

      // Informations de timing
      if (result.data) {
        console.log(`   Timestamp: ${result.data.timestamp || 'N/A'}`);
        console.log(`   Previous: ${result.data.previous_timestamp || 'N/A'}`);
        console.log(`   Next: ${result.data.next_timestamp || 'N/A'}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // Pause 1s entre requêtes

    } catch (error: any) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST 2: Galatasaray vs Atlético Madrid (22 jan 2026)');
  console.log('═══════════════════════════════════════════════════════\n');

  const test2 = {
    id: '6716331a13feac7c001236adc0c6ecc6', // ID depuis les logs
    sport: 'soccer_uefa_champs_league',
    date: '2026-01-22T00:45:00Z', // 1h avant kick-off
  };

  console.log(`📅 Date: ${test2.date}`);
  try {
    const result = await client.getHistoricalOdds(
      test2.sport,
      test2.id,
      {
        date: test2.date,
        regions: 'eu',
        markets: 'h2h,spreads,totals',
        bookmakers: 'pinnacle',
        oddsFormat: 'decimal',
        dateFormat: 'iso',
      }
    );

    const bookmakers = result.data?.data?.bookmakers || [];
    console.log(`Bookmakers: ${bookmakers.length}`);

    if (bookmakers.length > 0) {
      console.log('✅ DONNÉES TROUVÉES !');
      bookmakers.forEach(b => {
        console.log(`\n📚 ${b.key}:`);
        b.markets?.forEach(m => {
          console.log(`   ${m.key}:`);
          m.outcomes?.forEach(o => {
            const point = o.point ? ` (${o.point})` : '';
            console.log(`     ${o.name}: ${o.price}${point}`);
          });
        });
      });
    } else {
      console.log('⚠️ Aucun bookmaker');
      console.log('\nRéponse complète:');
      console.log(JSON.stringify(result.data, null, 2));
    }

  } catch (error: any) {
    console.log(`❌ Erreur: ${error.message}`);
    if (error.response?.data) {
      console.log('Détails:', JSON.stringify(error.response.data, null, 2));
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST 3: Sans spécifier de bookmaker');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    const result = await client.getHistoricalOdds(
      test1.sport,
      test1.id,
      {
        date: '2026-01-21T02:55:00Z',
        regions: 'eu',
        markets: 'h2h',
        // Pas de bookmakers spécifié = tous les bookmakers
        oddsFormat: 'decimal',
        dateFormat: 'iso',
      }
    );

    const bookmakers = result.data?.data?.bookmakers || [];
    console.log(`Bookmakers trouvés: ${bookmakers.length}`);

    if (bookmakers.length > 0) {
      console.log('\n✅ Liste des bookmakers disponibles:');
      bookmakers.forEach(b => {
        console.log(`   - ${b.key}: ${b.markets?.length || 0} marchés`);
      });
    } else {
      console.log('⚠️ Aucun bookmaker trouvé, même sans filtre');
    }

  } catch (error: any) {
    console.log(`❌ Erreur: ${error.message}`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('TEST 4: Vérifier si l\'événement existe dans l\'API');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Lister les événements disponibles
    console.log('Récupération des événements en cours...');
    const events = await client.getOdds(test1.sport, {
      regions: 'eu',
      markets: 'h2h',
      bookmakers: 'pinnacle',
      oddsFormat: 'decimal',
      dateFormat: 'iso',
    });

    console.log(`\n${events.length} événements trouvés\n`);

    // Chercher notre événement
    const found = events.find(e => e.id === test1.id);
    if (found) {
      console.log('✅ Événement trouvé dans l\'API actuelle:');
      console.log(`   ${found.home_team} vs ${found.away_team}`);
      console.log(`   Kick-off: ${found.commence_time}`);
      console.log(`   Bookmakers: ${found.bookmakers?.length || 0}`);
    } else {
      console.log('⚠️ Événement NOT FOUND dans l\'API actuelle');
      console.log('\nListe des événements disponibles:');
      events.slice(0, 5).forEach(e => {
        console.log(`   - ${e.id}: ${e.home_team} vs ${e.away_team}`);
      });
    }

  } catch (error: any) {
    console.log(`❌ Erreur: ${error.message}`);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`📊 Total requêtes effectuées: ${client.getRequestCount()}`);
  console.log('═══════════════════════════════════════════════════════');
}

run();
