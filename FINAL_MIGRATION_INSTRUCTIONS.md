# 🎯 Instructions Finales - Migration GitHub Actions → Supabase Cron

## ✅ Ce qui a été créé

### 📁 Endpoints API créés

1. ✅ `/app/api/cron/capture-closing/route.ts` (existait déjà)
2. ✅ `/app/api/cron/scan-opening/route.ts` (NOUVEAU)
3. ✅ `/app/api/cron/sync-events/route.ts` (NOUVEAU)
4. ✅ `/app/api/cron/sync-scores/route.ts` (NOUVEAU)

### 📁 Migrations SQL créées

1. ✅ `supabase/migrations/20260126000000_optimize_search_events.sql` - Recherche SQL optimisée
2. ✅ `supabase/migrations/20260126000002_setup_all_cron_jobs.sql` - Configuration complète des 4 jobs

---

## 🚀 Étapes d'application

### ÉTAPE 1 : Déployer les endpoints sur Vercel

Les nouveaux endpoints doivent être déployés sur Vercel :

```bash
# Commit et push les nouveaux fichiers
git add app/api/cron/
git commit -m "feat: Add missing cron endpoints (scan-opening, sync-events, sync-scores)"
git push
```

Vercel va automatiquement déployer. Attendez ~2 minutes.

---

### ÉTAPE 2 : Tester les endpoints manuellement

Une fois déployés, testez chaque endpoint :

```bash
# Test 1: Capture Closing (devrait déjà fonctionner)
curl -X POST https://danymcflyy-oddstracker.vercel.app/api/cron/capture-closing \
  -H "Authorization: Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"

# Test 2: Scan Opening (NOUVEAU)
curl -X POST https://danymcflyy-oddstracker.vercel.app/api/cron/scan-opening \
  -H "Authorization: Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"

# Test 3: Sync Events (NOUVEAU)
curl -X POST https://danymcflyy-oddstracker.vercel.app/api/cron/sync-events \
  -H "Authorization: Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"

# Test 4: Sync Scores (NOUVEAU)
curl -X POST https://danymcflyy-oddstracker.vercel.app/api/cron/sync-scores \
  -H "Authorization: Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"
```

**Résultats attendus :**
- Status 200 OK
- JSON avec `success: true` et statistiques

---

### ÉTAPE 3 : Appliquer la migration SQL optimisée (Recherche avancée)

**Cette migration est OPTIONNELLE mais RECOMMANDÉE** pour la performance des filtres avancés.

1. Ouvrez le SQL Editor : https://lgpxxzrimxpwbvyfiqvh.supabase.co/project/lgpxxzrimxpwbvyfiqvh/sql/new

2. Copiez **TOUT** le contenu de :
   ```
   supabase/migrations/20260126000000_optimize_search_events.sql
   ```

3. Collez et cliquez sur **"Run"**

4. Vérifiez :
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_name = 'search_events';
   ```
   Devrait retourner : `search_events`

---

### ÉTAPE 4 : Configurer tous les jobs Supabase Cron

1. **Ouvrez le SQL Editor** (même lien que ci-dessus)

2. **Copiez TOUT** le contenu de :
   ```
   supabase/migrations/20260126000002_setup_all_cron_jobs.sql
   ```

3. **Collez et cliquez sur "Run"**

4. **Vérifiez** que les 4 jobs sont créés :
   ```sql
   SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;
   ```

   **Résultat attendu :**
   ```
   jobname               | schedule     | active
   ----------------------+--------------+--------
   capture-closing-odds  | */5 * * * *  | t
   scan-opening-odds     | */5 * * * *  | t
   sync-events           | 17 * * * *   | t
   sync-scores-closing   | 27 2 * * *   | t
   ```

---

### ÉTAPE 5 : Surveiller les exécutions

#### Voir les logs des dernières exécutions

```sql
SELECT
  job_name,
  status,
  start_time,
  end_time,
  return_message
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

#### Voir uniquement les erreurs

```sql
SELECT
  job_name,
  status,
  start_time,
  return_message
FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC
LIMIT 10;
```

