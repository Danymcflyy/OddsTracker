/**
 * Config Generator - Parse discovery report and generate config files
 *
 * Usage: npm run generate-config
 *
 * Reads scripts/discovery-report.json and generates:
 * - lib/config/leagues-config.ts
 * - lib/config/markets-config.ts
 * - lib/sync/league-mappings.ts
 */

import "./load-env";
import * as fs from "fs";
import * as path from "path";

interface DiscoveryReport {
  timestamp: string;
  sports: {
    [sport: string]: {
      leagues: {
        [leagueKey: string]: {
          leagueName: string;
          eventCount: number;
          sample_event_id?: number;
          markets?: string[];
          outcomes?: {
            [market: string]: string[];
          };
        };
      };
    };
  };
}

async function main() {
  console.log("📖 Reading discovery report...\n");

  const reportPath = path.join(
    __dirname,
    "discovery-report.json"
  );

  if (!fs.existsSync(reportPath)) {
    console.error(
      "❌ discovery-report.json not found. Run 'npm run discover-odds-api' first."
    );
    process.exit(1);
  }

  const report: DiscoveryReport = JSON.parse(
    fs.readFileSync(reportPath, "utf-8")
  );

  console.log(`📊 Report timestamp: ${report.timestamp}`);
  console.log(`🏈 Football leagues: ${Object.keys(report.sports.Football?.leagues || {}).length}`);
  console.log(`🎾 Tennis tournaments: ${Object.keys(report.sports.Tennis?.leagues || {}).length}`);

  // 1. Generate leagues config
  console.log("\n📝 Generating leagues-config.ts...");
  const leaguesConfig = generateLeaguesConfig(report);
  const leaguesPath = path.join(
    __dirname,
    "../lib/config/leagues-config.ts"
  );
  fs.writeFileSync(leaguesPath, leaguesConfig);
  console.log(`   ✅ Written to lib/config/leagues-config.ts`);

  // 2. Generate markets config
  console.log("\n📝 Generating markets-config.ts...");
  const marketsConfig = generateMarketsConfig(report);
  const marketsPath = path.join(
    __dirname,
    "../lib/config/markets-config.ts"
  );
  fs.writeFileSync(marketsPath, marketsConfig);
  console.log(`   ✅ Written to lib/config/markets-config.ts`);

  // 3. Generate league mappings
  console.log("\n📝 Generating league-mappings.ts...");
  const mappings = generateLeagueMappings(report);
  const mappingsPath = path.join(
    __dirname,
    "../lib/sync/league-mappings.ts"
  );
  fs.writeFileSync(mappingsPath, mappings);
  console.log(`   ✅ Written to lib/sync/league-mappings.ts`);

  console.log("\n✅ Config generation complete!");
}

function generateLeaguesConfig(report: DiscoveryReport): string {
  const footballLeagues = report.sports.Football?.leagues || {};
  const tennisLeagues = report.sports.Tennis?.leagues || {};

  const footballArray = Object.entries(footballLeagues)
    .filter(([_, league]) => league.eventCount > 0)
    .map(
      ([key, league]) => `  {
    slug: '${key}',
    name: '${league.leagueName}',
    country: extractCountry('${key}'),
    active: true
  }`
    )
    .join(",\n");

  const tennisArray = Object.entries(tennisLeagues)
    .filter(([_, league]) => league.eventCount > 0)
    .map(
      ([key, league]) => `  {
    slug: '${key}',
    name: '${league.leagueName}',
    category: extractCategory('${key}'),
    active: true
  }`
    )
    .join(",\n");

  return `/**
 * Leagues Configuration
 * Auto-generated from discovery report
 * Generated: ${new Date().toISOString()}
 */

export const FOOTBALL_LEAGUES = [
${footballArray}
];

export const TENNIS_TOURNAMENTS = [
${tennisArray}
];

// Helper to extract country from league key
function extractCountry(leagueKey: string): string {
  const countryMap: Record<string, string> = {
    'england-premier-league': 'England',
    'spain-la-liga': 'Spain',
    'italy-serie-a': 'Italy',
    'germany-bundesliga': 'Germany',
    'france-ligue-1': 'France',
    'portugal-primeira-liga': 'Portugal',
    'netherlands-eredivisie': 'Netherlands',
    'belgium-pro-league': 'Belgium',
    'scotland-premiership': 'Scotland',
    'turkey-super-lig': 'Turkey',
    'austria-bundesliga': 'Austria',
    'switzerland-super-league': 'Switzerland',
    'greece-super-league': 'Greece',
    'uefa-champions-league': 'International',
    'uefa-europa-league': 'International',
  };
  return countryMap[leagueKey] || 'International';
}

// Helper to extract tournament category
function extractCategory(tournamentKey: string): string {
  if (tournamentKey.includes('open')) return 'grand-slam';
  if (tournamentKey.includes('masters') || tournamentKey.includes('1000')) return 'masters';
  if (tournamentKey.includes('500')) return 'atp-500';
  if (tournamentKey.includes('250')) return 'atp-250';
  return 'other';
}
`;
}

