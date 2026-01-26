-- Migration: Optimize search_events for large databases
-- Adds support for oddsType parameter and improves performance

-- Drop existing function
DROP FUNCTION IF EXISTS search_events(text, timestamptz, timestamptz, text, text, numeric, numeric, text, numeric, numeric, text, integer, integer, integer);

-- Create optimized search function with all filters
CREATE OR REPLACE FUNCTION search_events(
  p_sport_key TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_market_key TEXT DEFAULT NULL,
  p_odds_min NUMERIC DEFAULT NULL,
  p_odds_max NUMERIC DEFAULT NULL,
  p_odds_type TEXT DEFAULT NULL,  -- NEW: 'opening', 'closing', or NULL for both
  p_outcome TEXT DEFAULT NULL,
  p_point_value NUMERIC DEFAULT NULL,
  p_drop_min NUMERIC DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_min_snapshots INTEGER DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  sport_key TEXT,
  sport_title TEXT,
  commence_time TIMESTAMPTZ,
  home_team TEXT,
  away_team TEXT,
  status TEXT,
  home_score INTEGER,
  away_score INTEGER,
  market_states_json JSONB,
  closing_odds_json JSONB,
  last_snapshot_at TIMESTAMPTZ,
  snapshot_count INTEGER,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_has_odds_filter BOOLEAN;
BEGIN
  -- Check if we have any odds-related filters
  v_has_odds_filter := (p_odds_min IS NOT NULL OR p_odds_max IS NOT NULL OR p_point_value IS NOT NULL OR p_drop_min IS NOT NULL OR p_outcome IS NOT NULL);

  RETURN QUERY
  WITH base_events AS (
    -- First filter on basic event attributes (uses indexes)
    SELECT
      e.id, e.sport_key, e.sport_title, e.commence_time,
      e.home_team, e.away_team, e.status, e.home_score, e.away_score,
      e.last_snapshot_at, e.snapshot_count
    FROM events e
    WHERE
      (p_sport_key IS NULL OR e.sport_key = p_sport_key)
      AND (p_date_from IS NULL OR e.commence_time >= p_date_from)
      AND (p_date_to IS NULL OR e.commence_time <= p_date_to)
      AND (p_search IS NULL OR e.home_team ILIKE '%' || p_search || '%' OR e.away_team ILIKE '%' || p_search || '%')
      AND (p_status IS NULL OR e.status = p_status)
      AND (p_min_snapshots IS NULL OR COALESCE(e.snapshot_count, 0) >= p_min_snapshots)
  ),
  events_with_markets AS (
    -- Join with market_states and closing_odds
    SELECT
      be.*,
      COALESCE(
        JSONB_AGG(
          DISTINCT jsonb_build_object(
            'market_key', ms.market_key,
            'status', ms.status,
            'opening_odds', ms.opening_odds,
            'opening_odds_variations', ms.opening_odds_variations,
            'opening_captured_at', ms.opening_captured_at
          )
        ) FILTER (WHERE ms.id IS NOT NULL AND (p_market_key IS NULL OR ms.market_key = p_market_key)),
        '[]'::jsonb
      ) as market_states_json,
      to_jsonb(co.*) as closing_odds_json
    FROM base_events be
    LEFT JOIN market_states ms ON be.id = ms.event_id
    LEFT JOIN closing_odds co ON be.id = co.event_id
    GROUP BY be.id, be.sport_key, be.sport_title, be.commence_time,
             be.home_team, be.away_team, be.status, be.home_score, be.away_score,
             be.last_snapshot_at, be.snapshot_count, co.id
  ),
  filtered_events AS (
    SELECT ewm.*
    FROM events_with_markets ewm
    WHERE
      -- If no odds filters, include all
      (NOT v_has_odds_filter)
      OR (
        -- Check opening odds (if oddsType is NULL or 'opening' or 'both')
        (
          (p_odds_type IS NULL OR p_odds_type IN ('opening', 'both'))
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(ewm.market_states_json) as ms
            WHERE
              -- Market key filter
              (p_market_key IS NULL OR ms->>'market_key' = p_market_key)
              -- Point value filter
              AND (p_point_value IS NULL OR (ms->'opening_odds'->>'point')::numeric = p_point_value)
              -- Odds value filter
              AND (
                p_odds_min IS NULL AND p_odds_max IS NULL AND p_outcome IS NULL
                OR EXISTS (
                  SELECT 1
                  FROM jsonb_each(ms->'opening_odds') as odds(key, value)
                  WHERE jsonb_typeof(odds.value) = 'number'
                    AND (p_outcome IS NULL OR odds.key = p_outcome)
                    AND (p_odds_min IS NULL OR odds.value::numeric >= p_odds_min)
                    AND (p_odds_max IS NULL OR odds.value::numeric <= p_odds_max)
                )
              )
          )
        )
        OR
        -- Check closing odds (if oddsType is NULL or 'closing' or 'both')
        (
          (p_odds_type IS NULL OR p_odds_type IN ('closing', 'both'))
          AND ewm.closing_odds_json IS NOT NULL
          AND ewm.closing_odds_json->'markets' IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM jsonb_each(ewm.closing_odds_json->'markets') as mkt(mkey, mval)
            WHERE
              (p_market_key IS NULL OR mkt.mkey = p_market_key)
              AND (p_point_value IS NULL OR (mkt.mval->>'point')::numeric = p_point_value)
              AND (
                p_odds_min IS NULL AND p_odds_max IS NULL AND p_outcome IS NULL
                OR EXISTS (
                  SELECT 1
                  FROM jsonb_each(mkt.mval) as odds(key, value)
                  WHERE jsonb_typeof(odds.value) = 'number'
                    AND (p_outcome IS NULL OR odds.key = p_outcome)
                    AND (p_odds_min IS NULL OR odds.value::numeric >= p_odds_min)
                    AND (p_odds_max IS NULL OR odds.value::numeric <= p_odds_max)
                )
              )
          )
        )
      )
      -- Drop filter (requires both opening and closing)
      AND (
        p_drop_min IS NULL
        OR (
          ewm.closing_odds_json IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(ewm.market_states_json) as ms
            CROSS JOIN LATERAL jsonb_each(ms->'opening_odds') as o_odds(okey, oval)
            WHERE
              jsonb_typeof(o_odds.oval) = 'number'
              AND o_odds.oval::numeric > 0
              AND (p_market_key IS NULL OR ms->>'market_key' = p_market_key)
              AND (p_outcome IS NULL OR o_odds.okey = p_outcome)
              AND EXISTS (
                SELECT 1
                FROM jsonb_each(ewm.closing_odds_json->'markets'->(ms->>'market_key')) as c_odds(ckey, cval)
                WHERE c_odds.ckey = o_odds.okey
                  AND jsonb_typeof(c_odds.cval) = 'number'
                  AND ((o_odds.oval::numeric - c_odds.cval::numeric) / o_odds.oval::numeric) * 100 >= p_drop_min
              )
          )
        )
      )
  )
  SELECT
    fe.id, fe.sport_key, fe.sport_title, fe.commence_time,
    fe.home_team, fe.away_team, fe.status, fe.home_score, fe.away_score,
    fe.market_states_json, fe.closing_odds_json,
    fe.last_snapshot_at, fe.snapshot_count,
    COUNT(*) OVER()::BIGINT as total_count
  FROM filtered_events fe
  ORDER BY fe.commence_time ASC
  LIMIT p_page_size
  OFFSET (p_page - 1) * p_page_size;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_sport_key ON events(sport_key);
CREATE INDEX IF NOT EXISTS idx_events_commence_time ON events(commence_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_snapshot_count ON events(snapshot_count) WHERE snapshot_count IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_home_team_trgm ON events USING gin(home_team gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_events_away_team_trgm ON events USING gin(away_team gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_market_states_event_id ON market_states(event_id);
CREATE INDEX IF NOT EXISTS idx_market_states_market_key ON market_states(market_key);
CREATE INDEX IF NOT EXISTS idx_closing_odds_event_id ON closing_odds(event_id);

-- Enable pg_trgm extension for fuzzy search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_events TO authenticated;
GRANT EXECUTE ON FUNCTION search_events TO service_role;

COMMENT ON FUNCTION search_events IS 'Optimized search function for filtering events with advanced odds filters. Supports filtering by oddsType (opening/closing/both), market, outcome, odds range, point value, and drop percentage.';
