import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTheOddsApiClient } from '@/lib/api/theoddsapi/client';

export const dynamic = 'force-dynamic'; // Prevent caching
export const maxDuration = 60; // Allow 60 seconds (Vercel Hobby limit is 10s, Pro 300s. We'll try to be fast)

interface CacheEntry {
  timestamp: Date;
  data: any[];
  creditsUsed: number;
}

// In serverless, this might reset often, but useful for warm starts
const apiCache = new Map<string, CacheEntry>();

export async function GET(request: Request) {
  // 1. SECURITY CHECK
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const startTime = Date.now();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const client = getTheOddsApiClient();
  const now = new Date();

  console.log('═══════════════════════════════════════════════════════');
  console.log(`🕐 CAPTURE CLOSING ODDS (CRON) - ${now.toLocaleString('fr-FR')}`);
  console.log('═══════════════════════════════════════════════════════\n');

  try {
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
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!events || events.length === 0) {
      console.log('ℹ️ Aucun événement dans la fenêtre de capture (M-15 à M+15)');
      // On continue quand même pour la finalisation
    } else {
      console.log(`📊 ${events.length} événement(s) dans la fenêtre\n`);
    }

    // 2. RÉCUPÉRER TOUS LES MARCHÉS TRACKÉS
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'tracked_markets')
      .single();

    let marketsToCapture = 'h2h,spreads,totals'; // Default
    if (settings?.value && Array.isArray(settings.value) && settings.value.length > 0) {
      const requested = [...settings.value];
      
      // Auto-include alternate markets for full coverage
      if (requested.includes('team_totals') && !requested.includes('alternate_team_totals')) {
          requested.push('alternate_team_totals');
      }
      
      marketsToCapture = requested.join(',');
    }
    console.log(`   Marchés cibles: ${marketsToCapture}\n`);

    let totalCaptured = 0;
    let totalSkipped = 0;
    let totalCredits = 0;

    // 3. TRAITER CHAQUE ÉVÉNEMENT INDIVIDUELLEMENT
    for (const dbEvent of events || []) {
      const minutesBeforeKickoff = calculateMinutesBeforeKickoff(dbEvent.commence_time, now);

      console.log(`🏆 ${dbEvent.home_team} vs ${dbEvent.away_team} (${dbEvent.sport_key})`);
      console.log(`   Kick-off: ${new Date(dbEvent.commence_time).toLocaleTimeString('fr-FR')}`);
      console.log(`   Position: M${minutesBeforeKickoff > 0 ? '+' : ''}${minutesBeforeKickoff}`);

      // Vérifier fenêtre stricte (M-15 à M+15)
      if (minutesBeforeKickoff < -15 || minutesBeforeKickoff > 15) {
        console.log(`   ⏭️ Hors fenêtre de capture stricte\n`);
        totalSkipped++;
        continue;
      }

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
        const response = await client.getEventOdds(dbEvent.sport_key, dbEvent.api_event_id, {
          regions: 'eu',
          markets: marketsToCapture,
          oddsFormat: 'decimal',
          dateFormat: 'iso',
        });

        const apiEvent = response.data;
        const creditsUsed = response.headers.requestsLast || 0;
        totalCredits += creditsUsed;

        if (!apiEvent || !apiEvent.bookmakers || apiEvent.bookmakers.length === 0) {
          console.log(`   ⚠️ Pas de bookmakers retournés`);
          continue;
        }

        await captureSnapshot(supabase, dbEvent, apiEvent, minutesBeforeKickoff);
        console.log(`   ✅ Snapshot capturé (Coût: ~${creditsUsed})\n`);
        totalCaptured++;

      } catch (error: any) {
        console.log(`   ❌ Erreur API: ${error.message}\n`);
      }
    }

    // 4. FINALISER LES ÉVÉNEMENTS PASSÉS
    const finalized = await finalizeOldEvents(supabase, now);

    // Summary
    const duration = Date.now() - startTime;
    const summary = {
      success: true,
      captured: totalCaptured,
      skipped: totalSkipped,
      finalized: finalized,
      creditsUsed: totalCredits,
      durationMs: duration
    };

    console.log('✅ CRON JOB COMPLETED', summary);

    return NextResponse.json(summary);

  } catch (error: any) {
    console.error('❌ CRON JOB FAILED', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ============================================================================ 
// HELPER FUNCTIONS (Adapted for Route)
// ============================================================================ 

function calculateMinutesBeforeKickoff(commenceTime: string, now: Date): number {
  const kickoff = new Date(commenceTime);
  const diffMs = kickoff.getTime() - now.getTime();
  return Math.floor(diffMs / (60 * 1000));
}

function extractMarketOdds(market: any, homeTeam?: string, awayTeam?: string): any[] {
  const homeLower = homeTeam?.toLowerCase().trim();
  const awayLower = awayTeam?.toLowerCase().trim();

  const isSpread = market.key.includes('spread');
  const isTeamTotals = market.key === 'team_totals' || market.key === 'alternate_team_totals';
  const isBtts = market.key === 'btts';

  const byKey = new Map<string, any>();

  for (const outcome of market.outcomes || []) {
    const name = outcome.name.toLowerCase();
    let point = outcome.point;
    let type: 'home' | 'away' | 'draw' | 'over' | 'under' | 'yes' | 'no' | null = null;
    let teamSide: 'home' | 'away' | null = null;

    if (isBtts) {
      if (name === 'yes') type = 'yes';
      else if (name === 'no') type = 'no';
    }
    else if (isTeamTotals) {
      const description = outcome.description?.toLowerCase().trim() || '';

      if (description && homeLower && description.includes(homeLower)) {
        teamSide = 'home';
      } else if (description && awayLower && description.includes(awayLower)) {
        teamSide = 'away';
      } else if (description) {
        if (description === homeLower) teamSide = 'home';
        else if (description === awayLower) teamSide = 'away';
      }

      if (name.startsWith('over') || name === 'o') type = 'over';
      else if (name.startsWith('under') || name === 'u') type = 'under';
    }
    else {
      if (homeLower && name === homeLower) type = 'home';
      else if (awayLower && name === awayLower) type = 'away';
      else if (name === 'draw' || name === 'tie' || name === 'x') type = 'draw';
      else if (name.startsWith('over') || name === 'o') type = 'over';
      else if (name.startsWith('under') || name === 'u') type = 'under';
      else if (name === 'home' || name === '1') type = 'home';
      else if (name === 'away' || name === '2') type = 'away';
      else if (name === 'home/draw' || name === '1x') type = '1x' as any;
      else if (name === 'draw/away' || name === 'x2') type = 'x2' as any;
      else if (name === 'home/away' || name === '12') type = '12' as any;
    }

    if (!type) continue;

    if (isSpread && point !== undefined && type === 'away') {
        point = -1 * point;
    }

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

  const markets: any = {};
  const marketsVariations: any = {};
  const marketsByKey = new Map<string, any[]>();

  for (const apiMarket of selectedBookmaker.markets) {
    if (!marketsByKey.has(apiMarket.key)) {
      marketsByKey.set(apiMarket.key, []);
    }
    marketsByKey.get(apiMarket.key)!.push(apiMarket);
  }

  for (const [marketKey, apiMarkets] of marketsByKey.entries()) {
    let allVariations: any[] = [];

    for (const m of apiMarkets) {
        const extracted = extractMarketOdds(m, dbEvent.home_team, dbEvent.away_team);
        allVariations.push(...extracted);
    }

    const isTeamTotals = marketKey === 'team_totals' || marketKey === 'alternate_team_totals';

    if (isTeamTotals) {
      const homeVariations = allVariations.filter(v => v.team === 'home');
      const awayVariations = allVariations.filter(v => v.team === 'away');

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
      const mergedVariations = new Map<number, any>();
      for (const v of allVariations) {
          const p = v.point ?? 0;
          if (!mergedVariations.has(p)) {
              mergedVariations.set(p, v);
          } else {
              mergedVariations.set(p, { ...mergedVariations.get(p), ...v });
          }
      }

      const finalVariations = Array.from(mergedVariations.values());
      finalVariations.sort((a, b) => (a.point || 0) - (b.point || 0));

      if (finalVariations.length > 0) {
          markets[marketKey] = finalVariations[0];
          marketsVariations[marketKey] = finalVariations;
      }
    }
  }

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
      delete snapshotData.markets_variations;
      const { error: retryError } = await supabase
        .from('closing_odds_snapshots')
        .insert(snapshotData);
      if (retryError) throw new Error(`DB insert failed: ${retryError.message}`);
    } else {
      throw new Error(`DB insert failed: ${error.message}`);
    }
  }

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
  const { data: bestSnapshot } = await supabase
    .from('closing_odds_snapshots')
    .select('*')
    .eq('event_id', eventId)
    .order('bookmaker_last_update', { ascending: false })
    .limit(1)
    .single();

  if (!bestSnapshot) {
    return;
  }

  await supabase
    .from('closing_odds_snapshots')
    .update({ is_selected: true })
    .eq('id', bestSnapshot.id);

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
      
    if (error) console.error(`Failed to update market state: ${error.message}`);
  }
}

async function finalizeOldEvents(supabase: any, now: Date): Promise<number> {
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();

  const { data: events } = await supabase
    .from('events')
    .select('id, home_team, away_team, commence_time')
    .eq('status', 'upcoming')
    .lt('commence_time', tenMinutesAgo);

  if (!events || events.length === 0) {
    return 0;
  }

  let finalized = 0;

  for (const event of events) {
    const { data: existing } = await supabase
      .from('closing_odds')
      .select('id')
      .eq('event_id', event.id)
      .limit(1);

    if (existing && existing.length > 0) {
      continue; 
    }

    console.log(`📊 Finalisation (Cron): ${event.home_team} vs ${event.away_team}`);
    await finalizeClosingOdds(supabase, event.id);
    finalized++;
  }

  return finalized;
}
