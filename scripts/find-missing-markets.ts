/**
 * Find Missing Markets
 *
 * Identifie les marchés manquants en comparant
 * les line values dans les odds avec les markets existants
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🔍 Finding Missing Markets\n');

  try {
    // Get all unique (market_name, line) combinations from odds
    const { data: odds } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('market_name, line');

    if (!odds || odds.length === 0) {
      console.log('No odds found');
      return;
    }

    // Get unique combinations
    const oddCombinations = new Set();
    const oddLines = new Map(); // market_name -> Set of lines

    odds.forEach((odd: any) => {
      const key = `${odd.market_name}:${odd.line}`;
      oddCombinations.add(key);

      if (!oddLines.has(odd.market_name)) {
        oddLines.set(odd.market_name, new Set());
      }
      oddLines.get(odd.market_name).add(odd.line);
    });

    console.log(`Found ${oddCombinations.size} unique (market, line) combinations:\n`);

    oddLines.forEach((lines, marketName) => {
      const sortedLines = Array.from(lines).sort((a, b) => {
        const aVal = a === null ? -999 : typeof a === 'number' ? a : parseFloat(a);
        const bVal = b === null ? -999 : typeof b === 'number' ? b : parseFloat(b);
        return aVal - bVal;
      });

      console.log(`${marketName}:`);
      console.log(`  Lines: ${sortedLines.map(l => l === null ? 'null' : l).join(', ')}`);
    });

    // Get all markets from markets_v2
    const { data: markets } = await supabaseAdmin
      .from('markets_v2')
      .select('oddsapi_key, handicap, id');

    if (!markets || markets.length === 0) {
      console.log('\nNo markets in markets_v2');
      return;
    }

    console.log('\n\nCurrent markets in markets_v2:\n');

    const marketsByKey = new Map();
    markets.forEach((m: any) => {
      if (!marketsByKey.has(m.oddsapi_key)) {
        marketsByKey.set(m.oddsapi_key, []);
      }
      marketsByKey.get(m.oddsapi_key).push(m);
    });

    marketsByKey.forEach((marketList, key) => {
      console.log(`${key}:`);
      marketList.forEach((m: any) => {
        const handicap = m.handicap === null ? 'null' : m.handicap;
        console.log(`  ✓ Handicap: ${handicap} (ID: ${m.id})`);
      });
    });

    // Find missing combinations
    console.log('\n\nMissing market combinations:\n');

    let missingCount = 0;
    oddLines.forEach((lines, marketName) => {
      const existingMarkets = marketsByKey.get(marketName) || [];
      const existingHandicaps = new Set(existingMarkets.map((m: any) => m.handicap));

      lines.forEach(line => {
        if (!existingHandicaps.has(line)) {
          console.log(`❌ ${marketName} with handicap=${line}`);
          missingCount++;
        }
      });
    });

    if (missingCount === 0) {
      console.log('✅ All market combinations exist!');
    } else {
      console.log(`\n⚠️  ${missingCount} missing market combinations`);
    }

    console.log('\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
