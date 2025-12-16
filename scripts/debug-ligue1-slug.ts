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

async function analyzeLeagueSlugs() {
  try {
    console.log('Fetching all league_slugs from events_to_track...');

    const { data, error } = await supabase
      .from('events_to_track')
      .select('league_slug');

    if (error) {
      throw error;
    }

    const slugCounts = new Map<string | null, number>();
    for (const event of data) {
      const slug = event.league_slug;
      slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
    }

    console.log('\n--- Distinct league_slugs and their counts in events_to_track ---');
    slugCounts.forEach((count, slug) => {
      console.log(`- ${slug === null ? 'NULL' : slug}: ${count}`);
    });
    console.log('-----------------------------------------------------------------');

  } catch (error) {
    console.error('Error analyzing league slugs:', error);
  }
}

analyzeLeagueSlugs();