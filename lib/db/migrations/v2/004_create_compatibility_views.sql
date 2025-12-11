-- OddsTracker v2 - Compatibility Views
-- These views present v2 tables as v1 table structure for backward compatibility with existing API endpoints

-- ============================================================================
-- VIEW: fixtures (maps events_to_track + leagues to old fixtures format)
-- ============================================================================
DROP VIEW IF EXISTS fixtures CASCADE;
CREATE VIEW fixtures AS
SELECT
  e.event_id::INT AS id,
  e.event_id::VARCHAR AS oddspapi_id,
  s.id AS sport_id,
  l.id AS league_id,
  e.home_team_id,
  e.away_team_id,
  e.event_date AS start_time,
  e.home_score,
  e.away_score,
  e.status,
  e.created_at,
  e.updated_at,
  CASE WHEN e.state = 'FINISHED' THEN e.updated_at ELSE NULL END AS odds_locked_at
FROM events_to_track e
LEFT JOIN sports_v2 s ON s.slug = e.sport_slug
LEFT JOIN leagues_v2 l ON l.oddsapi_slug = e.league_slug;

-- ============================================================================
-- VIEW: leagues (maps leagues_v2)
-- ============================================================================
DROP VIEW IF EXISTS leagues CASCADE;
CREATE VIEW leagues AS
SELECT
  l.id,
  l.id::VARCHAR AS oddspapi_id,
  l.sport_id,
  l.country_id,
  COALESCE(l.display_name, l.name) AS name,
  l.slug,
  l.active
FROM leagues_v2 l;

-- ============================================================================
-- VIEW: countries (maps countries_v2)
-- ============================================================================
DROP VIEW IF EXISTS countries CASCADE;
CREATE VIEW countries AS
SELECT
  c.id,
  c.oddsapi_slug AS oddspapi_slug,
  c.name,
  c.iso_code
FROM countries_v2 c;

-- ============================================================================
-- VIEW: sports (maps sports_v2)
-- ============================================================================
DROP VIEW IF EXISTS sports CASCADE;
CREATE VIEW sports AS
SELECT
  s.id,
  s.id::VARCHAR AS oddspapi_id,
  s.name,
  s.slug
FROM sports_v2 s;

-- ============================================================================
-- VIEW: teams (maps teams_v2)
-- ============================================================================
DROP VIEW IF EXISTS teams CASCADE;
CREATE VIEW teams AS
SELECT
  t.id,
  t.id::VARCHAR AS oddspapi_id,
  COALESCE(t.display_name, t.normalized_name) AS name
FROM teams_v2 t;

-- ============================================================================
-- VIEW: markets (maps markets_v2)
-- ============================================================================
DROP VIEW IF EXISTS markets CASCADE;
CREATE VIEW markets AS
SELECT
  m.id,
  m.id::VARCHAR AS oddspapi_id,
  m.sport_id,
  COALESCE(m.oddsapi_key, '') AS name,
  '' AS description,
  m.market_type,
  m.period,
  m.handicap,
  m.active
FROM markets_v2 m;

-- ============================================================================
-- VIEW: outcomes (maps outcomes_v2)
-- ============================================================================
DROP VIEW IF EXISTS outcomes CASCADE;
CREATE VIEW outcomes AS
SELECT
  o.id,
  o.id::VARCHAR AS oddspapi_id,
  o.market_id,
  COALESCE(o.display_name, o.normalized_name) AS name,
  '' AS description
FROM outcomes_v2 o;

-- ============================================================================
-- VIEW: odds (maps opening_closing_observed to old odds format)
-- ============================================================================
DROP VIEW IF EXISTS odds CASCADE;
CREATE VIEW odds AS
SELECT
  gen_random_uuid() AS id,
  oco.event_id::INT AS fixture_id,
  m.id AS market_id,
  o.id AS outcome_id,
  oco.opening_price_observed AS opening_price,
  oco.closing_price_observed AS closing_price,
  oco.opening_time_observed AS opening_timestamp,
  oco.closing_time_observed AS closing_timestamp,
  oco.is_winner,
  oco.created_at
FROM opening_closing_observed oco
LEFT JOIN markets_v2 m ON (
  m.oddsapi_key = oco.market_name
  AND m.sport_id = (SELECT id FROM sports_v2 WHERE slug = oco.sport_slug)
)
LEFT JOIN outcomes_v2 o ON (
  o.market_id = m.id
  AND (
    o.normalized_name = UPPER(oco.selection)
    OR (o.oddsapi_name = 'Home' AND oco.selection = 'home')
    OR (o.oddsapi_name = 'Away' AND oco.selection = 'away')
    OR (o.oddsapi_name = 'Draw' AND oco.selection = 'draw')
    OR (o.oddsapi_name = 'Over' AND oco.selection = 'over')
    OR (o.oddsapi_name = 'Under' AND oco.selection = 'under')
  )
)
WHERE oco.bookmaker = 'Pinnacle'
ORDER BY oco.created_at DESC;
