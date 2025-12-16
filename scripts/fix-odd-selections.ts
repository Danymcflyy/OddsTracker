/**
 * Fix Odd Selections
 *
 * Corrige les valeurs de 'selection' dans opening_closing_observed
 * De: home, away, draw, over, under
 * À: 1, X, 2, OVER, UNDER
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🔧 Fixing Odd Selections\n');

  try {
    // Update selections
    const updates = [
      { from: 'home', to: '1' },
      { from: 'away', to: '2' },
      { from: 'draw', to: 'X' },
      { from: 'over', to: 'OVER' },
      { from: 'under', to: 'UNDER' },
    ];

    let totalUpdated = 0;

    for (const update of updates) {
      console.log(`Updating ${update.from} → ${update.to}...`);

      const { data, error } = await supabaseAdmin
        .from('opening_closing_observed')
        .update({ selection: update.to })
        .eq('selection', update.from)
        .select('id');

      if (error) {
        console.log(`❌ Error: ${error.message}`);
        continue;
      }

      const count = data?.length || 0;
      totalUpdated += count;
      console.log(`✅ Updated ${count} records\n`);
    }

    console.log('='.repeat(60));
    console.log(`✅ Fixed ${totalUpdated} odd selections\n`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
