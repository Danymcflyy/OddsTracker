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
  creditsUsed: number;
  errors: string[];
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

      // Determine which team
      let teamSide: 'home' | 'away' | null = null;
      if (description.includes(homeTeamLower)) {
        teamSide = 'home';
      } else if (description.includes(awayTeamLower)) {
        teamSide = 'away';
      } else if (description === homeTeamLower) {
        teamSide = 'home';
      } else if (description === awayTeamLower) {
        teamSide = 'away';
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

      // Normalize Spread points: Away +X is equivalent to Home -X
      if (isSpread) {
        const name = outcome.name.toLowerCase();
        if (name === awayTeamLower) {
           point = -1 * point;
        }
      }

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
      // Double Chance handling
      else if (name === 'home/draw' || name === '1x') {
        odds['1x'] = outcome.price;
      } else if (name === 'draw/away' || name === 'x2') {
        odds['x2'] = outcome.price;
      } else if (name === 'home/away' || name === '12') {
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
async function scanEventOpeningOdds(
  eventApiId: string,
  eventDbId: string,
  sportKey: string,
  pendingMarkets: MarketState[]
): Promise<{ captured: number; creditsUsed: number }> {
  if (pendingMarkets.length === 0) {
    return { captured: 0, creditsUsed: 0 };
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
      console.log(`[OpeningOdds] No data from ${bookmaker} for event ${eventApiId}`);

      // Update attempts for all pending markets
      for (const marketState of pendingMarkets) {
        await (supabaseAdmin as any)
          .from('market_states')
          .update({
            attempts: marketState.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          } as any)
          .eq('id', marketState.id);
      }

      return { captured: 0, creditsUsed };
    }

    let capturedCount = 0;

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

    // Process each market type (may have multiple variations)
    for (const [dbMarketKey, apiMarkets] of marketsByDbKey.entries()) {
      const marketState = pendingMarkets.find(m => m.market_key === dbMarketKey);

      if (!marketState) continue;

      // Extract odds for all variations
      const oddsVariations: OpeningOdds[] = [];
      for (const apiMarket of apiMarkets) {
        const odds = extractOddsFromMarket(apiMarket, event.home_team, event.away_team);
        oddsVariations.push(...odds);
      }

      // Special handling for team_totals: split into home and away
      const isTeamTotals = dbMarketKey === 'team_totals';

      if (isTeamTotals && oddsVariations.length > 0) {
        // Separate home and away team totals
        const homeVariations = oddsVariations.filter((v: any) => v.team === 'home');
        const awayVariations = oddsVariations.filter((v: any) => v.team === 'away');

        // Store as separate market keys
        if (homeVariations.length > 0) {
          await upsertMarketState({
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
          console.log(`[OpeningOdds] ✅ Captured team_totals_home (${homeVariations.length} variation(s)) for ${eventApiId}`);
        }
        if (awayVariations.length > 0) {
          await upsertMarketState({
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
          console.log(`[OpeningOdds] ✅ Captured team_totals_away (${awayVariations.length} variation(s)) for ${eventApiId}`);
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
      } else if (oddsVariations.length > 0) {
        // Standard processing for other markets
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
        console.log(`[OpeningOdds] ✅ Captured ${dbMarketKey} (${oddsVariations.length} variation(s)) for ${eventApiId}`);
      } else {
        // Market exists but no odds yet
        await (supabaseAdmin as any)
          .from('market_states')
          .update({
            attempts: marketState.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          } as any)
          .eq('id', marketState.id);
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
        await upsertMarketState({
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
        console.log(`[OpeningOdds] ⚠️ Marked ${marketState.market_key} as not_offered for ${eventApiId}`);
      } else {
        // Just update attempts
        await (supabaseAdmin as any)
          .from('market_states')
          .update({
            attempts: marketState.attempts + 1,
            last_attempt_at: new Date().toISOString(),
          } as any)
          .eq('id', marketState.id);
      }
    }

    return { captured: capturedCount, creditsUsed };
  } catch (error: any) {
    // Handle 404 (Event not found / Expired) gracefully
    if (error.message?.includes('404') || error.status === 404) {
      console.warn(`[OpeningOdds] Event ${eventApiId} not found (404). Marking markets as not offered.`);
      
      // Mark all pending markets as not_offered to stop retrying
      for (const marketState of pendingMarkets) {
        await (supabaseAdmin as any)
          .from('market_states')
          .update({
            status: 'not_offered',
            last_attempt_at: new Date().toISOString(),
          } as any)
          .eq('id', marketState.id);
      }
      
      // Return success with 0 captured to continue scan
      return { captured: 0, creditsUsed: 0 };
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

  const result: ScanResult = {
    success: true,
    eventsScanned: 0,
    marketsChecked: 0,
    marketsCaptured: 0,
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

    // LIMIT: Process max 200 events per run to avoid timeout
    // With ~1.3s per event, 200 events = ~260s (well under 300s maxDuration)
    // Capacity: 200 events × 30 runs/hour = 6000 events/hour
    const MAX_EVENTS_PER_RUN = 200;
    if (eventsWithPending.length > MAX_EVENTS_PER_RUN) {
      console.log(`[OpeningOdds] Limiting to ${MAX_EVENTS_PER_RUN} events to avoid timeout`);
      eventsWithPending = eventsWithPending.slice(0, MAX_EVENTS_PER_RUN);
    }

    // Optimize: Fetch all pending markets in one query (avoid N+1)
    const eventIds = eventsWithPending.map(e => e.id);
    const { data: allPendingMarkets } = await (supabaseAdmin as any)
      .from('market_states')
      .select('*')
      .in('event_id', eventIds)
      .eq('status', 'pending');

    // Group markets by event_id for fast lookup
    const marketsByEvent = new Map<string, any[]>();
    (allPendingMarkets || []).forEach((market: any) => {
      if (!marketsByEvent.has(market.event_id)) {
        marketsByEvent.set(market.event_id, []);
      }
      marketsByEvent.get(market.event_id)!.push(market);
    });

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
        result.creditsUsed += scanResult.creditsUsed;

        // Log this API call
        await logApiUsage({
          job_name: 'scan_opening_odds',
          endpoint: `/sports/${event.sport_key}/events/${event.api_event_id}/odds`,
          sport_key: event.sport_key,
          request_params: {
            event_id: event.api_event_id,
            markets: pendingMarkets.map(m => m.market_key),
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
    console.log(`  - Credits used: ${result.creditsUsed}`);
    console.log(`  - Errors: ${result.errors.length}`);

    return result;
  } catch (error) {
    console.error('[OpeningOdds] Fatal error during scan:', error);
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : String(error));
    return result;
  }
}
