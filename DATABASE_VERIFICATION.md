# 🗄️ Vérification de la Base de Données - OddsTracker

Guide pour vérifier que la migration SQL s'est bien exécutée dans Supabase.

## ✅ Fichier de Migration

**Localisation** : [lib/db/migrations/001_initial_schema.sql](lib/db/migrations/001_initial_schema.sql)

**Contenu** :
- 9 tables créées
- 4 sports insérés
- 8 settings insérés
- 15+ index optimisés
- Contraintes de clés étrangères

## 📊 Structure de la Base de Données

### Tables Créées (9 au total)

| Table | Description | Données initiales |
|-------|-------------|-------------------|
| **sports** | 4 sports disponibles | ✅ 4 lignes |
| **countries** | Pays des compétitions | Vide |
| **leagues** | Compétitions par sport | Vide |
| **teams** | Équipes | Vide |
| **fixtures** | Matchs | Vide |
| **markets** | Types de paris | Vide |
| **outcomes** | Résultats possibles | Vide |
| **odds** | Cotes opening/closing | Vide |
| **settings** | Configuration app | ✅ 8 lignes |
| **sync_logs** | Logs de synchronisation | Vide |

## 🔍 Vérification Rapide (Interface Supabase)

### Méthode 1 : Via Table Editor

1. Aller dans **Table Editor** (menu latéral)
2. Vérifier que vous voyez 9 tables :
   - countries
   - fixtures
   - leagues
   - markets
   - odds
   - outcomes
   - settings
   - sports ✅
   - sync_logs

3. Ouvrir la table **sports** :
   - Devrait contenir 4 lignes :
     - Football (oddspapi_id: 10)
     - Hockey (oddspapi_id: 4)
     - Tennis (oddspapi_id: 2)
     - Volleyball (oddspapi_id: 34)

4. Ouvrir la table **settings** :
   - Devrait contenir 8 lignes :
     - password_hash
     - last_sync
     - auto_sync_enabled
     - auto_sync_time
     - extra_sync_enabled
     - extra_sync_time
     - api_requests_count
     - api_requests_reset_date

### Méthode 2 : Via SQL Editor

1. Aller dans **SQL Editor**
2. Copier/coller le contenu de [scripts/verify-db.sql](scripts/verify-db.sql)
3. Cliquer sur "Run"
4. Vérifier les résultats

## 📋 Checklist de Vérification

### Étape 1 : Tables
```sql
-- Compter les tables
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
```
✅ Résultat attendu : **9 tables**

### Étape 2 : Données Initiales
```sql
-- Vérifier les sports
SELECT COUNT(*) as sport_count FROM sports;
```
✅ Résultat attendu : **4 sports**

```sql
-- Vérifier les settings
SELECT COUNT(*) as settings_count FROM settings;
```
✅ Résultat attendu : **8 settings**

### Étape 3 : Index
```sql
-- Compter les index
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';
```
✅ Résultat attendu : **≥ 15 index**

### Étape 4 : Contraintes FK
```sql
-- Vérifier les clés étrangères
SELECT COUNT(*) as fk_count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_schema = 'public';
```
✅ Résultat attendu : **≥ 10 contraintes**

## 🏗️ Détail des Tables

### 1. sports
```sql
CREATE TABLE sports (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Données initiales** :
- Football (10)
- Hockey (4)
- Tennis (2)
- Volleyball (34)

### 2. countries
```sql
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  oddspapi_slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL
);
```

**Sera rempli** lors de la première synchronisation.

### 3. leagues
```sql
CREATE TABLE leagues (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  sport_id INTEGER REFERENCES sports(id),
  country_id INTEGER REFERENCES countries(id),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL
);
```

**Index** :
- idx_leagues_sport
- idx_leagues_country

### 4. teams
```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL
);
```

### 5. fixtures
```sql
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
```

**Index** :
- idx_fixtures_sport
- idx_fixtures_league
- idx_fixtures_start_time
- idx_fixtures_home_team
- idx_fixtures_away_team

### 6. markets
```sql
CREATE TABLE markets (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255)
);
```

Exemples de marchés :
- 1X2 (Match Result)
- Over/Under 2.5
- Handicap Asiatique

### 7. outcomes
```sql
CREATE TABLE outcomes (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  market_id INTEGER REFERENCES markets(id),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255)
);
```

**Index** :
- idx_outcomes_market

Exemples d'outcomes :
- Home (1)
- Draw (X)
- Away (2)
- Over 2.5
- Under 2.5

### 8. odds
```sql
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
```

**Index** :
- idx_odds_fixture
- idx_odds_market
- idx_odds_outcome
- idx_odds_opening_price
- idx_odds_closing_price
- idx_odds_is_winner

**Note** : `ON DELETE CASCADE` = si un fixture est supprimé, toutes ses cotes sont supprimées automatiquement.

### 9. settings
```sql
CREATE TABLE settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Données initiales** :
| Key | Valeur par défaut |
|-----|-------------------|
| password_hash | '' (vide) |
| last_sync | '' (vide) |
| auto_sync_enabled | 'true' |
| auto_sync_time | '06:00' |
| extra_sync_enabled | 'false' |
| extra_sync_time | '18:00' |
| api_requests_count | '0' |
| api_requests_reset_date | '' (vide) |

