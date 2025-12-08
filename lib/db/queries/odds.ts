"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { OddWithDetails } from "@/types/fixture";

import { supabase, supabaseAdmin, isAdminAvailable } from "../index";

export interface OddsFilters {
  fixtureIds: number[];
  marketIds?: number[];
  minPrice?: number | null;
  maxPrice?: number | null;
  priceType?: "opening" | "closing";
}

export async function getOddsByFixture(fixtureId: number) {
  const client = getServerClient();
  const { data, error } = await client
    .from("odds")
    .select(
      `
        id,
        fixture_id,
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
      `
    )
    .eq("fixture_id", fixtureId);

  if (error) {
    throw error;
  }

  return (data ?? []) as OddWithDetails[];
}

export async function getOddsWithFilters(filters: OddsFilters) {
  const client = getServerClient();
  const priceColumn =
    filters.priceType === "closing" ? "closing_price" : "opening_price";

  let query = client
    .from("odds")
    .select(
      `
        fixture_id,
        market_id,
        outcome_id,
        ${priceColumn},
        market:markets (
          id,
          name,
          description
        )
      `
    )
    .in("fixture_id", filters.fixtureIds);

  if (filters.marketIds && filters.marketIds.length) {
    query = query.in("market_id", filters.marketIds);
  }

  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    query = query.gte(priceColumn, filters.minPrice);
  }

  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    query = query.lte(priceColumn, filters.maxPrice);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data ?? [];
}

function getServerClient(): SupabaseClient<Database> {
  return isAdminAvailable() ? supabaseAdmin : supabase;
}
