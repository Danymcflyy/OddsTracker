-- ============================================================================
-- Nettoyage du schéma V2 avant migration vers V3
-- Attention: Supprime toutes les données existantes (sauf settings)
-- ============================================================================

-- Désactiver temporairement les contraintes de clé étrangère
SET session_replication_role = 'replica';

-- Supprimer les tables v2 et v1 si elles existent
DROP TABLE IF EXISTS opening_closing_observed CASCADE;
DROP TABLE IF EXISTS match_results CASCADE;
DROP TABLE IF EXISTS outcomes_v2 CASCADE;
DROP TABLE IF EXISTS markets_v2 CASCADE;
DROP TABLE IF EXISTS players_v2 CASCADE;
DROP TABLE IF EXISTS teams_v2 CASCADE;
DROP TABLE IF EXISTS events_to_track CASCADE;
DROP TABLE IF EXISTS leagues_v2 CASCADE;
DROP TABLE IF EXISTS countries_v2 CASCADE;
DROP TABLE IF EXISTS sports_v2 CASCADE;

-- Supprimer anciennes tables si elles existent (schéma générique)
DROP TABLE IF EXISTS odds CASCADE;
DROP TABLE IF EXISTS league_sync_log CASCADE;
DROP TABLE IF EXISTS markets CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS leagues CASCADE;
DROP TABLE IF EXISTS countries CASCADE;
DROP TABLE IF EXISTS sports CASCADE;

-- Supprimer les vues de compatibilité si elles existent
DROP VIEW IF EXISTS fixtures CASCADE;
DROP VIEW IF EXISTS outcomes CASCADE;

-- Supprimer les anciennes fonctions si elles existent
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Nettoyage terminé - Prêt pour schema v3';
END $$;
