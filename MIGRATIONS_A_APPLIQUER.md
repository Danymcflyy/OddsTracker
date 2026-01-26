# 🚀 Migrations SQL à appliquer dans Supabase

Il y a **2 migrations** importantes à appliquer dans l'ordre :

## ✅ Migration 1 : Fonction SQL optimisée pour recherche avancée

**Fichier :** `supabase/migrations/20260126000000_optimize_search_events.sql`

**Ce que ça fait :**
- Crée une fonction PostgreSQL `search_events()` optimisée
- Ajoute le support du paramètre `oddsType` (opening/closing/both)
- Crée des indexes pour améliorer les performances
- Permet de filtrer des millions de matchs sans problème

**Comment l'appliquer :**

1. Ouvrez le SQL Editor : https://lgpxxzrimxpwbvyfiqvh.supabase.co/project/lgpxxzrimxpwbvyfiqvh/sql/new

2. Copiez **TOUT le contenu** de `supabase/migrations/20260126000000_optimize_search_events.sql` (205 lignes)

3. Collez dans l'éditeur et cliquez sur **"Run"**

4. Vérifiez : Vous devriez voir "Success. No rows returned"

---

## ✅ Migration 2 : Mise à jour du Cron (1 minute → 5 minutes)

**Fichier :** `supabase/migrations/20260126000001_update_cron_to_5min.sql`

**Ce que ça fait :**
- Supprime l'ancien job qui tourne toutes les minutes
- Recrée le job avec une fréquence de **5 minutes**
- Utilise votre vraie URL Vercel : `https://danymcflyy-oddstracker.vercel.app`

**Comment l'appliquer :**

1. Ouvrez le SQL Editor (même lien que ci-dessus)

2. Copiez **TOUT le contenu** de `supabase/migrations/20260126000001_update_cron_to_5min.sql`

3. Collez dans l'éditeur et cliquez sur **"Run"**

4. Vérifiez le job :
   ```sql
   SELECT jobname, schedule, active
   FROM cron.job
   WHERE jobname = 'capture-closing-odds';
   ```

   Vous devriez voir :
   - `jobname`: capture-closing-odds
   - `schedule`: */5 * * * *
   - `active`: true

---

## 🧪 Tests après les migrations

### Test 1 : Vérifier la fonction SQL

```sql
-- Tester la fonction search_events avec des filtres
SELECT COUNT(*) as total
FROM search_events(
  p_odds_type := 'both',
  p_page := 1,
  p_page_size := 10
);
```

### Test 2 : Vérifier le cron

```sql
-- Voir les dernières exécutions
SELECT
  job_name,
  status,
  start_time,
  return_message
FROM cron.job_run_details
WHERE job_name = 'capture-closing-odds'
ORDER BY start_time DESC
LIMIT 5;
```

### Test 3 : Vérifier dans l'application

1. Ouvrez votre application : https://danymcflyy-oddstracker.vercel.app
2. Allez sur la page **Football**
3. Cliquez sur **"Recherche Avancée" → "Afficher"**
4. Testez les filtres :
   - Type de cotes : **Ouverture OU Clôture** ← NOUVEAU paramètre
   - Fourchette de cotes : Min 1.50, Max 3.00
   - Type de marché : h2h, spreads, totals, btts, team_totals_home, etc.
   - Drop de cote minimum : 10%

---

## ✅ Checklist finale

- [ ] Migration 1 appliquée (`optimize_search_events`)
- [ ] Fonction `search_events` existe (vérifiée avec test SQL)
- [ ] Paramètre `use_sql_search` activé (déjà fait avec `npm run enable-sql-search`)
- [ ] Migration 2 appliquée (`update_cron_to_5min`)
- [ ] Job cron configuré à 5 minutes (vérifié dans `cron.job`)
- [ ] Variable `SUPABASE_CRON_SECRET` configurée dans Vercel
- [ ] Tests des filtres avancés dans l'application

---

## 📊 Monitoring

### Surveiller les exécutions du cron

```sql
-- Statistiques des dernières 24h
SELECT
  job_name,
  status,
  COUNT(*) as executions,
  AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_duration_seconds
FROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '24 hours'
  AND job_name = 'capture-closing-odds'
GROUP BY job_name, status;
```

### Voir les erreurs

```sql
-- Erreurs récentes
SELECT
  start_time,
  return_message
FROM cron.job_run_details
WHERE job_name = 'capture-closing-odds'
  AND status = 'failed'
ORDER BY start_time DESC
LIMIT 10;
```

---

## 🔧 En cas de problème

### La fonction search_events n'existe pas

**Erreur :** `function search_events does not exist`

**Solution :** Réappliquez la migration 1

### Le cron ne s'exécute pas

1. Vérifiez que les extensions sont activées :
   ```sql
   SELECT * FROM pg_available_extensions
   WHERE name IN ('pg_cron', 'pg_net');
   ```

2. Vérifiez que le job est actif :
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'capture-closing-odds';
   ```

3. Testez l'endpoint manuellement :
   ```bash
   curl -X POST https://danymcflyy-oddstracker.vercel.app/api/cron/capture-closing \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"
   ```

### Les filtres avancés ne fonctionnent pas

Vérifiez que `use_sql_search` est bien activé :
```sql
SELECT * FROM settings WHERE key = 'use_sql_search';
```

Si la valeur est `false` ou n'existe pas, réexécutez :
```bash
npm run enable-sql-search
```

---

**Une fois les 2 migrations appliquées, votre système sera totalement opérationnel ! 🎉**
