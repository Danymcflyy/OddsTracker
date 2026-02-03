/**
 * Opening Odds Service - The Odds API v4
 * Smart scan that only requests missing markets and stops when all captured
 */

import { getTheOddsApiClient } from '@/lib/api/theoddsapi';
import {
  getEventsWithPendingMarkets,
  getPendingMarkets,
  upsertMarketState,
  getSetting,
  logApiUsage,
} from '@/lib/db/helpers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Event as ApiEvent, Bookmaker, Market as ApiMarket } from '@/lib/api/theoddsapi/client';
import type { MarketState, OpeningOdds } from '@/lib/db/types';

interface ScanResult {
  success: boolean;
  eventsScanned: number;
  marketsChecked: number;
  marketsCaptured: number;
  attemptsUpdated: number;
  creditsUsed: number;
  errors: string[];
}

/**
 * Normalize string for comparison: remove accents, lowercase, trim
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics/accents
}

/**
 * Check if text contains team name (fuzzy match with accent removal)
 */
function containsTeamName(text: string, teamName: string): boolean {
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
 * For alternate markets (spreads/totals), this returns multiple OpeningOdds (one per point)
 * For team_totals, returns separate entries for home and away teams
 * For regular markets (h2h), this returns a single OpeningOdds
 */
function extractOddsFromMarket(
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

  // For alternate markets, group outcomes by point value
  const isAlternateMarket = market.key.includes('alternate_') || market.key.includes('spread') || market.key.includes('total');

  // Team Totals: need to separate home and away team outcomes
  if (isTeamTotals) {
    // Group by (point, team)
    const byKey = new Map<string, any>();

    for (const outcome of market.outcomes as any[]) {
      const name = outcome.name.toLowerCase();
      const point = outcome.point ?? 0;
      const description = outcome.description?.toLowerCase().trim() || '';

      // Determine which team using fuzzy matching (handles accents, etc.)
      let teamSide: 'home' | 'away' | null = null;

      if (description) {
        // Use fuzzy matching to handle accents and slight name variations
        if (containsTeamName(description, homeTeam)) {
          teamSide = 'home';
        } else if (containsTeamName(description, awayTeam)) {
          teamSide = 'away';
        }
      }

      if (!teamSide) continue;

      // Determine over/under
      let type: 'over' | 'under' | null = null;
      if (name.includes('over')) type = 'over';
      else if (name.includes('under')) type = 'under';

      if (!type) continue;

      const compositeKey = `${point}_${teamSide}`;
      if (!byKey.has(compositeKey)) {
        byKey.set(compositeKey, { point, team: teamSide });
      }
      byKey.get(compositeKey)![type] = outcome.price;
    }

    return Array.from(byKey.values());
  }

  // BTTS: Yes/No
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
    // Group outcomes by point, normalizing spreads to Home perspective
    const byPoint = new Map<number, any[]>();

    for (const outcome of market.outcomes as any[]) {
      let point = outcome.point ?? 0;

      // Normalize Spread points - DISABLED to allow full range (+ and -) display
      // if (isSpread) {
      //  const name = outcome.name.toLowerCase();
      //  if (name === awayTeamLower) {
      //     point = -1 * point;
      //  }
      // }

      if (!byPoint.has(point)) {
        byPoint.set(point, []);
      }
      byPoint.get(point)!.push(outcome);
    }

    const results: OpeningOdds[] = [];

    for (const [point, outcomes] of byPoint.entries()) {
      const odds: OpeningOdds = { point };

      for (const outcome of outcomes) {
        const name = outcome.name.toLowerCase();

        if (name === homeTeamLower) {
          odds.home = outcome.price;
        } else if (name === awayTeamLower) {
          odds.away = outcome.price;
        } else if (name.includes('over')) {
          odds.over = outcome.price;
        } else if (name.includes('under')) {
          odds.under = outcome.price;
        }
      }

      if (Object.keys(odds).length > 1) {
        results.push(odds);
      }
    }

    return results;
  } else {
    // Regular market (h2h, dnb, dc) - single odds object
    const odds: OpeningOdds = {};

    for (const outcome of market.outcomes as any[]) {
      const name = outcome.name.toLowerCase();

      if (name === homeTeamLower) {
        odds.home = outcome.price;
      } else if (name === awayTeamLower) {
        odds.away = outcome.price;
      } else if (name === 'draw' || name === 'tie' || name === 'x') {
        odds.draw = outcome.price;
      } else if (name.includes('over')) {
        odds.over = outcome.price;
        if (outcome.point !== undefined) odds.point = outcome.point;
      } else if (name.includes('under')) {
        odds.under = outcome.price;
        if (outcome.point !== undefined) odds.point = outcome.point;
      }
      // Double Chance handling - API returns "{Team} or Draw", "Draw or {Team}", "{Team} or {Team}"
      else if (name === 'home/draw' || name === '1x' || name.includes(' or draw') || (name.includes(homeTeamLower) && name.includes('draw'))) {
        odds['1x'] = outcome.price;
      } else if (name === 'draw/away' || name === 'x2' || name.includes('draw or ') || (name.includes('draw') && name.includes(awayTeamLower))) {
        odds['x2'] = outcome.price;
      } else if (name === 'home/away' || name === '12' || (name.includes(homeTeamLower) && name.includes(awayTeamLower) && !name.includes('draw'))) {
        odds['12'] = outcome.price;
      } else if (name === 'yes') {
        odds.yes = outcome.price;
      } else if (name === 'no') {
        odds.no = outcome.price;
      }
    }

    return Object.keys(odds).length > 0 ? [odds] : [];
  }
}

