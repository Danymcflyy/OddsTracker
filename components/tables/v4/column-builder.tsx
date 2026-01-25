/**
 * Column Builder v4 - The Odds API v4
 * Génère les colonnes dynamiques imbriquées (3 niveaux) pour le tableau de matchs
 */

import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { fr } from 'date-fns/locale';
import type { EventWithOdds } from '@/lib/db/queries-frontend';
import { getMarketResult, getResultColorClass } from '@/lib/utils/bet-results';

const PARIS_TZ = 'Europe/Paris';
const columnHelper = createColumnHelper<EventWithOdds>();

interface MarketOption {
  key: string;
  name: string;
  point?: number;
}

export type OutcomeType = 'home' | 'away' | 'draw' | 'over' | 'under';

export interface ColumnConfig {
  marketLabels?: Record<string, string>;
  outcomeLabels?: Record<string, string>;
  variationTemplate?: string;
}

const MARKET_SHORT_NAMES: Record<string, string> = {
  'h2h': '1X2',
  'h2h_h1': '1X2 MT1',
  'h2h_h2': '1X2 MT2',
  'spreads': 'Handicap',
  'spreads_h1': 'Handicap MT1',
  'spreads_h2': 'Handicap MT2',
  'totals': 'O/U',
  'totals_h1': 'O/U MT1',
  'totals_h2': 'O/U MT2',
  'draw_no_bet': 'DNB',
  'btts': 'BTTS',
  'team_totals': 'TT',
};

const OUTCOME_SHORT_NAMES: Record<OutcomeType, string> = {
  'home': '1',
  'draw': 'X',
  'away': '2',
  'over': '+',
  'under': '-',
};

function getMarketOutcomes(marketKey: string): OutcomeType[] {
  if (marketKey === 'h2h' || marketKey === 'h2h_h1' || marketKey === 'h2h_h2' || marketKey === 'h2h_3_way') {
    return ['home', 'draw', 'away'];
  }
  if (marketKey === 'totals' || marketKey === 'totals_h1' || marketKey === 'totals_h2' ||
      marketKey === 'team_totals' || marketKey === 'alternate_team_totals') {
    return ['over', 'under'];
  }
  if (marketKey === 'spreads' || marketKey === 'spreads_h1' || marketKey === 'spreads_h2' ||
      marketKey === 'alternate_spreads' || marketKey === 'alternate_spreads_h1') {
    return ['home', 'away'];
  }
  if (marketKey === 'draw_no_bet') {
    return ['home', 'away'];
  }
  if (marketKey === 'btts') {
    return ['over', 'under'];
  }
  return ['home', 'away', 'draw'];
}

function getMarketLabel(marketKey: string, config?: ColumnConfig): string {
  return config?.marketLabels?.[marketKey] || MARKET_SHORT_NAMES[marketKey] || marketKey;
}

function getOutcomeLabel(outcome: OutcomeType, config?: ColumnConfig): string {
  return config?.outcomeLabels?.[outcome] || OUTCOME_SHORT_NAMES[outcome];
}

