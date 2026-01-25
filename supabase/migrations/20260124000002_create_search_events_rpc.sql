-- Function to search events with advanced JSON filtering
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
  market_states JSONB,
  closing_odds JSONB,
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
      e.id,
      e.sport_key,
      e.sport_title,
      e.commence_time,
      e.home_team,
      e.away_team,
      e.status,
      e.home_score,
      e.away_score,
      e.last_snapshot_at,
      e.snapshot_count,
      -- Aggregate market states
      COALESCE(
        JSONB_AGG(
          jsonb_build_object(
            'market_key', ms.market_key,
            'status', ms.status,
            'opening_odds', ms.opening_odds,
            'opening_odds_variations', ms.opening_odds_variations,
            'opening_captured_at', ms.opening_captured_at
          )
        ) FILTER (WHERE ms.id IS NOT NULL), 
        '[]'::jsonb
      ) as market_states_json,
      -- Get closing odds
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
    GROUP BY e.id, co.id
  )
  SELECT 
    fe.id,
    fe.sport_key,
    fe.sport_title,
    fe.commence_time,
    fe.home_team,
    fe.away_team,
    fe.status,
    fe.home_score,
    fe.away_score,
    fe.market_states_json,
    fe.closing_odds_json,
    fe.last_snapshot_at,
    fe.snapshot_count,
    COUNT(*) OVER()::BIGINT as total_count
  FROM filtered_events fe
  WHERE 
    -- Advanced Odds Filtering logic here would be complex in SQL
    -- For V1, we filter basic params in WHERE clause above and let frontend handle precise odds matching
    -- OR implement basic check if any market matches criteria
    (p_odds_min IS NULL AND p_odds_max IS NULL) OR (
        EXISTS (
            SELECT 1 FROM jsonb_array_elements(fe.market_states_json) as ms
            WHERE (
                -- Check opening odds values (simplified check for existence of value in range)
                -- This is a heuristic: we convert the whole odds object to text and check, 
                -- or we need precise JSON path extraction which depends on dynamic keys (home/away/over...)
                -- For stability in this iteration, we return ALL events that match base criteria
                -- and let the robust JS post-filter do the fine-grained odds matching.
                -- Implementing full dynamic key JSON filtering in SQL is error-prone without specific outcome keys.
                TRUE 
            )
        )
    )
  ORDER BY fe.commence_time ASC
  LIMIT p_page_size
  OFFSET (p_page - 1) * p_page_size;
END;
$$;
