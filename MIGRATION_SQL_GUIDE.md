# Guide: Migration SQL Optimisée pour Recherche Avancée

## 📋 Vue d'ensemble

Cette migration ajoute une fonction PostgreSQL optimisée (`search_events`) qui permet de :
- Filtrer efficacement des millions de matchs
- Supporter tous les filtres avancés (oddsMin, oddsMax, oddsType, outcome, marketKey, pointValue, dropMin, status, minSnapshots)
- Utiliser les indexes PostgreSQL pour des performances maximales
- Éviter de charger toutes les données en mémoire JavaScript

## 🚀 Étapes d'installation

### Étape 1: Appliquer la migration SQL dans Supabase

1. **Ouvrez le SQL Editor dans Supabase:**
   - URL: https://lgpxxzrimxpwbvyfiqvh.supabase.co/project/lgpxxzrimxpwbvyfiqvh/sql/new

2. **Copiez le contenu de la migration:**
   - Fichier: `supabase/migrations/20260126000000_optimize_search_events.sql`

3. **Collez dans l'éditeur SQL et cliquez sur "Run"**

4. **Vérifiez que la migration s'est bien exécutée:**
   - Vous devriez voir un message de succès
   - Aucune erreur ne devrait apparaître

### Étape 2: Activer le paramètre use_sql_search

Exécutez le script d'activation:

```bash
npm run enable-sql-search
```

OU manuellement dans le SQL Editor de Supabase:

```sql
INSERT INTO settings (key, value, description)
VALUES ('use_sql_search', 'true', 'Use optimized PostgreSQL RPC for advanced search')
ON CONFLICT (key) DO UPDATE SET
  value = 'true',
  description = 'Use optimized PostgreSQL RPC for advanced search',
  updated_at = NOW();
```

### Étape 3: Vérifier que tout fonctionne

1. Ouvrez l'application
2. Allez sur la page Football
3. Testez les filtres avancés:
   - Fourchette de cotes (Min/Max)
   - Type de cotes (Ouverture/Clôture/Les deux)
   - Type de résultat (Home/Away/Draw/Over/Under/Yes/No)
   - Type de marché (h2h, spreads, totals, btts, etc.)
   - Valeur du point
   - Drop de cote minimum
   - Statut du match
   - Nombre minimum de snapshots

## ✅ Vérification

Pour vérifier que la fonction RPC existe:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'search_events'
  AND routine_schema = 'public';
```

Pour vérifier que use_sql_search est activé:

```sql
SELECT * FROM settings WHERE key = 'use_sql_search';
```

## 📊 Performance

**Avant (JS filtering):**
- Limite: 2000 matchs chargés en mémoire
- Problème: Pagination incorrecte avec filtres avancés
- Performance: Dégradée avec beaucoup de données

**Après (SQL RPC):**
- Limite: Aucune limite pratique (des millions de matchs)
- Pagination: Correcte et efficace
- Performance: Optimale grâce aux indexes PostgreSQL

## 🔍 Indexes créés

La migration crée automatiquement ces indexes:

```sql
idx_events_sport_key          -- Filtre par championnat
idx_events_commence_time      -- Tri par date
idx_events_status             -- Filtre par statut
idx_events_snapshot_count     -- Filtre par nombre de snapshots
idx_events_home_team_trgm     -- Recherche d'équipe (trigram)
idx_events_away_team_trgm     -- Recherche d'équipe (trigram)
idx_market_states_event_id    -- Jointure avec market_states
idx_market_states_market_key  -- Filtre par type de marché
idx_closing_odds_event_id     -- Jointure avec closing_odds
```

## 🎯 Paramètres de la fonction search_events

| Paramètre | Type | Description |
|-----------|------|-------------|
| `p_sport_key` | TEXT | Filtrer par championnat (ex: 'soccer_france_ligue_one') |
| `p_date_from` | TIMESTAMPTZ | Date de début |
| `p_date_to` | TIMESTAMPTZ | Date de fin |
| `p_search` | TEXT | Recherche d'équipe (fuzzy search) |
| `p_market_key` | TEXT | Type de marché (h2h, spreads, totals, etc.) |
| `p_odds_min` | NUMERIC | Cote minimum |
| `p_odds_max` | NUMERIC | Cote maximum |
| `p_odds_type` | TEXT | 'opening', 'closing' ou NULL (both) |
| `p_outcome` | TEXT | Type de résultat (home, away, draw, over, under, yes, no) |
| `p_point_value` | NUMERIC | Valeur du point (pour spreads/totals) |
| `p_drop_min` | NUMERIC | Drop minimum en % |
| `p_status` | TEXT | Statut du match (upcoming, completed) |
| `p_min_snapshots` | INTEGER | Nombre minimum de snapshots |
| `p_page` | INTEGER | Numéro de page (défaut: 1) |
| `p_page_size` | INTEGER | Taille de page (défaut: 50) |

## 🐛 Dépannage

### La fonction RPC n'existe pas

```
Error: function search_events does not exist
```

**Solution:** Exécutez la migration SQL (Étape 1)

### use_sql_search n'est pas activé

L'application utilise toujours le filtrage JavaScript.

**Solution:** Exécutez le script d'activation (Étape 2)

### Erreur de permission

```
Error: permission denied for function search_events
```

**Solution:** La migration inclut déjà les GRANT nécessaires. Réexécutez-la.

## 📝 Notes

- La fonction est **STABLE** (peut être optimisée par le query planner)
- Elle utilise des **CTEs** pour une meilleure lisibilité et performance
- Le filtrage par `oddsType` est entièrement supporté
- La recherche d'équipe utilise **pg_trgm** pour le fuzzy matching
- Les indexes sont créés avec **IF NOT EXISTS** pour éviter les doublons
