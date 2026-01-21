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

  console.log('🔍 Test direct de l\'API Pinnacle...\n');

  // Prendre un événement de la DB
  const { data: event } = await supabase
    .from('events')
    .select('id, api_event_id, home_team, away_team, sport_key')
    .limit(1)
    .single();

  if (!event) {
    console.log('❌ Aucun événement trouvé');
    return;
  }

  console.log(`🏆 Test avec: ${event.home_team} vs ${event.away_team}`);
  console.log(`   API ID: ${event.api_event_id}\n`);

  // Appeler l'API directement
  const client = getTheOddsApiClient();

  console.log('📡 Appel API direct pour TOUS les marchés disponibles...\n');

  try {
    const response = await client.getEventOdds(
      event.sport_key,
      event.api_event_id,
      {
        bookmakers: 'pinnacle',
        markets: 'h2h,spreads,totals,h2h_h1,spreads_h1,totals_h1,team_totals,alternate_spreads,alternate_totals,alternate_spreads_h1,alternate_totals_h1,alternate_team_totals',
      }
    );

    console.log(`✅ Réponse reçue - Crédits restants: ${response.headers.requestsRemaining}\n`);

    const bookmakers = response.data.bookmakers || [];

    if (bookmakers.length === 0) {
      console.log('⚠️  AUCUN bookmaker retourné par l\'API');
      console.log('   → C\'est normal si Pinnacle ne couvre pas ce match\n');
      return;
    }

    const pinnacle = bookmakers.find(b => b.key === 'pinnacle');

    if (!pinnacle) {
      console.log('⚠️  Pinnacle n\'est pas dans la liste des bookmakers');
      console.log('   Bookmakers disponibles:', bookmakers.map(b => b.key).join(', '));
      return;
    }

    console.log('✅ Pinnacle trouvé!\n');
    console.log('📊 Marchés disponibles:\n');

    const markets = pinnacle.markets || [];

    if (markets.length === 0) {
      console.log('⚠️  Aucun marché disponible de Pinnacle pour ce match\n');
      return;
    }

    for (const market of markets) {
      console.log(`   ✅ ${market.key}`);
      console.log(`      Outcomes: ${market.outcomes?.length || 0}`);

      // Afficher un échantillon
      if (market.outcomes && market.outcomes.length > 0) {
        const sample = market.outcomes[0];
        const keys = Object.keys(sample).filter(k => k !== 'description');
        console.log(`      Données: ${keys.join(', ')}`);
      }
    }

    console.log('\n💡 Comparaison avec nos marchés demandés:\n');

    const requestedMarkets = [
      'h2h',
      'alternate_spreads',
      'alternate_totals',
      'h2h_h1',
      'alternate_spreads_h1',
      'alternate_totals_h1',
      'team_totals',
    ];

    for (const requested of requestedMarkets) {
      const found = markets.find(m => m.key === requested);
      if (found) {
        console.log(`   ✅ ${requested.padEnd(25)} DISPONIBLE (${found.outcomes?.length || 0} outcomes)`);
      } else {
        console.log(`   ❌ ${requested.padEnd(25)} NON DISPONIBLE`);
      }
    }

  } catch (error) {
    console.error('\n❌ Erreur API:', error);
  }

  console.log('\n\n🔍 Maintenant vérifions ce qu\'on a stocké en DB...\n');

  const { data: marketStates } = await supabase
    .from('market_states')
    .select('market_key, status, opening_odds_variations')
    .eq('event_id', event.id);

  if (!marketStates || marketStates.length === 0) {
    console.log('❌ Aucun market_state en DB');
    return;
  }

  console.log('📊 Market states en DB:\n');

  for (const ms of marketStates) {
    const variations = ms.opening_odds_variations || [];
    const status = ms.status === 'captured' ? '✅' : '⚠️';
    console.log(`   ${status} ${ms.market_key.padEnd(25)} ${ms.status.padEnd(10)} ${variations.length} variation(s)`);
  }

  console.log('\n');
}

run();
