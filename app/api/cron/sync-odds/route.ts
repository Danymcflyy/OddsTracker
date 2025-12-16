/**
 * Cron Job - Synchronisation des cotes
 * Appelé toutes les 5 minutes par Vercel Cron
 *
 * Workflow:
 * 1. Découverte de nouveaux matchs pour les ligues trackées
 * 2. Capture/mise à jour des cotes pour les matchs à venir
 * 3. Log des résultats
 */

import { NextResponse } from 'next/server';
import { discoverMatches } from '@/lib/api/v3/match-discovery';
import { captureOdds } from '@/lib/api/v3/odds-capture';
import { supabaseAdmin } from '@/lib/db';

export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes max

/**
 * Endpoint appelé par Vercel Cron
 * Protégé par CRON_SECRET
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // Vérification authentification
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      console.error('❌ Tentative d\'accès non autorisée au cron job');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🚀 ===== DÉBUT SYNC CRON =====');
    console.log(`⏰ ${new Date().toISOString()}`);

    // Étape 1: Découverte de matchs
    console.log('\n📋 ÉTAPE 1: Découverte de matchs...');
    const discoveryResult = await discoverMatches('football');

    console.log(`  ✅ ${discoveryResult.discovered} nouveaux matchs`);
    console.log(`  🔄 ${discoveryResult.updated} matchs mis à jour`);

    if (discoveryResult.errors.length > 0) {
      console.warn(`  ⚠️  ${discoveryResult.errors.length} erreurs de découverte`);
      discoveryResult.errors.forEach(err => console.error(`     - ${err}`));
    }

    // Étape 2: Capture de cotes
    console.log('\n🎯 ÉTAPE 2: Capture de cotes...');
    const oddsResult = await captureOdds('football', 50);

    console.log(`  ✅ ${oddsResult.matches_updated} matchs traités`);
    console.log(`  📊 ${oddsResult.odds_captured} cotes capturées`);

    if (oddsResult.errors.length > 0) {
      console.warn(`  ⚠️  ${oddsResult.errors.length} erreurs de capture`);
      oddsResult.errors.forEach(err => console.error(`     - ${err}`));
    }

    // Étape 3: Log en base de données
    const duration = Date.now() - startTime;
    console.log('\n💾 ÉTAPE 3: Enregistrement des logs...');

    console.log("➡️  Résumé loggable (suppression de l'écriture DB)");

    // Résumé
    const totalErrors = discoveryResult.errors.length + oddsResult.errors.length;
    const overallStatus = totalErrors === 0 ? 'success' : 'partial_success';

    console.log('\n' + '='.repeat(50));
    console.log(`✅ SYNC TERMINÉ (${duration}ms)`);
    console.log(`   Status: ${overallStatus}`);
    console.log(`   Matchs découverts: ${discoveryResult.discovered}`);
    console.log(`   Matchs mis à jour: ${discoveryResult.updated}`);
    console.log(`   Cotes capturées: ${oddsResult.odds_captured}`);
    console.log(`   Erreurs totales: ${totalErrors}`);
    console.log('='.repeat(50) + '\n');

    return NextResponse.json({
      success: true,
      status: overallStatus,
      duration_ms: duration,
      discovery: {
        discovered: discoveryResult.discovered,
        updated: discoveryResult.updated,
        errors: discoveryResult.errors.length,
      },
      odds: {
        matches_updated: oddsResult.matches_updated,
        odds_captured: oddsResult.odds_captured,
        errors: oddsResult.errors.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('❌ ERREUR CRITIQUE SYNC CRON:', errorMessage);
    console.error(error);

    // Log de l'erreur critique
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
