-- Migration: Create closing_odds_snapshots table for multi-capture strategy
-- Date: 2026-01-21
-- Description: Stores multiple snapshots of closing odds (M-10 to M+10) for each event

-- Create the closing_odds_snapshots table
CREATE TABLE IF NOT EXISTS closing_odds_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Snapshot timing info
  captured_at TIMESTAMPTZ NOT NULL,                -- When we captured this snapshot
  bookmaker_last_update TIMESTAMPTZ,               -- Bookmaker's last_update timestamp
  minutes_before_kickoff INTEGER NOT NULL,         -- -10, -5, 0, +5, +10, etc.

  -- Odds data
  markets JSONB NOT NULL,                          -- All market odds (h2h, spreads, totals, etc.)
  bookmaker TEXT NOT NULL,                         -- pinnacle, bet365, betfair_ex_eu, onexbet

  -- Metadata
  api_request_count INTEGER DEFAULT 1,             -- Credits used for this capture
  is_selected BOOLEAN DEFAULT false,               -- TRUE for the final selected snapshot

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(event_id, minutes_before_kickoff, bookmaker)
);

-- Indexes for performance
CREATE INDEX idx_closing_snapshots_event ON closing_odds_snapshots(event_id);
CREATE INDEX idx_closing_snapshots_selected ON closing_odds_snapshots(event_id, is_selected);
CREATE INDEX idx_closing_snapshots_timing ON closing_odds_snapshots(minutes_before_kickoff);
CREATE INDEX idx_closing_snapshots_captured_at ON closing_odds_snapshots(captured_at);

-- Comments
COMMENT ON TABLE closing_odds_snapshots IS 'Stores multiple snapshots of closing odds captured from M-10 to M+10 for each event';
COMMENT ON COLUMN closing_odds_snapshots.minutes_before_kickoff IS 'Minutes before kick-off: negative = after kick-off (e.g. -5 = 5 min after)';
COMMENT ON COLUMN closing_odds_snapshots.is_selected IS 'TRUE for the snapshot selected as final closing odds (best last_update)';
COMMENT ON COLUMN closing_odds_snapshots.markets IS 'JSONB structure: {h2h: {home: 2.05, draw: 3.40, away: 3.80, last_update: "..."}, spreads: {...}, totals: {...}}';

-- Grant permissions (adjust role name if needed)
-- ALTER TABLE closing_odds_snapshots ENABLE ROW LEVEL SECURITY;
