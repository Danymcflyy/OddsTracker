-- Script pour activer tous les marchés football
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Voir les marchés actuels
SELECT
  m.oddsapi_key,
  m.market_type,
  m.name,
  m.period,
  m.active
FROM markets m
JOIN sports s ON s.id = m.sport_id
WHERE s.slug = 'football'
ORDER BY m.oddsapi_key;

-- 2. Activer tous les marchés
UPDATE markets
SET active = true
WHERE sport_id = (SELECT id FROM sports WHERE slug = 'football');

-- 3. Vérifier le résultat
SELECT
  COUNT(*) as total_markets,
  COUNT(*) FILTER (WHERE active = true) as active_markets
FROM markets m
JOIN sports s ON s.id = m.sport_id
WHERE s.slug = 'football';
