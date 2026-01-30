#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { getTheOddsApiClient } from '../lib/api/theoddsapi/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface CacheEntry {
  timestamp: Date;
  data: any[];
  creditsUsed: number;
}

const apiCache = new Map<string, CacheEntry>();

async function run() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const client = getTheOddsApiClient();
  const now = new Date();

  console.log('═══════════════════════════════════════════════════════');
  console.log(`🕐 CAPTURE CLOSING ODDS - ${now.toLocaleString('fr-FR')}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. RÉCUPÉRER LES ÉVÉNEMENTS DANS LA FENÊTRE DE CAPTURE (Strictement avant le match)
  // On cherche les matchs qui vont commencer dans 5 à 20 minutes (pour capturer à M-15, M-10, M-5)
  // On ne capture PLUS rien après M-5 pour éviter le risque de Live Odds
  
  const windowStart = new Date(now.getTime() + 4 * 60 * 1000).toISOString(); // Dans 4 min (M-4) -> Trop tard
  const windowEnd = new Date(now.getTime() + 20 * 60 * 1000).toISOString(); // Dans 20 min (M-20)

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'upcoming')
    .gte('commence_time', windowStart) // On veut commence_time >= now + 4min (donc pas encore commencé)
    .lte('commence_time', windowEnd)   // On veut commence_time <= now + 20min
    .order('commence_time', { ascending: true });

  if (error) {
    console.error('❌ Erreur DB:', error.message);
    process.exit(1);
  }

  if (!events || events.length === 0) {
    console.log('ℹ️ Aucun événement dans la fenêtre de capture (M-20 à M-5)');
    return;
  }

  console.log(`📊 ${events.length} événement(s) dans la fenêtre M-20 à M-5\n`);
  
  // ... (suite du code)

  // 3. TRAITER CHAQUE ÉVÉNEMENT
  for (const dbEvent of events) {
    const minutesBeforeKickoff = calculateMinutesBeforeKickoff(dbEvent.commence_time, now);

    console.log(`🏆 ${dbEvent.home_team} vs ${dbEvent.away_team} (${dbEvent.sport_key})`);
    console.log(`   Kick-off: ${new Date(dbEvent.commence_time).toLocaleTimeString('fr-FR')}`);
    console.log(`   Position: M${minutesBeforeKickoff > 0 ? '+' : ''}${minutesBeforeKickoff}`);

    // Sécurité supplémentaire : Si on est trop proche du coup d'envoi (< 5 min), on ne touche pas
    // minutesBeforeKickoff est positif si on est AVANT le match (ex: 10 pour M-10)
    // On veut capturer à 15, 10, 5.
    
    if (minutesBeforeKickoff < 5) {
        console.log(`   🛑 Trop proche du match (ou match commencé). Arrêt capture pour éviter Live Odds.\n`);
        totalSkipped++;
        continue;
    }
    
    // ... (suite du code)


    // Vérifier si déjà capturé à ce moment (déduplication)
    const { data: existing } = await supabase
      .from('closing_odds_snapshots')
      .select('id')
      .eq('event_id', dbEvent.id)
      .eq('minutes_before_kickoff', minutesBeforeKickoff)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`   ✓ Déjà capturé à ce moment\n`);
      totalSkipped++;
      continue;
    }

    try {
      console.log(`   🌐 Appel API (Single Event)...`);
      // Requête par événement pour supporter tous les marchés
      const response = await client.getEventOdds(dbEvent.sport_key, dbEvent.api_event_id, {
        regions: 'eu',
        markets: marketsToCapture,
        oddsFormat: 'decimal',
        dateFormat: 'iso',
      });

      const apiEvent = response.data;
      const creditsUsed = response.headers.requestsLast || 0; // Estimation
      totalCredits += creditsUsed;

      if (!apiEvent || !apiEvent.bookmakers || apiEvent.bookmakers.length === 0) {
        console.log(`   ⚠️ Pas de bookmakers retournés`);
        // Finalisation si post-match...
        continue;
      }

      await captureSnapshot(supabase, dbEvent, apiEvent, minutesBeforeKickoff);
      console.log(`   ✅ Snapshot capturé (Coût: ~${creditsUsed})\n`);
      totalCaptured++;

    } catch (error: any) {
      console.log(`   ❌ Erreur API: ${error.message}\n`);
      // Si 422 ici, c'est que le marché est vraiment invalide même pour cet event
    }
  }

  // 4. FINALISER LES ÉVÉNEMENTS PASSÉS (inchangé)
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('FINALISATION');
  console.log('═══════════════════════════════════════════════════════\n');

  const finalized = await finalizeOldEvents(supabase, now);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('RÉSUMÉ');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Snapshots capturés: ${totalCaptured}`);
  console.log(`⏭️ Événements skippés: ${totalSkipped}`);
  console.log(`📊 Événements finalisés: ${finalized}`);
  console.log(`💰 Crédits API utilisés: ${totalCredits}`);
  console.log(`📈 Total requêtes: ${client.getRequestCount()}`);
  console.log('═══════════════════════════════════════════════════════');

  // Nettoyer le cache
  cleanCache();
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateMinutesBeforeKickoff(commenceTime: string, now: Date): number {
  const kickoff = new Date(commenceTime);
  const diffMs = kickoff.getTime() - now.getTime();
  return Math.floor(diffMs / (60 * 1000));
}

