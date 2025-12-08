import { supabase } from "../index";

export async function getSetting(key: string) {
  // À implémenter
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("key", key)
    .single();

  if (error) throw error;
  return data;
}

export async function updateSetting(key: string, value: string) {
  // À implémenter
  const { data, error } = await supabase
    .from("settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key)
    .select()
    .single();

  if (error) throw error;
  return data;
}
