"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { buildFootballColumns } from "@/components/tables/v3/column-builder";
import { DataTable } from "@/components/tables/data-table";
import type { MatchWithDetails } from "@/lib/db/queries/v3/matches";
import type { MarketWithOutcomes } from "@/lib/db/queries/v3/markets";
import type { FilterOptions } from "@/types/filters";
import { useFilters } from "@/hooks/use-filters";
import { DateRangeFilter } from "@/components/tables/filters/date-range-filter";
import { CountryFilter } from "@/components/tables/filters/country-filter";
import { LeagueFilter } from "@/components/tables/filters/league-filter";
import { TeamFilter } from "@/components/tables/filters/team-filter";
import { MarketFilter } from "@/components/tables/filters/market-filter";
import { OddsRangeFilter } from "@/components/tables/filters/odds-range-filter";
import { ColumnVisibilitySelector } from "@/components/tables/column-visibility-selector";
import { Button } from "@/components/ui/button";

const STORAGE_KEY_VISIBLE_MARKETS = "oddstracker_visible_markets";

export default function FootballPage() {
  const [loading, setLoading] = React.useState(true);
  const [markets, setMarkets] = React.useState<MarketWithOutcomes[]>([]);
  const [matches, setMatches] = React.useState<MatchWithDetails[]>([]);
  const [total, setTotal] = React.useState(0);
  const [filterOptions, setFilterOptions] = React.useState<FilterOptions>({
    countries: [],
    leagues: [],
    markets: [],
  });
  const [visibleMarkets, setVisibleMarkets] = React.useState<Set<string>>(new Set());

  // TanStack Table states
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Filters hook
  const { filters, updateFilter, resetFilters } = useFilters({
    sportSlug: 'football',
    persist: true,
  });

  // Charger les marchés actifs (pour générer les colonnes)
  const loadMarkets = React.useCallback(async () => {
    try {
      const response = await fetch('/api/v3/markets?sport=football');
      const result = await response.json();

      if (result.success) {
        setMarkets(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement marchés:', error);
    }
  }, []);

  // Charger les options de filtres
  const loadFilterOptions = React.useCallback(async () => {
    try {
      const response = await fetch('/api/v3/filter-options?sport=football');
      const result = await response.json();

      if (result.success) {
        setFilterOptions(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement filter options:', error);
    }
  }, []);

  // Charger les matchs avec filtres
  const loadMatches = React.useCallback(async () => {
    setLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const params = new URLSearchParams({
        sport: 'football',
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      // Ajouter le tri si défini
      if (sorting.length > 0) {
        const sort = sorting[0];
        params.set('sortField', sort.id);
        params.set('sortDirection', sort.desc ? 'desc' : 'asc');
      }

      // Ajouter les filtres de date
      if (filters.dateRange.from) {
        params.set('dateFrom', filters.dateRange.from.toISOString());
      }
      if (filters.dateRange.to) {
        params.set('dateTo', filters.dateRange.to.toISOString());
      }

      // Ajouter les filtres par ID
      if (filters.countryId) {
        params.set('countryIds', filters.countryId);
      }
      if (filters.leagueId) {
        params.set('leagueIds', filters.leagueId);
      }
      if (filters.marketType) {
        params.set('marketIds', filters.marketType);
      }

      // Recherche d'équipe
      if (filters.teamSearch) {
        params.set('teamSearch', filters.teamSearch);
      }

      // Fourchette de cotes (opening + current + marché)
      if (filters.oddsRange.openingMin !== null) {
        params.set('oddsOpeningMin', filters.oddsRange.openingMin.toString());
      }
      if (filters.oddsRange.openingMax !== null) {
        params.set('oddsOpeningMax', filters.oddsRange.openingMax.toString());
      }
      if (filters.oddsRange.currentMin !== null) {
        params.set('oddsCurrentMin', filters.oddsRange.currentMin.toString());
      }
      if (filters.oddsRange.currentMax !== null) {
        params.set('oddsCurrentMax', filters.oddsRange.currentMax.toString());
      }
      if (filters.oddsRange.marketId) {
        params.set('oddsMarketId', filters.oddsRange.marketId);
      }

      const response = await fetch(`/api/v3/matches?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setMatches(result.data);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Erreur chargement matchs:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, filters, sorting]);

  // Charger visibleMarkets depuis localStorage au montage
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_VISIBLE_MARKETS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setVisibleMarkets(new Set(parsed));
      } catch {
        // Ignore
      }
    }
  }, []);

  // Initialiser visibleMarkets avec tous les marchés au chargement
  React.useEffect(() => {
    if (markets.length > 0 && visibleMarkets.size === 0) {
      const allMarketIds = new Set(markets.map((m) => m.id));
      setVisibleMarkets(allMarketIds);
    }
  }, [markets, visibleMarkets.size]);

  // Persister visibleMarkets dans localStorage
  React.useEffect(() => {
    if (visibleMarkets.size > 0) {
      localStorage.setItem(
        STORAGE_KEY_VISIBLE_MARKETS,
        JSON.stringify(Array.from(visibleMarkets))
      );
    }
  }, [visibleMarkets]);

  React.useEffect(() => {
    loadMarkets();
    loadFilterOptions();
  }, [loadMarkets, loadFilterOptions]);

  React.useEffect(() => {
    if (markets.length > 0) {
      loadMatches();
    }
  }, [markets.length, loadMatches]);

  // Générer les colonnes dynamiquement et filtrer par visibleMarkets
  const columns = React.useMemo(() => {
    if (markets.length === 0) return [];

    // Filtrer les marchés visibles
    const visibleMarketsList = markets.filter((m) => visibleMarkets.has(m.id));
    return buildFootballColumns(visibleMarketsList);
  }, [markets, visibleMarkets]);

  // Handlers pour la visibilité des colonnes
  const handleToggleMarket = React.useCallback((marketId: string) => {
    setVisibleMarkets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(marketId)) {
        newSet.delete(marketId);
      } else {
        newSet.add(marketId);
      }
      return newSet;
    });
  }, []);

  const handleShowAllMarkets = React.useCallback(() => {
    const allMarketIds = new Set(markets.map((m) => m.id));
    setVisibleMarkets(allMarketIds);
  }, [markets]);

  const handleHideAllMarkets = React.useCallback(() => {
    setVisibleMarkets(new Set());
  }, []);

  // Calculer le nombre de pages
  const pageCount = Math.ceil(total / pagination.pageSize);

  if (markets.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Chargement des marchés...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Football</p>
        <h1 className="text-3xl font-semibold text-slate-900">⚽ Matchs & Cotes</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {total} matchs • {markets.length} marchés actifs • Colonnes dynamiques
        </p>
      </header>

      {/* Filtres */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Filtres & Réglages</h2>
          <div className="flex gap-2">
            <ColumnVisibilitySelector
              markets={markets}
              visibleMarkets={visibleMarkets}
              onToggleMarket={handleToggleMarket}
              onShowAll={handleShowAllMarkets}
              onHideAll={handleHideAllMarkets}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-xs"
            >
              Réinitialiser filtres
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DateRangeFilter
            value={filters.dateRange}
            onChange={(value) => updateFilter('dateRange', value)}
            label="Période"
          />

          <CountryFilter
            value={filters.countryId}
            options={filterOptions.countries}
            onChange={(value) => updateFilter('countryId', value)}
            label="Pays"
          />

          <LeagueFilter
            value={filters.leagueId}
            options={filterOptions.leagues}
            onChange={(value) => updateFilter('leagueId', value)}
            label="Ligue"
          />

          <MarketFilter
            value={filters.marketType}
            options={filterOptions.markets}
            onChange={(value) => updateFilter('marketType', value)}
            label="Marché"
          />

          <TeamFilter
            value={filters.teamSearch}
            onChange={(value) => updateFilter('teamSearch', value)}
            label="Équipe"
            placeholder="Rechercher..."
          />

          <OddsRangeFilter
            value={filters.oddsRange}
            onChange={(value) => updateFilter('oddsRange', value)}
            markets={filterOptions.markets}
            label="Filtrage par cotes"
            className="md:col-span-3"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={matches}
        pageCount={pageCount}
        pagination={pagination}
        sorting={sorting}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        isLoading={loading}
        pageSizeOptions={[25, 50, 100]}
      />
    </div>
  );
}