#### Statistiques par job

```sql
SELECT
  job_name,
  COUNT(*) as executions,
  COUNT(*) FILTER (WHERE status = 'succeeded') as succeeded,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_duration_sec
FROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '24 hours'
GROUP BY job_name
ORDER BY job_name;
```

---

### ÉTAPE 6 : Désactiver GitHub Actions

**Une fois que tout fonctionne pendant 24h**, désactivez les workflows GitHub :

```bash
# Supprimer les workflows obsolètes
rm .github/workflows/sync-odds-direct.yml
rm .github/workflows/sync-odds-direct-v2-parallel.yml

# Désactiver les workflows actifs (renommer en .disabled)
mv .github/workflows/capture-closing-odds.yml .github/workflows/capture-closing-odds.yml.disabled
mv .github/workflows/scan-opening-odds.yml .github/workflows/scan-opening-odds.yml.disabled
mv .github/workflows/sync-events.yml .github/workflows/sync-events.yml.disabled
mv .github/workflows/sync-scores-closing.yml .github/workflows/sync-scores-closing.yml.disabled

# Commit et push
git add .github/workflows/
git commit -m "chore: Disable GitHub Actions workflows (migrated to Supabase Cron)"
git push
```

---

## 📊 Récapitulatif des fréquences

| Job | Fréquence | Endpoint | Coût |
|-----|-----------|----------|------|
| **Capture Closing** | Toutes les 5 min | `/api/cron/capture-closing` | ~1 crédit/event/snapshot |
| **Scan Opening** | Toutes les 5 min | `/api/cron/scan-opening` | ~6 crédits/event |
| **Sync Events** | Toutes les heures | `/api/cron/sync-events` | **0 crédit (GRATUIT)** |
| **Sync Scores** | Une fois/jour (2h27 AM) | `/api/cron/sync-scores` | ~2 + ~6/event |

---

## ✅ Checklist finale

- [ ] **Étape 1 :** Endpoints déployés sur Vercel
- [ ] **Étape 2 :** Tests manuels réussis (4/4 endpoints)
- [ ] **Étape 3 :** Migration SQL recherche optimisée appliquée (optionnel)
- [ ] **Étape 4 :** 4 jobs Supabase Cron configurés
- [ ] **Étape 5 :** Surveillance 24h (logs sans erreur)
- [ ] **Étape 6 :** GitHub Actions désactivés

---

## 🐛 Dépannage

### Erreur 401 Unauthorized

**Cause :** Le secret ne correspond pas

**Solution :**
1. Vérifier que `SUPABASE_CRON_SECRET` est bien dans Vercel
2. Vérifier que la valeur est : `072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85`

### Erreur 404 Not Found

**Cause :** L'endpoint n'existe pas encore

**Solution :**
1. Vérifier que le déploiement Vercel est terminé
2. Tester l'URL dans le navigateur (devrait retourner 401, pas 404)

### Job ne s'exécute pas

**Cause :** Job mal configuré ou inactif

**Solution :**
```sql
-- Vérifier l'état du job
SELECT * FROM cron.job WHERE jobname = 'nom-du-job';

-- Si active = false, réappliquer la migration
```

### Logs d'erreur "net.http_post failed"

**Cause :** Problème réseau ou timeout

**Solution :**
1. Vérifier que Vercel fonctionne
2. Augmenter `maxDuration` dans le endpoint si nécessaire
3. Vérifier les logs Vercel pour voir l'erreur exacte

---

## 🎉 Succès !

Une fois toutes les étapes terminées, votre système sera **100% autonome** :

✅ Découverte automatique des matchs (toutes les heures)
✅ Capture opening odds (toutes les 5 min)
✅ Capture closing odds multi-snapshot (toutes les 5 min)
✅ Mise à jour scores et finalisation (quotidien)
✅ Monitoring SQL direct
✅ Pas de dépendance GitHub Actions

**Tout tourne automatiquement via Supabase Cron → Vercel → Scripts !** 🚀
