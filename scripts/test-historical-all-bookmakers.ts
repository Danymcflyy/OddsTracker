#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi/client');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🎯 TEST HISTORICAL - TOUS LES BOOKMAKERS\n');

  const client = getTheOddsApiClient();

  // Événement Real Madrid vs Monaco
  const eventId = 'd1084b9f2949dcdc9e9564abf5f823c1';
  const sportKey = 'soccer_uefa_champs_league';
  const closingDate = '2026-01-21T02:55:00Z'; // 5 min avant kick-off

  console.log('📅 Date closing: 5 minutes avant kick-off');
  console.log('🔑 Event ID:', eventId);
  console.log('⚽ Sport:', sportKey);
  console.log('📚 Bookmakers: TOUS (pas de filtre)\n');

  try {
    const result = await client.getHistoricalOdds(
      sportKey,
      eventId,
      {
        date: closingDate,
        regions: 'eu',
        markets: 'h2h,spreads,totals',
        // PAS de bookmakers spécifié = tous les bookmakers
        oddsFormat: 'decimal',
        dateFormat: 'iso',
      }
    );

    const data = result.data?.data;
    const bookmakers = data?.bookmakers || [];

    console.log('✅ Réponse reçue');
    console.log(`   Événement: ${data?.home_team} vs ${data?.away_team}`);
    console.log(`   Timestamp: ${result.data?.timestamp}`);
    console.log(`   Bookmakers: ${bookmakers.length}\n`);

    if (bookmakers.length === 0) {
      console.log('❌ Aucun bookmaker disponible à ce timestamp');
      return;
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('DONNÉES DES BOOKMAKERS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Afficher les données de chaque bookmaker
    bookmakers.forEach((bookmaker, idx) => {
      console.log(`\n📚 Bookmaker ${idx + 1}: ${bookmaker.key}`);
      console.log(`   Dernière mise à jour: ${bookmaker.last_update || 'N/A'}`);
      console.log(`   Marchés: ${bookmaker.markets?.length || 0}`);

      bookmaker.markets?.forEach(market => {
        console.log(`\n   ${market.key.toUpperCase()}:`);
        market.outcomes?.forEach(outcome => {
          const point = outcome.point !== undefined ? ` (${outcome.point})` : '';
          console.log(`     ${outcome.name}: ${outcome.price}${point}`);
        });
      });
    });

    // Déterminer quel bookmaker utiliser (priorité: Pinnacle > Bet365 > autres)
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('SÉLECTION DU MEILLEUR BOOKMAKER');
    console.log('═══════════════════════════════════════════════════════\n');

    const bookmakerPriority = ['pinnacle', 'bet365', 'betfair_ex_eu', 'onexbet'];
    let selectedBookmaker = null;

    for (const preferred of bookmakerPriority) {
      const found = bookmakers.find(b => b.key === preferred);
      if (found) {
        selectedBookmaker = found;
        console.log(`✅ Bookmaker sélectionné: ${found.key} (priorité)`);
        break;
      }
    }

    if (!selectedBookmaker && bookmakers.length > 0) {
      selectedBookmaker = bookmakers[0];
      console.log(`⚠️ Bookmaker sélectionné: ${selectedBookmaker.key} (par défaut)`);
    }

    if (!selectedBookmaker) {
      console.log('❌ Aucun bookmaker utilisable');
      return;
    }

    // Extraire et formater les cotes
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('CLOSING ODDS EXTRAITES');
    console.log('═══════════════════════════════════════════════════════\n');

    const closingOdds: any = {
      captured_at: result.data?.timestamp || new Date().toISOString(),
      bookmaker_used: selectedBookmaker.key,
      markets: {},
    };

    selectedBookmaker.markets?.forEach(market => {
      const odds: any = {
        last_update: market.last_update || selectedBookmaker.last_update,
      };

      market.outcomes?.forEach(outcome => {
        const name = outcome.name.toLowerCase();

        // Mapper les outcomes
        if (name.includes('home') || name === data?.home_team?.toLowerCase()) {
          odds.home = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        } else if (name.includes('away') || name === data?.away_team?.toLowerCase()) {
          odds.away = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        } else if (name.includes('draw')) {
          odds.draw = outcome.price;
        } else if (name.includes('over')) {
          odds.over = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        } else if (name.includes('under')) {
          odds.under = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        }
      });

      closingOdds.markets[market.key] = odds;
    });

    console.log(JSON.stringify(closingOdds, null, 2));

    // Sauvegarder dans la DB
    console.log('\n💾 Sauvegarde dans closing_odds...');

    // Trouver l'événement en DB (simulé pour le test)
    const { data: dbEvents } = await supabase
      .from('events')
      .select('id')
      .eq('status', 'completed')
      .limit(1);

    if (dbEvents && dbEvents.length > 0) {
      const testEventId = dbEvents[0].id;

      const { error: upsertError } = await supabase
        .from('closing_odds')
        .upsert({
          event_id: testEventId,
          markets: {
            ...closingOdds.markets,
            _bookmaker: closingOdds.bookmaker_used, // Store bookmaker in markets JSONB
          },
          captured_at: closingOdds.captured_at,
          capture_status: 'success',
          used_historical_api: true,
        });

      if (upsertError) {
        console.log('❌ Erreur:', upsertError.message);
      } else {
        console.log('✅ Closing odds sauvegardées !');
      }
    }

    console.log(`\n📊 Crédits utilisés: ${client.getRequestCount()} requêtes`);

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    if (error.response?.data) {
      console.error('Détails:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

run();
