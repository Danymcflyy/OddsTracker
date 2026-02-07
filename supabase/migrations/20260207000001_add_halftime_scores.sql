-- Migration: Add half-time scores support
-- Allows manual entry of HT scores for calculating H1/H2 market results

-- Add half-time score columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS home_score_h1 INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS away_score_h1 INTEGER;

-- Track source and update info
ALTER TABLE events ADD COLUMN IF NOT EXISTS h1_score_source TEXT DEFAULT 'none';
  -- 'none' = not set, 'manual' = user entered, 'api' = from API (future)

ALTER TABLE events ADD COLUMN IF NOT EXISTS h1_updated_at TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS h1_updated_by TEXT;

-- Add index for filtering events with/without H1 scores
CREATE INDEX IF NOT EXISTS idx_events_h1_scores
  ON events (home_score_h1, away_score_h1)
  WHERE home_score_h1 IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN events.home_score_h1 IS 'Half-time score for home team (manually entered)';
COMMENT ON COLUMN events.away_score_h1 IS 'Half-time score for away team (manually entered)';
COMMENT ON COLUMN events.h1_score_source IS 'Source of H1 scores: none, manual, or api';
