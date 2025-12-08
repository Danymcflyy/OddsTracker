import { supabase } from "../index";

export async function getLeaguesBySport(sportId: number) {
  // À implémenter
  const { data, error } = await supabase
    .from("leagues")
    .select("*")
    .eq("sport_id", sportId);

  if (error) throw error;
  return data;
}
