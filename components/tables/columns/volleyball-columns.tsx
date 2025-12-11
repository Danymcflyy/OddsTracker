"use client";

import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

import { VOLLEYBALL_TOTAL_LINES } from "@/lib/config/markets";
import { cn } from "@/lib/utils";
import type { FixtureWithEnrichedOdds, OddWithDetails } from "@/types/fixture";
import type { Market } from "@/hooks/use-markets";

type VolleyballRow = FixtureWithEnrichedOdds;

interface OddsDefinition {
  id: string;
  label: string;
  matcher: (odd: OddWithDetails) => boolean;
}

const MONEYLINE_CODES = ["1", "2"] as const;
const SET_HANDICAPS = ["-1.5", "+1.5"] as const;
const TOTAL_POINTS_LINES = VOLLEYBALL_TOTAL_LINES.map((line) =>
  line % 1 === 0 ? line.toFixed(0) : line.toFixed(1)
);

const VOLLEYBALL_ODDS_DEFINITIONS: OddsDefinition[] = [
  ...MONEYLINE_CODES.map((code) => ({
    id: code,
    label: code,
    matcher: (odd: OddWithDetails) =>
      matchesMarket(odd, "MONEYLINE") && matchesOutcome(odd, code),
  })),
  ...SET_HANDICAPS.map((line) => ({
    id: `SH${line}`,
    label: `SH${line}`,
    matcher: (odd: OddWithDetails) =>
      matchesMarket(odd, "HANDICAP") &&
      (matchesOutcome(odd, line) || matchesOutcome(odd, `SH${line}`)),
  })),
  ...TOTAL_POINTS_LINES.flatMap((line) => {
    const over = `TP${line}`;
    const under = `TN${line}`;
    return [
      {
        id: over,
        label: over,
        matcher: (odd: OddWithDetails) =>
          matchesMarket(odd, "TOTAL") && matchesOutcome(odd, `O${line.replace(".", "")}`),
      },
      {
        id: under,
        label: under,
        matcher: (odd: OddWithDetails) =>
          matchesMarket(odd, "TOTAL") && matchesOutcome(odd, `U${line.replace(".", "")}`),
      },
    ];
  }),
];

// ===== GÉNÉRATION DYNAMIQUE DES COLONNES =====

/**
 * Formate une ligne de handicap/total
 */
