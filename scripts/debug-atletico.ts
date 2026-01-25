
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function debugAtleticoMallorca() {
  const matchHome = "Atlético Madrid";
  const matchAway = "Mallorca";
  
  console.log(`🔍 Checking Opening Odds for ${matchHome} vs ${matchAway}...
`);

  // 1. Find the event
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('id, home_team, away_team, commence_time')
    .ilike('home_team', `%${matchHome}%`)
    .ilike('away_team', `%${matchAway}%`)
    .limit(1);

  if (eventError || !events || events.length === 0) {
    console.error("❌ Event not found", eventError?.message);
    return;
  }

  const event = events[0];
  console.log(`Match Found: ${event.home_team} vs ${event.away_team} (ID: ${event.id})`);
  console.log(`Commence Time: ${event.commence_time}`);

  // 2. Check Closing Odds (Final table)
  const { data: closing, error: closingError } = await supabase
    .from('closing_odds')
    .select('*')
    .eq('event_id', event.id);

  if (closingError) {
    console.error("❌ Error fetching closing_odds:", closingError.message);
  } else if (!closing || closing.length === 0) {
    console.log("❌ No entry in 'closing_odds' table (Finalized odds)");
  } else {
    console.log("✅ Found entry in 'closing_odds':");
    console.log(JSON.stringify(closing[0], null, 2));
  }

  // 3. Check Snapshots (Real-time capture)
  const { data: snapshots, error: snapError } = await supabase
    .from('closing_odds_snapshots')
    .select('*')
    .eq('event_id', event.id)
    .order('captured_at', { ascending: false });

  if (snapError) {
    console.error("❌ Error fetching snapshots:", snapError.message);
  } else if (!snapshots || snapshots.length === 0) {
    console.log("❌ No snapshots found in 'closing_odds_snapshots'");
  } else {
    console.log(`✅ Found ${snapshots.length} snapshots:`);
    snapshots.forEach(s => {
        console.log(`   - [M${s.minutes_before_kickoff}] Captured at ${s.captured_at}`);
        console.log(`     Markets: ${Object.keys(s.markets).join(', ')}`);
        if (s.markets_variations) {
            console.log(`     Variations: ${Object.keys(s.markets_variations).join(', ')}`);
        }
    });
  }
}

debugAtleticoMallorca();
