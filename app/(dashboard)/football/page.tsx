"use client";

import * as React from "react";
import type { PaginationState, SortingState, Table as TanstackTable } from "@tanstack/react-table";
import { Filter, RefreshCw } from "lucide-react";

import { DataTable } from "@/components/tables/data-table";
import { createFootballColumns } from "@/components/tables/columns/football-columns";
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

const COLUMN_STORAGE_KEY = "oddstracker_columns_football";

const MARKET_TYPE_OPTIONS = [
  { id: "1X2", name: "1X2" },
  { id: "OVER", name: "Over/Under" },
  { id: "HANDICAP", name: "Handicap" },
];

export default function FootballPage() {
  const { fixtures, loading: fixturesLoading, error, isDemoData } = useFixtures("football");
  const { markets, loading: marketsLoading } = useMarkets("football");
  const { filters, updateFilter, resetFilters } = useFilters();

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Générer colonnes dynamiquement depuis les marchés DB
  const columns = React.useMemo(() => {
    return createFootballColumns(markets);
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
      if (country) {
        map.set(country.id, country.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [typedFixtures]);

  const leagueOptions = React.useMemo(() => {
    const map = new Map<number, string>();
    typedFixtures.forEach((fixture) => {
      const league = fixture.league;
      if (league) {
        map.set(league.id, league.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
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
    return filteredData.slice(start, end);
  }, [filteredData, pagination]);

  const toolbarRenderer = React.useCallback(
    (table: TanstackTable<FixtureWithEnrichedOdds>) => (
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ExportButtons table={table} filename="football" />
        <ColumnVisibilityToggle table={table} storageKey={COLUMN_STORAGE_KEY} />
      </div>
    ),
    []
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Tableau Football</p>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">⚽ Football</h1>
            <p className="text-sm text-muted-foreground">
              Données Pinnacle depuis janvier 2019. Filtrez, analysez et exportez les cotes.
            </p>
            {isDemoData && (
              <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Données démo chargées pour les tests. Remplacez par les données réelles (Supabase/OddsPapi) avant la mise en production.
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

type UpdateFilterFn = <K extends keyof Filters>(key: K, value: Filters[K]) => void;

interface FiltersPanelProps {
  filters: Filters;
  updateFilter: UpdateFilterFn;
  resetFilters: () => void;
  countryOptions: { id: number; name: string }[];
  leagueOptions: { id: number; name: string }[];
}

function FiltersPanel({
  filters,
  updateFilter,
  resetFilters,
  countryOptions,
  leagueOptions,
}: FiltersPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Filtres</CardTitle>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Réinitialiser
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <DateRangeFilter
            value={filters.dateRange}
            onChange={(range) => updateFilter("dateRange", range)}
          />
          <CountryFilter
            value={filters.countryId}
            options={countryOptions}
            onChange={(countryId) => updateFilter("countryId", countryId)}
          />
          <LeagueFilter
            value={filters.leagueId}
            options={leagueOptions}
            onChange={(leagueId) => updateFilter("leagueId", leagueId)}
          />
          <TeamFilter
            value={filters.teamSearch}
            onChange={(search) => updateFilter("teamSearch", search)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <MarketFilter
            value={filters.marketType}
            options={MARKET_TYPE_OPTIONS}
            onChange={(value) => updateFilter("marketType", value)}
          />
          <OddsRangeFilter
            value={filters.oddsRange}
            onChange={(range) => updateFilter("oddsRange", range)}
            className="md:col-span-2"
          />

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Raccourcis</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Favorites
              </Button>
              <Button variant="secondary" size="sm">
                Top ligues
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function applyFilters(fixture: FixtureWithEnrichedOdds, filters: Filters) {
  const { dateRange, countryId, leagueId, teamSearch, marketType, oddsRange } = filters;

  if (dateRange.from && new Date(fixture.start_time) < dateRange.from) {
    return false;
  }
  if (dateRange.to && new Date(fixture.start_time) > dateRange.to) {
    return false;
  }

  if (countryId && fixture.league?.country?.id !== countryId) {
    return false;
  }

  if (leagueId && fixture.league?.id !== leagueId) {
    return false;
  }

  if (teamSearch) {
    const searchTerm = teamSearch.toLowerCase();
    const homeMatch = fixture.home_team?.name?.toLowerCase().includes(searchTerm);
    const awayMatch = fixture.away_team?.name?.toLowerCase().includes(searchTerm);
    if (!homeMatch && !awayMatch) {
      return false;
    }
  }

  if (marketType) {
    const hasMarket = fixture.odds?.some((odd) => matchesMarket(odd, marketType));
    if (!hasMarket) {
      return false;
    }
  }

  if (oddsRange.min !== null || oddsRange.max !== null) {
    const matchOdds = fixture.odds?.some((odd) => {
      const price =
        oddsRange.type === "opening"
          ? odd.opening_price
          : (odd.closing_price ?? odd.opening_price);
      if (price === null || price === undefined) return false;
      if (oddsRange.min !== null && price < oddsRange.min) return false;
      if (oddsRange.max !== null && price > oddsRange.max) return false;
      return true;
    });
    if (!matchOdds) {
      return false;
    }
  }

  return true;
}

function matchesMarket(odd: OddWithDetails, marketType: string) {
  const token = marketType.toUpperCase();
  const marketName = normalizeText(odd.market?.name);
  const marketDesc = normalizeText(odd.market?.description);
  return marketName.includes(token) || marketDesc.includes(token);
}

function normalizeText(value?: string | null) {
  return value?.toUpperCase() ?? "";
}