function formatLine(value: number): string {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

/**
 * Crée une définition d'odds pour un outcome donné selon son type de marché
 */
function buildDefinitionForOutcome(
  market: Market,
  outcome: { id: number; oddspapi_id: number; name: string; description: string | null }
): OddsDefinition | null {
  const marketType = market.market_type.toLowerCase();
  const handicap = market.handicap;

  // Moneyline (1, 2)
  if (marketType === "moneyline") {
    return {
      id: outcome.name,
      label: outcome.name,
      matcher: (odd: OddWithDetails) =>
        matchesMarket(odd, "MONEYLINE") && matchesOutcome(odd, outcome.name),
    };
  }

  // Totals (Total Points - TP/TN)
  if (marketType === "totals" && handicap !== null) {
    const line = formatLine(handicap);
    const outcomeName = outcome.name.toUpperCase();
    const isOver = outcomeName.includes("OVER") || outcomeName.startsWith("O");
    const id = isOver ? `TP${line}` : `TN${line}`;

    return {
      id,
      label: id,
      matcher: (odd: OddWithDetails) =>
        matchesMarket(odd, "TOTAL") && matchesOutcome(odd, `O${line.replace(".", "")}`),
    };
  }

  // Spreads (Set Handicap - SH)
  if (marketType === "spreads" && handicap !== null) {
    const line = handicap > 0 ? `+${formatLine(handicap)}` : formatLine(handicap);
    const id = `SH${line}`;

    return {
      id,
      label: id,
      matcher: (odd: OddWithDetails) =>
        matchesMarket(odd, "HANDICAP") &&
        (matchesOutcome(odd, line) || matchesOutcome(odd, `SH${line}`)),
    };
  }

  return null;
}

/**
 * Crée les définitions d'odds depuis les marchés DB
 */
function createOddsDefinitionsFromMarkets(markets: Market[]): OddsDefinition[] {
  const definitions: OddsDefinition[] = [];

  for (const market of markets) {
    for (const outcome of market.outcomes) {
      const def = buildDefinitionForOutcome(market, outcome);
      if (def) {
        definitions.push(def);
      }
    }
  }

  return definitions;
}

/**
 * Colonnes statiques (non dynamiques)
 */
function getStaticColumns(): ColumnDef<VolleyballRow>[] {
  return [
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
      header: "Compétition",
      cell: ({ row }) => <div className="font-medium">{row.original.league?.name ?? "-"}</div>,
      enableSorting: true,
    },
    {
      accessorKey: "home_team.name",
      header: "Équipe A",
      cell: ({ row }) => (
        <div className="font-semibold text-slate-900">{row.original.home_team?.name ?? "-"}</div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "away_team.name",
      header: "Équipe B",
      cell: ({ row }) => (
        <div className="font-semibold text-slate-900">{row.original.away_team?.name ?? "-"}</div>
      ),
      enableSorting: true,
    },
    ...scoreColumns(),
  ];
}

/**
 * Factory pour créer les colonnes Volleyball dynamiquement
 * @param markets - Marchés actifs depuis la DB (optionnel, utilise fallback hardcodé si absent)
 */
export function createVolleyballColumns(markets?: Market[]): ColumnDef<VolleyballRow>[] {
  const oddsDefinitions =
    markets && markets.length > 0
      ? createOddsDefinitionsFromMarkets(markets)
      : VOLLEYBALL_ODDS_DEFINITIONS;

  return [
    ...getStaticColumns(),
    ...createOddsColumnsFromDefinitions(oddsDefinitions),
  ];
}

// Export pour compatibilité (colonnes hardcodées)
export const volleyballColumns = createVolleyballColumns();

function scoreColumns(): ColumnDef<VolleyballRow>[] {
  return [
    {
      id: "home_score",
      header: () => <div className="text-center">Sets A</div>,
      cell: ({ row }) => (
        <div className={cn("rounded-md px-2 py-1 text-center text-sm font-semibold", scoreVariant(row.original, "home"))}>
          {row.original.home_score ?? "-"}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "away_score",
      header: () => <div className="text-center">Sets B</div>,
      cell: ({ row }) => (
        <div className={cn("rounded-md px-2 py-1 text-center text-sm font-semibold", scoreVariant(row.original, "away"))}>
          {row.original.away_score ?? "-"}
        </div>
      ),
      enableSorting: true,
    },
  ];
}

function createOddsColumnsFromDefinitions(definitions: OddsDefinition[]): ColumnDef<VolleyballRow>[] {
  return definitions.flatMap((definition) => [
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
  } as ColumnDef<VolleyballRow>;
}

function findOdd(
  row: VolleyballRow,
  matcher: (odd: OddWithDetails) => boolean
): OddWithDetails | undefined {
  return row.odds?.find(matcher);
}

function matchesOutcome(odd: OddWithDetails, token: string) {
  const normalizedToken = normalize(token);
  const outcomeName = normalize(odd.outcome?.name);
  const outcomeDescription = normalize(odd.outcome?.description ?? "");
  return outcomeName.includes(normalizedToken) || outcomeDescription.includes(normalizedToken);
}

function matchesMarket(odd: OddWithDetails, token: string) {
  const normalizedToken = normalize(token);
  const marketName = normalize(odd.market?.name ?? "");
  const marketDescription = normalize(odd.market?.description ?? "");
  return marketName.includes(normalizedToken) || marketDescription.includes(normalizedToken);
}

function normalize(value?: string | null) {
  return value ? value.replace(/[^\w]/g, "").toUpperCase() : "";
}

function scoreVariant(row: VolleyballRow, team: "home" | "away") {
  const home = row.home_score;
  const away = row.away_score;

  if (home == null || away == null) {
    return "bg-slate-50 text-slate-500";
  }

  if (home === away) {
    return "bg-slate-100 text-slate-700";
  }

  const isWinner = team === "home" ? home > away : away > home;
  return isWinner ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
}
