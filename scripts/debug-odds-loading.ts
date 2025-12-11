import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🔍 Debugging odds loading...\n');

  // 1. Check if events_to_track exist
  console.log('1️⃣  Checking events_to_track:');
  const { data: events, error: eventsError } = await supabaseAdmin
    .from('events_to_track')
    .select('event_id, home_team_id, away_team_id')
    .limit(1);

  if (eventsError) {
    console.log(`   ❌ Error: ${eventsError.message}`);
  } else {
    console.log(`   ✅ Found ${events?.length || 0} events`);
    if (events && events.length > 0) {
      console.log(`   Sample: event_id=${events[0].event_id}, home_team_id=${events[0].home_team_id}`);
    }
  }

  // 2. Check if opening_closing_observed exist
  console.log('\n2️⃣  Checking opening_closing_observed:');
  const { data: odds, error: oddsError } = await supabaseAdmin
    .from('opening_closing_observed')
    .select('event_id, market_name, selection, opening_price_observed')
    .limit(5);

  if (oddsError) {
    console.log(`   ❌ Error: ${oddsError.message}`);
  } else {
    console.log(`   ✅ Found ${odds?.length || 0} odds`);
    if (odds && odds.length > 0) {
      odds.forEach(o => {
        console.log(`   - event_id=${o.event_id}, market=${o.market_name}, selection=${o.selection}, price=${o.opening_price_observed}`);
      });
    }
  }

  // 3. Check if markets_v2 exist
  console.log('\n3️⃣  Checking markets_v2:');
  const { data: markets, error: marketsError } = await supabaseAdmin
    .from('markets_v2')
    .select('id, oddsapi_key, market_type')
    .limit(5);

  if (marketsError) {
    console.log(`   ❌ Error: ${marketsError.message}`);
  } else {
    console.log(`   ✅ Found ${markets?.length || 0} markets`);
    if (markets && markets.length > 0) {
      markets.forEach(m => {
        console.log(`   - oddsapi_key="${m.oddsapi_key}", market_type="${m.market_type}"`);
      });
    }
  }

  // 4. Check data in fixtures view
  console.log('\n4️⃣  Checking fixtures view:');
  const { data: fixtures, error: fixturesError } = await supabaseAdmin
    .from('fixtures')
    .select('id')
    .limit(1);

  if (fixturesError) {
    console.log(`   ❌ Error: ${fixturesError.message}`);
  } else {
    console.log(`   ✅ Found ${fixtures?.length || 0} fixtures in view`);
  }

  console.log('\n');
}

main().catch(error => {
  console.error('💥 Error:', error);
  process.exit(1);
});
