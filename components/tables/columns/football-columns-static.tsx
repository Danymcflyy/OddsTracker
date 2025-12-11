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

// Définitions statiques de TOUTES les colonnes possibles
const ODDS_DEFINITIONS: OddsDefinition[] = [
  // 1X2 (h2h market) - Résultat du match
  { id: "1X2_1", label: "Match Result | 1 Home Win", marketKey: "h2h", outcomeName: "1" },
  { id: "1X2_X", label: "Match Result | X Draw", marketKey: "h2h", outcomeName: "X" },
  { id: "1X2_2", label: "Match Result | 2 Away Win", marketKey: "h2h", outcomeName: "2" },

  // Totals (totals market) - Over/Under buts
  { id: "TOTALS_OVER", label: "Total Goals | Over", marketKey: "totals", outcomeName: "OVER" },
  { id: "TOTALS_UNDER", label: "Total Goals | Under", marketKey: "totals", outcomeName: "UNDER" },

  // Spreads (spreads market) - Asian Handicap
  { id: "SPREADS_1", label: "Asian Handicap | Home", marketKey: "spreads", outcomeName: "1" },
  { id: "SPREADS_2", label: "Asian Handicap | Away", marketKey: "spreads", outcomeName: "2" },

  // Corners Spread - Asian Handicap on corners
  { id: "CORNERS_SPREAD_1", label: "Corners Handicap | Home", marketKey: "corners_spread", outcomeName: "1" },
  { id: "CORNERS_SPREAD_2", label: "Corners Handicap | Away", marketKey: "corners_spread", outcomeName: "2" },

  // Corners Totals - Over/Under corners
  { id: "CORNERS_TOTALS_OVER", label: "Total Corners | Over", marketKey: "corners_totals", outcomeName: "OVER" },
  { id: "CORNERS_TOTALS_UNDER", label: "Total Corners | Under", marketKey: "corners_totals", outcomeName: "UNDER" },

  // Corners Half-Time Spread
  { id: "CORNERS_SPREAD_H1_1", label: "Corners HT Handicap | Home", marketKey: "corners_spread_h1", outcomeName: "1" },
  { id: "CORNERS_SPREAD_H1_2", label: "Corners HT Handicap | Away", marketKey: "corners_spread_h1", outcomeName: "2" },

  // Corners Half-Time Totals
  { id: "CORNERS_TOTALS_H1_OVER", label: "Total Corners HT | Over", marketKey: "corners_totals_h1", outcomeName: "OVER" },
  { id: "CORNERS_TOTALS_H1_UNDER", label: "Total Corners HT | Under", marketKey: "corners_totals_h1", outcomeName: "UNDER" },

  // Bookings Spread - Asian Handicap on cards
  { id: "BOOKINGS_SPREAD_1", label: "Cards Handicap | Home", marketKey: "bookings_spread", outcomeName: "1" },
  { id: "BOOKINGS_SPREAD_2", label: "Cards Handicap | Away", marketKey: "bookings_spread", outcomeName: "2" },

  // Bookings Totals - Over/Under cards
  { id: "BOOKINGS_TOTALS_OVER", label: "Total Cards | Over", marketKey: "bookings_totals", outcomeName: "OVER" },
  { id: "BOOKINGS_TOTALS_UNDER", label: "Total Cards | Under", marketKey: "bookings_totals", outcomeName: "UNDER" },

  // Team Totals Home - Goals scored by home team
  { id: "TEAM_TOTALS_HOME_OVER", label: "Home Goals | Over", marketKey: "team_totals_home", outcomeName: "OVER" },
  { id: "TEAM_TOTALS_HOME_UNDER", label: "Home Goals | Under", marketKey: "team_totals_home", outcomeName: "UNDER" },

  // Team Totals Away - Goals scored by away team
  { id: "TEAM_TOTALS_AWAY_OVER", label: "Away Goals | Over", marketKey: "team_totals_away", outcomeName: "OVER" },
  { id: "TEAM_TOTALS_AWAY_UNDER", label: "Away Goals | Under", marketKey: "team_totals_away", outcomeName: "UNDER" },

  // Half-Time 1X2 - Match result at 45'
  { id: "1X2_H1_1", label: "HT Result | 1 Home Win", marketKey: "h2h_h1", outcomeName: "1" },
  { id: "1X2_H1_X", label: "HT Result | X Draw", marketKey: "h2h_h1", outcomeName: "X" },
  { id: "1X2_H1_2", label: "HT Result | 2 Away Win", marketKey: "h2h_h1", outcomeName: "2" },

  // Half-Time Totals - Total goals at 45'
  { id: "TOTALS_H1_OVER", label: "HT Total Goals | Over", marketKey: "totals_h1", outcomeName: "OVER" },
  { id: "TOTALS_H1_UNDER", label: "HT Total Goals | Under", marketKey: "totals_h1", outcomeName: "UNDER" },

  // ============================================================================
  // LIGNES SPÉCIFIQUES (Over/Under avec handicap et Spreads avec lignes)
  // ============================================================================

  // Totals avec lignes spécifiques
  { id: "TOTALS_OVER_2.5", label: "Total Goals 2.5 | Over", marketKey: "totals", outcomeName: "OVER", line: 2.5 },
  { id: "TOTALS_UNDER_2.5", label: "Total Goals 2.5 | Under", marketKey: "totals", outcomeName: "UNDER", line: 2.5 },
  { id: "TOTALS_OVER_3.0", label: "Total Goals 3.0 | Over", marketKey: "totals", outcomeName: "OVER", line: 3.0 },
  { id: "TOTALS_UNDER_3.0", label: "Total Goals 3.0 | Under", marketKey: "totals", outcomeName: "UNDER", line: 3.0 },
  { id: "TOTALS_OVER_3.5", label: "Total Goals 3.5 | Over", marketKey: "totals", outcomeName: "OVER", line: 3.5 },
  { id: "TOTALS_UNDER_3.5", label: "Total Goals 3.5 | Under", marketKey: "totals", outcomeName: "UNDER", line: 3.5 },

  // Spreads avec lignes spécifiques
  { id: "SPREADS_HOME_-0.5", label: "Asian Handicap -0.5 | Home", marketKey: "spreads", outcomeName: "1", line: -0.5 },
  { id: "SPREADS_AWAY_+0.5", label: "Asian Handicap +0.5 | Away", marketKey: "spreads", outcomeName: "2", line: 0.5 },
  { id: "SPREADS_HOME_-1.0", label: "Asian Handicap -1.0 | Home", marketKey: "spreads", outcomeName: "1", line: -1.0 },
  { id: "SPREADS_AWAY_+1.0", label: "Asian Handicap +1.0 | Away", marketKey: "spreads", outcomeName: "2", line: 1.0 },

  // Corners avec lignes
  { id: "CORNERS_TOTALS_OVER_9.5", label: "Total Corners 9.5 | Over", marketKey: "corners_totals", outcomeName: "OVER", line: 9.5 },
  { id: "CORNERS_TOTALS_UNDER_9.5", label: "Total Corners 9.5 | Under", marketKey: "corners_totals", outcomeName: "UNDER", line: 9.5 },
  { id: "CORNERS_TOTALS_OVER_10.5", label: "Total Corners 10.5 | Over", marketKey: "corners_totals", outcomeName: "OVER", line: 10.5 },
  { id: "CORNERS_TOTALS_UNDER_10.5", label: "Total Corners 10.5 | Under", marketKey: "corners_totals", outcomeName: "UNDER", line: 10.5 },

  // Team Totals avec lignes
  { id: "TEAM_TOTALS_HOME_OVER_1.5", label: "Home Goals 1.5 | Over", marketKey: "team_totals_home", outcomeName: "OVER", line: 1.5 },
  { id: "TEAM_TOTALS_HOME_UNDER_1.5", label: "Home Goals 1.5 | Under", marketKey: "team_totals_home", outcomeName: "UNDER", line: 1.5 },
  { id: "TEAM_TOTALS_AWAY_OVER_1.5", label: "Away Goals 1.5 | Over", marketKey: "team_totals_away", outcomeName: "OVER", line: 1.5 },
  { id: "TEAM_TOTALS_AWAY_UNDER_1.5", label: "Away Goals 1.5 | Under", marketKey: "team_totals_away", outcomeName: "UNDER", line: 1.5 },
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
