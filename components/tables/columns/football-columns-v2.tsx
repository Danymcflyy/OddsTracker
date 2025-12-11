"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import type { FixtureWithEnrichedOdds, OddWithDetails } from "@/types/fixture";

type FootballTableRow = FixtureWithEnrichedOdds;

export function createFootballColumns(fixtures?: FixtureWithEnrichedOdds[]): ColumnDef<FootballTableRow>[] {
  // Colonnes statiques (Date, Pays, Ligue, Équipes, Scores)
  const staticColumns = getStaticColumns();

  // Si pas de fixtures, retourner juste les colonnes statiques
  if (!fixtures || fixtures.length === 0) {
    return staticColumns;
  }

  // Extraire tous les odds uniques des fixtures
  const oddsDefinitions = extractUniqueOdds(fixtures);

  // Créer les colonnes d'odds
  const oddsColumns = oddsDefinitions.flatMap((oddDef) => [
    buildOddColumn(oddDef, "opening"),
    buildOddColumn(oddDef, "closing"),
  ]);

  return [...staticColumns, ...oddsColumns];
}

/**
 * Extrait tous les odds uniques des fixtures
 */
function extractUniqueOdds(fixtures: FixtureWithEnrichedOdds[]): OddDefinition[] {
  const seen = new Set<string>();
  const definitions: OddDefinition[] = [];

  for (const fixture of fixtures) {
    if (!fixture.odds) continue;

    for (const odd of fixture.odds) {
      if (!odd.market || !odd.outcome) continue;

      // Clé unique: market_id + outcome_name
      const key = `${odd.market.id}-${odd.outcome.name}`;
      if (seen.has(key)) continue;

      seen.add(key);
      definitions.push({
        marketId: odd.market.id,
        marketName: odd.market.name || "Unknown",
        marketDescription: odd.market.description || "",
        outcomeName: odd.outcome.name,
        outcomeDescription: odd.outcome.description,
      });
    }
  }

  return definitions.sort((a, b) => {
    // Trier par marché, puis outcome
    const marketCmp = (a.marketName || "").localeCompare(b.marketName || "");
    if (marketCmp !== 0) return marketCmp;
    return (a.outcomeDescription || "").localeCompare(b.outcomeDescription || "");
  });
}

interface OddDefinition {
  marketId: string | number;
  marketName: string;
  marketDescription: string;
  outcomeName: string;
  outcomeDescription?: string;
}

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

function buildOddColumn(oddDef: OddDefinition, priceType: "opening" | "closing"): ColumnDef<FootballTableRow> {
  const suffix = priceType === "opening" ? "O" : "C";
  const columnId = `${oddDef.marketName}-${oddDef.outcomeName}-${suffix}`;
  const header = `${oddDef.marketName}/${oddDef.outcomeDescription || oddDef.outcomeName} ${suffix}`;

  return {
    id: columnId,
    header: <div className="text-xs font-semibold">{header}</div>,
    cell: ({ row }) => {
      // Chercher l'odd qui correspond à ce marché + outcome
      const odd = row.original.odds?.find((o) => {
        return (
          o.market?.id === oddDef.marketId &&
          o.outcome?.name === oddDef.outcomeName
        );
      });

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
  };
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

  const isWinner = team === "home" ? home > away : away > home;
  return isWinner ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700";
}

/**
 * Export pour compatibilité - colonnes par défaut
 */
export const footballColumns = createFootballColumns();
