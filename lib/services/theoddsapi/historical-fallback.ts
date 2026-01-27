
import { getTheOddsApiClient } from '@/lib/api/theoddsapi/client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSetting, insertClosingOdds, logApiUsage } from '@/lib/db/helpers';
import { HISTORICAL_FALLBACK_MARKETS } from '@/lib/api/theoddsapi/constants';
import type { ClosingMarkets, ClosingMarketsVariations, MarketOdds } from '@/lib/db/types';
import type { Bookmaker, Market as ApiMarket } from '@/lib/api/theoddsapi/client';

/**
 * Historical Fallback Service
 * 
 * Handles fetching closing odds via the Historical API for events that:
 * 1. Missed the standard "live" closing odds capture.
 * 2. Are old enough (> 7 days) to be available in the Historical API.
 * 3. Need specific market coverage (e.g. BTTS, Draw No Bet) that requires targeted querying.
 */

const HISTORICAL_DELAY_DAYS = 7; // Minimum days before historical data is reliable/available

/**
 * Check and process missing closing odds using Historical API
 */
export async function processHistoricalFallbacks() {
  console.log('[HistoricalFallback] Checking for missing odds eligible for historical fallback...');

  const client = getTheOddsApiClient();
  const bookmaker = await getSetting('bookmaker') || 'pinnacle';
  const region = await getSetting('region') || 'eu';

  // Calculate the eligibility threshold (events older than 7 days)
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - HISTORICAL_DELAY_DAYS);
  
  // We also don't want to go back too far (e.g. > 30 days) to save resources
  const maxLookbackDate = new Date();
  maxLookbackDate.setDate(maxLookbackDate.getDate() - 30);

  // Find events:
  // 1. Completed
  // 2. Capture status is 'missing' OR 'error'
  // 3. Older than 7 days
  // 4. Haven't already used historical API successfully
  // 5. Haven't been retried too many times on historical
  
  const { data: eligibleEvents, error } = await supabaseAdmin
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
    .lt('retry_count', 5) // Give it a few tries
    .eq('used_historical_api', false)
    .lte('events.commence_time', thresholdDate.toISOString())
    .gte('events.commence_time', maxLookbackDate.toISOString())
    .limit(5); // Process in small batches

  if (error) {
    console.error('[HistoricalFallback] Error finding eligible events:', error);
    return;
  }

  if (!eligibleEvents || eligibleEvents.length === 0) {
    console.log('[HistoricalFallback] No eligible events found for historical fallback.');
    return;
  }

  console.log(`[HistoricalFallback] Found ${eligibleEvents.length} events to process.`);

  for (const record of eligibleEvents) {
    const event = (record as any).events;
    console.log(`[HistoricalFallback] Processing ${event.home_team} vs ${event.away_team} (${event.commence_time})...`);

    // Target timestamp: Just before kickoff (e.g., -5 mins)
    const commenceTime = new Date(event.commence_time);
    const targetTimestamp = new Date(commenceTime.getTime() - 5 * 60000).toISOString();

    try {
      const response = await client.getHistoricalOdds(event.sport_key, event.api_event_id, {
        date: targetTimestamp,
        regions: region,
        markets: HISTORICAL_FALLBACK_MARKETS.join(','), // Use the extended market list
        bookmakers: bookmaker,
        oddsFormat: 'decimal',
      });

      const creditsUsed = response.headers.requestsLast;
      const remaining = response.headers.requestsRemaining;
      
      console.log(`[HistoricalFallback] API Call success. Credits: ${creditsUsed}`);

      const bookmakerData = response.data.bookmakers?.find((b: Bookmaker) => b.key === bookmaker);

      if (!bookmakerData || !bookmakerData.markets || bookmakerData.markets.length === 0) {
        console.warn(`[HistoricalFallback] No odds found for ${event.api_event_id} at ${targetTimestamp}`);
        
        // Log usage but mark as failed retry
        await updateRetryCount(record.id, record.retry_count + 1);
        continue;
      }

      // Process and Save Data
      const { markets, marketsVariations } = processMarkets(bookmakerData.markets, event.home_team, event.away_team);

      // Update Closing Odds Record
      await supabaseAdmin
        .from('closing_odds')
        .update({
          markets,
          markets_variations: marketsVariations,
          captured_at: new Date().toISOString(),
          bookmaker_update: bookmakerData.last_update,
          capture_status: 'success',
          error_message: null,
          used_historical_api: true, // Mark as recovered via historical
        })
        .eq('id', record.id);

      console.log(`[HistoricalFallback] ✅ Successfully recovered odds for ${event.api_event_id}`);

      // Log API Usage
      await logApiUsage({
        job_name: 'historical_fallback',
        endpoint: `/historical/.../${event.api_event_id}/odds`,
        sport_key: event.sport_key,
        request_params: { date: targetTimestamp, markets: HISTORICAL_FALLBACK_MARKETS.join(',') },
        credits_used: creditsUsed,
        credits_remaining: remaining,
        events_processed: 1,
        markets_captured: Object.keys(markets).length,
        success: true,
        error_message: null,
        duration_ms: null,
      });

    } catch (error: any) {
      console.error(`[HistoricalFallback] Failed for ${event.api_event_id}: ${error.message}`);
      
      // Update retry count and error message
      await supabaseAdmin
        .from('closing_odds')
        .update({
          retry_count: record.retry_count + 1,
          error_message: `Historical: ${error.message}`
        })
        .eq('id', record.id);
    }
  }
}

/**
 * Helper to update retry count
 */
async function updateRetryCount(id: string, count: number) {
  await supabaseAdmin
    .from('closing_odds')
    .update({ retry_count: count })
    .eq('id', id);
}

/**
 * Process raw API markets into our DB format
 * (Reusing logic structure from closing-odds.ts)
 */
function processMarkets(apiMarkets: ApiMarket[], homeTeam: string, awayTeam: string) {
  const markets: ClosingMarkets = {};
  const marketsVariations: ClosingMarketsVariations = {};

  const marketsByKey = new Map<string, ApiMarket[]>();
  for (const m of apiMarkets) {
    if (!marketsByKey.has(m.key)) marketsByKey.set(m.key, []);
    marketsByKey.get(m.key)!.push(m);
  }

  for (const [key, list] of marketsByKey.entries()) {
    // Keep first one as "main"
    markets[key] = extractMarketOdds(list[0], homeTeam, awayTeam);
    // Store all variations
    marketsVariations[key] = list.map(m => extractMarketOdds(m, homeTeam, awayTeam));
  }

  return { markets, marketsVariations };
}

/**
 * Extract odds (simplified version of closing-odds.ts logic)
 */
function extractMarketOdds(market: ApiMarket, homeTeam: string, awayTeam: string): MarketOdds {
  const odds: MarketOdds = { last_update: market.last_update };
  const homeLower = homeTeam.toLowerCase();
  const awayLower = awayTeam.toLowerCase();

  for (const outcome of market.outcomes) {
    const name = outcome.name.toLowerCase();
    
    if (name === homeLower || name === '1' || name === 'home') {
      odds.home = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
    } else if (name === awayLower || name === '2' || name === 'away') {
      odds.away = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
    } else if (name === 'draw' || name === 'x' || name === 'tie') {
      odds.draw = outcome.price;
    } else if (name.startsWith('over') || name === 'o') {
      odds.over = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
    } else if (name.startsWith('under') || name === 'u') {
      odds.under = outcome.price;
      if (outcome.point !== undefined) odds.point = outcome.point;
    }
  }
  return odds;
}
