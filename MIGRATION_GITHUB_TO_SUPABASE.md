# 📊 Migration GitHub Actions → Supabase Cron - État des lieux

## ✅ Ce qui a été MIGRÉ

### 1. ✓ Capture Closing Odds (Job principal)

**GitHub Action :** `.github/workflows/capture-closing-odds.yml`
- **Fréquence :** Toutes les 5 minutes (`1-56/5 * * * *`)
- **Script :** `scripts/capture-closing-odds-optimized.ts`

**Supabase Cron :** `capture-closing-odds`
- **Fréquence :** ACTUELLEMENT 1 minute → À METTRE À 5 MINUTES ⚠️
- **Endpoint :** `/api/cron/capture-closing` ✅ Existe
- **Status :** ⚠️ **MIGRATION À FINALISER** - Appliquer la migration SQL

---

## ❌ Ce qui RESTE À MIGRER

### 2. ❌ Scan Opening Odds

**GitHub Action :** `.github/workflows/scan-opening-odds.yml`
- **Fréquence :** Toutes les 10 minutes (`2-59/10 * * * *`)
- **Script :** `scripts/run-opening-odds.ts`
- **Coût :** ~6 crédits par événement avec marchés en attente

**Ce qui manque :**
- [ ] Créer l'endpoint `/api/cron/scan-opening`
- [ ] Ajouter le job dans Supabase Cron
- [ ] Tester l'endpoint

