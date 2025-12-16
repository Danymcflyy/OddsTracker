-- ============================================================================
-- OddsTracker V3 - Schema Initial
-- Description: Schéma universel et optimisé pour le tracking de cotes sportives
-- Focus: Football (extensible aux autres sports)
-- ============================================================================

-- Extension pour génération d'UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: sports
-- Catalogue des sports supportés
-- ============================================================================
CREATE TABLE sports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oddsapi_key VARCHAR(50) UNIQUE NOT NULL,  -- Clé API: 'soccer', 'tennis'
  name VARCHAR(100) NOT NULL,                -- Nom d'affichage: 'Football'
  slug VARCHAR(50) UNIQUE NOT NULL,          -- Slug interne: 'football'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sports_slug ON sports(slug);
CREATE INDEX idx_sports_active ON sports(active) WHERE active = true;

COMMENT ON TABLE sports IS 'Catalogue des sports disponibles dans l''application';
COMMENT ON COLUMN sports.oddsapi_key IS 'Clé utilisée dans l''API Odds-API.io';

-- ============================================================================
-- TABLE: countries
-- Pays pour organisation géographique
-- ============================================================================
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  iso_code CHAR(3),                          -- ISO 3166-1 alpha-3
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_countries_name ON countries(name);

COMMENT ON TABLE countries IS 'Pays pour classement géographique des ligues et équipes';

-- ============================================================================
-- TABLE: leagues
-- Championnats/Ligues avec système de tracking
-- ============================================================================
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oddsapi_key VARCHAR(200) UNIQUE NOT NULL,  -- Clé API de la ligue
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,                -- Nom complet
  display_name VARCHAR(200),                 -- Nom court pour affichage
  tracked BOOLEAN DEFAULT false,             -- Toggle: suivre cette ligue?
  active BOOLEAN DEFAULT true,               -- Ligue toujours active dans l'API?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leagues_sport ON leagues(sport_id);
CREATE INDEX idx_leagues_country ON leagues(country_id);
CREATE INDEX idx_leagues_tracked ON leagues(tracked) WHERE tracked = true;
CREATE INDEX idx_leagues_oddsapi_key ON leagues(oddsapi_key);

COMMENT ON TABLE leagues IS 'Championnats et tournois. Le flag tracked détermine si on synchronise les matchs.';
COMMENT ON COLUMN leagues.tracked IS 'Si true, les matchs de cette ligue sont synchronisés par le cron job';

-- ============================================================================
-- TABLE: teams
-- Équipes avec normalisation des noms
-- ============================================================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  oddsapi_name VARCHAR(200) NOT NULL,        -- Nom exact retourné par l'API
  normalized_name VARCHAR(200) NOT NULL,     -- Nom normalisé (lowercase, sans accents)
  display_name VARCHAR(200),                 -- Nom d'affichage UI
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sport_id, oddsapi_name)
);

CREATE INDEX idx_teams_sport ON teams(sport_id);
CREATE INDEX idx_teams_normalized ON teams(normalized_name);
CREATE INDEX idx_teams_country ON teams(country_id);

COMMENT ON TABLE teams IS 'Équipes sportives avec normalisation pour matching robuste';
COMMENT ON COLUMN teams.normalized_name IS 'Utilisé pour recherche et matching (lowercase, sans accents)';

-- ============================================================================
-- TABLE: matches
-- Matchs/Événements sportifs
-- ============================================================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oddsapi_id BIGINT UNIQUE NOT NULL,         -- ID événement Odds-API.io
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  -- Détails du match
  match_date TIMESTAMPTZ NOT NULL,           -- Date/heure kickoff
  status VARCHAR(20) DEFAULT 'scheduled',    -- scheduled, live, finished, cancelled

  -- Scores (présents mais non mis à jour auto dans v1)
  home_score INTEGER,
  away_score INTEGER,
  home_ht_score INTEGER,                     -- Score mi-temps
  away_ht_score INTEGER,

  -- Métadonnées de tracking
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),   -- Première découverte
  last_updated_at TIMESTAMPTZ DEFAULT NOW(), -- Dernière mise à jour cotes

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_different_teams CHECK (home_team_id != away_team_id)
);