// REMOVED: Unused getMarketsForCapture function that had stale SAFE_MARKETS list

async function getOddsWithCache(
  client: any,
  sportKey: string,
  markets: string
): Promise<any[]> {
  const cacheKey = `${sportKey}-${markets}`;
  const cached = apiCache.get(cacheKey);

  // Cache hit (< 1 minute)
  if (cached && Date.now() - cached.timestamp.getTime() < 60000) {
    console.log(`   📦 Cache hit: économie de ${cached.creditsUsed} crédits`);
    return cached.data;
  }

  // API call
  console.log(`   🌐 Appel API...`);
  const response = await client.getOdds(sportKey, {
    regions: 'eu',
    markets,
    oddsFormat: 'decimal',
    dateFormat: 'iso',
  });

  const data = response.data;
  const creditsUsed = data.length * markets.split(',').length;

  apiCache.set(cacheKey, {
    timestamp: new Date(),
    data,
    creditsUsed,
  });

  return data;
}

/**
 * Extract market odds from API response, handling multiple lines/points correctly.
 * Returns an array of normalized odds objects (one per line).
 *
 * For team_totals, uses the 'description' field to identify which team:
 * - Returns separate entries with 'team' property ('home' or 'away')
 */
function extractMarketOdds(market: any, homeTeam?: string, awayTeam?: string): any[] {
  const homeLower = homeTeam?.toLowerCase().trim();
  const awayLower = awayTeam?.toLowerCase().trim();

  const isSpread = market.key.includes('spread');
  const isTeamTotals = market.key === 'team_totals' || market.key === 'alternate_team_totals';
  const isBtts = market.key === 'btts';

  // For team_totals, group by (point, team)
  // For other markets, group by point
  const byKey = new Map<string, any>();

  for (const outcome of market.outcomes || []) {
    const name = outcome.name.toLowerCase();
    let point = outcome.point;
    let type: 'home' | 'away' | 'draw' | 'over' | 'under' | 'yes' | 'no' | null = null;
    let teamSide: 'home' | 'away' | null = null;

    // BTTS: Yes/No
    if (isBtts) {
      if (name === 'yes') type = 'yes';
      else if (name === 'no') type = 'no';
    }
    // Team Totals: Over/Under with description indicating team
    else if (isTeamTotals) {
      const description = outcome.description?.toLowerCase().trim() || '';

      // Determine which team this belongs to
      if (description && homeLower && description.includes(homeLower)) {
        teamSide = 'home';
      } else if (description && awayLower && description.includes(awayLower)) {
        teamSide = 'away';
      } else if (description) {
        // Fallback: check if description matches exactly
        if (description === homeLower) teamSide = 'home';
        else if (description === awayLower) teamSide = 'away';
      }

      // Determine over/under
      if (name.startsWith('over') || name === 'o') type = 'over';
      else if (name.startsWith('under') || name === 'u') type = 'under';
    }
    // Standard markets
    else {
      if (homeLower && name === homeLower) type = 'home';
      else if (awayLower && name === awayLower) type = 'away';
      else if (name === 'draw' || name === 'tie' || name === 'x') type = 'draw';
      else if (name.startsWith('over') || name === 'o') type = 'over';
      else if (name.startsWith('under') || name === 'u') type = 'under';
      else if (name === 'home' || name === '1') type = 'home';
      else if (name === 'away' || name === '2') type = 'away';
      // Double Chance
      else if (name === 'home/draw' || name === '1x') type = '1x' as any;
      else if (name === 'draw/away' || name === 'x2') type = 'x2' as any;
      else if (name === 'home/away' || name === '12') type = '12' as any;
    }

    if (!type) continue;

    // Normalize point for Spreads - DISABLED to allow full range (+ and -) display
    // if (isSpread && point !== undefined && type === 'away') {
    //    point = -1 * point;
    // }

    // Build composite key
    let compositeKey: string;
    if (isTeamTotals && teamSide) {
      compositeKey = `${point ?? 0}_${teamSide}`;
    } else {
      compositeKey = `${point ?? 0}`;
    }

    if (!byKey.has(compositeKey)) {
      const entry: any = { point: point, last_update: market.last_update };
      if (isTeamTotals && teamSide) {
        entry.team = teamSide;
      }
      byKey.set(compositeKey, entry);
    }

    const entry = byKey.get(compositeKey);
    entry[type] = outcome.price;
    if (entry.point === undefined && point !== undefined) entry.point = point;
  }

  return Array.from(byKey.values());
}

