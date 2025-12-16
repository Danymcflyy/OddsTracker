
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or service role key not provided in .env.local file. Please create a .env.local file and add your credentials.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugLigue1Join() {
  try {
    console.log('--- Debugging Ligue 1 Join Issue ---');

    // 1. Check for 'france-ligue-1' in leagues_v2
    console.log('\n1. Checking for "france-ligue-1" in leagues_v2 table...');
    const { data: leagueData, error: leagueError } = await supabase
      .from('leagues_v2')
      .select('id, oddsapi_slug, name')
      .eq('oddsapi_slug', 'france-ligue-1');

    if (leagueError) throw leagueError;

    if (leagueData && leagueData.length > 0) {
      console.log('  Found entry for "france-ligue-1":', leagueData[0]);
    } else {
      console.log('  NO entry found for "france-ligue-1" in leagues_v2 table.');
    }

    // 2. Get distinct league_slugs from events_to_track and their counts
    console.log('\n2. Distinct league_slugs and counts from events_to_track:');
    const { data: eventSlugs, error: eventSlugsError } = await supabase
      .from('events_to_track')
      .select('league_slug');

    if (eventSlugsError) throw eventSlugsError;

    const slugCounts = new Map<string | null, number>();
    for (const event of eventSlugs) {
      const slug = event.league_slug;
      slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
    }
    slugCounts.forEach((count, slug) => {
      console.log(`  - ${slug === null ? 'NULL' : slug}: ${count}`);
    });

    // 3. Query the 'fixtures' view for events with league_slug = 'france-ligue-1'
    console.log('\n3. Querying "fixtures" view for events with events_to_track.league_slug = "france-ligue-1":');
    const { data: fixtureViewData, error: fixtureViewError } = await supabase
      .from('fixtures') // Assuming 'fixtures' view is directly queryable via Supabase client
      .select('id, oddspapi_id, league_id') // id here is event_id from events_to_track
      .eq('league_id', leagueData && leagueData.length > 0 ? leagueData[0].id : null); // Attempt to use the found league_id

    if (fixtureViewError) {
        console.warn('  Warning: Could not query "fixtures" view directly with league_id, trying different approach if needed. Error:', fixtureViewError.message);
        // Fallback: If direct query by league_id doesn't work, try to find events with NULL league_id
        console.log('  Attempting to find fixtures with NULL league_id from events originally matching "france-ligue-1" slug.');

        const { data: nullLeagueIdFixtures, error: nullLeagueIdError } = await supabase
            .from('fixtures')
            .select('id, oddspapi_id, league_id')
            .is('league_id', null);

        if (nullLeagueIdError) throw nullLeagueIdError;

        console.log(`  Found ${nullLeagueIdFixtures?.length || 0} fixtures with NULL league_id.`);
        // Filter these further if we can. This is getting complex without direct SQL.
        // For now, just report the count.
    } else {
        console.log(`  Found ${fixtureViewData?.length || 0} fixtures where league_id IS NOT NULL and matches 'france-ligue-1' league_id.`);
        if (fixtureViewData && fixtureViewData.length > 0) {
            console.log('  Example fixture:', fixtureViewData[0]);
        }
    }


    console.log('\n--- Debugging Complete ---');

  } catch (error) {
    console.error('An error occurred during debugging:', error);
  }
}

debugLigue1Join();
