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

  // Export CSV function - replicates exact table structure
  const handleExportCSV = React.useCallback(() => {
    if (filteredEvents.length === 0) return;

    // Market short names (same as column-builder)
    const MARKET_SHORT_NAMES: Record<string, string> = {
      'h2h': '1X2', 'h2h_h1': '1X2 MT1', 'spreads': 'Handicap', 'spreads_h1': 'Handicap MT1',
      'totals': 'O/U', 'totals_h1': 'O/U MT1', 'draw_no_bet': 'DNB', 'btts': 'BTTS',
      'team_totals_home': 'TT Dom', 'team_totals_away': 'TT Ext',
    };
    const OUTCOME_SHORT_NAMES: Record<string, string> = {
      'home': '1', 'draw': 'X', 'away': '2', 'over': '+', 'under': '-', 'yes': 'Oui', 'no': 'Non',
    };

    // Get visible markets from the current table configuration
    const visibleMarketsArray = Array.from(visibleMarkets).sort();

    // Build headers: static columns + dynamic market columns
    const headers: string[] = ['Date', 'Ligue', 'Dom.', 'Ext.', 'Snaps', 'Score'];

    // For each visible market, add O and C columns for each outcome
    visibleMarketsArray.forEach(marketKey => {
      const [baseKey, pointStr] = marketKey.includes(':') ? marketKey.split(':') : [marketKey, undefined];
      const point = pointStr ? parseFloat(pointStr) : undefined;
      const marketLabel = MARKET_SHORT_NAMES[baseKey] || baseKey;
      const pointLabel = point !== undefined ? (point > 0 ? `+${point}` : `${point}`) : '';
      const prefix = pointLabel ? `${marketLabel} ${pointLabel}` : marketLabel;

      // Determine outcomes for this market
      let outcomes: string[] = [];
      if (baseKey === 'h2h' || baseKey === 'h2h_h1' || baseKey === 'draw_no_bet') {
        outcomes = baseKey === 'draw_no_bet' ? ['home', 'away'] : ['home', 'draw', 'away'];
      } else if (baseKey.includes('totals') || baseKey.includes('spread')) {
        outcomes = baseKey.includes('spread') ? ['home', 'away'] : ['over', 'under'];
      } else if (baseKey === 'btts') {
        outcomes = ['yes', 'no'];
      } else {
        outcomes = ['home', 'draw', 'away'];
      }

      outcomes.forEach(outcome => {
        const outcomeLabel = OUTCOME_SHORT_NAMES[outcome] || outcome;
        headers.push(`${prefix} ${outcomeLabel} O`);
        headers.push(`${prefix} ${outcomeLabel} C`);
      });
    });

    // Helper to get odds value (simplified version of column-builder logic)
    const getOddsValue = (event: EventWithOdds, baseKey: string, outcome: string, point: number | undefined, type: 'opening' | 'closing'): string => {
      const isSpread = baseKey.includes('spread');

      if (type === 'opening') {
        if (!event.opening_odds || !Array.isArray(event.opening_odds)) return '';
        let marketData = event.opening_odds.find((m) => {
          if (m.market_key !== baseKey) return false;
          if (point !== undefined) return m.odds?.point === point;
          return true;
        });
        if (marketData?.odds?.[outcome]) return marketData.odds[outcome].toFixed(2);
        // Mirror search for spreads
        if (isSpread && point !== undefined) {
          const mirrorPoint = -1 * point;
          const mirrorOutcome = outcome === 'home' ? 'away' : outcome === 'away' ? 'home' : outcome;
          marketData = event.opening_odds.find((m) => m.market_key === baseKey && m.odds?.point === mirrorPoint);
          if (marketData?.odds?.[mirrorOutcome]) return marketData.odds[mirrorOutcome].toFixed(2);
        }
        return '';
      } else {
        const closingData = event.closing_odds;
        if (!closingData) return '';

        // Check variations first
        if (closingData.markets_variations?.[baseKey]) {
          const variations = closingData.markets_variations[baseKey];
          if (Array.isArray(variations)) {
            const found = point !== undefined ? variations.find((v: any) => v.point === point) : variations[0];
            if (found?.[outcome]) return found[outcome].toFixed(2);
            // Mirror for spreads
            if (isSpread && point !== undefined) {
              const mirrorPoint = -1 * point;
              const mirrorOutcome = outcome === 'home' ? 'away' : outcome === 'away' ? 'home' : outcome;
              const mirrorFound = variations.find((v: any) => v.point === mirrorPoint);
              if (mirrorFound?.[mirrorOutcome]) return mirrorFound[mirrorOutcome].toFixed(2);
            }
          }
        }

        // Fallback to main markets
        if (closingData.markets?.[baseKey]) {
          const fallback = closingData.markets[baseKey];
          if ((point === undefined || fallback.point === point) && fallback[outcome]) {
            return fallback[outcome].toFixed(2);
          }
          if (isSpread && point !== undefined && fallback.point === (-1 * point)) {
            const mirrorOutcome = outcome === 'home' ? 'away' : outcome === 'away' ? 'home' : outcome;
            if (fallback[mirrorOutcome]) return fallback[mirrorOutcome].toFixed(2);
          }
        }
        return '';
      }
    };

    // Build rows
    const rows: string[][] = filteredEvents.map(event => {
      const row: string[] = [
        new Date(event.commence_time).toLocaleDateString('fr-FR') + ' ' + new Date(event.commence_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        event.sport_title?.split(' - ')[0] || event.sport_key,
        event.home_team,
        event.away_team,
        String(event.snapshot_count || 0),
        event.status === 'completed' && event.home_score !== null && event.away_score !== null
          ? `${event.home_score}-${event.away_score}` : '',
      ];

      // Add odds for each visible market
      visibleMarketsArray.forEach(marketKey => {
        const [baseKey, pointStr] = marketKey.includes(':') ? marketKey.split(':') : [marketKey, undefined];
        const point = pointStr ? parseFloat(pointStr) : undefined;

        let outcomes: string[] = [];
        if (baseKey === 'h2h' || baseKey === 'h2h_h1' || baseKey === 'draw_no_bet') {
          outcomes = baseKey === 'draw_no_bet' ? ['home', 'away'] : ['home', 'draw', 'away'];
        } else if (baseKey.includes('totals') || baseKey.includes('spread')) {
          outcomes = baseKey.includes('spread') ? ['home', 'away'] : ['over', 'under'];
        } else if (baseKey === 'btts') {
          outcomes = ['yes', 'no'];
        } else {
          outcomes = ['home', 'draw', 'away'];
        }

        outcomes.forEach(outcome => {
          row.push(getOddsValue(event, baseKey, outcome, point, 'opening'));
          row.push(getOddsValue(event, baseKey, outcome, point, 'closing'));
        });
      });

      return row;
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
  }, [filteredEvents, visibleMarkets]);

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
