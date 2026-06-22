import type { Market as ApiMarket } from '@/lib/api/theoddsapi/client';
import type { OpeningOdds } from '@/lib/db/types';

/**
 * Normalize string for comparison: remove accents, lowercase, trim
 */
export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics/accents
}

/**
 * Check if text contains team name (fuzzy match with accent removal)
 */
export function containsTeamName(text: string, teamName: string): boolean {
  const normalizedText = normalizeString(text);
  const normalizedTeam = normalizeString(teamName);

  // Direct match
  if (normalizedText.includes(normalizedTeam)) {
    return true;
  }

  // Try matching first significant word (e.g., "Atlético Madrid" -> "atletico")
  const teamWords = normalizedTeam.split(/\s+/);
  if (teamWords.length > 1) {
    // Match if any significant word (>3 chars) is found
    for (const word of teamWords) {
      if (word.length > 3 && normalizedText.includes(word)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Extract odds from API market data
 */
export function extractOddsFromMarket(
  market: ApiMarket,
  homeTeam: string,
  awayTeam: string
): OpeningOdds[] {
  if (!market.outcomes || market.outcomes.length === 0) {
    return [];
  }

  const homeTeamLower = homeTeam.toLowerCase().trim();
  const awayTeamLower = awayTeam.toLowerCase().trim();

  const isSpread = market.key.includes('spread');
  const isTeamTotals = market.key === 'team_totals' || market.key === 'alternate_team_totals';
  const isBtts = market.key === 'btts';
  const isAlternateMarket = market.key.includes('alternate_') || market.key.includes('spread') || market.key.includes('total');

  if (isTeamTotals) {
    const byKey = new Map<string, any>();
    for (const outcome of market.outcomes as any[]) {
      const name = outcome.name.toLowerCase();
      const point = outcome.point ?? 0;
      const description = outcome.description?.toLowerCase().trim() || '';
      let teamSide: 'home' | 'away' | null = null;
      if (description) {
        if (containsTeamName(description, homeTeam)) teamSide = 'home';
        else if (containsTeamName(description, awayTeam)) teamSide = 'away';
      }
      if (!teamSide) continue;
      let type: 'over' | 'under' | null = null;
      if (name.includes('over')) type = 'over';
      else if (name.includes('under')) type = 'under';
      if (!type) continue;
      const compositeKey = `${point}_${teamSide}`;
      if (!byKey.has(compositeKey)) byKey.set(compositeKey, { point, team: teamSide });
      byKey.get(compositeKey)![type] = outcome.price;
    }
    return Array.from(byKey.values());
  }

  if (isBtts) {
    const odds: OpeningOdds = {};
    for (const outcome of market.outcomes as any[]) {
      const name = outcome.name.toLowerCase();
      if (name === 'yes') odds.yes = outcome.price;
      else if (name === 'no') odds.no = outcome.price;
    }
    return Object.keys(odds).length > 0 ? [odds] : [];
  }

  if (isAlternateMarket) {
    if (isSpread) {
      const homeByPoint = new Map<number, number>();
      const awayByPoint = new Map<number, number>();
      for (const outcome of market.outcomes as any[]) {
        const point = outcome.point ?? 0;
        const name = outcome.name.toLowerCase();
        if (name === homeTeamLower || containsTeamName(name, homeTeam)) homeByPoint.set(point, outcome.price);
        else if (name === awayTeamLower || containsTeamName(name, awayTeam)) awayByPoint.set(point, outcome.price);
      }

      // FIX 1 (J League missing handicaps): Collect all unique handicap points
      // from BOTH home AND away sides, not just home.
      const allHomePoints = new Set<number>(homeByPoint.keys());
      for (const awayPoint of awayByPoint.keys()) {
        allHomePoints.add(-1 * awayPoint); // Mirror away point to home reference frame
      }

      const results: OpeningOdds[] = [];
      // FIX 2 (Sunderland duplicates): Track seen canonical values (absolute point)
      // to prevent mirrored pairs like {point: 1.5} and {point: -1.5} both appearing.
      const seenCanonical = new Set<number>();

      for (const homePoint of allHomePoints) {
        const canonicalKey = Math.abs(homePoint);
        if (seenCanonical.has(canonicalKey)) continue;
        seenCanonical.add(canonicalKey);

        const homePrice = homeByPoint.get(homePoint);
        const awayPrice = awayByPoint.get(-1 * homePoint);

        if (homePrice !== undefined || awayPrice !== undefined) {
          const variation: OpeningOdds = { point: homePoint };
          if (homePrice !== undefined) variation.home = homePrice;
          if (awayPrice !== undefined) variation.away = awayPrice;
          results.push(variation);
        }
      }
      return results;
    }
    const byPoint = new Map<number, any[]>();
    for (const outcome of market.outcomes as any[]) {
      const point = outcome.point ?? 0;
      if (!byPoint.has(point)) byPoint.set(point, []);
      byPoint.get(point)!.push(outcome);
    }
    const results: OpeningOdds[] = [];
    for (const [point, outcomes] of byPoint.entries()) {
      const odds: OpeningOdds = { point };
      for (const outcome of outcomes) {
        const name = outcome.name.toLowerCase();
        if (name === homeTeamLower) odds.home = outcome.price;
        else if (name === awayTeamLower) odds.away = outcome.price;
        else if (name.includes('over')) odds.over = outcome.price;
        else if (name.includes('under')) odds.under = outcome.price;
      }
      if (Object.keys(odds).length > 1) results.push(odds);
    }
    return results;
  } else {
    const odds: OpeningOdds = {};
    for (const outcome of market.outcomes as any[]) {
      const name = outcome.name.toLowerCase();
      if (name === homeTeamLower) odds.home = outcome.price;
      else if (name === awayTeamLower) odds.away = outcome.price;
      else if (name === 'draw' || name === 'tie' || name === 'x') odds.draw = outcome.price;
      else if (name.includes('over')) {
        odds.over = outcome.price;
        if (outcome.point !== undefined) odds.point = outcome.point;
      } else if (name.includes('under')) {
        odds.under = outcome.price;
        if (outcome.point !== undefined) odds.point = outcome.point;
      } else if (name === 'home/draw' || name === '1x' || name.includes(' or draw') || (name.includes(homeTeamLower) && name.includes('draw'))) {
        odds['1x'] = outcome.price;
      } else if (name === 'draw/away' || name === 'x2' || name.includes('draw or ') || (name.includes('draw') && name.includes(awayTeamLower))) {
        odds['x2'] = outcome.price;
      } else if (name === 'home/away' || name === '12' || (name.includes(homeTeamLower) && name.includes(awayTeamLower) && !name.includes('draw'))) {
        odds['12'] = outcome.price;
      } else if (name === 'yes') odds.yes = outcome.price;
      else if (name === 'no') odds.no = outcome.price;
    }
    return Object.keys(odds).length > 0 ? [odds] : [];
  }
}

/**
 * Merge variations with the same point value
 */
export function mergeVariationsByPoint(variations: OpeningOdds[]): OpeningOdds[] {
  const byPoint = new Map<number | undefined, OpeningOdds>();
  for (const variation of variations) {
    const point = variation.point;
    const existing = byPoint.get(point);
    if (existing) {
      if (variation.home !== undefined) existing.home = variation.home;
      if (variation.away !== undefined) existing.away = variation.away;
      if (variation.over !== undefined) existing.over = variation.over;
      if (variation.under !== undefined) existing.under = variation.under;
      if (variation.draw !== undefined) existing.draw = variation.draw;
      if (variation.yes !== undefined) existing.yes = variation.yes;
      if (variation.no !== undefined) existing.no = variation.no;
    } else {
      byPoint.set(point, { ...variation });
    }
  }
  return Array.from(byPoint.values());
}

/**
 * Map database market keys to API market keys
 */
export function mapToApiMarketKey(dbMarketKey: string): string {
  const mapping: Record<string, string> = {
    'spreads': 'alternate_spreads',
    'totals': 'alternate_totals',
    'spreads_h1': 'alternate_spreads_h1',
    'totals_h1': 'alternate_totals_h1',
    'team_totals': 'alternate_team_totals',
  };
  return mapping[dbMarketKey] || dbMarketKey;
}

/**
 * Map API market keys back to database market keys
 */
export function mapToDbMarketKey(apiMarketKey: string): string {
  const mapping: Record<string, string> = {
    'alternate_spreads': 'spreads',
    'alternate_totals': 'totals',
    'alternate_spreads_h1': 'spreads_h1',
    'alternate_totals_h1': 'totals_h1',
    'alternate_team_totals': 'team_totals',
  };
  return mapping[apiMarketKey] || apiMarketKey;
}
