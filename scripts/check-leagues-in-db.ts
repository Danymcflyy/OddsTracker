/**
 * Check Leagues in DB
 *
 * Vérifie si les événements et odds de Ligue 1 et Premier League
 * sont correctement en DB
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🔍 Checking Leagues in DB\n');

  try {
    // Check events_to_track
    console.log('📋 EVENTS_TO_TRACK:');

    const { data: plEvents, error: plError } = await supabaseAdmin
      .from('events_to_track')
      .select('event_id, sport_slug, league_slug, home_team_id, away_team_id, event_date')
      .eq('sport_slug', 'football')
      .eq('league_slug', 'england-premier-league')
      .limit(3);

    console.log(`\nPremier League events: ${plEvents?.length || 0}`);
    if (plEvents && plEvents.length > 0) {
      plEvents.forEach(e => {
        console.log(`  - Event ${e.event_id}: ${e.event_date}`);
      });
    }

    const { data: l1Events } = await supabaseAdmin
      .from('events_to_track')
      .select('event_id, sport_slug, league_slug, home_team_id, away_team_id, event_date')
      .eq('sport_slug', 'football')
      .eq('league_slug', 'france-ligue-1')
      .limit(3);

    console.log(`\nLigue 1 events: ${l1Events?.length || 0}`);
    if (l1Events && l1Events.length > 0) {
      l1Events.forEach(e => {
        console.log(`  - Event ${e.event_id}: ${e.event_date}`);
      });
    }

    // Check opening_closing_observed
    console.log('\n\n📊 OPENING_CLOSING_OBSERVED:');

    const { data: plOdds } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('event_id, market_name, selection, line, opening_price_observed')
      .eq('sport_slug', 'football')
      .eq('league_slug', 'england-premier-league')
      .limit(5);

    console.log(`\nPremier League odds: ${plOdds?.length || 0}`);
    if (plOdds && plOdds.length > 0) {
      plOdds.forEach(o => {
        console.log(`  - Event ${o.event_id}: ${o.market_name}:${o.selection}:${o.line} = ${o.opening_price_observed}`);
      });
    }

    const { data: l1Odds } = await supabaseAdmin
      .from('opening_closing_observed')
      .select('event_id, market_name, selection, line, opening_price_observed')
      .eq('sport_slug', 'football')
      .eq('league_slug', 'france-ligue-1')
      .limit(5);

    console.log(`\nLigue 1 odds: ${l1Odds?.length || 0}`);
    if (l1Odds && l1Odds.length > 0) {
      l1Odds.forEach(o => {
        console.log(`  - Event ${o.event_id}: ${o.market_name}:${o.selection}:${o.line} = ${o.opening_price_observed}`);
      });
    }

    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
