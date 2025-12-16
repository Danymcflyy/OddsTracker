/**
 * Odds Capture Service
 * Capture les cotes opening et current pour les matchs
 *
 * Logique:
 * - Première capture: opening_odds = valeur, current_odds = valeur
 * - Captures suivantes: current_odds = nouvelle valeur (opening_odds INCHANGÉ)
 */

import { getOddsApiClient } from '@/lib/api/oddsapi/client';
import { supabaseAdmin } from '@/lib/db';
import type { OddsApiOddsResponse } from '@/lib/api/oddsapi/types';

interface OddsCaptureResult {
  matches_updated: number;
  odds_captured: number;
  errors: string[];
}

/**
 * Capture/met à jour les cotes pour les matchs à venir
 */
export async function captureOdds(
  sportSlug: string = 'football',
  limitMatches: number = 50
): Promise<OddsCaptureResult> {
  const errors: string[] = [];
  let matchesUpdated = 0;
  let oddsCaptured = 0;

  try {
    // Récupérer les matchs à traiter (status 'scheduled' = matchs à venir)
    const { data: matches, error: matchesError } = await supabaseAdmin
      .from('matches')
      .select(`
        id,
        oddsapi_id,
        sport:sports!inner(oddsapi_key),
        league:leagues!inner(oddsapi_key)
      `)
      .eq('status', 'scheduled')
      .gte('match_date', new Date().toISOString())
      .order('match_date', { ascending: true })
      .limit(limitMatches);

    if (matchesError) {
      throw new Error(`Erreur récupération matchs: ${matchesError.message}`);
    }

    if (!matches || matches.length === 0) {
      console.log('⚠️  Aucun match à traiter');
      return { matches_updated: 0, odds_captured: 0, errors };
    }

    console.log(`🎯 Capture de cotes pour ${matches.length} matchs...`);

    const client = getOddsApiClient();
    if (!client) {
      throw new Error('Client Odds-API.io non disponible');
    }

    // Récupérer les IDs des événements
    const eventIds = matches.map((m: any) => m.oddsapi_id);

    // Appel API pour récupérer les cotes de plusieurs matchs à la fois
    const oddsData = await client.getOddsMulti(eventIds, {
      markets: ['h2h', 'totals', 'spreads', 'team_totals_home', 'team_totals_away'],
    });

    // Traiter chaque réponse
    for (const oddsResponse of oddsData) {
      const match = matches.find((m: any) => m.oddsapi_id === oddsResponse.id);
      if (!match) continue;

      try {
        const result = await processOddsForMatch(match.id, oddsResponse);
        matchesUpdated++;
        oddsCaptured += result.odds_count;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Erreur match ${oddsResponse.id}:`, errorMessage);
        errors.push(`Match ${oddsResponse.id}: ${errorMessage}`);
      }
    }

    console.log(`✅ ${matchesUpdated} matchs traités, ${oddsCaptured} cotes capturées`);

    return { matches_updated: matchesUpdated, odds_captured: oddsCaptured, errors };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Erreur lors de la capture:', errorMessage);
    errors.push(errorMessage);

    return { matches_updated: matchesUpdated, odds_captured: oddsCaptured, errors };
  }
}

/**
 * Traite les cotes pour un match donné
 */
async function processOddsForMatch(
  matchId: string,
  oddsResponse: OddsApiOddsResponse
): Promise<{ odds_count: number }> {
  let oddsCount = 0;

  // Vérifier si Pinnacle a des cotes
  const pinnacleMarkets = oddsResponse.bookmakers['Pinnacle'] || oddsResponse.bookmakers['pinnacle'];

  if (!pinnacleMarkets || pinnacleMarkets.length === 0) {
    return { odds_count: 0 };
  }

  // Traiter chaque marché Pinnacle
  for (const market of pinnacleMarkets) {
    // Mapper le nom du marché ("ML" → "h2h", "Spreads" → "spreads", etc.)
    const oddsapiKey = mapMarketNameToOddsApiKey(market.name);

    const marketRecord = await getOrCreateMarket(oddsapiKey);

    if (!marketRecord) {
      console.error(`❌ Impossible de créer marché ${oddsapiKey}`);
      continue;
    }

    // Traiter chaque objet de cotes dans le marché
    for (const oddsData of market.odds) {
      const count = await upsertOddsFromData(matchId, marketRecord.id, oddsapiKey, oddsData);
      oddsCount += count;
    }
  }

  // Mettre à jour le timestamp de dernière mise à jour du match
  await supabaseAdmin
    .from('matches')
    .update({ last_updated_at: new Date().toISOString() })
    .eq('id', matchId);

  return { odds_count: oddsCount };
}

/**
 * Mappe le nom du marché de l'API vers la clé oddsapi_key
 */
function mapMarketNameToOddsApiKey(marketName: string): string {
  const mapping: Record<string, string> = {
    'ML': 'h2h',           // Money Line = 1X2
    'Spreads': 'spreads',
    'Totals': 'totals',
    'Team Totals - Home': 'team_totals_home',
    'Team Totals - Away': 'team_totals_away',
  };

  return mapping[marketName] || marketName.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Récupère ou crée un marché
 */
async function getOrCreateMarket(oddsapiKey: string): Promise<{ id: string } | null> {
  try {
    // Chercher marché existant (maybeSingle ne lance pas d'erreur si 0 résultat)
    const { data: existing, error: searchError } = await supabaseAdmin
      .from('markets')
      .select('id')
      .eq('oddsapi_key', oddsapiKey)
      .eq('period', 'fulltime')
      .maybeSingle();

    if (existing) {
      return existing;
    }

    // Si erreur de recherche (autre que "pas de résultat"), log
    if (searchError) {
      console.error(`  ⚠️  Erreur recherche marché ${oddsapiKey}:`, searchError.message);
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
      console.error(`  ❌ Erreur création marché ${oddsapiKey}:`, insertError.message);
      return null;
    }

    return created;
  } catch (error) {
    console.error(`  ❌ Erreur getOrCreateMarket ${oddsapiKey}:`, error);
    return null;
  }
}

/**
 * Traite les cotes depuis un objet OddsApiOddsData
 * Extrait toutes les cotes disponibles et les upsert
 */
async function upsertOddsFromData(
  matchId: string,
  marketId: string,
  marketKey: string,
  oddsData: any
): Promise<number> {
  let count = 0;

  // Pour les marchés h2h/ML (1X2)
  if (oddsData.home) {
    const success = await upsertSingleOdd(matchId, marketId, 'home', parseFloat(oddsData.home), null);
    if (success) count++;
  }
  if (oddsData.away) {
    const success = await upsertSingleOdd(matchId, marketId, 'away', parseFloat(oddsData.away), null);
    if (success) count++;
  }
  if (oddsData.draw) {
    const success = await upsertSingleOdd(matchId, marketId, 'draw', parseFloat(oddsData.draw), null);
    if (success) count++;
  }

  // Pour les marchés totals
  if (oddsData.over || oddsData.under) {
    // Extraire la ligne depuis le label (e.g., "2.5")
    const line = oddsData.label ? parseFloat(oddsData.label) : null;

    if (oddsData.over) {
      const success = await upsertSingleOdd(matchId, marketId, 'over', parseFloat(oddsData.over), line);
      if (success) count++;
    }
    if (oddsData.under) {
      const success = await upsertSingleOdd(matchId, marketId, 'under', parseFloat(oddsData.under), line);
      if (success) count++;
    }
  }

  // Pour les marchés spreads (handicaps)
  if (oddsData.hdp !== undefined) {
    const handicap = oddsData.hdp;

    if (oddsData.home) {
      const success = await upsertSingleOdd(matchId, marketId, 'home', parseFloat(oddsData.home), handicap);
      if (success) count++;
    }
    if (oddsData.away) {
      const success = await upsertSingleOdd(matchId, marketId, 'away', parseFloat(oddsData.away), -handicap);
      if (success) count++;
    }
  }

  return count;
}

/**
 * Crée ou met à jour une seule cote
 *
 * LOGIQUE CRITIQUE:
 * - Si la cote existe: UPDATE current_odds SEULEMENT
 * - Si la cote n'existe pas: INSERT avec opening_odds = current_odds = price
 */
async function upsertSingleOdd(
  matchId: string,
  marketId: string,
  outcomeType: string,
  price: number,
  line: number | null
): Promise<boolean> {
  try {
    const timestamp = new Date().toISOString();

    // Chercher si la cote existe déjà (maybeSingle ne lance pas d'erreur si 0 résultat)
    const { data: existing, error: searchError } = await supabaseAdmin
      .from('odds')
      .select('id, opening_odds, opening_timestamp')
      .eq('match_id', matchId)
      .eq('market_id', marketId)
      .eq('outcome_type', outcomeType)
      .eq('line', line || 0)
      .maybeSingle();

    if (existing) {
      // ✅ MISE À JOUR: On update SEULEMENT current_odds
      const { error: updateError } = await supabaseAdmin
        .from('odds')
        .update({
          current_odds: price,
          current_updated_at: timestamp,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error(`    ❌ Erreur update odd:`, updateError.message);
        return false;
      }

      return true;
    } else {
      // ✅ CRÉATION: opening_odds = current_odds = price
      const { error: insertError } = await supabaseAdmin
        .from('odds')
        .insert({
          match_id: matchId,
          market_id: marketId,
          outcome_type: outcomeType,
          line: line || 0,  // Convert null to 0 to match query logic
          opening_odds: price,
          opening_timestamp: timestamp,
          current_odds: price,
          current_updated_at: timestamp,
          bookmaker: 'Pinnacle',
        });

      if (insertError) {
        console.error(`    ❌ Erreur insert odd:`, insertError.message);
        return false;
      }

      return true;
    }
  } catch (error) {
    console.error(`    ❌ Erreur upsertOdd:`, error);
    return false;
  }
}

/**
 * Mappe une clé API vers un type de marché interne
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

/**
 * Normalise un nom d'outcome vers un type standard
 */
function normalizeOutcomeType(name: string): string {
  const mapping: Record<string, string> = {
    'Home': 'home',
    'home': 'home',
    'Away': 'away',
    'away': 'away',
    'Draw': 'draw',
    'draw': 'draw',
    'Over': 'over',
    'over': 'over',
    'Under': 'under',
    'under': 'under',
    'Yes': 'yes',
    'yes': 'yes',
    'No': 'no',
    'no': 'no',
  };

  return mapping[name] || name.toLowerCase();
}
