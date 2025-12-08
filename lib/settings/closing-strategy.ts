import { supabaseAdmin } from "@/lib/db";
import {
  DEFAULT_CLOSING_STRATEGY,
  SettingKey,
  type OddsClosingStrategy,
} from "@/types/settings";

export function normalizeClosingStrategy(value?: string | null): OddsClosingStrategy {
  return value === "tournament" ? "tournament" : DEFAULT_CLOSING_STRATEGY;
}

export async function loadClosingStrategy(): Promise<OddsClosingStrategy> {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", SettingKey.ODDS_CLOSING_STRATEGY)
    .single();

  const row = data as { value: string | null } | null;
  return normalizeClosingStrategy(row?.value);
}
