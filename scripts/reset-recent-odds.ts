
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function resetRecentOdds() {
  console.log("🧹 Resetting odds for 5 recent events...");

  // 1. Get 5 recent upcoming events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, home_team, away_team, sport_key, commence_time')
    .eq('status', 'upcoming')
    .order('created_at', { ascending: false })
    .limit(5);

  if (eventsError || !events || events.length === 0) {
    console.error("❌ Failed to fetch events:", eventsError?.message);
    return;
  }

  console.log(`🎯 Targets (${events.length}):`);
  events.forEach(e => console.log(`   - ${e.home_team} vs ${e.away_team} (${e.commence_time})`));

  const eventIds = events.map(e => e.id);

  // 2. Delete existing market_states
  const { error: deleteError } = await supabase
    .from('market_states')
    .delete()
    .in('event_id', eventIds);

  if (deleteError) {
    console.error("❌ Failed to delete market_states:", deleteError.message);
    return;
  }
  console.log("✅ Deleted old market_states");

  // 3. Re-create pending market_states
  // Using default markets from your settings logic
  const markets = ['h2h', 'spreads', 'totals', 'h2h_h1', 'spreads_h1', 'totals_h1', 'draw_no_bet', 'double_chance'];
  const newStates = [];

  for (const event of events) {
    for (const market of markets) {
      newStates.push({
        event_id: event.id,
        market_key: market,
        status: 'pending',
        attempts: 0,
        deadline: event.commence_time
      });
    }
  }

  const { error: insertError } = await supabase
    .from('market_states')
    .insert(newStates);

  if (insertError) {
    console.error("❌ Failed to re-insert pending states:", insertError.message);
    return;
  }

  console.log(`✅ Re-inserted ${newStates.length} pending market states.`);
  console.log("🚀 Ready for re-scan.");
}

resetRecentOdds();
