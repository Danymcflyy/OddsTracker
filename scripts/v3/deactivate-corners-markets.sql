-- Script pour désactiver tous les marchés de corners
-- À exécuter dans Supabase SQL Editor

-- Désactiver tous les marchés corners
UPDATE markets
SET active = false
WHERE oddsapi_key LIKE 'corners%'
AND sport_id = (SELECT id FROM sports WHERE slug = 'football');

-- Vérifier le résultat
SELECT
  oddsapi_key,
  market_type,
  name,
  period,
  active
FROM markets
WHERE sport_id = (SELECT id FROM sports WHERE slug = 'football')
AND oddsapi_key LIKE 'corners%'
ORDER BY oddsapi_key;
