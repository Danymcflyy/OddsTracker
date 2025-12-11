-- OddsTracker v2 - Schéma avec Odds-API.io (Pinnacle)
-- Architecture basée sur machine à états pour gestion des cotes

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: sports_v2
-- Définition des sports supportés
-- ============================================================================
CREATE TABLE IF NOT EXISTS sports_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oddsapi_slug VARCHAR(50) UNIQUE NOT NULL,  -- Slug de l'API (ex: 'Football', 'Tennis')
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO sports_v2 (oddsapi_slug, name, slug) VALUES
('Football', 'Football', 'football'),
('Tennis', 'Tennis', 'tennis')
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_sports_v2_slug ON sports_v2(slug);

-- ============================================================================
-- TABLE: countries_v2
-- Pays pour normalisation des ligues/équipes
-- ============================================================================
CREATE TABLE IF NOT EXISTS countries_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oddsapi_slug VARCHAR(100),  -- Slug API (peut être NULL pour international)
  name VARCHAR(100) NOT NULL,
  iso_code VARCHAR(3),        -- Code ISO 3166-1 alpha-3
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(oddsapi_slug)
);

CREATE INDEX IF NOT EXISTS idx_countries_v2_slug ON countries_v2(oddsapi_slug);

-- ============================================================================
-- TABLE: leagues_v2
-- Championnats/Ligues pour Football et Tennis
-- ============================================================================
CREATE TABLE IF NOT EXISTS leagues_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oddsapi_slug VARCHAR(200) UNIQUE NOT NULL,  -- Slug de l'API (ex: 'england-premier-league')
  sport_id UUID NOT NULL REFERENCES sports_v2(id),
  country_id UUID REFERENCES countries_v2(id),
  name VARCHAR(200) NOT NULL,
  display_name VARCHAR(200),  -- Nom d'affichage (ex: 'Premier League')
  slug VARCHAR(200) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leagues_v2_sport ON leagues_v2(sport_id);
CREATE INDEX IF NOT EXISTS idx_leagues_v2_country ON leagues_v2(country_id);
CREATE INDEX IF NOT EXISTS idx_leagues_v2_slug ON leagues_v2(oddsapi_slug);

-- ============================================================================
-- TABLE: teams_v2
-- Équipes (Football) avec normalisation
-- ============================================================================
CREATE TABLE IF NOT EXISTS teams_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oddsapi_name VARCHAR(200) NOT NULL,  -- Nom exact de l'API
  normalized_name VARCHAR(200) NOT NULL,  -- Nom normalisé pour matching
  display_name VARCHAR(200),  -- Nom d'affichage
  sport_id UUID NOT NULL REFERENCES sports_v2(id),
  country_id UUID REFERENCES countries_v2(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sport_id, normalized_name)
);

CREATE INDEX IF NOT EXISTS idx_teams_v2_sport ON teams_v2(sport_id);
CREATE INDEX IF NOT EXISTS idx_teams_v2_normalized ON teams_v2(normalized_name);

-- ============================================================================
-- TABLE: players_v2
-- Joueurs (Tennis) avec normalisation
-- ============================================================================
CREATE TABLE IF NOT EXISTS players_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oddsapi_name VARCHAR(200) NOT NULL,  -- Nom exact de l'API
  normalized_name VARCHAR(200) NOT NULL,  -- Nom normalisé
  display_name VARCHAR(200),  -- Nom d'affichage
  gender VARCHAR(10),  -- 'male', 'female'
  nationality VARCHAR(3),  -- Code ISO
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(normalized_name, gender)
);

CREATE INDEX IF NOT EXISTS idx_players_v2_normalized ON players_v2(normalized_name);

