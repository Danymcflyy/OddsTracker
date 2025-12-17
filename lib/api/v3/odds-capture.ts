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
  limitMatches: number | null = null
): Promise<OddsCaptureResult> {
  const errors: string[] = [];
  let matchesUpdated = 0;
  let oddsCaptured = 0;

  try {
    // Récupérer les matchs à traiter (status 'scheduled' = matchs à venir)
    let query = supabaseAdmin
      .from('matches')
      .select(`
        id,
        oddsapi_id,
        sport:sports!inner(oddsapi_key),
        league:leagues!inner(oddsapi_key, tracked)
      `)
      .eq('status', 'scheduled')
      .eq('league.tracked', true)
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
    // Note: On exclut les corners (corners_totals, corners_spread, etc.)
    const oddsData = await client.getOddsMulti(eventIds, {
      markets: ['h2h', 'totals', 'spreads', 'team_totals_home', 'team_totals_away', 'btts'],
    });

    // Traiter chaque réponse
    console.log(`\n💾 Traitement et stockage des cotes...`);
    for (let i = 0; i < oddsData.length; i++) {
      const oddsResponse = oddsData[i];
      console.log(`  💾 [${i + 1}/${oddsData.length}] Traitement match ${oddsResponse.id}...`);

      const match = matches.find((m: any) => m.oddsapi_id === oddsResponse.id);
      if (!match) {
        console.log(`  ⚠️  [${i + 1}/${oddsData.length}] Match non trouvé, skip`);
        continue;
      }

      try {
        const result = await processOddsForMatch(match.id, oddsResponse);
        matchesUpdated++;
        oddsCaptured += result.odds_count;
        console.log(`  ✅ [${i + 1}/${oddsData.length}] ${result.odds_count} cotes stockées`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`  ❌ [${i + 1}/${oddsData.length}] Erreur match ${oddsResponse.id}:`, errorMessage);
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
 * OPTIMISÉ: Utilise des batch inserts/updates au lieu de requêtes individuelles
 */
async function processOddsForMatch(
  matchId: string,
  oddsResponse: OddsApiOddsResponse
): Promise<{ odds_count: number }> {
  console.log(`    🔍 Vérification bookmakers...`);
  // Vérifier si Pinnacle a des cotes
  const pinnacleMarkets = oddsResponse.bookmakers['Pinnacle'] || oddsResponse.bookmakers['pinnacle'];

  if (!pinnacleMarkets || pinnacleMarkets.length === 0) {
    console.log(`    ⚠️  Aucune cote Pinnacle trouvée`);
    return { odds_count: 0 };
  }

  console.log(`    📊 ${pinnacleMarkets.length} marchés Pinnacle trouvés`);

  // ÉTAPE 1: Collecter toutes les cotes dans un array
  const allOddsToInsert: any[] = [];
  const timestamp = new Date().toISOString();

  for (const market of pinnacleMarkets) {
    const oddsapiKey = mapMarketNameToOddsApiKey(market.name);
    const marketRecord = await getOrCreateMarket(oddsapiKey);

    if (!marketRecord) {
      console.error(`    ❌ Impossible de créer marché ${oddsapiKey}`);
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

  // Dédupliquer les cotes (au cas où l'API retourne des duplicatas)
  const uniqueOddsMap = new Map<string, any>();
  for (const odd of allOddsToInsert) {
    const key = `${odd.match_id}:${odd.market_id}:${odd.outcome_type}:${odd.line || 0}`;
    if (!uniqueOddsMap.has(key)) {
      uniqueOddsMap.set(key, odd);
    }
  }
  const uniqueOdds = Array.from(uniqueOddsMap.values());

  console.log(`    💾 Stockage batch de ${uniqueOdds.length} cotes...`);

  // ÉTAPE 2: Récupérer toutes les cotes existantes pour ce match EN UN SEUL APPEL
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
    } else {
      console.error(`    ❌ Erreur bulk insert:`, insertError.message);
    }
  }

  // ÉTAPE 5: Bulk UPDATE des cotes existantes (seulement current_odds)
  if (oddsToUpdate.length > 0) {
    // Supabase ne supporte pas vraiment les bulk updates, donc on fait un update par cote existante
    // MAIS c'est quand même beaucoup plus rapide que l'ancien système car on évite les SELECTs
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

  console.log(`    ✅ ${insertedCount} nouvelles cotes, ${updatedCount} mises à jour`);

  // Mettre à jour le timestamp du match
  await supabaseAdmin
    .from('matches')
    .update({ last_updated_at: timestamp })
    .eq('id', matchId);

  return { odds_count: insertedCount + updatedCount };
}

/**
 * Mappe le nom du marché de l'API vers la clé oddsapi_key
 */
function mapMarketNameToOddsApiKey(marketName: string): string {
  const mapping: Record<string, string> = {
    'ML': 'h2h',                      // Money Line = 1X2
    'Spread': 'spread',               // Asian Handicap (singulier, pas spreads!)
    'Spread HT': 'spread_ht',         // Asian Handicap HT
    'Totals': 'totals',               // Total Goals
    'Totals HT': 'totals_ht',         // Total Goals HT
    'Team Total Home': 'team_total_home',   // Team Totals Home (singulier!)
    'Team Total Away': 'team_total_away',   // Team Totals Away (singulier!)
    'BTTS': 'btts',                   // Both Teams To Score
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
 * Extrait les cotes depuis un objet OddsApiOddsData
 * OPTIMISÉ: Retourne un array au lieu de faire des DB calls
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
