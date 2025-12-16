-- ============================================================================
-- FIX: Correction de oddsapi_key pour le sport football
-- ============================================================================
--
-- Problème: La seed data initiale avait 'soccer' au lieu de 'football'
-- Solution: Mise à jour vers 'football' (valeur correcte selon API Odds-API.io)
--

UPDATE sports
SET oddsapi_key = 'football'
WHERE slug = 'football';

-- Vérification
SELECT id, oddsapi_key, name, slug, active
FROM sports
WHERE slug = 'football';
