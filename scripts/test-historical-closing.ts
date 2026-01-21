#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi');
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔍 Test de l\'API Historical pour récupérer les closing odds\n');

  // Récupérer les infos du match depuis la DB
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('home_team', 'FC Kairat')
    .eq('away_team', 'Club Brugge')
    .single();

  if (!event) {
    console.log('❌ Match FC Kairat vs Club Brugge non trouvé en DB');
    return;
  }

  console.log(`🏆 ${event.home_team} vs ${event.away_team}`);
  console.log(`   Date de début: ${new Date(event.commence_time).toLocaleString('fr-FR')}`);
  console.log(`   API ID: ${event.api_event_id}`);
  console.log(`   Sport: ${event.sport_key}\n`);

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

  // Pour un match de foot, les closing odds sont généralement disponibles juste avant le coup d'envoi
  // On va essayer quelques minutes avant le début du match
  const matchTime = new Date(event.commence_time);

  // Essayer 5 minutes avant le début
  const closingTime = new Date(matchTime.getTime() - 5 * 60 * 1000);
  const closingTimeISO = closingTime.toISOString();

  console.log('📡 Tentative de récupération des closing odds via Historical API...');
  console.log(`   Timestamp: ${closingTimeISO} (5 min avant le match)\n`);

  try {
    const response = await client.getHistoricalOdds(
      event.sport_key,
      event.api_event_id,
      {
        date: closingTimeISO,
        regions: 'eu',
        markets: trackedMarkets.join(','),
        bookmakers: bookmaker,
        oddsFormat: 'decimal',
      }
    );

    const creditsUsed = response.headers.requestsLast;
    console.log(`✅ Réponse reçue - Crédits utilisés: ${creditsUsed}\n`);

    const bookmakerData = response.data.bookmakers?.find((b: any) => b.key === bookmaker);

    if (!bookmakerData || !bookmakerData.markets || bookmakerData.markets.length === 0) {
      console.log('⚠️  Aucune cote disponible de Pinnacle pour ce timestamp\n');
      console.log('💡 Essayons d\'autres timestamps...\n');

      // Essayer d'autres timestamps
      const timestamps = [
        { offset: -10, label: '10 min avant' },
        { offset: -30, label: '30 min avant' },
        { offset: -60, label: '1h avant' },
      ];

      for (const ts of timestamps) {
        const testTime = new Date(matchTime.getTime() + ts.offset * 60 * 1000);
        const testTimeISO = testTime.toISOString();

        console.log(`📡 Tentative: ${testTimeISO} (${ts.label})...`);

        try {
          const testResponse = await client.getHistoricalOdds(
            event.sport_key,
            event.api_event_id,
            {
              date: testTimeISO,
              regions: 'eu',
              markets: trackedMarkets.join(','),
              bookmakers: bookmaker,
              oddsFormat: 'decimal',
            }
          );

          const testCreditsUsed = testResponse.headers.requestsLast;
          const testBookmaker = testResponse.data.bookmakers?.find((b: any) => b.key === bookmaker);

          if (testBookmaker && testBookmaker.markets && testBookmaker.markets.length > 0) {
            console.log(`   ✅ Cotes trouvées! Crédits: ${testCreditsUsed}\n`);

            // Afficher les marchés
            const marketsByKey = new Map<string, any[]>();
            for (const apiMarket of testBookmaker.markets) {
              if (!marketsByKey.has(apiMarket.key)) {
                marketsByKey.set(apiMarket.key, []);
              }
              marketsByKey.get(apiMarket.key)!.push(apiMarket);
            }

            console.log('   📊 Marchés disponibles:\n');
            for (const [marketKey, markets] of marketsByKey.entries()) {
              console.log(`      ✅ ${marketKey}: ${markets.length} variation(s)`);
            }

            break;
          } else {
            console.log(`   ⚠️  Pas de cotes pour ce timestamp\n`);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error: any) {
          console.log(`   ❌ Erreur: ${error.message}\n`);
        }
      }

      return;
    }

    // Si on a trouvé des cotes
    console.log('📊 Closing odds récupérées avec succès!\n');

    // Grouper par market_key
    const marketsByKey = new Map<string, any[]>();
    for (const apiMarket of bookmakerData.markets) {
      if (!marketsByKey.has(apiMarket.key)) {
        marketsByKey.set(apiMarket.key, []);
      }
      marketsByKey.get(apiMarket.key)!.push(apiMarket);
    }

    console.log('📋 Marchés capturés:\n');

    // Fonction d'extraction (avec correction)
    function extractMarketOdds(market: any, homeTeam?: string, awayTeam?: string) {
      const odds: any = {
        last_update: market.last_update,
      };

      for (const outcome of market.outcomes || []) {
        const name = outcome.name.toLowerCase();
        const nameOriginal = outcome.name;

        if (homeTeam && nameOriginal === homeTeam) {
          odds.home = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        } else if (awayTeam && nameOriginal === awayTeam) {
          odds.away = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        } else if (name.includes('home')) {
          odds.home = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        } else if (name.includes('away')) {
          odds.away = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        } else if (name.includes('draw') || name.includes('tie')) {
          odds.draw = outcome.price;
        } else if (name.includes('over')) {
          odds.over = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        } else if (name.includes('under')) {
          odds.under = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        }
      }

      return odds;
    }

    const homeTeam = response.data.home_team;
    const awayTeam = response.data.away_team;

    for (const [marketKey, markets] of marketsByKey.entries()) {
      console.log(`   ✅ ${marketKey}: ${markets.length} variation(s)`);

      const sample = extractMarketOdds(markets[0], homeTeam, awayTeam);
      console.log(`      Exemple: ${JSON.stringify(sample)}`);

      // Vérifier que home/away sont bien extraits
      if (marketKey === 'h2h' && (sample.home !== undefined && sample.away !== undefined)) {
        console.log(`      ✅ home/away correctement extraits!`);
      }
    }

    console.log(`\n💾 Ces données peuvent être stockées dans la table closing_odds`);
    console.log(`   Total: ${bookmakerData.markets.length} variations de cotes\n`);

  } catch (error: any) {
    console.error(`❌ Erreur Historical API: ${error.message}\n`);

    if (error.message.includes('404')) {
      console.log('💡 Raisons possibles:');
      console.log('   - L\'événement n\'existe pas dans l\'API historical');
      console.log('   - Le timestamp est trop éloigné du match');
      console.log('   - L\'abonnement Historical API n\'est pas actif');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.log('💡 L\'API Historical nécessite un abonnement spécial');
      console.log('   Vérifiez votre plan sur https://the-odds-api.com/');
    }
  }

  console.log('\n📊 RÉSUMÉ:');
  console.log('   L\'API Historical permet de récupérer les cotes à un moment précis');
  console.log('   Pour les closing odds: utiliser un timestamp juste avant le match');
  console.log('   Coût: Variable selon les marchés demandés\n');
}

run();
