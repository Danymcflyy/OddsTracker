/**
 * Column Builder - Génère les colonnes dynamiques pour le tableau de matchs
 * Colonnes statiques + colonnes dynamiques selon les marchés disponibles
 */

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { fr } from 'date-fns/locale';
import type { MatchWithDetails } from '@/lib/db/queries/v3/matches';
import type { MarketWithOutcomes } from '@/lib/db/queries/v3/markets';

const PARIS_TZ = 'Europe/Paris';

/**
 * Construit toutes les colonnes (statiques + dynamiques) pour le tableau football
 */
export function buildFootballColumns(
  markets: MarketWithOutcomes[]
): ColumnDef<MatchWithDetails>[] {
  const columns: ColumnDef<MatchWithDetails>[] = [];

  // ============================================================================
  // COLONNES STATIQUES
  // ============================================================================

  columns.push({
    id: 'match_date',
    accessorKey: 'match_date',
    header: 'Date',
    cell: ({ row }) => {
      const dateStr = row.original.match_date;
      if (!dateStr) return '-';

      try {
        const date = new Date(dateStr);
        const parisDate = toZonedTime(date, PARIS_TZ);
        return format(parisDate, 'dd MMM yyyy HH:mm', { locale: fr });
      } catch {
        return dateStr;
      }
    },
    size: 140,
  });

  columns.push({
    id: 'country',
    accessorFn: (row) => row.league?.country?.name || '-',
    header: 'Pays',
    cell: ({ row }) => row.original.league?.country?.name || '-',
    size: 100,
  });

  columns.push({
    id: 'league',
    accessorFn: (row) => row.league?.display_name || row.league?.name || '-',
    header: 'Championnat',
    cell: ({ row }) => row.original.league?.display_name || row.original.league?.name || '-',
    size: 150,
  });

  columns.push({
    id: 'home_team',
    accessorFn: (row) => row.home_team?.display_name || '-',
    header: 'Domicile',
    cell: ({ row }) => row.original.home_team?.display_name || '-',
    size: 150,
  });

  columns.push({
    id: 'away_team',
    accessorFn: (row) => row.away_team?.display_name || '-',
    header: 'Extérieur',
    cell: ({ row }) => row.original.away_team?.display_name || '-',
    size: 150,
  });

  columns.push({
    id: 'home_score',
    accessorKey: 'home_score',
    header: 'Score D',
    cell: ({ row }) => {
      const score = row.original.home_score;
      return score !== null ? score.toString() : '-';
    },
    size: 70,
  });

  columns.push({
    id: 'away_score',
    accessorKey: 'away_score',
    header: 'Score E',
    cell: ({ row }) => {
      const score = row.original.away_score;
      return score !== null ? score.toString() : '-';
    },
    size: 70,
  });

  // ============================================================================
  // COLONNES DYNAMIQUES (GÉNÉRÉES DEPUIS LES MARCHÉS)
  // ============================================================================

  for (const market of markets) {
    const marketLabel = market.custom_name || market.name;

    // Récupérer toutes les lignes (lines) uniques pour ce marché
    const lines = getUniqueLinesForMarket(market);

    if (lines.length === 0) {
      // Marché sans ligne (ex: h2h/1X2)
      for (const outcome of market.outcomes) {
        // Colonne Opening
        columns.push(
          buildOddsColumn(
            market.id,
            outcome,
            null,
            'opening',
            `${marketLabel} - ${formatOutcome(outcome)} (O)`
          )
        );

        // Colonne Current
        columns.push(
          buildOddsColumn(
            market.id,
            outcome,
            null,
            'current',
            `${marketLabel} - ${formatOutcome(outcome)} (C)`
          )
        );
      }
    } else {
      // Marché avec lignes (ex: Totals 2.5, Totals 3.5)
      for (const line of lines) {
        for (const outcome of market.outcomes) {
          // Colonne Opening
          columns.push(
            buildOddsColumn(
              market.id,
              outcome,
              line,
              'opening',
              `${marketLabel} ${line} - ${formatOutcome(outcome)} (O)`
            )
          );

          // Colonne Current
          columns.push(
            buildOddsColumn(
              market.id,
              outcome,
              line,
              'current',
              `${marketLabel} ${line} - ${formatOutcome(outcome)} (C)`
            )
          );
        }
      }
    }
  }

  return columns;
}

