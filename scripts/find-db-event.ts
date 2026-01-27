import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔍 Searching for completed events in DB...\n');

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('completed', true)
    .order('commence_time', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!events || events.length === 0) {
    console.log('No completed events found in DB.');
    return;
  }

  console.log(`Found ${events.length} completed events:`);
  events.forEach(e => {
    console.log(`- [${e.sport_key}] ${e.home_team} vs ${e.away_team}`);
    console.log(`  ID: ${e.id}`);
    console.log(`  API ID: ${e.api_event_id}`);
    console.log(`  Time: ${e.commence_time}`);
    console.log('-------------------');
  });
}

run();
