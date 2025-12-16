/**
 * Normalize Market Names
 *
 * Corrige les market_name dans opening_closing_observed
 * De: ML, Spread, Totals (noms API bruts)
 * À: h2h, spreads, totals (noms normalisés)
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

const MARKET_MAPPING: Record<string, string> = {
  'ML': 'h2h',
  'ml': 'h2h',
  'Spread': 'spreads',
  'spread': 'spreads',
  'Totals': 'totals',
  'totals': 'totals',
  'Spread HT': 'spreads_h1',
  'spread ht': 'spreads_h1',
  'Totals HT': 'totals_h1',
  'totals ht': 'totals_h1',
  'Team Total Home': 'team_totals_home',
  'team total home': 'team_totals_home',
  'Team Total Away': 'team_totals_away',
  'team total away': 'team_totals_away',
};

async function main() {
  console.log('\n🔄 Normalizing Market Names\n');

  try {
    let totalUpdated = 0;

    for (const [apiName, normalizedName] of Object.entries(MARKET_MAPPING)) {
      console.log(`Updating ${apiName} → ${normalizedName}...`);

      const { data, error } = await supabaseAdmin
        .from('opening_closing_observed')
        .update({ market_name: normalizedName })
        .eq('market_name', apiName)
        .select('id');

      if (error) {
        console.log(`❌ Error: ${error.message}`);
        continue;
      }

      const count = data?.length || 0;
      totalUpdated += count;
      if (count > 0) {
        console.log(`✅ Updated ${count} records\n`);
      }
    }

    console.log('='.repeat(60));
    console.log(`✅ Normalized ${totalUpdated} market names\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
