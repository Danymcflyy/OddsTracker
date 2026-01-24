
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function debugOpeningOdds() {
  const matchHome = "Auxerre";
  const matchAway = "Paris Saint Germain";
  
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

  // 2. Check market_states (Opening Odds)
  const { data: marketStates, error: msError } = await supabase
    .from('market_states')
    .select('*')
    .eq('event_id', event.id);

  if (msError) {
    console.error("❌ Error fetching market_states:", msError.message);
    return;
  }

  console.log(`Found ${marketStates.length} market states (opening lines).
`);

  for (const ms of marketStates) {
    console.log(`=== Market: ${ms.market_key} (Status: ${ms.status}) ===`);
    console.log(`Captured At: ${ms.opening_captured_at}`);
    
    if (ms.opening_odds) {
        console.log("  -> Main Line:", JSON.stringify(ms.opening_odds));
    } else {
        console.log("  -> Main Line: MISSING");
    }

    if (ms.opening_odds_variations && Array.isArray(ms.opening_odds_variations)) {
        console.log(`  -> Variations: Found ${ms.opening_odds_variations.length} entries`);
        if (ms.opening_odds_variations.length > 0) {
            console.log("     Sample variation:", JSON.stringify(ms.opening_odds_variations[0]));
        }
    } else {
        console.log("  -> Variations: NONE");
    }
    console.log("");
  }
}

debugOpeningOdds();
