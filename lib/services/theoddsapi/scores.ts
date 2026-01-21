/**
 * Scores Service - The Odds API v4
 * Fetches match scores and updates event results
 */

import { getTheOddsApiClient } from '@/lib/api/theoddsapi';
import type { Score } from '@/lib/api/theoddsapi/client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSetting, logApiUsage } from '@/lib/db/helpers';

interface ScoresSyncResult {
  success: boolean;
  sportsProcessed: number;
  eventsUpdated: number;
  creditsUsed: number;
  errors: string[];
}

/**
 * Sync scores for all active sports
 * Fetches scores for events from the last 3 days
 */
export async function syncAllScores(): Promise<ScoresSyncResult> {
  const startTime = Date.now();

  console.log('[Scores] Starting scores sync...');

  const result: ScoresSyncResult = {
    success: true,
    sportsProcessed: 0,
    eventsUpdated: 0,
    creditsUsed: 0,
    errors: [],
  };

  try {
    // Get tracked sports from settings
    const trackedSports = (await getSetting('tracked_sports')) || [];

    if (!Array.isArray(trackedSports) || trackedSports.length === 0) {
      console.log('[Scores] No tracked sports found');
      return result;
    }

    console.log(`[Scores] Processing ${trackedSports.length} sports: ${trackedSports.join(', ')}`);

    const client = getTheOddsApiClient();

    // Process each sport
    for (const sportKey of trackedSports) {
      try {
        console.log(`[Scores] Fetching scores for ${sportKey}...`);

        // Fetch scores from last 3 days
        const response = await client.getScores(sportKey, {
          daysFrom: '3',
          dateFormat: 'iso',
        });

        const scores = response.data;
        const creditsUsed = response.headers.requestsLast;
        result.creditsUsed += creditsUsed;
        result.sportsProcessed++;

        console.log(`[Scores] Received ${scores.length} scores for ${sportKey} (${creditsUsed} credits)`);

        // Process each score
        for (const score of scores) {
          try {
            await updateEventScore(score);
            result.eventsUpdated++;
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            result.errors.push(`Failed to update event ${score.id}: ${errorMsg}`);
            console.error(`[Scores] Error updating event ${score.id}:`, error);
          }
        }

        // Log API usage
        await logApiUsage({
          job_name: 'sync_scores',
          endpoint: `/sports/${sportKey}/scores`,
          sport_key: sportKey,
          request_params: { daysFrom: 3 },
          credits_used: creditsUsed,
          credits_remaining: response.headers.requestsRemaining,
          events_processed: scores.length,
          markets_captured: 0,
          success: true,
          error_message: null,
          duration_ms: null,
        });

        // Small delay between sports to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`Sport ${sportKey}: ${errorMsg}`);
        result.success = false;

        console.error(`[Scores] Failed to fetch scores for ${sportKey}:`, error);

        // Log failed API call
        await logApiUsage({
          job_name: 'sync_scores',
          endpoint: `/sports/${sportKey}/scores`,
          sport_key: sportKey,
          request_params: { daysFrom: 3 },
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
    console.log(`[Scores] Sync complete in ${duration}ms:`);
    console.log(`  - Sports processed: ${result.sportsProcessed}`);
    console.log(`  - Events updated: ${result.eventsUpdated}`);
    console.log(`  - Credits used: ${result.creditsUsed}`);
    console.log(`  - Errors: ${result.errors.length}`);

    return result;
  } catch (error) {
    console.error('[Scores] Fatal error during sync:', error);
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : String(error));
    return result;
  }
}

/**
 * Update a single event with score data
 */
async function updateEventScore(score: Score): Promise<void> {
  // Extract scores from API response
  const homeScore = score.scores?.find(s => s.name === score.home_team);
  const awayScore = score.scores?.find(s => s.name === score.away_team);

  if (!homeScore || !awayScore) {
    console.log(`[Scores] No scores available for event ${score.id}`);
    return;
  }

  // Parse scores (API returns strings)
  const homeScoreValue = parseInt(homeScore.score, 10);
  const awayScoreValue = parseInt(awayScore.score, 10);

  if (isNaN(homeScoreValue) || isNaN(awayScoreValue)) {
    console.log(`[Scores] Invalid score values for event ${score.id}`);
    return;
  }

  // Find the event in our database
  const { data: event } = await (supabaseAdmin as any)
    .from('events')
    .select('id, completed')
    .eq('api_event_id', score.id)
    .single();

  if (!event) {
    console.log(`[Scores] Event ${score.id} not found in database`);
    return;
  }

  // Skip if already updated
  if (event.completed && event.home_score !== null && event.away_score !== null) {
    console.log(`[Scores] Event ${score.id} already has scores`);
    return;
  }

  // Update the event
  const { error } = await (supabaseAdmin as any)
    .from('events')
    .update({
      home_score: homeScoreValue,
      away_score: awayScoreValue,
      completed: score.completed,
      status: score.completed ? 'completed' : 'live',
      last_api_update: score.last_update,
      updated_at: new Date().toISOString(),
    })
    .eq('id', event.id);

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }

  console.log(`[Scores] ✅ Updated ${score.home_team} ${homeScoreValue}-${awayScoreValue} ${score.away_team} (${score.completed ? 'completed' : 'live'})`);
}

/**
 * Sync scores for a specific sport
 */
export async function syncScoresForSport(sportKey: string, daysFrom: number = 3): Promise<ScoresSyncResult> {
  const result: ScoresSyncResult = {
    success: true,
    sportsProcessed: 0,
    eventsUpdated: 0,
    creditsUsed: 0,
    errors: [],
  };

  try {
    const client = getTheOddsApiClient();

    console.log(`[Scores] Fetching scores for ${sportKey} (last ${daysFrom} days)...`);

    const response = await client.getScores(sportKey, {
      daysFrom: String(daysFrom),
      dateFormat: 'iso',
    });

    const scores = response.data;
    const creditsUsed = response.headers.requestsLast;
    result.creditsUsed = creditsUsed;
    result.sportsProcessed = 1;

    console.log(`[Scores] Received ${scores.length} scores for ${sportKey} (${creditsUsed} credits)`);

    // Process each score
    for (const score of scores) {
      try {
        await updateEventScore(score);
        result.eventsUpdated++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`Failed to update event ${score.id}: ${errorMsg}`);
        console.error(`[Scores] Error updating event ${score.id}:`, error);
      }
    }

    // Log API usage
    await logApiUsage({
      job_name: 'sync_scores',
      endpoint: `/sports/${sportKey}/scores`,
      sport_key: sportKey,
      request_params: { daysFrom },
      credits_used: creditsUsed,
      credits_remaining: response.headers.requestsRemaining,
      events_processed: scores.length,
      markets_captured: 0,
      success: true,
      error_message: null,
      duration_ms: null,
    });

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(errorMsg);
    result.success = false;

    console.error(`[Scores] Failed to sync scores for ${sportKey}:`, error);

    // Log failed API call
    await logApiUsage({
      job_name: 'sync_scores',
      endpoint: `/sports/${sportKey}/scores`,
      sport_key: sportKey,
      request_params: { daysFrom },
      credits_used: 0,
      credits_remaining: null,
      events_processed: 0,
      markets_captured: 0,
      success: false,
      error_message: errorMsg,
      duration_ms: null,
    });

    return result;
  }
}
