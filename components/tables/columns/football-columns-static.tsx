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
  line?: number | null; // Handicap/total line (e.g., 2.5, 3.0, -0.5)
}

// Définitions statiques des colonnes
const ODDS_DEFINITIONS: OddsDefinition[] = [
  // ============================================================================
  // MATCH RESULT (1X2)
  // ============================================================================
  { id: "1X2_1", label: "Match Result | 1 Home Win", marketKey: "h2h", outcomeName: "1" },
  { id: "1X2_X", label: "Match Result | X Draw", marketKey: "h2h", outcomeName: "X" },
  { id: "1X2_2", label: "Match Result | 2 Away Win", marketKey: "h2h", outcomeName: "2" },

  // ============================================================================
  // TOTAL GOALS (Over/Under avec lignes spécifiques)
  // ============================================================================
  { id: "TOTALS_OVER_2.5", label: "Total Goals 2.5 | Over", marketKey: "totals", outcomeName: "OVER", line: 2.5 },
  { id: "TOTALS_UNDER_2.5", label: "Total Goals 2.5 | Under", marketKey: "totals", outcomeName: "UNDER", line: 2.5 },
  { id: "TOTALS_OVER_3.0", label: "Total Goals 3.0 | Over", marketKey: "totals", outcomeName: "OVER", line: 3.0 },
  { id: "TOTALS_UNDER_3.0", label: "Total Goals 3.0 | Under", marketKey: "totals", outcomeName: "UNDER", line: 3.0 },
  { id: "TOTALS_OVER_3.5", label: "Total Goals 3.5 | Over", marketKey: "totals", outcomeName: "OVER", line: 3.5 },
  { id: "TOTALS_UNDER_3.5", label: "Total Goals 3.5 | Under", marketKey: "totals", outcomeName: "UNDER", line: 3.5 },

  // ============================================================================
  // ASIAN HANDICAP (Spreads avec lignes spécifiques)
  // ============================================================================
  { id: "SPREADS_HOME_-0.5", label: "Asian Handicap -0.5 | Home", marketKey: "spreads", outcomeName: "1", line: -0.5 },
  { id: "SPREADS_AWAY_+0.5", label: "Asian Handicap +0.5 | Away", marketKey: "spreads", outcomeName: "2", line: 0.5 },
  { id: "SPREADS_HOME_-1.0", label: "Asian Handicap -1.0 | Home", marketKey: "spreads", outcomeName: "1", line: -1.0 },
  { id: "SPREADS_AWAY_+1.0", label: "Asian Handicap +1.0 | Away", marketKey: "spreads", outcomeName: "2", line: 1.0 },

  // ============================================================================
  // TEAM TOTALS (Goals d'une seule équipe)
  // ============================================================================
  { id: "TEAM_TOTALS_HOME_OVER_1.5", label: "Home Goals 1.5 | Over", marketKey: "team_totals_home", outcomeName: "OVER", line: 1.5 },
  { id: "TEAM_TOTALS_HOME_UNDER_1.5", label: "Home Goals 1.5 | Under", marketKey: "team_totals_home", outcomeName: "UNDER", line: 1.5 },
  { id: "TEAM_TOTALS_AWAY_OVER_1.5", label: "Away Goals 1.5 | Over", marketKey: "team_totals_away", outcomeName: "OVER", line: 1.5 },
  { id: "TEAM_TOTALS_AWAY_UNDER_1.5", label: "Away Goals 1.5 | Under", marketKey: "team_totals_away", outcomeName: "UNDER", line: 1.5 },

  // ============================================================================
  // HALF-TIME RESULTS (1X2 à la 45e minute)
  // ============================================================================
  { id: "1X2_H1_1", label: "HT Result | 1 Home Win", marketKey: "h2h_h1", outcomeName: "1" },
  { id: "1X2_H1_X", label: "HT Result | X Draw", marketKey: "h2h_h1", outcomeName: "X" },
  { id: "1X2_H1_2", label: "HT Result | 2 Away Win", marketKey: "h2h_h1", outcomeName: "2" },
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
      cell: ({ row }) => {
        const leagueName = row.original.league?.name ?? "-";
        // Extract only the league name (after " - " if present)
        const displayName = leagueName.includes(" - ")
          ? leagueName.split(" - ").pop()
          : leagueName;
        return <div className="font-medium">{displayName}</div>;
      },
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
      // Chercher l'odd qui correspond à cette définition (avec ligne si applicable)
      const odd = findOdd(row.original, definition.marketKey, definition.outcomeName, definition.line);

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
  outcomeName: string,
  line?: number | null
): OddWithDetails | undefined {
  return row.odds?.find((odd) => {
    // Comparer le market name (exact match avec oddsapi_key)
    const matchesMarket = odd.market?.name === marketKey;

    // Comparer le outcome name (exact match avec nom normalisé)
    const matchesOutcome = odd.outcome?.name === outcomeName;

    // Comparer la ligne si spécifiée (pour spreads/totals avec handicap)
    let matchesLine = true;
    if (line !== undefined && line !== null) {
      matchesLine = odd.line === line || (odd.market?.handicap !== undefined && odd.market.handicap === line);
    }

    return matchesMarket && matchesOutcome && matchesLine;
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
