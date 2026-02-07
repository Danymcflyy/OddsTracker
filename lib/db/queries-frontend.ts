/**
 * Frontend Queries - The Odds API v4
 * Queries optimized for displaying data in the frontend
 */

import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSetting } from './helpers';
import type { Event, MarketState, ClosingOdds } from './types';

/**
 * Creates a fresh Supabase client for each request
 * This bypasses any potential connection/query caching in Vercel serverless
 */
function createFreshClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-request-id': `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    },
  });
}

export interface EventWithOdds extends Event {
  opening_odds: Array<{
    market_key: string;
    market_name: string;
    odds: any;
    captured_at: string | null;
  }>;
  closing_odds: {
    markets: any;
    markets_variations?: any;
    captured_at: string | null;
  } | null;
  markets_captured: number;
  markets_pending: number;
  capture_percentage: number;
  home_score: number | null;
  away_score: number | null;
  // Half-time scores - Optional
  home_score_h1?: number | null;
  away_score_h1?: number | null;
  h1_score_source?: 'none' | 'manual' | 'api';
  h1_updated_at?: string | null;
  last_snapshot_at?: string | null;
  snapshot_count?: number;
}

export interface FilterOptions {
  sports: Array<{ api_key: string; title: string }>;
  markets: Array<{ key: string; name: string }>;
}

/**
 * Fetch events with odds for table display
 * Supports both offset-based (page) and cursor-based pagination
 */
