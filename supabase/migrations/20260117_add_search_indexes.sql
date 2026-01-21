-- Migration: Add search indexes for better performance
-- Date: 2026-01-17
-- Description: Creates GIN indexes for full-text search on team names

-- Enable pg_trgm extension for trigram matching (better than basic ilike)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for team name searches
-- These indexes significantly improve performance of ILIKE queries
CREATE INDEX IF NOT EXISTS idx_events_home_team_gin 
ON events USING gin(home_team gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_events_away_team_gin 
ON events USING gin(away_team gin_trgm_ops);

-- Create composite index for frequently used filters
CREATE INDEX IF NOT EXISTS idx_events_sport_commence 
ON events(sport_key, commence_time DESC);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_events_status_commence 
ON events(status, commence_time DESC);

-- Create index for market_states lookups
CREATE INDEX IF NOT EXISTS idx_market_states_event_status 
ON market_states(event_id, status);

CREATE INDEX IF NOT EXISTS idx_market_states_status_deadline 
ON market_states(status, deadline) 
WHERE status = 'pending';

-- Create index for API usage logs
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at 
ON api_usage_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_job_created 
ON api_usage_logs(job_name, created_at DESC);

-- Comment the indexes for documentation
COMMENT ON INDEX idx_events_home_team_gin IS 'GIN index for fast ILIKE searches on home team names';
COMMENT ON INDEX idx_events_away_team_gin IS 'GIN index for fast ILIKE searches on away team names';
COMMENT ON INDEX idx_events_sport_commence IS 'Composite index for filtering by sport and sorting by commence_time';
COMMENT ON INDEX idx_events_status_commence IS 'Composite index for filtering by status and sorting by commence_time';
COMMENT ON INDEX idx_market_states_event_status IS 'Index for looking up market states by event and status';
COMMENT ON INDEX idx_market_states_status_deadline IS 'Partial index for pending markets with deadlines';
COMMENT ON INDEX idx_api_usage_logs_created_at IS 'Index for sorting API usage logs by date';
COMMENT ON INDEX idx_api_usage_logs_job_created IS 'Index for filtering API usage logs by job name and date';
