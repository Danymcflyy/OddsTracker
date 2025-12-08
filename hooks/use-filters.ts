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
  oddsRange: { min: null, max: null, type: "opening" },
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
      params.set("countryId", filters.countryId.toString());
    }

    if (filters.leagueId) {
      params.set("leagueId", filters.leagueId.toString());
    }

    if (filters.teamSearch) {
      params.set("teamSearch", filters.teamSearch);
    }

    if (filters.marketType) {
      params.set("marketType", filters.marketType);
    }

    if (filters.oddsRange.min !== null) {
      params.set("oddsMin", filters.oddsRange.min.toString());
    }
    if (filters.oddsRange.max !== null) {
      params.set("oddsMax", filters.oddsRange.max.toString());
    }
    if (filters.oddsRange.type) {
      params.set("oddsType", filters.oddsRange.type);
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
