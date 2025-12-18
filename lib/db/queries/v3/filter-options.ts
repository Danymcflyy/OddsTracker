/**
 * Requêtes pour récupérer les options des filtres
 * Utilisé pour peupler les dropdowns dans l'UI
 */

import { supabaseAdmin } from '@/lib/db';

export interface CountryOption {
  id: string;
  name: string;
  iso_code: string;
}

export interface LeagueOption {
  id: string;
  name: string;
  display_name: string;
  country_id: string;
  country_name: string;
  tracked: boolean;
}

export interface TeamOption {
  id: string;
  display_name: string;
  normalized_name: string;
}

/**
 * Récupère tous les pays qui ont des ligues
 */
export async function getCountries(): Promise<CountryOption[]> {
  try {
    const { data: countries, error } = await supabaseAdmin
      .from('countries')
      .select(`
        id,
        name,
        iso_code
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erreur getCountries:', error);
      return [];
    }

    return (countries || []) as any[];
  } catch (error) {
    console.error('Erreur dans getCountries:', error);
    return [];
  }
}

/**
 * Récupère les ligues pour un sport
 * Optionnellement filtré par pays
 */
export async function getLeagues(
  sportSlug: string = 'football',
  countryId?: string
): Promise<LeagueOption[]> {
  try {
    const { data: sportData } = await supabaseAdmin
      .from('sports')
      .select('id')
      .eq('slug', sportSlug)
      .single();

    if (!sportData) {
      return [];
    }

    const sport = sportData as any;

    let query = supabaseAdmin
      .from('leagues')
      .select(`
        id,
        name,
        display_name,
        country_id,
        tracked,
        country:countries(name)
      `)
      .eq('sport_id', sport.id)
      .eq('active', true)
      .order('name', { ascending: true });

    if (countryId) {
      query = query.eq('country_id', countryId);
    }

    const { data: leagues, error } = await query;

    if (error) {
      console.error('Erreur getLeagues:', error);
      return [];
    }

    if (!leagues) {
      return [];
    }

    // Formater les résultats
    return leagues.map((league: any) => ({
      id: league.id,
      name: league.name,
      display_name: league.display_name,
      country_id: league.country_id,
      country_name: league.country?.name || 'Unknown',
      tracked: league.tracked,
    }));
  } catch (error) {
    console.error('Erreur dans getLeagues:', error);
    return [];
  }
}

/**
 * Récupère les ligues trackées uniquement
 */
export async function getTrackedLeagues(
  sportSlug: string = 'football'
): Promise<LeagueOption[]> {
  try {
    const allLeagues = await getLeagues(sportSlug);
    return allLeagues.filter((league) => league.tracked);
  } catch (error) {
    console.error('Erreur dans getTrackedLeagues:', error);
    return [];
  }
}

/**
 * Récupère les équipes pour un sport
 * Optionnellement filtré par ligue
 */
export async function getTeams(
  sportSlug: string = 'football',
  leagueIds?: string[]
): Promise<TeamOption[]> {
  try {
    const { data: sportData } = await supabaseAdmin
      .from('sports')
      .select('id')
      .eq('slug', sportSlug)
      .single();

    if (!sportData) {
      return [];
    }

    const sport = sportData as any;

    let query = supabaseAdmin
      .from('teams')
      .select('id, display_name, normalized_name')
      .eq('sport_id', sport.id)
      .order('display_name', { ascending: true });

    const { data: teamsData, error } = await query;

    if (error) {
      console.error('Erreur getTeams:', error);
      return [];
    }

    if (!teamsData) {
      return [];
    }

    const teams = teamsData as any[];

    // Si des ligues sont spécifiées, filtrer les équipes qui jouent dans ces ligues
    if (leagueIds && leagueIds.length > 0) {
      // Récupérer les IDs des équipes qui ont des matchs dans ces ligues
      const { data: matchTeams } = await (supabaseAdmin as any)
        .from('matches')
        .select('home_team_id, away_team_id')
        .in('league_id', leagueIds);

      if (matchTeams) {
        const teamIdsInLeagues = new Set<string>();
        matchTeams.forEach((match: any) => {
          teamIdsInLeagues.add(match.home_team_id);
          teamIdsInLeagues.add(match.away_team_id);
        });

        return teams.filter((team) => teamIdsInLeagues.has(team.id));
      }
    }

    return teams;
  } catch (error) {
    console.error('Erreur dans getTeams:', error);
    return [];
  }
}

/**
 * Récupère les marchés disponibles pour les filtres
 * (wrapper autour de fetchActiveMarkets de markets.ts)
 */
export async function getMarketOptions(
  sportSlug: string = 'football'
): Promise<Array<{ id: string; label: string; oddsapi_key: string }>> {
  try {
    const { data: sportData } = await supabaseAdmin
      .from('sports')
      .select('id')
      .eq('slug', sportSlug)
      .single();

    if (!sportData) {
      return [];
    }

    const sport = sportData as any;

    const { data: marketsData, error } = await supabaseAdmin
      .from('markets')
      .select('id, name, custom_name, oddsapi_key')
      .eq('sport_id', sport.id)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erreur getMarketOptions:', error);
      return [];
    }

    if (!marketsData) {
      return [];
    }

    const markets = marketsData as any[];

    return markets.map((market) => ({
      id: market.id,
      label: market.custom_name || market.name,
      oddsapi_key: market.oddsapi_key,
    }));
  } catch (error) {
    console.error('Erreur dans getMarketOptions:', error);
    return [];
  }
}

/**
 * Récupère les statistiques générales (pour affichage dans l'UI)
 */
export async function getStats(
  sportSlug: string = 'football'
): Promise<{
  totalMatches: number;
  upcomingMatches: number;
  trackedLeagues: number;
  totalOdds: number;
}> {
  try {
    const { data: sportData } = await supabaseAdmin
      .from('sports')
      .select('id')
      .eq('slug', sportSlug)
      .single();

    if (!sportData) {
      return {
        totalMatches: 0,
        upcomingMatches: 0,
        trackedLeagues: 0,
        totalOdds: 0,
      };
    }

    const sport = sportData as any;

    // Nombre total de matchs
    const { count: totalMatches } = await (supabaseAdmin as any)
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('sport_id', sport.id);

    // Matchs à venir
    const { count: upcomingMatches } = await (supabaseAdmin as any)
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('sport_id', sport.id)
      .eq('status', 'scheduled')
      .gte('match_date', new Date().toISOString());

    // Ligues trackées
    const { count: trackedLeagues } = await supabaseAdmin
      .from('leagues')
      .select('id', { count: 'exact', head: true })
      .eq('sport_id', sport.id)
      .eq('tracked', true);

    // Nombre total de cotes
    const { count: totalOdds } = await supabaseAdmin
      .from('odds')
      .select('id', { count: 'exact', head: true });

    return {
      totalMatches: totalMatches || 0,
      upcomingMatches: upcomingMatches || 0,
      trackedLeagues: trackedLeagues || 0,
      totalOdds: totalOdds || 0,
    };
  } catch (error) {
    console.error('Erreur dans getStats:', error);
    return {
      totalMatches: 0,
      upcomingMatches: 0,
      trackedLeagues: 0,
      totalOdds: 0,
    };
  }
}