### 10. sync_logs
```sql
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
```

**Index** :
- idx_sync_logs_sport
- idx_sync_logs_status

## 🧪 Test d'Insertion

Pour tester que tout fonctionne, essayez d'insérer un pays :

```sql
-- Insérer un pays de test
INSERT INTO countries (oddspapi_slug, name)
VALUES ('test-france', 'France');

-- Vérifier
SELECT * FROM countries WHERE oddspapi_slug = 'test-france';

-- Nettoyer
DELETE FROM countries WHERE oddspapi_slug = 'test-france';
```

Si ça fonctionne, votre base de données est prête ! ✅

## 🔗 Relations entre les Tables

```
sports (4 sports)
  ├─→ leagues (par sport_id)
  │    ├─→ fixtures (par league_id)
  │    │    └─→ odds (par fixture_id) [CASCADE DELETE]
  │    │         ├─→ markets (par market_id)
  │    │         └─→ outcomes (par outcome_id)
  │    └─→ countries (par country_id)
  └─→ teams (via fixtures.home_team_id et away_team_id)

settings (config globale)
sync_logs (logs des synchronisations par sport_id)
```

## ⚠️ Problèmes Courants

### Erreur "relation already exists"
→ Les tables existent déjà
→ Solution : Supprimer les tables existantes ou utiliser `DROP TABLE IF EXISTS`

### Erreur de contrainte FK
→ L'ordre d'insertion des données est important
→ Solution : Vérifier que les tables parentes existent avant d'insérer dans les tables enfants

### Erreur "permission denied"
→ Problème de permissions Supabase
→ Solution : Vérifier que vous êtes bien connecté au bon projet

## 📚 Requêtes Utiles

### Compter les enregistrements
```sql
SELECT
  'sports' as table_name, COUNT(*) as count FROM sports
UNION ALL
  SELECT 'countries', COUNT(*) FROM countries
UNION ALL
  SELECT 'leagues', COUNT(*) FROM leagues
UNION ALL
  SELECT 'teams', COUNT(*) FROM teams
UNION ALL
  SELECT 'fixtures', COUNT(*) FROM fixtures
UNION ALL
  SELECT 'markets', COUNT(*) FROM markets
UNION ALL
  SELECT 'outcomes', COUNT(*) FROM outcomes
UNION ALL
  SELECT 'odds', COUNT(*) FROM odds
UNION ALL
  SELECT 'settings', COUNT(*) FROM settings
UNION ALL
  SELECT 'sync_logs', COUNT(*) FROM sync_logs;
```

### Voir la structure d'une table
```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'odds'
ORDER BY ordinal_position;
```

### Voir tous les index
```sql
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## ✅ Résumé

Après exécution de la migration, vous devriez avoir :

- ✅ **9 tables** créées
- ✅ **4 sports** dans la table sports
- ✅ **8 clés** dans la table settings
- ✅ **15+ index** pour les performances
- ✅ **10+ contraintes FK** pour l'intégrité
- ✅ **1 contrainte CASCADE** sur odds.fixture_id

Si tous ces points sont validés, votre base de données est **100% prête** pour OddsTracker ! 🎉

---

**Prochaine étape** : Démarrer le développement de l'application avec `npm run dev`
