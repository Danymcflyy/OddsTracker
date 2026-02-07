/**
 * Bet Results Calculator
 * Determines if a bet won or lost based on match score
 */

export type BetResult = 'win' | 'loss' | 'push' | 'pending';

export interface MatchScore {
  home: number;
  away: number;
  // Half-time scores (optional - for H1/H2 market calculations)
  home_h1?: number | null;
  away_h1?: number | null;
}

/**
 * Calculate result for 1X2 (Moneyline) market
 */
export function calculate1X2Result(
  outcome: 'home' | 'draw' | 'away',
  score: MatchScore
): BetResult {
  if (score.home > score.away && outcome === 'home') return 'win';
  if (score.home < score.away && outcome === 'away') return 'win';
  if (score.home === score.away && outcome === 'draw') return 'win';
  return 'loss';
}

/**
 * Calculate result for Handicap (Spreads) market
 */
export function calculateHandicapResult(
  outcome: 'home' | 'away',
  point: number,
  score: MatchScore
): BetResult {
  if (outcome === 'home') {
    const adjustedScore = score.home + point;
    if (adjustedScore > score.away) return 'win';
    if (adjustedScore === score.away) return 'push';
    return 'loss';
  } else {
    const adjustedScore = score.away + point;
    if (adjustedScore > score.home) return 'win';
    if (adjustedScore === score.home) return 'push';
    return 'loss';
  }
}

/**
 * Calculate result for Over/Under (Totals) market
 */
export function calculateTotalsResult(
  outcome: 'over' | 'under',
  point: number,
  score: MatchScore
): BetResult {
  const total = score.home + score.away;

  if (outcome === 'over') {
    if (total > point) return 'win';
    if (total === point) return 'push';
    return 'loss';
  } else {
    if (total < point) return 'win';
    if (total === point) return 'push';
    return 'loss';
  }
}

/**
 * Calculate result for Team Totals market
 */
export function calculateTeamTotalsResult(
  outcome: 'over' | 'under',
  point: number,
  teamScore: number
): BetResult {
  if (outcome === 'over') {
    if (teamScore > point) return 'win';
    if (teamScore === point) return 'push';
    return 'loss';
  } else {
    if (teamScore < point) return 'win';
    if (teamScore === point) return 'push';
    return 'loss';
  }
}

/**
 * Get result for any market type
 */
