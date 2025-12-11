-- Migration : Améliorer la table markets pour supporter les marchés Pinnacle

-- Ajouter les colonnes manquantes
ALTER TABLE markets
  ADD COLUMN sport_id INTEGER REFERENCES sports(id),
  ADD COLUMN market_type VARCHAR(50),
  ADD COLUMN period VARCHAR(50),
  ADD COLUMN handicap DECIMAL(10,3),
  ADD COLUMN player_prop BOOLEAN DEFAULT false,
  ADD COLUMN active BOOLEAN DEFAULT true;

-- Créer des index pour les recherches
CREATE INDEX idx_markets_sport ON markets(sport_id);
CREATE INDEX idx_markets_type ON markets(market_type);
CREATE INDEX idx_markets_period ON markets(period);
CREATE INDEX idx_markets_active ON markets(active);

-- Commentaires pour la documentation
COMMENT ON COLUMN markets.sport_id IS 'Référence au sport (10=Football, 12=Tennis, 15=Hockey, 23=Volleyball)';
COMMENT ON COLUMN markets.market_type IS 'Type de marché (1x2, totals, spreads, etc.)';
COMMENT ON COLUMN markets.period IS 'Période du marché (fulltime, halftime, etc.)';
COMMENT ON COLUMN markets.handicap IS 'Ligne de handicap pour totals/spreads (ex: 2.5, -1.5)';
COMMENT ON COLUMN markets.player_prop IS 'Indique si c''est un marché de joueur';
COMMENT ON COLUMN markets.active IS 'Marché actif ou archivé';
