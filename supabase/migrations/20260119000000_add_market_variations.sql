-- Migration: Support multiple point variations per market
-- Date: 2026-01-19
-- Description: Allow storing multiple point values (e.g., spreads -0.5, -1.0, -1.5) for the same market

-- Add new columns for variations (arrays of odds objects)
ALTER TABLE market_states
  ADD COLUMN IF NOT EXISTS opening_odds_variations JSONB[] DEFAULT '{}';

-- Migrate existing opening_odds data to variations array
-- If opening_odds exists and is not null, wrap it in an array
UPDATE market_states
SET opening_odds_variations = ARRAY[opening_odds]
WHERE opening_odds IS NOT NULL
  AND opening_odds_variations = '{}';

-- Add index for better query performance on variations
CREATE INDEX IF NOT EXISTS idx_market_states_variations
  ON market_states USING GIN (opening_odds_variations);

-- Add comment explaining the structure
COMMENT ON COLUMN market_states.opening_odds_variations IS
'Array of odds variations for markets with multiple point values.
Example: [{home: 2.1, away: 1.8, point: -0.5}, {home: 1.9, away: 2.0, point: -1.0}]';

-- Update the closing_odds table structure to support variations
ALTER TABLE closing_odds
  ADD COLUMN IF NOT EXISTS markets_variations JSONB DEFAULT '{}';

-- Migrate existing markets data
-- Convert the flat structure to support variations
-- Example: {h2h: {home: 2.1}, spreads: {home: 1.9, point: -0.5}}
-- becomes: {h2h: [{home: 2.1}], spreads: [{home: 1.9, point: -0.5}]}
UPDATE closing_odds
SET markets_variations = (
  SELECT jsonb_object_agg(
    key,
    jsonb_build_array(value)
  )
  FROM jsonb_each(markets)
)
WHERE markets IS NOT NULL
  AND markets != '{}'::jsonb
  AND (markets_variations IS NULL OR markets_variations = '{}'::jsonb);

COMMENT ON COLUMN closing_odds.markets_variations IS
'Markets with support for multiple point variations per market type.
Example: {spreads: [{home: 2.1, away: 1.8, point: -0.5}, {home: 1.9, point: -1.0}]}';
