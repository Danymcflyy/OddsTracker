import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Import supabaseAdmin AFTER dotenv
const { supabaseAdmin } = require('../lib/supabase/admin');

async function main() {
  console.log('--- DIAGNOSTIC SPREADS (SUNDERLAND & J LEAGUE) ---');

  // 1. Chercher le match de Sunderland
  const { data: sunderlandEvents, error: err1 } = await supabaseAdmin
    .from('events')
    .select('id, home_team, away_team, commence_time')
    .ilike('home_team', '%Sunderland%')
    .ilike('away_team', '%Manchester%')
    .order('commence_time', { ascending: false })
    .limit(1);

  if (err1) console.error('Erreur Sunderland:', err1);

  if (sunderlandEvents && sunderlandEvents.length > 0) {
    const event = sunderlandEvents[0];
    console.log(`\n⚽ Match: ${event.home_team} vs ${event.away_team} [${event.id}]`);
    
    const { data: markets } = await supabaseAdmin
      .from('market_states')
      .select('status, opening_odds_variations')
      .eq('event_id', event.id)
      .eq('market_key', 'spreads');

    if (markets && markets.length > 0) {
      console.log(`Status spreads: ${markets[0].status}`);
      console.log('Variations enregistrées:');
      console.log(JSON.stringify(markets[0].opening_odds_variations, null, 2));
    } else {
      console.log('Aucun marché spreads trouvé pour ce match.');
    }
  } else {
    console.log('\n❌ Match Sunderland vs Manchester non trouvé.');
  }

  // 2. Chercher un match de la J League aujourd'hui
  const today = '2026-05-10';
  const { data: jleagueEvents, error: err2 } = await supabaseAdmin
    .from('events')
    .select('id, home_team, away_team, commence_time')
    .ilike('sport_key', '%soccer_japan_j_league%')
    .gte('commence_time', today)
    .order('commence_time')
    .limit(1);

  if (err2) console.error('Erreur J League:', err2);

  if (jleagueEvents && jleagueEvents.length > 0) {
    const event = jleagueEvents[0];
    console.log(`\n⚽ Match J League: ${event.home_team} vs ${event.away_team} [${event.id}]`);
    
    const { data: markets } = await supabaseAdmin
      .from('market_states')
      .select('status, opening_odds_variations')
      .eq('event_id', event.id)
      .eq('market_key', 'spreads');

    if (markets && markets.length > 0) {
      console.log(`Status spreads: ${markets[0].status}`);
      console.log('Variations enregistrées:');
      console.log(JSON.stringify(markets[0].opening_odds_variations, null, 2));
    } else {
      console.log('Aucun marché spreads trouvé pour ce match.');
    }
  } else {
    console.log('\n❌ Aucun match J League trouvé aujourd\'hui.');
  }
}

main().catch(console.error);
