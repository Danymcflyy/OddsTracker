"use client";

import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import type { FixtureWithEnrichedOdds, OddWithDetails } from "@/types/fixture";

type HockeyRow = FixtureWithEnrichedOdds;

interface OddsDefinition {
  id: string;
  label: string;
  matcher: (odd: OddWithDetails) => boolean;
}

const MONEYLINE_CODES = ["1", "2"] as const;
const TOTAL_LINES = ["4.5", "5.5", "6.5"];
const PUCK_LINES = ["-1.5", "+1.5"];

const HOCKEY_ODDS_DEFINITIONS: OddsDefinition[] = [
  ...MONEYLINE_CODES.map((code) => ({
    id: code,
    label: code,
    matcher: (odd: OddWithDetails) =>
      matchesMarket(odd, "MONEYLINE") && matchesOutcome(odd, code),
  })),
  ...TOTAL_LINES.flatMap((line) => {
    const overId = `O${line}`;
    const underId = `U${line}`;
    return [
      {
        id: overId,
        label: overId,
        matcher: (odd: OddWithDetails) =>
          matchesMarket(odd, "OVER") && matchesOutcome(odd, overId.replace(".", "")),
      },
      {
        id: underId,
        label: underId,
        matcher: (odd: OddWithDetails) =>
          matchesMarket(odd, "UNDER") && matchesOutcome(odd, underId.replace(".", "")),
      },
    ];
  }),
  ...PUCK_LINES.flatMap((line) => {
    const id = `PL${line}`;
    return [
      {
        id,
        label: `PL${line}`,
        matcher: (odd: OddWithDetails) =>
          matchesMarket(odd, "PUCK") &&
          (matchesOutcome(odd, line) || matchesOutcome(odd, `PL${line}`)),
      },
    ];
  }),
];

export const hockeyColumns: ColumnDef<HockeyRow>[] = [
  {
    accessorKey: "start_time",
    header: "Date",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return (
        <div className="font-medium">
          {value ? format(new Date(value), "dd MMM yyyy HH:mm") : "-"}
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
  ...scoreColumns(),
  ...createOddsColumns(),
];

function scoreColumns(): ColumnDef<HockeyRow>[] {
  return [
    {
      id: "home_score",
      header: () => <div className="text-center">Score Home</div>,
      cell: ({ row }) => (
        <div className={cn("rounded-md px-2 py-1 text-center text-sm font-semibold", scoreVariant(row.original, "home"))}>
          {row.original.home_score ?? "-"}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "away_score",
      header: () => <div className="text-center">Score Away</div>,
      cell: ({ row }) => (
        <div className={cn("rounded-md px-2 py-1 text-center text-sm font-semibold", scoreVariant(row.original, "away"))}>
          {row.original.away_score ?? "-"}
        </div>
      ),
      enableSorting: true,
    },
  ];
}

function createOddsColumns(): ColumnDef<HockeyRow>[] {
  return HOCKEY_ODDS_DEFINITIONS.flatMap((definition) => [
    buildOddsColumn(definition, "opening"),
    buildOddsColumn(definition, "closing"),
  ]);
}

function buildOddsColumn(definition: OddsDefinition, priceType: "opening" | "closing") {
  const suffix = priceType === "opening" ? "Open" : "Close";
  return {
    id: `${definition.id}-${suffix}`,
    header: `${definition.label}-${suffix}`,
    cell: ({ row }: { row: any }) => {
      const odd = findOdd(row.original, definition.matcher);
      const value = priceType === "opening" ? odd?.opening_price : odd?.closing_price;
      const isWinner = odd?.is_winner === true;
      const isLoser = odd?.is_winner === false;

      return (
        <div
          className={cn(
            "rounded-md px-2 py-1 text-right font-mono text-sm",
            isWinner && "bg-emerald-50 text-emerald-700 font-semibold",
            isLoser && "bg-rose-50 text-rose-700"
          )}
        >
          {value !== null && value !== undefined ? value.toFixed(2) : "-"}
        </div>
      );
    },
    enableSorting: true,
  } as ColumnDef<HockeyRow>;
}

function findOdd(
  row: HockeyRow,
  matcher: (odd: OddWithDetails) => boolean
): OddWithDetails | undefined {
  return row.odds?.find(matcher);
}

function matchesOutcome(odd: OddWithDetails, token: string) {
  const normalizedToken = normalizeToken(token);
  const outcomeName = normalizeToken(odd.outcome?.name);
  const outcomeDescription = normalizeToken(odd.outcome?.description ?? "");
  return outcomeName.includes(normalizedToken) || outcomeDescription.includes(normalizedToken);
}

function matchesMarket(odd: OddWithDetails, token: string) {
  const normalizedToken = normalizeToken(token);
  const marketName = normalizeToken(odd.market?.name ?? "");
  const marketDescription = normalizeToken(odd.market?.description ?? "");
  return marketName.includes(normalizedToken) || marketDescription.includes(normalizedToken);
}

function normalizeToken(value?: string | null) {
  return value ? value.replace(/[^\w]/g, "").toUpperCase() : "";
}

function scoreVariant(row: HockeyRow, team: "home" | "away") {
  const home = row.home_score;
  const away = row.away_score;

  if (home === null || home === undefined || away === null || away === undefined) {
    return "bg-slate-50 text-slate-500";
  }

  if (home === away) {
    return "bg-slate-100 text-slate-700";
  }

  const isWinner = team === "home" ? home > away : away > home;
  return isWinner ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
}
