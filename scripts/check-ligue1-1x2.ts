/**
 * Check Ligue 1 1X2 Data
 *
 * Vérifie si Ligue 1 a des données 1X2/h2h basiques
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🔍 Checking Ligue 1 1X2 (h2h) Data\n');

  try {
    // Get all odds for Ligue 1
    const { data: ligue1Odds } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('market_name, selection, line, opening_price_observed')
      .eq('league_slug', 'france-ligue-1');

    if (!ligue1Odds || ligue1Odds.length === 0) {
      console.log('❌ No odds found for Ligue 1');
      return;
    }

    console.log(`✅ Found ${ligue1Odds.length} total odds for Ligue 1\n`);

    // Group by market_name
    const byMarket = new Map();
    ligue1Odds.forEach((odd: any) => {
      if (!byMarket.has(odd.market_name)) {
        byMarket.set(odd.market_name, []);
      }
      byMarket.get(odd.market_name).push(odd);
    });

    console.log('Odds by market type:');
    byMarket.forEach((odds, marketName) => {
      console.log(`  ${marketName}: ${odds.length} odds`);
    });

    // Check specifically for 1X2/h2h/ML
    const h2hMarkets = ['h2h', 'ML', 'ml', '1x2', '1X2'];
    const h2hOdds = ligue1Odds.filter((odd: any) =>
      h2hMarkets.includes(odd.market_name)
    );

    console.log(`\n📊 1X2/H2H odds: ${h2hOdds.length}`);
    if (h2hOdds.length === 0) {
      console.log('❌ NO 1X2 DATA FOR LIGUE 1!');
      console.log('   This explains why the table is empty!');
    } else {
      console.log('✅ Found 1X2 data');
      // Show sample
      console.log('\n   Sample 1X2 odds:');
      h2hOdds.slice(0, 5).forEach((odd: any) => {
        console.log(`     ${odd.selection}: ${odd.opening_price_observed}`);
      });
    }

    // Show what markets ARE available
    console.log(`\n📋 Available market types in Ligue 1 data:`);
    const marketTypes = [...byMarket.keys()];
    marketTypes.forEach(m => {
      console.log(`   • ${m}`);
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
