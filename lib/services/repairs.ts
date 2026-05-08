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
 * Réveille les matchs bloqués en 'not_offered' pour la semaine à venir
 * et réinitialise leurs tentatives pour permettre au scanner standard de réessayer.
 */
export async function fixOdds() {
  const startTime = Date.now();
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  console.log(`[fix-odds] Démarrage de la réinitialisation des matchs not_offered à ${now.toISOString()}`);

  // 1. Trouver les IDs des événements qui ont lieu dans les 7 prochains jours
  const { data: upcomingEvents, error: eventsError } = await (supabaseAdmin as any)
    .from('events')
    .select('id')
    .gte('commence_time', now.toISOString())
    .lte('commence_time', sevenDaysFromNow.toISOString());

  if (eventsError) throw eventsError;
  if (!upcomingEvents || upcomingEvents.length === 0) {
    console.log('[fix-odds] Aucun match à venir dans les 7 prochains jours.');
    return { eventsChecked: 0, resetCount: 0, durationMs: Date.now() - startTime };
  }

  const eventIds = upcomingEvents.map((e: any) => e.id);

  // 2. Identifier les marchés en 'not_offered' pour ces événements
  const { data: blockedMarkets, error: marketsError } = await (supabaseAdmin as any)
    .from('market_states')
    .select('id')
    .in('event_id', eventIds)
    .eq('status', 'not_offered');

  if (marketsError) throw marketsError;
  if (!blockedMarkets || blockedMarkets.length === 0) {
    console.log('[fix-odds] Aucun marché bloqué en "not_offered" trouvé.');
    return { eventsChecked: eventIds.length, resetCount: 0, durationMs: Date.now() - startTime };
  }

  const marketIdsToReset = blockedMarkets.map((m: any) => m.id);
  console.log(`[fix-odds] Tentative de réinitialisation de ${marketIdsToReset.length} marchés...`);

  // 3. Reset : repasser en 'pending' et remettre les attempts à 0
  const { error: updateError } = await (supabaseAdmin as any)
    .from('market_states')
    .update({
      status: 'pending',
      attempts: 0,
      last_attempt_at: null
    } as any)
    .in('id', marketIdsToReset);

  if (updateError) {
    console.error('[fix-odds] Erreur lors du reset des marchés :', updateError.message);
    throw updateError;
  }

  const duration = Date.now() - startTime;
  const resultLog = `[fix-odds] Reset terminé : ${marketIdsToReset.length} marchés réactivés sur ${eventIds.length} matchs vérifiés | ${duration}ms`;
  console.log(resultLog);

  return {
    eventsChecked: eventIds.length,
    resetCount: marketIdsToReset.length,
    durationMs: duration,
    log: resultLog
  };
}
