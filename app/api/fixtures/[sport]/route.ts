"use server";

import { NextResponse } from "next/server";

import { supabase, supabaseAdmin, isAdminAvailable } from "@/lib/db";
import type { FixtureWithEnrichedOdds } from "@/types/fixture";

const SORTABLE_COLUMNS: Record<string, string> = {
  start_time: "start_time",
  home_score: "home_score",
  away_score: "away_score",
  league: "league_id",
};

const DEFAULT_SORT = "start_time";

const MAX_PAGE_SIZE = Infinity;

export async function GET(
  request: Request,
  { params }: { params: { sport: string } }
) {
  try {
    const client = isAdminAvailable() ? supabaseAdmin : supabase;
    const sportSlug = params.sport?.toLowerCase();

    if (!sportSlug) {
      return NextResponse.json(
        { error: "Sport slug requis" },
        { status: 400 }
      );
    }

    const { data: sportRow, error: sportError } = await client
      .from("sports")
      .select("id, slug")
      .eq("slug", sportSlug)
      .single();

    if (sportError || !sportRow) {
      return NextResponse.json(
        { error: "Sport introuvable" },
        { status: 404 }
      );
    }

    const sportId = sportRow.id;

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const page = Math.max(parseIntParam(searchParams.get("page")) || 1, 1);
    const pageSize = Math.min(
      Math.max(parseIntParam(searchParams.get("pageSize")) || 25, 1),
      MAX_PAGE_SIZE
    );

    const sortByParam = searchParams.get("sortBy") || DEFAULT_SORT;
    const sortColumn = SORTABLE_COLUMNS[sortByParam] || DEFAULT_SORT;
    const sortOrder =
      searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const leagueId = parseIntParam(searchParams.get("leagueId"));
    const countryId = parseIntParam(searchParams.get("countryId"));
    const teamSearch = sanitizeLikeValue(
      searchParams.get("teamSearch")
    );
    const marketType = sanitizeLikeValue(
      searchParams.get("marketType")
    );
    const oddsMin =
      searchParams.get("oddsMin") !== null
        ? parseFloatParam(searchParams.get("oddsMin"))
        : null;
    const oddsMax =
      searchParams.get("oddsMax") !== null
        ? parseFloatParam(searchParams.get("oddsMax"))
        : null;
    const oddsType =
      searchParams.get("oddsType") === "closing" ? "closing" : "opening";

    const filters: Array<() => Promise<FixtureFilterResult>> = [];

    if (countryId && !leagueId) {
      filters.push(async () => {
        const { data, error } = await client
          .from("leagues")
          .select("id")
          .eq("country_id", countryId)
          .eq("sport_id", sportId);

        if (error) {
          throw error;
        }

        return {
          leagueIds: data?.map((league) => league.id) ?? [],
        };
      });
    }

    if (teamSearch.length >= 2) {
      filters.push(async () => {
        const { data, error } = await client
          .from("teams")
          .select("id")
          .ilike("name", `%${teamSearch}%`)
          .limit(50);

        if (error) {
          throw error;
        }

        const teamIds = data?.map((team) => team.id) ?? [];
        return { teamIds };
      });
    }

    if (marketType || oddsMin !== null || oddsMax !== null) {
      filters.push(async () => {
        let marketIds: number[] | undefined;
        if (marketType) {
          const { data: marketsData, error: marketsError } = await client
            .from("markets")
            .select("id, name, description")
            .or(
              `name.ilike.%${marketType}%,description.ilike.%${marketType}%`
            );

          if (marketsError) {
            throw marketsError;
          }

          marketIds = marketsData?.map((market) => market.id) ?? [];
          if (!marketIds.length) {
            return { fixtureIds: [] };
          }
        }

        const priceColumn =
          oddsType === "closing" ? "closing_price" : "opening_price";

        let oddsQuery = client
          .from("odds")
          .select(
            `
            fixture_id,
            ${priceColumn},
            fixtures!inner ( id, sport_id )
          `
          )
          .eq("fixtures.sport_id", sportId);

        if (marketIds && marketIds.length) {
          oddsQuery = oddsQuery.in("market_id", marketIds);
        }

        if (oddsMin !== null && !Number.isNaN(oddsMin)) {
          oddsQuery = oddsQuery.gte(priceColumn, oddsMin);
        }

        if (oddsMax !== null && !Number.isNaN(oddsMax)) {
          oddsQuery = oddsQuery.lte(priceColumn, oddsMax);
        }

        const { data: oddsData, error: oddsError } = await oddsQuery;
        if (oddsError) {
          throw oddsError;
        }

        const fixtureIds =
          oddsData?.map((row: { fixture_id: number }) => row.fixture_id) ?? [];

        return { fixtureIds: Array.from(new Set(fixtureIds)) };
      });
    }

    const filterResults = await Promise.all(filters.map((fn) => fn()));

    const combinedLeagueIds = leagueId
      ? [leagueId]
      : mergeFilterValues(filterResults, "leagueIds");
    const teamIdsFilter = mergeFilterValues(filterResults, "teamIds");
    const fixtureIdsFilter = mergeFilterValues(filterResults, "fixtureIds");

    if (
      (leagueId || countryId) &&
      combinedLeagueIds &&
      !combinedLeagueIds.length
    ) {
      return createEmptyResponse(page, pageSize);
    }

    if (teamSearch && teamIdsFilter && !teamIdsFilter.length) {
      return createEmptyResponse(page, pageSize);
    }

    if (
      (marketType || oddsMin !== null || oddsMax !== null) &&
      fixtureIdsFilter &&
      !fixtureIdsFilter.length
    ) {
      return createEmptyResponse(page, pageSize);
    }

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
      .eq("sport_id", sportId);

    if (fromDate) {
      const iso = new Date(fromDate);
      if (!Number.isNaN(iso.valueOf())) {
        query = query.gte("start_time", iso.toISOString());
      }
    }

    if (toDate) {
      const iso = new Date(toDate);
      if (!Number.isNaN(iso.valueOf())) {
        query = query.lte("start_time", iso.toISOString());
      }
    }

    if (combinedLeagueIds && combinedLeagueIds.length) {
      query = query.in("league_id", combinedLeagueIds);
    }

    if (teamIdsFilter && teamIdsFilter.length) {
      const teamList = Array.from(new Set(teamIdsFilter)).join(",");
      query = query.or(
        `home_team_id.in.(${teamList}),away_team_id.in.(${teamList})`
      );
    }

    if (fixtureIdsFilter && fixtureIdsFilter.length) {
      const fixtureList = Array.from(new Set(fixtureIdsFilter));
      query = query.in("id", fixtureList);
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
      console.error("[fixtures] Supabase error", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des fixtures" },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);

    return NextResponse.json({
      data: (data ?? []) as FixtureWithEnrichedOdds[],
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[fixtures] Unexpected error", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

function parseIntParam(value: string | null) {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseFloatParam(value: string | null) {
  if (!value) return null;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function mergeFilterValues(
  results: FixtureFilterResult[],
  key: keyof FixtureFilterResult
) {
  const collected: number[] = [];
  results.forEach((result) => {
    if (Array.isArray(result[key])) {
      collected.push(...((result[key] as number[]) ?? []));
    }
  });
  return collected.length ? collected : undefined;
}

function createEmptyResponse(page: number, pageSize: number) {
  return NextResponse.json({
    data: [],
    pagination: {
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    },
  });
}

interface FixtureFilterResult {
  leagueIds?: number[];
  teamIds?: number[];
  fixtureIds?: number[];
}

function sanitizeLikeValue(value: string | null) {
  if (!value) {
    return "";
  }
  return value.replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
}
