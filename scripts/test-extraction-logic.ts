import { getTheOddsApiClient } from '../lib/api/theoddsapi';

// Copy the extraction function to test it
function extractOddsFromMarket(
  market: any,
  homeTeam: string,
  awayTeam: string
): any[] {
  if (!market.outcomes || market.outcomes.length === 0) {
    return [];
  }

  const homeTeamLower = homeTeam.toLowerCase();
  const awayTeamLower = awayTeam.toLowerCase();

  // For alternate markets, group outcomes by point value
  const isAlternateMarket = market.key.includes('alternate_');

  if (isAlternateMarket) {
    // Group outcomes by point
    const byPoint = new Map<number, any[]>();

    for (const outcome of market.outcomes) {
      const point = outcome.point ?? 0;
      if (!byPoint.has(point)) {
        byPoint.set(point, []);
      }
      byPoint.get(point)!.push(outcome);
    }

    // Create one OpeningOdds per point
    const results: any[] = [];

    for (const [point, outcomes] of byPoint.entries()) {
      const odds: any = { point };

      for (const outcome of outcomes) {
        const name = outcome.name.toLowerCase();

        if (name === homeTeamLower) {
          odds.home = outcome.price;
        } else if (name === awayTeamLower) {
          odds.away = outcome.price;
        } else if (name.includes('over')) {
          odds.over = outcome.price;
        } else if (name.includes('under')) {
          odds.under = outcome.price;
        }
      }

      if (Object.keys(odds).length > 1) { // More than just 'point'
        results.push(odds);
      }
    }

    return results;
  } else {
    // Regular market (h2h) - single odds object
    const odds: any = {};

    for (const outcome of market.outcomes) {
      const name = outcome.name.toLowerCase();

      if (name === homeTeamLower) {
        odds.home = outcome.price;
      } else if (name === awayTeamLower) {
        odds.away = outcome.price;
      } else if (name.includes('draw') || name.includes('tie')) {
        odds.draw = outcome.price;
      } else if (name.includes('over')) {
        odds.over = outcome.price;
        if (outcome.point !== undefined) odds.point = outcome.point;
      } else if (name.includes('under')) {
        odds.under = outcome.price;
        if (outcome.point !== undefined) odds.point = outcome.point;
      }
    }

    return Object.keys(odds).length > 0 ? [odds] : [];
  }
}

async function main() {
  const client = getTheOddsApiClient();

  console.log('\n🧪 TEST: Logique d\'Extraction des Cotes\n');

  // Get one soccer event
  const { data: events } = await client.getEvents('soccer_uefa_europa_league');

  if (events.length === 0) {
    console.log('❌ Aucun événement trouvé');
    return;
  }

  const event = events[0];
  console.log(`📅 Événement: ${event.home_team} vs ${event.away_team}\n`);

  // Test with alternate markets
  const { data: oddsData } = await client.getEventOdds('soccer_uefa_europa_league', event.id, {
    regions: 'eu',
    markets: 'h2h,alternate_spreads,alternate_totals',
    bookmakers: 'pinnacle',
    oddsFormat: 'decimal',
  });

  if (!oddsData.bookmakers || oddsData.bookmakers.length === 0) {
    console.log('❌ Aucun bookmaker trouvé');
    return;
  }

  const bookmaker = oddsData.bookmakers[0];

  console.log('=' .repeat(80));
  console.log('RÉSULTATS DE L\'EXTRACTION');
  console.log('='.repeat(80) + '\n');

  for (const market of bookmaker.markets) {
    const extracted = extractOddsFromMarket(market, event.home_team, event.away_team);

    console.log(`📊 Market: ${market.key}`);
    console.log(`   Variations extraites: ${extracted.length}\n`);

    if (extracted.length <= 5) {
      // Show all if <= 5
      extracted.forEach((odds, idx) => {
        console.log(`   Variation ${idx + 1}:`);
        console.log(`   ${JSON.stringify(odds, null, 2).split('\n').join('\n   ')}\n`);
      });
    } else {
      // Show first 3 and last 2
      console.log(`   Variation 1:`);
      console.log(`   ${JSON.stringify(extracted[0], null, 2).split('\n').join('\n   ')}\n`);
      console.log(`   Variation 2:`);
      console.log(`   ${JSON.stringify(extracted[1], null, 2).split('\n').join('\n   ')}\n`);
      console.log(`   ... (${extracted.length - 4} variations intermédiaires) ...\n`);
      console.log(`   Variation ${extracted.length - 1}:`);
      console.log(`   ${JSON.stringify(extracted[extracted.length - 2], null, 2).split('\n').join('\n   ')}\n`);
      console.log(`   Variation ${extracted.length}:`);
      console.log(`   ${JSON.stringify(extracted[extracted.length - 1], null, 2).split('\n').join('\n   ')}\n`);
    }
  }

  console.log('=' .repeat(80));
  console.log('RÉSUMÉ');
  console.log('='.repeat(80) + '\n');

  const summary = bookmaker.markets.map((market: any) => {
    const extracted = extractOddsFromMarket(market, event.home_team, event.away_team);
    return {
      market: market.key,
      variations: extracted.length,
    };
  });

  summary.forEach((s: any) => {
    console.log(`  - ${s.market}: ${s.variations} variation(s)`);
  });

  console.log('\n✅ Test terminé');
}

main();