**Code Supabase Cron à ajouter :**
```sql
SELECT cron.schedule(
  'scan-opening-odds',
  '*/10 * * * *',  -- Every 10 minutes
  $$
  SELECT
    net.http_post(
      url:='https://danymcflyy-oddstracker.vercel.app/api/cron/scan-opening',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

---

### 3. ❌ Sync Events (Découverte de nouveaux matchs)

**GitHub Action :** `.github/workflows/sync-events.yml`
- **Fréquence :** Toutes les 6 heures (`17 */6 * * *`)
- **Script :** `scripts/run-sync-events.ts`
- **Coût :** 0 crédits (endpoint gratuit)

**Ce qui manque :**
- [ ] Créer l'endpoint `/api/cron/sync-events`
- [ ] Ajouter le job dans Supabase Cron
- [ ] Tester l'endpoint

**Code Supabase Cron à ajouter :**
```sql
SELECT cron.schedule(
  'sync-events',
  '17 */6 * * *',  -- Every 6 hours at :17
  $$
  SELECT
    net.http_post(
      url:='https://danymcflyy-oddstracker.vercel.app/api/cron/sync-events',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

---

### 4. ❌ Sync Scores & Closing Odds (Finalisation quotidienne)

**GitHub Action :** `.github/workflows/sync-scores-closing.yml`
- **Fréquence :** Une fois par jour à 2h27 UTC (`27 2 * * *`)
- **Script :** `scripts/run-sync-scores.ts`
- **Coût :** ~2 crédits pour scores + ~6 crédits par événement complété

**Ce qui manque :**
- [ ] Créer l'endpoint `/api/cron/sync-scores`
- [ ] Ajouter le job dans Supabase Cron
- [ ] Tester l'endpoint

**Code Supabase Cron à ajouter :**
```sql
SELECT cron.schedule(
  'sync-scores-closing',
  '27 2 * * *',  -- Daily at 2:27 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://danymcflyy-oddstracker.vercel.app/api/cron/sync-scores',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

---

## 📋 Checklist de migration complète

### Phase 1 : Finaliser le job existant ⚠️ URGENT

- [ ] **Appliquer la migration SQL** `20260126000001_update_cron_to_5min.sql`
  - Ouvre le SQL Editor : https://lgpxxzrimxpwbvyfiqvh.supabase.co/project/lgpxxzrimxpwbvyfiqvh/sql/new
  - Copie/colle le contenu de la migration
  - Clique sur "Run"

- [ ] **Vérifier que le cron est bien à 5 minutes**
  ```sql
  SELECT jobname, schedule, active FROM cron.job
  WHERE jobname = 'capture-closing-odds';
  ```
  - Résultat attendu : `schedule = */5 * * * *`

### Phase 2 : Créer les endpoints manquants

- [ ] **Créer** `app/api/cron/scan-opening/route.ts`
  - Template basé sur `/api/cron/capture-closing/route.ts`
  - Appelle `scripts/run-opening-odds.ts` ou crée une fonction équivalente

- [ ] **Créer** `app/api/cron/sync-events/route.ts`
  - Template basé sur `/api/cron/capture-closing/route.ts`
  - Appelle `scripts/run-sync-events.ts` ou crée une fonction équivalente

- [ ] **Créer** `app/api/cron/sync-scores/route.ts`
  - Template basé sur `/api/cron/capture-closing/route.ts`
  - Appelle `scripts/run-sync-scores.ts` ou crée une fonction équivalente

### Phase 3 : Configurer Supabase Cron

- [ ] **Appliquer la configuration complète** dans Supabase
  - Copier tout le fichier `supabase/cron_setup.sql` mis à jour
  - Exécuter dans le SQL Editor

- [ ] **Vérifier tous les jobs**
  ```sql
  SELECT jobname, schedule, active FROM cron.job ORDER BY jobname;
  ```
  - Devrait afficher 4 jobs au total :
    - `capture-closing-odds` (*/5 * * * *)
    - `scan-opening-odds` (*/10 * * * *)
    - `sync-events` (17 */6 * * *)
    - `sync-scores-closing` (27 2 * * *)

### Phase 4 : Tests

- [ ] **Tester chaque endpoint manuellement**
  ```bash
  # Test capture-closing
  curl -X POST https://danymcflyy-oddstracker.vercel.app/api/cron/capture-closing \
    -H "Authorization: Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"

  # Test scan-opening
  curl -X POST https://danymcflyy-oddstracker.vercel.app/api/cron/scan-opening \
    -H "Authorization: Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"

  # Test sync-events
  curl -X POST https://danymcflyy-oddstracker.vercel.app/api/cron/sync-events \
    -H "Authorization: Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"

  # Test sync-scores
  curl -X POST https://danymcflyy-oddstracker.vercel.app/api/cron/sync-scores \
    -H "Authorization: Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"
  ```

- [ ] **Surveiller les logs Supabase**
  ```sql
  SELECT
    job_name,
    status,
    start_time,
    return_message
  FROM cron.job_run_details
  WHERE start_time > NOW() - INTERVAL '1 hour'
  ORDER BY start_time DESC;
  ```

### Phase 5 : Désactiver GitHub Actions

- [ ] **Renommer les workflows GitHub** (une fois que tout fonctionne)
  ```bash
  mv .github/workflows/capture-closing-odds.yml .github/workflows/capture-closing-odds.yml.disabled
  mv .github/workflows/scan-opening-odds.yml .github/workflows/scan-opening-odds.yml.disabled
  mv .github/workflows/sync-events.yml .github/workflows/sync-events.yml.disabled
  mv .github/workflows/sync-scores-closing.yml .github/workflows/sync-scores-closing.yml.disabled
  ```

- [ ] **Commit et push** les changements
  ```bash
  git add .github/workflows/
  git commit -m "chore: Disable GitHub Actions (migrated to Supabase Cron)"
  git push
  ```

---

## 🎯 Priorité d'actions IMMÉDIATE

### 🔴 URGENT : Finaliser le job capture-closing-odds

**Actuellement :** Le job tourne **toutes les minutes** (trop fréquent)
**Objectif :** Le faire tourner **toutes les 5 minutes**

**Action :**
1. Va sur le SQL Editor : https://lgpxxzrimxpwbvyfiqvh.supabase.co/project/lgpxxzrimxpwbvyfiqvh/sql/new
2. Copie le contenu de `supabase/migrations/20260126000001_update_cron_to_5min.sql`
3. Colle et exécute

### 🟡 Ensuite : Créer les 3 endpoints manquants

Pour chaque endpoint manquant, créer un fichier similaire à `/api/cron/capture-closing/route.ts` :

1. `/api/cron/scan-opening/route.ts` → Appelle la logique de `scripts/run-opening-odds.ts`
2. `/api/cron/sync-events/route.ts` → Appelle la logique de `scripts/run-sync-events.ts`
3. `/api/cron/sync-scores/route.ts` → Appelle la logique de `scripts/run-sync-scores.ts`

### 🟢 Finalement : Configurer Supabase Cron complet

Une fois tous les endpoints créés et testés, exécuter la configuration complète Supabase Cron.

---

## 📊 Comparaison des coûts

| Job | GitHub Actions | Supabase Cron |
|-----|---------------|---------------|
| **Compute** | Gratuit (2000 min/mois) | Gratuit (inclus dans Supabase) |
| **Fiabilité** | Moyenne (limitations timing) | Excellente (PostgreSQL pg_cron) |
| **Logs** | GitHub UI | Supabase + Vercel |
| **Secrets** | GitHub Secrets | Env vars Vercel |
| **Monitoring** | GitHub Actions tab | SQL queries + Vercel logs |

---

## ✅ Avantages de Supabase Cron

- ✅ **Précision** : Exécution exacte à la minute près
- ✅ **Fiabilité** : Pas de quota GitHub Actions
- ✅ **Monitoring** : Logs SQL directs et détaillés
- ✅ **Simplicité** : Tout dans un seul endroit (Supabase)
- ✅ **Performance** : Pas de cold start (Vercel reste chaud)

---

**Note :** Une fois la migration complète terminée, tous vos jobs tourneront de manière fiable via Supabase Cron → Vercel → Scripts, sans dépendre de GitHub Actions.
