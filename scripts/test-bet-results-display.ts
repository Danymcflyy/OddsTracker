#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');
  const { getMarketResult } = await import('@/lib/utils/bet-results');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔍 Test de l\'affichage des résultats colorés\n');

  // Récupérer un match terminé avec score
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      *,
      market_states (
        market_key,
        status,
        opening_odds,
        opening_odds_variations
      )
    `)
    .eq('status', 'completed')
    .not('home_score', 'is', null)
    .not('away_score', 'is', null)
    .limit(1)
    .single();

  if (error || !events) {
    console.log('❌ Aucun match terminé avec score trouvé');
    console.log('Erreur:', error);
    return;
  }

  const event = events as any;

  console.log(`🏆 ${event.home_team} vs ${event.away_team}`);
  console.log(`   Score: ${event.home_score} - ${event.away_score}`);
  console.log(`   Status: ${event.status}\n`);

  const score = {
    home: event.home_score,
    away: event.away_score,
  };

  console.log('📊 Calcul des résultats pour chaque marché:\n');

  const marketStates = event.market_states || [];

  for (const ms of marketStates) {
    if (ms.status !== 'captured' || !ms.opening_odds) continue;

    console.log(`\n✅ ${ms.market_key}:`);
    console.log(`   Opening odds:`, ms.opening_odds);

    // Test 1X2
    if (ms.market_key === 'h2h') {
      const outcomes = ['home', 'draw', 'away'] as const;
      for (const outcome of outcomes) {
        const odds = ms.opening_odds[outcome];
        if (odds !== undefined && odds !== null) {
          const result = getMarketResult(ms.market_key, outcome, undefined, score);
          const icon = result === 'win' ? '🟢' : result === 'loss' ? '🔴' : '⚪';
          console.log(`   ${icon} ${outcome}: ${odds} → ${result.toUpperCase()}`);
        }
      }
    }

    // Test Spreads
    if (ms.market_key === 'spreads') {
      const point = ms.opening_odds.point;
      const outcomes = ['home', 'away'] as const;

      for (const outcome of outcomes) {
        const odds = ms.opening_odds[outcome];
        if (odds !== undefined && odds !== null && point !== undefined) {
          const result = getMarketResult(ms.market_key, outcome, point, score);
          const icon = result === 'win' ? '🟢' : result === 'loss' ? '🔴' : result === 'push' ? '🟡' : '⚪';

          // Calculer le score ajusté pour debug
          let scoreAdjusted = outcome === 'home'
            ? score.home + point
            : score.away + point;
          let opponent = outcome === 'home' ? score.away : score.home;

          console.log(`   ${icon} ${outcome} ${point > 0 ? '+' : ''}${point}: ${odds} → ${result.toUpperCase()}`);
          console.log(`      Score ajusté: ${scoreAdjusted.toFixed(2)} vs ${opponent}`);
        }
      }
    }

    // Test Totals
    if (ms.market_key === 'totals') {
      const point = ms.opening_odds.point;
      const outcomes = ['over', 'under'] as const;

      if (point !== undefined) {
        const total = score.home + score.away;

        for (const outcome of outcomes) {
          const odds = ms.opening_odds[outcome];
          if (odds !== undefined && odds !== null) {
            const result = getMarketResult(ms.market_key, outcome, point, score);
            const icon = result === 'win' ? '🟢' : result === 'loss' ? '🔴' : result === 'push' ? '🟡' : '⚪';

            console.log(`   ${icon} ${outcome} ${point}: ${odds} → ${result.toUpperCase()}`);
            console.log(`      Total buts: ${total} ${outcome === 'over' ? '>' : '<'} ${point}`);
          }
        }
      }
    }
  }

  console.log('\n\n💡 Vérification:');
  console.log('   Si vous voyez des 🟢 et 🔴 ci-dessus, la logique fonctionne');
  console.log('   Si tout est ⚪, il y a un problème dans le calcul\n');

  console.log('📋 Données à vérifier dans le frontend:');
  console.log(`   - event.status: "${event.status}" (doit être "completed")`);
  console.log(`   - event.home_score: ${event.home_score} (non null)`);
  console.log(`   - event.away_score: ${event.away_score} (non null)`);
  console.log(`   - market_states avec opening_odds: ${marketStates.filter((m: any) => m.opening_odds).length}\n`);
}

run();
