/**
 * Closing Odds Service - The Odds API v4
 * Captures closing odds for completed events
 * Retries for 3 days, optional historical API fallback
 */

import { getTheOddsApiClient } from '@/lib/api/theoddsapi';
import {
  getCompletedEventsWithoutClosing,
  insertClosingOdds,
  updateClosingOdds,
  getSetting,
  logApiUsage,
} from '@/lib/db/helpers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Event as ApiEvent, Bookmaker, Market as ApiMarket } from '@/lib/api/theoddsapi/client';
import type { ClosingMarkets, ClosingMarketsVariations, MarketOdds } from '@/lib/db/types';

interface ClosingResult {
  success: boolean;
  eventsProcessed: number;
  closingCaptured: number;
  closingFailed: number;
  creditsUsed: number;
  errors: string[];
}

/**
 * Extract market odds from API response
 */
function extractMarketOdds(market: ApiMarket, homeTeam?: string, awayTeam?: string): MarketOdds {
  const odds: MarketOdds = {
    last_update: market.last_update,
  };

  const homeLower = homeTeam?.toLowerCase();
  const awayLower = awayTeam?.toLowerCase();

  for (const outcome of market.outcomes || []) {
    const name = outcome.name.toLowerCase();
    const nameOriginal = outcome.name;

    // 1. Exact match (case-insensitive) for team names
    if (homeLower && name === homeLower) {
      odds.home = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
      continue;
    }
    
    if (awayLower && name === awayLower) {
      odds.away = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
      continue;
    }

    // 2. Standard outcomes (Over/Under/Draw)
    if (name === 'draw' || name === 'tie' || name === 'x') {
      odds.draw = outcome.price;
      continue;
    }
    
    if (name.startsWith('over') || name === 'o') { // "Over 2.5", "Over"
      odds.over = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
      continue;
    }
    
    if (name.startsWith('under') || name === 'u') { // "Under 2.5", "Under"
      odds.under = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
      continue;
    }

    // 3. Generic "Home"/"Away" markers (fallback)
    // Be careful not to match team names containing these words accidentally, 
    // but usually "Home" / "Away" are distinct outcomes in API.
    if (name === 'home' || name === '1') {
      odds.home = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
      continue;
    }
    
    if (name === 'away' || name === '2') {
      odds.away = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
      continue;
    }
  }

  return odds;
}

/**
 * Capture closing odds for a single completed event
 */
