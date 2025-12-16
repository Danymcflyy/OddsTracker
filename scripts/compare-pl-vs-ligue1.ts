/**
 * Compare Premier League vs Ligue 1
 *
 * Compare EXACTEMENT la structure des données entre
 * Premier League (qui fonctionne) et Ligue 1 (qui ne fonctionne pas)
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function analyzeLeague(leagueName: string, leagueSlug: string) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 ${leagueName.toUpperCase()}`);
  console.log('='.repeat(80));

  // Get one event
  const { data: events } = await supabaseAdmin
    .from('events_to_track')
    .select('event_id, home_team_id, away_team_id, event_date')
    .eq('league_slug', leagueSlug)
    .limit(1);

  if (!events || events.length === 0) {
    console.log('❌ No events found');
    return;
  }

  const event = events[0];
  console.log(`\n✅ Event ID: ${event.event_id}`);
  console.log(`   Date: ${event.event_date}`);

  // Get teams
  const { data: homeTeam } = await supabaseAdmin
    .from('teams_v2')
    .select('display_name, normalized_name')
    .eq('id', event.home_team_id)
    .single();

  const { data: awayTeam } = await supabaseAdmin
    .from('teams_v2')
    .select('display_name, normalized_name')
    .eq('id', event.away_team_id)
    .single();

  console.log(`   Match: ${homeTeam?.display_name} vs ${awayTeam?.display_name}`);

  // Get ALL odds for this event
  const { data: odds } = await supabaseAdmin
    .from('opening_closing_observed')
    .select('market_name, selection, line, opening_price_observed')
    .eq('event_id', event.event_id);

  if (!odds || odds.length === 0) {
    console.log('\n❌ NO ODDS FOUND FOR THIS EVENT!');
    return;
  }

  console.log(`\n✅ Found ${odds.length} odds for this event`);

  // Group by market_name
  const byMarket = new Map();
  odds.forEach((odd: any) => {
    if (!byMarket.has(odd.market_name)) {
      byMarket.set(odd.market_name, []);
    }
    byMarket.get(odd.market_name).push(odd);
  });

  console.log(`\n📋 Odds by market:`);
  byMarket.forEach((marketOdds, marketName) => {
    console.log(`\n   ${marketName} (${marketOdds.length} odds):`);
    marketOdds.slice(0, 5).forEach((odd: any) => {
      const lineStr = odd.line !== null ? ` [line: ${odd.line}]` : '';
      console.log(`      ${odd.selection}${lineStr}: ${odd.opening_price_observed}`);
    });
  });

  // Check what markets exist in markets_v2 for these odds
  console.log(`\n\n🔍 Checking markets_v2 for these market_names...`);

  const uniqueMarketNames = [...byMarket.keys()];
  for (const marketName of uniqueMarketNames) {
    const { data: markets } = await supabaseAdmin
      .from('markets_v2')
      .select('id, oddsapi_key, handicap')
      .eq('oddsapi_key', marketName);

    if (!markets || markets.length === 0) {
      console.log(`   ❌ NO MARKET IN markets_v2 for "${marketName}"`);
    } else {
      console.log(`   ✅ Market "${marketName}" exists:`);
      markets.forEach((m: any) => {
        const hcp = m.handicap !== null ? `handicap: ${m.handicap}` : 'handicap: null';
        console.log(`      - ${hcp}`);
      });

      // Check if specific lines match
      const marketOdds = byMarket.get(marketName);
      const uniqueLines = [...new Set(marketOdds.map((o: any) => o.line))];
      console.log(`   📊 Lines in odds: ${uniqueLines.map(l => l === null ? 'null' : l).join(', ')}`);

      // Check matching
      const existingHandicaps = new Set(markets.map((m: any) => m.handicap));
      uniqueLines.forEach(line => {
        if (!existingHandicaps.has(line)) {
          console.log(`      ⚠️  MISSING: ${marketName} with handicap=${line}`);
        }
      });
    }
  }
}

async function main() {
  console.log('\n🔍 COMPARING PREMIER LEAGUE (works) vs LIGUE 1 (broken)\n');

  await analyzeLeague('Premier League', 'england-premier-league');
  await analyzeLeague('Ligue 1', 'france-ligue-1');

  console.log('\n');
}

main();
