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
import { ColumnOddsFilter, type OddsFilterValue } from './column-odds-filter';

const PARIS_TZ = 'Europe/Paris';
const columnHelper = createColumnHelper<EventWithOdds>();

interface MarketOption {
  key: string;
  name: string;
  point?: number;
}

export type OutcomeType = 'home' | 'away' | 'draw' | 'over' | 'under' | 'yes' | 'no' | '1x' | 'x2' | '12';

export interface ColumnConfig {
  marketLabels?: Record<string, string>;
  outcomeLabels?: Record<string, string>;
  variationTemplate?: string;
}

export type ColumnFiltersState = Record<string, OddsFilterValue>;

// Helper to generate filter key
export function getColumnFilterKey(marketKey: string, point: number | undefined, outcome: string, type: 'opening' | 'closing'): string {
  // Use a stable key format: market:point:outcome:type
  // If point is undefined, use 'null' string
  return `${marketKey}:${point ?? 'null'}:${outcome}:${type}`;
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
  'double_chance': 'DC',
  'team_totals': 'TT',
  'team_totals_home': 'TT Dom',
  'team_totals_away': 'TT Ext',
  'alternate_team_totals_home': 'Alt TT Dom',
  'alternate_team_totals_away': 'Alt TT Ext',
};

const OUTCOME_SHORT_NAMES: Record<string, string> = {
  'home': '1',
  'draw': 'X',
  'away': '2',
  'over': '+',
  'under': '-',
  'yes': 'Oui',
  'no': 'Non',
  '1x': '1X',
  'x2': 'X2',
  '12': '12',
};

// === ASIAN HANDICAP HELPER FUNCTIONS ===

/** Format point avec signe (+/-) */
function formatPoint(point: number): string {
  if (point === 0) return '0';
  return point > 0 ? `+${point}` : `${point}`;
}

/** Calculer le point miroir pour Away (inverse du Home) */
function getMirroredPoint(point: number): number {
  return -1 * point;
}

/** Vérifier si c'est un marché spreads/handicap */
function isSpreadsMarket(marketKey: string): boolean {
  return marketKey.includes('spread');
}

