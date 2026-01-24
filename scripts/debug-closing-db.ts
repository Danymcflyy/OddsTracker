
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function debugClosingOdds() {
  console.log("🔍 Debugging Closing Odds in Database...\n");

  // Get the most recent closing odds entry
  const { data: closingEntries, error } = await supabase
    .from('closing_odds')
    .select(
      `
      id,
      event_id,
      markets,
      markets_variations,
      captured_at,
      events (
        home_team,
        away_team,
        commence_time
      )
    `
    )
    .order('captured_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("❌ Error fetching closing_odds:", error.message);
    return;
  }

  if (!closingEntries || closingEntries.length === 0) {
    console.log("⚠️ No closing odds found in database.");
    return;
  }

  console.log(`Found ${closingEntries.length} recent closing odds entries.\n`);

  for (const entry of closingEntries) {
    const eventName = entry.events ? `${entry.events.home_team} vs ${entry.events.away_team}` : 'Unknown Event';
    console.log(`=== Entry ID: ${entry.id} (${eventName}) ===`);
    console.log(`Captured At: ${entry.captured_at}`);
    
    // Check 'markets' column
    const marketKeys = entry.markets ? Object.keys(entry.markets) : [];
    console.log(`Markets present: ${marketKeys.join(', ')}`);

    // Check specific markets content
    if (entry.markets) {
        if (entry.markets.spreads) {
            console.log("  -> Spreads (Main):", JSON.stringify(entry.markets.spreads));
        } else {
            console.log("  -> Spreads (Main): NOT FOUND");
        }
        if (entry.markets.totals) {
            console.log("  -> Totals (Main):", JSON.stringify(entry.markets.totals));
        } else {
            console.log("  -> Totals (Main): NOT FOUND");
        }
    }

    // Check 'markets_variations' column
    const variationKeys = entry.markets_variations ? Object.keys(entry.markets_variations) : [];
    console.log(`Variations present: ${variationKeys.join(', ')}`);

    if (entry.markets_variations) {
        if (entry.markets_variations.spreads) {
            console.log(`  -> Spreads Variations: Found ${entry.markets_variations.spreads.length} entries`);
            console.log("     First 2 variations:", JSON.stringify(entry.markets_variations.spreads.slice(0, 2), null, 2));
        }
        if (entry.markets_variations.totals) {
            console.log(`  -> Totals Variations: Found ${entry.markets_variations.totals.length} entries`);
            console.log("     First 2 variations:", JSON.stringify(entry.markets_variations.totals.slice(0, 2), null, 2));
        }
    }
    console.log("\n--------------------------------------------------\n");
  }
}

debugClosingOdds();
