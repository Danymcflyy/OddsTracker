import { createHash } from "crypto";

export const TEAM_NAME_MAP: Record<string, string> = {
  // Ligue 1 aliases
  "Paris SG": "Paris Saint-Germain",
  "St Etienne": "Saint-Étienne",
  "Le Havre": "Le Havre AC",

  // Premier League aliases (OddsPapi → CSV conventions)
  "Arsenal FC": "Arsenal",
  "Aston Villa FC": "Aston Villa",
  "AFC Bournemouth": "Bournemouth",
  "Brentford FC": "Brentford",
  "Brighton & Hove Albion": "Brighton",
  "Brighton and Hove Albion": "Brighton",
  "Chelsea FC": "Chelsea",
  "Crystal Palace FC": "Crystal Palace",
  "Everton FC": "Everton",
  "Fulham FC": "Fulham",
  "Leicester City FC": "Leicester",
  "Liverpool FC": "Liverpool",
  "Luton Town FC": "Luton",
  "Manchester City": "Man City",
  "Manchester City FC": "Man City",
  "Manchester United": "Man United",
  "Manchester United FC": "Man United",
  "Newcastle United": "Newcastle",
  "Newcastle United FC": "Newcastle",
  "Nottingham Forest": "Nott'm Forest",
  "Nottingham Forest FC": "Nott'm Forest",
  "Sheffield United": "Sheffield Utd",
  "Sheffield United FC": "Sheffield Utd",
  "Tottenham Hotspur": "Tottenham",
  "Tottenham Hotspur FC": "Tottenham",
  "West Ham United": "West Ham",
  "West Ham United FC": "West Ham",
  "Wolverhampton Wanderers": "Wolves",
  "Wolverhampton Wanderers FC": "Wolves",
  "Burnley FC": "Burnley",
  "Leeds United": "Leeds",
  "Leeds United FC": "Leeds",
  "Southampton FC": "Southampton",
  "Everton Football Club": "Everton",
  "Arsenal Football Club": "Arsenal",
};

export function normalizeTeamName(name: string): string {
  return (TEAM_NAME_MAP[name] || name).trim();
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function generateTeamOddspapiId(name: string): number {
  const normalized = normalizeTeamName(name).toLowerCase();
  const hash = createHash("sha1").update(normalized).digest("hex").slice(0, 7);
  return parseInt(hash, 16);
}

export function generateFixtureOddspapiId(date: Date, home: string, away: string): string {
  return [
    "csv",
    date.toISOString().replace(/[-:]/g, "").split(".")[0],
    slugify(home),
    slugify(away),
  ].join("-");
}

export interface LeagueConfig {
  key: string;
  label: string;
  oddspapiId: number;
  name: string;
  slug: string;
  countryName: string;
  countrySlug: string;
  sportOddspapiId: number;
  sportName: string;
  sportSlug: string;
  aliases?: string[];
}

export const LEAGUE_CONFIGS: LeagueConfig[] = [
  {
    key: "ligue1",
    label: "Ligue 1 (France)",
    oddspapiId: 1001,
    name: "Ligue 1",
    slug: "ligue-1",
    countryName: "France",
    countrySlug: "france",
    sportOddspapiId: 10,
    sportName: "Football",
    sportSlug: "football",
    aliases: ["f1", "ligue-1", "france-l1"],
  },
  {
    key: "premier-league",
    label: "Premier League (Angleterre)",
    oddspapiId: 2001,
    name: "Premier League",
    slug: "premier-league",
    countryName: "Angleterre",
    countrySlug: "england",
    sportOddspapiId: 10,
    sportName: "Football",
    sportSlug: "football",
    aliases: ["e0", "premierleague", "england-pl"],
  },
];

export function getLeagueConfig(key: string | undefined): LeagueConfig | undefined {
  if (!key) return undefined;
  const normalized = key.toLowerCase();
  return LEAGUE_CONFIGS.find(
    (config) =>
      config.key === normalized ||
      config.aliases?.some((alias) => alias.toLowerCase() === normalized)
  );
}

export interface MarketDefinition {
  key: string;
  oddspapiId: number;
  name: string;
  description?: string;
  outcomes: Array<{
    key: string;
    oddspapiId: number;
    name: string;
    description?: string;
  }>;
}

export const BASE_MARKETS: Record<string, MarketDefinition> = {
  "1X2": {
    key: "1X2",
    oddspapiId: 101,
    name: "1X2",
    description: "Match Result 1X2",
    outcomes: [
      { key: "1", oddspapiId: 1011, name: "1" },
      { key: "X", oddspapiId: 1012, name: "X" },
      { key: "2", oddspapiId: 1013, name: "2" },
    ],
  },
  "OVER_UNDER_25": {
    key: "OVER_UNDER_25",
    oddspapiId: 1025,
    name: "Over/Under",
    description: "Over/Under 2.5",
    outcomes: [
      { key: "O25", oddspapiId: 10251, name: "O25", description: "Over 2.5" },
      { key: "U25", oddspapiId: 10252, name: "U25", description: "Under 2.5" },
    ],
  },
  ASIAN_HANDICAP: {
    key: "ASIAN_HANDICAP",
    oddspapiId: 1030,
    name: "Asian Handicap",
    description: "Handicap (Home/Away)",
    outcomes: [
      { key: "HOME", oddspapiId: 10301, name: "Home" },
      { key: "AWAY", oddspapiId: 10302, name: "Away" },
    ],
  },
};

export const TOTALS_MARKET_TEMPLATE: MarketDefinition = {
  key: "TOTALS_TEMPLATE",
  oddspapiId: 1020,
  name: "Total",
  description: "Over/Under",
  outcomes: [
    { key: "OVER", oddspapiId: 10201, name: "Over" },
    { key: "UNDER", oddspapiId: 10202, name: "Under" },
  ],
};
