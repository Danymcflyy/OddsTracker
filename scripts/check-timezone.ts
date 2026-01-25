
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkTimezone() {
  console.log("🔍 Checking Timezone & Event Selection...\n");

  // 1. Check DB Time
  const { data: dbTime, error: timeError } = await supabase.rpc('get_db_time'); // We might need to create this RPC or just select now()
  
  // Alternative: select now() directly via SQL query if possible, or just insert/select
  // Let's try to select a known recent event and compare times
  
  const now = new Date();
  console.log(`🖥️  Script Local Time: ${now.toString()}`);
  console.log(`🌎  Script UTC Time:   ${now.toISOString()}`);

  // 2. Fetch upcoming events near now (broad window +/- 24h)
  const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  console.log(`\n📅 Searching events between:\n   ${windowStart}\n   ${windowEnd}\n`);

  const { data: events, error } = await supabase
    .from('events')
    .select('id, home_team, away_team, commence_time, status')
    .gte('commence_time', windowStart)
    .lte('commence_time', windowEnd)
    .order('commence_time', { ascending: true })
    .limit(10);

  if (error) {
    console.error("❌ DB Error:", error.message);
    return;
  }

  console.log(`📊 Found ${events.length} events in broad window:`);
  events.forEach(e => {
    const eventDate = new Date(e.commence_time);
    const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    console.log(`   - ${e.home_team} vs ${e.away_team}`);
    console.log(`     DB Time: ${e.commence_time}`);
    console.log(`     Diff:    ${diffHours.toFixed(2)} hours from now`);
    console.log(`     Status:  ${e.status}`);
    console.log("");
  });
}

checkTimezone();