export function getMarketResult(
  marketKey: string,
  outcome: 'home' | 'away' | 'draw' | 'over' | 'under' | 'yes' | 'no' | '1x' | 'x2' | '12',
  point: number | undefined,
  score: MatchScore | null
): BetResult {
  if (!score || score.home === null || score.away === null) {
    return 'pending';
  }

  // Determine effective score based on market type (FT, H1, or H2)
  let effectiveScore: { home: number; away: number };

  if (marketKey.includes('_h1')) {
    // Half-time market: use H1 scores
    if (score.home_h1 == null || score.away_h1 == null) {
      return 'pending'; // No H1 scores available
    }
    effectiveScore = { home: score.home_h1, away: score.away_h1 };
  } else if (marketKey.includes('_h2')) {
    // Second-half market: calculate H2 = FT - H1
    if (score.home_h1 == null || score.away_h1 == null) {
      return 'pending'; // Need H1 to calculate H2
    }
    effectiveScore = {
      home: score.home - score.home_h1,
      away: score.away - score.away_h1
    };
  } else {
    // Full-time market: use FT scores
    effectiveScore = { home: score.home, away: score.away };
  }

  // BTTS (uses FT score always)
  if (marketKey === 'btts') {
    if (outcome === 'yes') {
      return (effectiveScore.home > 0 && effectiveScore.away > 0) ? 'win' : 'loss';
    }
    if (outcome === 'no') {
      return (effectiveScore.home === 0 || effectiveScore.away === 0) ? 'win' : 'loss';
    }
    return 'pending';
  }

  // Draw No Bet
  if (marketKey === 'draw_no_bet') {
     if (effectiveScore.home === effectiveScore.away) return 'push';
     if (outcome === 'home') return effectiveScore.home > effectiveScore.away ? 'win' : 'loss';
     if (outcome === 'away') return effectiveScore.away > effectiveScore.home ? 'win' : 'loss';
     return 'pending';
  }

  // Double Chance
  if (marketKey === 'double_chance') {
    if (outcome === '1x') {
      return (effectiveScore.home >= effectiveScore.away) ? 'win' : 'loss';
    }
    if (outcome === 'x2') {
      return (effectiveScore.away >= effectiveScore.home) ? 'win' : 'loss';
    }
    if (outcome === '12') {
      return (effectiveScore.home !== effectiveScore.away) ? 'win' : 'loss';
    }
    return 'pending';
  }

  // 1X2 markets (no point) - uses effectiveScore for H1/H2 variants
  if (marketKey === 'h2h' || marketKey === 'h2h_h1' || marketKey === 'h2h_h2') {
    if (outcome === 'over' || outcome === 'under' || outcome === 'yes' || outcome === 'no') return 'pending';
    return calculate1X2Result(outcome as 'home' | 'draw' | 'away', effectiveScore);
  }

  // Handicap markets - uses effectiveScore for H1/H2 variants
  if (marketKey === 'spreads' || marketKey === 'spreads_h1' || marketKey === 'spreads_h2' ||
      marketKey === 'alternate_spreads' || marketKey === 'alternate_spreads_h1') {
    if (point === undefined || outcome === 'draw' || outcome === 'over' || outcome === 'under' || outcome === 'yes' || outcome === 'no') {
      return 'pending';
    }
    return calculateHandicapResult(outcome as 'home' | 'away', point, effectiveScore);
  }

  // Totals markets - uses effectiveScore for H1/H2 variants
  if (marketKey === 'totals' || marketKey === 'totals_h1' || marketKey === 'totals_h2' ||
      marketKey === 'alternate_totals' || marketKey === 'alternate_totals_h1') {
    if (point === undefined || outcome === 'home' || outcome === 'away' || outcome === 'draw' || outcome === 'yes' || outcome === 'no') {
      return 'pending';
    }
    return calculateTotalsResult(outcome as 'over' | 'under', point, effectiveScore);
  }

  // Team totals - Home team
  if (marketKey === 'team_totals_home' || marketKey === 'alternate_team_totals_home') {
    if (point === undefined || outcome === 'draw' || outcome === 'yes' || outcome === 'no') return 'pending';
    if (outcome !== 'over' && outcome !== 'under') return 'pending';
    return calculateTeamTotalsResult(outcome as 'over' | 'under', point, effectiveScore.home);
  }

  // Team totals - Away team
  if (marketKey === 'team_totals_away' || marketKey === 'alternate_team_totals_away') {
    if (point === undefined || outcome === 'draw' || outcome === 'yes' || outcome === 'no') return 'pending';
    if (outcome !== 'over' && outcome !== 'under') return 'pending';
    return calculateTeamTotalsResult(outcome as 'over' | 'under', point, effectiveScore.away);
  }

  // Legacy team_totals (without home/away suffix) - return pending since we can't determine team
  if (marketKey === 'team_totals' || marketKey === 'alternate_team_totals') {
    return 'pending';
  }

  return 'pending';
}

/**
 * Get CSS class for bet result
 */
export function getResultColorClass(result: BetResult): string {
  switch (result) {
    case 'win':
      return 'bg-green-600 text-white font-bold'; // Vert vif + texte blanc
    case 'loss':
      return 'bg-red-500 text-white font-medium'; // Rouge vif + texte blanc
    case 'push':
      return 'bg-yellow-400 text-black font-medium'; // Jaune vif + texte noir
    case 'pending':
    default:
      return '';
  }
}
