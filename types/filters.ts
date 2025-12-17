export interface DateRangeFilter {
  from: Date | null;
  to: Date | null;
}

export interface OddsRangeFilter {
  openingMin: number | null;
  openingMax: number | null;
  currentMin: number | null;
  currentMax: number | null;
  marketId: string | null;  // UUID du marché à filtrer (optionnel)
}

/**
 * Filtres pour la table de matchs V3
 * Utilise des UUID (string) pour country/league IDs
 */
export interface Filters {
  dateRange: DateRangeFilter;
  countryId: string | null;  // UUID
  leagueId: string | null;   // UUID
  teamSearch: string;
  marketType: string | null; // UUID du marché
  oddsRange: OddsRangeFilter;
}

/**
 * Options disponibles pour chaque filtre
 */
export interface FilterOptions {
  countries: { id: string; name: string }[];
  leagues: { id: string; name: string; countryName?: string }[];
  markets: { id: string; name: string }[];
}
