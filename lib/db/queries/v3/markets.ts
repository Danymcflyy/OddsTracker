/**
 * Requêtes pour récupérer les marchés
 * Utilisé par l'UI pour générer les colonnes dynamiques et les filtres
 */

import { supabaseAdmin } from '@/lib/db';

export interface MarketWithOutcomes {
  id: string;
  oddsapi_key: string;
  market_type: string;
  name: string;
  custom_name: string | null;
  period: string;
  active: boolean;
  // Outcomes possibles (déduits du market_type)
  outcomes: string[];
  // Lines possibles (pour totals/spreads)
  lines?: number[];
}

/**
 * Récupère les marchés actifs pour un sport
 * Avec leurs outcomes possibles et custom_name si défini
 */
export async function fetchActiveMarkets(
  sportSlug: string = 'football'
): Promise<MarketWithOutcomes[]> {
  try {
    const { data: sport } = await supabaseAdmin
      .from('sports')
      .select('id')
      .eq('slug', sportSlug)
      .single();

    if (!sport) {
      return [];
    }

    const { data: markets, error } = await supabaseAdmin
      .from('markets')
      .select('*')
      .eq('sport_id', sport.id)
      .eq('active', true)
      .order('oddsapi_key', { ascending: true });

    if (error) {
      console.error('Erreur fetchActiveMarkets:', error);
      return [];
    }

    if (!markets) {
      return [];
    }

    // Filtrer les doublons (ex: spread vs spreads, team_total vs team_totals)
    const uniqueMarkets = markets.filter((market) => {
      // Exclure les doublons (on garde les noms singuliers qui ont les cotes)
      const excludedKeys = [
        'spreads',          // Doublon de 'spread' (vide)
        'team_totals_home', // Doublon de 'team_total_home' (vide)
        'team_totals_away', // Doublon de 'team_total_away' (vide)
      ];
      return !excludedKeys.includes(market.oddsapi_key);
    });

    // Enrichir chaque marché avec ses outcomes possibles ET ses lignes réelles
    const enrichedMarkets: MarketWithOutcomes[] = await Promise.all(
      uniqueMarkets.map(async (market) => {
        const outcomes = getOutcomesForMarket(market.market_type);

        // Charger les lignes uniques pour ce marché depuis la DB
        const lines = await fetchLinesForMarket(market.id);

        return {
          ...market,
          outcomes,
          lines,
        };
      })
    );

    // Trier dans un ordre logique (1X2 en premier, puis populaires)
    const orderPriority: Record<string, number> = {
      'h2h': 1,                    // 1X2 (Match Result)
      'totals': 2,                 // Total Goals
      'spreads': 3,                // Asian Handicap
      'btts': 4,                   // Both Teams To Score
      'team_totals_home': 5,       // Team Totals Home
      'team_totals_away': 6,       // Team Totals Away
      'corners_totals': 7,         // Corners Totals
      'corners_spread': 8,         // Corners Spread
      'corners_totals_ht': 9,      // Corners HT
      'corners_spread_ht': 10,     // Corners Spread HT
    };

    enrichedMarkets.sort((a, b) => {
      const priorityA = orderPriority[a.oddsapi_key] || 99;
      const priorityB = orderPriority[b.oddsapi_key] || 99;

      // Sous-tri par period (fulltime avant halftime)
      if (priorityA === priorityB) {
        if (a.period === 'fulltime' && b.period === 'halftime') return -1;
        if (a.period === 'halftime' && b.period === 'fulltime') return 1;
      }

      return priorityA - priorityB;
    });

    return enrichedMarkets;
  } catch (error) {
    console.error('Erreur dans fetchActiveMarkets:', error);
    return [];
  }
}

/**
 * Détermine les outcomes possibles pour un type de marché
 */
function getOutcomesForMarket(marketType: string): string[] {
  const outcomeMap: Record<string, string[]> = {
    'h2h': ['home', 'draw', 'away'],
    '1x2': ['home', 'draw', 'away'],
    'totals': ['over', 'under'],
    'totals_ht': ['over', 'under'],
    'spreads': ['home', 'away'],
    'spread': ['home', 'away'],
    'spread_ht': ['home', 'away'],
    'team_totals': ['over', 'under'],
    'team_totals_home': ['over', 'under'],
    'team_totals_away': ['over', 'under'],
    'team_total_home': ['over', 'under'],
    'team_total_away': ['over', 'under'],
    'corners_totals': ['over', 'under'],
    'corners_totals_ht': ['over', 'under'],
    'corners_spread': ['home', 'away'],
    'corners_spread_ht': ['home', 'away'],
    'btts': ['yes', 'no'],
    'double_chance': ['home_draw', 'home_away', 'draw_away'],
  };

  return outcomeMap[marketType] || [];
}

/**
 * Récupère TOUTES les lignes disponibles pour un marché donné
 * Retourne toutes les lignes uniques trouvées dans la DB, triées par valeur
 * Exemple: Pour "totals", peut retourner [0.5, 1.5, 2.5, 3.5, 4.5] si toutes existent
 */
export async function fetchLinesForMarket(
  marketId: string
): Promise<number[]> {
  try {
    const { data: odds, error } = await supabaseAdmin
      .from('odds')
      .select('line')
      .eq('market_id', marketId)
      .neq('line', 0);

    if (error) {
      console.error('Erreur fetchLinesForMarket:', error);
      return [];
    }

    if (!odds || odds.length === 0) {
      return [];
    }

    // Extraire toutes les lignes uniques et trier par valeur
    const uniqueLines = Array.from(new Set(odds.map((o) => o.line as number)))
      .sort((a, b) => a - b);

    return uniqueLines;
  } catch (error) {
    console.error('Erreur dans fetchLinesForMarket:', error);
    return [];
  }
}

/**
 * Met à jour le custom_name d'un marché
 */
export async function updateMarketCustomName(
  marketId: string,
  customName: string | null
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('markets')
      .update({ custom_name: customName })
      .eq('id', marketId);

    if (error) {
      console.error('Erreur updateMarketCustomName:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur dans updateMarketCustomName:', error);
    return false;
  }
}

/**
 * Récupère un marché par son oddsapi_key
 */
export async function fetchMarketByKey(
  oddsapiKey: string,
  sportSlug: string = 'football'
): Promise<MarketWithOutcomes | null> {
  try {
    const { data: sport } = await supabaseAdmin
      .from('sports')
      .select('id')
      .eq('slug', sportSlug)
      .single();

    if (!sport) {
      return null;
    }

    const { data: market, error } = await supabaseAdmin
      .from('markets')
      .select('*')
      .eq('sport_id', sport.id)
      .eq('oddsapi_key', oddsapiKey)
      .eq('period', 'fulltime')
      .single();

    if (error || !market) {
      return null;
    }

    const outcomes = getOutcomesForMarket(market.market_type);

    return {
      ...market,
      outcomes,
    };
  } catch (error) {
    console.error('Erreur dans fetchMarketByKey:', error);
    return null;
  }
}