/**
 * Construit une colonne de cotes (opening ou current)
 */
function buildOddsColumn(
  marketId: string,
  outcome: string,
  line: number | null,
  oddsType: 'opening' | 'current',
  header: string
): ColumnDef<MatchWithDetails> {
  const oddsField = oddsType === 'opening' ? 'opening_odds' : 'current_odds';

  return {
    id: `${marketId}_${outcome}_${line || 0}_${oddsType}`,
    accessorFn: (row) => {
      const odd = findOdd(row.odds, marketId, outcome, line);
      return odd ? odd[oddsField] : null;
    },
    header,
    cell: ({ row }) => {
      const odd = findOdd(row.original.odds, marketId, outcome, line);

      if (!odd || odd[oddsField] === null) {
        return <span className="text-muted-foreground">-</span>;
      }

      const value = odd[oddsField];
      const isWinner = odd.is_winner === true;

      return (
        <span
          className={isWinner ? 'text-green-600 font-semibold' : ''}
          title={
            isWinner
              ? '✓ Gagnant'
              : oddsType === 'opening'
              ? `Capturé le ${formatTimestamp(odd.opening_timestamp)}`
              : `Mis à jour le ${formatTimestamp(odd.current_updated_at)}`
          }
        >
          {value.toFixed(2)}
        </span>
      );
    },
    size: 80,
  };
}

/**
 * Trouve la cote correspondante dans le tableau de cotes
 */
function findOdd(
  odds: MatchWithDetails['odds'],
  marketId: string,
  outcomeType: string,
  line: number | null
): MatchWithDetails['odds'][0] | undefined {
  if (!odds || !Array.isArray(odds)) return undefined;

  return odds.find(
    (odd) =>
      odd.market?.id === marketId &&
      odd.outcome_type === outcomeType &&
      odd.line === (line || 0)
  );
}

/**
 * Récupère toutes les lignes uniques pour un marché donné
 * en analysant les odds existantes
 */
function getUniqueLinesForMarket(market: MarketWithOutcomes): number[] {
  // Les marchés qui utilisent des lignes
  const marketsWithLines = [
    'totals', 'totals_ht',
    'spreads', 'spread', 'spread_ht',
    'team_totals', 'team_totals_home', 'team_totals_away', 'team_total_home', 'team_total_away',
    'corners_totals', 'corners_totals_ht',
    'corners_spread', 'corners_spread_ht'
  ];

  if (!marketsWithLines.includes(market.market_type)) {
    return [];
  }

  // Pour l'instant, retourner des lignes communes
  // En production, on devrait fetch depuis la DB via fetchLinesForMarket()
  const commonLines: Record<string, number[]> = {
    totals: [2.5, 3.5],
    totals_ht: [0.5, 1.5],
    spreads: [-1.5, -0.5, 0.5, 1.5],
    spread: [-1.5, -0.5, 0.5, 1.5],
    spread_ht: [-0.5, 0.5],
    team_totals: [1.5, 2.5],
    team_totals_home: [1.5, 2.5],
    team_totals_away: [1.5, 2.5],
    team_total_home: [1.5, 2.5],
    team_total_away: [1.5, 2.5],
    corners_totals: [9.5, 10.5, 11.5],
    corners_totals_ht: [4.5, 5.5],
    corners_spread: [-2.5, -1.5, 1.5, 2.5],
    corners_spread_ht: [-1.5, 1.5],
  };

  return commonLines[market.market_type] || [];
}

/**
 * Formate le nom d'un outcome pour l'affichage
 */
function formatOutcome(outcome: string): string {
  const labels: Record<string, string> = {
    home: '1',
    draw: 'X',
    away: '2',
    over: 'Over',
    under: 'Under',
    yes: 'Oui',
    no: 'Non',
  };

  return labels[outcome] || outcome;
}

/**
 * Formate un timestamp pour l'affichage dans un tooltip
 */
function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return 'Inconnu';

  try {
    const date = new Date(timestamp);
    const parisDate = toZonedTime(date, PARIS_TZ);
    return format(parisDate, 'dd/MM/yyyy HH:mm', { locale: fr });
  } catch {
    return timestamp;
  }
}
