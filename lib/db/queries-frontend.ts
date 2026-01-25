/**
 * Frontend Queries - The Odds API v4
 * Queries optimized for displaying data in the frontend
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
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
    cursorDirection,
    oddsMin,
    oddsMax,
    oddsType,
    outcome,
    pointValue,
  } = params;

  const hasAdvancedFilters = oddsMin !== undefined || oddsMax !== undefined || outcome || pointValue !== undefined;
  
  // If advanced filters are active, we need to fetch more data to filter in memory
  // This is a trade-off until we implement full JSON filtering in SQL
  const fetchLimit = hasAdvancedFilters ? 500 : pageSize;

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

    // ... (filters) ...

    // Pagination
    if (!cursor) {
      const from = (page - 1) * pageSize;
      // If filtering, fetch a larger batch starting from offset
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

    // Transform data
    let data: EventWithOdds[] = (rawData || []).map((event: any) => {
        // ... (transformation logic is same) ...
        const marketStates = event.market_states || [];
        const closingOdds = Array.isArray(event.closing_odds) ? event.closing_odds[0] || null : event.closing_odds || null;
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
        };
    });

    // Apply Advanced Filtering (Post-Fetch)
    if (hasAdvancedFilters) {
      data = data.filter(event => {
        // ... (same filtering logic as before) ...
        // Check Opening Odds
        const hasMatchingOpening = event.opening_odds.some(market => {
          if (pointValue !== undefined && market.odds.point !== pointValue) return false;
          
          const oddsValues = Object.values(market.odds).filter(v => typeof v === 'number') as number[];
          
          if (outcome && outcome !== 'all') {
             const specificOdd = market.odds[outcome];
             if (!specificOdd) return false;
             if (oddsMin !== undefined && specificOdd < oddsMin) return false;
             if (oddsMax !== undefined && specificOdd > oddsMax) return false;
             return true;
          }

          return oddsValues.some(val => {
            if (oddsMin !== undefined && val < oddsMin) return false;
            if (oddsMax !== undefined && val > oddsMax) return false;
            return true;
          });
        });

        // Check Closing Odds
        let hasMatchingClosing = false;
        if (event.closing_odds && event.closing_odds.markets) {
           const closingMarkets = Object.values(event.closing_odds.markets) as any[];
           hasMatchingClosing = closingMarkets.some(market => {
             if (pointValue !== undefined && market.point !== pointValue) return false;
             const oddsValues = Object.values(market).filter(v => typeof v === 'number') as number[];

             if (outcome && outcome !== 'all') {
                const specificOdd = market[outcome];
                if (!specificOdd) return false;
                if (oddsMin !== undefined && specificOdd < oddsMin) return false;
                if (oddsMax !== undefined && specificOdd > oddsMax) return false;
                return true;
             }

             return oddsValues.some(val => {
               if (oddsMin !== undefined && val < oddsMin) return false;
               if (oddsMax !== undefined && val > oddsMax) return false;
               return true;
             });
           });
        }

        if (oddsType === 'opening') return hasMatchingOpening;
        if (oddsType === 'closing') return hasMatchingClosing;
        return hasMatchingOpening || hasMatchingClosing;
      });
    }

    // Limit result to requested page size if we fetched more
    const totalFiltered = hasAdvancedFilters ? data.length : (count || 0); // Approx total if filtered
    const dataPaginated = hasAdvancedFilters ? data.slice(0, pageSize) : data;

    // Calculate cursors
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
      total: totalFiltered,
      nextCursor,
      prevCursor,
    };
  } catch (error) {
    console.error('Error in fetchEventsForTable:', error);
    return { data: [], total: 0, nextCursor: undefined, prevCursor: undefined };
  }
}  } catch (error) {
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