async function captureEventClosingOdds(
  eventApiId: string,
  eventDbId: string,
  sportKey: string,
  commenceTime: string
): Promise<{ success: boolean; creditsUsed: number; error?: string }> {
  const client = getTheOddsApiClient();
  const bookmaker = await getSetting('bookmaker') || 'pinnacle';
  const region = await getSetting('region') || 'eu';
  const trackedMarkets = await getSetting('tracked_markets') || [];

  console.log(`[ClosingOdds] Capturing closing odds for event ${eventApiId}...`);

  try {
    // Request all tracked markets
    const response = await client.getEventOdds(sportKey, eventApiId, {
      regions: region,
      markets: trackedMarkets.join(','),
      bookmakers: bookmaker,
      oddsFormat: 'decimal',
    });

    const event = response.data;
    const creditsUsed = response.headers.requestsLast;

    // Find our bookmaker
    const bookmakerData = event.bookmakers?.find((b: Bookmaker) => b.key === bookmaker);

    if (!bookmakerData || !bookmakerData.markets || bookmakerData.markets.length === 0) {
      console.warn(`[ClosingOdds] No closing odds available for ${eventApiId}`);

      // Insert as missing
      await insertClosingOdds({
        event_id: eventDbId,
        markets: {},
        markets_variations: {},
        captured_at: new Date().toISOString(),
        bookmaker_update: null,
        capture_status: 'missing',
        error_message: 'No data from bookmaker',
        retry_count: 0,
        used_historical_api: false,
      });

      return {
        success: false,
        creditsUsed,
        error: 'No data from bookmaker',
      };
    }

    // Extract all markets (handle multiple point variations)
    const markets: ClosingMarkets = {};
    const marketsVariations: ClosingMarketsVariations = {};

    // Get team names from event
    const homeTeam = event.home_team;
    const awayTeam = event.away_team;

    // Group by market_key to handle multiple variations
    const marketsByKey = new Map<string, ApiMarket[]>();
    for (const apiMarket of bookmakerData.markets) {
      if (!marketsByKey.has(apiMarket.key)) {
        marketsByKey.set(apiMarket.key, []);
      }
      marketsByKey.get(apiMarket.key)!.push(apiMarket);
    }

    // Process each market type
    for (const [marketKey, apiMarkets] of marketsByKey.entries()) {
      // For backward compatibility, keep first variation in markets
      markets[marketKey] = extractMarketOdds(apiMarkets[0], homeTeam, awayTeam);

      // Store all variations
      marketsVariations[marketKey] = apiMarkets.map(m => extractMarketOdds(m, homeTeam, awayTeam));
    }

    // Insert closing odds
    await insertClosingOdds({
      event_id: eventDbId,
      markets,
      markets_variations: marketsVariations,
      captured_at: new Date().toISOString(),
      bookmaker_update: bookmakerData.last_update,
      capture_status: 'success',
      error_message: null,
      retry_count: 0,
      used_historical_api: false,
    });

    const totalVariations = Object.values(marketsVariations).reduce((sum, arr) => sum + (arr?.length || 0), 0);
    console.log(`[ClosingOdds] ✅ Captured ${Object.keys(markets).length} markets (${totalVariations} variation(s)) for ${eventApiId}`);

    return { success: true, creditsUsed };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[ClosingOdds] Error capturing closing odds for ${eventApiId}:`, error);

    // Check if it's a 404 (event not found - might be too old)
    const is404 = errorMsg.includes('404');

    // Insert error record
    await insertClosingOdds({
      event_id: eventDbId,
      markets: {},
      markets_variations: {},
      captured_at: new Date().toISOString(),
      bookmaker_update: null,
      capture_status: 'error',
      error_message: errorMsg,
      retry_count: 0,
      used_historical_api: false,
    });

    return {
      success: false,
      creditsUsed: 0,
      error: errorMsg,
    };
  }
}

/**
 * Retry failed closing odds captures (within 3 days)
 */
async function retryFailedClosingOdds(): Promise<{ retriesAttempted: number; retriesSucceeded: number; creditsUsed: number }> {
  console.log('[ClosingOdds] Checking for failed closing odds to retry...');

  // Get events with failed/missing closing odds within the last 3 days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data: failedClosing, error } = await (supabaseAdmin as any)
    .from('closing_odds')
    .select(`
      id,
      event_id,
      retry_count,
      events!inner(
        id,
        api_event_id,
        sport_key,
        commence_time,
        home_team,
        away_team
      )
    `)
    .in('capture_status', ['missing', 'error'])
    .lt('retry_count', 3)
    .gte('events.commence_time', threeDaysAgo.toISOString())
    .order('events.commence_time', { ascending: false });

  if (error || !failedClosing) {
    console.error('[ClosingOdds] Error fetching failed closing odds:', error);
    return { retriesAttempted: 0, retriesSucceeded: 0, creditsUsed: 0 };
  }

  console.log(`[ClosingOdds] Found ${failedClosing.length} failed captures to retry`);

  let retriesAttempted = 0;
  let retriesSucceeded = 0;
  let totalCredits = 0;

  for (const record of failedClosing) {
    const event = (record as any).events;
    if (!event) continue;

    retriesAttempted++;

    try {
      const result = await captureEventClosingOdds(
        event.api_event_id,
        event.id,
        event.sport_key,
        event.commence_time
      );

      totalCredits += result.creditsUsed;

      // Update retry count
      await (supabaseAdmin as any)
        .from('closing_odds')
        .update({ retry_count: (record.retry_count || 0) + 1 } as any)
        .eq('id', record.id);

      if (result.success) {
        retriesSucceeded++;
      }

      // Delay between retries
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[ClosingOdds] Retry failed for ${event.api_event_id}:`, error);
    }
  }

  console.log(`[ClosingOdds] Retry complete: ${retriesSucceeded}/${retriesAttempted} succeeded`);

  return { retriesAttempted, retriesSucceeded, creditsUsed: totalCredits };
}

/**
 * Main function: Sync scores and capture closing odds
 */
