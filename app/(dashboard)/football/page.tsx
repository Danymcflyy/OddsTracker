"use client";

import * as React from "react";
import { Loader2, Download } from "lucide-react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { buildFootballColumns, type ColumnConfig, type OutcomeType } from "@/components/tables/v4/column-builder";
import { DataTable } from "@/components/tables/data-table";
import type { EventWithOdds, FilterOptions } from "@/lib/db/queries-frontend";
import { DateRangeFilter } from "@/components/tables/filters/date-range-filter";
import { TeamFilter } from "@/components/tables/filters/team-filter";
import { AdvancedSearchFilter, type AdvancedSearchParams } from "@/components/tables/filters/advanced-search-filter";
import { ColumnVisibilitySelector } from "@/components/tables/column-visibility-selector";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const STORAGE_KEY_VISIBLE_MARKETS = "oddstracker_visible_markets";

export default function FootballPage() {
  const [loading, setLoading] = React.useState(true);
  const [events, setEvents] = React.useState<EventWithOdds[]>([]);
  const [total, setTotal] = React.useState(0);
  const [filterOptions, setFilterOptions] = React.useState<FilterOptions>({
    sports: [],
    markets: [],
  });
  const [visibleMarkets, setVisibleMarkets] = React.useState<Set<string>>(new Set());
  const [columnConfig, setColumnConfig] = React.useState<ColumnConfig>({});
  const [customMarketOrder, setCustomMarketOrder] = React.useState<string[]>([]);

  // Filtres simples
  const [dateRange, setDateRange] = React.useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  });
  const [teamSearch, setTeamSearch] = React.useState<string>('');
  const [selectedSport, setSelectedSport] = React.useState<string | null>(null);
  const [advancedSearch, setAdvancedSearch] = React.useState<AdvancedSearchParams>({
    oddsType: 'both',
    outcome: 'all',
    marketType: 'all',
  });

  // Outcomes toujours tous affichés
  const selectedOutcomes: OutcomeType[] = ['home', 'away', 'draw', 'over', 'under', 'yes', 'no'];

  // TanStack Table states
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Charger la configuration des colonnes
  const loadColumnConfig = React.useCallback(async () => {
    try {
      const response = await fetch('/api/v4/settings?key=column_config');
      const result = await response.json();

      if (result.success && result.data) {
        const config: ColumnConfig = {
          marketLabels: result.data.marketLabels,
          outcomeLabels: result.data.outcomeLabels,
          variationTemplate: result.data.variationTemplate,
        };
        setColumnConfig(config);

        // Charger aussi l'ordre des marchés si disponible
        if (result.data.marketOrder && Array.isArray(result.data.marketOrder)) {
          setCustomMarketOrder(result.data.marketOrder);
        }
      }
    } catch (error) {
      console.error('Erreur chargement configuration colonnes:', error);
    }
  }, []);

  // Charger les options de filtres (sports et marchés disponibles)
  const loadFilterOptions = React.useCallback(async () => {
    try {
      const response = await fetch('/api/v4/filter-options');
      const result = await response.json();

      if (result.success && result.data) {
        // Ensure sports and markets are arrays
        setFilterOptions({
          sports: Array.isArray(result.data.sports) ? result.data.sports : [],
          markets: Array.isArray(result.data.markets) ? result.data.markets : [],
        });
      }
    } catch (error) {
      console.error('Erreur chargement filter options:', error);
      // Keep default empty arrays on error
      setFilterOptions({
        sports: [],
        markets: [],
      });
    }
  }, []);

  // Charger les événements avec filtres
  const loadEvents = React.useCallback(async () => {
    setLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const params = new URLSearchParams({
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
      if (dateRange.from) {
        params.set('dateFrom', dateRange.from.toISOString());
      }
      if (dateRange.to) {
        params.set('dateTo', dateRange.to.toISOString());
      }

      // Recherche d'équipe
      if (teamSearch) {
        params.set('search', teamSearch);
      }

      // Filtre par championnat
      if (selectedSport) {
        params.set('sportKey', selectedSport);
      }

      // Filtres avancés - Fourchettes séparées opening/closing
      if (advancedSearch.openingOddsMin !== undefined) params.set('openingOddsMin', advancedSearch.openingOddsMin.toString());
      if (advancedSearch.openingOddsMax !== undefined) params.set('openingOddsMax', advancedSearch.openingOddsMax.toString());
      if (advancedSearch.closingOddsMin !== undefined) params.set('closingOddsMin', advancedSearch.closingOddsMin.toString());
      if (advancedSearch.closingOddsMax !== undefined) params.set('closingOddsMax', advancedSearch.closingOddsMax.toString());
      if (advancedSearch.movementDirection && advancedSearch.movementDirection !== 'all') params.set('movementDirection', advancedSearch.movementDirection);
      if (advancedSearch.outcome && advancedSearch.outcome !== 'all') params.set('outcome', advancedSearch.outcome);
      if (advancedSearch.marketType && advancedSearch.marketType !== 'all') params.set('marketKey', advancedSearch.marketType);
      if (advancedSearch.pointValue !== undefined) params.set('pointValue', advancedSearch.pointValue.toString());
      if (advancedSearch.status && advancedSearch.status !== 'all') params.set('status', advancedSearch.status);

      // Add cache-busting parameter
      params.set('_t', Date.now().toString());

      const response = await fetch(`/api/v4/events?${params.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const result = await response.json();

      if (result.success) {
        setEvents(result.data);
        setTotal(result.total);
      }
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, dateRange, teamSearch, selectedSport, sorting, advancedSearch]);

  // Découvrir toutes les combinaisons uniques (market, point) depuis les events
  const marketPointCombinations = React.useMemo(() => {
    const combinations = new Map<string, { key: string; name: string; point?: number }>();

    for (const event of events) {
      // Skip events without opening_odds
      if (!event.opening_odds || !Array.isArray(event.opening_odds)) continue;

      for (const market of event.opening_odds) {
        const point = market.odds?.point;
        const combinationKey = point !== undefined ? `${market.market_key}:${point}` : market.market_key;

        if (!combinations.has(combinationKey)) {
          const displayName = point !== undefined
            ? `${market.market_name} (${point > 0 ? '+' : ''}${point})`
            : market.market_name;

          combinations.set(combinationKey, {
            key: combinationKey,
            name: displayName,
            point,
          });
        }
      }
    }

    // Ordre d'affichage des marchés (utiliser l'ordre personnalisé si disponible)
    const marketOrder = customMarketOrder.length > 0 ? customMarketOrder : [
      'h2h',              // 1X2 en premier
      'spreads',          // Handicap
      'totals',           // Over/Under
      'h2h_h1',           // 1X2 H1
      'spreads_h1',       // Handicap H1
      'totals_h1',        // Over/Under H1
      'team_totals_home', // Team Totals Domicile
      'team_totals_away', // Team Totals Extérieur
      'draw_no_bet',      // Draw No Bet
      'btts',             // Les deux équipes marquent
    ];

    return Array.from(combinations.values()).sort((a, b) => {
      // Extraire le market_key de base (avant le ":")
      const getBaseKey = (key: string) => key.includes(':') ? key.split(':')[0] : key;
      const aBaseKey = getBaseKey(a.key);
      const bBaseKey = getBaseKey(b.key);

      // Trouver leur position dans marketOrder
      const aOrder = marketOrder.indexOf(aBaseKey);
      const bOrder = marketOrder.indexOf(bBaseKey);

      // Si différents marchés, trier par ordre défini
      if (aOrder !== bOrder) {
        // Si un marché n'est pas dans la liste, le mettre à la fin
        if (aOrder === -1) return 1;
        if (bOrder === -1) return -1;
        return aOrder - bOrder;
      }

      // Même marché, trier par point
      const aPoint = a.point ?? 0;
      const bPoint = b.point ?? 0;
      return aPoint - bPoint;
    });
  }, [events, customMarketOrder]);

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

  // Initialiser visibleMarkets avec toutes les combinaisons au chargement
  React.useEffect(() => {
    if (marketPointCombinations.length > 0 && visibleMarkets.size === 0) {
      const allCombinationKeys = new Set(marketPointCombinations.map((m) => m.key));
      setVisibleMarkets(allCombinationKeys);
    }
  }, [marketPointCombinations, visibleMarkets.size]);

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
    loadColumnConfig();
    loadFilterOptions();
  }, [loadColumnConfig, loadFilterOptions]);

  React.useEffect(() => {
    if (filterOptions.markets.length > 0) {
      loadEvents();
    }
  }, [filterOptions.markets.length, loadEvents]);

  // Reset pagination to page 1 when filters change
  React.useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [teamSearch, selectedSport, dateRange, advancedSearch]);

  // Les événements sont directement utilisés (filtrage côté serveur)
  const filteredEvents = events;

  // Générer les colonnes dynamiquement et filtrer par visibleMarkets
  // Note: Toujours appeler buildFootballColumns même sans marchés pour avoir les colonnes statiques (Score, Équipes, etc.)
  const columns = React.useMemo(() => {
    const visibleCombinations = marketPointCombinations.filter((m) => visibleMarkets.has(m.key));
    return buildFootballColumns(visibleCombinations, selectedOutcomes, columnConfig);
  }, [marketPointCombinations, visibleMarkets, selectedOutcomes, columnConfig]);

  // Handlers pour la visibilité des colonnes
  const handleToggleMarket = React.useCallback((marketKey: string) => {
    setVisibleMarkets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(marketKey)) {
        newSet.delete(marketKey);
      } else {
        newSet.add(marketKey);
      }
      return newSet;
    });
  }, []);

  const handleShowAllMarkets = React.useCallback(() => {
    const allCombinationKeys = new Set(marketPointCombinations.map((m) => m.key));
    setVisibleMarkets(allCombinationKeys);
  }, [marketPointCombinations]);

  const handleHideAllMarkets = React.useCallback(() => {
    setVisibleMarkets(new Set());
  }, []);

  // Reset filters handler
  const handleResetFilters = React.useCallback(() => {
    setDateRange({ from: null, to: null });
    setTeamSearch('');
    setSelectedSport(null);
    setAdvancedSearch({
      oddsType: 'both',
      outcome: 'all',
      marketType: 'all',
      status: 'all',
      movementDirection: 'all',
      openingOddsMin: undefined,
      openingOddsMax: undefined,
      closingOddsMin: undefined,
      closingOddsMax: undefined,
      pointValue: undefined
    });
  }, []);

  // Export CSV function
  const handleExportCSV = React.useCallback(() => {
    if (filteredEvents.length === 0) return;

    // CSV headers
    const headers = [
      'Date',
      'Championnat',
      'Domicile',
      'Extérieur',
      'Statut',
      'Score',
      'Marché',
      'Ligne',
      'Open Home',
      'Open Draw',
      'Open Away',
      'Open Over',
      'Open Under',
      'Close Home',
      'Close Draw',
      'Close Away',
      'Close Over',
      'Close Under',
      'CLV Home %',
      'CLV Away %',
    ];

    const rows: string[][] = [];

    filteredEvents.forEach(event => {
      const baseRow = [
        new Date(event.commence_time).toLocaleString('fr-FR'),
        event.sport_title || event.sport_key,
        event.home_team,
        event.away_team,
        event.status,
        event.home_score !== null && event.away_score !== null
          ? `${event.home_score}-${event.away_score}`
          : '',
      ];

      // Add rows for each market
      const markets = new Set<string>();
      event.opening_odds.forEach(o => markets.add(o.market_key));
      if (event.closing_odds?.markets) {
        Object.keys(event.closing_odds.markets).forEach(k => markets.add(k));
      }

      markets.forEach(marketKey => {
        const opening = event.opening_odds.find(o => o.market_key === marketKey);
        const closing = event.closing_odds?.markets?.[marketKey];
        const openOdds = opening?.odds || {};
        const closeOdds = closing || {};

        const calcCLV = (open: number | undefined, close: number | undefined) => {
          if (typeof open !== 'number' || typeof close !== 'number' || open === 0) return '';
          return (((open - close) / open) * 100).toFixed(2);
        };

        rows.push([
          ...baseRow,
          marketKey,
          openOdds.point?.toString() || closeOdds.point?.toString() || '',
          openOdds.home?.toFixed(2) || '',
          openOdds.draw?.toFixed(2) || '',
          openOdds.away?.toFixed(2) || '',
          openOdds.over?.toFixed(2) || '',
          openOdds.under?.toFixed(2) || '',
          closeOdds.home?.toFixed(2) || '',
          closeOdds.draw?.toFixed(2) || '',
          closeOdds.away?.toFixed(2) || '',
          closeOdds.over?.toFixed(2) || '',
          closeOdds.under?.toFixed(2) || '',
          calcCLV(openOdds.home, closeOdds.home),
          calcCLV(openOdds.away, closeOdds.away),
        ]);
      });
    });

    // Generate CSV content
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    // Download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oddstracker_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredEvents]);

  // Calculer le nombre de pages
  const pageCount = Math.ceil(total / pagination.pageSize);

  if (filterOptions.markets.length === 0) {
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
        <h1 className="text-3xl font-semibold text-slate-900">Matchs & Cotes</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {filteredEvents.length} matchs affichés ({total} total) • {filterOptions.markets.length} marchés actifs • The Odds API v4
        </p>
      </header>

      {/* Filtres */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">Filtres & Réglages</h2>
          <div className="flex gap-2">
            <ColumnVisibilitySelector
              markets={marketPointCombinations}
              visibleMarkets={visibleMarkets}
              onToggleMarket={handleToggleMarket}
              onShowAll={handleShowAllMarkets}
              onHideAll={handleHideAllMarkets}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs"
            >
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs"
            >
              Réinitialiser filtres
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtre Championnat */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Championnat</Label>
            <Select
              value={selectedSport ?? "all"}
              onValueChange={(value) => setSelectedSport(value === "all" ? null : value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tous les championnats" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les championnats</SelectItem>
                {(filterOptions.sports || []).map((sport) => (
                  <SelectItem key={sport.api_key} value={sport.api_key}>
                    {sport.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre Équipe */}
          <TeamFilter
            value={teamSearch}
            onChange={setTeamSearch}
            label="Équipe"
            placeholder="Rechercher une équipe..."
          />

          {/* Filtre Date */}
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            label="Période"
          />
        </div>

        {/* Recherche Avancée */}
        <div className="mt-4 pt-4 border-t">
          <AdvancedSearchFilter
            value={advancedSearch}
            onChange={setAdvancedSearch}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredEvents}
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
// Build timestamp: 1769459924
