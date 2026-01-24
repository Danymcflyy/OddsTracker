import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Récupérer un événement Lille vs Strasbourg
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id,
      home_team,
      away_team,
      commence_time,
      market_states!left(market_key, status, opening_odds),
      closing_odds!left(markets)
    `)
    .ilike('home_team', '%Lille%')
    .ilike('away_team', '%Strasbourg%')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!events || events.length === 0) {
    console.log('No event found');
    return;
  }

  const event = events[0];
  console.log('=== EVENT ===');
  console.log(`${event.home_team} vs ${event.away_team}`);
  console.log(`Date: ${event.commence_time}`);
  console.log('');

  console.log('=== MARKET STATES (Opening Odds) ===');
  const marketStates = event.market_states || [];
  console.log(`Total market_states: ${marketStates.length}`);
  for (const ms of marketStates) {
    console.log(`\n--- ${ms.market_key} (${ms.status}) ---`);
    console.log(JSON.stringify(ms.opening_odds, null, 2));
  }

  console.log('\n=== CLOSING ODDS ===');
  const closingOdds = event.closing_odds?.[0];
  if (closingOdds?.markets) {
    console.log(JSON.stringify(closingOdds.markets, null, 2));
  } else {
    console.log('No closing odds');
  }
}

main().catch(console.error);
