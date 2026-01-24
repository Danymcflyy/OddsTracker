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

  // 1. RÉCUPÉRER LES ÉVÉNEMENTS DANS LA FENÊTRE DE CAPTURE
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'upcoming')
    .gte('commence_time', new Date(now.getTime() - 15 * 60 * 1000).toISOString())
    .lte('commence_time', new Date(now.getTime() + 15 * 60 * 1000).toISOString())
    .order('commence_time', { ascending: true });

  if (error) {
    console.error('❌ Erreur DB:', error.message);
    process.exit(1);
  }

  if (!events || events.length === 0) {
    console.log('ℹ️ Aucun événement dans la fenêtre de capture (M-15 à M+15)');
    return;
  }

  console.log(`📊 ${events.length} événement(s) dans la fenêtre\n`);

  // 2. GROUPER PAR SPORT
  const eventsBySport = events.reduce((acc, event) => {
    if (!acc[event.sport_key]) acc[event.sport_key] = [];
    acc[event.sport_key].push(event);
    return acc;
  }, {} as Record<string, any[]>);

  let totalCaptured = 0;
  let totalSkipped = 0;
  let totalCredits = 0;

  // 3. TRAITER CHAQUE SPORT
  for (const [sportKey, sportEvents] of Object.entries(eventsBySport)) {
    console.log(`\n🏆 Sport: ${sportKey}`);
    console.log(`   ${sportEvents.length} événement(s)\n`);

    // Déterminer quels marchés capturer (progressif)
    const markets = await getMarketsForCapture(supabase, sportEvents);
    console.log(`   Marchés à capturer: ${markets}`);

    try {
      // 4. UNE REQUÊTE API PAR SPORT (avec cache)
      const apiEvents = await getOddsWithCache(client, sportKey, markets);

      if (!apiEvents || apiEvents.length === 0) {
        console.log(`   ⚠️ Aucun événement retourné par l'API`);
        continue;
      }

      const creditsUsed = apiEvents.length * markets.split(',').length;
      totalCredits += creditsUsed;

      console.log(`   📊 ${apiEvents.length} match(s) retournés par l'API`);
      console.log(`   💰 ${creditsUsed} crédits utilisés\n`);

      // 5. TRAITER CHAQUE ÉVÉNEMENT
      for (const dbEvent of sportEvents) {
        const minutesBeforeKickoff = calculateMinutesBeforeKickoff(dbEvent.commence_time, now);

        console.log(`   🏆 ${dbEvent.home_team} vs ${dbEvent.away_team}`);
        console.log(`      Kick-off: ${new Date(dbEvent.commence_time).toLocaleTimeString('fr-FR')}`);
        console.log(`      Position: M${minutesBeforeKickoff > 0 ? '+' : ''}${minutesBeforeKickoff}`);

        // Vérifier si dans la fenêtre de capture
        if (minutesBeforeKickoff < -10 || minutesBeforeKickoff > 10) {
          console.log(`      ⏭️ Hors fenêtre de capture\n`);
          totalSkipped++;
          continue;
        }

        // Trouver l'événement dans la réponse API
        const apiEvent = apiEvents.find(e => e.id === dbEvent.api_event_id);

        if (!apiEvent || !apiEvent.bookmakers || apiEvent.bookmakers.length === 0) {
          console.log(`      ⚠️ Match absent de l'API ou pas de bookmakers`);

          // Si après kick-off, finaliser
          if (minutesBeforeKickoff <= 0) {
            console.log(`      📊 Finalisation...`);
            await finalizeClosingOdds(supabase, dbEvent.id);
          }
          console.log('');
          continue;
        }

        // Vérifier si déjà capturé à ce moment
        const { data: existing } = await supabase
          .from('closing_odds_snapshots')
          .select('id')
          .eq('event_id', dbEvent.id)
          .eq('minutes_before_kickoff', minutesBeforeKickoff)
          .limit(1);

        if (existing && existing.length > 0) {
          console.log(`      ✓ Déjà capturé à ce moment\n`);
          totalSkipped++;
          continue;
        }

        // Capturer le snapshot
        try {
          await captureSnapshot(supabase, dbEvent, apiEvent, minutesBeforeKickoff);
          console.log(`      ✅ Snapshot capturé\n`);
          totalCaptured++;
        } catch (error: any) {
          console.log(`      ❌ Erreur capture: ${error.message}\n`);
        }
      }

    } catch (error: any) {
      console.error(`   ❌ Erreur pour ${sportKey}:`, error.message);
    }
  }

  // 6. FINALISER LES ÉVÉNEMENTS PASSÉS M+10
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

async function getMarketsForCapture(supabase: any, _sportEvents: any[]): Promise<string> {
  // Récupérer tous les marchés trackés depuis les settings
  const { data: settings } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'tracked_markets')
    .single();

  if (settings?.value && Array.isArray(settings.value) && settings.value.length > 0) {
    return settings.value.join(',');
  }

  // Fallback: marchés par défaut
  return 'h2h,spreads,totals';
}

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

  // Extraire les marchés
  const markets: any = {};
  selectedBookmaker.markets?.forEach((market: any) => {
    const odds: any = {
      last_update: market.last_update || selectedBookmaker.last_update,
    };

    market.outcomes?.forEach((outcome: any) => {
      const name = outcome.name.toLowerCase();

      if (name.includes('home') || name === dbEvent.home_team.toLowerCase()) {
        odds.home = outcome.price;
        if (outcome.point !== undefined) odds.point = outcome.point;
      } else if (name.includes('away') || name === dbEvent.away_team.toLowerCase()) {
        odds.away = outcome.price;
        if (outcome.point !== undefined) odds.point = outcome.point;
      } else if (name.includes('draw')) {
        odds.draw = outcome.price;
      } else if (name.includes('over')) {
        odds.over = outcome.price;
        if (outcome.point !== undefined) odds.point = outcome.point;
      } else if (name.includes('under')) {
        odds.under = outcome.price;
        if (outcome.point !== undefined) odds.point = outcome.point;
      }
    });

    markets[market.key] = odds;
  });

  // Sauvegarder le snapshot
  const { error } = await supabase
    .from('closing_odds_snapshots')
    .insert({
      event_id: dbEvent.id,
      captured_at: new Date().toISOString(),
      bookmaker_last_update: selectedBookmaker.last_update,
      minutes_before_kickoff: minutesBeforeKickoff,
      markets: markets,
      bookmaker: selectedBookmaker.key,
      api_request_count: 1,
    });

  if (error) {
    throw new Error(`DB insert failed: ${error.message}`);
  }
}

async function finalizeClosingOdds(supabase: any, eventId: string) {
  // Sélectionner le snapshot avec last_update le plus récent
  const { data: bestSnapshot } = await supabase
    .from('closing_odds_snapshots')
    .select('*')
    .eq('event_id', eventId)
    .order('bookmaker_last_update', { ascending: false })
    .limit(1)
    .single();

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

  console.log('      ✅ Closing odds finalisées');
}

async function finalizeOldEvents(supabase: any, now: Date): Promise<number> {
  // Trouver les événements dont le kick-off est passé depuis > 10 minutes
  // et qui n'ont pas encore de closing_odds finalisés

  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();

  const { data: events } = await supabase
    .from('events')
    .select('id, home_team, away_team, commence_time')
    .eq('status', 'upcoming')
    .lt('commence_time', tenMinutesAgo);

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
