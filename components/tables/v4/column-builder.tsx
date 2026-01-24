/**
 * Column Builder v4 - The Odds API v4
 * Génère les colonnes dynamiques pour le tableau de matchs
 * Noms de colonnes courts et clairs en français
 */

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { fr } from 'date-fns/locale';
import type { EventWithOdds } from '@/lib/db/queries-frontend';
import { getMarketResult, getResultColorClass } from '@/lib/utils/bet-results';

const PARIS_TZ = 'Europe/Paris';

interface MarketOption {
  key: string;
  name: string;
  point?: number;
}

export type OutcomeType = 'home' | 'away' | 'draw' | 'over' | 'under';

/**
 * Configuration personnalisable des colonnes
 */
export interface ColumnConfig {
  marketLabels?: Record<string, string>;
  outcomeLabels?: Record<string, string>;
  variationTemplate?: string;
}

/**
 * Retourne les outcomes disponibles pour un type de marché
 */
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

/**
 * Noms courts pour les marchés
 */
const MARKET_SHORT_NAMES: Record<string, string> = {
  'h2h': '1X2',
  'h2h_h1': '1X2 MT1',
  'h2h_h2': '1X2 MT2',
  'spreads': 'AH',
  'spreads_h1': 'AH MT1',
  'spreads_h2': 'AH MT2',
  'totals': 'O/U',
  'totals_h1': 'O/U MT1',
  'totals_h2': 'O/U MT2',
  'draw_no_bet': 'DNB',
  'btts': 'BTTS',
  'team_totals': 'TT',
};

/**
 * Noms courts pour les outcomes
 */
const OUTCOME_SHORT_NAMES: Record<OutcomeType, string> = {
  'home': '1',
  'draw': 'X',
  'away': '2',
  'over': '+',
  'under': '-',
};

/**
 * Génère le header court de la colonne
 * Ex: "1X2 - 1 (Ouv.)" ou "AH -0.5 - 1 (Clôt.)"
 */
function getShortHeader(
  marketKey: string,
  outcome: OutcomeType,
  point: number | undefined,
  isClosing: boolean
): string {
  const marketName = MARKET_SHORT_NAMES[marketKey] || marketKey;
  const outcomeName = OUTCOME_SHORT_NAMES[outcome];
  const suffix = isClosing ? 'C' : 'O';

  if (point !== undefined) {
    const pointStr = point > 0 ? `+${point}` : `${point}`;
    return `${marketName} ${pointStr} ${outcomeName} ${suffix}`;
  }

  return `${marketName} ${outcomeName} ${suffix}`;
}

/**
 * Construit toutes les colonnes pour le tableau football
 */
