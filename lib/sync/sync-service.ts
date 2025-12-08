"use server";

import { differenceInMilliseconds } from "date-fns";

import type { FixtureWithEnrichedOdds } from "@/types/fixture";
import { oddsPapiClient } from "@/lib/api/oddspapi";
import { supabaseAdmin, isAdminAvailable, supabase } from "@/lib/db";
import type { Database } from "@/types/database";

interface SyncResult {
  success: boolean;
  recordsFetched: number;
  recordsInserted: number;
  logId: number | null;
}

interface SyncOptions {
  sportId: number;
  retryCount?: number;
  fromDate?: Date;
}

const DEFAULT_RETRY = 2;
const RETRY_DELAY_MS = 2000;

export class SyncService {
  async syncSport({ sportId, retryCount = DEFAULT_RETRY }: SyncOptions): Promise<SyncResult> {
    if (!isAdminAvailable()) {
      throw new Error("SyncService nécessite SUPABASE_SERVICE_ROLE_KEY");
    }

    const logId = await this.createSyncLog(sportId);

    try {
      const syncStart = new Date();
      let attempt = 0;
      let lastError: unknown = null;

      while (attempt <= retryCount) {
        try {
          const result = await this.performSync({ sportId });
          await this.completeSyncLog(logId, "success", result.recordsFetched, result.recordsInserted, syncStart);
          return { success: true, recordsFetched: result.recordsFetched, recordsInserted: result.recordsInserted, logId };
        } catch (syncError) {
          lastError = syncError;
          attempt += 1;

          if (attempt > retryCount) {
            break;
          }

          await this.delay(RETRY_DELAY_MS * attempt);
        }
      }

      throw lastError ?? new Error("Échec de la synchronisation");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      await this.completeSyncLog(logId, "error", 0, 0, new Date(), message);
      return { success: false, recordsFetched: 0, recordsInserted: 0, logId };
    }
  }

  private async performSync({ sportId }: { sportId: number }) {
    const tournaments = await oddsPapiClient.getTournaments(sportId);

    let recordsFetched = 0;
    let recordsInserted = 0;

    for (const tournament of tournaments) {
      const fixtures = await oddsPapiClient.getFixtures({ tournamentId: tournament.id });
      recordsFetched += fixtures.length;

      if (!fixtures.length) continue;

      const upsertResult = await supabaseAdmin
        .from("fixtures")
        .upsert(
          fixtures.map((fixture) => ({
            oddspapi_id: fixture.id,
            sport_id: sportId,
            league_id: tournament.id,
            home_team_id: fixture.homeTeam.id,
            away_team_id: fixture.awayTeam.id,
            start_time: fixture.startTime,
            home_score: fixture.homeScore ?? null,
            away_score: fixture.awayScore ?? null,
            status: fixture.status ?? "scheduled",
          })),
          { onConflict: "oddspapi_id" }
        )
        .select();

      if (upsertResult.error) {
        throw upsertResult.error;
      }

      recordsInserted += upsertResult.data?.length ?? 0;

      await this.delay(1000);
    }

    return { recordsFetched, recordsInserted };
  }

  private async createSyncLog(sportId: number) {
    const { data, error } = await supabaseAdmin
      .from("sync_logs")
      .insert({
        sport_id: sportId,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  private async completeSyncLog(
    logId: number,
    status: string,
    recordsFetched: number,
    recordsInserted: number,
    startedAt: Date,
    errorMessage?: string
  ) {
    const duration = differenceInMilliseconds(new Date(), startedAt);

    const { error } = await supabaseAdmin
      .from("sync_logs")
      .update({
        status,
        records_fetched: recordsFetched,
        records_inserted: recordsInserted,
        error_message: errorMessage ?? null,
        completed_at: new Date().toISOString(),
        duration_ms: duration,
      })
      .eq("id", logId);

    if (error) {
      throw error;
    }
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