export async function syncScoresAndClosingOdds(): Promise<ClosingResult> {
  const startTime = Date.now();

  console.log('[ClosingOdds] Starting scores and closing odds sync...');

  const result: ClosingResult = {
    success: true,
    eventsProcessed: 0,
    closingCaptured: 0,
    closingFailed: 0,
    creditsUsed: 0,
    errors: [],
  };

  try {
    const client = getTheOddsApiClient();
    const trackedSports = await getSetting('tracked_sports') || [];

    if (trackedSports.length === 0) {
      console.log('[ClosingOdds] No tracked sports');
      return result;
    }

    // Sync scores for each sport (past 3 days)
    for (const sportKey of trackedSports) {
      try {
        console.log(`[ClosingOdds] Fetching scores for ${sportKey}...`);

        // Get scores from the last 3 days
        const response = await client.getScores(sportKey, {
          daysFrom: '3',
          dateFormat: 'iso',
        });

        const scores = response.data;
        const creditsUsed = response.headers.requestsLast;
        result.creditsUsed += creditsUsed;

        console.log(`[ClosingOdds] Found ${scores.length} recent events for ${sportKey}`);

        // Log scores API call
        await logApiUsage({
          job_name: 'sync_scores_closing',
          endpoint: `/sports/${sportKey}/scores`,
          sport_key: sportKey,
          request_params: { daysFrom: '3' },
          credits_used: creditsUsed,
          credits_remaining: response.headers.requestsRemaining,
          events_processed: scores.length,
          markets_captured: 0,
          success: true,
          error_message: null,
          duration_ms: null,
        });

        // Update events with scores
        for (const score of scores) {
          if (!score.completed) continue;

          // Update event in DB
          const { data: existingEvent } = await (supabaseAdmin as any)
            .from('events')
            .select('id')
            .eq('api_event_id', score.id)
            .single();

          if (existingEvent) {
            // Extract scores
            const homeScore = score.scores?.find(s => s.name === score.home_team)?.score;
            const awayScore = score.scores?.find(s => s.name === score.away_team)?.score;

            await (supabaseAdmin as any)
              .from('events')
              .update({
                status: 'completed',
                completed: true,
                home_score: homeScore ? parseInt(homeScore) : null,
                away_score: awayScore ? parseInt(awayScore) : null,
                last_api_update: score.last_update || new Date().toISOString(),
              } as any)
              .eq('id', existingEvent.id);
          }
        }

        // Small delay between sports
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[ClosingOdds] Error fetching scores for ${sportKey}:`, error);
        result.errors.push(`Scores ${sportKey}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Get completed events without closing odds
    let completedEvents = await getCompletedEventsWithoutClosing();
    console.log(`[ClosingOdds] Found ${completedEvents.length} completed events without closing odds`);

    // LIMIT: Process max 20 events per run to avoid timeout
    const MAX_EVENTS_PER_RUN = 20;
    if (completedEvents.length > MAX_EVENTS_PER_RUN) {
      console.log(`[ClosingOdds] Limiting to ${MAX_EVENTS_PER_RUN} events to avoid timeout`);
      completedEvents = completedEvents.slice(0, MAX_EVENTS_PER_RUN);
    }

    // Capture closing odds for each
    for (const event of completedEvents) {
      result.eventsProcessed++;

      const captureResult = await captureEventClosingOdds(
        event.api_event_id,
        event.id,
        event.sport_key,
        event.commence_time
      );

      result.creditsUsed += captureResult.creditsUsed;

      if (captureResult.success) {
        result.closingCaptured++;
      } else {
        result.closingFailed++;
      }

      // Log closing odds API call
      await logApiUsage({
        job_name: 'sync_scores_closing',
        endpoint: `/sports/${event.sport_key}/events/${event.api_event_id}/odds`,
        sport_key: event.sport_key,
        request_params: { event_id: event.api_event_id },
        credits_used: captureResult.creditsUsed,
        credits_remaining: null,
        events_processed: 1,
        markets_captured: captureResult.success ? 1 : 0,
        success: captureResult.success,
        error_message: captureResult.error || null,
        duration_ms: null,
      });

      // Delay between events
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Retry failed captures
    const retryResult = await retryFailedClosingOdds();
    result.creditsUsed += retryResult.creditsUsed;
    result.closingCaptured += retryResult.retriesSucceeded;

    const duration = Date.now() - startTime;
    console.log(`[ClosingOdds] Sync complete in ${duration}ms:`);
    console.log(`  - Events processed: ${result.eventsProcessed}`);
    console.log(`  - Closing captured: ${result.closingCaptured}`);
    console.log(`  - Closing failed: ${result.closingFailed}`);
    console.log(`  - Credits used: ${result.creditsUsed}`);
    console.log(`  - Errors: ${result.errors.length}`);

    return result;
  } catch (error) {
    console.error('[ClosingOdds] Fatal error:', error);
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : String(error));
    return result;
  }
}
