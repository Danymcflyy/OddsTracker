-- OddsTracker - Schéma initial de base de données

-- Table sports
CREATE TABLE sports (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO sports (oddspapi_id, name, slug) VALUES
(10, 'Football', 'football'),
(4, 'Hockey', 'hockey'),
(2, 'Tennis', 'tennis'),
(34, 'Volleyball', 'volleyball');

-- Table countries
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  oddspapi_slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- Table leagues
CREATE TABLE leagues (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  sport_id INTEGER REFERENCES sports(id),
  country_id INTEGER REFERENCES countries(id),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL
);

CREATE INDEX idx_leagues_sport ON leagues(sport_id);
CREATE INDEX idx_leagues_country ON leagues(country_id);

-- Table teams
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL
);

-- Table fixtures
CREATE TABLE fixtures (
  id SERIAL PRIMARY KEY,
  oddspapi_id VARCHAR(50) UNIQUE NOT NULL,
  sport_id INTEGER REFERENCES sports(id),
  league_id INTEGER REFERENCES leagues(id),
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  start_time TIMESTAMP NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fixtures_sport ON fixtures(sport_id);
CREATE INDEX idx_fixtures_league ON fixtures(league_id);
CREATE INDEX idx_fixtures_start_time ON fixtures(start_time);
CREATE INDEX idx_fixtures_home_team ON fixtures(home_team_id);
CREATE INDEX idx_fixtures_away_team ON fixtures(away_team_id);

-- Table markets
CREATE TABLE markets (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255)
);

-- Table outcomes
CREATE TABLE outcomes (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  market_id INTEGER REFERENCES markets(id),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255)
);

CREATE INDEX idx_outcomes_market ON outcomes(market_id);

-- Table odds
CREATE TABLE odds (
  id SERIAL PRIMARY KEY,
  fixture_id INTEGER REFERENCES fixtures(id) ON DELETE CASCADE,
  market_id INTEGER REFERENCES markets(id),
  outcome_id INTEGER REFERENCES outcomes(id),
  opening_price DECIMAL(10,3),
  closing_price DECIMAL(10,3),
  opening_timestamp TIMESTAMP,
  closing_timestamp TIMESTAMP,
  is_winner BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_odds_fixture ON odds(fixture_id);
CREATE INDEX idx_odds_market ON odds(market_id);
CREATE INDEX idx_odds_outcome ON odds(outcome_id);
CREATE INDEX idx_odds_opening_price ON odds(opening_price);
CREATE INDEX idx_odds_closing_price ON odds(closing_price);
CREATE INDEX idx_odds_is_winner ON odds(is_winner);

-- Table settings
CREATE TABLE settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
('password_hash', ''),
('last_sync', ''),
('auto_sync_enabled', 'true'),
('auto_sync_time', '06:00'),
('extra_sync_enabled', 'false'),
('extra_sync_time', '18:00'),
('api_requests_count', '0'),
('api_requests_reset_date', '');

-- Table sync_logs
CREATE TABLE sync_logs (
  id SERIAL PRIMARY KEY,
  sport_id INTEGER REFERENCES sports(id),
  status VARCHAR(20) NOT NULL,
  records_fetched INTEGER DEFAULT 0,
  records_inserted INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_sync_logs_sport ON sync_logs(sport_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
