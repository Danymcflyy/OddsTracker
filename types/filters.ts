import { Database } from "./supabase";

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
  countryId: Database['public']['Tables']['countries_v2']['Row']['id'] | null;
  leagueId: Database['public']['Tables']['leagues_v2']['Row']['id'] | null;
  teamSearch: string;
  marketType: string | null;
  oddsRange: OddsRangeFilter;
}

export interface FilterOptions {
  countries: { id: Database['public']['Tables']['countries_v2']['Row']['id']; name: string }[];
  leagues: { id: Database['public']['Tables']['leagues_v2']['Row']['id']; name: string }[];
  marketTypes: { id: string; name: string }[];
}
