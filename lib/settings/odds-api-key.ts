import { supabaseAdmin } from "@/lib/db";
import { SettingKey } from "@/types/settings";

export async function loadOddsApiKey(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", SettingKey.ODDSPAPI_API_KEY)
    .single();

  const row = data as { value: string | null } | null;
  return row?.value ?? null;
}

export function maskOddsApiKey(value?: string | null) {
  if (!value) return null;
  if (value.length <= 4) {
    return "•".repeat(value.length);
  }
  const last4 = value.slice(-4);
  return `••••${last4}`;
}
