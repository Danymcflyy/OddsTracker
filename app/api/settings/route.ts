import { NextResponse } from "next/server";

import { supabaseAdmin, isAdminAvailable } from "@/lib/db";
import {
  DEFAULT_SETTINGS,
  SettingKey,
  settingsArrayToObject,
} from "@/types/settings";
import {
  DEFAULT_FOLLOWED_TOURNAMENTS,
  TOURNAMENT_OPTIONS_BY_SPORT,
  SPORT_LABELS,
} from "@/lib/config/tournaments";
import {
  loadFollowedTournaments,
  normalizeFollowedTournaments,
} from "@/lib/settings/followed-tournaments";
import { normalizeClosingStrategy } from "@/lib/settings/closing-strategy";
import { maskOddsApiKey } from "@/lib/settings/odds-api-key";

const DEFAULT_API_LIMIT = parseInt(process.env.ODDSPAPI_MONTHLY_LIMIT ?? "5000", 10);

export async function GET() {
  if (!isAdminAvailable()) {
    return NextResponse.json(
      { error: "Configuration Supabase incomplète" },
      { status: 500 }
    );
  }

  const { data: settingsRows, error: settingsError } = await supabaseAdmin
    .from("settings")
    .select("*");

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  const rawSettings = {
    ...DEFAULT_SETTINGS,
    ...settingsArrayToObject(settingsRows ?? []),
  };

  const followedTournaments = normalizeFollowedTournaments(rawSettings.followed_tournaments);

  const closingStrategy = normalizeClosingStrategy(rawSettings.odds_closing_strategy);
  const oddsApiKeyPreview = maskOddsApiKey(rawSettings.oddspapi_api_key);

  const { data: logs } = await supabaseAdmin
    .from("sync_logs")
    .select("id, sport_id, status, started_at, completed_at, records_fetched, records_inserted")
    .order("started_at", { ascending: false })
    .limit(10);

  const { data: sports } = await supabaseAdmin.from("sports").select("id,name");
  const sportsRows = (sports ?? []) as { id: number; name: string }[];
  const sportsMap = new Map(sportsRows.map((sport) => [sport.id, sport.name]));

  const logRows =
    (logs ?? []) as Array<{
      id: number;
      started_at: string | null;
      completed_at?: string | null;
      sport_id: number | null;
      status: string;
      records_fetched: number | null;
      records_inserted: number | null;
    }>;

  const syncLogs = logRows.map((log) => ({
    id: log.id,
    date: log.started_at,
    sport: sportsMap.get(log.sport_id ?? 0) ?? "Sport inconnu",
    status: log.status,
    details: `${log.records_fetched ?? 0} fixtures • ${log.records_inserted ?? 0} cotes`,
  }));

  return NextResponse.json({
    lastSync: rawSettings.last_sync,
    autoSyncEnabled: rawSettings.auto_sync_enabled,
    autoSyncTime: rawSettings.auto_sync_time,
    extraSyncEnabled: rawSettings.extra_sync_enabled,
    extraSyncTime: rawSettings.extra_sync_time,
    closingStrategy,
    apiUsage: {
      used: rawSettings.api_requests_count,
      limit: DEFAULT_API_LIMIT,
      resetDate: rawSettings.api_requests_reset_date,
    },
    syncLogs,
    tournaments: {
      available: TOURNAMENT_OPTIONS_BY_SPORT,
      labels: SPORT_LABELS,
    },
    followedTournaments,
    oddsApiKeyPreview,
  });
}

export async function POST(request: Request) {
  if (!isAdminAvailable()) {
    return NextResponse.json(
      { error: "Configuration Supabase incomplète" },
      { status: 500 }
    );
  }

  const body = await request.json();

  const updates: { key: SettingKey; value: string }[] = [];

  if (typeof body.autoSyncEnabled === "boolean") {
    updates.push({
      key: SettingKey.AUTO_SYNC_ENABLED,
      value: String(body.autoSyncEnabled),
    });
  }
  if (typeof body.autoSyncTime === "string") {
    updates.push({
      key: SettingKey.AUTO_SYNC_TIME,
      value: body.autoSyncTime,
    });
  }
  if (typeof body.extraSyncEnabled === "boolean") {
    updates.push({
      key: SettingKey.EXTRA_SYNC_ENABLED,
      value: String(body.extraSyncEnabled),
    });
  }
  if (typeof body.extraSyncTime === "string") {
    updates.push({
      key: SettingKey.EXTRA_SYNC_TIME,
      value: body.extraSyncTime,
    });
  }
  if (body.followedTournaments) {
    const sanitized = normalizeFollowedTournaments(body.followedTournaments);
    updates.push({
      key: SettingKey.FOLLOWED_TOURNAMENTS,
      value: JSON.stringify(sanitized),
    });
  }
  if (typeof body.closingStrategy === "string") {
    const normalized = normalizeClosingStrategy(body.closingStrategy);
    updates.push({
      key: SettingKey.ODDS_CLOSING_STRATEGY,
      value: normalized,
    });
  }
  if ("oddsApiKey" in body) {
    updates.push({
      key: SettingKey.ODDSPAPI_API_KEY,
      value: (body.oddsApiKey ?? "").trim(),
    });
  }

  if (!updates.length) {
    return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
  }

  const { error } = await (supabaseAdmin as any)
    .from("settings")
    .upsert(
      updates.map((entry) => ({
        key: entry.key,
        value: entry.value,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
