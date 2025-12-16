/**
 * Test Ligue 1 Enrichment
 *
 * Simule EXACTEMENT ce que l'API endpoint fait pour enrichir
 * les odds de Ligue 1
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';
import { normalizeMarketKey, normalizeOutcomeName } from '@/lib/api/oddsapi/normalizer';

async function main() {
  console.log('\n🧪 Testing Ligue 1 Enrichment (simulating API endpoint)\n');

  try {
    // Get one Ligue 1 event
    const { data: events } = await supabaseAdmin
      .from('events_to_track')
      .select('event_id')
      .eq('league_slug', 'france-ligue-1')
      .limit(1);

    if (!events || events.length === 0) {
      console.log('❌ No Ligue 1 events found');
      return;
    }

    const eventId = events[0].event_id;
    console.log(`Testing event: ${eventId}\n`);

    // Get odds for this event (simulate line 339-342 of route.ts)
    const { data: odds } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('*')
      .eq('event_id', eventId);

    console.log(`✅ Found ${odds?.length || 0} odds in opening_closing_observed\n`);

    if (!odds || odds.length === 0) {
      console.log('❌ No odds to enrich!');
      return;
    }

    // Get all markets (simulate line 346-348)
    const { data: marketsV2 } = await supabaseAdmin
      .from('markets_v2')
      .select('*');

    console.log(`✅ Found ${marketsV2?.length || 0} markets in markets_v2\n`);

    // Build market maps (simulate line 350-362)
    const marketsByKey = new Map();
    const marketsByKeyAndHandicap = new Map();

    if (marketsV2) {
      (marketsV2 as any[]).forEach(m => {
        marketsByKey.set(m.oddsapi_key, m);
        const handicapKey = m.handicap !== null && m.handicap !== undefined
          ? `${m.oddsapi_key}:${m.handicap}`
          : m.oddsapi_key;
        marketsByKeyAndHandicap.set(handicapKey, m);
      });
    }

    console.log(`📊 Market lookup maps created:`);
    console.log(`   - marketsByKey: ${marketsByKey.size} entries`);
    console.log(`   - marketsByKeyAndHandicap: ${marketsByKeyAndHandicap.size} entries\n`);

    // Enrich odds (simulate line 364-415)
    let enrichedCount = 0;
    let failedCount = 0;

    console.log(`🔄 Enriching odds...\n`);

    odds.slice(0, 10).forEach((odd: any, idx) => {
      const normalizedMarketKey = normalizeMarketKey(odd.market_name);
      const handicapKey = odd.line !== null && odd.line !== undefined
        ? `${normalizedMarketKey}:${odd.line}`
        : normalizedMarketKey;

      const market = marketsByKeyAndHandicap.get(handicapKey) || marketsByKey.get(normalizedMarketKey);
      const normalizedOutcomeName = normalizeOutcomeName(odd.selection);

      console.log(`${idx + 1}. Odd:`);
      console.log(`   Raw: market_name="${odd.market_name}", selection="${odd.selection}", line=${odd.line}`);
      console.log(`   Normalized: market="${normalizedMarketKey}", outcome="${normalizedOutcomeName}"`);
      console.log(`   Lookup key: "${handicapKey}"`);

      if (market) {
        console.log(`   ✅ MATCHED with market ID: ${market.id}`);
        enrichedCount++;
      } else {
        console.log(`   ❌ NO MATCH FOUND!`);
        console.log(`      Tried: "${handicapKey}" and "${normalizedMarketKey}"`);
        failedCount++;
      }
      console.log('');
    });

    console.log('='.repeat(80));
    console.log(`📊 Results (first 10 odds):`);
    console.log(`   ✅ Enriched: ${enrichedCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log('');

    if (failedCount > 0) {
      console.log('⚠️  Some odds cannot be matched!');
      console.log('   This explains why they don\'t appear in the UI.');
      console.log('   Run: npm run create-missing-markets');
    } else {
      console.log('✅ All odds can be matched!');
      console.log('   If UI still empty, check:');
      console.log('   1. Browser cache');
      console.log('   2. API endpoint logs');
      console.log('   3. Column definitions in football-columns.tsx');
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