export async function fetchEventsForTable(params: {
  sportKey?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  marketKey?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  cursor?: string; // ISO timestamp for cursor-based pagination
  cursorDirection?: 'next' | 'prev';
  // Advanced filters - Separate opening/closing odds ranges
  openingOddsMin?: number;
  openingOddsMax?: number;
  closingOddsMin?: number;
  closingOddsMax?: number;
  movementDirection?: 'all' | 'up' | 'down' | 'stable';
  outcome?: string; // 'home', 'away', 'draw', 'over', 'under'
  pointValue?: number;
  dropMin?: number;
  status?: string;
  minSnapshots?: number;
  oddsFilters?: any[]; // Specific column filters
}): Promise<{ data: EventWithOdds[]; total: number; nextCursor?: string; prevCursor?: string }> {
  const {
    sportKey,
    dateFrom,
    dateTo,
    search,
    marketKey,
    page = 1,
    pageSize = 50,
    sortField = 'commence_time',
    sortDirection = 'asc',
    cursor,
    pointValue,
    openingOddsMin,
    openingOddsMax,
    closingOddsMin,
    closingOddsMax,
    movementDirection,
    outcome,
    dropMin,
    status,
    minSnapshots,
    oddsFilters
  } = params;

  // ALWAYS use RPC for reliable pagination
  // The hybrid approach has caching issues with Vercel
  const useSqlSearch = true;

  // STRATEGY A: ADVANCED SQL SEARCH (RPC)
  if (useSqlSearch) {
    try {
      // Create a fresh client for each request to avoid any Vercel caching
      const freshClient = createFreshClient();

      const rpcParams = {
        p_sport_key: sportKey || null,
        p_date_from: dateFrom || null,
        p_date_to: dateTo || null,
        p_search: search || null,
        p_market_key: marketKey && marketKey !== 'all' ? marketKey : null,
        p_opening_odds_min: openingOddsMin || null,
        p_opening_odds_max: openingOddsMax || null,
        p_closing_odds_min: closingOddsMin || null,
        p_closing_odds_max: closingOddsMax || null,
        p_movement_direction: movementDirection && movementDirection !== 'all' ? movementDirection : null,
        p_outcome: outcome && outcome !== 'all' ? outcome : null,
        p_point_value: pointValue || null,
        p_drop_min: dropMin || null,
        p_status: status && status !== 'all' ? status : null,
        p_min_snapshots: minSnapshots || null,
        p_page: page,
        p_page_size: pageSize,
        p_odds_filters: oddsFilters || null, // Pass specific column filters to RPC
      };

      const { data: rawData, error } = await (freshClient as any).rpc('search_events', rpcParams);

      if (!error) {
        // Get total count from the first row (window function result)
        const totalCount = rawData && rawData.length > 0 ? Number(rawData[0].total_count) : 0;

        // Transform RPC data for frontend
        const data: EventWithOdds[] = (rawData || []).map((event: any) => {
            const marketStates = event.market_states_json || [];
            const closingOddsData = event.closing_odds_json || null;
            const closingOdds = closingOddsData ? {
                markets: closingOddsData.markets,
                markets_variations: closingOddsData.markets_variations,
                captured_at: closingOddsData.captured_at
            } : null;
            
            const openingOddsList: any[] = [];
            marketStates.forEach((ms: any) => {
                if (ms.status === 'captured' && ms.opening_odds_variations?.length > 0) {
                    ms.opening_odds_variations.forEach((variation: any) => {
                        openingOddsList.push({
                            market_key: ms.market_key,
                            market_name: getMarketDisplayName(ms.market_key),
                            odds: variation,
                            captured_at: ms.opening_captured_at,
                        });
                    });
                } else if (ms.status === 'captured' && ms.opening_odds) {
                    openingOddsList.push({
                        market_key: ms.market_key,
                        market_name: getMarketDisplayName(ms.market_key),
                        odds: ms.opening_odds,
                        captured_at: ms.opening_captured_at,
                    });
                }
            });

            const marketsCaptured = marketStates.filter((ms: any) => ms.status === 'captured').length;
            const marketsPending = marketStates.filter((ms: any) => ms.status === 'pending').length;
            const totalMarkets = marketStates.length;
            const capturePercentage = totalMarkets > 0 ? Math.round((marketsCaptured / totalMarkets) * 100) : 0;

            return {
                id: event.id,
                api_event_id: '',
                sport_id: null,
                sport_key: event.sport_key,
                sport_title: event.sport_title,
                commence_time: event.commence_time,
                home_team: event.home_team,
                away_team: event.away_team,
                status: event.status,
                home_score: event.home_score,
                away_score: event.away_score,
                // Half-time scores
                home_score_h1: event.home_score_h1 ?? null,
                away_score_h1: event.away_score_h1 ?? null,
                h1_score_source: event.h1_score_source ?? 'none',
                h1_updated_at: event.h1_updated_at ?? null,
                completed: event.status === 'completed',
                last_api_update: null,
                created_at: '',
                updated_at: '',
                opening_odds: openingOddsList,
                closing_odds: closingOdds,
                markets_captured: marketsCaptured,
                markets_pending: marketsPending,
                capture_percentage: capturePercentage,
                last_snapshot_at: event.last_snapshot_at,
                snapshot_count: event.snapshot_count
            };
        });

        return { data, total: totalCount };
      } else {
        console.error('RPC Error, falling back to hybrid:', error);
      }
    } catch (err) {
      console.error('RPC Exception:', err);
    }
  }

  // STRATEGY B: HYBRID (Standard Query + JS Filter) - Fallback or Default
  const hasAdvancedFilters = openingOddsMin !== undefined ||
                             openingOddsMax !== undefined ||
                             closingOddsMin !== undefined ||
                             closingOddsMax !== undefined ||
                             (movementDirection && movementDirection !== 'all') ||
                             (outcome && outcome !== 'all') ||
                             pointValue !== undefined ||
                             dropMin !== undefined ||
                             (status && status !== 'all') ||
                             minSnapshots !== undefined ||
                             (marketKey && marketKey !== 'all');
  // Fetch more rows when using advanced filters to allow proper JS filtering
  const fetchLimit = hasAdvancedFilters ? 2000 : pageSize;

  // Create a fresh client for fallback too
  const fallbackClient = createFreshClient();

  try {
    // STEP 1: Fetch events first WITHOUT joins for correct pagination
    let eventsQuery = (fallbackClient as any)
      .from('events')
      .select('*', { count: 'exact' });

    // Basic SQL filters
    if (sportKey) eventsQuery = eventsQuery.eq('sport_key', sportKey);
    if (dateFrom) eventsQuery = eventsQuery.gte('commence_time', dateFrom);
    if (dateTo) eventsQuery = eventsQuery.lte('commence_time', dateTo);
    if (search) eventsQuery = eventsQuery.or(`home_team.ilike.%${search}%,away_team.ilike.%${search}%`);
    if (status && status !== 'all') eventsQuery = eventsQuery.eq('status', status);
    if (minSnapshots !== undefined) eventsQuery = eventsQuery.gte('snapshot_count', minSnapshots);

    // Sorting
    eventsQuery = eventsQuery.order(sortField as any, { ascending: sortDirection === 'asc' });

    // Pagination/Limit
    if (!cursor) {
      const from = (page - 1) * pageSize;
      const to = from + fetchLimit - 1;
      eventsQuery = eventsQuery.range(from, to);
    } else {
      eventsQuery = eventsQuery.limit(fetchLimit);
    }

    const { data: eventsData, error: eventsError, count } = await eventsQuery;

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return { data: [], total: 0, nextCursor: undefined, prevCursor: undefined };
    }

    if (!eventsData || eventsData.length === 0) {
      return { data: [], total: count || 0, nextCursor: undefined, prevCursor: undefined };
    }

    // STEP 2: Get event IDs for fetching related data
    const eventIds = eventsData.map((e: any) => e.id);

    // STEP 3: Fetch market_states for these events
    const { data: marketStatesData } = await (fallbackClient as any)
      .from('market_states')
      .select('event_id, id, market_key, status, opening_odds, opening_odds_variations, opening_captured_at')
      .in('event_id', eventIds);

    // STEP 4: Fetch closing_odds for these events
    const { data: closingOddsData } = await (fallbackClient as any)
      .from('closing_odds')
      .select('event_id, markets, markets_variations, captured_at')
      .in('event_id', eventIds);

    // Create lookup maps
    const marketStatesMap = new Map<string, any[]>();
    (marketStatesData || []).forEach((ms: any) => {
      if (!marketStatesMap.has(ms.event_id)) {
        marketStatesMap.set(ms.event_id, []);
      }
      marketStatesMap.get(ms.event_id)!.push(ms);
    });

    const closingOddsMap = new Map<string, any>();
    (closingOddsData || []).forEach((co: any) => {
      closingOddsMap.set(co.event_id, co);
    });

    // Transform data for frontend
    let data: EventWithOdds[] = eventsData.map((event: any) => {
      const marketStates = marketStatesMap.get(event.id) || [];
      const closingOddsRow = closingOddsMap.get(event.id);

      const closingOdds = closingOddsRow ? {
          markets: closingOddsRow.markets,
          markets_variations: closingOddsRow.markets_variations,
          captured_at: closingOddsRow.captured_at
      } : null;

      // Unfold opening odds variations
      const openingOddsList: any[] = [];
      marketStates.forEach((ms: any) => {
        if (ms.status === 'captured' && ms.opening_odds_variations && ms.opening_odds_variations.length > 0) {
          ms.opening_odds_variations.forEach((variation: any) => {
            openingOddsList.push({
              market_key: ms.market_key,
              market_name: getMarketDisplayName(ms.market_key),
              odds: variation,
              captured_at: ms.opening_captured_at,
            });
          });
        } else if (ms.status === 'captured' && ms.opening_odds) {
          openingOddsList.push({
            market_key: ms.market_key,
            market_name: getMarketDisplayName(ms.market_key),
            odds: ms.opening_odds,
            captured_at: ms.opening_captured_at,
          });
        }
      });

      const marketsCaptured = marketStates.filter((ms: any) => ms.status === 'captured').length;
      const marketsPending = marketStates.filter((ms: any) => ms.status === 'pending').length;
      const totalMarkets = marketStates.length;
      const capturePercentage = totalMarkets > 0 ? Math.round((marketsCaptured / totalMarkets) * 100) : 0;

      return {
        ...event,
        opening_odds: openingOddsList,
        closing_odds: closingOdds,
        markets_captured: marketsCaptured,
        markets_pending: marketsPending,
        capture_percentage: capturePercentage,
        completed: event.status === 'completed',
        api_event_id: event.api_event_id || '',
      } as EventWithOdds;
    });

    // Apply Advanced Filtering (JS Post-Fetch) with separate opening/closing odds ranges
    if (hasAdvancedFilters) {
      const hasOpeningFilter = openingOddsMin !== undefined || openingOddsMax !== undefined;
      const hasClosingFilter = closingOddsMin !== undefined || closingOddsMax !== undefined;

      data = data.filter(event => {
        // Status & Snapshots (already filtered in SQL but double check)
        if (status && status !== 'all' && event.status !== status) return false;
        if (minSnapshots !== undefined && (event.snapshot_count || 0) < minSnapshots) return false;

        // Helper: Check if opening odds match the filter
        const checkOpeningOdds = (marketOdds: any, mktKey?: string): boolean => {
          if (!marketOdds) return false;
          if (marketKey && mktKey && mktKey !== marketKey) return false;

          if (pointValue !== undefined) {
            const p = marketOdds.point ?? marketOdds.odds?.point;
            if (p !== pointValue) return false;
          }

          const oddsObj = marketOdds.odds || marketOdds;

          if (outcome && outcome !== 'all') {
            const val = oddsObj[outcome];
            if (typeof val !== 'number') return false;
            if (openingOddsMin !== undefined && val < openingOddsMin) return false;
            if (openingOddsMax !== undefined && val > openingOddsMax) return false;
            return true;
          }

          if (hasOpeningFilter) {
            const values = Object.values(oddsObj).filter(v => typeof v === 'number') as number[];
            return values.some(val => {
              if (openingOddsMin !== undefined && val < openingOddsMin) return false;
              if (openingOddsMax !== undefined && val > openingOddsMax) return false;
              return true;
            });
          }

          return true;
        };

        // Helper: Check if closing odds match the filter
        const checkClosingOdds = (marketOdds: any, mktKey?: string): boolean => {
          if (!marketOdds) return false;
          if (marketKey && mktKey && mktKey !== marketKey) return false;

          if (pointValue !== undefined) {
            const p = marketOdds.point;
            if (p !== pointValue) return false;
          }

          if (outcome && outcome !== 'all') {
            const val = marketOdds[outcome];
            if (typeof val !== 'number') return false;
            if (closingOddsMin !== undefined && val < closingOddsMin) return false;
            if (closingOddsMax !== undefined && val > closingOddsMax) return false;
            return true;
          }

          if (hasClosingFilter) {
            const values = Object.values(marketOdds).filter(v => typeof v === 'number') as number[];
            return values.some(val => {
              if (closingOddsMin !== undefined && val < closingOddsMin) return false;
              if (closingOddsMax !== undefined && val > closingOddsMax) return false;
              return true;
            });
          }

          return true;
        };

        // Check opening odds filter
        let openingMatches = !hasOpeningFilter;
        if (hasOpeningFilter) {
          openingMatches = event.opening_odds.some(m => checkOpeningOdds(m, m.market_key));
        }

        // Check closing odds filter
        let closingMatches = !hasClosingFilter;
        if (hasClosingFilter && event.closing_odds?.markets) {
          const marketEntries = Object.entries(event.closing_odds.markets);
          closingMatches = marketEntries.some(([key, mkt]) => checkClosingOdds(mkt, key));
        }

        // Both filters must match (AND logic for separate ranges)
        if (!openingMatches || !closingMatches) return false;

        // Movement Direction Filter
        if (movementDirection && movementDirection !== 'all') {
          if (!event.closing_odds?.markets) return false;

          let hasMatchingMovement = false;
          event.opening_odds.forEach(openMkt => {
            if (marketKey && openMkt.market_key !== marketKey) return;
            const closeMkt = event.closing_odds!.markets[openMkt.market_key];
            if (!closeMkt) return;

            const outcomeTypes = ['home', 'away', 'draw', 'over', 'under', 'yes', 'no'];
            outcomeTypes.forEach(o => {
              if (outcome && outcome !== 'all' && o !== outcome) return;
              const openVal = openMkt.odds?.[o];
              const closeVal = closeMkt[o];
              if (typeof openVal === 'number' && typeof closeVal === 'number' && openVal > 0) {
                const changePercent = ((closeVal - openVal) / openVal) * 100;
                if (movementDirection === 'down' && closeVal < openVal) hasMatchingMovement = true;
                if (movementDirection === 'up' && closeVal > openVal) hasMatchingMovement = true;
                if (movementDirection === 'stable' && Math.abs(changePercent) < 3) hasMatchingMovement = true;
              }
            });
          });
          if (!hasMatchingMovement) return false;
        }

        // Drop Logic
        if (dropMin !== undefined) {
          let hasDrop = false;
          if (event.closing_odds?.markets) {
            hasDrop = event.opening_odds.some(openMkt => {
              if (marketKey && openMkt.market_key !== marketKey) return false;
              const closeMkt = event.closing_odds!.markets[openMkt.market_key];
              if (!closeMkt) return false;

              const outcomeTypes = ['home', 'away', 'draw', 'over', 'under', 'yes', 'no'];
              return outcomeTypes.some(o => {
                if (outcome && outcome !== 'all' && o !== outcome) return false;
                const openVal = openMkt.odds?.[o];
                const closeVal = closeMkt[o];
                if (typeof openVal === 'number' && typeof closeVal === 'number' && openVal > 0) {
                  const drop = ((openVal - closeVal) / openVal) * 100;
                  return drop >= dropMin;
                }
                return false;
              });
            });
          }
          if (!hasDrop) return false;
        }

        // Market key filter without odds range
        if (marketKey && !hasOpeningFilter && !hasClosingFilter && !outcome && !pointValue && !dropMin) {
          const hasMarketOpening = event.opening_odds.some(m => m.market_key === marketKey);
          const hasMarketClosing = event.closing_odds?.markets?.[marketKey] !== undefined;
          if (!hasMarketOpening && !hasMarketClosing) return false;
        }

        return true;
      });
    }

    const totalCount = hasAdvancedFilters ? data.length : (count || 0);
    // Apply pagination for JS-filtered data
    const startIdx = hasAdvancedFilters ? (page - 1) * pageSize : 0;
    const endIdx = startIdx + pageSize;
    const dataPaginated = hasAdvancedFilters ? data.slice(startIdx, endIdx) : data;

    let nextCursor: string | undefined;
    let prevCursor: string | undefined;

    if (dataPaginated.length > 0 && sortField === 'commence_time') {
      const lastItem = dataPaginated[dataPaginated.length - 1];
      const firstItem = dataPaginated[0];
      nextCursor = lastItem.commence_time;
      prevCursor = firstItem.commence_time;
    }

    return {
      data: dataPaginated,
      total: totalCount,
      nextCursor,
      prevCursor,
    };
  } catch (error) {
    console.error('Error in fetchEventsForTable:', error);
    return { data: [], total: 0, nextCursor: undefined, prevCursor: undefined };
  }
}

