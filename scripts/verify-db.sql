-- Script de vérification de la base de données OddsTracker
-- À exécuter dans Supabase SQL Editor après la migration

-- ============================================
-- 1. VÉRIFICATION DES TABLES
-- ============================================

-- Lister toutes les tables créées
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Résultat attendu : 9 tables
-- countries, fixtures, leagues, markets, odds, outcomes, settings, sports, sync_logs

-- ============================================
-- 2. VÉRIFICATION DES DONNÉES INITIALES
-- ============================================

-- Vérifier les sports (devrait retourner 4 lignes)
SELECT 'Sports' as table_name, COUNT(*) as count, 4 as expected FROM sports
UNION ALL
SELECT 'Settings', COUNT(*), 8 FROM settings;

-- Détail des sports insérés
SELECT
  id,
  oddspapi_id,
  name,
  slug
FROM sports
ORDER BY id;

-- Détail des settings insérés
SELECT
  key,
  value,
  updated_at
FROM settings
ORDER BY key;

-- ============================================
-- 3. VÉRIFICATION DES INDEX
-- ============================================

-- Lister tous les index créés
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Résultat attendu : Au moins 15 index
-- idx_leagues_sport, idx_leagues_country
-- idx_fixtures_sport, idx_fixtures_league, idx_fixtures_start_time, idx_fixtures_home_team, idx_fixtures_away_team
-- idx_outcomes_market
-- idx_odds_fixture, idx_odds_market, idx_odds_outcome, idx_odds_opening_price, idx_odds_closing_price, idx_odds_is_winner
-- idx_sync_logs_sport, idx_sync_logs_status

-- ============================================
-- 4. VÉRIFICATION DES CONTRAINTES
-- ============================================

-- Lister toutes les contraintes de clés étrangères
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ============================================
-- 5. VÉRIFICATION DES TYPES DE COLONNES
-- ============================================

-- Vérifier la structure de la table odds (la plus complexe)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'odds'
ORDER BY ordinal_position;

-- Vérifier la structure de la table fixtures
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'fixtures'
ORDER BY ordinal_position;

-- ============================================
-- 6. TEST D'INSERTION
-- ============================================

-- Test d'insertion dans countries (devrait fonctionner)
DO $$
BEGIN
  INSERT INTO countries (oddspapi_slug, name)
  VALUES ('test-country', 'Test Country');

  RAISE NOTICE 'Test insertion countries: OK';

  -- Nettoyer le test
  DELETE FROM countries WHERE oddspapi_slug = 'test-country';
END $$;

-- ============================================
-- 7. RÉSUMÉ
-- ============================================

-- Compter les enregistrements dans chaque table
SELECT
  'sports' as table_name,
  COUNT(*) as records,
  '4 attendus' as note
FROM sports
UNION ALL
SELECT 'countries', COUNT(*), 'Vide au départ' FROM countries
UNION ALL
SELECT 'leagues', COUNT(*), 'Vide au départ' FROM leagues
UNION ALL
SELECT 'teams', COUNT(*), 'Vide au départ' FROM teams
UNION ALL
SELECT 'fixtures', COUNT(*), 'Vide au départ' FROM fixtures
UNION ALL
SELECT 'markets', COUNT(*), 'Vide au départ' FROM markets
UNION ALL
SELECT 'outcomes', COUNT(*), 'Vide au départ' FROM outcomes
UNION ALL
SELECT 'odds', COUNT(*), 'Vide au départ' FROM odds
UNION ALL
SELECT 'settings', COUNT(*), '8 attendus' FROM settings
UNION ALL
SELECT 'sync_logs', COUNT(*), 'Vide au départ' FROM sync_logs;

-- ============================================
-- 8. VÉRIFICATION DE LA CASCADE DELETE
-- ============================================

-- Vérifier que la contrainte ON DELETE CASCADE est bien configurée sur odds.fixture_id
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'odds'
  AND kcu.column_name = 'fixture_id';

-- Devrait afficher delete_rule = 'CASCADE'

-- ============================================
-- FIN DE LA VÉRIFICATION
-- ============================================

-- Si toutes les requêtes ci-dessus s'exécutent sans erreur,
-- la migration a été effectuée avec succès ! ✅