export function buildFootballColumns(
  markets: MarketOption[],
  visibleOutcomes: OutcomeType[] = ['home', 'away', 'draw', 'over', 'under'],
  config?: ColumnConfig
): ColumnDef<EventWithOdds>[] {
  const columns: ColumnDef<EventWithOdds>[] = [];

  // 1. Colonnes Statiques
  columns.push(columnHelper.accessor('commence_time', {
    id: 'commence_time',
    header: 'Date',
    cell: ({ row }) => {
      const dateStr = row.original.commence_time;
      if (!dateStr) return '-';
      try {
        const date = new Date(dateStr);
        const parisDate = toZonedTime(date, PARIS_TZ);
        return <span className="whitespace-nowrap text-xs">{format(parisDate, 'dd/MM HH:mm', { locale: fr })}</span>;
      } catch {
        return dateStr;
      }
    },
    size: 90,
  }) as any);

  columns.push(columnHelper.accessor('sport_title', {
    id: 'sport_title',
    header: 'Ligue',
    cell: ({ row }) => {
      const title = row.original.sport_title || '-';
      const shortTitle = title.split(' - ')[0];
      return <span className="text-xs truncate max-w-[100px]" title={title}>{shortTitle}</span>;
    },
    size: 100,
    enableSorting: false,
  }) as any);

  columns.push(columnHelper.accessor('home_team', {
    id: 'home_team',
    header: 'Dom.',
    cell: ({ row }) => (
      <span className="text-xs font-medium truncate max-w-[120px]" title={row.original.home_team}>
        {row.original.home_team || '-'}
      </span>
    ),
    size: 120,
    enableSorting: false,
  }) as any);

  columns.push(columnHelper.accessor('away_team', {
    id: 'away_team',
    header: 'Ext.',
    cell: ({ row }) => (
      <span className="text-xs truncate max-w-[120px]" title={row.original.away_team}>
        {row.original.away_team || '-'}
      </span>
    ),
    size: 120,
    enableSorting: false,
  }) as any);

  columns.push(columnHelper.display({
    id: 'monitoring',
    header: 'Snaps',
    cell: ({ row }) => {
      const lastSnapshot = row.original.last_snapshot_at;
      const count = row.original.snapshot_count || 0;
      if (lastSnapshot) {
        const date = new Date(lastSnapshot);
        const parisDate = toZonedTime(date, PARIS_TZ);
        return (
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-medium text-blue-600 bg-blue-50 px-1 rounded">{count}</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">{format(parisDate, 'HH:mm', { locale: fr })}</span>
          </div>
        );
      }
      return <span className="text-xs text-muted-foreground">-</span>;
    },
    size: 50,
    enableSorting: false,
  }) as any);

  columns.push(columnHelper.display({
    id: 'score',
    header: 'Score',
    cell: ({ row }) => {
      const { status, home_score, away_score } = row.original;
      if (status === 'completed' && home_score !== null && away_score !== null) {
        return <span className="text-xs font-bold text-center">{home_score}-{away_score}</span>;
      }
      return <span className="text-muted-foreground text-xs">-</span>;
    },
    size: 50,
    enableSorting: false,
  }) as any);

  // 2. Colonnes Dynamiques Groupées (3 niveaux)
  const marketsByBase = new Map<string, Map<number | undefined, MarketOption>>();

  markets.forEach(market => {
    const baseKey = market.key.includes(':') ? market.key.split(':')[0] : market.key;
    if (!marketsByBase.has(baseKey)) {
      marketsByBase.set(baseKey, new Map());
    }
    marketsByBase.get(baseKey)!.set(market.point, market);
  });

  marketsByBase.forEach((variationsMap, baseKey) => {
    const marketLabel = getMarketLabel(baseKey, config);
    const outcomes = getMarketOutcomes(baseKey);
    const activeOutcomes = outcomes.filter(o => visibleOutcomes.includes(o));
    
    if (activeOutcomes.length === 0) return;

    const marketGroupColumns: ColumnDef<EventWithOdds>[] = [];
const POPULAR_POINTS = {
  spreads: [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, -0.25, -0.5, -0.75, -1, -1.25, -1.5],
  totals: [1.5, 2.5, 3.5, 4.5],
};

function isPopularPoint(marketKey: string, point: number | undefined): boolean {
  if (point === undefined) return true; // Keep markets without points (1X2)
  
  if (marketKey.includes('spreads')) {
    return POPULAR_POINTS.spreads.includes(point);
  }
  if (marketKey.includes('totals') && !marketKey.includes('team')) { // Exclude team totals from strict filtering for now or add specific list
    return POPULAR_POINTS.totals.includes(point);
  }
  return true; // Keep other markets by default
}

// ... inside buildFootballColumns ...

    // Trier les variations (points)
    const sortedPoints = Array.from(variationsMap.keys()).sort((a, b) => (a ?? 0) - (b ?? 0));

    sortedPoints.forEach(point => {
      // ... rest of the loop

      
      if (point !== undefined) {
        variationLabel = point > 0 ? `+${point}` : `${point}`;
      } else if (sortedPoints.length > 1) {
        variationLabel = 'Std';
      }

      const outcomeColumns: ColumnDef<EventWithOdds>[] = [];

      activeOutcomes.forEach(outcome => {
        const outcomeLabel = getOutcomeLabel(outcome, config);

        const dataColumns: ColumnDef<EventWithOdds>[] = [
          columnHelper.display({
            id: `${marketOption.key}_${outcome}_opening`,
            header: 'O',
            cell: ({ row }) => {
              const val = getOddsValue(row.original, baseKey, outcome, point, 'opening');
              const res = getResult(row.original, baseKey, outcome, point);
              const color = getResultColorClass(res);
              return <span className={`text-xs font-mono ${color}`}>{val}</span>;
            },
            size: 45,
          }),
          columnHelper.display({
            id: `${marketOption.key}_${outcome}_closing`,
            header: 'C',
            cell: ({ row }) => {
              const val = getOddsValue(row.original, baseKey, outcome, point, 'closing');
              const res = getResult(row.original, baseKey, outcome, point);
              const color = getResultColorClass(res);
              return <span className={`text-xs font-mono ${color}`}>{val}</span>;
            },
            size: 45,
          })
        ];

        outcomeColumns.push(columnHelper.group({
          id: `${marketOption.key}_${outcome}_group`,
          header: outcomeLabel,
          columns: dataColumns,
        }));
      });

      if (variationLabel) {
        marketGroupColumns.push(columnHelper.group({
          id: `${marketOption.key}_variation_group`,
          header: variationLabel,
          columns: outcomeColumns,
        }));
      } else {
        marketGroupColumns.push(...outcomeColumns);
      }
    });

    columns.push(columnHelper.group({
      id: `${baseKey}_market_group`,
      header: marketLabel,
      columns: marketGroupColumns,
    }));
  });

  return columns;
}

function getOddsValue(
  event: EventWithOdds,
  marketKey: string,
  outcome: string,
  point: number | undefined,
  type: 'opening' | 'closing'
): string {
  if (type === 'opening') {
    const marketData = event.opening_odds.find((m) => {
      if (m.market_key !== marketKey) return false;
      if (point !== undefined) return m.odds?.point === point;
      return true;
    });
    return formatOddsValue(marketData?.odds?.[outcome]);
  } else {
    const closingData = event.closing_odds;
    if (!closingData) return '-';

    let marketData = null;
    if (closingData.markets_variations && closingData.markets_variations[marketKey]) {
      const variations = closingData.markets_variations[marketKey];
      if (Array.isArray(variations)) {
        marketData = point !== undefined 
          ? variations.find((v: any) => v.point === point)
          : variations[0];
      }
    }
    if (!marketData && closingData.markets && closingData.markets[marketKey]) {
      const fallback = closingData.markets[marketKey];
      if (point === undefined || fallback.point === point) {
        marketData = fallback;
      }
    }
    return formatOddsValue(marketData?.[outcome]);
  }
}

function getResult(event: EventWithOdds, marketKey: string, outcome: OutcomeType, point: number | undefined) {
  const score = event.status === 'completed' && event.home_score !== null && event.away_score !== null
    ? { home: event.home_score, away: event.away_score }
    : null;
  return getMarketResult(marketKey, outcome, point, score);
}

function formatOddsValue(value: number | undefined | null): string {
  if (value === null || value === undefined) return '-';
  return value.toFixed(2);
}
