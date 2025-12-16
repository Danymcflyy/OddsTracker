
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or service role key not provided in .env file. Please create a .env file and add your credentials.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const INCORRECT_SLUG = 'ligue-1-uber-eats';
const CORRECT_SLUG = 'france-ligue-1';

async function fixLigue1Slug() {
  try {
    console.log(`Searching for events with the incorrect slug: "${INCORRECT_SLUG}"`);

    const { data: events, error: selectError } = await supabase
      .from('events_to_track')
      .select('event_id, league_slug')
      .eq('league_slug', INCORRECT_SLUG);

    if (selectError) {
      throw selectError;
    }

    if (!events || events.length === 0) {
      console.log('No events found with the incorrect slug. No updates needed.');
      return;
    }

    console.log(`Found ${events.length} events to update.`);

    const { error: updateError } = await supabase
      .from('events_to_track')
      .update({ league_slug: CORRECT_SLUG })
      .eq('league_slug', INCORRECT_SLUG);

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully updated ${events.length} events to use the correct slug: "${CORRECT_SLUG}"`);

  } catch (error) {
    console.error('Error fixing Ligue 1 slugs:', error);
  }
}

fixLigue1Slug();
