/**
 * Discovery Service - The Odds API v4
 * Discovers sports, leagues, and events (all FREE endpoints)
 */

import { getTheOddsApiClient } from '@/lib/api/theoddsapi';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  upsertSport,
  upsertEvent,
  createMarketStatesForEvent,
  getSetting,
  logApiUsage,
} from '@/lib/db/helpers';
import type { Sport, Event as ApiEvent } from '@/lib/api/theoddsapi/client';
import type { InsertSport, InsertEvent } from '@/lib/db/types';

/**
 * Sync all available sports from The Odds API
 * Cost: 0 credits (FREE)
 */
export async function syncSports(): Promise<{ success: boolean; sportsCount: number }> {
  const startTime = Date.now();
  const client = getTheOddsApiClient();

  try {
    console.log('[Discovery] Syncing sports...');

    const response = await client.getSports();
    const sports = response.data;

    console.log(`[Discovery] Found ${sports.length} sports`);

    // Filter for soccer sports only
    const soccerSports = sports.filter((sport: Sport) =>
      sport.group === 'Soccer' || sport.key.startsWith('soccer_')
    );

    console.log(`[Discovery] Found ${soccerSports.length} soccer sports`);

    // Upsert each sport
    let successCount = 0;
    for (const sport of soccerSports) {
      const inserted: InsertSport = {
        api_key: sport.key,
        title: sport.title,
        description: sport.description || null,
        sport_group: sport.group || 'Soccer',
        active: sport.active,
        has_outrights: sport.has_outrights,
      };

      const result = await upsertSport(inserted);
      if (result) successCount++;
    }

    // Log API usage (0 credits)
    await logApiUsage({
      job_name: 'sync_sports',
      endpoint: '/sports',
      sport_key: null,
      request_params: {},
      credits_used: 0,
      credits_remaining: response.headers.requestsRemaining,
      events_processed: 0,
      markets_captured: 0,
      success: true,
      error_message: null,
      duration_ms: Date.now() - startTime,
    });

    console.log(`[Discovery] Synced ${successCount}/${soccerSports.length} sports`);

    return {
      success: true,
      sportsCount: successCount,
    };
  } catch (error) {
    console.error('[Discovery] Failed to sync sports:', error);

    await logApiUsage({
      job_name: 'sync_sports',
      endpoint: '/sports',
      sport_key: null,
      request_params: {},
      credits_used: 0,
      credits_remaining: null,
      events_processed: 0,
      markets_captured: 0,
      success: false,
      error_message: error instanceof Error ? error.message : String(error),
      duration_ms: Date.now() - startTime,
    });

    return {
      success: false,
      sportsCount: 0,
    };
  }
}

/**
 * Sync events for a specific sport
 * Cost: 0 credits (FREE)
 */
export async function syncEventsForSport(
  sportKey: string,
  options?: {
    commenceTimeFrom?: string;
    commenceTimeTo?: string;
  }
): Promise<{ success: boolean; eventsCount: number; newEventsCount: number }> {
  const startTime = Date.now();
  const client = getTheOddsApiClient();

  try {
    console.log(`[Discovery] Syncing events for ${sportKey}...`);

    const response = await client.getEvents(sportKey, options);
    const events = response.data;

    console.log(`[Discovery] Found ${events.length} events for ${sportKey}`);

    // Get tracked markets from settings
    const trackedMarkets = await getSetting('tracked_markets') || [];

    // Upsert each event
    let successCount = 0;
    let newCount = 0;

    for (const event of events) {
      const eventData: InsertEvent = {
        api_event_id: event.id,
        sport_id: null, // Will be linked later if needed
        sport_key: event.sport_key,
        sport_title: event.sport_title || null,
        commence_time: event.commence_time,
        home_team: event.home_team,
        away_team: event.away_team,
        status: 'upcoming',
        home_score: null,
        away_score: null,
        completed: false,
        last_api_update: new Date().toISOString(),
      };

      const existing = await upsertEvent(eventData);
      if (existing) {
        successCount++;

        // Check if event already has market_states (to avoid recreating them)
        const { data: existingStates } = await (supabaseAdmin as any)
          .from('market_states')
          .select('id')
          .eq('event_id', existing.id)
          .limit(1);

        if (!existingStates || existingStates.length === 0) {
          // No market_states yet -> create them
          newCount++;
          await createMarketStatesForEvent(
            existing.id,
            trackedMarkets,
            event.commence_time
          );
          console.log(`[Discovery] Created market states for new event: ${event.home_team} vs ${event.away_team}`);
        }
      }
    }

    // Log API usage (0 credits)
    await logApiUsage({
      job_name: 'sync_events',
      endpoint: `/sports/${sportKey}/events`,
      sport_key: sportKey,
      request_params: options || {},
      credits_used: 0,
      credits_remaining: response.headers.requestsRemaining,
      events_processed: events.length,
      markets_captured: 0,
      success: true,
      error_message: null,
      duration_ms: Date.now() - startTime,
    });

    console.log(`[Discovery] Synced ${successCount} events (${newCount} new) for ${sportKey}`);

    return {
      success: true,
      eventsCount: successCount,
      newEventsCount: newCount,
    };
  } catch (error) {
    console.error(`[Discovery] Failed to sync events for ${sportKey}:`, error);

    await logApiUsage({
      job_name: 'sync_events',
      endpoint: `/sports/${sportKey}/events`,
      sport_key: sportKey,
      request_params: options || {},
      credits_used: 0,
      credits_remaining: null,
      events_processed: 0,
      markets_captured: 0,
      success: false,
      error_message: error instanceof Error ? error.message : String(error),
      duration_ms: Date.now() - startTime,
    });

    return {
      success: false,
      eventsCount: 0,
      newEventsCount: 0,
    };
  }
}

/**
 * Sync events for all tracked sports
 * Cost: 0 credits (FREE)
 */
export async function syncAllTrackedEvents(): Promise<{
  success: boolean;
  results: Array<{ sportKey: string; eventsCount: number; newEventsCount: number }>;
}> {
  const trackedSports = await getSetting('tracked_sports') || [];

  if (trackedSports.length === 0) {
    console.log('[Discovery] No sports tracked, skipping event sync');
    return { success: true, results: [] };
  }

  console.log(`[Discovery] Syncing events for ${trackedSports.length} tracked sports...`);

  const results = [];

  for (const sportKey of trackedSports) {
    const result = await syncEventsForSport(sportKey);
    results.push({
      sportKey,
      eventsCount: result.eventsCount,
      newEventsCount: result.newEventsCount,
    });

    // Small delay between sports to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const totalEvents = results.reduce((sum, r) => sum + r.eventsCount, 0);
  const totalNew = results.reduce((sum, r) => sum + r.newEventsCount, 0);

  console.log(`[Discovery] Synced ${totalEvents} total events (${totalNew} new) across ${trackedSports.length} sports`);

  return {
    success: true,
    results,
  };
}