/**
 * Merge variations with the same point value
 * For spreads: home -3.25 and away +3.25 should be merged into one entry with point=-3.25
 */
function mergeVariationsByPoint(variations: OpeningOdds[]): OpeningOdds[] {
  const byPoint = new Map<number | undefined, OpeningOdds>();

  for (const variation of variations) {
    const point = variation.point;
    const existing = byPoint.get(point);

    if (existing) {
      // Merge: copy non-undefined values from variation to existing
      if (variation.home !== undefined) existing.home = variation.home;
      if (variation.away !== undefined) existing.away = variation.away;
      if (variation.over !== undefined) existing.over = variation.over;
      if (variation.under !== undefined) existing.under = variation.under;
      if (variation.draw !== undefined) existing.draw = variation.draw;
      if (variation.yes !== undefined) existing.yes = variation.yes;
      if (variation.no !== undefined) existing.no = variation.no;
    } else {
      // Clone to avoid mutating original
      byPoint.set(point, { ...variation });
    }
  }

  return Array.from(byPoint.values());
}

/**
 * Map database market keys to API market keys
 * Use alternate markets to get multiple point variations
 */
function mapToApiMarketKey(dbMarketKey: string): string {
  const mapping: Record<string, string> = {
    'spreads': 'alternate_spreads',
    'totals': 'alternate_totals',
    'spreads_h1': 'alternate_spreads_h1',
    'totals_h1': 'alternate_totals_h1',
    'team_totals': 'alternate_team_totals', // NEW: Get all TT lines
  };

  return mapping[dbMarketKey] || dbMarketKey;
}

/**
 * Map API market keys back to database market keys
 */
function mapToDbMarketKey(apiMarketKey: string): string {
  const mapping: Record<string, string> = {
    'alternate_spreads': 'spreads',
    'alternate_totals': 'totals',
    'alternate_spreads_h1': 'spreads_h1',
    'alternate_totals_h1': 'totals_h1',
    'alternate_team_totals': 'team_totals', // NEW
  };

  return mapping[apiMarketKey] || apiMarketKey;
}

/**
 * Scan opening odds for a single event
 */
