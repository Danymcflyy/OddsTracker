#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔍 Test du workflow Closing Odds\n');
  console.log('⚠️  NOTE: Les matchs ne sont pas encore terminés, mais on va');
  console.log('   tester la capture des cotes actuelles pour vérifier le workflow\n');

  // Récupérer 2 événements de test
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('commence_time', { ascending: true })
    .limit(2);

  if (error || !events || events.length === 0) {
    console.log('❌ Aucun événement trouvé');
    return;
  }

  console.log(`✅ ${events.length} événements sélectionnés pour le test\n`);

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

  let totalCreditsUsed = 0;

  for (const event of events) {
    console.log(`\n🏆 ${event.home_team} vs ${event.away_team}`);
    console.log(`   Date: ${new Date(event.commence_time).toLocaleString('fr-FR')}`);
    console.log(`   API ID: ${event.api_event_id}\n`);

    try {
      // Simuler la capture de closing odds
      console.log('📡 Appel API pour récupérer les cotes actuelles...');

      const response = await client.getEventOdds(
        event.sport_key,
        event.api_event_id,
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

      // Grouper par market_key
      const marketsByKey = new Map<string, any[]>();
      for (const apiMarket of bookmakerData.markets) {
        if (!marketsByKey.has(apiMarket.key)) {
          marketsByKey.set(apiMarket.key, []);
        }
        marketsByKey.get(apiMarket.key)!.push(apiMarket);
      }

      for (const [marketKey, apiMarkets] of marketsByKey.entries()) {
        console.log(`      ✅ ${marketKey}: ${apiMarkets.length} variation(s)`);

        // Afficher un échantillon
        if (apiMarkets.length > 0) {
          const sample = apiMarkets[0];
          const outcomes = sample.outcomes?.map((o: any) => ({
            name: o.name,
            price: o.price,
            point: o.point,
          }));
          console.log(`         Exemple:`, JSON.stringify(outcomes, null, 2));
        }
      }

      console.log(`\n   💡 Ces données seraient stockées dans la table closing_odds avec:`);
      console.log(`      - event_id: ${event.id}`);
      console.log(`      - ${Object.keys(marketsByKey).length} marchés différents`);
      console.log(`      - ${bookmakerData.markets.length} variations totales`);
      console.log(`      - bookmaker_update: ${bookmakerData.last_update}`);
      console.log(`      - capture_status: "success"\n`);

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
  console.log(`   Crédits utilisés: ${totalCreditsUsed}`);
  console.log(`   Crédits restants: ${52 - totalCreditsUsed} (estimation)\n`);

  console.log('💡 Pour capturer les VRAIES closing odds:');
  console.log('   1. Attendre que les matchs se terminent');
  console.log('   2. Lancer: npx tsx scripts/run-closing-odds.ts');
  console.log('   3. Ou utiliser le workflow GitHub Actions automatique\n');
}

run();