/**
 * Get filter options for the sport
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  try {
    // Get available sports
    const { data: sports } = await (supabaseAdmin as any)
      .from('sports')
      .select('api_key, title')
      .eq('active', true)
      .order('title');

    // Get tracked markets from settings
    const { data: settings } = await (supabaseAdmin as any)
      .from('settings')
      .select('value')
      .eq('key', 'tracked_markets')
      .maybeSingle();

    const trackedMarkets = settings?.value;
    const marketsArray = Array.isArray(trackedMarkets) ? trackedMarkets : [];
    const markets = marketsArray.map((key: string) => ({
      key,
      name: getMarketDisplayName(key),
    }));

    return {
      sports: sports || [],
      markets,
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {
      sports: [],
      markets: [],
    };
  }
}

/**
 * Get market display name
 */
function getMarketDisplayName(marketKey: string): string {
  const names: Record<string, string> = {
    h2h: 'Moneyline (1X2)',
    spreads: 'Handicap',
    totals: 'Over/Under',
    h2h_h1: 'Moneyline H1',
    spreads_h1: 'Handicap H1',
    totals_h1: 'Over/Under H1',
    h2h_3_way: '3-Way Result',
    draw_no_bet: 'Draw No Bet',
    btts: 'Both Teams to Score',
    team_totals: 'Team Totals',
    team_totals_home: 'Team Totals (Home)',
    team_totals_away: 'Team Totals (Away)',
    alternate_team_totals_home: 'Alt Team Totals (Home)',
    alternate_team_totals_away: 'Alt Team Totals (Away)',
  };
  return names[marketKey] || marketKey;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(sportKey?: string) {
  try {
    // Count events
    let eventsQuery = (supabaseAdmin as any)
      .from('events')
      .select('id', { count: 'exact', head: true });

    if (sportKey) {
      eventsQuery = eventsQuery.eq('sport_key', sportKey);
    }

    const { count: eventsCount } = await eventsQuery;

    // Get last sync from API logs
    const { data: lastSync } = await (supabaseAdmin as any)
      .from('api_usage_logs')
      .select('created_at, job_name')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get API usage today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: usageToday } = await (supabaseAdmin as any)
      .from('api_usage_logs')
      .select('credits_used')
      .gte('created_at', today.toISOString());

    const creditsUsedToday = (usageToday || []).reduce(
      (sum: number, log: any) => sum + (log.credits_used || 0),
      0
    );

    return {
      eventsCount: eventsCount || 0,
      lastSync: lastSync?.created_at || null,
      lastSyncJob: lastSync?.job_name || null,
      creditsUsedToday,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      eventsCount: 0,
      lastSync: null,
      lastSyncJob: null,
      creditsUsedToday: 0,
    };
  }
}