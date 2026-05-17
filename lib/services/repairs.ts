import { getTheOddsApiClient } from '@/lib/api/theoddsapi';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSetting, logApiUsage, upsertMarketState } from '@/lib/db/helpers';
import type { Event as ApiEvent, Score as ApiScore } from '@/lib/api/theoddsapi/client';
import { normalizeString, containsTeamName, extractOddsFromMarket, mergeVariationsByPoint, mapToDbMarketKey, mapToApiMarketKey } from './theoddsapi/utils';

// Helper to normalize and match teams
function matchTeams(homeA: string, awayA: string, homeB: string, awayB: string): boolean {
  const norm = (s: string) => s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  return (
    (norm(homeA) === norm(homeB) && norm(awayA) === norm(awayB)) ||
    (containsTeamName(homeB, homeA) && containsTeamName(awayB, awayA))
  );
}

/**
 * SCRIPT 0: fixDuplicates
 * Trouve les doublons de matchs (mêmes équipes à +/- 4 jours) et interroge l'API.
 * Supprime proprement le doublon si l'API renvoie 404 (Ghost).
 */
export async function fixDuplicates() {
  const startTime = Date.now();
  const now = new Date();
  
  console.log(`[fix-duplicates] Starting duplicate detection at ${now.toISOString()}`);
  
  // 1. Fetch all active events (upcoming or live)
  const { data: activeEvents, error } = await (supabaseAdmin as any)
    .from('events')
    .select('id, api_event_id, sport_key, commence_time, home_team, away_team, status')
    .in('status', ['upcoming', 'live']);

  if (error) {
    console.error('[fix-duplicates] Error fetching active events:', error);
    return { detected: 0, cleaned: 0, durationMs: Date.now() - startTime };
  }

  if (!activeEvents || activeEvents.length === 0) {
    console.log('[fix-duplicates] No active events found.');
    return { detected: 0, cleaned: 0, durationMs: Date.now() - startTime };
  }

  // 2. Group events by canonical team names key
  const duplicatesGrouped = new Map<string, any[]>();
  for (const event of activeEvents) {
    const key = `${event.home_team.toLowerCase().trim()}|${event.away_team.toLowerCase().trim()}`;
    if (!duplicatesGrouped.has(key)) {
      duplicatesGrouped.set(key, []);
    }
    duplicatesGrouped.get(key)!.push(event);
  }

  // Filter groups with multiple events within a 4-day window
  const actualDuplicates: any[][] = [];
  for (const [key, events] of duplicatesGrouped.entries()) {
    if (events.length > 1) {
      // Sort chronologically
      events.sort((a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());
      
      let currentGroup = [events[0]];
      for (let i = 1; i < events.length; i++) {
        const prev = events[i - 1];
        const curr = events[i];
        const diffMs = Math.abs(new Date(curr.commence_time).getTime() - new Date(prev.commence_time).getTime());
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (diffDays <= 4) {
          currentGroup.push(curr);
        } else {
          if (currentGroup.length > 1) {
            actualDuplicates.push(currentGroup);
          }
          currentGroup = [curr];
        }
      }
      if (currentGroup.length > 1) {
        actualDuplicates.push(currentGroup);
      }
    }
  }

  if (actualDuplicates.length === 0) {
    console.log('[fix-duplicates] No duplicate matches detected.');
    return { detected: 0, cleaned: 0, durationMs: Date.now() - startTime };
  }

  console.log(`[fix-duplicates] Detected ${actualDuplicates.length} potential duplicate match groups.`);

  const client = getTheOddsApiClient();
  const bookmaker = await getSetting('bookmaker') || 'pinnacle';
  const region = await getSetting('region') || 'eu';
  
  let cleanedCount = 0;
  let totalDetected = 0;

  for (const group of actualDuplicates) {
    totalDetected += group.length;
    console.log(`[fix-duplicates] Group: ${group[0].home_team} vs ${group[0].away_team} (${group.length} entries)`);
    
    let validEvents: any[] = [];
    let ghostEvents: any[] = [];

    for (const event of group) {
      console.log(`  - Verifying Event ID: ${event.id} | API ID: ${event.api_event_id} | Time: ${event.commence_time}`);
      
      try {
        // Minimal lookup to check if event exists on the API
        await client.getEventOdds(event.sport_key, event.api_event_id, {
          regions: region,
          bookmakers: bookmaker,
          markets: 'h2h',
        });
        
        console.log(`    -> API ID ${event.api_event_id} is VALID.`);
        validEvents.push(event);
      } catch (err: any) {
        const is404 = err.message?.includes('404') || 
                      err.message?.includes('EVENT_NOT_FOUND') ||
                      err.status === 404 || 
                      err.response?.status === 404;

        if (is404) {
          console.log(`    -> API ID ${event.api_event_id} is GHOST (404).`);
          ghostEvents.push(event);
        } else {
          console.error(`    -> Error checking ${event.api_event_id}:`, err.message || err);
          validEvents.push(event);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Clean up ghost duplicates
    for (const ghost of ghostEvents) {
      console.log(`  [fix-duplicates] 🧹 Cleaning up ghost event ${ghost.id} (${ghost.api_event_id})...`);
      
      await (supabaseAdmin as any)
        .from('market_states')
        .delete()
        .eq('event_id', ghost.id);

      await (supabaseAdmin as any)
        .from('events')
        .delete()
        .eq('id', ghost.id);

      cleanedCount++;
      console.log(`    -> Deleted ghost event from database.`);
    }

    if (validEvents.length > 1) {
      console.warn(`  [fix-duplicates] ⚠️ Multiple valid events found on API. Keeping all valid entries active.`);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`[fix-duplicates] Completed: Detected ${totalDetected} entries, cleaned ${cleanedCount} ghost duplicates | ${duration}ms`);
  
  return {
    detected: totalDetected,
    cleaned: cleanedCount,
    durationMs: duration
  };
}

/**
 * SCRIPT 1: fix-scores
 * Finds matches stuck in 'upcoming' and updates them with scores
 */
export async function fixScores() {
  const startTime = Date.now();
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Clean duplicates first to prevent ghost match issues
  try {
    await fixDuplicates();
  } catch (dupErr) {
    console.error('[fix-scores] Error running pre-repair duplicates fix:', dupErr);
  }

  console.log(`[fix-scores] Starting repair at ${now.toISOString()}`);

  // 1. Find blocked matches
  const { data: blockedMatches, error: queryError } = await (supabaseAdmin as any)
    .from('events')
    .select('*')
    .eq('status', 'upcoming')
    .gte('commence_time', twentyFourHoursAgo.toISOString())
    .lte('commence_time', now.toISOString());

  if (queryError) throw queryError;
  if (!blockedMatches || blockedMatches.length === 0) {
    console.log('[fix-scores] No blocked matches found.');
    return { matchesFound: 0, updated: 0, notFound: [], durationMs: Date.now() - startTime, log: '[fix-scores] No blocked matches found.' };
  }

  const listA: any[] = blockedMatches;
  console.log(`[fix-scores] Found ${listA.length} matches potentially blocked in 'upcoming'`);

  // 2. Get scores from API
  const client = getTheOddsApiClient();
  const sportKeys = [...new Set(listA.map((m: any) => m.sport_key as string))];
  let updatedCount = 0;
  const notFound: string[] = [];

  for (const sportKey of sportKeys as string[]) {
    try {
      const response = await client.getScores(sportKey, { daysFrom: '1' });
      const listB = response.data;
      const creditsUsed = response.headers.requestsLast;

      await logApiUsage({
        job_name: 'fix-scores',
        endpoint: `/sports/${sportKey}/scores`,
        sport_key: sportKey,
        request_params: { daysFrom: '1' },
        credits_used: creditsUsed,
        credits_remaining: response.headers.requestsRemaining,
        events_processed: listB.length,
        markets_captured: 0,
        success: true,
        error_message: null,
        duration_ms: null,
      });

      // 3 & 4. Matching and Update
      for (const matchA of listA.filter((m: any) => m.sport_key === sportKey)) {
        const matchB = listB.find(m => matchTeams(matchA.home_team, matchA.away_team, m.home_team, m.away_team));

        if (matchB && matchB.completed && matchB.scores) {
          const homeScore = matchB.scores.find(s => normalizeString(s.name) === normalizeString(matchB.home_team))?.score;
          const awayScore = matchB.scores.find(s => normalizeString(s.name) === normalizeString(matchB.away_team))?.score;

          if (homeScore !== undefined && awayScore !== undefined) {
            const { error: updateError } = await (supabaseAdmin as any)
              .from('events')
              .update({
                status: 'completed',
                completed: true,
                home_score: parseInt(homeScore),
                away_score: parseInt(awayScore),
                last_api_update: matchB.last_update || new Date().toISOString()
              } as any)
              .eq('id', matchA.id)
              .eq('status', 'upcoming'); // Safety: only update if still upcoming

            if (!updateError) {
              updatedCount++;
            }
          }
        } else {
          notFound.push(`${matchA.home_team} vs ${matchA.away_team}`);
        }
      }
    } catch (err) {
      console.error(`[fix-scores] Error for sport ${sportKey}:`, err);
    }
  }

  const duration = Date.now() - startTime;
  const resultLog = `[fix-scores] Matchs bloqués : ${listA.length} | Mis à jour : ${updatedCount} | Non trouvés : ${notFound.length > 0 ? notFound.join(', ') : 'Aucun'} | ${duration}ms`;
  console.log(resultLog);

  return {
    matchesFound: listA.length,
    updated: updatedCount,
    notFound,
    durationMs: duration,
    log: resultLog
  };
}

/**
 * SCRIPT 2: fix-odds
 * Réveille les matchs bloqués en 'not_offered' pour la semaine à venir
 * et réinitialise leurs tentatives pour permettre au scanner standard de réessayer.
 */
export async function fixOdds() {
  const startTime = Date.now();
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Clean duplicates first to prevent ghost match issues
  try {
    await fixDuplicates();
  } catch (dupErr) {
    console.error('[fix-odds] Error running pre-repair duplicates fix:', dupErr);
  }

  console.log(`[fix-odds] Starting proactive API search at ${now.toISOString()}`);

  // 1. Find upcoming events in next 7 days with their details
  const { data: upcomingEvents, error: eventsError } = await (supabaseAdmin as any)
    .from('events')
    .select('id, api_event_id, sport_key, commence_time, home_team, away_team')
    .gte('commence_time', now.toISOString())
    .lte('commence_time', sevenDaysFromNow.toISOString())
    .in('status', ['upcoming', 'live']);

  if (eventsError) throw eventsError;
  if (!upcomingEvents || upcomingEvents.length === 0) {
    console.log('[fix-odds] No upcoming matches in the next 7 days.');
    return { eventsChecked: 0, resetCount: 0, rescuedCount: 0, pendingCapturedCount: 0, durationMs: Date.now() - startTime, log: '[fix-odds] No upcoming matches.' };
  }

  const eventIds = upcomingEvents.map((e: any) => e.id);
  const eventsMap = new Map<string, any>();
  upcomingEvents.forEach((e: any) => eventsMap.set(e.id, e));

  // --- PHASE 1: PROCESS "NOT_OFFERED" MARKETS ---
  const chunkSize = 150;
  let blockedMarkets: any[] = [];
  
  for (let i = 0; i < eventIds.length; i += chunkSize) {
    const chunk = eventIds.slice(i, i + chunkSize);
    const { data: marketsChunk, error: marketsError } = await (supabaseAdmin as any)
      .from('market_states')
      .select('*')
      .in('event_id', chunk)
      .eq('status', 'not_offered');
      
    if (marketsError) throw marketsError;
    if (marketsChunk) blockedMarkets.push(...marketsChunk);
  }

  // --- PHASE 2: PROCESS "PENDING" MARKETS (MISSING ODDS) ---
  let pendingMarketsList: any[] = [];
  for (let i = 0; i < eventIds.length; i += chunkSize) {
    const chunk = eventIds.slice(i, i + chunkSize);
    const { data: marketsChunk, error: marketsError } = await (supabaseAdmin as any)
      .from('market_states')
      .select('*')
      .in('event_id', chunk)
      .eq('status', 'pending');
      
    if (marketsError) throw marketsError;
    if (marketsChunk) pendingMarketsList.push(...marketsChunk);
  }

  console.log(`[fix-odds] Phase 1: Found ${blockedMarkets.length} "not_offered" markets.`);
  console.log(`[fix-odds] Phase 2: Found ${pendingMarketsList.length} "pending" markets.`);

  if (blockedMarkets.length === 0 && pendingMarketsList.length === 0) {
    console.log('[fix-odds] No markets to scan.');
    return { eventsChecked: eventIds.length, resetCount: 0, rescuedCount: 0, pendingCapturedCount: 0, durationMs: Date.now() - startTime, log: '[fix-odds] No markets to scan.' };
  }

  const client = getTheOddsApiClient();
  const bookmaker = await getSetting('bookmaker') || 'pinnacle';
  const region = await getSetting('region') || 'eu';

  let rescuedCount = 0;
  let pendingCapturedCount = 0;
  let checkedCount = 0;
  let totalCreditsUsed = 0;

  // Helper to process a set of markets for an event
  async function processEventMarkets(eventDbId: string, marketsToCheck: any[], label: 'not_offered' | 'pending') {
    const event = eventsMap.get(eventDbId);
    if (!event) return;

    checkedCount++;
    const eventApiId = event.api_event_id;
    const sportKey = event.sport_key;

    // Map DB market keys to API market keys
    const apiMarketKeys = marketsToCheck.map(m => mapToApiMarketKey(m.market_key));
    const uniqueApiMarketKeys = [...new Set(apiMarketKeys)];

    console.log(`[fix-odds] [${label}] Checking event ${eventApiId} (${event.home_team} vs ${event.away_team}) for markets: ${uniqueApiMarketKeys.join(', ')}`);

    try {
      const response = await client.getEventOdds(sportKey, eventApiId, {
        regions: region,
        markets: uniqueApiMarketKeys.join(','),
        bookmakers: bookmaker,
        oddsFormat: 'decimal',
      });

      const eventOddsData = response.data;
      const creditsUsed = response.headers.requestsLast || 0;
      totalCreditsUsed += creditsUsed;

      const bookmakerData = eventOddsData.bookmakers?.find((b: any) => b.key === bookmaker);

      if (!bookmakerData) {
        console.log(`[fix-odds] No data from ${bookmaker} for event ${eventApiId}. Keeping status.`);
        
        // Just update attempts and last_attempt_at
        for (const marketState of marketsToCheck) {
          await (supabaseAdmin as any)
            .from('market_states')
            .update({
              attempts: marketState.attempts + 1,
              last_attempt_at: new Date().toISOString(),
            } as any)
            .eq('id', marketState.id);
        }
        return;
      }

      // Group API markets by mapped DB keys
      const apiMarketsByDbKey = new Map<string, any[]>();
      for (const apiMarket of bookmakerData.markets) {
        const dbMarketKey = mapToDbMarketKey(apiMarket.key);
        if (!apiMarketsByDbKey.has(dbMarketKey)) {
          apiMarketsByDbKey.set(dbMarketKey, []);
        }
        apiMarketsByDbKey.get(dbMarketKey)!.push(apiMarket);
      }

      // Process each market
      for (const marketState of marketsToCheck) {
        const dbMarketKey = marketState.market_key;
        const apiMarkets = apiMarketsByDbKey.get(dbMarketKey);

        if (apiMarkets && apiMarkets.length > 0) {
          let oddsVariations = [];
          for (const apiMarket of apiMarkets) {
            const odds = extractOddsFromMarket(apiMarket, event.home_team, event.away_team);
            oddsVariations.push(...odds);
          }

          if (dbMarketKey.includes('spread')) {
            oddsVariations = mergeVariationsByPoint(oddsVariations);
          }

          if (oddsVariations.length > 0) {
            // Market is available! Save opening odds and set status to captured
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

            if (res) {
              if (label === 'not_offered') {
                rescuedCount++;
              } else {
                pendingCapturedCount++;
              }
              console.log(`[fix-odds] 🎉 SUCCESS! Captured "${dbMarketKey}" for ${eventApiId}`);
            } else {
              console.error(`[fix-odds] ❌ Failed to save "${dbMarketKey}" state for ${eventApiId}`);
            }
          } else {
            // Market returned but empty odds
            await (supabaseAdmin as any)
              .from('market_states')
              .update({
                attempts: marketState.attempts + 1,
                last_attempt_at: new Date().toISOString(),
              } as any)
              .eq('id', marketState.id);
          }
        } else {
          // Market still not offered
          const isPastDeadline = marketState.deadline && new Date(marketState.deadline) < new Date();
          
          await (supabaseAdmin as any)
            .from('market_states')
            .update({
              status: isPastDeadline ? 'not_offered' : marketState.status,
              attempts: marketState.attempts + 1,
              last_attempt_at: new Date().toISOString(),
            } as any)
            .eq('id', marketState.id);
            
          console.log(`[fix-odds] Market "${dbMarketKey}" still not returned by API for ${eventApiId}. status: ${isPastDeadline ? 'not_offered' : marketState.status}`);
        }
      }

      // Log successful API usage
      await logApiUsage({
        job_name: `fix-odds-${label}`,
        endpoint: `/sports/${sportKey}/events/${eventApiId}/odds`,
        sport_key: sportKey,
        request_params: {
          event_id: eventApiId,
          markets: marketsToCheck.map(m => m.market_key),
        },
        credits_used: creditsUsed,
        credits_remaining: null,
        events_processed: 1,
        markets_captured: label === 'not_offered' ? rescuedCount : pendingCapturedCount,
        success: true,
        error_message: null,
        duration_ms: null,
      });

      // Small delay between calls
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      const is404 = error.message?.includes('404') || 
                    error.message?.includes('EVENT_NOT_FOUND') ||
                    error.status === 404 || 
                    error.response?.status === 404;

      if (is404) {
        console.warn(`[fix-odds] ⚠️ Event ${eventApiId} (${event.home_team} vs ${event.away_team}) not found on API (404 / EVENT_NOT_FOUND). Marking event as completed and its markets as "not_offered".`);
        
        // 1. Mark event as completed to remove it from future search queries
        await (supabaseAdmin as any)
          .from('events')
          .update({ status: 'completed', completed: true } as any)
          .eq('id', eventDbId);

        // 2. Mark all markets of this event as not_offered
        await (supabaseAdmin as any)
          .from('market_states')
          .update({
            status: 'not_offered',
            last_attempt_at: new Date().toISOString(),
          } as any)
          .eq('event_id', eventDbId);
      } else {
        console.error(`[fix-odds] ❌ Error checking odds for event ${eventApiId}:`, error);
        
        // Increment attempts even on general error
        for (const marketState of marketsToCheck) {
          await (supabaseAdmin as any)
            .from('market_states')
            .update({
              attempts: marketState.attempts + 1,
              last_attempt_at: new Date().toISOString(),
            } as any)
            .eq('id', marketState.id);
        }
      }
    }
  }

  // --- EXECUTE PHASE 1 ---
  if (blockedMarkets.length > 0) {
    const marketsByEvent = new Map<string, any[]>();
    blockedMarkets.forEach((m: any) => {
      if (!marketsByEvent.has(m.event_id)) {
        marketsByEvent.set(m.event_id, []);
      }
      marketsByEvent.get(m.event_id)!.push(m);
    });

    console.log(`[fix-odds] Starting Phase 1: Checking ${marketsByEvent.size} events with "not_offered" markets...`);
    for (const [eventDbId, markets] of marketsByEvent.entries()) {
      await processEventMarkets(eventDbId, markets, 'not_offered');
    }
  }

  // --- EXECUTE PHASE 2 ---
  if (pendingMarketsList.length > 0) {
    const marketsByEvent = new Map<string, any[]>();
    pendingMarketsList.forEach((m: any) => {
      if (!marketsByEvent.has(m.event_id)) {
        marketsByEvent.set(m.event_id, []);
      }
      marketsByEvent.get(m.event_id)!.push(m);
    });

    console.log(`[fix-odds] Starting Phase 2: Checking ${marketsByEvent.size} events with "pending" markets...`);
    for (const [eventDbId, markets] of marketsByEvent.entries()) {
      await processEventMarkets(eventDbId, markets, 'pending');
    }
  }

  const duration = Date.now() - startTime;
  const resultLog = `[fix-odds] Proactive search finished: Checked ${checkedCount} events, rescued ${rescuedCount} not_offered markets, captured ${pendingCapturedCount} pending markets, used ${totalCreditsUsed} API credits | ${duration}ms`;
  console.log(resultLog);

  return {
    eventsChecked: checkedCount,
    resetCount: rescuedCount + pendingCapturedCount, // Returned as resetCount for compatibility
    rescuedCount,
    pendingCapturedCount,
    creditsUsed: totalCreditsUsed,
    durationMs: duration,
    log: resultLog
  };
}
