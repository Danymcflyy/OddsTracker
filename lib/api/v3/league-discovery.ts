/**
 * League Discovery Service
 * Découvre les ligues disponibles via Odds-API.io et les synchronise en base
 */

import { getOddsApiClient } from '@/lib/api/oddsapi/client';
import { supabaseAdmin } from '@/lib/db';
import type { OddsApiEvent } from '@/lib/api/oddsapi/types';

interface DiscoveredLeague {
  oddsapi_key: string;
  name: string;
  sport_key: string;
}

interface LeagueDiscoveryResult {
  leagues: DiscoveredLeague[];
  synced: number;
  errors: string[];
}

/**
 * Découvre toutes les ligues disponibles pour un sport donné
 * en interrogeant l'API sur une période étendue
 */
export async function discoverAvailableLeagues(
  sportKey: string = 'football'  // API Odds-API.io utilise 'football'
): Promise<LeagueDiscoveryResult> {
  const errors: string[] = [];

  try {
    const client = getOddsApiClient();

    if (!client) {
      throw new Error('Client Odds-API.io non disponible. Vérifiez ODDS_API_IO_KEY.');
    }

    // Récupérer les événements (sans filtres de date pour découvrir toutes les ligues)
    console.log(`🔍 Découverte des ligues pour ${sportKey}...`);

    const events = await client.getEvents({
      sport: sportKey,
    });

    console.log(`✅ ${events.length} événements récupérés`);

    // Extraire les ligues uniques
    const leaguesMap = new Map<string, DiscoveredLeague>();

    events.forEach((event: OddsApiEvent) => {
      if (!leaguesMap.has(event.league.slug)) {
        leaguesMap.set(event.league.slug, {
          oddsapi_key: event.league.slug,
          name: event.league.name,
          sport_key: event.sport.slug,
        });
      }
    });

    const leagues = Array.from(leaguesMap.values());
    console.log(`📊 ${leagues.length} ligues uniques découvertes`);

    return {
      leagues,
      synced: 0, // Sera mis à jour par syncLeaguesToDatabase
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Erreur lors de la découverte des ligues:', errorMessage);
    errors.push(errorMessage);

    return {
      leagues: [],
      synced: 0,
      errors,
    };
  }
}

/**
 * Synchronise les ligues découvertes dans la base de données
 * Ne modifie pas le flag 'tracked' des ligues existantes
 */
export async function syncLeaguesToDatabase(
  sportSlug: string,
  leagues: DiscoveredLeague[]
): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  let synced = 0;

  try {
    // Récupérer le sport
    const { data: sport, error: sportError } = await supabaseAdmin
      .from('sports')
      .select('id')
      .eq('slug', sportSlug)
      .single();

    if (sportError || !sport) {
      throw new Error(`Sport ${sportSlug} introuvable dans la base de données`);
    }

    console.log(`🔄 Synchronisation de ${leagues.length} ligues pour ${sportSlug}...`);

    // Synchroniser chaque ligue
    for (const league of leagues) {
      try {
        // Tenter de trouver un pays correspondant (basique)
        const countryName = extractCountryFromLeagueName(league.name);
        let countryId: string | null = null;

        if (countryName) {
          const { data: country } = await supabaseAdmin
            .from('countries')
            .select('id')
            .ilike('name', `%${countryName}%`)
            .limit(1)
            .single();

          if (country) {
            countryId = country.id;
          }
        }

        // Upsert de la ligue (préserve 'tracked' si déjà existant)
        const { error: upsertError } = await supabaseAdmin
          .from('leagues')
          .upsert(
            {
              oddsapi_key: league.oddsapi_key,
              sport_id: sport.id,
              country_id: countryId,
              name: league.name,
              display_name: league.name,
              active: true,
            },
            {
              onConflict: 'oddsapi_key',
              ignoreDuplicates: false,
            }
          );

        if (upsertError) {
          console.error(`❌ Erreur sync ligue ${league.name}:`, upsertError.message);
          errors.push(`${league.name}: ${upsertError.message}`);
        } else {
          synced++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Erreur sync ligue ${league.name}:`, errorMessage);
        errors.push(`${league.name}: ${errorMessage}`);
      }
    }

    console.log(`✅ ${synced}/${leagues.length} ligues synchronisées`);

    return { synced, errors };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Erreur lors de la synchronisation:', errorMessage);
    errors.push(errorMessage);

    return { synced, errors };
  }
}

/**
 * Helper: Extrait le nom du pays depuis le nom de la ligue
 * Exemples:
 * - "EPL - Premier League" -> "England"
 * - "Spain - La Liga" -> "Spain"
 * - "UEFA Champions League" -> "International"
 */
function extractCountryFromLeagueName(leagueName: string): string | null {
  const countryMappings: Record<string, string> = {
    'EPL': 'England',
    'Premier League': 'England',
    'Championship': 'England',
    'La Liga': 'Spain',
    'Serie A': 'Italy',
    'Bundesliga': 'Germany',
    'Ligue 1': 'France',
    'Primeira Liga': 'Portugal',
    'Eredivisie': 'Netherlands',
    'Belgian': 'Belgium',
    'Scottish': 'Scotland',
    'Turkish': 'Turkey',
    'Austrian': 'Austria',
    'Swiss': 'Switzerland',
    'Greek': 'Greece',
    'UEFA': 'International',
    'Champions League': 'International',
    'Europa League': 'International',
  };

  // Chercher une correspondance
  for (const [keyword, country] of Object.entries(countryMappings)) {
    if (leagueName.includes(keyword)) {
      return country;
    }
  }

  // Chercher pattern "Country - League"
  const match = leagueName.match(/^([A-Za-z\s]+)\s*-/);
  if (match) {
    return match[1].trim();
  }

  return null;
}

/**
 * Fonction complète : découvre ET synchronise les ligues
 */
export async function discoverAndSyncLeagues(
  sportSlug: string = 'football',
  sportKey: string = 'football'  // API Odds-API.io utilise 'football', pas 'soccer'
): Promise<LeagueDiscoveryResult> {
  console.log(`🚀 Découverte et synchronisation des ligues pour ${sportSlug}...`);

  const discoveryResult = await discoverAvailableLeagues(sportKey);

  if (discoveryResult.leagues.length === 0) {
    console.log('⚠️  Aucune ligue découverte');
    return discoveryResult;
  }

  const syncResult = await syncLeaguesToDatabase(sportSlug, discoveryResult.leagues);

  return {
    leagues: discoveryResult.leagues,
    synced: syncResult.synced,
    errors: [...discoveryResult.errors, ...syncResult.errors],
  };
}
