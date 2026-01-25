-- Drop ALL existing versions of search_events to resolve ambiguity
DROP FUNCTION IF EXISTS search_events(text, timestamptz, timestamptz, text, text, numeric, numeric, text, numeric, integer, integer);
DROP FUNCTION IF EXISTS search_events(text, timestamptz, timestamptz, text, text, numeric, numeric, text, numeric, numeric, integer, integer);
DROP FUNCTION IF EXISTS search_events(text, timestamptz, timestamptz, text, text, numeric, numeric, text, numeric, numeric, text, integer, integer, integer);

-- Recreate the correct version
CREATE OR REPLACE FUNCTION search_events(
  p_sport_key TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_market_key TEXT DEFAULT NULL,
  p_odds_min NUMERIC DEFAULT NULL,
  p_odds_max NUMERIC DEFAULT NULL,
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
AS $$
BEGIN
  RETURN QUERY
  WITH filtered_events AS (
    SELECT 
      e.id, e.sport_key, e.sport_title, e.commence_time, e.home_team, e.away_team, e.status, e.home_score, e.away_score, e.last_snapshot_at, e.snapshot_count,
      COALESCE(JSONB_AGG(jsonb_build_object('market_key', ms.market_key, 'status', ms.status, 'opening_odds', ms.opening_odds, 'opening_odds_variations', ms.opening_odds_variations, 'opening_captured_at', ms.opening_captured_at)) FILTER (WHERE ms.id IS NOT NULL), '[]'::jsonb) as market_states_json,
      to_jsonb(co.*) as closing_odds_json
    FROM events e
    LEFT JOIN market_states ms ON e.id = ms.event_id
    LEFT JOIN closing_odds co ON e.id = co.event_id
    WHERE 
      (p_sport_key IS NULL OR e.sport_key = p_sport_key)
      AND (p_date_from IS NULL OR e.commence_time >= p_date_from)
      AND (p_date_to IS NULL OR e.commence_time <= p_date_to)
      AND (p_search IS NULL OR e.home_team ILIKE '%' || p_search || '%' OR e.away_team ILIKE '%' || p_search || '%')
      AND (p_market_key IS NULL OR ms.market_key = p_market_key)
      AND (p_status IS NULL OR e.status = p_status)
      AND (p_min_snapshots IS NULL OR COALESCE(e.snapshot_count, 0) >= p_min_snapshots)
    GROUP BY e.id, co.id
  )
  SELECT 
    fe.*,
    COUNT(*) OVER()::BIGINT as total_count
  FROM filtered_events fe
  WHERE 
    (p_odds_min IS NULL AND p_odds_max IS NULL AND p_point_value IS NULL AND p_drop_min IS NULL) 
    OR (
        EXISTS (
            SELECT 1 
            FROM jsonb_array_elements(fe.market_states_json) as ms
            CROSS JOIN LATERAL jsonb_each(ms->'opening_odds') as odds(key, value)
            WHERE 
                (p_point_value IS NULL OR (ms->'opening_odds'->>'point')::numeric = p_point_value)
                AND (p_outcome IS NULL OR odds.key = p_outcome)
                AND (jsonb_typeof(odds.value) = 'number')
                AND (p_odds_min IS NULL OR odds.value::numeric >= p_odds_min)
                AND (p_odds_max IS NULL OR odds.value::numeric <= p_odds_max)
                AND (p_drop_min IS NULL OR (
                    -- Check if closing odds exist and calculate drop
                    EXISTS (
                        SELECT 1 
                        FROM jsonb_each(fe.closing_odds_json->'markets'->(ms->>'market_key')) as co_odds(ckey, cval)
                        WHERE co_odds.ckey = odds.key 
                        AND jsonb_typeof(co_odds.cval) = 'number'
                        AND odds.value::numeric > 0 -- Prevent division by zero
                        AND ((odds.value::numeric - co_odds.cval::numeric) / odds.value::numeric) * 100 >= p_drop_min
                    )
                ))
        )
    )
  ORDER BY fe.commence_time ASC
  LIMIT p_page_size
  OFFSET (p_page - 1) * p_page_size;
END;
$$;