async function captureSnapshot(
  supabase: any,
  dbEvent: any,
  apiEvent: any,
  minutesBeforeKickoff: number
) {
  // Sélectionner le meilleur bookmaker (priorité)
  const bookmakerPriority = ['pinnacle', 'bet365', 'betfair_ex_eu', 'onexbet'];
  let selectedBookmaker = null;

  for (const preferred of bookmakerPriority) {
    const found = apiEvent.bookmakers.find((b: any) => b.key === preferred);
    if (found) {
      selectedBookmaker = found;
      break;
    }
  }

  if (!selectedBookmaker && apiEvent.bookmakers.length > 0) {
    selectedBookmaker = apiEvent.bookmakers[0];
  }

  if (!selectedBookmaker) {
    throw new Error('No bookmaker available');
  }

  // Extract all markets
  const markets: any = {};
  const marketsVariations: any = {};

  // Group by market_key
  const marketsByKey = new Map<string, any[]>();
  for (const apiMarket of selectedBookmaker.markets) {
    if (!marketsByKey.has(apiMarket.key)) {
      marketsByKey.set(apiMarket.key, []);
    }
    marketsByKey.get(apiMarket.key)!.push(apiMarket);
  }

  // Process each market type
  for (const [marketKey, apiMarkets] of marketsByKey.entries()) {
    // Collect ALL variations from ALL market objects of this type
    let allVariations: any[] = [];

    for (const m of apiMarkets) {
        const extracted = extractMarketOdds(m, dbEvent.home_team, dbEvent.away_team);
        allVariations.push(...extracted);
    }

    // Special handling for team_totals: split into home and away
    const isTeamTotals = marketKey === 'team_totals' || marketKey === 'alternate_team_totals';

    if (isTeamTotals) {
      // Separate home and away team totals
      const homeVariations = allVariations.filter(v => v.team === 'home');
      const awayVariations = allVariations.filter(v => v.team === 'away');

      // Store as separate market keys
      if (homeVariations.length > 0) {
        const sortedHome = homeVariations.sort((a, b) => (a.point || 0) - (b.point || 0));
        const storeKey = marketKey === 'team_totals' ? 'team_totals_home' : 'alternate_team_totals_home';
        markets[storeKey] = sortedHome[0];
        marketsVariations[storeKey] = sortedHome;
      }
      if (awayVariations.length > 0) {
        const sortedAway = awayVariations.sort((a, b) => (a.point || 0) - (b.point || 0));
        const storeKey = marketKey === 'team_totals' ? 'team_totals_away' : 'alternate_team_totals_away';
        markets[storeKey] = sortedAway[0];
        marketsVariations[storeKey] = sortedAway;
      }
    } else {
      // Standard processing for other markets
      // Deduplicate by point
      const mergedVariations = new Map<number, any>();
      for (const v of allVariations) {
          const p = v.point ?? 0;
          if (!mergedVariations.has(p)) {
              mergedVariations.set(p, v);
          } else {
              // Merge (e.g. one object had home, other had away)
              mergedVariations.set(p, { ...mergedVariations.get(p), ...v });
          }
      }

      const finalVariations = Array.from(mergedVariations.values());

      // Sort by point for consistency
      finalVariations.sort((a, b) => (a.point || 0) - (b.point || 0));

      // Store
      if (finalVariations.length > 0) {
          markets[marketKey] = finalVariations[0];
          marketsVariations[marketKey] = finalVariations;
      }
    }
  }

  // Sauvegarder le snapshot
  // Note: we try to insert markets_variations if the column exists
  const snapshotData: any = {
    event_id: dbEvent.id,
    captured_at: new Date().toISOString(),
    bookmaker_last_update: selectedBookmaker.last_update,
    minutes_before_kickoff: minutesBeforeKickoff,
    markets: markets,
    bookmaker: selectedBookmaker.key,
    api_request_count: 1,
  };

  snapshotData.markets_variations = marketsVariations;

  const { error } = await supabase
    .from('closing_odds_snapshots')
    .insert(snapshotData);

  if (error) {
    if (error.message.includes('markets_variations')) {
      // Fallback if column missing
      delete snapshotData.markets_variations;
      const { error: retryError } = await supabase
        .from('closing_odds_snapshots')
        .insert(snapshotData);
      if (retryError) throw new Error(`DB insert failed: ${retryError.message}`);
    } else {
      throw new Error(`DB insert failed: ${error.message}`);
    }
  }

  // Update event tracking
  try {
    const { data: currentEvent } = await supabase
      .from('events')
      .select('snapshot_count')
      .eq('id', dbEvent.id)
      .single();
    
    const newCount = (currentEvent?.snapshot_count || 0) + 1;

    await supabase
      .from('events')
      .update({
        last_snapshot_at: new Date().toISOString(),
        snapshot_count: newCount
      })
      .eq('id', dbEvent.id);
  } catch (trackError) {
    console.warn(`      ⚠️ Failed to update event tracking: ${(trackError as Error).message}`);
  }
}

