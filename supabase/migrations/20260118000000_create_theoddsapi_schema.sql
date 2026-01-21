-- Migration: Create The Odds API v4 Schema
-- Created: 2026-01-18
-- Description: Complete database schema for The Odds API v4 integration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: sports
-- Stores available sports from The Odds API
-- ============================================================================
CREATE TABLE IF NOT EXISTS sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key TEXT UNIQUE NOT NULL,           -- e.g., 'soccer_epl'
  title TEXT NOT NULL,                     -- e.g., 'EPL'
  description TEXT,
  sport_group TEXT,                        -- e.g., 'soccer'
  active BOOLEAN DEFAULT true,
  has_outrights BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sports_api_key ON sports(api_key);
CREATE INDEX idx_sports_active ON sports(active);

-- ============================================================================
-- TABLE: events
-- Stores soccer matches/events
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_event_id TEXT UNIQUE NOT NULL,      -- The Odds API event ID
  sport_id UUID REFERENCES sports(id) ON DELETE CASCADE,
  sport_key TEXT NOT NULL,                 -- Denormalized for quick access
  sport_title TEXT,
  commence_time TIMESTAMPTZ NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming',          -- upcoming|live|completed
  home_score INTEGER,
  away_score INTEGER,
  completed BOOLEAN DEFAULT false,
  last_api_update TIMESTAMPTZ,             -- Last update from API
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_api_id ON events(api_event_id);
CREATE INDEX idx_events_sport_id ON events(sport_id);
CREATE INDEX idx_events_sport_key ON events(sport_key);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_commence_time ON events(commence_time);
CREATE INDEX idx_events_completed ON events(completed);

-- ============================================================================
-- TABLE: market_states
-- Tracks opening odds capture state for each market per event
-- ============================================================================
CREATE TABLE IF NOT EXISTS market_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  market_key TEXT NOT NULL,                -- h2h, spreads, totals, h2h_h1, etc.
  status TEXT DEFAULT 'pending',           -- pending|captured|not_offered

  -- Opening odds data (stored as JSONB for flexibility)
  opening_odds JSONB,                      -- {home: 2.1, away: 3.5, draw: 3.2, point: 1.5}
  opening_captured_at TIMESTAMPTZ,
  opening_bookmaker_update TIMESTAMPTZ,    -- Bookmaker's last_update timestamp

  -- Metadata
  deadline TIMESTAMPTZ,                    -- Kickoff time (after which mark not_offered)
  attempts INTEGER DEFAULT 0,              -- Number of scan attempts
  last_attempt_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(event_id, market_key)
);

CREATE INDEX idx_market_states_event ON market_states(event_id);
CREATE INDEX idx_market_states_status ON market_states(status);
CREATE INDEX idx_market_states_market_key ON market_states(market_key);

-- ============================================================================
-- TABLE: closing_odds
-- Stores closing odds snapshot for completed events
-- ============================================================================
CREATE TABLE IF NOT EXISTS closing_odds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID UNIQUE REFERENCES events(id) ON DELETE CASCADE,

  -- All markets in one JSONB for atomic storage
  markets JSONB NOT NULL,                  -- {h2h: {...}, spreads: {...}, totals: {...}, ...}

  -- Capture metadata
  captured_at TIMESTAMPTZ NOT NULL,
  bookmaker_update TIMESTAMPTZ,            -- Bookmaker's last_update timestamp
  capture_status TEXT DEFAULT 'success',   -- success|missing|error
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Historical fallback (if used)
  used_historical_api BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_closing_odds_event ON closing_odds(event_id);
CREATE INDEX idx_closing_odds_status ON closing_odds(capture_status);
CREATE INDEX idx_closing_odds_captured_at ON closing_odds(captured_at);