function getMarketOutcomes(marketKey: string): OutcomeType[] {
  // 1X2 markets
  if (marketKey === 'h2h' || marketKey === 'h2h_h1' || marketKey === 'h2h_h2' || marketKey === 'h2h_3_way') {
    return ['home', 'draw', 'away'];
  }
  // Over/Under markets (including team totals)
  if (marketKey === 'totals' || marketKey === 'totals_h1' || marketKey === 'totals_h2' ||
      marketKey === 'team_totals' || marketKey === 'alternate_team_totals' ||
      marketKey === 'team_totals_home' || marketKey === 'team_totals_away' ||
      marketKey === 'alternate_team_totals_home' || marketKey === 'alternate_team_totals_away') {
    return ['over', 'under'];
  }
  // Spreads/Handicap
  if (marketKey.includes('spread')) {
    return ['home', 'away'];
  }
  // Draw No Bet (home or away only, no draw option)
  if (marketKey === 'draw_no_bet') {
    return ['home', 'away'];
  }
  // Double Chance
  if (marketKey === 'double_chance') {
    return ['1x', 'x2', '12'];
  }
  // Both Teams To Score
  if (marketKey === 'btts') {
    return ['yes', 'no'];
  }
  // Default
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
  config?: ColumnConfig,
  filters?: ColumnFiltersState,
  onFilterChange?: (key: string, value: OddsFilterValue | undefined) => void,
  onOpenH1Modal?: (eventId: string, homeTeam: string, awayTeam: string, homeFT: number | null | undefined, awayFT: number | null | undefined, homeH1: number | null | undefined, awayH1: number | null | undefined) => void
): ColumnDef<EventWithOdds>[] {
  const columns: ColumnDef<EventWithOdds>[] = [];

  // 1. Colonnes Statiques
  columns.push(columnHelper.accessor('commence_time', {
    id: 'commence_time',
    header: 'Date',
    cell: ({ row }) => {
      const dateStr = row.original.commence_time;
      if (!dateStr) return <div className="px-2 py-1">-</div>;
      try {
        const date = new Date(dateStr);
        const parisDate = toZonedTime(date, PARIS_TZ);
        return <div className="px-2 py-1 whitespace-nowrap text-xs">{format(parisDate, 'dd/MM HH:mm', { locale: fr })}</div>;
      } catch {
        return <div className="px-2 py-1">{dateStr}</div>;
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
      return <div className="px-2 py-1 text-xs truncate max-w-[100px]" title={title}>{shortTitle}</div>;
    },
    size: 100,
    enableSorting: false,
  }) as any);

  columns.push(columnHelper.accessor('home_team', {
    id: 'home_team',
    header: 'Dom.',
    cell: ({ row }) => (
      <div className="px-2 py-1 text-xs font-medium truncate max-w-[120px]" title={row.original.home_team}>
        {row.original.home_team || '-'}
      </div>
    ),
    size: 120,
    enableSorting: false,
  }) as any);

  columns.push(columnHelper.accessor('away_team', {
    id: 'away_team',
    header: 'Ext.',
    cell: ({ row }) => (
      <div className="px-2 py-1 text-xs truncate max-w-[120px]" title={row.original.away_team}>
        {row.original.away_team || '-'}
      </div>
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
          <div className="px-2 py-1 flex flex-col items-center">
            <span className="text-[10px] font-mono font-medium text-blue-600 bg-blue-50 px-1 rounded">{count}</span>
            <span className="text-[9px] text-muted-foreground mt-0.5">{format(parisDate, 'HH:mm', { locale: fr })}</span>
          </div>
        );
      }
      return <div className="px-2 py-1 text-xs text-muted-foreground">-</div>;
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
        return <div className="px-2 py-1 text-xs font-bold text-center">{home_score}-{away_score}</div>;
      }
      return <div className="px-2 py-1 text-muted-foreground text-xs">-</div>;
    },
    size: 50,
    enableSorting: false,
  }) as any);

  // Colonne MT1 (Mi-Temps 1) - Éditable
  columns.push(columnHelper.display({
    id: 'score_h1',
    header: 'MT1',
    cell: ({ row }) => {
      const { id, status, home_score, away_score, home_score_h1, away_score_h1, home_team, away_team } = row.original;

      // Seulement pour les matchs terminés
      if (status !== 'completed') {
        return <div className="px-2 py-1 text-muted-foreground text-xs text-center">-</div>;
      }

      // Check for both null and undefined
      if (home_score_h1 != null && away_score_h1 != null) {
        // Afficher le score H1 existant avec possibilité d'éditer
        return (
          <div
            className="px-2 py-1 text-xs text-center cursor-pointer hover:bg-blue-50 rounded"
            onClick={() => onOpenH1Modal?.(id, home_team, away_team, home_score, away_score, home_score_h1, away_score_h1)}
            title="Cliquer pour modifier"
          >
            <span className="font-medium">{home_score_h1}-{away_score_h1}</span>
          </div>
        );
      }

      // Pas de score H1 - afficher bouton pour ajouter
      return (
        <div
          className="px-2 py-1 text-center cursor-pointer hover:bg-amber-50 rounded"
          onClick={() => onOpenH1Modal?.(id, home_team, away_team, home_score, away_score, null, null)}
          title="Ajouter score mi-temps"
        >
          <span className="text-amber-600 text-xs">+ MT1</span>
        </div>
      );
    },
    size: 55,
    enableSorting: false,
  }) as any);

  // Colonne MT2 (Mi-Temps 2) - Calculée automatiquement
  columns.push(columnHelper.display({
    id: 'score_h2',
    header: 'MT2',
    cell: ({ row }) => {
      const { status, home_score, away_score, home_score_h1, away_score_h1 } = row.original;

      if (status !== 'completed') {
        return <div className="px-2 py-1 text-muted-foreground text-xs text-center">-</div>;
      }

      // Check for both null and undefined
      if (
        home_score_h1 != null &&
        away_score_h1 != null &&
        home_score != null &&
        away_score != null
      ) {
        const h2Home = home_score - home_score_h1;
        const h2Away = away_score - away_score_h1;
        return (
          <div className="px-2 py-1 text-xs text-center text-muted-foreground">
            {h2Home}-{h2Away}
          </div>
        );
      }

      return <div className="px-2 py-1 text-muted-foreground text-xs text-center">-</div>;
    },
    size: 55,
    enableSorting: false,
  }) as any);

  // 2. Colonnes Dynamiques Groupées (3 niveaux)
  const marketsByBase = new Map<string, Map<number | undefined, MarketOption>>();

  markets.forEach(market => {
    const baseKey = market.key.includes(':') ? market.key.split(':')[0] : market.key;

    // Normalize spread points: always use the negative side as the column key.
    // e.g. +1.75 → -1.75 so we don't create duplicate mirrored columns.
    // Column "-1.75/+1.75" already shows both sides (home at -1.75, away at +1.75).
    let normalizedPoint = market.point;
    const isSpreadMarket = isSpreadsMarket(baseKey);
    if (isSpreadMarket && normalizedPoint !== undefined && normalizedPoint > 0) {
      normalizedPoint = -1 * normalizedPoint;
    }

    if (!marketsByBase.has(baseKey)) {
      marketsByBase.set(baseKey, new Map());
    }
    
    // If multiple points map to same normalized point, we just need one entry for the group header
    if (!marketsByBase.get(baseKey)!.has(normalizedPoint)) {
        marketsByBase.get(baseKey)!.set(normalizedPoint, { ...market, point: normalizedPoint });
    }
  });

  marketsByBase.forEach((variationsMap, baseKey) => {
    const marketLabel = getMarketLabel(baseKey, config);
    const outcomes = getMarketOutcomes(baseKey);
    const activeOutcomes = outcomes.filter(o => visibleOutcomes.includes(o));
    
    if (activeOutcomes.length === 0) return;

    const marketGroupColumns: ColumnDef<EventWithOdds>[] = [];
    // Sort points: favorites/negatives first
    const sortedPoints = Array.from(variationsMap.keys()).sort((a, b) => (a ?? 0) - (b ?? 0));

    sortedPoints.forEach(point => {
      const marketOption = variationsMap.get(point)!;
      let variationLabel = '';

      if (point !== undefined) {
        // Pour les spreads/handicaps, afficher le format miroir: "-0.5/+0.5"
        if (isSpreadsMarket(baseKey)) {
          const homePoint = formatPoint(point);
          const awayPoint = formatPoint(getMirroredPoint(point));
          variationLabel = `${homePoint}/${awayPoint}`;
        } else {
          variationLabel = formatPoint(point);
        }
      } else if (sortedPoints.length > 1) {
        variationLabel = 'Std';
      }

      const isLastPoint = sortedPoints.indexOf(point) === sortedPoints.length - 1;
      const outcomeColumns: ColumnDef<EventWithOdds>[] = [];

      activeOutcomes.forEach(outcome => {
        const baseOutcomeLabel = getOutcomeLabel(outcome, config);

        // Pour spreads, ajouter le handicap spécifique à chaque outcome
        // Home a le point stocké, Away a le point miroir
        let outcomeLabel = baseOutcomeLabel;
        if (isSpreadsMarket(baseKey) && point !== undefined) {
          const specificPoint = outcome === 'home' ? point : getMirroredPoint(point);
          outcomeLabel = `${baseOutcomeLabel} (${formatPoint(specificPoint)})`;
        }

        // Re-calculate borders inside loop as we iterate outcomes
        const isLastOutcomeInLoop = activeOutcomes.indexOf(outcome) === activeOutcomes.length - 1;
        
        // Border style:
        // - End of Market Group: Thick Dark Border
        // - End of Variation Group: Medium Border
        // - End of Outcome (O/C pair): Light Border
        let borderClass = "border-r border-r-slate-200"; // Default between O and C is handled by standard table, but between Outcome groups?
        
        if (isLastOutcomeInLoop) {
           if (isLastPoint) {
             borderClass = "!border-r-[3px] !border-r-slate-400"; // End of Market
           } else {
             borderClass = "!border-r-2 !border-r-slate-300"; // End of Variation
           }
        }

        const dataColumns: ColumnDef<EventWithOdds>[] = [
          columnHelper.display({
            id: `${marketOption.key}_${outcome}_opening`,
            header: ({ header }) => {
              const filterKey = getColumnFilterKey(baseKey, point, outcome, 'opening');
              const filterValue = filters?.[filterKey];
              const title = `${marketLabel} ${variationLabel !== 'Std' ? variationLabel : ''} (${outcomeLabel}) - Opening`;
              
              return (
                <div className="flex items-center justify-center">
                  <span>O</span>
                  {onFilterChange && (
                    <ColumnOddsFilter 
                      title={title}
                      value={filterValue}
                      onChange={(val) => onFilterChange(filterKey, val)}
                    />
                  )}
                </div>
              );
            },
            cell: ({ row }) => {
              const { value: val, isLate } = getOddsValue(row.original, baseKey, outcome, point, 'opening');
              const res = getResult(row.original, baseKey, outcome, point);
              
              let resultClass = "";
              if (val !== '-') {
                if (res === 'win') resultClass = "!bg-emerald-100 !text-emerald-700 font-bold border-emerald-200";
                if (res === 'loss') resultClass = "!bg-rose-50 !text-rose-700 border-rose-100";
                if (res === 'push') resultClass = "!bg-amber-50 !text-amber-700 border-amber-100";
              }

              return (
                <div className={`flex items-center justify-center w-full h-10 px-2 py-1 border-r border-r-slate-100 ${resultClass} ${isLate ? 'bg-amber-50/50' : ''}`} title={isLate ? "Opening capturé tardivement (< 3j)" : undefined}>
                  <span className={`text-xs font-mono ${isLate ? 'text-amber-600 font-medium' : ''}`}>
                    {val}
                    {isLate && <span className="text-[10px] ml-0.5">⚠️</span>}
                  </span>
                </div>
              );
            },
            size: 60, // Increased size to fit filter icon
          }) as any,
          columnHelper.display({
            id: `${marketOption.key}_${outcome}_closing`,
            header: ({ header }) => {
              const filterKey = getColumnFilterKey(baseKey, point, outcome, 'closing');
              const filterValue = filters?.[filterKey];
              const title = `${marketLabel} ${variationLabel !== 'Std' ? variationLabel : ''} (${outcomeLabel}) - Closing`;

              return (
                <div className="flex items-center justify-center">
                  <span>C</span>
                  {onFilterChange && (
                    <ColumnOddsFilter 
                      title={title}
                      value={filterValue}
                      onChange={(val) => onFilterChange(filterKey, val)}
                    />
                  )}
                </div>
              );
            },
            cell: ({ row }) => {
              const { value: val } = getOddsValue(row.original, baseKey, outcome, point, 'closing');
              const res = getResult(row.original, baseKey, outcome, point);
              
              let resultClass = "";
              if (val !== '-') {
                if (res === 'win') resultClass = "!bg-emerald-100 !text-emerald-700 font-bold border-emerald-200";
                if (res === 'loss') resultClass = "!bg-rose-50 !text-rose-700 border-rose-100";
                if (res === 'push') resultClass = "!bg-amber-50 !text-amber-700 border-amber-100";
              }

              return (
                <div className={`flex items-center justify-center w-full h-10 px-2 py-1 ${resultClass} ${borderClass} -mr-[1px]`}>
                  <span className="text-xs font-mono">{val}</span>
                </div>
              );
            },
            size: 60, // Increased size
          }) as any
        ];

        outcomeColumns.push(columnHelper.group({
          id: `${marketOption.key}_${outcome}_group`,
          header: outcomeLabel,
          columns: dataColumns as any,
        }));
      });

      if (variationLabel) {
        marketGroupColumns.push(columnHelper.group({
          id: `${marketOption.key}_variation_group`,
          header: variationLabel,
          columns: outcomeColumns as any,
        }));
      } else {
        marketGroupColumns.push(...outcomeColumns);
      }
    });

    columns.push(columnHelper.group({
      id: `${baseKey}_market_group`,
      header: marketLabel,
      columns: marketGroupColumns as any,
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
): { value: string, isLate: boolean } {
  const isSpread = isSpreadsMarket(marketKey);
  const mirrorPoint = (isSpread && point !== undefined) ? getMirroredPoint(point) : undefined;

  // For spreads, the column "-0.5/+0.5" means:
  //   1(-0.5): home odds from variation point=-0.5
  //   2(+0.5): away odds from variation point=+0.5 (the mirror)
  // So for 'away' outcome, we must search the MIRROR point first.
  // For 'home' outcome, we search the exact point first.
  const primaryPoint = (isSpread && outcome === 'away' && mirrorPoint !== undefined) ? mirrorPoint : point;
  const fallbackPoint = (isSpread && outcome === 'away' && mirrorPoint !== undefined) ? point : mirrorPoint;

  if (type === 'opening') {
    if (!event.opening_odds || !Array.isArray(event.opening_odds)) return { value: '-', isLate: false };

    const findOpening = (searchPt: number | undefined) => {
      return event.opening_odds.find((m) => {
        if (m.market_key !== marketKey) return false;
        if (searchPt !== undefined) return m.odds?.point === searchPt;
        return true;
      });
    };

    // 1. Try the primary point
    let marketData = findOpening(primaryPoint);
    if (marketData?.odds?.[outcome]) {
      return {
        value: formatOddsValue(marketData.odds[outcome]),
        isLate: !!(marketData.odds._metadata?.is_late)
      };
    }

    // 2. Try the fallback point
    if (isSpread && fallbackPoint !== undefined) {
      marketData = findOpening(fallbackPoint);
      if (marketData?.odds?.[outcome]) {
        return {
          value: formatOddsValue(marketData.odds[outcome]),
          isLate: !!(marketData.odds._metadata?.is_late)
        };
      }
    }

    return { value: '-', isLate: false };
  } else {
    const closingData = event.closing_odds;
    if (!closingData) return { value: '-', isLate: false };

    const findInVariations = (targetPoint: number | undefined, targetOutcome: string) => {
      if (!closingData.markets_variations || !closingData.markets_variations[marketKey]) return null;
      const variations = closingData.markets_variations[marketKey];
      if (!Array.isArray(variations)) return null;

      const found = targetPoint !== undefined
        ? variations.find((v: any) => v.point === targetPoint)
        : variations[0];

      return found?.[targetOutcome];
    };

    // 1. Try the primary point
    let val = findInVariations(primaryPoint, outcome);
    if (val) return { value: formatOddsValue(val as number), isLate: false };

    // 2. Try the fallback point
    if (isSpread && fallbackPoint !== undefined) {
      val = findInVariations(fallbackPoint, outcome);
      if (val) return { value: formatOddsValue(val as number), isLate: false };
    }

    // 3. Fallback to main markets object
    if (closingData.markets && closingData.markets[marketKey]) {
      const fallback = closingData.markets[marketKey];
      const matchesPoint = point === undefined || fallback.point === primaryPoint ||
        (fallbackPoint !== undefined && fallback.point === fallbackPoint);
      if (matchesPoint && fallback[outcome]) {
        return { value: formatOddsValue(fallback[outcome] as number), isLate: false };
      }
    }

    return { value: '-', isLate: false };
  }
}

function getResult(event: EventWithOdds, marketKey: string, outcome: OutcomeType, point: number | undefined) {
  // Ensure scores are numbers
  const homeScore = event.home_score !== null ? Number(event.home_score) : null;
  const awayScore = event.away_score !== null ? Number(event.away_score) : null;
  const homeH1 = event.home_score_h1 !== null ? Number(event.home_score_h1) : null;
  const awayH1 = event.away_score_h1 !== null ? Number(event.away_score_h1) : null;

  const score = event.status === 'completed' && homeScore !== null && awayScore !== null
    ? { home: homeScore, away: awayScore, home_h1: homeH1, away_h1: awayH1 }
    : null;

  // For spreads, the away outcome uses the mirrored point for result calculation
  // Column "-0.5/+0.5": Home uses -0.5, Away uses +0.5
  const effectivePoint = (isSpreadsMarket(marketKey) && point !== undefined && outcome === 'away')
    ? getMirroredPoint(point)
    : point;

  return getMarketResult(marketKey, outcome, effectivePoint, score);
}

function formatOddsValue(value: number | undefined | null): string {
  if (value === null || value === undefined) return '-';
  return value.toFixed(2);
}