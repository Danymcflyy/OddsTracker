/**
 * Cache for Filter Options
 * Simple in-memory cache with TTL to avoid frequent DB queries
 */

import { getFilterOptions } from '@/lib/db/queries-frontend';
import type { FilterOptions } from '@/lib/db/queries-frontend';

interface CacheEntry {
  data: FilterOptions;
  timestamp: number;
}

// Cache TTL: 5 minutes (filter options rarely change)
const CACHE_TTL = 5 * 60 * 1000;

let cache: CacheEntry | null = null;

/**
 * Get filter options with caching
 */
export async function getCachedFilterOptions(): Promise<FilterOptions> {
  const now = Date.now();

  // Return cached data if still valid
  if (cache && (now - cache.timestamp) < CACHE_TTL) {
    console.log('[Cache] Returning cached filter options');
    return cache.data;
  }

  // Fetch fresh data
  console.log('[Cache] Fetching fresh filter options');
  const data = await getFilterOptions();

  // Update cache
  cache = {
    data,
    timestamp: now,
  };

  return data;
}

/**
 * Invalidate cache (call after settings update)
 */
export function invalidateFilterOptionsCache(): void {
  console.log('[Cache] Invalidating filter options cache');
  cache = null;
}

/**
 * Get cache status (for debugging)
 */
export function getFilterOptionsCacheStatus() {
  if (!cache) {
    return { cached: false, age: 0 };
  }

  const age = Date.now() - cache.timestamp;
  const isValid = age < CACHE_TTL;

  return {
    cached: true,
    valid: isValid,
    age,
    ttl: CACHE_TTL,
  };
}
