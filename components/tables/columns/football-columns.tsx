"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import type { FixtureWithEnrichedOdds, OddWithDetails } from "@/types/fixture";

type FootballTableRow = FixtureWithEnrichedOdds;

interface FootballOddsDefinition {
  id: string;
  label: string;
  matcher: (odd: OddWithDetails) => boolean;
}

const MATCH_RESULT_CODES = [
  { code: "1", label: "1 (Home Win)" },
  { code: "X", label: "X (Draw)" },
  { code: "2", label: "2 (Away Win)" },
] as const;
const OVER_UNDER_LINES = ["0.5", "1.5", "2.5", "3.5", "4.5", "5.5"];
const DOUBLE_CHANCE_CODES = [
  { code: "1X", label: "1X (Home/Draw)" },
  { code: "12", label: "12 (Home/Away)" },
  { code: "X2", label: "X2 (Draw/Away)" },
] as const;
const BTTS_CODES = [
  { id: "BTTS-Y", token: "BTTSY", label: "BTTS (Yes)" },
  { id: "BTTS-N", token: "BTTSN", label: "BTTS (No)" },
] as const;
const ASIAN_HANDICAP_CODES = [
  { id: "AH-H", label: "AH Home", token: "HOME" },
  { id: "AH-A", label: "AH Away", token: "AWAY" },
] as const;

const FOOTBALL_ODDS_DEFINITIONS: FootballOddsDefinition[] = [
  // 1X2
  ...MATCH_RESULT_CODES.map(({ code, label }) => ({
    id: code,
    label,
    matcher: (odd: OddWithDetails) =>
      matchesMarketToken(odd, "1X2") && matchesOutcomeToken(odd, code),
  })),
  // Over/Under
  ...OVER_UNDER_LINES.flatMap((line) => {
    const overCode = `O${line}`;
    const underCode = `U${line}`;
    return [
      {
        id: overCode,
        label: `Over ${line}`,
        matcher: (odd: OddWithDetails) =>
          matchesMarketToken(odd, "OVER") &&
          matchesOutcomeToken(odd, overCode.replace(".", "")),
      },
      {
        id: underCode,
        label: `Under ${line}`,
        matcher: (odd: OddWithDetails) =>
          matchesMarketToken(odd, "UNDER") &&
          matchesOutcomeToken(odd, underCode.replace(".", "")),
      },
    ];
  }),
  // Double chance
  ...DOUBLE_CHANCE_CODES.map(({ code, label }) => ({
    id: code,
    label,
    matcher: (odd: OddWithDetails) =>
      matchesMarketToken(odd, "DOUBLE") && matchesOutcomeToken(odd, code),
  })),
  // Both teams to score
  ...BTTS_CODES.map(({ id, token, label }) => ({
    id,
    label,
    matcher: (odd: OddWithDetails) =>
      matchesMarketToken(odd, "BTTS") &&
      (matchesOutcomeToken(odd, token) || matchesOutcomeToken(odd, id)),
  })),
  // Asian Handicap (ligne unique par match)
  ...ASIAN_HANDICAP_CODES.map(({ id, label, token }) => ({
    id,
    label,
    matcher: (odd: OddWithDetails) =>
      matchesMarketToken(odd, "ASIANHANDICAP") &&
      matchesOutcomeToken(odd, token),
  })),
];

