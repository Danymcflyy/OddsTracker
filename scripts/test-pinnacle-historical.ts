#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi/client');

  console.log('🔍 TEST: Pinnacle dans Historical API\n');

  const client = getTheOddsApiClient();

  // Test 1: Récupérer des événements actuels pour voir quels bookmakers ont Pinnacle
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 1: Bookmakers disponibles dans l\'API actuelle');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    const events = await client.getOdds('soccer_uefa_champs_league', {
      regions: 'eu',
      markets: 'h2h',
      oddsFormat: 'decimal',
      dateFormat: 'iso',
    });

    console.log(`📊 ${events.length} événements trouvés\n`);

    // Chercher un événement qui a Pinnacle
    const eventWithPinnacle = events.find(e =>
      e.bookmakers?.some(b => b.key === 'pinnacle')
    );

    if (eventWithPinnacle) {
      console.log('✅ Événement avec Pinnacle trouvé:');
      console.log(`   ${eventWithPinnacle.home_team} vs ${eventWithPinnacle.away_team}`);
      console.log(`   ID: ${eventWithPinnacle.id}`);
      console.log(`   Kick-off: ${eventWithPinnacle.commence_time}`);

      const pinnacle = eventWithPinnacle.bookmakers?.find(b => b.key === 'pinnacle');
      if (pinnacle) {
        console.log(`   Marchés Pinnacle: ${pinnacle.markets?.length || 0}`);
        console.log(`   Last update: ${pinnacle.last_update}`);
      }

      // Test 2: Essayer Historical API avec cet événement
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('TEST 2: Historical API avec événement ayant Pinnacle');
      console.log('═══════════════════════════════════════════════════════\n');

      // Utiliser un timestamp récent (1 heure avant maintenant)
      const testDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      console.log(`📅 Test timestamp: ${testDate}`);
      console.log(`🔑 Event ID: ${eventWithPinnacle.id}\n`);

      try {
        const historicalResult = await client.getHistoricalOdds(
          'soccer_uefa_champs_league',
          eventWithPinnacle.id,
          {
            date: testDate,
            regions: 'eu',
            markets: 'h2h',
            bookmakers: 'pinnacle',
            oddsFormat: 'decimal',
            dateFormat: 'iso',
          }
        );

        const bookmakers = historicalResult.data?.data?.bookmakers || [];
        console.log(`✅ Historical API response`);
        console.log(`   Timestamp: ${historicalResult.data?.timestamp}`);
        console.log(`   Bookmakers: ${bookmakers.length}\n`);

        if (bookmakers.length > 0) {
          console.log('✅ PINNACLE TROUVÉ DANS HISTORICAL API !');
          bookmakers.forEach(b => {
            console.log(`\n📚 ${b.key}:`);
            b.markets?.forEach(m => {
              console.log(`   ${m.key}:`, m.outcomes?.map(o => `${o.name}:${o.price}`).join(', '));
            });
          });
        } else {
          console.log('⚠️ Pinnacle non trouvé dans Historical API pour ce timestamp');
          console.log('   Possible que Pinnacle n\'ait pas de données à ce moment précis');
        }

      } catch (error: any) {
        console.log('❌ Erreur Historical API:', error.message);
      }

    } else {
      console.log('⚠️ Aucun événement actuel avec Pinnacle trouvé');
      console.log('\n📚 Bookmakers disponibles:');

      const allBookmakers = new Set<string>();
      events.forEach(e => {
        e.bookmakers?.forEach(b => allBookmakers.add(b.key));
      });

      Array.from(allBookmakers).sort().forEach(b => console.log(`   - ${b}`));
    }

    // Test 3: Sans filtre pour voir tous les bookmakers disponibles dans Historical
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('TEST 3: Historical API SANS filtre bookmaker');
    console.log('═══════════════════════════════════════════════════════\n');

    if (events.length > 0) {
      const testEvent = events[0];
      const testDate = new Date(Date.now() - 30 * 60 * 1000).toISOString();

      console.log(`📅 Event: ${testEvent.home_team} vs ${testEvent.away_team}`);
      console.log(`⏰ Test timestamp: ${testDate}\n`);

      try {
        const historicalResult = await client.getHistoricalOdds(
          'soccer_uefa_champs_league',
          testEvent.id,
          {
            date: testDate,
            regions: 'eu',
            markets: 'h2h',
            // PAS de filtre bookmaker
            oddsFormat: 'decimal',
            dateFormat: 'iso',
          }
        );

        const bookmakers = historicalResult.data?.data?.bookmakers || [];
        console.log(`✅ Historical API response (sans filtre)`);
        console.log(`   Timestamp: ${historicalResult.data?.timestamp}`);
        console.log(`   Bookmakers trouvés: ${bookmakers.length}\n`);

        if (bookmakers.length > 0) {
          console.log('📚 Liste des bookmakers dans Historical:');
          bookmakers.forEach(b => console.log(`   - ${b.key}`));

          const hasPinnacle = bookmakers.some(b => b.key === 'pinnacle');
          if (hasPinnacle) {
            console.log('\n✅ PINNACLE EST DISPONIBLE DANS HISTORICAL API !');
          } else {
            console.log('\n⚠️ Pinnacle absent de la réponse Historical');
          }
        } else {
          console.log('⚠️ Aucun bookmaker dans Historical à ce timestamp');
        }

      } catch (error: any) {
        console.log('❌ Erreur:', error.message);
      }
    }

  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des événements:', error.message);
  }

  console.log(`\n\n📊 Total crédits utilisés: ${client.getRequestCount()} requêtes`);
}

run();
