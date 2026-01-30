-- Migration: Add specific odds filtering to search_events
-- This allows filtering by multiple specific odds conditions simultaneously
-- Example p_odds_filters: 
-- [
--   { "market_key": "spreads", "point": -1.5, "outcome": "home", "type": "opening", "min": 1.5, "max": 1.53 },
--   { "market_key": "totals", "point": 2.5, "outcome": "over", "type": "closing", "min": 1.8, "max": null }
-- ]

DROP FUNCTION IF EXISTS search_events(text, timestamptz, timestamptz, text, text, numeric, numeric, numeric, numeric, text, text, numeric, numeric, text, integer, integer, integer);

CREATE OR REPLACE FUNCTION search_events(
  p_sport_key TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_market_key TEXT DEFAULT NULL,
  p_opening_odds_min NUMERIC DEFAULT NULL,
  p_opening_odds_max NUMERIC DEFAULT NULL,
  p_closing_odds_min NUMERIC DEFAULT NULL,
  p_closing_odds_max NUMERIC DEFAULT NULL,
  p_movement_direction TEXT DEFAULT NULL,
  p_outcome TEXT DEFAULT NULL,
  p_point_value NUMERIC DEFAULT NULL,
  p_drop_min NUMERIC DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_min_snapshots INTEGER DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 50,
  p_odds_filters JSONB DEFAULT NULL -- New parameter for specific filters
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
  v_has_opening_filter BOOLEAN;
  v_has_closing_filter BOOLEAN;
  v_has_odds_filters BOOLEAN;
BEGIN
  -- Check if we have legacy opening or closing odds filters
  v_has_opening_filter := (p_opening_odds_min IS NOT NULL OR p_opening_odds_max IS NOT NULL);
  v_has_closing_filter := (p_closing_odds_min IS NOT NULL OR p_closing_odds_max IS NOT NULL);
  v_has_odds_filters := (p_odds_filters IS NOT NULL AND jsonb_array_length(p_odds_filters) > 0);

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
      -- 1. Apply Legacy Filters (Global Odds Filters)
      (
        (NOT v_has_opening_filter AND NOT v_has_closing_filter AND p_point_value IS NULL AND p_drop_min IS NULL AND p_outcome IS NULL AND p_movement_direction IS NULL)
        OR (
          -- Opening odds filter (if specified)
          (
            NOT v_has_opening_filter
            OR EXISTS (
              SELECT 1
              FROM jsonb_array_elements(ewm.market_states_json) as ms
              WHERE
                (p_market_key IS NULL OR ms->>'market_key' = p_market_key)
                AND (p_point_value IS NULL OR (ms->'opening_odds'->>'point')::numeric = p_point_value)
                AND EXISTS (
                  SELECT 1
                  FROM jsonb_each(ms->'opening_odds') as odds(key, value)
                  WHERE jsonb_typeof(odds.value) = 'number'
                    AND (p_outcome IS NULL OR odds.key = p_outcome)
                    AND (p_opening_odds_min IS NULL OR odds.value::numeric >= p_opening_odds_min)
                    AND (p_opening_odds_max IS NULL OR odds.value::numeric <= p_opening_odds_max)
                )
            )
          )
          -- Closing odds filter (if specified)
          AND (
            NOT v_has_closing_filter
            OR (
              ewm.closing_odds_json IS NOT NULL
              AND ewm.closing_odds_json->'markets' IS NOT NULL
              AND EXISTS (
                SELECT 1
                FROM jsonb_each(ewm.closing_odds_json->'markets') as mkt(mkey, mval)
                WHERE
                  (p_market_key IS NULL OR mkt.mkey = p_market_key)
                  AND (p_point_value IS NULL OR (mkt.mval->>'point')::numeric = p_point_value)
                  AND EXISTS (
                    SELECT 1
                    FROM jsonb_each(mkt.mval) as odds(key, value)
                    WHERE jsonb_typeof(odds.value) = 'number'
                      AND (p_outcome IS NULL OR odds.key = p_outcome)
                      AND (p_closing_odds_min IS NULL OR odds.value::numeric >= p_closing_odds_min)
                      AND (p_closing_odds_max IS NULL OR odds.value::numeric <= p_closing_odds_max)
                  )
              )
            )
          )
        )
        -- Movement direction filter
        AND (
          p_movement_direction IS NULL
          OR (
            ewm.closing_odds_json IS NOT NULL
            AND ewm.closing_odds_json->'markets' IS NOT NULL
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
                    AND (
                      (p_movement_direction = 'down' AND c_odds.cval::numeric < o_odds.oval::numeric)
                      OR (p_movement_direction = 'up' AND c_odds.cval::numeric > o_odds.oval::numeric)
                      OR (p_movement_direction = 'stable' AND ABS((c_odds.cval::numeric - o_odds.oval::numeric) / o_odds.oval::numeric) * 100 < 3)
                    )
                )
            )
          )
        )
        -- Drop filter
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
      -- 2. Apply NEW Specific Odds Filters (AND logic: all filters must match)
      AND (
        NOT v_has_odds_filters
        OR NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(p_odds_filters) as f
          WHERE NOT (
            -- For each filter 'f', the event MUST satisfy the condition
            CASE
              -- OPENING ODDS Check
              WHEN f->>'type' = 'opening' THEN
                EXISTS (
                  SELECT 1
                  FROM jsonb_array_elements(ewm.market_states_json) as ms
                  LEFT JOIN LATERAL jsonb_array_elements(COALESCE(ms->'opening_odds_variations', '[]'::jsonb)) as var ON true
                  WHERE
                    ms->>'market_key' = (f->>'market_key')
                    AND (
                      -- Check main opening_odds
                      (
                        (f->>'point') IS NULL OR (ms->'opening_odds'->>'point')::numeric = (f->>'point')::numeric
                      )
                      AND (
                        (ms->'opening_odds'->>(f->>'outcome'))::numeric >= COALESCE((f->>'min')::numeric, 0)
                        AND (ms->'opening_odds'->>(f->>'outcome'))::numeric <= COALESCE((f->>'max')::numeric, 9999)
                      )
                    )
                    OR (
                      -- Check variations
                      var IS NOT NULL
                      AND (f->>'point') IS NULL OR (var->>'point')::numeric = (f->>'point')::numeric
                      AND (var->>(f->>'outcome'))::numeric >= COALESCE((f->>'min')::numeric, 0)
                      AND (var->>(f->>'outcome'))::numeric <= COALESCE((f->>'max')::numeric, 9999)
                    )
                )
              -- CLOSING ODDS Check
              WHEN f->>'type' = 'closing' THEN
                ewm.closing_odds_json IS NOT NULL
                AND EXISTS (
                  SELECT 1
                  FROM jsonb_each(ewm.closing_odds_json->'markets') as mkt(mkey, mval)
                  -- Also check variations in closing_odds (markets_variations)
                  LEFT JOIN LATERAL jsonb_array_elements(COALESCE(ewm.closing_odds_json->'markets_variations'->(f->>'market_key'), '[]'::jsonb)) as cvar ON true
                  WHERE
                    mkey = (f->>'market_key')
                    AND (
                      -- Check main market
                      (
                        (f->>'point') IS NULL OR (mval->>'point')::numeric = (f->>'point')::numeric
                      )
                      AND (
                        (mval->>(f->>'outcome'))::numeric >= COALESCE((f->>'min')::numeric, 0)
                        AND (mval->>(f->>'outcome'))::numeric <= COALESCE((f->>'max')::numeric, 9999)
                      )
                    )
                    OR (
                      -- Check variations
                      cvar IS NOT NULL
                      AND (f->>'point') IS NULL OR (cvar->>'point')::numeric = (f->>'point')::numeric
                      AND (cvar->>(f->>'outcome'))::numeric >= COALESCE((f->>'min')::numeric, 0)
                      AND (cvar->>(f->>'outcome'))::numeric <= COALESCE((f->>'max')::numeric, 9999)
                    )
                )
              ELSE FALSE
            END
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

GRANT EXECUTE ON FUNCTION search_events TO authenticated;
GRANT EXECUTE ON FUNCTION search_events TO service_role;

COMMENT ON FUNCTION search_events IS 'Search with advanced global filters AND specific column filters (JSONB array).';
