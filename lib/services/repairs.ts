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
 * SCRIPT 1: fix-scores
 * Finds matches stuck in 'upcoming' and updates them with scores
 */
export async function fixScores() {
  const startTime = Date.now();
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

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
 * Finds matches in the next 73h without odds and fetches them
 */
export async function fixOdds() {
  const startTime = Date.now();
  const now = new Date();
  const seventyThreeHoursFromNow = new Date(now.getTime() + 73 * 60 * 60 * 1000);

  console.log(`[fix-odds] Starting repair at ${now.toISOString()}`);

  // 1. Find matches without odds in the next 73h
  // We check events that have no entries in market_states
  const { data: matches, error: queryError } = await (supabaseAdmin as any)
    .from('events')
    .select(`
      *,
      market_states(id)
    `)
    .gte('commence_time', now.toISOString())
    .lte('commence_time', seventyThreeHoursFromNow.toISOString());

  if (queryError) throw queryError;

  const listA = (matches || []).filter((m: any) => !m.market_states || m.market_states.length === 0);

  if (listA.length === 0) {
    console.log('[fix-odds] No matches without odds found.');
    return { matchesFound: 0, inserted: 0, quotaRemaining: 0, durationMs: Date.now() - startTime, log: '[fix-odds] No matches without odds found.' };
  }

  console.log(`[fix-odds] Found ${listA.length} matches without odds`);

  // 2. Get odds from API
  const client = getTheOddsApiClient();
  const bookmaker = await getSetting('bookmaker') || 'pinnacle';
  const region = await getSetting('region') || 'eu';
  const trackedMarkets = await getSetting('tracked_markets') || ['h2h', 'spreads', 'totals'];
  
  const sportKeys = [...new Set(listA.map((m: any) => m.sport_key as string))];
  let insertedCount = 0;
  let totalCredits = 0;
  let lastQuota = 0;

  for (const sportKey of sportKeys as string[]) {
    try {
      // We fetch odds for the whole sport for the next 3 days to be efficient
      const response = await client.getOdds(sportKey, {
        regions: region,
        markets: trackedMarkets.map(m => mapToApiMarketKey(m)).join(','),
        bookmakers: bookmaker,
        commenceTimeFrom: now.toISOString(),
        commenceTimeTo: seventyThreeHoursFromNow.toISOString()
      });

      const listB = response.data;
      const creditsUsed = response.headers.requestsLast;
      totalCredits += creditsUsed;
      lastQuota = response.headers.requestsRemaining;

      await logApiUsage({
        job_name: 'fix-odds',
        endpoint: `/sports/${sportKey}/odds`,
        sport_key: sportKey,
        request_params: { markets: trackedMarkets.join(',') },
        credits_used: creditsUsed,
        credits_remaining: lastQuota,
        events_processed: listB.length,
        markets_captured: 0,
        success: true,
        error_message: null,
        duration_ms: null,
      });

      // 3. Matching and Insertion
      for (const matchA of listA.filter((m: any) => m.sport_key === sportKey)) {
        const matchB = listB.find(m => matchTeams(matchA.home_team, matchA.away_team, m.home_team, m.away_team));

        if (matchB && matchB.bookmakers) {
          const bookmakerData = matchB.bookmakers.find(b => b.key === bookmaker);
          if (bookmakerData && bookmakerData.markets) {
            for (const apiMarket of bookmakerData.markets) {
              const dbMarketKey = mapToDbMarketKey(apiMarket.key);
              if (!trackedMarkets.includes(dbMarketKey)) continue;

              const oddsVariations = extractOddsFromMarket(apiMarket, matchB.home_team, matchB.away_team);
              if (oddsVariations.length > 0) {
                await upsertMarketState({
                  event_id: matchA.id,
                  market_key: dbMarketKey,
                  status: 'captured',
                  opening_odds: oddsVariations[0],
                  opening_odds_variations: oddsVariations,
                  opening_captured_at: new Date().toISOString(),
                  opening_bookmaker_update: bookmakerData.last_update,
                  deadline: matchA.commence_time,
                  attempts: 1,
                  last_attempt_at: new Date().toISOString(),
                });
                insertedCount++;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`[fix-odds] Error for sport ${sportKey}:`, err);
    }
  }

  const duration = Date.now() - startTime;
  const resultLog = `[fix-odds] Sans cotes : ${listA.length} | Insérées : ${insertedCount} | Quota restant : ${lastQuota} | ${duration}ms`;
  console.log(resultLog);

  return {
    matchesFound: listA.length,
    inserted: insertedCount,
    quotaRemaining: lastQuota,
    durationMs: duration,
    log: resultLog
  };
}
