-- OddsTracker v2 - Seeding Countries and Leagues
-- This migration seeds the countries_v2 and leagues_v2 tables with data

-- ============================================================================
-- COUNTRIES SEEDING
-- ============================================================================

INSERT INTO countries_v2 (oddsapi_slug, name, iso_code) VALUES
('england', 'England', 'GBR'),
('spain', 'Spain', 'ESP'),
('italy', 'Italy', 'ITA'),
('germany', 'Germany', 'DEU'),
('france', 'France', 'FRA'),
('portugal', 'Portugal', 'PRT'),
('netherlands', 'Netherlands', 'NLD'),
('belgium', 'Belgium', 'BEL'),
('scotland', 'Scotland', 'GBR'),
('turkey', 'Turkey', 'TUR'),
('austria', 'Austria', 'AUT'),
('switzerland', 'Switzerland', 'CHE'),
('greece', 'Greece', 'GRC'),
(NULL, 'International', NULL)
ON CONFLICT (oddsapi_slug) DO NOTHING;

-- ============================================================================
-- FOOTBALL LEAGUES SEEDING (15 leagues)
-- ============================================================================

-- Get the football sport ID
WITH football AS (SELECT id FROM sports_v2 WHERE slug = 'football')

INSERT INTO leagues_v2 (oddsapi_slug, sport_id, country_id, name, display_name, slug, active)
SELECT
  'england-premier-league',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'GBR' LIMIT 1),
  'England - Premier League',
  'Premier League',
  'england-premier-league',
  true
FROM football
UNION ALL
SELECT
  'spain-la-liga',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'ESP' LIMIT 1),
  'Spain - La Liga',
  'La Liga',
  'spain-la-liga',
  true
FROM football
UNION ALL
SELECT
  'italy-serie-a',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'ITA' LIMIT 1),
  'Italy - Serie A',
  'Serie A',
  'italy-serie-a',
  true
FROM football
UNION ALL
SELECT
  'germany-bundesliga',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'DEU' LIMIT 1),
  'Germany - Bundesliga',
  'Bundesliga',
  'germany-bundesliga',
  true
FROM football
UNION ALL
SELECT
  'france-ligue-1',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'FRA' LIMIT 1),
  'France - Ligue 1',
  'Ligue 1',
  'france-ligue-1',
  true
FROM football
UNION ALL
SELECT
  'uefa-champions-league',
  football.id,
  (SELECT id FROM countries_v2 WHERE oddsapi_slug IS NULL LIMIT 1),
  'UEFA Champions League',
  'Champions League',
  'uefa-champions-league',
  true
FROM football
UNION ALL
SELECT
  'uefa-europa-league',
  football.id,
  (SELECT id FROM countries_v2 WHERE oddsapi_slug IS NULL LIMIT 1),
  'UEFA Europa League',
  'Europa League',
  'uefa-europa-league',
  true
FROM football
UNION ALL
SELECT
  'portugal-primeira-liga',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'PRT' LIMIT 1),
  'Portugal - Primeira Liga',
  'Primeira Liga',
  'portugal-primeira-liga',
  true
FROM football
UNION ALL
SELECT
  'netherlands-eredivisie',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'NLD' LIMIT 1),
  'Netherlands - Eredivisie',
  'Eredivisie',
  'netherlands-eredivisie',
  true
FROM football
UNION ALL
SELECT
  'belgium-pro-league',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'BEL' LIMIT 1),
  'Belgium - Pro League',
  'Pro League',
  'belgium-pro-league',
  true
FROM football
UNION ALL
SELECT
  'scotland-premiership',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'GBR' LIMIT 1),
  'Scotland - Premiership',
  'Scottish Premiership',
  'scotland-premiership',
  true
FROM football
UNION ALL
SELECT
  'turkey-super-lig',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'TUR' LIMIT 1),
  'Turkey - Süper Lig',
  'Süper Lig',
  'turkey-super-lig',
  true