export async function scanEventOpeningOdds(
  eventApiId: string,
  eventDbId: string,
  sportKey: string,
  pendingMarkets: MarketState[]
): Promise<{ captured: number; attemptsUpdated: number; creditsUsed: number }> {
  if (pendingMarkets.length === 0) {
    return { captured: 0, attemptsUpdated: 0, creditsUsed: 0 };
  }

  const client = getTheOddsApiClient();
  const bookmaker = await getSetting('bookmaker') || 'pinnacle';
  const region = await getSetting('region') || 'eu';

  // Map database market keys to API market keys (e.g., spreads -> alternate_spreads)
  const apiMarketKeys = pendingMarkets.map(m => mapToApiMarketKey(m.market_key));
  const uniqueApiMarketKeys = [...new Set(apiMarketKeys)];

  console.log(`[OpeningOdds] Scanning event ${eventApiId} for markets: ${uniqueApiMarketKeys.join(', ')}`);

  try {
    // Request using API market keys (alternate_spreads, alternate_totals, etc.)
    const response = await client.getEventOdds(sportKey, eventApiId, {
      regions: region,
      markets: uniqueApiMarketKeys.join(','),
      bookmakers: bookmaker,
      oddsFormat: 'decimal',
    });

    const event = response.data;
    const creditsUsed = response.headers.requestsLast;

    // Find our bookmaker in the response
    const bookmakerData = event.bookmakers?.find((b: Bookmaker) => b.key === bookmaker);

    if (!bookmakerData) {
      console.log(`[OpeningOdds] No data from ${bookmaker} for event ${eventApiId}. Updating ${pendingMarkets.length} markets attempts.`);

      // Update attempts for all pending markets
      let attemptsUpdated = 0;
      for (const marketState of pendingMarkets) {
        const { error } = await (supabaseAdmin as any)
          .from('market_states')
          .update({
            attempts: marketState.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          } as any)
          .eq('id', marketState.id);

        if (error) {
            console.error(`[OpeningOdds] ❌ Failed to update attempts for market ${marketState.id}:`, error.message);
        } else {
            attemptsUpdated++;
        }
      }

      console.log(`[OpeningOdds] ✅ Updated attempts for ${attemptsUpdated}/${pendingMarkets.length} markets`);

      return { captured: 0, attemptsUpdated, creditsUsed };
    }

    let capturedCount = 0;
    let attemptsUpdated = 0;

    // Group markets by market_key to handle multiple point variations
    // Map API market keys back to DB keys (e.g., alternate_spreads -> spreads)
    const marketsByDbKey = new Map<string, ApiMarket[]>();
    for (const apiMarket of bookmakerData.markets) {
      const dbMarketKey = mapToDbMarketKey(apiMarket.key);
      if (!marketsByDbKey.has(dbMarketKey)) {
        marketsByDbKey.set(dbMarketKey, []);
      }
      marketsByDbKey.get(dbMarketKey)!.push(apiMarket);
    }

    // Check if capture is late (< 72h before kickoff)
    const commenceTime = new Date(event.commence_time);
    const now = new Date();
    const hoursBeforeKickoff = (commenceTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isLateCapture = hoursBeforeKickoff < 72; // 3 days

    // Process each market type (may have multiple variations)
    for (const [dbMarketKey, apiMarkets] of marketsByDbKey.entries()) {
      const marketState = pendingMarkets.find(m => m.market_key === dbMarketKey);

      if (!marketState) continue;

      // Extract odds for all variations
      let oddsVariations: OpeningOdds[] = [];
      for (const apiMarket of apiMarkets) {
        const odds = extractOddsFromMarket(apiMarket, event.home_team, event.away_team);
        oddsVariations.push(...odds);
      }

      // Merge variations with the same point
      const isSpreadMarket = dbMarketKey.includes('spread');
      if (isSpreadMarket) {
        oddsVariations = mergeVariationsByPoint(oddsVariations);
      }
      
      // Inject metadata if late capture
      if (isLateCapture) {
          oddsVariations = oddsVariations.map(ov => ({
              ...ov,
              _metadata: { is_late: true, days_before: Math.round(hoursBeforeKickoff * 10) / 10 }
          }));
      }

      // Special handling for team_totals: split into home and away
      const isTeamTotals = dbMarketKey === 'team_totals';

      if (isTeamTotals && oddsVariations.length > 0) {
        // Separate home and away team totals
        const homeVariations = oddsVariations.filter((v: any) => v.team === 'home');
        const awayVariations = oddsVariations.filter((v: any) => v.team === 'away');

        // Store as separate market keys
        if (homeVariations.length > 0) {
          const res = await upsertMarketState({
            event_id: eventDbId,
            market_key: 'team_totals_home',
            status: 'captured',
            opening_odds: homeVariations[0],
            opening_odds_variations: homeVariations,
            opening_captured_at: new Date().toISOString(),
            opening_bookmaker_update: apiMarkets[0].last_update,
            deadline: marketState.deadline,
            attempts: marketState.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          });
          if (!res) console.error(`[OpeningOdds] ❌ Failed to save team_totals_home for ${eventApiId}`);
          else console.log(`[OpeningOdds] ✅ Captured team_totals_home (${homeVariations.length} variation(s)) for ${eventApiId}`);
        }
        if (awayVariations.length > 0) {
          const res = await upsertMarketState({
            event_id: eventDbId,
            market_key: 'team_totals_away',
            status: 'captured',
            opening_odds: awayVariations[0],
            opening_odds_variations: awayVariations,
            opening_captured_at: new Date().toISOString(),
            opening_bookmaker_update: apiMarkets[0].last_update,
            deadline: marketState.deadline,
            attempts: marketState.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          });
          if (!res) console.error(`[OpeningOdds] ❌ Failed to save team_totals_away for ${eventApiId}`);
          else console.log(`[OpeningOdds] ✅ Captured team_totals_away (${awayVariations.length} variation(s)) for ${eventApiId}`);
        }

        // Mark original market_state as captured
        await upsertMarketState({
          event_id: eventDbId,
          market_key: dbMarketKey,
          status: 'captured',
          opening_odds: oddsVariations[0],
          opening_odds_variations: oddsVariations,
          opening_captured_at: new Date().toISOString(),
          opening_bookmaker_update: apiMarkets[0].last_update,
          deadline: marketState.deadline,
          attempts: marketState.attempts + 1,
          last_attempt_at: new Date().toISOString(),
        });

        capturedCount++;
        attemptsUpdated++; // Original market_state attempts incremented
      } else if (oddsVariations.length > 0) {
        // Standard processing for other markets
        const res = await upsertMarketState({
          event_id: eventDbId,
          market_key: dbMarketKey,
          status: 'captured',
          opening_odds: oddsVariations[0],
          opening_odds_variations: oddsVariations,
          opening_captured_at: new Date().toISOString(),
          opening_bookmaker_update: apiMarkets[0].last_update,
          deadline: marketState.deadline,
          attempts: marketState.attempts + 1,
          last_attempt_at: new Date().toISOString(),
        });

        if (!res) console.error(`[OpeningOdds] ❌ Failed to save ${dbMarketKey} for ${eventApiId}`);
        else {
            capturedCount++;
            attemptsUpdated++;
            console.log(`[OpeningOdds] ✅ Captured ${dbMarketKey} (${oddsVariations.length} variation(s)) for ${eventApiId}`);
        }
      } else {
        // Market exists but no odds yet
        const { error } = await (supabaseAdmin as any)
          .from('market_states')
          .update({
            attempts: marketState.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          } as any)
          .eq('id', marketState.id);

        if (error) console.error(`[OpeningOdds] ❌ Failed to increment attempts for ${dbMarketKey} (event ${eventApiId}):`, error.message);
        else attemptsUpdated++;
      }
    }

    // Check for markets not returned by API (might not be offered)
    const returnedMarketKeys = bookmakerData.markets.map((m: ApiMarket) => m.key);
    const notReturnedMarkets = pendingMarkets.filter(
      m => !returnedMarketKeys.includes(m.market_key)
    );

    for (const marketState of notReturnedMarkets) {
      // Check if we've passed the deadline
      const isPastDeadline = marketState.deadline && new Date(marketState.deadline) < new Date();

      if (isPastDeadline) {
        // Mark as not offered
        const res = await upsertMarketState({
          event_id: eventDbId,
          market_key: marketState.market_key,
          status: 'not_offered',
          opening_odds: null,
          opening_odds_variations: [],
          opening_captured_at: null,
          opening_bookmaker_update: null,
          deadline: marketState.deadline,
          attempts: marketState.attempts + 1,
          last_attempt_at: new Date().toISOString(),
        });
        if (res) attemptsUpdated++;
        console.log(`[OpeningOdds] ⚠️ Marked ${marketState.market_key} as not_offered for ${eventApiId}`);
      } else {
        // Just update attempts
        const { error } = await (supabaseAdmin as any)
          .from('market_states')
          .update({
            attempts: marketState.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          } as any)
          .eq('id', marketState.id);
        if (!error) attemptsUpdated++;
      }
    }

    return { captured: capturedCount, attemptsUpdated, creditsUsed };
  } catch (error: any) {
    // Handle 404 (Event not found / Expired) gracefully
    if (error.message?.includes('404') || error.status === 404) {
      console.warn(`[OpeningOdds] Event ${eventApiId} not found (404). Marking markets as not offered.`);

      // Mark all pending markets as not_offered to stop retrying
      let attemptsUpdated = 0;
      for (const marketState of pendingMarkets) {
        const { error: updateError } = await (supabaseAdmin as any)
          .from('market_states')
          .update({
            status: 'not_offered',
            last_attempt_at: new Date().toISOString(),
          } as any)
          .eq('id', marketState.id);
        if (!updateError) attemptsUpdated++;
      }

      // Return success with 0 captured to continue scan
      return { captured: 0, attemptsUpdated, creditsUsed: 0 };
    }

    console.error(`[OpeningOdds] Error scanning event ${eventApiId}:`, error);

    // Update attempts even on error
    for (const marketState of pendingMarkets) {
      await (supabaseAdmin as any)
        .from('market_states')
        .update({
          attempts: marketState.attempts + 1,
          last_attempt_at: new Date().toISOString(),
        } as any)
        .eq('id', marketState.id);
    }

    throw error;
  }
}

/**
 * Scan opening odds for all events with pending markets
 */
export async function scanAllOpeningOdds(): Promise<ScanResult> {
  const startTime = Date.now();

  console.log('[OpeningOdds] Starting opening odds scan...');

  // SAFETY CHECK: Ensure Service Role Key is present
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const errorMsg = '❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in environment variables. Cannot write to DB.';
      console.error(errorMsg);
      throw new Error(errorMsg);
  }

  const result: ScanResult = {
    success: true,
    eventsScanned: 0,
    marketsChecked: 0,
    marketsCaptured: 0,
    attemptsUpdated: 0,
    creditsUsed: 0,
    errors: [],
  };

  try {
    // Get all events with pending markets
    let eventsWithPending = await getEventsWithPendingMarkets();

    console.log(`[OpeningOdds] Found ${eventsWithPending.length} events with pending markets`);

    if (eventsWithPending.length === 0) {
      console.log('[OpeningOdds] No events to scan');
      return result;
    }

    // === CLEANUP: Mark past events as not_offered ===
    const now = new Date();
    const pastEvents = eventsWithPending.filter(e => new Date(e.commence_time) < now);

    if (pastEvents.length > 0) {
      console.log(`[OpeningOdds] Cleaning up ${pastEvents.length} past events...`);

      for (const event of pastEvents) {
        await (supabaseAdmin as any)
          .from('market_states')
          .update({ status: 'not_offered' })
          .eq('event_id', event.id)
          .eq('status', 'pending');
      }

      // Remove from processing list
      eventsWithPending = eventsWithPending.filter(e => new Date(e.commence_time) >= now);
      console.log(`[OpeningOdds] ${eventsWithPending.length} events remaining after cleanup`);

      if (eventsWithPending.length === 0) {
        console.log('[OpeningOdds] No future events to scan');
        return result;
      }
    }

    // Fetch market_states for ALL events FIRST (before limiting)
    // This ensures we can sort by attempts correctly and prioritize new events
    const allEventIds = eventsWithPending.map(e => e.id);
    const BATCH_SIZE = 50;
    const allPendingMarkets: any[] = [];

    console.log(`[OpeningOdds] Fetching market_states for ALL ${allEventIds.length} events in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < allEventIds.length; i += BATCH_SIZE) {
      const batchIds = allEventIds.slice(i, i + BATCH_SIZE);
      const { data: batchMarkets, error: batchError } = await (supabaseAdmin as any)
        .from('market_states')
        .select('*')
        .in('event_id', batchIds)
        .eq('status', 'pending');

      if (batchError) {
        console.error(`[OpeningOdds] ❌ Batch ${Math.floor(i / BATCH_SIZE) + 1} FAILED:`, batchError.message);
        continue;
      }

      if (batchMarkets) {
        allPendingMarkets.push(...batchMarkets);
      }
    }

    console.log(`[OpeningOdds] ✅ CHECKPOINT 1: ${allPendingMarkets.length} market_states loaded for ${allEventIds.length} events`);

    if (allPendingMarkets.length === 0) {
      console.error(`[OpeningOdds] ❌ CRITICAL: No market_states found for ${allEventIds.length} events!`);
      return result;
    }

    // Group markets by event_id for fast lookup
    const marketsByEvent = new Map<string, any[]>();
    // Also track min attempts per event for fair scheduling
    const attemptsByEvent = new Map<string, number>();

    (allPendingMarkets || []).forEach((market: any) => {
      if (!marketsByEvent.has(market.event_id)) {
        marketsByEvent.set(market.event_id, []);
        attemptsByEvent.set(market.event_id, 9999);
      }
      marketsByEvent.get(market.event_id)!.push(market);

      const currentMin = attemptsByEvent.get(market.event_id)!;
      if (market.attempts < currentMin) {
          attemptsByEvent.set(market.event_id, market.attempts);
      }
    });

    console.log(`[OpeningOdds] Map size: ${marketsByEvent.size} events have actual pending markets.`);

    // === RESCUE QUOTA SYSTEM ===
    // Reserve slots for high-attempt events that might have odds available now
    const MAX_EVENTS_PER_RUN = 200;
    const RESCUE_QUOTA = 20;
    const HIGH_ATTEMPTS_THRESHOLD = 100;

    // Track last_attempt_at for rotation (to avoid always processing the same 20 events)
    const lastAttemptByEvent = new Map<string, number>();
    (allPendingMarkets || []).forEach((market: any) => {
      const lastAttempt = market.last_attempt_at ? new Date(market.last_attempt_at).getTime() : 0;
      const current = lastAttemptByEvent.get(market.event_id) ?? Infinity;
      if (lastAttempt < current) {
        lastAttemptByEvent.set(market.event_id, lastAttempt);
      }
    });

    // Separate normal and high-attempt events
    const normalEvents = eventsWithPending.filter(e => {
      const attempts = attemptsByEvent.get(e.id) ?? 0;
      return attempts < HIGH_ATTEMPTS_THRESHOLD;
    });

    const highAttemptsEvents = eventsWithPending.filter(e => {
      const attempts = attemptsByEvent.get(e.id) ?? 0;
      return attempts >= HIGH_ATTEMPTS_THRESHOLD;
    });

    // Sort normal: by attempts ASC, then by commence_time
    normalEvents.sort((a, b) => {
      const attemptsA = attemptsByEvent.get(a.id) ?? 0;
      const attemptsB = attemptsByEvent.get(b.id) ?? 0;
      if (attemptsA !== attemptsB) return attemptsA - attemptsB;
      return new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime();
    });

    // Sort rescue: urgent first (<48h), then oldest last_attempt (rotation)
    const nowMs = Date.now();
    highAttemptsEvents.sort((a, b) => {
      const hoursA = (new Date(a.commence_time).getTime() - nowMs) / 3600000;
      const hoursB = (new Date(b.commence_time).getTime() - nowMs) / 3600000;

      // Urgent events first (<48h to kickoff)
      if (hoursA < 48 && hoursB >= 48) return -1;
      if (hoursB < 48 && hoursA >= 48) return 1;

      // Same urgency: oldest last_attempt first (rotation)
      const lastA = lastAttemptByEvent.get(a.id) ?? 0;
      const lastB = lastAttemptByEvent.get(b.id) ?? 0;
      return lastA - lastB;
    });

    // Assemble final batch
    const normalSlice = normalEvents.slice(0, MAX_EVENTS_PER_RUN - RESCUE_QUOTA);
    const rescueSlice = highAttemptsEvents.slice(0, RESCUE_QUOTA);
    eventsWithPending = [...normalSlice, ...rescueSlice];

    console.log(`[OpeningOdds] Batch: ${normalSlice.length} normal + ${rescueSlice.length} rescue = ${eventsWithPending.length} total`);
    console.log(`[OpeningOdds] High-attempts events waiting: ${highAttemptsEvents.length} (threshold: ${HIGH_ATTEMPTS_THRESHOLD}+ attempts)`);

    // Process each event
    for (const event of eventsWithPending) {
      try {
        // Get pending markets from pre-loaded map
        const pendingMarkets = marketsByEvent.get(event.id) || [];

        if (pendingMarkets.length === 0) continue;

        result.eventsScanned++;
        result.marketsChecked += pendingMarkets.length;

        // Scan this event
        const scanResult = await scanEventOpeningOdds(
          event.api_event_id,
          event.id,
          event.sport_key,
          pendingMarkets
        );

        result.marketsCaptured += scanResult.captured;
        result.attemptsUpdated += scanResult.attemptsUpdated;
        result.creditsUsed += scanResult.creditsUsed;

        // Log this API call
        await logApiUsage({
          job_name: 'scan_opening_odds',
          endpoint: `/sports/${event.sport_key}/events/${event.api_event_id}/odds`,
          sport_key: event.sport_key,
          request_params: {
            event_id: event.api_event_id,
            markets: pendingMarkets.map(m => m.market_key),
            attemptsUpdated: scanResult.attemptsUpdated,
          },
          credits_used: scanResult.creditsUsed,
          credits_remaining: null,
          events_processed: 1,
          markets_captured: scanResult.captured,
          success: true,
          error_message: null,
          duration_ms: null,
        });

        // Small delay between events to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`Event ${event.api_event_id}: ${errorMsg}`);
        result.success = false;

        console.error(`[OpeningOdds] Failed to scan event ${event.api_event_id}:`, error);

        // Log failed API call
        await logApiUsage({
          job_name: 'scan_opening_odds',
          endpoint: `/sports/${event.sport_key}/events/${event.api_event_id}/odds`,
          sport_key: event.sport_key,
          request_params: { event_id: event.api_event_id },
          credits_used: 0,
          credits_remaining: null,
          events_processed: 0,
          markets_captured: 0,
          success: false,
          error_message: errorMsg,
          duration_ms: null,
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[OpeningOdds] Scan complete in ${duration}ms:`);
    console.log(`  - Events scanned: ${result.eventsScanned}`);
    console.log(`  - Markets checked: ${result.marketsChecked}`);
    console.log(`  - Markets captured: ${result.marketsCaptured}`);
    console.log(`  - Attempts updated: ${result.attemptsUpdated}`);
    console.log(`  - Credits used: ${result.creditsUsed}`);
    console.log(`  - Errors: ${result.errors.length}`);

    // Log final summary for persistence (helps bypass Vercel 2-min log limit)
    await logApiUsage({
      job_name: 'scan_opening_odds_summary',
      endpoint: 'scan_all_opening_odds',
      sport_key: null,
      request_params: {
        eventsScanned: result.eventsScanned,
        marketsChecked: result.marketsChecked,
        marketsCaptured: result.marketsCaptured,
        attemptsUpdated: result.attemptsUpdated,
        errorsCount: result.errors.length,
      },
      credits_used: result.creditsUsed,
      credits_remaining: null,
      events_processed: result.eventsScanned,
      markets_captured: result.marketsCaptured,
      success: result.success,
      error_message: result.errors.length > 0 ? result.errors.slice(0, 3).join('; ') : null,
      duration_ms: duration,
    });

    return result;
  } catch (error) {
    console.error('[OpeningOdds] Fatal error during scan:', error);
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : String(error));
    return result;
  }
}