CREATE INDEX idx_matches_oddsapi ON matches(oddsapi_id);
CREATE INDEX idx_matches_sport ON matches(sport_id);
CREATE INDEX idx_matches_league ON matches(league_id);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX idx_matches_upcoming ON matches(match_date, status) WHERE status = 'scheduled';

COMMENT ON TABLE matches IS 'Matchs/événements sportifs découverts via API';
COMMENT ON COLUMN matches.home_score IS 'Score équipe domicile (sera mis à jour via API en v2)';
COMMENT ON COLUMN matches.first_seen_at IS 'Timestamp de découverte initiale du match';
COMMENT ON COLUMN matches.last_updated_at IS 'Dernière mise à jour des cotes pour ce match';

-- ============================================================================
-- TABLE: markets
-- Types de marchés de paris (1X2, Totals, Spreads, etc.)
-- ============================================================================
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  oddsapi_key VARCHAR(100) NOT NULL,         -- Clé API: 'h2h', 'totals', 'spreads'
  market_type VARCHAR(50) NOT NULL,          -- Type interne: '1x2', 'totals', 'spreads'
  name VARCHAR(200) NOT NULL,                -- Nom par défaut
  custom_name VARCHAR(200),                  -- Nom personnalisé par utilisateur
  description TEXT,
  period VARCHAR(20) DEFAULT 'fulltime',     -- 'fulltime', 'halftime'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sport_id, oddsapi_key, period)
);

CREATE INDEX idx_markets_sport ON markets(sport_id);
CREATE INDEX idx_markets_type ON markets(market_type);
CREATE INDEX idx_markets_active ON markets(active) WHERE active = true;
CREATE INDEX idx_markets_oddsapi_key ON markets(oddsapi_key);

COMMENT ON TABLE markets IS 'Définition des types de marchés de paris disponibles';
COMMENT ON COLUMN markets.custom_name IS 'Nom personnalisé défini par l''utilisateur (prioritaire sur name)';
COMMENT ON COLUMN markets.period IS 'Période du match: fulltime (90 min) ou halftime (45 min)';

-- ============================================================================
-- TABLE: odds
-- Table universelle pour toutes les cotes (opening + current)
-- ============================================================================
CREATE TABLE odds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,

  -- Détails de l'outcome
  outcome_type VARCHAR(50) NOT NULL,         -- 'home', 'draw', 'away', 'over', 'under'
  line NUMERIC(10,2),                        -- Ligne pour spreads/totals (ex: -1.5, 2.5)

  -- Cotes
  opening_odds NUMERIC(10,2),                -- Première cote capturée
  opening_timestamp TIMESTAMPTZ,             -- Quand capturée
  current_odds NUMERIC(10,2),                -- Cote actuelle (dernière valeur)
  current_updated_at TIMESTAMPTZ,            -- Dernière mise à jour

  -- Résultat
  is_winner BOOLEAN,                         -- Cet outcome a-t-il gagné?

  -- Métadonnées
  bookmaker VARCHAR(50) DEFAULT 'Pinnacle',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index unique avec fonction COALESCE pour gérer les NULL
CREATE UNIQUE INDEX idx_odds_unique_outcome
  ON odds(match_id, market_id, outcome_type, COALESCE(line, 0));

CREATE INDEX idx_odds_match ON odds(match_id);
CREATE INDEX idx_odds_market ON odds(market_id);
CREATE INDEX idx_odds_outcome ON odds(outcome_type);
CREATE INDEX idx_odds_line ON odds(line) WHERE line IS NOT NULL;
CREATE INDEX idx_odds_winner ON odds(is_winner) WHERE is_winner IS NOT NULL;
CREATE INDEX idx_odds_bookmaker ON odds(bookmaker);

