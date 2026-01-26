# 🚀 État de la Migration GitHub Actions → Supabase Cron

## 📊 Workflows ACTIFS (À migrer)

### ✅ 1. Capture Closing Odds - **MIGRATION EN COURS**

**GitHub Action :** `capture-closing-odds.yml` (modifié le 21 jan)
- **Fréquence :** Toutes les 5 minutes
- **Script :** `scripts/capture-closing-odds-optimized.ts`
- **Endpoint Vercel :** `/api/cron/capture-closing` ✅ Existe

**Supabase Cron :**
- **Job créé :** ✅ OUI (`capture-closing-odds`)
- **Fréquence actuelle :** ⚠️ 1 minute (à corriger → 5 minutes)
- **Status :** 🟡 **PRESQUE FINI** - Appliquer migration SQL

**Action requise :**
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: supabase/migrations/20260126000001_update_cron_to_5min.sql
SELECT cron.unschedule('capture-closing-odds');
SELECT cron.schedule('capture-closing-odds', '*/5 * * * *', ...);
```

---

### ❌ 2. Scan Opening Odds - **NON MIGRÉ**

**GitHub Action :** `scan-opening-odds.yml` (modifié le 21 jan)
- **Fréquence :** Toutes les 10 minutes
- **Script :** `scripts/run-opening-odds.ts`
- **Endpoint Vercel :** ❌ À CRÉER

**Actions requises :**
1. Créer `/app/api/cron/scan-opening/route.ts`
2. Ajouter le job Supabase Cron
3. Tester

---

### ❌ 3. Sync Events - **NON MIGRÉ**

**GitHub Action :** `sync-events.yml` (modifié le 21 jan)
- **Fréquence :** Toutes les 6 heures
- **Script :** `scripts/run-sync-events.ts`
- **Endpoint Vercel :** ❌ À CRÉER

**Actions requises :**
1. Créer `/app/api/cron/sync-events/route.ts`
2. Ajouter le job Supabase Cron
3. Tester

---

### ❌ 4. Sync Scores & Closing - **NON MIGRÉ**

**GitHub Action :** `sync-scores-closing.yml` (modifié le 21 jan)
- **Fréquence :** Une fois par jour (2h27 AM UTC)
- **Script :** `scripts/run-sync-scores.ts`
- **Endpoint Vercel :** ❌ À CRÉER

**Actions requises :**
1. Créer `/app/api/cron/sync-scores/route.ts`
2. Ajouter le job Supabase Cron
3. Tester

---

## 🗑️ Workflows OBSOLÈTES (À supprimer)

### ⚠️ sync-odds-direct.yml (Dec 17)
- **Status :** Ancien workflow, remplacé par les nouveaux
- **Action :** Peut être supprimé

### ⚠️ sync-odds-direct-v2-parallel.yml (Dec 17)
- **Status :** Ancien workflow, remplacé par les nouveaux
- **Action :** Peut être supprimé

---

## 📋 Plan d'action immédiat

### 🔴 ÉTAPE 1 : Finaliser la migration du job capture-closing-odds

**Status :** 🟡 En cours (job existe mais à mauvaise fréquence)

1. Ouvre le SQL Editor : https://lgpxxzrimxpwbvyfiqvh.supabase.co/project/lgpxxzrimxpwbvyfiqvh/sql/new

2. Copie et exécute la migration :
   ```sql
   -- Fichier: supabase/migrations/20260126000001_update_cron_to_5min.sql
   SELECT cron.unschedule('capture-closing-odds');

   SELECT cron.schedule(
     'capture-closing-odds',
     '*/5 * * * *',  -- Every 5 minutes
     $$
     SELECT
       net.http_post(
         url:='https://danymcflyy-oddstracker.vercel.app/api/cron/capture-closing',
         headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
         body:='{}'::jsonb
       ) as request_id;
     $$
   );
   ```

3. Vérifie que c'est bien appliqué :
   ```sql
   SELECT jobname, schedule, active FROM cron.job
   WHERE jobname = 'capture-closing-odds';
   ```

---

### 🟡 ÉTAPE 2 : Créer les 3 endpoints manquants

**À faire après l'étape 1**

Voulez-vous que je crée ces 3 endpoints pour vous ?

1. `/app/api/cron/scan-opening/route.ts`
2. `/app/api/cron/sync-events/route.ts`
3. `/app/api/cron/sync-scores/route.ts`

Chaque endpoint suivra le même pattern que `/api/cron/capture-closing/route.ts` :
- Vérification du secret `SUPABASE_CRON_SECRET`
- Appel de la logique métier
- Retour JSON avec status et métriques

---

### 🟢 ÉTAPE 3 : Configurer Supabase Cron complet

Une fois les endpoints créés et testés, on ajoutera tous les jobs dans Supabase.

---

### 🔵 ÉTAPE 4 : Nettoyer les anciens workflows

```bash
# Supprimer les workflows obsolètes
rm .github/workflows/sync-odds-direct.yml
rm .github/workflows/sync-odds-direct-v2-parallel.yml

# Désactiver les workflows actifs (une fois migration terminée)
mv .github/workflows/capture-closing-odds.yml .github/workflows/capture-closing-odds.yml.disabled
mv .github/workflows/scan-opening-odds.yml .github/workflows/scan-opening-odds.yml.disabled
mv .github/workflows/sync-events.yml .github/workflows/sync-events.yml.disabled
mv .github/workflows/sync-scores-closing.yml .github/workflows/sync-scores-closing.yml.disabled
```

---

## 🎯 Résumé visuel

| Workflow | Status | Endpoint Vercel | Job Supabase | Action |
|----------|--------|-----------------|--------------|--------|
| **capture-closing-odds** | 🟡 En cours | ✅ Existe | 🟡 À corriger (1→5 min) | **Appliquer migration SQL** |
| **scan-opening-odds** | ❌ Non migré | ❌ À créer | ❌ À créer | Créer endpoint + job |
| **sync-events** | ❌ Non migré | ❌ À créer | ❌ À créer | Créer endpoint + job |
| **sync-scores-closing** | ❌ Non migré | ❌ À créer | ❌ À créer | Créer endpoint + job |
| sync-odds-direct | 🗑️ Obsolète | - | - | **Supprimer** |
| sync-odds-direct-v2-parallel | 🗑️ Obsolète | - | - | **Supprimer** |

---

## ✅ Ce qui fonctionne DÉJÀ

- ✅ Endpoint `/api/cron/capture-closing` existe et fonctionne
- ✅ Job Supabase Cron `capture-closing-odds` créé
- ✅ Secret `SUPABASE_CRON_SECRET` configuré
- ✅ Variable Vercel configurée
- ✅ Script de capture opérationnel

**Il manque juste :**
- Corriger la fréquence (1 min → 5 min)
- Créer les 3 autres endpoints
- Configurer les 3 autres jobs Supabase

---

**Prêt à continuer ?** Dites-moi si vous voulez que je :
1. ✅ Vous aide à appliquer la migration SQL (URGENT)
2. 🔨 Crée les 3 endpoints manquants
3. 📝 Prépare le script SQL complet pour Supabase Cron
