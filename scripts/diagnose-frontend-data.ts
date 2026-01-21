#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔍 Diagnostic des données frontend...\n');

  // Simuler ce que le frontend récupère
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id,
      home_team,
      away_team,
      commence_time,
      sport_key,
      league_name,
      status,
      score_home,
      score_away,
      market_states (
        market_key,
        status,
        opening_odds_variations,
        closing_odds_variations
      )
    `)
    .order('commence_time', { ascending: true })
    .limit(3);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!events || events.length === 0) {
    console.log('❌ Aucun événement trouvé');
    return;
  }

  console.log(`✅ ${events.length} événements récupérés\n`);

  for (const event of events) {
    console.log(`\n🏆 ${event.home_team} vs ${event.away_team}`);
    console.log(`   Date: ${new Date(event.commence_time).toLocaleString('fr-FR')}`);
    console.log(`   Sport: ${event.sport_key}`);
    console.log(`   Statut: ${event.status}\n`);

    const marketStates = (event as any).market_states || [];

    if (marketStates.length === 0) {
      console.log('   ⚠️  Aucun market_state pour cet événement\n');
      continue;
    }

    console.log(`   📊 ${marketStates.length} market_states trouvés:\n`);

    // Grouper par market_key pour voir la structure
    const byMarket = new Map<string, any[]>();
    for (const ms of marketStates) {
      if (!byMarket.has(ms.market_key)) {
        byMarket.set(ms.market_key, []);
      }
      byMarket.get(ms.market_key)!.push(ms);
    }

    for (const [marketKey, states] of byMarket.entries()) {
      console.log(`   📈 ${marketKey}:`);

      for (const state of states) {
        const openingVars = state.opening_odds_variations || [];
        const closingVars = state.closing_odds_variations || [];

        console.log(`      Status: ${state.status}`);
        console.log(`      Opening variations: ${openingVars.length}`);
        console.log(`      Closing variations: ${closingVars.length}`);

        if (openingVars.length > 0) {
          const sample = openingVars[0];
          console.log(`      Sample opening data:`, JSON.stringify(sample, null, 2));
        }

        if (closingVars.length > 0) {
          const sample = closingVars[0];
          console.log(`      Sample closing data:`, JSON.stringify(sample, null, 2));
        }
      }
      console.log('');
    }
  }

  console.log('\n💡 Points à vérifier:');
  console.log('  1. Les market_keys correspondent-ils à ceux attendus dans column-builder?');
  console.log('  2. La structure des opening/closing_odds_variations est-elle correcte?');
  console.log('  3. Les outcomes (home, away, draw, over, under) sont-ils présents?\n');
}

run();
