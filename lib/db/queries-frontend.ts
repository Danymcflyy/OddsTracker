/**
 * Frontend Queries - The Odds API v4
 * Queries optimized for displaying data in the frontend
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSetting } from './helpers';
import type { Event, MarketState, ClosingOdds } from './types';

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
  last_snapshot_at?: string | null; // NEW
  snapshot_count?: number; // NEW
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
  // Advanced filters
  oddsMin?: number;
  oddsMax?: number;
  oddsType?: 'opening' | 'closing' | 'both';
  outcome?: string; // 'home', 'away', 'draw', 'over', 'under'
  pointValue?: number;
  dropMin?: number;
  status?: string;
  minSnapshots?: number;
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
    oddsMin,
    oddsMax,
    outcome,
    dropMin,
    status,
    minSnapshots
  } = params;

  // Check feature flag for SQL Search
  const useSqlSearch = await getSetting('use_sql_search');

  // STRATEGY A: ADVANCED SQL SEARCH (RPC)
  if (useSqlSearch) {
    try {
      const rpcParams = {
        p_sport_key: sportKey || null,
        p_date_from: dateFrom || null,
        p_date_to: dateTo || null,
        p_search: search || null,
        p_market_key: marketKey && marketKey !== 'all' ? marketKey : null,
        p_odds_min: oddsMin || null,
        p_odds_max: oddsMax || null,
        p_odds_type: params.oddsType && params.oddsType !== 'both' ? params.oddsType : null,
        p_outcome: outcome && outcome !== 'all' ? outcome : null,
        p_point_value: pointValue || null,
        p_drop_min: dropMin || null,
        p_status: status && status !== 'all' ? status : null,
        p_min_snapshots: minSnapshots || null,
        p_page: page,
        p_page_size: pageSize,
      };

      const { data: rawData, error } = await (supabaseAdmin as any).rpc('search_events', rpcParams);

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
  const hasAdvancedFilters = oddsMin !== undefined ||
                             oddsMax !== undefined ||
                             (outcome && outcome !== 'all') ||
                             pointValue !== undefined ||
                             dropMin !== undefined ||
                             (status && status !== 'all') ||
                             minSnapshots !== undefined ||
                             (marketKey && marketKey !== 'all');
  // Fetch more rows when using advanced filters to allow proper JS filtering
  const fetchLimit = hasAdvancedFilters ? 2000 : pageSize;

  try {
    // Build query
    let query = (supabaseAdmin as any)
      .from('events')
      .select(`
        *,
        market_states!left(
          id,
          market_key,
          status,
          opening_odds,
          opening_odds_variations,
          opening_captured_at
        ),
        closing_odds!left(
          markets,
          markets_variations,
          captured_at
        )
      `, { count: 'exact' });

    // Basic SQL filters
    if (sportKey) query = query.eq('sport_key', sportKey);
    if (dateFrom) query = query.gte('commence_time', dateFrom);
    if (dateTo) query = query.lte('commence_time', dateTo);
    if (search) query = query.or(`home_team.ilike.%${search}%,away_team.ilike.%${search}%`);
    // Note: marketKey filter is applied in JS post-fetch for better accuracy
    // Simple SQL filters for new params
    if (status && status !== 'all') query = query.eq('status', status);
    if (minSnapshots !== undefined) query = query.gte('snapshot_count', minSnapshots);

    // Sorting
    query = query.order(sortField as any, { ascending: sortDirection === 'asc' });

    // Pagination/Limit
    if (!cursor) {
      const from = (page - 1) * pageSize;
      const to = from + fetchLimit - 1;
      query = query.range(from, to);
    } else {
      query = query.limit(fetchLimit);
    }

    const { data: rawData, error, count } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return { data: [], total: 0, nextCursor: undefined, prevCursor: undefined };
    }

    // Transform data for frontend
    let data: EventWithOdds[] = (rawData || []).map((event: any) => {
      const marketStates = event.market_states || [];
      const closingOddsData = Array.isArray(event.closing_odds) ? event.closing_odds[0] : event.closing_odds;
      
      const closingOdds = closingOddsData ? {
          markets: closingOddsData.markets,
          markets_variations: closingOddsData.markets_variations,
          captured_at: closingOddsData.captured_at
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

    // Apply Advanced Filtering (JS Post-Fetch)
    if (hasAdvancedFilters) {
      // Get oddsType from params (it was destructured but we reference it here for clarity)
      const effectiveOddsType = params.oddsType;

      data = data.filter(event => {
        // Status & Snapshots (already filtered in SQL but double check)
        if (status && status !== 'all' && event.status !== status) return false;
        if (minSnapshots !== undefined && (event.snapshot_count || 0) < minSnapshots) return false;

        // Helper: Check if a market matches the filters
        const checkMarket = (marketOdds: any, mktKey?: string) => {
          if (!marketOdds) return false;

          // Market Key filter
          if (marketKey && mktKey && mktKey !== marketKey) return false;

          // Point Check
          if (pointValue !== undefined) {
             const p = marketOdds.point ?? marketOdds.odds?.point;
             if (p !== pointValue) return false;
          }

          // Get odds object (handle both opening_odds structure and closing_odds structure)
          const oddsObj = marketOdds.odds || marketOdds;

          // Outcome specific filter
          if (outcome && outcome !== 'all') {
             const val = oddsObj[outcome];
             if (val === undefined || val === null) return false;
             if (typeof val !== 'number') return false;
             if (oddsMin !== undefined && val < oddsMin) return false;
             if (oddsMax !== undefined && val > oddsMax) return false;
             return true;
          }

          // Any numeric value check (no specific outcome)
          if (oddsMin !== undefined || oddsMax !== undefined) {
            const values = Object.values(oddsObj).filter(v => typeof v === 'number') as number[];
            return values.some(val => {
              if (oddsMin !== undefined && val < oddsMin) return false;
              if (oddsMax !== undefined && val > oddsMax) return false;
              return true;
            });
          }

          return true;
        };

        // Check opening odds
        let hasOpening = false;
        if (!effectiveOddsType || effectiveOddsType === 'opening' || effectiveOddsType === 'both') {
          hasOpening = event.opening_odds.some(m => checkMarket(m, m.market_key));
        }

        // Check closing odds
        let hasClosing = false;
        if (!effectiveOddsType || effectiveOddsType === 'closing' || effectiveOddsType === 'both') {
          if (event.closing_odds && event.closing_odds.markets) {
            const marketEntries = Object.entries(event.closing_odds.markets);
            hasClosing = marketEntries.some(([key, mkt]) => checkMarket(mkt, key));
          }
        }

        // Drop Logic - only applies when dropMin is set
        if (dropMin !== undefined) {
          let hasDrop = false;
          if (event.closing_odds && event.closing_odds.markets) {
            hasDrop = event.opening_odds.some(openMkt => {
              // Market key filter for drop
              if (marketKey && openMkt.market_key !== marketKey) return false;

              const closeMkt = event.closing_odds!.markets[openMkt.market_key];
              if (!closeMkt) return false;

              // Check all outcome types for drops
              const outcomeTypes = ['home', 'away', 'draw', 'over', 'under', 'yes', 'no'];
              return outcomeTypes.some(o => {
                // Filter by specific outcome if set
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

        // Odds range filter logic - at least one odds type must match
        if (oddsMin !== undefined || oddsMax !== undefined || (outcome && outcome !== 'all') || pointValue !== undefined) {
          if (effectiveOddsType === 'opening' && !hasOpening) return false;
          if (effectiveOddsType === 'closing' && !hasClosing) return false;
          if ((!effectiveOddsType || effectiveOddsType === 'both') && !hasOpening && !hasClosing) return false;
        }

        // Market key filter without odds range - check if event has this market
        if (marketKey && !oddsMin && !oddsMax && !outcome && !pointValue && !dropMin) {
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
      .single();

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