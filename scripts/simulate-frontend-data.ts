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

  console.log('🔍 Simulation des données frontend...\n');

  // Même requête que le frontend
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
      market_states!left(
        id,
        market_key,
        status,
        opening_odds,
        opening_captured_at
      ),
      closing_odds!left(
        markets,
        captured_at
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

    const marketStates = (event as any).market_states || [];
    const closingOdds = (event as any).closing_odds;

    console.log(`   Market states: ${marketStates.length}`);
    console.log(`   Closing odds: ${closingOdds ? 'Oui' : 'Non'}`);

    if (marketStates.length > 0) {
      console.log('\n   📊 Exemple de market_state:');
      const sample = marketStates[0];
      console.log(`      market_key: ${sample.market_key}`);
      console.log(`      status: ${sample.status}`);
      console.log(`      opening_odds:`, sample.opening_odds);
    }

    if (closingOdds) {
      console.log('\n   📊 Closing odds:');
      console.log(JSON.stringify(closingOdds, null, 2));
    }
  }

  console.log('\n\n💡 Maintenant vérifions ce qui se passe dans football/page.tsx...\n');
  console.log('Le problème probable:');
  console.log('  1. market_states contient les opening_odds simples (objet)');
  console.log('  2. column-builder attend opening_odds comme array avec variations');
  console.log('  3. Il y a probablement une transformation manquante\n');
}

run();
