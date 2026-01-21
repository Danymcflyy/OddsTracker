#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { fetchEventsForTable } = await import('@/lib/db/queries-frontend');

  console.log('🧪 Test de l\'API frontend (queries-frontend)...\n');

  // Test 1: Sans aucun filtre
  console.log('📊 Test 1: Sans filtre (comme le tableau)');
  const result1 = await fetchEventsForTable({
    page: 1,
    pageSize: 10,
  });

  console.log(`  - Total: ${result1.total}`);
  console.log(`  - Events retournés: ${result1.data.length}`);

  if (result1.data.length > 0) {
    const event = result1.data[0];
    console.log(`  - Premier événement: ${event.home_team} vs ${event.away_team}`);
    console.log(`  - Opening odds entries: ${event.opening_odds.length}`);
    console.log(`  - Sport: ${event.sport_key}`);

    // Afficher un échantillon des opening_odds
    if (event.opening_odds.length > 0) {
      console.log(`  - Premier marché: ${event.opening_odds[0].market_key}`);
      console.log(`  - Odds:`, JSON.stringify(event.opening_odds[0].odds, null, 2));
    }
  } else {
    console.log('  ⚠️  Aucun événement retourné par fetchEventsForTable\n');

    // Test 2: Vérifier si des events existent directement en base
    console.log('📊 Test 2: Vérification directe en base');
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: directEvents, count } = await supabase
      .from('events')
      .select('id, home_team, away_team, sport_key', { count: 'exact' })
      .limit(5);

    console.log(`  - Total events en base: ${count}`);
    if (directEvents && directEvents.length > 0) {
      console.log(`  - Exemples:`);
      directEvents.forEach(e => {
        console.log(`    • ${e.home_team} vs ${e.away_team} (${e.sport_key})`);
      });

      // Vérifier si ces events ont des market_states
      console.log('\n📊 Test 3: Vérifier les market_states');
      const { data: withMarkets } = await supabase
        .from('events')
        .select(`
          id,
          home_team,
          away_team,
          market_states (
            id,
            market_key,
            status,
            opening_odds_variations
          )
        `)
        .limit(1)
        .single();

      if (withMarkets) {
        const ms = (withMarkets as any).market_states || [];
        const captured = ms.filter((m: any) => m.status === 'captured');
        console.log(`  - Event: ${withMarkets.home_team} vs ${withMarkets.away_team}`);
        console.log(`  - Market states: ${ms.length} total, ${captured.length} captured`);

        if (captured.length > 0) {
          const sample = captured[0];
          const variations = sample.opening_odds_variations || [];
          console.log(`  - Premier marché: ${sample.market_key}`);
          console.log(`  - Variations: ${variations.length}`);
          if (variations.length > 0) {
            console.log(`  - Exemple:`, JSON.stringify(variations[0], null, 2));
          }
        }
      }
    }
  }
}

run();
