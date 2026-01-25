import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function debugClosingForRecent() {
  const matches = [
    { home: "Le Havre", away: "AS Monaco" },
    { home: "Marseille", away: "RC Lens" },
    { home: "Rennes", away: "Lorient" } // You mentioned this one
  ];

  console.log(`🔍 Checking Closing Odds for recent matches...\n`);

  for (const match of matches) {
    console.log(`--------------------------------------------------`);
    console.log(`Match: ${match.home} vs ${match.away}`);

    // 1. Find the event
    const { data: events, error: eventError } = await supabase
      .from('events')
      .select('id, home_team, away_team, commence_time, status, closing_odds(id, captured_at, markets, markets_variations)')
      .ilike('home_team', `%${match.home}%`)
      .ilike('away_team', `%${match.away}%`)
      .limit(1);

    if (eventError) {
      console.error("  ❌ DB Error finding event:", eventError.message);
      continue;
    }

    if (!events || events.length === 0) {
      console.log("  ⚠️ Event not found in DB");
      continue;
    }

    const event = events[0];
    console.log(`  ✅ Found Event ID: ${event.id}`);
    console.log(`     Status: ${event.status}`);
    console.log(`     Date: ${event.commence_time}`);

    // 2. Check closing_odds directly
    if (event.closing_odds && event.closing_odds.length > 0) {
      const closing = event.closing_odds[0];
      console.log(`  ✅ Closing Odds Record Found (ID: ${closing.id})`);
      console.log(`     Captured At: ${closing.captured_at}`);
      
      const marketKeys = closing.markets ? Object.keys(closing.markets) : [];
      console.log(`     Markets Present: ${marketKeys.join(', ') || 'NONE'}`);

      const variationKeys = closing.markets_variations ? Object.keys(closing.markets_variations) : [];
      console.log(`     Variations Present: ${variationKeys.join(', ') || 'NONE'}`);
    } else {
      console.log("  ❌ NO Closing Odds Record in 'closing_odds' table");
    }

    // 3. Check closing_odds_snapshots (maybe it was captured but not finalized?)
    const { data: snapshots, error: snapError } = await supabase
        .from('closing_odds_snapshots')
        .select('id, captured_at, minutes_before_kickoff, is_selected')
        .eq('event_id', event.id)
        .order('captured_at', { ascending: false });

    if (snapshots && snapshots.length > 0) {
        console.log(`  ℹ️  Snapshots Found: ${snapshots.length}`);
        snapshots.forEach(s => {
            console.log(`      - [${s.is_selected ? 'SELECTED' : '   '}] M${s.minutes_before_kickoff} (${s.captured_at})`);
        });
    } else {
        console.log("  ℹ️  No Snapshots found");
    }
    
    console.log("");
  }
}

debugClosingForRecent();
