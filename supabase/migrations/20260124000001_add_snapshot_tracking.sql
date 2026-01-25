-- Add snapshot tracking columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS last_snapshot_at TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS snapshot_count INTEGER DEFAULT 0;

-- Comment for documentation
COMMENT ON COLUMN events.last_snapshot_at IS 'Timestamp of the most recent closing odds snapshot captured';
COMMENT ON COLUMN events.snapshot_count IS 'Total number of closing odds snapshots captured for this event';
