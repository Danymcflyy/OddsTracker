import { NextResponse } from 'next/server';
import { scanAllOpeningOdds } from '@/lib/services/theoddsapi/opening-odds';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Cron Job: Scan Opening Odds
 * Frequency: Every 5 minutes
 * Purpose: Capture opening odds for pending markets
 * Cost: ~6 credits per event with pending markets
 */
export async function POST(request: Request) {
  // 1. SECURITY CHECK
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const startTime = Date.now();
  const now = new Date();

  console.log('═══════════════════════════════════════════════════════');
  console.log(`🔍 SCAN OPENING ODDS (CRON) - ${now.toLocaleString('fr-FR')}`);
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    const result = await scanAllOpeningOdds();

    const duration = Date.now() - startTime;
    const summary = {
      success: result.success,
      eventsScanned: result.eventsScanned,
      marketsChecked: result.marketsChecked,
      marketsCaptured: result.marketsCaptured,
      creditsUsed: result.creditsUsed,
      errorsCount: result.errors.length,
      errors: result.errors.slice(0, 5), // Include first 5 errors only
      durationMs: duration,
    };

    console.log('\n📊 Résultats du Scan:');
    console.log('  - Événements scannés:', summary.eventsScanned);
    console.log('  - Marchés vérifiés:', summary.marketsChecked);
    console.log('  - Marchés capturés:', summary.marketsCaptured);
    console.log('  - Crédits utilisés:', summary.creditsUsed);
    console.log('  - Erreurs:', summary.errorsCount);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Erreurs rencontrées (5 premières):');
      summary.errors.forEach(err => console.log('  -', err));
    }

    console.log('');
    if (!result.success && result.errors.length > 0) {
      console.error('❌ SCAN COMPLETED WITH ERRORS');
      return NextResponse.json(summary, { status: 500 });
    }

    console.log('✅ SCAN COMPLETED SUCCESSFULLY');
    return NextResponse.json(summary);

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('\n❌ SCAN OPENING ODDS FAILED', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      durationMs: duration,
    }, { status: 500 });
  }
}
