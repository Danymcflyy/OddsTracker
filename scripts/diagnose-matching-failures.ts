/**
 * Diagnose Matching Failures
 *
 * Pour chaque odd, vérifie si un market correspondant existe
 * et diagnostique pourquoi le matching échoue
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';
import { normalizeMarketKey } from '@/lib/api/oddsapi/normalizer';

async function main() {
  console.log('\n🔍 Diagnosing Matching Failures\n');

  try {
    // Get sample Ligue 1 event
    const { data: events } = await supabaseAdmin
      .from('events_to_track')
      .select('event_id')
      .eq('league_slug', 'france-ligue-1')
      .limit(1);

    if (!events || events.length === 0) {
      console.log('❌ No Ligue 1 events');
      return;
    }

    const eventId = events[0].event_id;

    // Get all odds for this event
    const { data: odds } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('*')
      .eq('event_id', eventId);

    console.log(`Event: ${eventId}`);
    console.log(`Total odds: ${odds?.length || 0}\n`);

    // Get ALL markets
    const { data: allMarkets } = await supabaseAdmin
      .from('markets_v2')
      .select('*');

    console.log(`Total markets in DB: ${allMarkets?.length || 0}\n`);

    // Build lookup maps
    const marketsByKeyAndHandicap = new Map();
    const marketsByKey = new Map();

    if (allMarkets) {
      (allMarkets as any[]).forEach(m => {
        marketsByKey.set(m.oddsapi_key, m);
        const handicapKey = m.handicap !== null && m.handicap !== undefined
          ? `${m.oddsapi_key}:${m.handicap}`
          : m.oddsapi_key;
        marketsByKeyAndHandicap.set(handicapKey, m);
      });
    }

    console.log(`Market lookup keys: ${marketsByKeyAndHandicap.size}\n`);
    console.log('='.repeat(80));
    console.log('TESTING EACH ODD\n');

    let perfectMatches = 0;
    let fallbackMatches = 0;
    let noMatches = 0;

    if (odds) {
      odds.forEach((odd: any, idx) => {
        const normalizedMarketKey = normalizeMarketKey(odd.market_name);
        const handicapKey = odd.line !== null && odd.line !== undefined
          ? `${normalizedMarketKey}:${odd.line}`
          : normalizedMarketKey;

        const exactMatch = marketsByKeyAndHandicap.get(handicapKey);
        const fallbackMatch = marketsByKey.get(normalizedMarketKey);

        console.log(`${idx + 1}. Odd: ${odd.market_name} | ${odd.selection} | line=${odd.line}`);
        console.log(`   Normalized: ${normalizedMarketKey}`);
        console.log(`   Looking for: "${handicapKey}"`);

        if (exactMatch) {
          if (exactMatch.handicap === odd.line) {
            console.log(`   ✅ PERFECT MATCH: market handicap=${exactMatch.handicap} matches odd line=${odd.line}`);
            perfectMatches++;
          } else {
            console.log(`   ⚠️  MATCHED but handicap mismatch!`);
            console.log(`      Market handicap: ${exactMatch.handicap}`);
            console.log(`      Odd line: ${odd.line}`);
            fallbackMatches++;
          }
        } else if (fallbackMatch) {
          console.log(`   ⚠️  FALLBACK MATCH (wrong handicap!)`);
          console.log(`      No exact match for "${handicapKey}"`);
          console.log(`      Using fallback market with handicap: ${fallbackMatch.handicap}`);
          console.log(`      But odd needs line: ${odd.line}`);
          fallbackMatches++;

          // Check if the correct market exists
          const correctKey = `${normalizedMarketKey}:${odd.line}`;
          if (marketsByKeyAndHandicap.has(correctKey)) {
            console.log(`      ❗ WAIT! Market "${correctKey}" EXISTS!`);
            console.log(`      → Matching logic is broken!`);
          } else {
            console.log(`      → Market "${correctKey}" does NOT exist - need to create it`);
          }
        } else {
          console.log(`   ❌ NO MATCH AT ALL!`);
          console.log(`      Neither "${handicapKey}" nor "${normalizedMarketKey}" found`);
          noMatches++;
        }

        console.log('');
      });
    }

    console.log('='.repeat(80));
    console.log('SUMMARY\n');
    console.log(`✅ Perfect matches: ${perfectMatches}`);
    console.log(`⚠️  Fallback/wrong matches: ${fallbackMatches}`);
    console.log(`❌ No matches: ${noMatches}`);
    console.log('');

    if (fallbackMatches > 0) {
      console.log('⚠️  PROBLEM: Some odds are using fallback matching with wrong handicaps!');
      console.log('   This causes mismatched data in the UI.');
      console.log('   Solution: Create markets with exact handicap values OR fix matching logic');
    }

    if (noMatches > 0) {
      console.log('❌ PROBLEM: Some odds have no market at all!');
      console.log('   Solution: Run create-markets-from-odds script');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
