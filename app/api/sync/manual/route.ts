import { NextResponse } from "next/server";

import { autoSyncService } from "@/lib/sync/auto-sync-service";
import { supabaseAdmin } from "@/lib/db";
import { SettingKey } from "@/types/settings";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const sportParam = url.searchParams.get("sport");
    const sportIds = sportParam ? [Number(sportParam)].filter((value) => !Number.isNaN(value)) : undefined;

    const beforeCount = await readApiRequestCount();
    const stats = await autoSyncService.sync({ sportIds });
    const afterCount = await readApiRequestCount();
    const requestsUsed = Math.max(0, afterCount - beforeCount);

    return NextResponse.json({
      success: true,
      message: `Sync terminée : ${stats.fixturesCreated} nouveaux matchs, ${stats.fixturesFinalized} finalisés.`,
      stats: {
        fixturesProcessed: stats.fixturesCreated + stats.fixturesFinalized,
        openingsSynced: stats.openingsSynced,
        closingsSynced: stats.closingsSynced,
        settlementsApplied: stats.settlementsApplied,
        requestsUsed,
        errors: stats.errors,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function readApiRequestCount(): Promise<number> {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", SettingKey.API_REQUESTS_COUNT)
    .single();

  return parseInt(data?.value ?? "0", 10) || 0;
}