-- ============================================================================
-- TABLE: events_to_track (Machine à états)
-- Gestion du cycle de vie des matchs avec états
-- ============================================================================
CREATE TABLE IF NOT EXISTS events_to_track (
  event_id BIGINT PRIMARY KEY,  -- ID Odds-API.io
  sport_slug TEXT NOT NULL,
  league_slug TEXT,
  home_team_id UUID REFERENCES teams_v2(id),  -- Football
  away_team_id UUID REFERENCES teams_v2(id),  -- Football
  player1_id UUID REFERENCES players_v2(id),  -- Tennis
  player2_id UUID REFERENCES players_v2(id),  -- Tennis
  event_date TIMESTAMPTZ,
  status TEXT,  -- 'pending', 'live', 'settled'

  -- Machine à états
  state TEXT NOT NULL,  -- 'DISCOVERED_NO_ODDS', 'OPENING_CAPTURED_SLEEPING', 'ACTIVE_NEAR_KO', 'FINISHED'
  next_scan_at TIMESTAMPTZ,

  -- Résultats
  home_score INTEGER,
  away_score INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_state ON events_to_track(state);
CREATE INDEX IF NOT EXISTS idx_events_next_scan ON events_to_track(next_scan_at);
CREATE INDEX IF NOT EXISTS idx_events_sport ON events_to_track(sport_slug);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events_to_track(event_date);

-- ============================================================================
-- TABLE: opening_closing_observed
-- Cotes Pinnacle observées (opening et closing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS opening_closing_observed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id BIGINT NOT NULL REFERENCES events_to_track(event_id) ON DELETE CASCADE,
  sport_slug TEXT NOT NULL,
  league_slug TEXT,
  bookmaker TEXT DEFAULT 'Pinnacle',
  market_name TEXT NOT NULL,  -- 'h2h', 'spreads', 'totals', etc.
  selection TEXT NOT NULL,  -- 'home', 'draw', 'away', 'over', 'under', 'player1', etc.
  line NUMERIC,  -- Handicap/Total si applicable

  -- Opening observé
  opening_price_observed NUMERIC,
  opening_time_observed TIMESTAMPTZ,

  -- Closing observé
  closing_price_observed NUMERIC,
  closing_time_observed TIMESTAMPTZ,

  -- Résultat
  is_winner BOOLEAN,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Use partial unique index instead of constraint to handle COALESCE
CREATE UNIQUE INDEX IF NOT EXISTS idx_opening_closing_unique
ON opening_closing_observed(event_id, bookmaker, market_name, selection, COALESCE(line, 0));

CREATE INDEX IF NOT EXISTS idx_opening_closing_event ON opening_closing_observed(event_id);
CREATE INDEX IF NOT EXISTS idx_opening_closing_market ON opening_closing_observed(market_name);
CREATE INDEX IF NOT EXISTS idx_opening_closing_bookmaker ON opening_closing_observed(bookmaker);

-- ============================================================================
-- TABLE: match_results
-- Résultats finaux des matchs
-- ============================================================================
CREATE TABLE IF NOT EXISTS match_results (
  event_id BIGINT PRIMARY KEY REFERENCES events_to_track(event_id) ON DELETE CASCADE,
  sport_slug TEXT NOT NULL,
  league_slug TEXT,
  home_team_id UUID REFERENCES teams_v2(id),  -- Football
  away_team_id UUID REFERENCES teams_v2(id),  -- Football
  player1_id UUID REFERENCES players_v2(id),  -- Tennis
  player2_id UUID REFERENCES players_v2(id),  -- Tennis
  home_score INTEGER,
  away_score INTEGER,
  detailed_score JSONB,  -- Scores détaillés (sets pour tennis, etc.)
  event_date TIMESTAMPTZ,
  status TEXT,  -- 'settled', 'voided', etc.
  settled_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_results_sport ON match_results(sport_slug);

-- ============================================================================
-- TABLE: markets_v2
-- Définition des marchés disponibles par sport
-- ============================================================================
CREATE TABLE IF NOT EXISTS markets_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID NOT NULL REFERENCES sports_v2(id),
  oddsapi_key VARCHAR(100) NOT NULL,
  market_type VARCHAR(50) NOT NULL,
  period VARCHAR(50) DEFAULT 'fulltime',
  handicap NUMERIC,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Use partial unique index instead of constraint to handle COALESCE
CREATE UNIQUE INDEX IF NOT EXISTS idx_markets_v2_unique
ON markets_v2(sport_id, oddsapi_key, period, COALESCE(handicap, 0));

CREATE INDEX IF NOT EXISTS idx_markets_v2_sport ON markets_v2(sport_id);
CREATE INDEX IF NOT EXISTS idx_markets_v2_type ON markets_v2(market_type);

-- ============================================================================
-- TABLE: outcomes_v2
-- Issues/Résultats pour chaque marché
-- ============================================================================
CREATE TABLE IF NOT EXISTS outcomes_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID NOT NULL REFERENCES markets_v2(id),
  oddsapi_name VARCHAR(100) NOT NULL,  -- 'Home', 'Away', 'Draw', 'Over', 'Under', etc.
  normalized_name VARCHAR(100) NOT NULL,  -- '1', 'X', '2', 'OVER', 'UNDER', etc.
  display_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(market_id, normalized_name)
);

CREATE INDEX IF NOT EXISTS idx_outcomes_v2_market ON outcomes_v2(market_id);

-- ============================================================================
-- Triggers pour updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_to_track_updated_at BEFORE UPDATE ON events_to_track
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opening_closing_observed_updated_at BEFORE UPDATE ON opening_closing_observed
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
