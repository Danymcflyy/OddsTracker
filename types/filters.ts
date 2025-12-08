export interface DateRangeFilter {
  from: Date | null;
  to: Date | null;
}

export interface OddsRangeFilter {
  min: number | null;
  max: number | null;
  type: "opening" | "closing";
}

export interface Filters {
  dateRange: DateRangeFilter;
  countryId: number | null;
  leagueId: number | null;
  teamSearch: string;
  marketType: string | null;
  oddsRange: OddsRangeFilter;
}

export interface FilterOptions {
  countries: { id: number; name: string }[];
  leagues: { id: number; name: string }[];
  marketTypes: { id: string; name: string }[];
}
