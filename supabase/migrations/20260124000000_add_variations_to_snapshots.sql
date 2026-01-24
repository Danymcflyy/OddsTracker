-- Add markets_variations column to closing_odds_snapshots
ALTER TABLE closing_odds_snapshots ADD COLUMN IF NOT EXISTS markets_variations JSONB;

-- Comment for documentation
COMMENT ON COLUMN closing_odds_snapshots.markets_variations IS 'Stores all variations (points) for each market at the time of capture';
