/**
 * Requêtes pour récupérer les matchs avec tous leurs détails
 * Utilisé par l'UI pour afficher le tableau principal
 */

import { supabaseAdmin } from '@/lib/db';

export interface TableFilters {
  dateFrom?: Date;
  dateTo?: Date;
  countryIds?: string[];
  leagueIds?: string[];
  teamIds?: string[];
  teamSearch?: string;
  marketIds?: string[];
  oddsOpeningMin?: number;
  oddsOpeningMax?: number;
  oddsCurrentMin?: number;
  oddsCurrentMax?: number;
  oddsMarketId?: string;
}

export interface MatchWithDetails {
  id: string;
  oddsapi_id: number;
  match_date: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  league: {
    id: string;
    name: string;
    display_name: string;
    country: {
      id: string;
      name: string;
      iso_code: string;
    };
  };
  home_team: {
    id: string;
    display_name: string;
  };
  away_team: {
    id: string;
    display_name: string;
  };
  odds: Array<{
    id: string;
    outcome_type: string;
    line: number;
    opening_odds: number;
    opening_timestamp: string;
    current_odds: number;
    current_updated_at: string;
    is_winner: boolean | null;
    bookmaker: string;
    market: {
      id: string;
      oddsapi_key: string;
      market_type: string;
      name: string;
      custom_name: string | null;
      period: string;
    };
  }>;
}

/**
 * Récupère les matchs avec tous leurs détails pour le tableau UI
 */