function generateMarketsConfig(report: DiscoveryReport): string {
  // Collecter tous les marchés uniques par sport
  const footballMarkets = new Set<string>();
  const tennisMarkets = new Set<string>();

  for (const league of Object.values(report.sports.Football?.leagues || {})) {
    if (league.markets) {
      league.markets.forEach((m) => footballMarkets.add(m));
    }
  }

  for (const league of Object.values(report.sports.Tennis?.leagues || {})) {
    if (league.markets) {
      league.markets.forEach((m) => tennisMarkets.add(m));
    }
  }

  const footballMarketsArray = Array.from(footballMarkets)
    .map(
      (market) => `  {
    oddsapi_key: '${market}',
    market_type: inferMarketType('${market}'),
    period: 'fulltime',
    active: true
  }`
    )
    .join(",\n");

  const tennisMarketsArray = Array.from(tennisMarkets)
    .map(
      (market) => `  {
    oddsapi_key: '${market}',
    market_type: inferMarketType('${market}'),
    period: 'match',
    active: true
  }`
    )
    .join(",\n");

  return `/**
 * Markets Configuration
 * Auto-generated from discovery report
 * Generated: ${new Date().toISOString()}
 */

export const FOOTBALL_MARKETS = [
${footballMarketsArray}
];

export const TENNIS_MARKETS = [
${tennisMarketsArray}
];

// Infer market type from oddsapi_key
function inferMarketType(oddsapiKey: string): string {
  if (oddsapiKey === 'h2h' || oddsapiKey.includes('h2h')) return '1x2';
  if (oddsapiKey.includes('spreads')) return 'spreads';
  if (oddsapiKey.includes('totals')) return 'totals';
  if (oddsapiKey.includes('team_totals')) return 'team_totals';
  if (oddsapiKey.includes('player')) return 'player_prop';
  if (oddsapiKey.includes('moneyline')) return 'moneyline';
  if (oddsapiKey.includes('sets')) return 'sets';
  return 'other';
}
`;
}

function generateLeagueMappings(report: DiscoveryReport): string {
  const footballMappings = Object.entries(
    report.sports.Football?.leagues || {}
  )
    .filter(([_, league]) => league.eventCount > 0)
    .map(
      ([key, league]) =>
        `  '${key}': { sport: 'Football', name: '${league.leagueName}' },`
    )
    .join("\n");

  const tennisMappings = Object.entries(report.sports.Tennis?.leagues || {})
    .filter(([_, league]) => league.eventCount > 0)
    .map(
      ([key, league]) =>
        `  '${key}': { sport: 'Tennis', name: '${league.leagueName}' },`
    )
    .join("\n");

  return `/**
 * League Mappings - Maps API league keys to display names
 * Auto-generated from discovery report
 * Generated: ${new Date().toISOString()}
 */

export const LEAGUE_MAPPINGS: Record<
  string,
  { sport: string; name: string }
> = {
${footballMappings}
${tennisMappings}
};

/**
 * Get display name for a league
 */
export function getLeagueName(leagueKey: string): string {
  return LEAGUE_MAPPINGS[leagueKey]?.name || leagueKey.replace(/-/g, ' ');
}

/**
 * Get sport for a league
 */
export function getLeagueSport(leagueKey: string): string | null {
  return LEAGUE_MAPPINGS[leagueKey]?.sport || null;
}

/**
 * Get all leagues for a sport
 */
export function getLeaguesForSport(sport: string): string[] {
  return Object.entries(LEAGUE_MAPPINGS)
    .filter(([_, data]) => data.sport === sport)
    .map(([key]) => key);
}
`;
}

main().catch((error) => {
  console.error("💥 Config generation failed:", error);
  process.exit(1);
});
