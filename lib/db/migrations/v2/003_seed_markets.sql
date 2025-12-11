-- OddsTracker v2 - Seeding Markets and Outcomes
-- This migration seeds the markets_v2 and outcomes_v2 tables with data

-- ============================================================================
-- FOOTBALL MARKETS
-- ============================================================================

WITH football AS (SELECT id FROM sports_v2 WHERE slug = 'football')

INSERT INTO markets_v2 (sport_id, oddsapi_key, market_type, period, active)
SELECT
  football.id,
  'h2h',
  '1x2',
  'fulltime',
  true
FROM football
UNION ALL
SELECT football.id, 'spreads', 'spreads', 'fulltime', true FROM football
UNION ALL
SELECT football.id, 'totals', 'totals', 'fulltime', true FROM football
UNION ALL
SELECT football.id, 'h2h_h1', '1x2', 'p1', true FROM football
UNION ALL
SELECT football.id, 'totals_h1', 'totals', 'p1', true FROM football
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FOOTBALL OUTCOMES
-- ============================================================================

-- 1x2 Outcomes
INSERT INTO outcomes_v2 (market_id, oddsapi_name, normalized_name, display_name)
SELECT
  m.id,
  outcome.name,
  outcome.normalized,
  outcome.display
FROM markets_v2 m
CROSS JOIN (
  VALUES
    ('Home', '1', 'Home Win'),
    ('Away', '2', 'Away Win'),
    ('Draw', 'X', 'Draw')
) AS outcome(name, normalized, display)
WHERE m.oddsapi_key = 'h2h' AND m.period = 'fulltime'
ON CONFLICT (market_id, normalized_name) DO NOTHING;

-- Spreads Outcomes
INSERT INTO outcomes_v2 (market_id, oddsapi_name, normalized_name, display_name)
SELECT
  m.id,
  outcome.name,
  outcome.normalized,
  outcome.display
FROM markets_v2 m
CROSS JOIN (
  VALUES
    ('Home', 'home', 'Home'),
    ('Away', 'away', 'Away')
) AS outcome(name, normalized, display)
WHERE m.oddsapi_key = 'spreads' AND m.period = 'fulltime'
ON CONFLICT (market_id, normalized_name) DO NOTHING;

-- Totals Outcomes
INSERT INTO outcomes_v2 (market_id, oddsapi_name, normalized_name, display_name)
SELECT
  m.id,
  outcome.name,
  outcome.normalized,
  outcome.display
FROM markets_v2 m
CROSS JOIN (
  VALUES
    ('Over', 'over', 'Over'),
    ('Under', 'under', 'Under')
) AS outcome(name, normalized, display)
WHERE m.oddsapi_key = 'totals' AND m.period = 'fulltime'
ON CONFLICT (market_id, normalized_name) DO NOTHING;

-- H1 1x2 Outcomes
INSERT INTO outcomes_v2 (market_id, oddsapi_name, normalized_name, display_name)
SELECT
  m.id,
  outcome.name,
  outcome.normalized,
  outcome.display
FROM markets_v2 m
CROSS JOIN (
  VALUES
    ('Home', '1', 'Home Win'),
    ('Away', '2', 'Away Win'),
    ('Draw', 'X', 'Draw')
) AS outcome(name, normalized, display)
WHERE m.oddsapi_key = 'h2h_h1' AND m.period = 'p1'
ON CONFLICT (market_id, normalized_name) DO NOTHING;

-- H1 Totals Outcomes
INSERT INTO outcomes_v2 (market_id, oddsapi_name, normalized_name, display_name)
SELECT
  m.id,
  outcome.name,
  outcome.normalized,
  outcome.display
FROM markets_v2 m
CROSS JOIN (
  VALUES
    ('Over', 'over', 'Over'),
    ('Under', 'under', 'Under')
) AS outcome(name, normalized, display)
WHERE m.oddsapi_key = 'totals_h1' AND m.period = 'p1'
ON CONFLICT (market_id, normalized_name) DO NOTHING;

-- ============================================================================
-- TENNIS MARKETS
-- ============================================================================

WITH tennis AS (SELECT id FROM sports_v2 WHERE slug = 'tennis')

INSERT INTO markets_v2 (sport_id, oddsapi_key, market_type, period, active)
SELECT
  tennis.id,
  'h2h',
  'moneyline',
  'match',
  true
FROM tennis
UNION ALL
SELECT tennis.id, 'spreads', 'spreads', 'match', true FROM tennis
UNION ALL
SELECT tennis.id, 'totals', 'totals', 'match', true FROM tennis
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TENNIS OUTCOMES
-- ============================================================================

-- Tennis Moneyline Outcomes
INSERT INTO outcomes_v2 (market_id, oddsapi_name, normalized_name, display_name)
SELECT
  m.id,
  outcome.name,
  outcome.normalized,
  outcome.display
FROM markets_v2 m
CROSS JOIN (
  VALUES
    ('Player1', 'player1', 'Player 1'),
    ('Player2', 'player2', 'Player 2')
) AS outcome(name, normalized, display)
WHERE m.oddsapi_key = 'h2h' AND m.period = 'match'
ON CONFLICT (market_id, normalized_name) DO NOTHING;

-- Tennis Spreads Outcomes
INSERT INTO outcomes_v2 (market_id, oddsapi_name, normalized_name, display_name)
SELECT
  m.id,
  outcome.name,
  outcome.normalized,
  outcome.display
FROM markets_v2 m
CROSS JOIN (
  VALUES
    ('Player1', 'player1', 'Player 1'),
    ('Player2', 'player2', 'Player 2')
) AS outcome(name, normalized, display)
WHERE m.oddsapi_key = 'spreads' AND m.period = 'match'
ON CONFLICT (market_id, normalized_name) DO NOTHING;

-- Tennis Totals Outcomes
INSERT INTO outcomes_v2 (market_id, oddsapi_name, normalized_name, display_name)
SELECT
  m.id,
  outcome.name,
  outcome.normalized,
  outcome.display
FROM markets_v2 m
CROSS JOIN (
  VALUES
    ('Over', 'over', 'Over'),
    ('Under', 'under', 'Under')
) AS outcome(name, normalized, display)
WHERE m.oddsapi_key = 'totals' AND m.period = 'match'
ON CONFLICT (market_id, normalized_name) DO NOTHING;
