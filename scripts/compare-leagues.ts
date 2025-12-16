/**
 * Compare Leagues Data
 *
 * Compare les données de Premier League et Ligue 1
 * pour identifier les différences
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🔍 Comparing Leagues Data\n');

  try {
    // Premier League sample
    console.log('📊 PREMIER LEAGUE (sample):');
    const { data: plOdds } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('market_name, selection, line')
      .eq('sport_slug', 'football')
      .eq('league_slug', 'england-premier-league')
      .limit(20);

    if (plOdds && plOdds.length > 0) {
      const plUnique = new Map();
      plOdds.forEach(o => {
        const key = `${o.market_name}:${o.selection}:${o.line}`;
        plUnique.set(key, o);
      });

      console.log(`  Total unique combinations: ${plUnique.size}`);
      plUnique.forEach((odd, key) => {
        console.log(`    ${key}`);
      });
    } else {
      console.log('  ❌ No data found');
    }

    console.log('\n📊 LIGUE 1 (sample):');
    const { data: l1Odds } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('market_name, selection, line')
      .eq('sport_slug', 'football')
      .eq('league_slug', 'france-ligue-1')
      .limit(20);

    if (l1Odds && l1Odds.length > 0) {
      const l1Unique = new Map();
      l1Odds.forEach(o => {
        const key = `${o.market_name}:${o.selection}:${o.line}`;
        l1Unique.set(key, o);
      });

      console.log(`  Total unique combinations: ${l1Unique.size}`);
      l1Unique.forEach((odd, key) => {
        console.log(`    ${key}`);
      });
    } else {
      console.log('  ❌ No data found');
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
