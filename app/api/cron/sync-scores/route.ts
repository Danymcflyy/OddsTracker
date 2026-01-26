import { NextResponse } from 'next/server';
import { syncScoresAndClosingOdds } from '@/lib/services/theoddsapi/closing-odds';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes - this can take longer

/**
 * Cron Job: Sync Scores & Closing Odds
 * Frequency: Once daily (2:27 AM UTC)
 * Purpose: Update scores and capture closing odds for completed events
 * Cost: ~2 credits for scores + ~6 credits per completed event
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
  console.log(`📊 SYNC SCORES & CLOSING ODDS (CRON) - ${now.toLocaleString('fr-FR')}`);
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    const result = await syncScoresAndClosingOdds();

    const duration = Date.now() - startTime;
    const summary = {
      success: result.success,
      eventsProcessed: result.eventsProcessed,
      closingCaptured: result.closingCaptured,
      closingFailed: result.closingFailed,
      creditsUsed: result.creditsUsed,
      errorsCount: result.errors.length,
      errors: result.errors.slice(0, 5), // Include first 5 errors only
      durationMs: duration,
    };

    console.log('\n📊 Résultats de la Sync:');
    console.log('  - Événements traités:', summary.eventsProcessed);
    console.log('  - Closing capturés:', summary.closingCaptured);
    console.log('  - Closing échoués:', summary.closingFailed);
    console.log('  - Crédits utilisés:', summary.creditsUsed);
    console.log('  - Erreurs:', summary.errorsCount);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Erreurs rencontrées (5 premières):');
      summary.errors.forEach(err => console.log('  -', err));
    }

    console.log('');
    if (!result.success) {
      console.error('❌ SYNC COMPLETED WITH ERRORS');
      return NextResponse.json(summary, { status: 500 });
    }

    console.log('✅ SYNC COMPLETED SUCCESSFULLY');
    return NextResponse.json(summary);

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('\n❌ SYNC SCORES & CLOSING FAILED', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      durationMs: duration,
    }, { status: 500 });
  }
}