-- ============================================================================
-- TABLE: settings
-- Application configuration (leagues, markets, scan frequency, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON settings(key);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('tracked_sports', '[]'::jsonb, 'List of sport keys to track'),
  ('tracked_markets', '["h2h", "spreads", "totals", "h2h_h1", "spreads_h1", "totals_h1"]'::jsonb, 'List of markets to track'),
  ('scan_frequency_minutes', '10'::jsonb, 'Frequency of opening odds scan (in minutes)'),
  ('use_historical_fallback', 'false'::jsonb, 'Use historical API if closing odds fail (10x cost)'),
  ('bookmaker', '"pinnacle"'::jsonb, 'Primary bookmaker to track'),
  ('region', '"eu"'::jsonb, 'API region for requests')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- TABLE: api_usage_logs
-- Logs API requests for monitoring and cost tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  sport_key TEXT,

  -- Request details
  request_params JSONB,

  -- Cost tracking
  credits_used INTEGER NOT NULL,
  credits_remaining INTEGER,

  -- Results
  events_processed INTEGER DEFAULT 0,
  markets_captured INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  -- Timing
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_logs_created_at ON api_usage_logs(created_at DESC);
CREATE INDEX idx_api_logs_job_name ON api_usage_logs(job_name);
CREATE INDEX idx_api_logs_endpoint ON api_usage_logs(endpoint);
CREATE INDEX idx_api_logs_sport_key ON api_usage_logs(sport_key);

-- ============================================================================
-- FUNCTIONS: Auto-update timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_sports_updated_at BEFORE UPDATE ON sports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_states_updated_at BEFORE UPDATE ON market_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_closing_odds_updated_at BEFORE UPDATE ON closing_odds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS: Useful aggregations
-- ============================================================================

-- View: Events with market capture progress
CREATE OR REPLACE VIEW events_with_market_progress AS
SELECT
  e.id,
  e.api_event_id,
  e.sport_key,
  e.home_team,
  e.away_team,
  e.commence_time,
  e.status,
  e.completed,
  COUNT(ms.id) FILTER (WHERE ms.status = 'captured') AS markets_captured,
  COUNT(ms.id) FILTER (WHERE ms.status = 'pending') AS markets_pending,
  COUNT(ms.id) FILTER (WHERE ms.status = 'not_offered') AS markets_not_offered,
  COUNT(ms.id) AS total_markets,
  CASE
    WHEN COUNT(ms.id) = 0 THEN 0
    ELSE (COUNT(ms.id) FILTER (WHERE ms.status = 'captured')::FLOAT / COUNT(ms.id)::FLOAT * 100)::INTEGER
  END AS capture_percentage,
  co.id IS NOT NULL AS has_closing_odds,
  e.created_at,
  e.updated_at
FROM events e
LEFT JOIN market_states ms ON e.id = ms.event_id
LEFT JOIN closing_odds co ON e.id = co.event_id
GROUP BY e.id, co.id;

-- View: API usage summary by day
CREATE OR REPLACE VIEW api_usage_daily_summary AS
SELECT
  DATE(created_at) AS date,
  job_name,
  COUNT(*) AS requests,
  SUM(credits_used) AS total_credits,
  AVG(credits_used) AS avg_credits_per_request,
  SUM(events_processed) AS total_events,
  SUM(markets_captured) AS total_markets_captured,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) AS successful_requests,
  SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) AS failed_requests
FROM api_usage_logs
GROUP BY DATE(created_at), job_name
ORDER BY date DESC, job_name;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE sports IS 'Available sports from The Odds API';
COMMENT ON TABLE events IS 'Soccer matches/events to track';
COMMENT ON TABLE market_states IS 'Opening odds capture state per market per event';
COMMENT ON TABLE closing_odds IS 'Closing odds snapshot for completed events';
COMMENT ON TABLE settings IS 'Application configuration';
COMMENT ON TABLE api_usage_logs IS 'API request logs for monitoring and cost tracking';
COMMENT ON VIEW events_with_market_progress IS 'Events with market capture progress stats';
COMMENT ON VIEW api_usage_daily_summary IS 'Daily API usage summary by job';
