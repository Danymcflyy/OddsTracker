"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import type { FixtureWithEnrichedOdds, OddWithDetails } from "@/types/fixture";

type FootballTableRow = FixtureWithEnrichedOdds;

interface OddsDefinition {
  id: string;
  label: string;
  marketKey: string; // e.g., "h2h", "spreads", "totals"
  outcomeName: string; // e.g., "1", "X", "2", "OVER", "UNDER"
}

// Définitions statiques de TOUTES les colonnes possibles
const ODDS_DEFINITIONS: OddsDefinition[] = [
  // 1X2 (h2h market)
  { id: "1X2_1", label: "1X2 | 1 (Home Win)", marketKey: "h2h", outcomeName: "1" },
  { id: "1X2_X", label: "1X2 | X (Draw)", marketKey: "h2h", outcomeName: "X" },
  { id: "1X2_2", label: "1X2 | 2 (Away Win)", marketKey: "h2h", outcomeName: "2" },

  // Totals (totals market)
  { id: "TOTALS_OVER", label: "Totals | Over", marketKey: "totals", outcomeName: "OVER" },
  { id: "TOTALS_UNDER", label: "Totals | Under", marketKey: "totals", outcomeName: "UNDER" },

  // Spreads (spreads market)
  { id: "SPREADS_1", label: "Spreads | Home", marketKey: "spreads", outcomeName: "1" },
  { id: "SPREADS_2", label: "Spreads | Away", marketKey: "spreads", outcomeName: "2" },

  // Corners Spread
  { id: "CORNERS_SPREAD_1", label: "Corners Spread | Home", marketKey: "corners_spread", outcomeName: "1" },
  { id: "CORNERS_SPREAD_2", label: "Corners Spread | Away", marketKey: "corners_spread", outcomeName: "2" },

  // Corners Totals
  { id: "CORNERS_TOTALS_OVER", label: "Corners Totals | Over", marketKey: "corners_totals", outcomeName: "OVER" },
  { id: "CORNERS_TOTALS_UNDER", label: "Corners Totals | Under", marketKey: "corners_totals", outcomeName: "UNDER" },

  // Corners Half-Time Spread
  { id: "CORNERS_SPREAD_H1_1", label: "Corners Spread HT | Home", marketKey: "corners_spread_h1", outcomeName: "1" },
  { id: "CORNERS_SPREAD_H1_2", label: "Corners Spread HT | Away", marketKey: "corners_spread_h1", outcomeName: "2" },

  // Corners Half-Time Totals
  { id: "CORNERS_TOTALS_H1_OVER", label: "Corners Totals HT | Over", marketKey: "corners_totals_h1", outcomeName: "OVER" },
  { id: "CORNERS_TOTALS_H1_UNDER", label: "Corners Totals HT | Under", marketKey: "corners_totals_h1", outcomeName: "UNDER" },

  // Bookings Spread
  { id: "BOOKINGS_SPREAD_1", label: "Bookings Spread | Home", marketKey: "bookings_spread", outcomeName: "1" },
  { id: "BOOKINGS_SPREAD_2", label: "Bookings Spread | Away", marketKey: "bookings_spread", outcomeName: "2" },

  // Bookings Totals
  { id: "BOOKINGS_TOTALS_OVER", label: "Bookings Totals | Over", marketKey: "bookings_totals", outcomeName: "OVER" },
  { id: "BOOKINGS_TOTALS_UNDER", label: "Bookings Totals | Under", marketKey: "bookings_totals", outcomeName: "UNDER" },

  // Team Totals Home
  { id: "TEAM_TOTALS_HOME_OVER", label: "Team Totals Home | Over", marketKey: "team_totals_home", outcomeName: "OVER" },
  { id: "TEAM_TOTALS_HOME_UNDER", label: "Team Totals Home | Under", marketKey: "team_totals_home", outcomeName: "UNDER" },

  // Team Totals Away
  { id: "TEAM_TOTALS_AWAY_OVER", label: "Team Totals Away | Over", marketKey: "team_totals_away", outcomeName: "OVER" },
  { id: "TEAM_TOTALS_AWAY_UNDER", label: "Team Totals Away | Under", marketKey: "team_totals_away", outcomeName: "UNDER" },

  // Half-Time 1X2
  { id: "1X2_H1_1", label: "HT 1X2 | 1", marketKey: "h2h_h1", outcomeName: "1" },
  { id: "1X2_H1_X", label: "HT 1X2 | X", marketKey: "h2h_h1", outcomeName: "X" },
  { id: "1X2_H1_2", label: "HT 1X2 | 2", marketKey: "h2h_h1", outcomeName: "2" },

  // Half-Time Totals
  { id: "TOTALS_H1_OVER", label: "HT Totals | Over", marketKey: "totals_h1", outcomeName: "OVER" },
  { id: "TOTALS_H1_UNDER", label: "HT Totals | Under", marketKey: "totals_h1", outcomeName: "UNDER" },
];

/**
 * Colonnes statiques (Date, Pays, Ligue, Équipes, Scores)
 */
function getStaticColumns(): ColumnDef<FootballTableRow>[] {
  return [
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
  ];
}

/**
 * Créer les colonnes d'odds (Opening + Closing pour chaque définition)
 */
function createOddsColumns(): ColumnDef<FootballTableRow>[] {
  return ODDS_DEFINITIONS.flatMap((definition) => [
    buildOddColumn(definition, "opening"),
    buildOddColumn(definition, "closing"),
  ]);
}

/**
 * Construire une colonne pour un odd spécifique (opening ou closing)
 */
function buildOddColumn(
  definition: OddsDefinition,
  priceType: "opening" | "closing"
): ColumnDef<FootballTableRow> {
  const suffix = priceType === "opening" ? "Open" : "Close";

  return {
    id: `${definition.id}_${suffix}`,
    header: `${definition.label} ${suffix}`,
    cell: ({ row }) => {
      // Chercher l'odd qui correspond à cette définition
      const odd = findOdd(row.original, definition.marketKey, definition.outcomeName);

      if (!odd) {
        return <div className="text-center text-muted-foreground">-</div>;
      }

      const value = priceType === "opening" ? odd.opening_price : odd.closing_price;
      const isWinner = odd.is_winner === true;
      const isLoser = odd.is_winner === false;

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
  };
}

/**
 * Trouver l'odd qui correspond au market et outcome spécifiés
 */
function findOdd(
  row: FootballTableRow,
  marketKey: string,
  outcomeName: string
): OddWithDetails | undefined {
  return row.odds?.find((odd) => {
    // Comparer le market name (exact match avec oddsapi_key)
    const matchesMarket = odd.market?.name === marketKey;

    // Comparer le outcome name (exact match avec nom normalisé)
    const matchesOutcome = odd.outcome?.name === outcomeName;

    return matchesMarket && matchesOutcome;
  });
}

/**
 * Variant de couleur pour les scores
 */
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

/**
 * Export des colonnes complètes (statiques + odds)
 */
export const footballColumnsStatic: ColumnDef<FootballTableRow>[] = [
  ...getStaticColumns(),
  ...createOddsColumns(),
];