COMMENT ON TABLE odds IS 'Table universelle stockant toutes les cotes (opening + current)';
COMMENT ON COLUMN odds.opening_odds IS 'Première cote capturée (ne change jamais après insertion)';
COMMENT ON COLUMN odds.current_odds IS 'Cote actuelle (mise à jour à chaque sync)';
COMMENT ON COLUMN odds.line IS 'Ligne/handicap pour spreads et totals (NULL pour marchés 1X2)';
COMMENT ON COLUMN odds.is_winner IS 'Résultat: true si cet outcome a gagné, false si perdu, NULL si non déterminé';

-- ============================================================================
-- TABLE: league_sync_log
-- Historique des synchronisations par ligue
-- ============================================================================
CREATE TABLE league_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL,            -- 'discovery', 'odds_update'
  status VARCHAR(20) NOT NULL,               -- 'success', 'error'
  matches_discovered INTEGER DEFAULT 0,
  matches_updated INTEGER DEFAULT 0,
  odds_captured INTEGER DEFAULT 0,
  error_message TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_log_league ON league_sync_log(league_id);
CREATE INDEX idx_sync_log_date ON league_sync_log(synced_at);
CREATE INDEX idx_sync_log_status ON league_sync_log(status);

COMMENT ON TABLE league_sync_log IS 'Log des synchronisations API pour monitoring et debugging';

-- ============================================================================
-- TRIGGERS - Auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sports_updated_at
  BEFORE UPDATE ON sports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_leagues_updated_at
  BEFORE UPDATE ON leagues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_markets_updated_at
  BEFORE UPDATE ON markets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_odds_updated_at
  BEFORE UPDATE ON odds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED DATA - Sports
-- ============================================================================
INSERT INTO sports (oddsapi_key, name, slug, active) VALUES
('football', 'Football', 'football', true),
('tennis', 'Tennis', 'tennis', false)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED DATA - Countries
-- ============================================================================
INSERT INTO countries (name, iso_code) VALUES
('England', 'GBR'),
('Spain', 'ESP'),
('Italy', 'ITA'),
('Germany', 'DEU'),
('France', 'FRA'),
('Portugal', 'PRT'),
('Netherlands', 'NLD'),
('Belgium', 'BEL'),
('Scotland', 'GBR'),
('Turkey', 'TUR'),
('Austria', 'AUT'),
('Switzerland', 'CHE'),
('Greece', 'GRC'),
('International', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED DATA - Football Markets (marchés de base)
-- Ces marchés seront enrichis dynamiquement par l'API
-- ============================================================================
DO $$
DECLARE
  football_id UUID;
BEGIN
  -- Récupérer l'ID du sport football
  SELECT id INTO football_id FROM sports WHERE slug = 'football';

  -- Marchés fulltime
  INSERT INTO markets (sport_id, oddsapi_key, market_type, name, period, active) VALUES
  (football_id, 'h2h', '1x2', 'Match Result', 'fulltime', true),
  (football_id, 'totals', 'totals', 'Total Goals', 'fulltime', true),
  (football_id, 'spreads', 'spreads', 'Asian Handicap', 'fulltime', true),
  (football_id, 'btts', 'btts', 'Both Teams To Score', 'fulltime', true),
  (football_id, 'team_totals_home', 'team_totals', 'Home Team Total Goals', 'fulltime', true),
  (football_id, 'team_totals_away', 'team_totals', 'Away Team Total Goals', 'fulltime', true)
  ON CONFLICT DO NOTHING;

  -- Marchés halftime
  INSERT INTO markets (sport_id, oddsapi_key, market_type, name, period, active) VALUES
  (football_id, 'h2h', '1x2', 'Half Time Result', 'halftime', true),
  (football_id, 'totals', 'totals', 'Half Time Total Goals', 'halftime', true)
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================================
-- Afficher résumé de la création
-- ============================================================================
DO $$
DECLARE
  sports_count INTEGER;
  countries_count INTEGER;
  markets_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO sports_count FROM sports;
  SELECT COUNT(*) INTO countries_count FROM countries;
  SELECT COUNT(*) INTO markets_count FROM markets;

  RAISE NOTICE '✅ Schema v3 créé avec succès!';
  RAISE NOTICE '   - % sports', sports_count;
  RAISE NOTICE '   - % countries', countries_count;
  RAISE NOTICE '   - % markets', markets_count;
END $$;
