# Guide : Configuration Supabase Cron (Remplacement de GitHub Actions)

## 🎯 Objectif

Passer de **GitHub Actions** (qui a des limitations de timing) à **Supabase Cron** pour une exécution fiable toutes les **5 minutes**.

## ✅ Avantages de Supabase Cron

- ✓ **Fiabilité** : Pas de quota GitHub Actions
- ✓ **Précision** : Exécution exacte toutes les 5 minutes
- ✓ **Monitoring** : Logs directement dans Supabase
- ✓ **Simplicité** : Pas besoin de gérer des secrets GitHub

## 📋 Prérequis

Avant de commencer, assurez-vous que :

1. ✅ Votre projet est déployé sur **Vercel**
2. ✅ La variable `SUPABASE_CRON_SECRET` est configurée dans Vercel (valeur: `072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85`)
3. ✅ L'endpoint `/api/cron/capture-closing` existe et fonctionne

## 🚀 Étapes d'installation

### Étape 1 : Récupérer votre URL Vercel

1. Ouvrez votre projet sur Vercel : https://vercel.com/dashboard
2. Trouvez l'URL de production (ex: `https://odds-tracker.vercel.app` ou `https://oddstracker-xyz123.vercel.app`)
3. Copiez cette URL (sans le slash final)

### Étape 2 : Modifier le fichier cron_setup.sql

1. Ouvrez le fichier `supabase/cron_setup.sql`
2. Remplacez **TOUTES les occurrences** de `https://your-project.vercel.app` par votre vraie URL Vercel

Exemple :
```sql
url:='https://odds-tracker.vercel.app/api/cron/capture-closing',
```

### Étape 3 : Appliquer le script dans Supabase

1. **Ouvrez le SQL Editor** dans Supabase :
   👉 https://lgpxxzrimxpwbvyfiqvh.supabase.co/project/lgpxxzrimxpwbvyfiqvh/sql/new

2. **Copiez le contenu complet** de `supabase/cron_setup.sql`

3. **Collez dans l'éditeur** et cliquez sur **"Run"**

4. **Vérifiez** : Vous devriez voir "Success" sans erreur

### Étape 4 : Vérifier que les jobs sont créés

Exécutez cette requête dans le SQL Editor :

```sql
SELECT * FROM cron.job;
```

Vous devriez voir :
- `capture-closing-odds` : Schedule `*/5 * * * *` (toutes les 5 minutes)
- `check-opening-odds` : Schedule `0 * * * *` (toutes les heures)

### Étape 5 : Surveiller les exécutions

Pour voir les logs des dernières exécutions :

```sql
SELECT
  jobid,
  job_name,
  status,
  start_time,
  end_time,
  return_message
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

## 📊 Monitoring

### Vérifier l'état des jobs

```sql
-- Liste tous les jobs actifs
SELECT
  jobid,
  jobname,
  schedule,
  active,
  nodename
FROM cron.job
WHERE active = true;
```

### Voir les erreurs récentes

```sql
-- Voir uniquement les jobs qui ont échoué
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

### Statistiques d'exécution

```sql
-- Nombre d'exécutions réussies vs échouées
SELECT
  job_name,
  status,
  COUNT(*) as count
FROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '24 hours'
GROUP BY job_name, status
ORDER BY job_name, status;
```

## 🔧 Gestion des jobs

### Désactiver un job temporairement

```sql
SELECT cron.unschedule('capture-closing-odds');
```

### Réactiver un job

Réexécutez simplement le `cron.schedule()` correspondant dans le fichier `cron_setup.sql`

### Modifier la fréquence

Pour changer de 5 minutes à une autre fréquence :

```sql
-- Supprimer l'ancien job
SELECT cron.unschedule('capture-closing-odds');

-- Créer avec la nouvelle fréquence
-- Exemples :
-- */10 * * * *  -> Toutes les 10 minutes
-- */15 * * * *  -> Toutes les 15 minutes
-- 0 * * * *     -> Toutes les heures
-- 0 */2 * * *   -> Toutes les 2 heures

SELECT cron.schedule(
  'capture-closing-odds',
  '*/10 * * * *',  -- Nouvelle fréquence
  $$
  SELECT
    net.http_post(
      url:='https://your-vercel-url.vercel.app/api/cron/capture-closing',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

## 🐛 Dépannage

### Erreur : "extension pg_cron does not exist"

**Solution :** Activer l'extension dans Supabase Dashboard
1. Allez dans `Database > Extensions`
2. Cherchez `pg_cron` et activez-la

### Erreur : "extension pg_net does not exist"

**Solution :** Activer l'extension dans Supabase Dashboard
1. Allez dans `Database > Extensions`
2. Cherchez `pg_net` et activez-la

### Le job ne s'exécute pas

1. Vérifiez que l'URL Vercel est correcte
2. Vérifiez que `SUPABASE_CRON_SECRET` est configuré dans Vercel
3. Testez l'endpoint manuellement avec curl :

```bash
curl -X POST https://your-vercel-url.vercel.app/api/cron/capture-closing \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85"
```

### Les logs montrent des erreurs 401 Unauthorized

**Solution :** Le secret ne correspond pas. Vérifiez que :
1. La valeur dans `cron_setup.sql` est : `072f4d684008a5db5f0ec04c26d9c7a7e90ad3fd0598c4b085bbd5e4e3123a85`
2. La même valeur est définie dans Vercel sous `SUPABASE_CRON_SECRET`

## 📝 Désactiver GitHub Actions (Optionnel)

Une fois que Supabase Cron fonctionne correctement, vous pouvez désactiver les workflows GitHub :

1. Renommez `.github/workflows/capture-closing-odds.yml` en `.github/workflows/capture-closing-odds.yml.disabled`
2. Ou supprimez complètement le dossier `.github/workflows/`

## ✅ Checklist finale

- [ ] URL Vercel remplacée dans `cron_setup.sql`
- [ ] Script SQL exécuté dans Supabase
- [ ] Jobs visibles dans `cron.job`
- [ ] Variable `SUPABASE_CRON_SECRET` configurée dans Vercel
- [ ] Première exécution réussie visible dans les logs
- [ ] GitHub Actions désactivé (optionnel)

---

**Note :** La fréquence de 5 minutes est un bon compromis entre :
- ✓ Ne pas manquer les matchs qui démarrent
- ✓ Ne pas surcharger l'API The Odds
- ✓ Rester dans les limites de crédits API
