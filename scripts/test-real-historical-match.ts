#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi/client');

  const client = getTheOddsApiClient();

  console.log('🔍 TEST HISTORICAL API - Match Réel d\'il y a ~10 jours\n');
  console.log('═══════════════════════════════════════════════════════\n');

  // ÉTAPE 1: Récupérer des event_ids de matchs à venir
  // (pour avoir des IDs réels de l'API, même si les matchs ne sont pas encore passés)

  console.log('ÉTAPE 1: Récupération d\'event_ids de matchs Champions League\n');

  try {
    const upcomingEvents = await client.getOdds('soccer_uefa_champs_league', {
      regions: 'eu',
      markets: 'h2h',
      bookmakers: 'pinnacle',
      oddsFormat: 'decimal',
      dateFormat: 'iso',
    });

    console.log(`✅ ${upcomingEvents.length} événements trouvés\n`);

    if (upcomingEvents.length === 0) {
      console.log('❌ Aucun événement disponible');
      return;
    }

    // Chercher un événement avec Pinnacle
    const eventWithPinnacle = upcomingEvents.find(e =>
      e.bookmakers?.some(b => b.key === 'pinnacle')
    );

    if (!eventWithPinnacle) {
      console.log('⚠️ Aucun événement avec Pinnacle dans l\'API actuelle');
      console.log('\n📊 Bookmakers disponibles:');
      const bookmakers = new Set<string>();
      upcomingEvents.forEach(e => {
        e.bookmakers?.forEach(b => bookmakers.add(b.key));
      });
      bookmakers.forEach(b => console.log(`   - ${b}`));
      return;
    }

    console.log('✅ Événement avec Pinnacle trouvé:');
    console.log(`   ${eventWithPinnacle.home_team} vs ${eventWithPinnacle.away_team}`);
    console.log(`   Event ID: ${eventWithPinnacle.id}`);
    console.log(`   Kick-off: ${eventWithPinnacle.commence_time}\n`);

    const pinnacle = eventWithPinnacle.bookmakers?.find(b => b.key === 'pinnacle');
    if (pinnacle) {
      console.log('📚 Cotes Pinnacle actuelles:');
      pinnacle.markets?.forEach(m => {
        console.log(`\n   ${m.key}:`);
        m.outcomes?.forEach(o => {
          const point = o.point ? ` (${o.point})` : '';
          console.log(`     ${o.name}: ${o.price}${point}`);
        });
      });
    }

    // ÉTAPE 2: Tenter Historical API avec ce match
    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('ÉTAPE 2: Test Historical API avec cet event_id');
    console.log('═══════════════════════════════════════════════════════\n');

    // Essayer différents timestamps dans le passé
    const timestamps = [
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),   // Il y a 7 jours
      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),  // Il y a 10 jours
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),  // Il y a 14 jours
    ];

    console.log('⚠️ Note: Cet événement est dans le futur, donc Historical API');
    console.log('   va probablement échouer avec INVALID_HISTORICAL_TIMESTAMP.\n');
    console.log('   MAIS cela nous permet de confirmer le format de la requête.\n');

    for (const timestamp of timestamps) {
      console.log(`\n📅 Test avec timestamp: ${timestamp.toISOString()}`);
      console.log(`   (Il y a ${Math.floor((Date.now() - timestamp.getTime()) / (24 * 60 * 60 * 1000))} jours)\n`);

      try {
        const historicalResult = await client.getHistoricalOdds(
          'soccer_uefa_champs_league',
          eventWithPinnacle.id,
          {
            date: timestamp.toISOString(),
            regions: 'eu',
            markets: 'h2h',
            bookmakers: 'pinnacle',
            oddsFormat: 'decimal',
            dateFormat: 'iso',
          }
        );

        const bookmakers = historicalResult.data?.data?.bookmakers || [];
        console.log('✅ Réponse Historical API:');
        console.log(`   Timestamp: ${historicalResult.data?.timestamp}`);
        console.log(`   Bookmakers Pinnacle: ${bookmakers.length}\n`);

        if (bookmakers.length > 0) {
          console.log('🎉 PINNACLE TROUVÉ DANS HISTORICAL API !');
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

          console.log('\n📊 RÉPONSE COMPLÈTE (JSON):');
          console.log(JSON.stringify(historicalResult.data, null, 2));
          break; // Succès, on arrête
        } else {
          console.log('⚠️ Pinnacle absent pour ce timestamp');
        }

      } catch (error: any) {
        console.log('❌ Erreur:', error.message);

        if (error.message.includes('INVALID_HISTORICAL_TIMESTAMP')) {
          console.log('   → Timestamp trop récent pour Historical API');
        } else if (error.message.includes('404') || error.message.includes('NOT_FOUND')) {
          console.log('   → Événement non trouvé (peut-être pas dans l\'historique)');
        }
      }

      // Pause entre requêtes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('ÉTAPE 3: Test sans filtre Pinnacle (tous bookmakers)');
    console.log('═══════════════════════════════════════════════════════\n');

    const oldTimestamp = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    console.log(`📅 Timestamp: ${oldTimestamp} (il y a 14 jours)\n`);

    try {
      const allBookmakersResult = await client.getHistoricalOdds(
        'soccer_uefa_champs_league',
        eventWithPinnacle.id,
        {
          date: oldTimestamp,
          regions: 'eu',
          markets: 'h2h',
          // PAS de filtre bookmaker
          oddsFormat: 'decimal',
          dateFormat: 'iso',
        }
      );

      const bookmakers = allBookmakersResult.data?.data?.bookmakers || [];
      console.log('✅ Réponse Historical API (tous bookmakers):');
      console.log(`   Timestamp: ${allBookmakersResult.data?.timestamp}`);
      console.log(`   Total bookmakers: ${bookmakers.length}\n`);

      if (bookmakers.length > 0) {
        console.log('📚 Bookmakers disponibles:');
        bookmakers.forEach(b => console.log(`   - ${b.key}`));

        const pinnacle = bookmakers.find(b => b.key === 'pinnacle');
        if (pinnacle) {
          console.log('\n🎉 PINNACLE PRÉSENT !');
          console.log('\n📊 RÉPONSE COMPLÈTE (JSON):');
          console.log(JSON.stringify(allBookmakersResult.data, null, 2));
        } else {
          console.log('\n⚠️ Pinnacle non disponible dans cette liste');
        }
      } else {
        console.log('⚠️ Aucun bookmaker disponible');
      }

    } catch (error: any) {
      console.log('❌ Erreur:', error.message);
    }

  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des événements:', error.message);
  }

  console.log(`\n\n📊 Crédits utilisés: ${client.getRequestCount()} requêtes`);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('CONCLUSION');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('❌ PROBLÈME: Impossible de tester Historical API correctement');
  console.log('\n   Raisons:');
  console.log('   1. On ne peut pas "lister" les événements passés via l\'API');
  console.log('   2. On doit connaître l\'event_id à l\'avance');
  console.log('   3. Historical API rejette les timestamps trop récents (< 7 jours)');
  console.log('   4. Les event_ids récupérables sont pour matchs futurs uniquement\n');

  console.log('💡 SOLUTION:');
  console.log('   Pour tester vraiment Historical API avec Pinnacle, il faudrait:');
  console.log('   1. Attendre 7+ jours après un match dont on a l\'event_id');
  console.log('   2. OU utiliser l\'event_id d\'un match réel passé connu\n');

  console.log('🎯 RECOMMANDATION:');
  console.log('   Faire confiance à la documentation officielle:');
  console.log('   ✅ Pinnacle EST disponible dans Historical API');
  console.log('   ✅ Utiliser le workflow Pré-Kick Off (plus fiable + moins cher)');
  console.log('   ✅ Garder Historical en fallback pour les ratés\n');
}

run();
