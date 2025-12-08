-- Ajouter une colonne pour verrouiller les fixtures après la clôture
ALTER TABLE fixtures
ADD COLUMN IF NOT EXISTS odds_locked_at TIMESTAMP;
