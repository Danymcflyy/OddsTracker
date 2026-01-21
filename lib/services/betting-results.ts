/**
 * Betting Results Service
 * Calculates win/loss/push for bets based on scores and odds
 */

import type { OpeningOdds } from '@/lib/db/types';

export type BetOutcome = 'win' | 'loss' | 'push' | 'pending';

export interface BetResult {
  outcome: BetOutcome;
  profit: number; // Positive for win, negative for loss, 0 for push/pending
  stake: number;
  payout: number; // Total payout (stake + profit)
}

export interface MarketBetResults {
  home?: BetResult;
  away?: BetResult;
  draw?: BetResult;
  over?: BetResult;
  under?: BetResult;
}

/**
 * Calculate bet results for all outcomes in a market
 */
export function calculateMarketResults(
  marketKey: string,
  odds: OpeningOdds,
  homeScore: number | null,
  awayScore: number | null,
  stake: number = 10 // Default stake
): MarketBetResults | null {
  // If no scores yet, return pending results
  if (homeScore === null || awayScore === null) {
    return createPendingResults(odds, stake);
  }

  // Calculate based on market type
  switch (marketKey) {
    case 'h2h':
    case 'h2h_h1':
      return calculateH2HResults(odds, homeScore, awayScore, stake);

    case 'h2h_3_way':
      return calculateH2HResults(odds, homeScore, awayScore, stake); // Same logic

    case 'totals':
    case 'totals_h1':
      return calculateTotalsResults(odds, homeScore, awayScore, stake);

    case 'spreads':
    case 'spreads_h1':
      return calculateSpreadsResults(odds, homeScore, awayScore, stake);

    case 'draw_no_bet':
      return calculateDrawNoBetResults(odds, homeScore, awayScore, stake);

    case 'btts':
      return calculateBTTSResults(odds, homeScore, awayScore, stake);

    default:
      console.warn(`[BettingResults] Unknown market type: ${marketKey}`);
      return null;
  }
}

/**
 * Calculate H2H (Moneyline) results
 * Home wins if home_score > away_score
 * Away wins if away_score > home_score
 * Draw if home_score === away_score
 */
function calculateH2HResults(
  odds: OpeningOdds,
  homeScore: number,
  awayScore: number,
  stake: number
): MarketBetResults {
  const results: MarketBetResults = {};

  if (odds.home !== undefined) {
    if (homeScore > awayScore) {
      results.home = createWinResult(odds.home, stake);
    } else {
      results.home = createLossResult(stake);
    }
  }

  if (odds.away !== undefined) {
    if (awayScore > homeScore) {
      results.away = createWinResult(odds.away, stake);
    } else {
      results.away = createLossResult(stake);
    }
  }

  if (odds.draw !== undefined) {
    if (homeScore === awayScore) {
      results.draw = createWinResult(odds.draw, stake);
    } else {
      results.draw = createLossResult(stake);
    }
  }

  return results;
}

/**
 * Calculate Totals (Over/Under) results
 * Over wins if (home_score + away_score) > point
 * Under wins if (home_score + away_score) < point
 * Push if (home_score + away_score) === point
 */
function calculateTotalsResults(
  odds: OpeningOdds,
  homeScore: number,
  awayScore: number,
  stake: number
): MarketBetResults {
  const results: MarketBetResults = {};
  const totalScore = homeScore + awayScore;
  const point = odds.point || 2.5; // Default to 2.5 if not specified

  if (odds.over !== undefined) {
    if (totalScore > point) {
      results.over = createWinResult(odds.over, stake);
    } else if (totalScore === point) {
      results.over = createPushResult(stake);
    } else {
      results.over = createLossResult(stake);
    }
  }

  if (odds.under !== undefined) {
    if (totalScore < point) {
      results.under = createWinResult(odds.under, stake);
    } else if (totalScore === point) {
      results.under = createPushResult(stake);
    } else {
      results.under = createLossResult(stake);
    }
  }

  return results;
}

/**
 * Calculate Spreads (Handicap) results
 * Apply handicap to home team: adjusted_home_score = home_score + point
 * Home wins if adjusted_home_score > away_score
 * Away wins if adjusted_home_score < away_score
 * Push if adjusted_home_score === away_score
 */
function calculateSpreadsResults(
  odds: OpeningOdds,
  homeScore: number,
  awayScore: number,
  stake: number
): MarketBetResults {
  const results: MarketBetResults = {};
  const point = odds.point || 0; // Handicap value
  const adjustedHomeScore = homeScore + point;

  if (odds.home !== undefined) {
    if (adjustedHomeScore > awayScore) {
      results.home = createWinResult(odds.home, stake);
    } else if (adjustedHomeScore === awayScore) {
      results.home = createPushResult(stake);
    } else {
      results.home = createLossResult(stake);
    }
  }

  if (odds.away !== undefined) {
    if (adjustedHomeScore < awayScore) {
      results.away = createWinResult(odds.away, stake);
    } else if (adjustedHomeScore === awayScore) {
      results.away = createPushResult(stake);
    } else {
      results.away = createLossResult(stake);
    }
  }

  return results;
}

