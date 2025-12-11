/**
 * Job C - Pre-Kickoff Scan & Closing Odds Update
 *
 * Fréquence: Toutes les 15 minutes
 * Rôle: Mettre à jour les closing odds juste avant le match
 *
 * Logique (REFACTORISÉE):
 * 1. Récupérer tous les matchs en état ACTIVE_NEAR_KO
 * 2. Pour chaque match: appeler /v3/odds?eventId=X
 * 3. Mettre à jour closing_price_observed et closing_time_observed
 * 4. Si match commencé, transitionner à FINISHED
 *
 * NOTE: Les appels sont espacés pour respecter le quota API (5000 req/day)
 */

import { supabaseAdmin } from '@/lib/db';
import { oddsApiClient } from '@/lib/api/oddsapi/client';
import { stateMachineService } from '@/lib/sync/state-machine-service';
import { normalizeOddsApiOdds } from '@/lib/api/oddsapi/normalizer';

const BATCH_SIZE = 10;  // Traiter par paquets pour optimiser

export class JobCPreKickoffScan {
  /**
   * Exécute le job C
   */
  async run(): Promise<void> {
    console.log('\n🚀 Job C - Pre-kickoff scan & closing odds update...\n');

    const startTime = Date.now();
    let totalScanned = 0;
    let totalUpdated = 0;

    // 1. Activer les matchs H-1
    console.log('⏰ Activating events within 1 hour of kickoff...');
    const activated = await stateMachineService.activateNearKickoff();
    console.log(`   ✅ Activated: ${activated} events for pre-KO scanning\n`);

    // 2. Récupérer les matchs en ACTIVE_NEAR_KO
    const activeEvents = await stateMachineService.getActiveEvents();

    if (activeEvents.length === 0) {
      console.log('ℹ️  No active events to scan');
      const duration = Date.now() - startTime;
      console.log(`\n✅ Job C completed in ${duration}ms - No updates`);
      return;
    }

    console.log(`📊 Scanning ${activeEvents.length} active events:\n`);

    // 3. Traiter par paquets de 10
    const eventIds = activeEvents.map((e) => e.event_id);

    let updated = 0;
    for (const eventId of eventIds) {
      try {
        const count = await this.updateEventClosingOdds(eventId);
        if (count > 0) {
          updated += count;
          totalUpdated += count;
        }
      } catch (error) {
        console.warn(`   ⚠️  Error updating event ${eventId}: ${error instanceof Error ? error.message : error}`);
      }
      totalScanned++;
    }

    const duration = Date.now() - startTime;
    console.log(`\n✅ Job C completed in ${duration}ms`);
    console.log(`   📌 Total scanned:  ${totalScanned}`);
    console.log(`   ✏️  Total updated:  ${totalUpdated}`);
  }

  /**
   * Met à jour les closing odds pour un événement
   */
  private async updateEventClosingOdds(eventId: number): Promise<number> {
    try {
      const odds = await oddsApiClient.getOdds(eventId);

      if (!odds || !odds.bookmakers) {
        console.warn(`     ⚠️  No odds found for event ${eventId}`);
        return 0;
      }

      const normalized = normalizeOddsApiOdds(odds);
      const lastUpdated = normalized.lastUpdated;

      let updated = 0;

      // Parcourir les cotes Pinnacle
      const pinnacle = odds.bookmakers.find(b => b.key === 'Pinnacle');
      if (!pinnacle) {
        console.warn(`     ⚠️  No Pinnacle odds for event ${eventId}`);
        return 0;
      }

      for (const market of pinnacle.markets) {
        for (const outcome of market.outcomes) {
          // Mettre à jour closing_price et closing_time
          const { error } = await supabaseAdmin
            .from('opening_closing_observed')
            .update({
              closing_price_observed: parseFloat(outcome.price),
              closing_time_observed: lastUpdated.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('event_id', eventId)
            .eq('bookmaker', 'Pinnacle')
            .eq('market_name', market.key)
            .eq('selection', outcome.name.toLowerCase());

          if (!error) {
            updated++;
          }
        }
      }

      if (updated > 0) {
        console.log(`     ✅ Event ${eventId}: updated ${updated} odds`);
      }

      return updated;
    } catch (error) {
      throw error;
    }
  }

}

// Export singleton
export const jobCPreKickoffScan = new JobCPreKickoffScan();
