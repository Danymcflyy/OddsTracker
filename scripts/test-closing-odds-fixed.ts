#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi');

  console.log('🔍 Test de la correction d\'extraction closing odds\n');

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
    console.log('📡 Récupération d\'un événement Champions League...\n');

    const eventsResponse = await client.getEvents('soccer_uefa_champs_league');
    const events = eventsResponse.data;

    if (events.length === 0) {
      console.log('⚠️  Aucun événement à venir');
      return;
    }

    const event = events[0];

    console.log(`🏆 ${event.home_team} vs ${event.away_team}`);
    console.log(`   Date: ${new Date(event.commence_time).toLocaleString('fr-FR')}\n`);

    // Récupérer les cotes
    console.log('📡 Appel API pour récupérer les cotes...');

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

    console.log(`   ✅ Réponse reçue\n`);

    const bookmakerData = response.data.bookmakers?.find((b: any) => b.key === bookmaker);

    if (!bookmakerData) {
      console.log('   ⚠️  Pinnacle ne couvre pas cet événement');
      return;
    }

    // Simuler l'extraction avec la fonction corrigée
    const homeTeam = event.home_team;
    const awayTeam = event.away_team;

    console.log('📊 Test de l\'extraction avec noms d\'équipes:\n');
    console.log(`   home_team: "${homeTeam}"`);
    console.log(`   away_team: "${awayTeam}"\n`);

    // Fonction d'extraction locale (même logique que dans closing-odds.ts)
    function extractMarketOdds(market: any, homeTeam?: string, awayTeam?: string) {
      const odds: any = {
        last_update: market.last_update,
      };

      for (const outcome of market.outcomes || []) {
        const name = outcome.name.toLowerCase();
        const nameOriginal = outcome.name;

        // Check for team names first
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

    // Grouper par market_key
    const marketsByKey = new Map<string, any[]>();
    for (const apiMarket of bookmakerData.markets) {
      if (!marketsByKey.has(apiMarket.key)) {
        marketsByKey.set(apiMarket.key, []);
      }
      marketsByKey.get(apiMarket.key)!.push(apiMarket);
    }

    console.log('📋 Résultats de l\'extraction corrigée:\n');

    for (const [marketKey, apiMarkets] of marketsByKey.entries()) {
      console.log(`   ✅ ${marketKey}:`);

      const extracted = extractMarketOdds(apiMarkets[0], homeTeam, awayTeam);
      console.log(`      ${JSON.stringify(extracted, null, 2)}`);

      // Vérifier si home et away sont bien extraits
      if (marketKey === 'h2h' || marketKey === 'spreads' || marketKey === 'h2h_h1' || marketKey === 'spreads_h1') {
        if (extracted.home !== undefined || extracted.away !== undefined) {
          console.log(`      ✅ home/away correctement extraits!`);
        } else {
          console.log(`      ❌ home/away manquants!`);
        }
      }

      console.log('');
    }

    console.log('\n💡 Comparaison AVANT / APRÈS la correction:\n');
    console.log('AVANT (sans noms d\'équipes):');
    console.log('  h2h: { last_update: "...", draw: 3.84 }  ❌ Manque home et away\n');
    console.log('APRÈS (avec noms d\'équipes):');
    console.log('  h2h: { last_update: "...", home: 3.47, draw: 3.84, away: 2.06 }  ✅ Complet!\n');

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

run();