FROM football
UNION ALL
SELECT
  'austria-bundesliga',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'AUT' LIMIT 1),
  'Austria - Bundesliga',
  'Bundesliga',
  'austria-bundesliga',
  true
FROM football
UNION ALL
SELECT
  'switzerland-super-league',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'CHE' LIMIT 1),
  'Switzerland - Super League',
  'Super League',
  'switzerland-super-league',
  true
FROM football
UNION ALL
SELECT
  'greece-super-league',
  football.id,
  (SELECT id FROM countries_v2 WHERE iso_code = 'GRC' LIMIT 1),
  'Greece - Super League',
  'Super League',
  'greece-super-league',
  true
FROM football
ON CONFLICT (oddsapi_slug) DO NOTHING;

-- ============================================================================
-- TENNIS TOURNAMENTS SEEDING
-- ============================================================================

WITH tennis AS (SELECT id FROM sports_v2 WHERE slug = 'tennis')

INSERT INTO leagues_v2 (oddsapi_slug, sport_id, country_id, name, display_name, slug, active)
SELECT 'australian-open', tennis.id, NULL::UUID, 'Australian Open', 'Australian Open', 'australian-open', true FROM tennis
UNION ALL
SELECT 'roland-garros', tennis.id, NULL::UUID, 'Roland-Garros', 'Roland-Garros', 'roland-garros', true FROM tennis
UNION ALL
SELECT 'wimbledon', tennis.id, NULL::UUID, 'Wimbledon', 'Wimbledon', 'wimbledon', true FROM tennis
UNION ALL
SELECT 'us-open', tennis.id, NULL::UUID, 'US Open', 'US Open', 'us-open', true FROM tennis
UNION ALL
SELECT 'atp-indian-wells', tennis.id, NULL::UUID, 'ATP Indian Wells', 'Indian Wells', 'atp-indian-wells', true FROM tennis
UNION ALL
SELECT 'atp-miami', tennis.id, NULL::UUID, 'ATP Miami', 'Miami Open', 'atp-miami', true FROM tennis
UNION ALL
SELECT 'atp-madrid', tennis.id, NULL::UUID, 'ATP Madrid', 'Madrid Masters', 'atp-madrid', true FROM tennis
UNION ALL
SELECT 'atp-rome', tennis.id, NULL::UUID, 'ATP Rome', 'Rome Masters', 'atp-rome', true FROM tennis
UNION ALL
SELECT 'atp-montreal', tennis.id, NULL::UUID, 'ATP Montreal', 'Montreal', 'atp-montreal', true FROM tennis
UNION ALL
SELECT 'atp-cincinnati', tennis.id, NULL::UUID, 'ATP Cincinnati', 'Cincinnati', 'atp-cincinnati', true FROM tennis
UNION ALL
SELECT 'atp-shanghai', tennis.id, NULL::UUID, 'ATP Shanghai', 'Shanghai', 'atp-shanghai', true FROM tennis
UNION ALL
SELECT 'atp-paris', tennis.id, NULL::UUID, 'ATP Paris', 'Paris', 'atp-paris', true FROM tennis
UNION ALL
SELECT 'atp-finals', tennis.id, NULL::UUID, 'ATP Finals', 'ATP Finals', 'atp-finals', true FROM tennis
UNION ALL
SELECT 'wta-beijing', tennis.id, NULL::UUID, 'WTA Beijing', 'Beijing', 'wta-beijing', true FROM tennis
UNION ALL
SELECT 'wta-dubai', tennis.id, NULL::UUID, 'WTA Dubai', 'Dubai', 'wta-dubai', true FROM tennis
UNION ALL
SELECT 'wta-doha', tennis.id, NULL::UUID, 'WTA Doha', 'Doha', 'wta-doha', true FROM tennis
UNION ALL
SELECT 'wta-finals', tennis.id, NULL::UUID, 'WTA Finals', 'WTA Finals', 'wta-finals', true FROM tennis
ON CONFLICT (oddsapi_slug) DO NOTHING;
