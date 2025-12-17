/**
 * Odds Capture Service - Per League (V2)
 * Capture les cotes pour UNE ligue spécifique
 * Conçu pour exécution parallèle
 *
 * Logique:
 * - Première capture: opening_odds = valeur, current_odds = valeur
 * - Captures suivantes: current_odds = nouvelle valeur (opening_odds INCHANGÉ)
 */

import { getOddsApiClient } from '@/lib/api/oddsapi/client';
import { supabaseAdmin } from '@/lib/db';
import type { OddsApiOddsResponse } from '@/lib/api/oddsapi/types';

export interface LeagueOddsCaptureResult {
  league_id: string;
  league_name: string;
  matches_updated: number;
  odds_captured: number;
  errors: string[];
  duration_ms: number;
  success: boolean;
}

/**
 * Capture/met à jour les cotes pour les matchs d'une ligue spécifique
 */
export async function captureOddsForLeague(
  leagueId: string,
  leagueName: string,
  limitMatches: number | null = null
): Promise<LeagueOddsCaptureResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let matchesUpdated = 0;
  let oddsCaptured = 0;

  try {
    // Récupérer les matchs à traiter pour cette ligue uniquement
    let query = supabaseAdmin
      .from('matches')
      .select(`
        id,
        oddsapi_id,
        sport:sports!inner(oddsapi_key),
        league:leagues!inner(oddsapi_key)
      `)
      .eq('league_id', leagueId)  // ← Filtre par ligue spécifique
      .eq('status', 'scheduled')
      .gte('match_date', new Date().toISOString())
      .order('match_date', { ascending: true });

    // Appliquer la limite seulement si spécifiée
    if (limitMatches !== null) {
      query = query.limit(limitMatches);
    }

    const { data: matches, error: matchesError } = await query;

    if (matchesError) {
      throw new Error(`Erreur récupération matchs: ${matchesError.message}`);
    }

    if (!matches || matches.length === 0) {
      return {
        league_id: leagueId,
        league_name: leagueName,
        matches_updated: 0,
        odds_captured: 0,
        errors,
        duration_ms: Date.now() - startTime,
        success: true
      };
    }

    console.log(`  🎯 [${leagueName}] ${matches.length} matchs à traiter`);

    const client = getOddsApiClient();
    if (!client) {
      throw new Error('Client Odds-API.io non disponible');
    }

    // Récupérer les IDs des événements
    const eventIds = matches.map((m: any) => m.oddsapi_id);

    // Appel API pour récupérer les cotes de plusieurs matchs à la fois
    const oddsData = await client.getOddsMulti(eventIds, {
      markets: ['h2h', 'totals', 'spreads', 'team_totals_home', 'team_totals_away', 'btts'],
    });

    // Traiter chaque réponse
    for (const oddsResponse of oddsData) {
      const match = matches.find((m: any) => m.oddsapi_id === oddsResponse.id);
      if (!match) {
        continue;
      }

      try {
        const result = await processOddsForMatch(match.id, oddsResponse);
        matchesUpdated++;
        oddsCaptured += result.odds_count;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Match ${oddsResponse.id}: ${errorMessage}`);
      }
    }

    return {
      league_id: leagueId,
      league_name: leagueName,
      matches_updated: matchesUpdated,
      odds_captured: oddsCaptured,
      errors,
      duration_ms: Date.now() - startTime,
      success: errors.length === 0
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`League odds capture failed: ${errorMessage}`);

    return {
      league_id: leagueId,
      league_name: leagueName,
      matches_updated: matchesUpdated,
      odds_captured: oddsCaptured,
      errors,
      duration_ms: Date.now() - startTime,
      success: false
    };
  }
}

/**
 * Traite les cotes pour un match donné
 * (Réutilisé de V1 avec optimisations batch)
 */
async function processOddsForMatch(
  matchId: string,
  oddsResponse: OddsApiOddsResponse
): Promise<{ odds_count: number }> {
  // Vérifier si Pinnacle a des cotes
  const pinnacleMarkets = oddsResponse.bookmakers['Pinnacle'] || oddsResponse.bookmakers['pinnacle'];

  if (!pinnacleMarkets || pinnacleMarkets.length === 0) {
    return { odds_count: 0 };
  }

  // ÉTAPE 1: Collecter toutes les cotes dans un array
  const allOddsToInsert: any[] = [];
  const timestamp = new Date().toISOString();

  for (const market of pinnacleMarkets) {
    const oddsapiKey = mapMarketNameToOddsApiKey(market.name);
    const marketRecord = await getOrCreateMarket(oddsapiKey);

    if (!marketRecord) {
      continue;
    }

    // Pour chaque objet de cotes dans le marché
    for (const oddsData of market.odds) {
      const odds = extractOddsFromData(matchId, marketRecord.id, oddsData);
      allOddsToInsert.push(...odds);
    }
  }

  if (allOddsToInsert.length === 0) {
    return { odds_count: 0 };
  }

  // Dédupliquer les cotes
  const uniqueOddsMap = new Map<string, any>();
  for (const odd of allOddsToInsert) {
    const key = `${odd.match_id}:${odd.market_id}:${odd.outcome_type}:${odd.line || 0}`;
    if (!uniqueOddsMap.has(key)) {
      uniqueOddsMap.set(key, odd);
    }
  }
  const uniqueOdds = Array.from(uniqueOddsMap.values());

  // ÉTAPE 2: Récupérer toutes les cotes existantes pour ce match
  const { data: existingOdds } = await supabaseAdmin
    .from('odds')
    .select('id, match_id, market_id, outcome_type, line')
    .eq('match_id', matchId);

  // Créer une clé unique pour identifier les cotes
  const existingKeys = new Set(
    (existingOdds || []).map(odd =>
      `${odd.market_id}:${odd.outcome_type}:${odd.line || 0}`
    )
  );

  // ÉTAPE 3: Séparer nouvelles cotes vs cotes à mettre à jour
  const newOdds = uniqueOdds.filter(odd =>
    !existingKeys.has(`${odd.market_id}:${odd.outcome_type}:${odd.line || 0}`)
  );

  const oddsToUpdate = uniqueOdds.filter(odd =>
    existingKeys.has(`${odd.market_id}:${odd.outcome_type}:${odd.line || 0}`)
  );

  let insertedCount = 0;
  let updatedCount = 0;

  // ÉTAPE 4: Bulk INSERT des nouvelles cotes
  if (newOdds.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from('odds')
      .insert(newOdds.map(odd => ({
        match_id: odd.match_id,
        market_id: odd.market_id,
        outcome_type: odd.outcome_type,
        line: odd.line || 0,
        opening_odds: odd.price,
        opening_timestamp: timestamp,
        current_odds: odd.price,
        current_updated_at: timestamp,
        bookmaker: 'Pinnacle',
      })));

    if (!insertError) {
      insertedCount = newOdds.length;
    }
  }

  // ÉTAPE 5: UPDATE des cotes existantes (seulement current_odds)
  if (oddsToUpdate.length > 0) {
    for (const odd of oddsToUpdate) {
      await supabaseAdmin
        .from('odds')
        .update({
          current_odds: odd.price,
          current_updated_at: timestamp,
        })
        .eq('match_id', odd.match_id)
        .eq('market_id', odd.market_id)
        .eq('outcome_type', odd.outcome_type)
        .eq('line', odd.line || 0);
    }
    updatedCount = oddsToUpdate.length;
  }

  // Mettre à jour le timestamp du match
  await supabaseAdmin
    .from('matches')
    .update({ last_updated_at: timestamp })
    .eq('id', matchId);

  return { odds_count: insertedCount + updatedCount };
}

/**
 * Mappe le nom du marché de l'API vers la clé oddsapi_key
 * (Réutilisé de V1)
 */
function mapMarketNameToOddsApiKey(marketName: string): string {
  const mapping: Record<string, string> = {
    'ML': 'h2h',
    'Spread': 'spread',
    'Spread HT': 'spread_ht',
    'Totals': 'totals',
    'Totals HT': 'totals_ht',
    'Team Total Home': 'team_total_home',
    'Team Total Away': 'team_total_away',
    'BTTS': 'btts',
  };

  return mapping[marketName] || marketName.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Récupère ou crée un marché
 * (Réutilisé de V1)
 */
async function getOrCreateMarket(oddsapiKey: string): Promise<{ id: string } | null> {
  try {
    // Chercher marché existant
    const { data: existing } = await supabaseAdmin
      .from('markets')
      .select('id')
      .eq('oddsapi_key', oddsapiKey)
      .eq('period', 'fulltime')
      .maybeSingle();

    if (existing) {
      return existing;
    }

    // Créer dynamiquement le marché
    const marketType = mapOddsApiKeyToMarketType(oddsapiKey);

    const { data: sport } = await supabaseAdmin
      .from('sports')
      .select('id')
      .eq('slug', 'football')
      .single();

    if (!sport) {
      return null;
    }

    const { data: created, error: insertError } = await supabaseAdmin
      .from('markets')
      .insert({
        sport_id: sport.id,
        oddsapi_key: oddsapiKey,
        market_type: marketType,
        name: formatMarketName(oddsapiKey),
        period: 'fulltime',
        active: true,
      })
      .select('id')
      .single();

    if (insertError) {
      return null;
    }

    return created;
  } catch (error) {
    return null;
  }
}

/**
 * Extrait les cotes depuis un objet OddsApiOddsData
 * (Réutilisé de V1)
 */
function extractOddsFromData(
  matchId: string,
  marketId: string,
  oddsData: any
): Array<{ match_id: string; market_id: string; outcome_type: string; price: number; line: number | null }> {
  const odds: Array<{ match_id: string; market_id: string; outcome_type: string; price: number; line: number | null }> = [];

  // Pour les marchés h2h/ML (1X2)
  if (oddsData.home) {
    odds.push({ match_id: matchId, market_id: marketId, outcome_type: 'home', price: parseFloat(oddsData.home), line: null });
  }
  if (oddsData.away) {
    odds.push({ match_id: matchId, market_id: marketId, outcome_type: 'away', price: parseFloat(oddsData.away), line: null });
  }
  if (oddsData.draw) {
    odds.push({ match_id: matchId, market_id: marketId, outcome_type: 'draw', price: parseFloat(oddsData.draw), line: null });
  }

  // Pour les marchés totals et team_totals
  if (oddsData.over || oddsData.under) {
    const line = oddsData.hdp !== undefined ? parseFloat(oddsData.hdp) : null;

    if (oddsData.over) {
      odds.push({ match_id: matchId, market_id: marketId, outcome_type: 'over', price: parseFloat(oddsData.over), line });
    }
    if (oddsData.under) {
      odds.push({ match_id: matchId, market_id: marketId, outcome_type: 'under', price: parseFloat(oddsData.under), line });
    }
  }

  // Pour les marchés spreads (handicaps)
  if (oddsData.hdp !== undefined && (oddsData.home || oddsData.away)) {
    const handicap = parseFloat(oddsData.hdp);

    if (oddsData.home) {
      odds.push({ match_id: matchId, market_id: marketId, outcome_type: 'home', price: parseFloat(oddsData.home), line: handicap });
    }
    if (oddsData.away) {
      odds.push({ match_id: matchId, market_id: marketId, outcome_type: 'away', price: parseFloat(oddsData.away), line: -handicap });
    }
  }

  return odds;
}

/**
 * Mappe une clé API vers un type de marché interne
 * (Réutilisé de V1)
 */
function mapOddsApiKeyToMarketType(key: string): string {
  const mapping: Record<string, string> = {
    'h2h': '1x2',
    'totals': 'totals',
    'spreads': 'spreads',
    'btts': 'btts',
    'team_totals_home': 'team_totals',
    'team_totals_away': 'team_totals',
  };

  return mapping[key] || key;
}

/**
 * Formate le nom d'affichage d'un marché
 * (Réutilisé de V1)
 */
function formatMarketName(key: string): string {
  const names: Record<string, string> = {
    'h2h': 'Match Result (1X2)',
    'totals': 'Total Goals',
    'spreads': 'Asian Handicap',
    'btts': 'Both Teams To Score',
    'team_totals_home': 'Home Team Total Goals',
    'team_totals_away': 'Away Team Total Goals',
  };

  return names[key] || key;
}
