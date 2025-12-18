"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FixtureWithEnrichedOdds } from "@/types/fixture";

import { supabase, supabaseAdmin, isAdminAvailable } from "../index";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export interface FixtureFilters {
  sportId: number;
  fromDate?: string | Date | null;
  toDate?: string | Date | null;
  leagueIds?: number[] | null;
  teamIds?: number[] | null;
  fixtureIds?: number[] | null;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FixtureQueryResult {
  data: FixtureWithEnrichedOdds[];
  total: number;
}

/**
 * Récupère les fixtures d'un sport avec toutes les jointures nécessaires (ligue, pays, équipes, cotes).
 * Conçu pour être réutilisé par les endpoints API ou les services côté serveur.
 */
export async function fetchFixturesWithRelations(filters: FixtureFilters): Promise<FixtureQueryResult> {
  const client = getServerClient();
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.min(Math.max(filters.pageSize ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const sortColumn = getSortColumn(filters.sortBy);
  const sortOrder = filters.sortOrder === "asc" ? "asc" : "desc";

  let query = client
    .from("fixtures")
    .select(
      `
        id,
        oddspapi_id,
        sport_id,
        league_id,
        home_team_id,
        away_team_id,
        start_time,
        home_score,
        away_score,
        status,
        league:leagues (
          id,
          name,
          country:countries (
            id,
            name
          )
        ),
        home_team:teams!fixtures_home_team_id_fkey (
          id,
          name
        ),
        away_team:teams!fixtures_away_team_id_fkey (
          id,
          name
        ),
        odds:odds (
          id,
          market_id,
          outcome_id,
          opening_price,
          closing_price,
          opening_timestamp,
          closing_timestamp,
          is_winner,
          market:markets (
            id,
            name,
            description
          ),
          outcome:outcomes (
            id,
            name,
            description
          )
        )
      `,
      { count: "exact" }
    )
    .eq("sport_id", filters.sportId);

  if (filters.fromDate) {
    const iso = toISOString(filters.fromDate);
    if (iso) {
      query = query.gte("start_time", iso);
    }
  }

  if (filters.toDate) {
    const iso = toISOString(filters.toDate);
    if (iso) {
      query = query.lte("start_time", iso);
    }
  }

  if (filters.leagueIds && filters.leagueIds.length) {
    query = query.in("league_id", filters.leagueIds);
  }

  if (filters.teamIds && filters.teamIds.length) {
    const ids = Array.from(new Set(filters.teamIds));
    const formattedIds = ids.join(",");
    query = query.or(
      `home_team_id.in.(${formattedIds}),away_team_id.in.(${formattedIds})`
    );
  }

  if (filters.fixtureIds && filters.fixtureIds.length) {
    query = query.in("id", Array.from(new Set(filters.fixtureIds)));
  }

  const rangeStart = (page - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;

  const { data, error, count } = await query
    .order(sortColumn, {
      ascending: sortOrder === "asc",
      nullsFirst: sortColumn === "start_time" && sortOrder === "asc",
    })
    .range(rangeStart, rangeEnd);

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []) as unknown as FixtureWithEnrichedOdds[],
    total: count ?? 0,
  };
}

export async function getFixtureById(id: number) {
  const client = getServerClient();
  const { data, error } = await client
    .from("fixtures")
    .select(
      `
        id,
        oddspapi_id,
        sport_id,
        league_id,
        home_team_id,
        away_team_id,
        start_time,
        home_score,
        away_score,
        status,
        league:leagues (
          id,
          name
        )
      `
    )
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

function getServerClient(): SupabaseClient<any> {
  return isAdminAvailable() ? supabaseAdmin : supabase;
}

function toISOString(value: string | Date | null | undefined) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.valueOf()) ? null : value.toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString();
}

function getSortColumn(sortBy?: string) {
  switch (sortBy) {
    case "home_score":
      return "home_score";
    case "away_score":
      return "away_score";
    case "league":
      return "league_id";
    case "start_time":
    default:
      return "start_time";
  }
}