/**
 * Calculate Draw No Bet results
 * If draw, stake is returned (push)
 * Otherwise same as H2H for home/away
 */
function calculateDrawNoBetResults(
  odds: OpeningOdds,
  homeScore: number,
  awayScore: number,
  stake: number
): MarketBetResults {
  const results: MarketBetResults = {};

  // If draw, all bets are pushed
  if (homeScore === awayScore) {
    if (odds.home !== undefined) {
      results.home = createPushResult(stake);
    }
    if (odds.away !== undefined) {
      results.away = createPushResult(stake);
    }
    return results;
  }

  // Otherwise, calculate as H2H
  if (odds.home !== undefined) {
    if (homeScore > awayScore) {
      results.home = createWinResult(odds.home, stake);
    } else {
      results.home = createLossResult(stake);
    }
  }

  if (odds.away !== undefined) {
    if (awayScore > homeScore) {
      results.away = createWinResult(odds.away, stake);
    } else {
      results.away = createLossResult(stake);
    }
  }

  return results;
}

/**
 * Calculate Both Teams To Score results
 * Yes wins if both home_score > 0 AND away_score > 0
 * No wins if home_score === 0 OR away_score === 0
 */
function calculateBTTSResults(
  odds: OpeningOdds,
  homeScore: number,
  awayScore: number,
  stake: number
): MarketBetResults {
  const results: MarketBetResults = {};
  const bothScored = homeScore > 0 && awayScore > 0;

  // BTTS uses generic outcome keys in odds
  // Typically: odds.yes and odds.no
  const yesOdds = (odds as any).yes;
  const noOdds = (odds as any).no;

  if (yesOdds !== undefined) {
    if (bothScored) {
      results.over = createWinResult(yesOdds, stake); // Using 'over' as 'yes'
    } else {
      results.over = createLossResult(stake);
    }
  }

  if (noOdds !== undefined) {
    if (!bothScored) {
      results.under = createWinResult(noOdds, stake); // Using 'under' as 'no'
    } else {
      results.under = createLossResult(stake);
    }
  }

  return results;
}

/**
 * Create pending results for all outcomes in odds
 */
function createPendingResults(odds: OpeningOdds, stake: number): MarketBetResults {
  const results: MarketBetResults = {};

  if (odds.home !== undefined) {
    results.home = { outcome: 'pending', profit: 0, stake, payout: stake };
  }
  if (odds.away !== undefined) {
    results.away = { outcome: 'pending', profit: 0, stake, payout: stake };
  }
  if (odds.draw !== undefined) {
    results.draw = { outcome: 'pending', profit: 0, stake, payout: stake };
  }
  if (odds.over !== undefined) {
    results.over = { outcome: 'pending', profit: 0, stake, payout: stake };
  }
  if (odds.under !== undefined) {
    results.under = { outcome: 'pending', profit: 0, stake, payout: stake };
  }

  return results;
}

/**
 * Create a win result
 */
function createWinResult(odds: number, stake: number): BetResult {
  const profit = (odds - 1) * stake;
  const payout = stake + profit;
  return {
    outcome: 'win',
    profit: Math.round(profit * 100) / 100, // Round to 2 decimals
    stake,
    payout: Math.round(payout * 100) / 100,
  };
}

/**
 * Create a loss result
 */
function createLossResult(stake: number): BetResult {
  return {
    outcome: 'loss',
    profit: -stake,
    stake,
    payout: 0,
  };
}

/**
 * Create a push result (stake returned)
 */
function createPushResult(stake: number): BetResult {
  return {
    outcome: 'push',
    profit: 0,
    stake,
    payout: stake,
  };
}

/**
 * Get the best bet from market results (highest profit)
 */
export function getBestBet(results: MarketBetResults | null): { outcome: string; result: BetResult } | null {
  if (!results) return null;

  const entries = Object.entries(results);
  if (entries.length === 0) return null;

  // Find outcome with highest profit
  let best = entries[0];
  for (const entry of entries) {
    if (entry[1].profit > best[1].profit) {
      best = entry;
    }
  }

  return {
    outcome: best[0],
    result: best[1],
  };
}

/**
 * Format profit for display
 */
export function formatProfit(profit: number): string {
  const sign = profit > 0 ? '+' : '';
  return `${sign}${profit.toFixed(2)}`;
}

/**
 * Get color class for outcome
 */
export function getOutcomeColor(outcome: BetOutcome): string {
  switch (outcome) {
    case 'win':
      return 'text-green-600 bg-green-50';
    case 'loss':
      return 'text-red-600 bg-red-50';
    case 'push':
      return 'text-yellow-600 bg-yellow-50';
    case 'pending':
      return 'text-gray-500 bg-gray-50';
    default:
      return '';
  }
}
