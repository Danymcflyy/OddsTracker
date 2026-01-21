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

  console.log('🎯 TEST HISTORICAL CLOSING ODDS\n');

  // Récupérer un événement terminé récent
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'completed')
    .not('home_score', 'is', null)
    .not('away_score', 'is', null)
    .gte('commence_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('commence_time', { ascending: false })
    .limit(1);

  if (!events || events.length === 0) {
    console.log('❌ Aucun événement terminé trouvé');
    return;
  }

  const event = events[0];
  console.log(`🏆 Événement test: ${event.home_team} vs ${event.away_team}`);
  console.log(`   Score: ${event.home_score} - ${event.away_score}`);
  console.log(`   Date: ${new Date(event.commence_time).toLocaleString('fr-FR')}`);
  console.log(`   Event ID: ${event.id}`);
  console.log(`   API ID: ${event.api_id}`);
  console.log(`   Sport: ${event.sport_key}\n`);

  if (!event.api_id) {
    console.log('❌ Pas d\'api_id pour cet événement');
    return;
  }

  // Récupérer les closing odds via Historical API
  console.log('🔍 Récupération via Historical API...\n');

  const client = getTheOddsApiClient();

  try {
    // Construire la date pour Historical API (commence_time)
    const eventDate = new Date(event.commence_time).toISOString();

    console.log(`📅 Date de l'événement: ${eventDate}`);
    console.log(`🔑 API ID: ${event.api_id}`);
    console.log(`⚽ Sport: ${event.sport_key}\n`);

    // Appel Historical API
    const result = await client.getHistoricalOdds(
      event.sport_key,
      event.api_id,
      {
        date: eventDate,
        regions: 'eu',
        markets: 'h2h,spreads,totals,h2h_h1,spreads_h1,totals_h1',
        bookmakers: 'pinnacle',
        oddsFormat: 'decimal',
        dateFormat: 'iso',
      }
    );

    console.log('✅ Réponse Historical API reçue\n');
    console.log('📊 Données:');
    console.log(JSON.stringify(result, null, 2));

    // Vérifier si les bookmakers sont présents
    if (result.bookmakers && result.bookmakers.length > 0) {
      console.log(`\n✅ ${result.bookmakers.length} bookmaker(s) trouvé(s)`);

      result.bookmakers.forEach(bookmaker => {
        console.log(`\n📚 Bookmaker: ${bookmaker.key}`);
        console.log(`   Marchés: ${bookmaker.markets?.length || 0}`);

        bookmaker.markets?.forEach(market => {
          console.log(`   - ${market.key}:`);
          market.outcomes?.forEach(outcome => {
            console.log(`     ${outcome.name}: ${outcome.price}${outcome.point ? ` (${outcome.point})` : ''}`);
          });
        });
      });

      // Sauvegarder dans closing_odds
      console.log('\n💾 Sauvegarde des closing odds...');

      const pinnacle = result.bookmakers.find(b => b.key === 'pinnacle');
      if (pinnacle && pinnacle.markets) {
        const closingOdds: any = { markets: {} };

        pinnacle.markets.forEach(market => {
          const odds: any = { last_update: market.last_update };

          market.outcomes?.forEach(outcome => {
            const name = outcome.name.toLowerCase();
            if (name === event.home_team.toLowerCase()) {
              odds.home = outcome.price;
              if (outcome.point !== undefined) odds.point = outcome.point;
            } else if (name === event.away_team.toLowerCase()) {
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

        const { error: upsertError } = await supabase
          .from('closing_odds')
          .upsert({
            event_id: event.id,
            markets: closingOdds.markets,
            bookmaker: 'pinnacle',
            captured_at: new Date().toISOString(),
            status: 'success',
          });

        if (upsertError) {
          console.log('❌ Erreur sauvegarde:', upsertError.message);
        } else {
          console.log('✅ Closing odds sauvegardées !');
        }
      }

    } else {
      console.log('\n⚠️ Aucun bookmaker trouvé dans la réponse');
    }

    console.log(`\n📊 Crédits API utilisés: ${client.getRequestCount()}`);

  } catch (error: any) {
    console.error('\n❌ Erreur lors de la récupération:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

run();
