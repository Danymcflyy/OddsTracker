import { supabase } from "../index";

export async function getSetting(key: string) {
  const client = supabase as any;
  const { data, error } = await client
    .from("settings")
    .select("*")
    .eq("key", key)
    .single();

  if (error) throw error;
  return data;
}

export async function updateSetting(key: string, value: string) {
  const client = supabase as any;
  const { data, error } = await client
    .from("settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key)
    .select()
    .single();

  if (error) throw error;
  return data;
}