export async function fetchMatchesForTable(
  sportSlug: string = 'football',
  filters: TableFilters = {},
  pagination: { page: number; pageSize: number } = { page: 1, pageSize: 50 },
  sorting: { field: string; direction: 'asc' | 'desc' } = { field: 'match_date', direction: 'asc' }
): Promise<{ data: MatchWithDetails[]; total: number }> {
  try {
    // Construction de la requête de base
    let query = supabaseAdmin
      .from('matches')
      .select(`
        id,
        oddsapi_id,
        match_date,
        status,
        home_score,
        away_score,
        league:leagues!inner(
          id,
          name,
          display_name,
          country:countries(
            id,
            name,
            iso_code
          )
        ),
        home_team:teams!matches_home_team_id_fkey(
          id,
          display_name
        ),
        away_team:teams!matches_away_team_id_fkey(
          id,
          display_name
        ),
        odds(
          id,
          outcome_type,
          line,
          opening_odds,
          opening_timestamp,
          current_odds,
          current_updated_at,
          is_winner,
          bookmaker,
          market:markets(
            id,
            oddsapi_key,
            market_type,
            name,
            custom_name,
            period
          )
        )
      `, { count: 'exact' });

    // Filtrer par sport
    const { data: sport } = await supabaseAdmin
      .from('sports')
      .select('id')
      .eq('slug', sportSlug)
      .single();

    if (sport) {
      query = query.eq('sport_id', sport.id);
    }

    // Appliquer les filtres
    if (filters.dateFrom) {
      query = query.gte('match_date', filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      query = query.lte('match_date', filters.dateTo.toISOString());
    }
    if (filters.leagueIds && filters.leagueIds.length > 0) {
      query = query.in('league_id', filters.leagueIds);
    }
    // Note: Les filtres par pays, équipe, marché, cotes nécessitent un post-traitement
    // car ils touchent des tables liées (via JOIN)

    // Tri
    const ascending = sorting.direction === 'asc';
    query = query.order(sorting.field, { ascending });

    // Pagination
    const { page, pageSize } = pagination;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: matches, error, count } = await query;

    if (error) {
      console.error('Erreur fetchMatchesForTable:', error);
      throw error;
    }

    if (!matches) {
      return { data: [], total: 0 };
    }

    // Post-filtrage pour les filtres complexes
    let filteredMatches = matches as any[];

    // Filtre par pays (via league.country)
    if (filters.countryIds && filters.countryIds.length > 0) {
      filteredMatches = filteredMatches.filter((m) =>
        filters.countryIds!.includes(m.league?.country?.id)
      );
    }

    // Filtre par équipe (home OU away par ID)
    if (filters.teamIds && filters.teamIds.length > 0) {
      filteredMatches = filteredMatches.filter((m) =>
        filters.teamIds!.includes(m.home_team?.id) ||
        filters.teamIds!.includes(m.away_team?.id)
      );
    }

    // Filtre par recherche textuelle d'équipe
    if (filters.teamSearch && filters.teamSearch.trim() !== '') {
      const searchLower = filters.teamSearch.toLowerCase().trim();
      filteredMatches = filteredMatches.filter((m) => {
        const homeName = m.home_team?.display_name?.toLowerCase() || '';
        const awayName = m.away_team?.display_name?.toLowerCase() || '';
        return homeName.includes(searchLower) || awayName.includes(searchLower);
      });
    }

    // Filtre par marché
    if (filters.marketIds && filters.marketIds.length > 0) {
      filteredMatches = filteredMatches.filter((m) =>
        m.odds?.some((o: any) => filters.marketIds!.includes(o.market?.id))
      );
    }

    // Filtre par cotes (opening et/ou current)
    const hasOpeningFilter = filters.oddsOpeningMin !== undefined || filters.oddsOpeningMax !== undefined;
    const hasCurrentFilter = filters.oddsCurrentMin !== undefined || filters.oddsCurrentMax !== undefined;
    const hasMarketFilter = filters.oddsMarketId !== undefined;

    if (hasOpeningFilter || hasCurrentFilter || hasMarketFilter) {
      filteredMatches = filteredMatches.filter((m) => {
        // Au moins une cote doit satisfaire TOUS les critères définis
        return m.odds?.some((o: any) => {
          // Filtre par marché si spécifié
          if (hasMarketFilter && o.market?.id !== filters.oddsMarketId) {
            return false;
          }

          // Filtre par opening odds si spécifié
          if (hasOpeningFilter) {
            const openingOdds = o.opening_odds;
            if (filters.oddsOpeningMin !== undefined && openingOdds < filters.oddsOpeningMin) {
              return false;
            }
            if (filters.oddsOpeningMax !== undefined && openingOdds > filters.oddsOpeningMax) {
              return false;
            }
          }

          // Filtre par current odds si spécifié
          if (hasCurrentFilter) {
            const currentOdds = o.current_odds;
            if (filters.oddsCurrentMin !== undefined && currentOdds < filters.oddsCurrentMin) {
              return false;
            }
            if (filters.oddsCurrentMax !== undefined && currentOdds > filters.oddsCurrentMax) {
              return false;
            }
          }

          return true;
        });
      });
    }

    return {
      data: filteredMatches as MatchWithDetails[],
      total: count || filteredMatches.length,
    };
  } catch (error) {
    console.error('Erreur dans fetchMatchesForTable:', error);
    throw error;
  }
}

/**
 * Récupère un match par son ID avec tous ses détails
 */
export async function fetchMatchById(matchId: string): Promise<MatchWithDetails | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('matches')
      .select(`
        id,
        oddsapi_id,
        match_date,
        status,
        home_score,
        away_score,
        league:leagues(
          id,
          name,
          display_name,
          country:countries(
            id,
            name,
            iso_code
          )
        ),
        home_team:teams!matches_home_team_id_fkey(
          id,
          display_name
        ),
        away_team:teams!matches_away_team_id_fkey(
          id,
          display_name
        ),
        odds(
          id,
          outcome_type,
          line,
          opening_odds,
          opening_timestamp,
          current_odds,
          current_updated_at,
          is_winner,
          bookmaker,
          market:markets(
            id,
            oddsapi_key,
            market_type,
            name,
            custom_name,
            period
          )
        )
      `)
      .eq('id', matchId)
      .single();

    if (error) {
      console.error('Erreur fetchMatchById:', error);
      return null;
    }

    return data as MatchWithDetails;
  } catch (error) {
    console.error('Erreur dans fetchMatchById:', error);
    return null;
  }
}