export const footballColumns: ColumnDef<FootballTableRow>[] = [
  {
    accessorKey: "start_time",
    header: "Date",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return (
        <div className="font-medium">
          {value ? format(new Date(value), "dd MMM yyyy HH:mm", { locale: fr }) : "-"}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "country",
    header: "Pays",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.league?.country?.name ?? "-"}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "league",
    header: "Ligue",
    cell: ({ row }) => <div className="font-medium">{row.original.league?.name ?? "-"}</div>,
    enableSorting: true,
  },
  {
    accessorKey: "home_team.name",
    header: "Home",
    cell: ({ row }) => (
      <div className="font-semibold text-slate-900">{row.original.home_team?.name ?? "-"}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "away_team.name",
    header: "Away",
    cell: ({ row }) => (
      <div className="font-semibold text-slate-900">{row.original.away_team?.name ?? "-"}</div>
    ),
    enableSorting: true,
  },
  {
    id: "home_score",
    header: () => <div className="text-center">Score Home</div>,
    cell: ({ row }) => {
      const value = row.original.home_score;
      return (
        <div className={cn("rounded-md px-2 py-1 text-center text-sm font-semibold", scoreVariant(row.original, "home"))}>
          {value ?? "-"}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "away_score",
    header: () => <div className="text-center">Score Away</div>,
    cell: ({ row }) => {
      const value = row.original.away_score;
      return (
        <div className={cn("rounded-md px-2 py-1 text-center text-sm font-semibold", scoreVariant(row.original, "away"))}>
          {value ?? "-"}
        </div>
      );
    },
    enableSorting: true,
  },
  ...createOddsColumns(),
];

function createOddsColumns(): ColumnDef<FootballTableRow>[] {
  return FOOTBALL_ODDS_DEFINITIONS.flatMap((definition) => [
    buildOddsColumn(definition, "opening"),
    buildOddsColumn(definition, "closing"),
  ]);
}

function buildOddsColumn(
  definition: FootballOddsDefinition,
  priceType: "opening" | "closing"
): ColumnDef<FootballTableRow> {
  const suffix = priceType === "opening" ? "Open" : "Close";
  return {
    id: `${definition.id}-${suffix}`,
    header: `${definition.label}-${suffix}`,
    cell: ({ row }) => {
      const odd = findOdd(row.original, definition.matcher);
      const value =
        priceType === "opening" ? odd?.opening_price : odd?.closing_price;
      const isWinner = odd?.is_winner === true;
      const isLoser = odd?.is_winner === false;
      const isAsianHandicap = definition.id.startsWith("AH-");
      const handicapLabel = isAsianHandicap ? extractHandicapLabel(odd) : null;

      return (
        <div className="space-y-0.5">
          <div
            className={cn(
              "rounded-md px-2 py-1 text-right font-mono text-sm",
              isWinner && "bg-emerald-50 text-emerald-700 font-semibold",
              isLoser && "bg-rose-50 text-rose-700"
            )}
          >
            {value !== null && value !== undefined ? value.toFixed(2) : "-"}
          </div>
          {handicapLabel && (
            <p className="text-right text-[11px] text-muted-foreground">
              {handicapLabel}
            </p>
          )}
        </div>
      );
    },
    enableSorting: true,
  };
}

function findOdd(
  row: FootballTableRow,
  matcher: (odd: OddWithDetails) => boolean
): OddWithDetails | undefined {
  return row.odds?.find(matcher);
}

function matchesOutcomeToken(odd: OddWithDetails, token: string) {
  const normalizedToken = normalizeToken(token);
  const outcomeName = normalizeToken(odd.outcome?.name);
  const outcomeDescription = normalizeToken(odd.outcome?.description ?? "");

  return (
    outcomeName.includes(normalizedToken) ||
    outcomeDescription.includes(normalizedToken)
  );
}

function matchesMarketToken(odd: OddWithDetails, token: string) {
  const normalizedToken = normalizeToken(token);
  const marketName = normalizeToken(odd.market?.name ?? "");
  const marketDescription = normalizeToken(odd.market?.description ?? "");
  return (
    marketName.includes(normalizedToken) ||
    marketDescription.includes(normalizedToken)
  );
}

function normalizeToken(value?: string | null) {
  return value
    ? value.replace(/[^\w]/g, "").toUpperCase()
    : "";
}

function extractHandicapLabel(odd?: OddWithDetails) {
  if (!odd?.market?.name) return null;
  const match = odd.market.name.match(/-?\d+(\.\d+)?/);
  return match ? `Ligne ${match[0]}` : null;
}

function scoreVariant(row: FootballTableRow, team: "home" | "away") {
  const home = row.home_score;
  const away = row.away_score;

  if (home === null || home === undefined || away === null || away === undefined) {
    return "bg-slate-50 text-slate-500";
  }

  if (home === away) {
    return "bg-slate-100 text-slate-700";
  }

  const isWinner = (team === "home" ? home > away : away > home);
  return isWinner ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
}
