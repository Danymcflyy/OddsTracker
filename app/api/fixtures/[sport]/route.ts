"use server";

import { NextResponse } from "next/server";

import { supabase, supabaseAdmin, isAdminAvailable } from "@/lib/db";
import { normalizeMarketKey, normalizeOutcomeName } from "@/lib/api/oddsapi/normalizer";
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
      .from("sports_v2")
      .select("id, slug")
      .eq("slug", sportSlug)
      .single();

    if (sportError || !sportRow) {
      return NextResponse.json(
        { error: "Sport introuvable" },
        { status: 404 }
      );
    }

    const sportId = (sportRow as { id: string }).id;

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
          .from("leagues_v2")
          .select("id")
          .eq("country_id", countryId)
          .eq("sport_id", sportId);

        if (error) {
          throw error;
        }

        const leagueRows = (data ?? []) as { id: string }[];
        return {
          leagueIds: leagueRows.map((league) => league.id),
        };
      });
    }

    if (teamSearch.length >= 2) {
      filters.push(async () => {
        const { data, error } = await client
          .from("teams_v2")
          .select("id")
          .ilike("name", `%${teamSearch}%`)
          .limit(50);

        if (error) {
          throw error;
        }

        const teamRows = (data ?? []) as { id: string }[];
        const teamIds = teamRows.map((team) => team.id);
        return { teamIds };
      });
    }

    if (marketType || oddsMin !== null || oddsMax !== null) {
      filters.push(async () => {
        let marketIds: string[] | undefined;
        if (marketType) {
          const { data: marketsData, error: marketsError } = await client
            .from("markets_v2")
            .select("id, name, description")
            .or(
              `name.ilike.%${marketType}%,description.ilike.%${marketType}%`
            );

          if (marketsError) {
            throw marketsError;
          }

          const marketRows = (marketsData ?? []) as { id: string }[];
          marketIds = marketRows.map((market) => market.id);
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
            ${priceColumn}
          `
          );

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

    // Requête simplifiée: on charge les fixtures sans les relations (qui ne fonctionnent pas sur les vues)
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
        status
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

    // Charger les données manquantes (leagues, teams, odds) manuellement
    const fixtures = (data ?? []) as any[];

    // Fetch all unique league IDs
    const leagueIds = [...new Set(fixtures.map(f => f.league_id).filter(Boolean))];
    const leagueMap = new Map();
    const countryMap = new Map();
    if (leagueIds.length > 0) {
      const { data: leagues } = await client
        .from("leagues_v2")
        .select("id, name, country_id")
        .in("id", leagueIds);

      if (leagues) {
        leagues.forEach(l => leagueMap.set(l.id, l));

        // Fetch countries for these leagues
        const countryIds = [...new Set(
          (leagues as any[])
            .map(l => l.country_id)
            .filter(Boolean)
        )];

        if (countryIds.length > 0) {
          const { data: countries } = await client
            .from("countries_v2")
            .select("id, name")
            .in("id", countryIds);

          if (countries) {
            countries.forEach(c => countryMap.set(c.id, c));
          }
        }
      }
    }

    // Fetch all unique team IDs
    const teamIds = [...new Set(
      fixtures
        .flatMap(f => [f.home_team_id, f.away_team_id])
        .filter(Boolean)
    )];
    const teamMap = new Map();
    if (teamIds.length > 0) {
      const { data: teams } = await client
        .from("teams_v2")
        .select("id, display_name, normalized_name")
        .in("id", teamIds);

      if (teams) {
        teams.forEach(t => teamMap.set(t.id, t));
      }
    }

    // Fetch all odds for these fixtures
    const fixtureIds = fixtures.map(f => f.id).filter(Boolean);
    const oddsMap = new Map();
    if (fixtureIds.length > 0) {
      const { data: odds } = await client
        .from("opening_closing_observed")
        .select("*")
        .in("event_id", fixtureIds);

      if (odds && odds.length > 0) {
        // Fetch all markets_v2 for enrichment
        const { data: marketsV2 } = await client
          .from("markets_v2")
          .select("*");

        const marketsByKey = new Map();
        const marketsByKeyAndHandicap = new Map();
        if (marketsV2) {
          (marketsV2 as any[]).forEach(m => {
            // Use oddsapi_key as the primary key for backwards compatibility
            marketsByKey.set(m.oddsapi_key, m);
            // Also store by key + handicap for precise matching
            const handicapKey = m.handicap !== null && m.handicap !== undefined
              ? `${m.oddsapi_key}:${m.handicap}`
              : m.oddsapi_key;
            marketsByKeyAndHandicap.set(handicapKey, m);
          });
        }

        (odds as any[]).forEach(odd => {
          if (!oddsMap.has(odd.event_id)) {
            oddsMap.set(odd.event_id, []);
          }

          // Normalize market name to match oddsapi_key (e.g., "ML" -> "h2h", "Spread" -> "spreads")
          const normalizedMarketKey = normalizeMarketKey(odd.market_name);

          // Find matching market (from markets_v2)
          // Try first with handicap key (for spreads/totals with specific line values)
          const handicapKey = odd.line !== null && odd.line !== undefined
            ? `${normalizedMarketKey}:${odd.line}`
            : normalizedMarketKey;
          const market = marketsByKeyAndHandicap.get(handicapKey) || marketsByKey.get(normalizedMarketKey);

          // Normalize outcome name (e.g., "home" -> "1", "over" -> "OVER")
          const normalizedOutcomeName = normalizeOutcomeName(odd.selection);

          // Create enriched odd structure that matches OddWithDetails
          const enrichedOdd: any = {
            id: odd.id,
            fixture_id: odd.event_id, // Map event_id to fixture_id for API compatibility
            opening_price: odd.opening_price_observed,
            closing_price: odd.closing_price_observed,
            opening_timestamp: odd.opening_time_observed,
            closing_timestamp: odd.closing_time_observed,
            is_winner: odd.is_winner,
            market_id: market?.id || null,
            outcome_id: null,
            // Add line value for handicap/totals
            line: odd.line,
            // Add enriched market object
            market: market ? {
              id: market.id,
              oddspapi_id: null,
              name: market.oddsapi_key,
              description: market.market_type || null,
              handicap: market.handicap,  // Include handicap in market object
              period: market.period,      // Include period for HT markets
            } : null,
            // Add enriched outcome object with normalized name (e.g., "home" -> "1", "over" -> "OVER")
            outcome: {
              id: null,
              oddspapi_id: null,
              market_id: market?.id || null,
              name: normalizedOutcomeName,
              description: odd.selection,
            },
          };

          oddsMap.get(odd.event_id).push(enrichedOdd);
        });
      }
    }

    // Enrich fixtures with loaded data
    const fixturesWithRelations = fixtures.map((fixture: any) => {
      const league = leagueMap.get(fixture.league_id);
      const country = league ? countryMap.get(league.country_id) : null;
      const homeTeam = teamMap.get(fixture.home_team_id);
      const awayTeam = teamMap.get(fixture.away_team_id);
      const odds = oddsMap.get(fixture.id) || [];

      return {
        ...fixture,
        league: league ? {
          id: league.id,
          name: league.name,
          country_id: league.country_id,
          country: country ? { id: country.id, name: country.name } : null,
        } : null,
        home_team: homeTeam ? { id: homeTeam.id, name: homeTeam.display_name || homeTeam.normalized_name } : null,
        away_team: awayTeam ? { id: awayTeam.id, name: awayTeam.display_name || awayTeam.normalized_name } : null,
        odds: odds
      };
    });

    return NextResponse.json({
      data: fixturesWithRelations as FixtureWithEnrichedOdds[],
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
  const collected: (string | number)[] = [];
  results.forEach((result) => {
    if (Array.isArray(result[key])) {
      collected.push(...((result[key] as (string | number)[]) ?? []));
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
  leagueIds?: string[];
  teamIds?: string[];
  fixtureIds?: number[];
}

function sanitizeLikeValue(value: string | null) {
  if (!value) {
    return "";
  }
  return value.replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
}
