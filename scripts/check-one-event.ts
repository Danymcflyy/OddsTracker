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

  console.log('🔍 Vérification d\'un événement complet...\n');

  // Prendre le premier événement avec des données
  const { data: events } = await supabase
    .from('events')
    .select(`
      id,
      home_team,
      away_team,
      market_states (
        market_key,
        status,
        opening_odds_variations
      )
    `)
    .limit(1)
    .single();

  if (!events) {
    console.log('❌ Aucun événement trouvé');
    return;
  }

  console.log(`🏆 ${events.home_team} vs ${events.away_team}\n`);

  const marketStates = (events as any).market_states || [];

  // Grouper par market_key
  const byMarket = new Map<string, any[]>();
  for (const ms of marketStates) {
    if (!byMarket.has(ms.market_key)) {
      byMarket.set(ms.market_key, []);
    }
    byMarket.get(ms.market_key)!.push(ms);
  }

  console.log('📊 État des marchés:\n');

  const marketNames: Record<string, string> = {
    h2h: '1X2',
    spreads: 'Handicap',
    totals: 'Over/Under',
    h2h_h1: '1X2 (1ère MT)',
    spreads_h1: 'Handicap (1ère MT)',
    totals_h1: 'O/U (1ère MT)',
    team_totals: 'Total Équipe',
  };

  for (const [marketKey, states] of byMarket.entries()) {
    const captured = states.filter(s => s.status === 'captured');
    const pending = states.filter(s => s.status === 'pending');

    const name = marketNames[marketKey] || marketKey;

    if (captured.length > 0) {
      let totalVariations = 0;
      captured.forEach(c => {
        const vars = c.opening_odds_variations || [];
        totalVariations += vars.length;
      });

      console.log(`✅ ${name.padEnd(20)} ${totalVariations} variation(s)`);

      // Afficher un échantillon
      if (captured[0].opening_odds_variations && captured[0].opening_odds_variations.length > 0) {
        const sample = captured[0].opening_odds_variations[0];
        const keys = Object.keys(sample).filter(k => k !== 'point');
        console.log(`   Données: ${keys.join(', ')}`);
      }
    } else {
      console.log(`⚠️  ${name.padEnd(20)} Pas de données Pinnacle`);
    }
  }

  console.log('\n💡 Conclusion:');
  console.log('  - Les marchés avec ✅ auront des cellules remplies');
  console.log('  - Les marchés avec ⚠️ auront des cellules vides (normal)\n');
}

run();
