import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function check() {
  // Test la requête complète comme le frontend
  const { data, error } = await supabase
    .from('events')
    .select(`
      id,
      home_team,
      away_team,
      market_states!left(
        market_key,
        opening_odds
      ),
      closing_odds!left(
        markets,
        captured_at
      )
    `)
    .ilike('home_team', '%Galatasaray%')
    .limit(1);

  if (error) {
    console.error('Erreur:', error.message);
    return;
  }

  console.log('=== RÉSULTAT REQUÊTE FRONTEND ===');
  console.log(JSON.stringify(data, null, 2));
}

check();
