import { supabaseAdmin } from "@/lib/db";
import {
  DEFAULT_FOLLOWED_TOURNAMENTS,
  TOURNAMENT_OPTIONS_BY_SPORT,
  type FollowedTournamentsMap,
} from "@/lib/config/tournaments";
import { SettingKey } from "@/types/settings";

export function normalizeFollowedTournaments(
  raw: string | FollowedTournamentsMap | null | undefined
): FollowedTournamentsMap {
  let parsed: unknown = raw;

  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  const map: FollowedTournamentsMap =
    parsed && typeof parsed === "object" ? (parsed as FollowedTournamentsMap) : {};

  const result: FollowedTournamentsMap = {};

  Object.entries(TOURNAMENT_OPTIONS_BY_SPORT).forEach(([sportId, options]) => {
    const allowed = new Set(options.map((option) => option.tournamentId));
    const selected = Array.from(new Set(map[sportId] ?? []))
      .filter((id) => allowed.has(id))
      .sort((a, b) => a - b);

    if (selected.length) {
      result[sportId] = selected;
    } else if (DEFAULT_FOLLOWED_TOURNAMENTS[sportId]?.length) {
      result[sportId] = DEFAULT_FOLLOWED_TOURNAMENTS[sportId];
    }
  });

  return Object.keys(result).length ? result : { ...DEFAULT_FOLLOWED_TOURNAMENTS };
}

export async function loadFollowedTournaments(): Promise<FollowedTournamentsMap> {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", SettingKey.FOLLOWED_TOURNAMENTS)
    .single();

  return normalizeFollowedTournaments(data?.value);
}