async function finalizeClosingOdds(supabase: any, eventId: string) {
  // Sélectionner le MEILLEUR snapshot pour le Closing
  // Critère : Le plus proche du coup d'envoi (minutes_before_kickoff le plus petit mais >= 0)
  // On accepte une tolérance de -2 min (légèrement après) si rien d'autre, mais on privilégie l'avant-match.
  
  const { data: snapshots } = await supabase
    .from('closing_odds_snapshots')
    .select('*')
    .eq('event_id', eventId)
    .gte('minutes_before_kickoff', -2) // Tolérance 2 min après
    .order('minutes_before_kickoff', { ascending: true }); // Le plus petit d'abord (ex: 2 min avant > 10 min avant)

  let bestSnapshot = null;

  if (snapshots && snapshots.length > 0) {
      // Le premier est le plus proche de 0 (car tri ascendant et filtré >= -2)
      // Ex: 5, 10, 15 -> Le 5 est le meilleur
      bestSnapshot = snapshots[0];
  } else {
      // Fallback: Si aucun snapshot proche, on prend le plus récent disponible (même si vieux)
      const { data: fallback } = await supabase
        .from('closing_odds_snapshots')
        .select('*')
        .eq('event_id', eventId)
        .order('bookmaker_last_update', { ascending: false })
        .limit(1)
        .single();
      bestSnapshot = fallback;
  }

  if (!bestSnapshot) {
    console.log('      ⚠️ Aucun snapshot à finaliser');
    return;
  }

  // Marquer comme sélectionné
  await supabase
    .from('closing_odds_snapshots')
    .update({ is_selected: true })
    .eq('id', bestSnapshot.id);

  // Copier dans closing_odds
  await supabase
    .from('closing_odds')
    .upsert({
      event_id: eventId,
      markets: bestSnapshot.markets,
      markets_variations: bestSnapshot.markets_variations || {},
      captured_at: bestSnapshot.captured_at,
      bookmaker_update: bestSnapshot.bookmaker_last_update,
      capture_status: 'success',
      used_historical_api: false,
    });

  // IMPORTANT: Mettre à jour market_states avec les closing odds
  const markets = bestSnapshot.markets || {};
  for (const [marketKey, odds] of Object.entries(markets)) {
    const { error } = await supabase
      .from('market_states')
      .update({
        closing_odds: odds,
        status: 'closed',
      })
      .eq('event_id', eventId)
      .eq('market_key', marketKey);

    if (error) {
      console.log(`      ⚠️ Erreur update market_states ${marketKey}: ${error.message}`);
    }
  }

  console.log(`      ✅ Closing odds finalisées (Snapshot à M${bestSnapshot.minutes_before_kickoff})`);
}

async function finalizeOldEvents(supabase: any, now: Date): Promise<number> {
  // Trouver les événements qui VIENNENT de commencer (ou passés)
  // On finalise dès que le coup d'envoi est passé, car on ne capture plus rien après M-5.
  
  const justStarted = now.toISOString();

  const { data: events } = await supabase
    .from('events')
    .select('id, home_team, away_team, commence_time')
    .eq('status', 'upcoming')
    .lt('commence_time', justStarted); // Dès que commence_time < maintenant

  if (!events || events.length === 0) {
    console.log('ℹ️ Aucun événement à finaliser');
    return 0;
  }

  let finalized = 0;

  for (const event of events) {
    // Vérifier si déjà finalisé
    const { data: existing } = await supabase
      .from('closing_odds')
      .select('id')
      .eq('event_id', event.id)
      .limit(1);

    if (existing && existing.length > 0) {
      continue; // Déjà finalisé
    }

    console.log(`📊 Finalisation: ${event.home_team} vs ${event.away_team}`);

    await finalizeClosingOdds(supabase, event.id);
    finalized++;
  }

  return finalized;
}

function cleanCache() {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [key, entry] of apiCache.entries()) {
    if (entry.timestamp.getTime() < fiveMinutesAgo) {
      apiCache.delete(key);
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

run().catch((error) => {
  console.error('\n❌ ERREUR FATALE:', error);
  process.exit(1);
});
