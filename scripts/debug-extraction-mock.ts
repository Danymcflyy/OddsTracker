
import { MarketOdds } from '@/lib/db/types';

// COPY OF FUNCTION FROM lib/services/theoddsapi/closing-odds.ts
function extractMarketOdds(market: any, homeTeam?: string, awayTeam?: string): MarketOdds {
  const odds: MarketOdds = {
    last_update: market.last_update,
  };

  console.log(`\n--- Extracting for market: ${market.key} ---`);
  console.log(`Home Team Expected: '${homeTeam}'`);
  console.log(`Away Team Expected: '${awayTeam}'`);

  for (const outcome of market.outcomes || []) {
    const name = outcome.name.toLowerCase();
    const nameOriginal = outcome.name;
    
    console.log(`Outcome: '${nameOriginal}' (lower: '${name}')`);

    // Check for team names first (for h2h, spreads, etc.)
    if (homeTeam && nameOriginal === homeTeam) {
      console.log('  -> Match Home Team (Exact)');
      odds.home = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
    } else if (awayTeam && nameOriginal === awayTeam) {
      console.log('  -> Match Away Team (Exact)');
      odds.away = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
    } else if (name.includes('home')) {
      console.log('  -> Match "home" keyword');
      odds.home = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
    } else if (name.includes('away')) {
      console.log('  -> Match "away" keyword');
      odds.away = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
    } else if (name.includes('draw') || name.includes('tie')) {
      console.log('  -> Match Draw');
      odds.draw = outcome.price;
    } else if (name.includes('over')) {
      console.log('  -> Match Over');
      odds.over = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
    } else if (name.includes('under')) {
      console.log('  -> Match Under');
      odds.under = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
    } else {
      console.log('  -> NO MATCH');
    }
  }

  return odds;
}

async function run() {
  const homeTeam = "Manchester City";
  const awayTeam = "Arsenal";

  const mockH2H = {
    key: 'h2h',
    last_update: '2026-01-24T10:00:00Z',
    outcomes: [
      { name: 'Manchester City', price: 1.80 },
      { name: 'Arsenal', price: 4.20 },
      { name: 'Draw', price: 3.90 }
    ]
  };

  const mockSpreads = {
    key: 'spreads',
    last_update: '2026-01-24T10:00:00Z',
    outcomes: [
      { name: 'Manchester City', price: 1.95, point: -0.5 },
      { name: 'Arsenal', price: 1.95, point: 0.5 }
    ]
  };

  // Case mismatch scenario
  const mockSpreadsMismatch = {
    key: 'spreads_mismatch',
    last_update: '2026-01-24T10:00:00Z',
    outcomes: [
      { name: 'manchester city', price: 1.95, point: -0.5 }, // lowercase
      { name: 'Arsenal ', price: 1.95, point: 0.5 } // trailing space
    ]
  };

  console.log("Testing H2H:");
  console.log(JSON.stringify(extractMarketOdds(mockH2H, homeTeam, awayTeam), null, 2));

  console.log("\nTesting Spreads (Exact Match):");
  console.log(JSON.stringify(extractMarketOdds(mockSpreads, homeTeam, awayTeam), null, 2));

  console.log("\nTesting Spreads (Mismatch):");
  console.log(JSON.stringify(extractMarketOdds(mockSpreadsMismatch, homeTeam, awayTeam), null, 2));
}

run();
