import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { supabaseAdmin } = require('../lib/supabase/admin');

async function main() {
  const { data: events } = await (supabaseAdmin as any)
    .from('events')
    .select('id, home_team, away_team, commence_time')
    .ilike('home_team', '%Sunderland%')
    .ilike('away_team', '%Manchester%')
    .order('commence_time', { ascending: false })
    .limit(1);

  if (!events || events.length === 0) {
    console.log('Match non trouvé.');
    return;
  }

  const event = events[0];
  console.log(`Match: ${event.home_team} vs ${event.away_team} [${event.id}]`);

  const { data: markets } = await (supabaseAdmin as any)
    .from('market_states')
    .select('*')
    .eq('event_id', event.id);

  console.log('\nMarchés trouvés:');
  markets.forEach((m: any) => {
    if (m.market_key === 'spreads') {
      console.log(`Key: ${m.market_key} | Status: ${m.status}`);
      console.log(`Opening Odds: ${JSON.stringify(m.opening_odds)}`);
      console.log(`Variations: ${JSON.stringify(m.opening_odds_variations)}`);
    }
  });
}

main().catch(console.error);
