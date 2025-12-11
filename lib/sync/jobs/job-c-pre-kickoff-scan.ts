/**
 * Job C - Pre-Kickoff Scan
 *
 * Fréquence: 5 minutes (pour matchs en état ACTIVE_NEAR_KO)
 * Rôle: Mettre à jour les closing odds juste avant le match
 *
 * Logique:
 * 1. Récupérer tous les matchs en état ACTIVE_NEAR_KO
 * 2. Grouper par paquets de 10 pour /v3/odds/multi
 * 3. Mettre à jour closing_price_observed et closing_time_observed
 * 4. Si match commencé, transitionner à FINISHED
 */

import { supabaseAdmin } from '@/lib/db';
import { oddsApiClient } from '@/lib/api/oddsapi/client';
import { stateMachineService } from '@/lib/sync/state-machine-service';
import { normalizeOddsApiOdds } from '@/lib/api/oddsapi/normalizer';

const BATCH_SIZE = 10;  // Odds-API.io recommande max 10 par requête

export class JobCPreKickoffScan {
  /**
   * Exécute le job C
   */
  async run(): Promise<void> {
    console.log('\n🚀 Job C - Starting pre-kickoff scan...\n');

    const startTime = Date.now();
    let totalScanned = 0;
    let totalUpdated = 0;

    // 1. Activer les matchs H-1
    const activated = await stateMachineService.activateNearKickoff();
    console.log(`   Activated: ${activated} events for pre-KO scanning`);

    // 2. Récupérer les matchs en ACTIVE_NEAR_KO
    const activeEvents = await stateMachineService.getActiveEvents();

    if (activeEvents.length === 0) {
      console.log('   ℹ️  No active events to scan');
      const duration = Date.now() - startTime;
      console.log(`✅ Job C completed in ${duration}ms - No updates`);
      return;
    }

    console.log(`\n📊 Scanning ${activeEvents.length} active events`);

    // 3. Traiter par paquets
    const eventIds = activeEvents.map((e) => e.event_id);
    const batches = this.createBatches(eventIds, BATCH_SIZE);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`   Batch ${i + 1}/${batches.length}: ${batch.length} events`);

      try {
        const updated = await this.scanBatch(batch);
        totalUpdated += updated;
        totalScanned += batch.length;
      } catch (error) {
        console.error(`   ❌ Error scanning batch:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`
✅ Job C completed in ${duration}ms
   Total scanned:  ${totalScanned}
   Total updated:  ${totalUpdated}
    `);
  }

  /**
   * Scanne un paquet d'événements
   */
  private async scanBatch(eventIds: number[]): Promise<number> {
    try {
      const oddsResponses = await oddsApiClient.getOddsMulti(eventIds);

      if (!Array.isArray(oddsResponses)) {
        console.warn('   ⚠️  Invalid response from getOddsMulti');
        return 0;
      }

      let updated = 0;

      for (const odds of oddsResponses) {
        try {
          const count = await this.updateClosingOdds(odds);
          updated += count;
        } catch (error) {
          console.error(`   ❌ Error updating odds for event ${odds.id}:`, error);
        }
      }

      return updated;
    } catch (error) {
      console.error('   ❌ Error in scanBatch:', error);
      throw error;
    }
  }

  /**
   * Met à jour les closing odds pour un événement
   */
  private async updateClosingOdds(odds: any): Promise<number> {
    const eventId = odds.id;
    const normalized = normalizeOddsApiOdds(odds);
    const lastUpdated = normalized.lastUpdated;

    let updated = 0;

    // Parcourir les cotes Pinnacle
    for (const [bookmakerKey, bookmakerData] of Object.entries(normalized.bookmakerOdds)) {
      if (bookmakerKey !== 'pinnacle') continue;

      for (const [marketKey, marketData] of Object.entries(bookmakerData.markets)) {
        for (const [outcomeName, outcomeData] of Object.entries(marketData.outcomes)) {
          // Mettre à jour closing_price et closing_time
          const { error } = await supabaseAdmin
            .from('opening_closing_observed')
            .update({
              closing_price_observed: outcomeData.price,
              closing_time_observed: lastUpdated.toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('event_id', eventId)
            .eq('bookmaker', 'Pinnacle')
            .eq('market_name', marketKey)
            .eq('selection', outcomeName)
            .eq('line', outcomeData.line ?? null);

          if (!error) {
            updated++;
          }
        }
      }
    }

    return updated;
  }

  /**
   * Crée des paquets à partir d'un array
   */
  private createBatches<T>(items: T[], size: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      batches.push(items.slice(i, i + size));
    }
    return batches;
  }
}

// Export singleton
export const jobCPreKickoffScan = new JobCPreKickoffScan();
