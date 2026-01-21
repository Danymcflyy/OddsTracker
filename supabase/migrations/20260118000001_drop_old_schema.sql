-- Migration: Drop Old Schema (Clean Slate)
-- Created: 2026-01-18
-- Description: Drop all old tables to start fresh with The Odds API v4

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS events_with_market_progress CASCADE;
DROP VIEW IF EXISTS api_usage_daily_summary CASCADE;

-- Drop old tables (from previous API implementation)
DROP TABLE IF EXISTS sync_logs CASCADE;
DROP TABLE IF EXISTS odds CASCADE;
DROP TABLE IF EXISTS outcomes CASCADE;
DROP TABLE IF EXISTS markets CASCADE;
DROP TABLE IF EXISTS fixtures CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS leagues CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS sports CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Drop new tables if they exist (in case of re-run)
DROP TABLE IF EXISTS api_usage_logs CASCADE;
DROP TABLE IF EXISTS closing_odds CASCADE;
DROP TABLE IF EXISTS market_states CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Drop old functions/triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

COMMENT ON SCHEMA public IS 'Old schema cleaned - ready for The Odds API v4';
