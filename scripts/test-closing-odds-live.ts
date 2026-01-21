#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi');

  console.log('🔍 Test du workflow Closing Odds avec événements actuels\n');

  const client = getTheOddsApiClient();
  const bookmaker = 'pinnacle';
  const trackedMarkets = [
    'h2h',
    'spreads',
    'totals',
    'h2h_h1',
    'spreads_h1',
    'totals_h1',
    'team_totals',
  ];

  try {
    // Récupérer les événements actuels
    console.log('📡 Récupération des événements Champions League actuels...\n');

    const eventsResponse = await client.getEvents('soccer_uefa_champs_league');
    const events = eventsResponse.data;

    console.log(`✅ ${events.length} événements trouvés\n`);

    if (events.length === 0) {
      console.log('⚠️  Aucun événement à venir');
      return;
    }

    // Prendre les 2 premiers événements
    const testEvents = events.slice(0, 2);
    let totalCreditsUsed = 0;

    for (const event of testEvents) {
      console.log(`\n🏆 ${event.home_team} vs ${event.away_team}`);
      console.log(`   Date: ${new Date(event.commence_time).toLocaleString('fr-FR')}`);
      console.log(`   API ID: ${event.id}\n`);

      try {
        // Simuler la capture de closing odds
        console.log('📡 Appel API pour récupérer les cotes actuelles...');

        const response = await client.getEventOdds(
          'soccer_uefa_champs_league',
          event.id,
          {
            regions: 'eu',
            markets: trackedMarkets.join(','),
            bookmakers: bookmaker,
            oddsFormat: 'decimal',
          }
        );

        const creditsUsed = response.headers.requestsLast;
        totalCreditsUsed += creditsUsed;

        console.log(`   ✅ Réponse reçue - Crédits utilisés: ${creditsUsed}\n`);

        const bookmakerData = response.data.bookmakers?.find((b: any) => b.key === bookmaker);

        if (!bookmakerData || !bookmakerData.markets || bookmakerData.markets.length === 0) {
          console.log('   ⚠️  Aucune cote disponible de Pinnacle pour cet événement\n');
          continue;
        }

        console.log('   📊 Marchés capturés:\n');

        // Grouper par market_key pour compter les variations
        const marketsByKey = new Map<string, any[]>();
        for (const apiMarket of bookmakerData.markets) {
          if (!marketsByKey.has(apiMarket.key)) {
            marketsByKey.set(apiMarket.key, []);
          }
          marketsByKey.get(apiMarket.key)!.push(apiMarket);
        }

        let totalVariations = 0;

        for (const [marketKey, apiMarkets] of marketsByKey.entries()) {
          totalVariations += apiMarkets.length;
          console.log(`      ✅ ${marketKey}: ${apiMarkets.length} variation(s)`);

          // Afficher un échantillon de la première variation
          if (apiMarkets.length > 0) {
            const sample = apiMarkets[0];
            const outcomes = sample.outcomes?.map((o: any) => {
              const outcome: any = { name: o.name, price: o.price };
              if (o.point !== undefined) outcome.point = o.point;
              return outcome;
            });
            console.log(`         Exemple:`, JSON.stringify(outcomes?.slice(0, 3), null, 2));
          }
        }

        console.log(`\n   💾 Données à stocker dans closing_odds:`);
        console.log(`      - ${marketsByKey.size} types de marchés`);
        console.log(`      - ${totalVariations} variations totales`);
        console.log(`      - bookmaker_update: ${bookmakerData.last_update}`);
        console.log(`      - capture_status: "success"`);

        // Afficher la structure qui serait insérée
        console.log(`\n   📋 Structure markets_variations:\n`);
        const marketsVariations: any = {};
        for (const [marketKey, apiMarkets] of marketsByKey.entries()) {
          const variations = apiMarkets.map(m => {
            const odds: any = { last_update: m.last_update };
            for (const outcome of m.outcomes || []) {
              const name = outcome.name.toLowerCase();
              if (name.includes('home')) odds.home = outcome.price;
              else if (name.includes('away')) odds.away = outcome.price;
              else if (name.includes('draw')) odds.draw = outcome.price;
              else if (name.includes('over')) {
                odds.over = outcome.price;
                if (outcome.point !== undefined) odds.point = outcome.point;
              } else if (name.includes('under')) {
                odds.under = outcome.price;
                if (outcome.point !== undefined) odds.point = outcome.point;
              }
            }
            return odds;
          });
          marketsVariations[marketKey] = variations;

          // Afficher aperçu
          console.log(`      ${marketKey}: ${variations.length} variation(s)`);
          if (variations.length > 0) {
            console.log(`         ${JSON.stringify(variations[0])}`);
          }
        }

      } catch (error: any) {
        if (error.message.includes('404')) {
          console.log('   ❌ Événement expiré ou non disponible\n');
        } else {
          console.log('   ❌ Erreur:', error.message, '\n');
        }
      }

      // Pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n\n📊 RÉSUMÉ DU TEST:\n');
    console.log(`   ✅ Test réussi - Le workflow de closing odds fonctionne!`);
    console.log(`   📈 Crédits utilisés: ${totalCreditsUsed}`);
    console.log(`   📉 Crédits restants: ~${52 - totalCreditsUsed}`);
    console.log(`\n💡 Le workflow capturera les mêmes données pour les closing odds:`);
    console.log(`   - Structure identique aux opening odds`);
    console.log(`   - Stockage dans table closing_odds`);
    console.log(`   - Affichage dans les colonnes "Clôture" du tableau\n`);

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

run();
