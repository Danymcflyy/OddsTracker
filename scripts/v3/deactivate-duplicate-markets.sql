-- Script pour désactiver les marchés en double
-- À exécuter dans Supabase SQL Editor

-- Désactiver les doublons identifiés
UPDATE markets
SET active = false
WHERE oddsapi_key IN (
  'spread',           -- Doublon de 'spreads' (Asian Handicap)
  'spread_ht',        -- Doublon de 'spreads' pour halftime
  'team_total_home',  -- Doublon de 'team_totals_home'
  'team_total_away',  -- Doublon de 'team_totals_away'
  'totals_ht'         -- Doublon géré via period sur 'totals'
)
AND sport_id = (SELECT id FROM sports WHERE slug = 'football');

-- Vérifier le résultat
SELECT
  oddsapi_key,
  market_type,
  name,
  period,
  active,
  CASE
    WHEN oddsapi_key IN ('spread', 'spread_ht', 'team_total_home', 'team_total_away', 'totals_ht')
    THEN '❌ Désactivé (doublon)'
    ELSE '✅ Actif'
  END as status
FROM markets
WHERE sport_id = (SELECT id FROM sports WHERE slug = 'football')
ORDER BY
  CASE
    WHEN active = true THEN 0
    ELSE 1
  END,
  oddsapi_key;