export function buildFootballColumns(
  markets: MarketOption[],
  visibleOutcomes: OutcomeType[] = ['home', 'away', 'draw', 'over', 'under'],
  config?: ColumnConfig
): ColumnDef<EventWithOdds>[] {
  const columns: ColumnDef<EventWithOdds>[] = [];

  // ============================================================================
  // COLONNES STATIQUES
  // ============================================================================

  columns.push({
    id: 'commence_time',
    accessorKey: 'commence_time',
    header: 'Date',
    cell: ({ row }) => {
      const dateStr = row.original.commence_time;
      if (!dateStr) return '-';

      try {
        const date = new Date(dateStr);
        const parisDate = toZonedTime(date, PARIS_TZ);
        return (
          <span className="whitespace-nowrap text-xs">
            {format(parisDate, 'dd/MM HH:mm', { locale: fr })}
          </span>
        );
      } catch {
        return dateStr;
      }
    },
    size: 90,
  });

  columns.push({
    id: 'sport_title',
    accessorKey: 'sport_title',
    header: 'Ligue',
    cell: ({ row }) => {
      const title = row.original.sport_title || '-';
      // Extraire juste le nom court (ex: "Ligue 1" de "Ligue 1 - France")
      const shortTitle = title.split(' - ')[0];
      return <span className="text-xs truncate max-w-[100px]" title={title}>{shortTitle}</span>;
    },
    size: 100,
    enableSorting: false,
  });

  columns.push({
    id: 'home_team',
    accessorKey: 'home_team',
    header: 'Dom.',
    cell: ({ row }) => (
      <span className="text-xs font-medium truncate max-w-[120px]" title={row.original.home_team}>
        {row.original.home_team || '-'}
      </span>
    ),
    size: 120,
    enableSorting: false,
  });

  columns.push({
    id: 'away_team',
    accessorKey: 'away_team',
    header: 'Ext.',
    cell: ({ row }) => (
      <span className="text-xs truncate max-w-[120px]" title={row.original.away_team}>
        {row.original.away_team || '-'}
      </span>
    ),
    size: 120,
    enableSorting: false,
  });

  columns.push({
    id: 'score',
    header: 'Score',
    cell: ({ row }) => {
      const status = row.original.status;
      const homeScore = row.original.home_score;
      const awayScore = row.original.away_score;

      if (status === 'completed' && homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined) {
        return (
          <span className="text-xs font-bold text-center">
            {homeScore}-{awayScore}
          </span>
        );
      }

      return <span className="text-muted-foreground text-xs">-</span>;
    },
    size: 50,
    enableSorting: false,
  });

  // ============================================================================
  // COLONNES DYNAMIQUES (MARCHÉS)
  // ============================================================================

  for (const market of markets) {
    const baseMarketKey = market.key.includes(':') ? market.key.split(':')[0] : market.key;
    const targetPoint = market.point;
    const outcomes = getMarketOutcomes(baseMarketKey);

    for (const outcome of outcomes) {
      if (!visibleOutcomes.includes(outcome)) continue;

      // Colonne Opening
      columns.push({
        id: `${market.key}_${outcome}_opening`,
        header: getShortHeader(baseMarketKey, outcome, targetPoint, false),
        cell: ({ row }) => {
          const marketData = row.original.opening_odds.find((m) => {
            if (m.market_key !== baseMarketKey) return false;
            if (targetPoint !== undefined) {
              return m.odds?.point === targetPoint;
            }
            return true;
          });

          if (!marketData || !marketData.odds) {
            return <span className="text-muted-foreground text-xs">-</span>;
          }

          const oddsValue = marketData.odds[outcome];

          const score = row.original.status === 'completed' &&
            row.original.home_score !== null &&
            row.original.away_score !== null
            ? { home: row.original.home_score, away: row.original.away_score }
            : null;

          const result = getMarketResult(baseMarketKey, outcome, targetPoint, score);
          const colorClass = getResultColorClass(result);

          return (
            <span className={`text-xs font-mono ${colorClass}`}>
              {formatOddsValue(oddsValue)}
            </span>
          );
        },
        size: 55,
        enableSorting: false,
      });

      // Colonne Closing
      columns.push({
        id: `${market.key}_${outcome}_closing`,
        header: getShortHeader(baseMarketKey, outcome, targetPoint, true),
        cell: ({ row }) => {
          const closingData = row.original.closing_odds;

          if (!closingData) {
            return <span className="text-muted-foreground text-xs">-</span>;
          }

          let marketData = null;

          // 1. Try to find in variations (more precise)
          if (closingData.markets_variations && closingData.markets_variations[baseMarketKey]) {
            const variations = closingData.markets_variations[baseMarketKey];
            if (Array.isArray(variations)) {
              if (targetPoint !== undefined) {
                // Find exact point match
                marketData = variations.find((v: any) => v.point === targetPoint);
              } else {
                // Take first one if no point specified
                marketData = variations[0];
              }
            }
          }

          // 2. Fallback to main markets object
          if (!marketData && closingData.markets && closingData.markets[baseMarketKey]) {
            const fallbackData = closingData.markets[baseMarketKey];
            // Only use fallback if points match or no point required
            if (targetPoint === undefined || fallbackData.point === targetPoint) {
              marketData = fallbackData;
            }
          }

          if (!marketData) {
            return <span className="text-muted-foreground text-xs">-</span>;
          }

          const oddsValue = marketData[outcome];

          const score = row.original.status === 'completed' &&
            row.original.home_score !== null &&
            row.original.away_score !== null
            ? { home: row.original.home_score, away: row.original.away_score }
            : null;

          const result = getMarketResult(baseMarketKey, outcome, targetPoint, score);
          const colorClass = getResultColorClass(result);

          return (
            <span className={`text-xs font-mono ${colorClass}`}>
              {formatOddsValue(oddsValue)}
            </span>
          );
        },
        size: 55,
        enableSorting: false,
      });
    }
  }

  return columns;
}

/**
 * Formate une valeur de cote
 */
function formatOddsValue(value: number | undefined | null): string {
  if (value === null || value === undefined) return '-';
  return value.toFixed(2);
}
