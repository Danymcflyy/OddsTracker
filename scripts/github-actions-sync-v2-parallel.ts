/**
 * Script de synchronisation V2 - Parallélisation par ligue
 * Exécute directement dans GitHub Actions (pas via Vercel)
 *
 * Architecture:
 * - Récupère toutes les ligues trackées
 * - Lance un sync par ligue EN PARALLÈLE
 * - Utilise Promise.allSettled pour résilience aux erreurs
 *
 * Avantages:
 * - 10x plus rapide (parallélisation)
 * - 2x plus fréquent (5 min vs 10 min)
 * - Plus résilient (une ligue qui échoue n'affecte pas les autres)
 */

import './load-env';
import { supabaseAdmin } from '@/lib/db';
import { discoverMatchesForLeague, type LeagueMatchDiscoveryResult } from '@/lib/api/v3/match-discovery-per-league';
import { captureOddsForLeague, type LeagueOddsCaptureResult } from '@/lib/api/v3/odds-capture-per-league';

interface TrackedLeague {
  id: string;
  oddsapi_key: string;
  name: string;
}

interface LeagueSyncResult {
  league_id: string;
  league_name: string;
  discovery: LeagueMatchDiscoveryResult;
  odds: LeagueOddsCaptureResult;
  total_duration_ms: number;
  overall_success: boolean;
}

async function main() {
  const startTime = Date.now();

  console.log('🚀 ===== V2 PARALLEL SYNC START =====');
  console.log(`⏰ ${new Date().toISOString()}\n`);

  try {
    // 1. Fetch sport
    const { data: sport, error: sportError } = await supabaseAdmin
      .from('sports')
      .select('id, oddsapi_key')
      .eq('slug', 'football')
      .single();

    if (sportError || !sport) {
      console.error('❌ Sport football not found');
      process.exit(1);
    }

    // 2. Fetch all tracked leagues
    const { data: trackedLeagues, error: leaguesError } = await supabaseAdmin
      .from('leagues')
      .select('id, oddsapi_key, name')
      .eq('sport_id', sport.id)
      .eq('tracked', true)
      .eq('active', true);

    if (leaguesError) {
      console.error('❌ Erreur récupération ligues:', leaguesError.message);
      process.exit(1);
    }

    if (!trackedLeagues || trackedLeagues.length === 0) {
      console.log('⚠️  No tracked leagues found');
      process.exit(0);
    }

    console.log(`📋 Found ${trackedLeagues.length} tracked leagues\n`);

    // 3. Create parallel sync jobs
    const syncJobs = trackedLeagues.map(league =>
      syncLeague(sport.id, sport.oddsapi_key, league)
    );

    // 4. Run all jobs in parallel with allSettled
    console.log('🔄 Starting parallel sync for all leagues...\n');
    const results = await Promise.allSettled(syncJobs);

    // 5. Analyze results
    const succeeded: LeagueSyncResult[] = [];
    const failed: { league: TrackedLeague; error: string }[] = [];

    results.forEach((result, index) => {
      const league = trackedLeagues[index];

      if (result.status === 'fulfilled') {
        succeeded.push(result.value);
      } else {
        failed.push({
          league,
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    // 6. Print summary
    printSummary(succeeded, failed, startTime);

    // 7. Exit with appropriate code
    // Exit 0 if at least 1 league succeeded, 1 if all failed
    if (succeeded.length === 0) {
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('❌ ERREUR CRITIQUE SYNC:', errorMessage);
    console.error(error);

    console.log('\n' + '='.repeat(60));
    console.log(`❌ SYNC ÉCHOUÉ (${duration}ms)`);
    console.log('='.repeat(60) + '\n');

    process.exit(1);
  }
}

/**
 * Synchronise une ligue spécifique (discovery + odds capture)
 */
async function syncLeague(
  sportId: string,
  sportOddsapiKey: string,
  league: TrackedLeague
): Promise<LeagueSyncResult> {
  const leagueStartTime = Date.now();

  console.log(`🔄 [${league.name}] Starting sync...`);

  // Step 1: Discover matches
  const discovery = await discoverMatchesForLeague(
    sportId,
    sportOddsapiKey,
    league.id,
    league.oddsapi_key,
    league.name
  );

  console.log(`  ✅ [${league.name}] Discovery: ${discovery.discovered} new, ${discovery.updated} updated (${(discovery.duration_ms / 1000).toFixed(1)}s)`);

  if (discovery.errors.length > 0) {
    console.warn(`  ⚠️  [${league.name}] ${discovery.errors.length} discovery errors`);
  }

  // Step 2: Capture odds
  const odds = await captureOddsForLeague(
    league.id,
    league.name,
    null // No limit
  );

  console.log(`  ✅ [${league.name}] Odds: ${odds.matches_updated} matches, ${odds.odds_captured} odds (${(odds.duration_ms / 1000).toFixed(1)}s)`);

  if (odds.errors.length > 0) {
    console.warn(`  ⚠️  [${league.name}] ${odds.errors.length} odds errors`);
  }

  const totalDuration = Date.now() - leagueStartTime;
  const overallSuccess = discovery.success && odds.success;

  console.log(`  🏁 [${league.name}] Total: ${(totalDuration / 1000).toFixed(1)}s\n`);

  return {
    league_id: league.id,
    league_name: league.name,
    discovery,
    odds,
    total_duration_ms: totalDuration,
    overall_success: overallSuccess
  };
}

/**
 * Affiche un résumé détaillé des résultats
 */
function printSummary(
  succeeded: LeagueSyncResult[],
  failed: any[],
  startTime: number
) {
  const duration = Date.now() - startTime;

  console.log('='.repeat(60));
  console.log(`✅ V2 PARALLEL SYNC COMPLETED (${(duration / 1000).toFixed(1)}s)`);
  console.log('='.repeat(60));
  console.log(`Total Leagues: ${succeeded.length + failed.length}`);
  console.log(`  ✅ Succeeded: ${succeeded.length}`);
  console.log(`  ❌ Failed: ${failed.length}`);

  if (succeeded.length > 0) {
    const totalNewMatches = succeeded.reduce((sum, r) => sum + r.discovery.discovered, 0);
    const totalUpdatedMatches = succeeded.reduce((sum, r) => sum + r.discovery.updated, 0);
    const totalOdds = succeeded.reduce((sum, r) => sum + r.odds.odds_captured, 0);

    console.log(`\nAggregated Stats:`);
    console.log(`  - New Matches: ${totalNewMatches}`);
    console.log(`  - Updated Matches: ${totalUpdatedMatches}`);
    console.log(`  - Odds Captured: ${totalOdds}`);

    // Top 3 fastest leagues
    const sortedByDuration = [...succeeded].sort((a, b) => a.total_duration_ms - b.total_duration_ms);
    console.log(`\nFastest Leagues:`);
    sortedByDuration.slice(0, 3).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.league_name}: ${(r.total_duration_ms / 1000).toFixed(1)}s`);
    });

    // Top 3 most productive leagues (by odds captured)
    const sortedByOdds = [...succeeded].sort((a, b) => b.odds.odds_captured - a.odds.odds_captured);
    console.log(`\nMost Productive Leagues:`);
    sortedByOdds.slice(0, 3).forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.league_name}: ${r.odds.odds_captured} odds`);
    });
  }

  if (failed.length > 0) {
    console.log(`\nFailed Leagues:`);
    failed.forEach(f => {
      console.log(`  ❌ ${f.league.name}: ${f.error}`);
    });
  }

  console.log('='.repeat(60) + '\n');
}

main();
