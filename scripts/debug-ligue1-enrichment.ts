/**
 * Debug Ligue 1 Enrichment
 *
 * Examine étape par étape comment les données de Ligue 1
 * se transforment de la DB brute à l'enrichissement final
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';
import { normalizeMarketKey, normalizeOutcomeName } from '@/lib/api/oddsapi/normalizer';

async function main() {
  console.log('\n🔍 Debugging Ligue 1 Odds Enrichment\n');

  try {
    // STEP 1: Check Ligue 1 in leagues_v2
    console.log('STEP 1: Checking Ligue 1 in leagues_v2');
    console.log('-'.repeat(80));

    const { data: ligue1League } = await supabaseAdmin
      .from('leagues_v2')
      .select('*')
      .ilike('name', '%Ligue 1%')
      .single();

    if (!ligue1League) {
      console.log('❌ Ligue 1 not found in leagues_v2');
      return;
    }

    console.log(`✅ Found Ligue 1:`);
    console.log(`   ID: ${ligue1League.id}`);
    console.log(`   Name: ${ligue1League.name}`);
    console.log(`   Slug: ${ligue1League.oddsapi_slug}`);
    console.log(`   Sport ID: ${ligue1League.sport_id}`);

    // STEP 2: Check events_to_track for Ligue 1
    console.log('\n\nSTEP 2: Checking events_to_track for Ligue 1');
    console.log('-'.repeat(80));

    const { data: ligue1Events } = await supabaseAdmin
      .from('events_to_track')
      .select('event_id, league_slug, home_team_id, away_team_id, event_date')
      .eq('league_slug', 'france-ligue-1')
      .limit(3);

    if (!ligue1Events || ligue1Events.length === 0) {
      console.log('❌ No events found for Ligue 1');
      return;
    }

    console.log(`✅ Found ${ligue1Events.length} Ligue 1 events`);
    ligue1Events.forEach((e, idx) => {
      console.log(`   ${idx + 1}. Event ${e.event_id}`);
      console.log(`      Date: ${e.event_date}`);
      console.log(`      Teams: ${e.home_team_id} vs ${e.away_team_id}`);
    });

    // STEP 3: Check if events exist in fixtures view
    console.log('\n\nSTEP 3: Checking fixtures view');
    console.log('-'.repeat(80));

    const eventIds = ligue1Events.map(e => e.event_id);
    const { data: fixturesData } = await supabaseAdmin
      .from('fixtures')
      .select('*')
      .in('id', eventIds);

    if (!fixturesData || fixturesData.length === 0) {
      console.log('❌ No fixtures found in fixtures view for these event IDs');
      console.log('   This could mean the VIEW is broken!');
      return;
    }

    console.log(`✅ Found ${fixturesData.length} fixtures in view`);
    fixturesData.forEach((f, idx) => {
      console.log(`   ${idx + 1}. Fixture ID: ${f.id}`);
      console.log(`      League ID: ${f.league_id}`);
    });

    // STEP 4: Check opening_closing_observed raw data
    console.log('\n\nSTEP 4: Checking opening_closing_observed raw data');
    console.log('-'.repeat(80));

    const { data: rawOdds } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('*')
      .eq('league_slug', 'france-ligue-1')
      .limit(3);

    if (!rawOdds || rawOdds.length === 0) {
      console.log('❌ No odds found in opening_closing_observed for Ligue 1');
      return;
    }

    console.log(`✅ Found ${rawOdds.length} raw odds`);
    rawOdds.forEach((odd, idx) => {
      console.log(`\n   ${idx + 1}. Raw odd:`);
      console.log(`      Event ID: ${odd.event_id}`);
      console.log(`      Market name (raw): ${odd.market_name}`);
      console.log(`      Selection (raw): ${odd.selection}`);
      console.log(`      Line: ${odd.line}`);
      console.log(`      Opening price: ${odd.opening_price_observed}`);
    });

    // STEP 5: Test normalization
    console.log('\n\nSTEP 5: Testing normalization functions');
    console.log('-'.repeat(80));

    if (rawOdds && rawOdds.length > 0) {
      const odd = rawOdds[0];
      const normalizedMarketKey = normalizeMarketKey(odd.market_name);
      const normalizedOutcomeName = normalizeOutcomeName(odd.selection);

      console.log(`✅ Normalization test:`);
      console.log(`   Market name: "${odd.market_name}" → "${normalizedMarketKey}"`);
      console.log(`   Selection: "${odd.selection}" → "${normalizedOutcomeName}"`);
    }

    // STEP 6: Check markets_v2
    console.log('\n\nSTEP 6: Checking markets_v2 for needed markets');
    console.log('-'.repeat(80));

    const { data: allMarkets } = await supabaseAdmin
      .from('markets_v2')
      .select('*');

    if (!allMarkets || allMarkets.length === 0) {
      console.log('❌ No markets found in markets_v2');
      return;
    }

    console.log(`✅ Found ${allMarkets.length} markets total`);

    // Get unique market keys from raw odds
    if (rawOdds && rawOdds.length > 0) {
      const uniqueMarketKeys = new Set(rawOdds.map(o => normalizeMarketKey(o.market_name)));
      console.log(`   Markets needed for these odds: ${Array.from(uniqueMarketKeys).join(', ')}`);

      uniqueMarketKeys.forEach(marketKey => {
        const market = allMarkets.find(m => m.oddsapi_key === marketKey);
        if (market) {
          console.log(`   ✅ Market "${marketKey}" exists (ID: ${market.id})`);
        } else {
          console.log(`   ❌ Market "${marketKey}" NOT FOUND!`);
        }
      });
    }

    // STEP 7: Test full join
    console.log('\n\nSTEP 7: Testing full join logic');
    console.log('-'.repeat(80));

    if (rawOdds && rawOdds.length > 0) {
      const odd = rawOdds[0];
      const normalizedMarketKey = normalizeMarketKey(odd.market_name);

      // Simulate the join logic from the endpoint
      const handicapKey = odd.line !== null && odd.line !== undefined
        ? `${normalizedMarketKey}:${odd.line}`
        : normalizedMarketKey;

      console.log(`Testing join for first odd:`);
      console.log(`   Looking for market with key: "${handicapKey}" or "${normalizedMarketKey}"`);

      const matchedMarket = allMarkets.find(m =>
        m.oddsapi_key === normalizedMarketKey ||
        (m.handicap === odd.line && m.oddsapi_key === normalizedMarketKey)
      );

      if (matchedMarket) {
        console.log(`   ✅ Found market: ${matchedMarket.oddsapi_key} (ID: ${matchedMarket.id})`);
        console.log(`      Handicap: ${matchedMarket.handicap}`);

        // Check outcomes
        const { data: outcomes } = await supabaseAdmin
          .from('outcomes_v2')
          .select('*')
          .eq('market_id', matchedMarket.id);

        const normalizedOutcomeName = normalizeOutcomeName(odd.selection);
        if (outcomes) {
          const matchedOutcome = outcomes.find(o => o.normalized_name === normalizedOutcomeName);
          if (matchedOutcome) {
            console.log(`   ✅ Found outcome: "${normalizedOutcomeName}" (ID: ${matchedOutcome.id})`);
          } else {
            console.log(`   ❌ Outcome "${normalizedOutcomeName}" NOT FOUND for this market!`);
            console.log(`      Available outcomes: ${outcomes.map(o => o.normalized_name).join(', ')}`);
          }
        }
      } else {
        console.log(`   ❌ Market not found!`);
      }
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
