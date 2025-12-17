"use client";

import * as React from "react";
import { formatISO } from "date-fns";
import type { Filters } from "@/types/filters";

const STORAGE_KEY = "oddstracker_filters";

const DEFAULT_FILTERS: Filters = {
  dateRange: { from: null, to: null },
  countryId: null,
  leagueId: null,
  teamSearch: "",
  marketType: null,
  oddsRange: {
    openingMin: null,
    openingMax: null,
    currentMin: null,
    currentMax: null,
    marketId: null
  },
};

interface UseFiltersOptions {
  sportSlug?: string;
  persist?: boolean;
  initialFilters?: Partial<Filters>;
}

type FiltersState = Filters;

export function useFilters(options: UseFiltersOptions = {}) {
  const { sportSlug = "football", persist = true, initialFilters } = options;
  const storageKey = `${STORAGE_KEY}_${sportSlug}`;

  const [filters, setFilters] = React.useState<FiltersState>(() => ({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  }));
  const hasLoadedFromStorage = React.useRef(false);

  React.useEffect(() => {
    if (!persist || typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Filters;
        setFilters({ ...DEFAULT_FILTERS, ...parsed, ...initialFilters });
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    hasLoadedFromStorage.current = true;
  }, [initialFilters, persist, storageKey]);

  React.useEffect(() => {
    if (!persist || typeof window === "undefined" || !hasLoadedFromStorage.current) {
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(filters));
  }, [filters, persist, storageKey]);

  const updateFilter = React.useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = React.useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
  }, [initialFilters]);

  const buildQueryParams = React.useCallback(() => {
    const params = new URLSearchParams();

    if (filters.dateRange.from) {
      params.set("from", formatISO(filters.dateRange.from, { representation: "date" }));
    }
    if (filters.dateRange.to) {
      params.set("to", formatISO(filters.dateRange.to, { representation: "date" }));
    }

    if (filters.countryId) {
      params.set("countryId", filters.countryId); // UUID est déjà string
    }

    if (filters.leagueId) {
      params.set("leagueId", filters.leagueId); // UUID est déjà string
    }

    if (filters.teamSearch) {
      params.set("teamSearch", filters.teamSearch);
    }

    if (filters.marketType) {
      params.set("marketType", filters.marketType);
    }

    if (filters.oddsRange.openingMin !== null) {
      params.set("oddsOpeningMin", filters.oddsRange.openingMin.toString());
    }
    if (filters.oddsRange.openingMax !== null) {
      params.set("oddsOpeningMax", filters.oddsRange.openingMax.toString());
    }
    if (filters.oddsRange.currentMin !== null) {
      params.set("oddsCurrentMin", filters.oddsRange.currentMin.toString());
    }
    if (filters.oddsRange.currentMax !== null) {
      params.set("oddsCurrentMax", filters.oddsRange.currentMax.toString());
    }
    if (filters.oddsRange.marketId) {
      params.set("oddsMarketId", filters.oddsRange.marketId);
    }

    return params;
  }, [filters]);

  const buildQueryString = React.useCallback(() => buildQueryParams().toString(), [buildQueryParams]);

  return {
    filters,
    updateFilter,
    resetFilters,
    buildQueryParams,
    buildQueryString,
  };
}
