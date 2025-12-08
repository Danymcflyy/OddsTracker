export interface TournamentOption {
  sportId: number;
  tournamentId: number;
  name: string;
  country: string;
  slug: string;
  defaultSelected?: boolean;
}

export type FollowedTournamentsMap = Record<string, number[]>;

const FOOTBALL_TOURNAMENTS: TournamentOption[] = [
  {
    sportId: 10,
    tournamentId: 17,
    name: "Premier League",
    country: "Angleterre",
    slug: "premier-league",
    defaultSelected: true,
  },
  {
    sportId: 10,
    tournamentId: 34,
    name: "Ligue 1",
    country: "France",
    slug: "ligue-1",
  },
  {
    sportId: 10,
    tournamentId: 23,
    name: "Serie A",
    country: "Italie",
    slug: "serie-a",
  },
  {
    sportId: 10,
    tournamentId: 8,
    name: "La Liga",
    country: "Espagne",
    slug: "la-liga",
  },
  {
    sportId: 10,
    tournamentId: 35,
    name: "Bundesliga",
    country: "Allemagne",
    slug: "bundesliga",
  },
  {
    sportId: 10,
    tournamentId: 7,
    name: "UEFA Champions League",
    country: "International",
    slug: "uefa-champions-league",
  },
  {
    sportId: 10,
    tournamentId: 1,
    name: "UEFA Euro",
    country: "International",
    slug: "uefa-euro",
  },
];

const HOCKEY_TOURNAMENTS: TournamentOption[] = [
  {
    sportId: 15,
    tournamentId: 234,
    name: "NHL",
    country: "USA / Canada",
    slug: "nhl",
    defaultSelected: true,
  },
  {
    sportId: 15,
    tournamentId: 844,
    name: "AHL",
    country: "USA / Canada",
    slug: "ahl",
  },
  {
    sportId: 15,
    tournamentId: 268,
    name: "KHL",
    country: "Russie",
    slug: "khl",
  },
  {
    sportId: 15,
    tournamentId: 261,
    name: "SHL",
    country: "Suede",
    slug: "shl",
    defaultSelected: true,
  },
  {
    sportId: 15,
    tournamentId: 134,
    name: "Liiga",
    country: "Finlande",
    slug: "liiga",
  },
];

const TENNIS_TOURNAMENTS: TournamentOption[] = [
  {
    sportId: 12,
    tournamentId: 2567,
    name: "Australian Open (ATP)",
    country: "Australie",
    slug: "australian-open-atp",
    defaultSelected: true,
  },
  {
    sportId: 12,
    tournamentId: 2571,
    name: "Australian Open (WTA)",
    country: "Australie",
    slug: "australian-open-wta",
    defaultSelected: true,
  },
  {
    sportId: 12,
    tournamentId: 2579,
    name: "Roland Garros (ATP)",
    country: "France",
    slug: "roland-garros-atp",
  },
  {
    sportId: 12,
    tournamentId: 2583,
    name: "Roland Garros (WTA)",
    country: "France",
    slug: "roland-garros-wta",
  },
  {
    sportId: 12,
    tournamentId: 2555,
    name: "Wimbledon (ATP)",
    country: "Royaume-Uni",
    slug: "wimbledon-atp",
  },
  {
    sportId: 12,
    tournamentId: 2559,
    name: "Wimbledon (WTA)",
    country: "Royaume-Uni",
    slug: "wimbledon-wta",
  },
  {
    sportId: 12,
    tournamentId: 2591,
    name: "US Open (ATP)",
    country: "USA",
    slug: "us-open-atp",
  },
  {
    sportId: 12,
    tournamentId: 2595,
    name: "US Open (WTA)",
    country: "USA",
    slug: "us-open-wta",
  },
];

const VOLLEYBALL_TOURNAMENTS: TournamentOption[] = [
  {
    sportId: 23,
    tournamentId: 517,
    name: "SuperLega",
    country: "Italie",
    slug: "superlega",
    defaultSelected: true,
  },
  {
    sportId: 23,
    tournamentId: 567,
    name: "Serie A1 Femminile",
    country: "Italie",
    slug: "serie-a1-fem",
    defaultSelected: true,
  },
  {
    sportId: 23,
    tournamentId: 831,
    name: "PlusLiga",
    country: "Pologne",
    slug: "plusliga",
  },
  {
    sportId: 23,
    tournamentId: 1173,
    name: "Liga Siatkowki Kobiet",
    country: "Pologne",
    slug: "liga-siatkowki-kobiet",
  },
  {
    sportId: 23,
    tournamentId: 2148,
    name: "V League",
    country: "Coree du Sud",
    slug: "v-league",
  },
  {
    sportId: 23,
    tournamentId: 2150,
    name: "V League (Women)",
    country: "Coree du Sud",
    slug: "v-league-women",
  },
];

export const TOURNAMENT_OPTIONS_BY_SPORT: Record<string, TournamentOption[]> = {
  "10": FOOTBALL_TOURNAMENTS,
  "12": TENNIS_TOURNAMENTS,
  "15": HOCKEY_TOURNAMENTS,
  "23": VOLLEYBALL_TOURNAMENTS,
};

export const DEFAULT_FOLLOWED_TOURNAMENTS: FollowedTournamentsMap = Object.entries(
  TOURNAMENT_OPTIONS_BY_SPORT
).reduce((acc, [sportId, tournaments]) => {
  const defaults = tournaments
    .filter((tournament) => tournament.defaultSelected)
    .map((tournament) => tournament.tournamentId);

  if (defaults.length) {
    acc[sportId] = defaults;
  }

  return acc;
}, {} as FollowedTournamentsMap);

export const SPORT_LABELS: Record<string, string> = {
  "10": "Football",
  "12": "Tennis",
  "15": "Hockey sur glace",
  "23": "Volleyball",
};
