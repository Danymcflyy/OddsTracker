import { NextResponse } from 'next/server';
import { syncSports, syncAllTrackedEvents } from '@/lib/services/theoddsapi/discovery';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Cron Job: Sync Events (Discover new matches)
 * Frequency: Configurable (recommended: every 15-30 minutes)
 * Purpose: Discover new upcoming events for tracked sports
 * Cost: 0 credits (FREE endpoint)
 */
export async function GET(request: Request) {
  // 1. SECURITY CHECK
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const startTime = Date.now();
  const now = new Date();

  console.log('═══════════════════════════════════════════════════════');
  console.log(`🏆 SYNC EVENTS (CRON) - ${now.toLocaleString('fr-FR')}`);
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Sync Sports
    console.log('🔄 Étape 1: Synchronisation des sports...');
    const sportsResult = await syncSports();

    if (!sportsResult.success) {
      throw new Error('Failed to sync sports');
    }

    console.log(`✅ ${sportsResult.sportsCount} sports synchronisés\n`);

    // Step 2: Sync Events for tracked sports
    console.log('🔄 Étape 2: Synchronisation des événements...');
    const eventsResult = await syncAllTrackedEvents();

    if (!eventsResult.success) {
      throw new Error('Failed to sync events');
    }

    const totalEvents = eventsResult.results.reduce((sum, r) => sum + r.eventsCount, 0);
    const totalNew = eventsResult.results.reduce((sum, r) => sum + r.newEventsCount, 0);

    const duration = Date.now() - startTime;
    const summary = {
      success: true,
      sportsCount: sportsResult.sportsCount,
      totalEvents: totalEvents,
      newEvents: totalNew,
      sportDetails: eventsResult.results.map(r => ({
        sportKey: r.sportKey,
        eventsCount: r.eventsCount,
        newEventsCount: r.newEventsCount,
      })),
      durationMs: duration,
    };

    console.log('\n📊 Résultats de la Sync:');
    console.log('  - Sports synchronisés:', summary.sportsCount);
    console.log('  - Total événements:', summary.totalEvents);
    console.log('  - Nouveaux événements:', summary.newEvents);
    console.log('');
    console.log('Détails par sport:');
    summary.sportDetails.forEach(s => {
      console.log(`  - ${s.sportKey}: ${s.eventsCount} events (${s.newEventsCount} nouveaux)`);
    });

    console.log('');
    console.log('✅ SYNC COMPLETED SUCCESSFULLY');
    return NextResponse.json(summary);

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('\n❌ SYNC EVENTS FAILED', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      durationMs: duration,
    }, { status: 500 });
  }
}
