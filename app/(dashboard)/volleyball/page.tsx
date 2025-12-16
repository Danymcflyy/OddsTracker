export default function VolleyballPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground">
      <p className="text-lg font-semibold text-slate-900">Cette page Volleyball est temporairement désactivée.</p>
      <p>Merci d'utiliser la nouvelle interface dédiée lorsque disponible.</p>
    </div>
  );
}

/*
Ancienne implémentation conservée pour référence :

"use client";

import Link from "next/link";

import * as React from "react";
import type { PaginationState, SortingState, Table as TanstackTable } from "@tanstack/react-table";
import { Filter, RefreshCw } from "lucide-react";

import { DataTable } from "@/components/tables/data-table";
import { createVolleyballColumns } from "@/components/tables/columns/volleyball-columns";
import { ColumnVisibilityToggle } from "@/components/tables/column-visibility";
import { ExportButtons } from "@/components/tables/export-buttons";
import { DateRangeFilter } from "@/components/tables/filters/date-range-filter";
import { CountryFilter } from "@/components/tables/filters/country-filter";
import { LeagueFilter } from "@/components/tables/filters/league-filter";
import { TeamFilter } from "@/components/tables/filters/team-filter";
import { MarketFilter } from "@/components/tables/filters/market-filter";
import { OddsRangeFilter } from "@/components/tables/filters/odds-range-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFilters } from "@/hooks/use-filters";
import { useFixtures } from "@/hooks/use-fixtures";
import { useMarkets } from "@/hooks/use-markets";
import type { FixtureWithEnrichedOdds, OddWithDetails } from "@/types/fixture";
import type { Filters } from "@/types/filters";

const COLUMN_STORAGE_KEY = "oddstracker_columns_volleyball";

const MARKET_TYPE_OPTIONS = [
  { id: "MONEYLINE", name: "Moneyline" },
  { id: "HANDICAP", name: "Set Handicap" },
  { id: "TOTAL", name: "Total Points" },
];

export default function VolleyballPage() {
  const { fixtures, loading: fixturesLoading, error, isDemoData } = useFixtures("volleyball");
  const { markets, loading: marketsLoading } = useMarkets("volleyball");
  const { filters, updateFilter, resetFilters } = useFilters({ sportSlug: "volleyball" });

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Générer les colonnes dynamiquement depuis les marchés DB
  const columns = React.useMemo(() => {
    return createVolleyballColumns(markets);
  }, [markets]);

  const loading = fixturesLoading || marketsLoading;

  const typedFixtures = React.useMemo(() => {
    if (!Array.isArray(fixtures)) {
      return [];
    }
    return fixtures as FixtureWithEnrichedOdds[];
  }, [fixtures]);

  const countryOptions = React.useMemo(() => {
    const map = new Map<number, string>();
    typedFixtures.forEach((fixture) => {
      const country = fixture.league?.country;
      if (country && typeof country.id === "number") {
        map.set(country.id, country.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id: id.toString(), name }));
  }, [typedFixtures]);

  const leagueOptions = React.useMemo(() => {
    const map = new Map<number, string>();
    typedFixtures.forEach((fixture) => {
      const league = fixture.league;
      if (league && typeof league.id === "number") {
        map.set(league.id, league.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id: id.toString(), name }));
  }, [typedFixtures]);

  const filteredData = React.useMemo(() => {
    return typedFixtures.filter((fixture) => applyFilters(fixture, filters));
  }, [typedFixtures, filters]);

  const pageCount = Math.max(1, Math.ceil(filteredData.length / pagination.pageSize) || 1);

  React.useEffect(() => {
    if (pagination.pageIndex > pageCount - 1) {
      setPagination((prev) => ({ ...prev, pageIndex: Math.max(pageCount - 1, 0) }));
    }
  }, [pageCount, pagination.pageIndex]);

  const paginatedData = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredData slice(start, end);
  }, [filteredData, pagination]);

  const toolbarRenderer = React.useCallback(
    (table: TanstackTable<FixtureWithEnrichedOdds>) => (
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ExportButtons table={table} filename="volleyball" />
        <ColumnVisibilityToggle table={table} storageKey={COLUMN_STORAGE_KEY} />
      </div>
    ),
    []
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Tableau Volleyball</p>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3l font-semibold text-slate-900">🏐 Volleyball</h1>
            <p className="text-sm text-muted-foreground">
              Analyse des moneylines, handicaps sets et totaux points.
            </p>
            {isDemoData && (
              <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Données démo chargées pour faciliter les tests. À remplacer avant la mise en production.
              </p>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Dernière synchronisation :{" "}
            <span className="font-medium text-slate-900">04/12/2025 • 06:00</span>
          </div>
        </div>
      </header>

      <FiltersPanel
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        countryOptions={countryOptions}
        leagueOptions={leagueOptions}
      />

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Résultats : {filteredData.length.toLocaleString("fr-FR")} matchs
          </CardTitle>
          {error ? (
            <p className="text-sm text-destructive">Erreur : {error}</p>
          ) : (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Pagination côté serveur</span>
              <span>•</span>
              <span>Tri multi-colonnes</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={paginatedData}
            pageCount={pageCount}
            pagination={pagination}
            sorting={sorting}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            isLoading={loading}
            renderToolbar={toolbarRenderer}
          />
        </CardContent>
      </Card>
    </div>
  );
}
*/
