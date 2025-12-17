# Configuration GitHub Actions Direct Sync

## Architecture

**NOUVEAU SYSTÈME (Option 1):**

```
┌─────────────────────────────────────────┐
│  GitHub Actions (toutes les 10 min)    │
│  - Install Node.js & dependencies      │
│  - Load environment variables          │
│  - Execute: npx tsx scripts/...        │
│  - Direct calls to:                    │
│    • Supabase (database)               │
│    • Odds-API.io (odds data)           │
│                                         │
│  Timeout: 6 heures ✅                  │
│  Cost: GRATUIT (repo public) ✅        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Vercel                                 │
│  - Frontend UI seulement                │
│  - Pas de cron job                      │
│  - Pas de backend sync                  │
└─────────────────────────────────────────┘
```

## Avantages vs ancien système

| Critère | Ancien (via Vercel) | Nouveau (Direct) |
|---------|---------------------|------------------|
| **Timeout** | 60 secondes | 6 heures |
| **Scalabilité** | 1-2 ligues max | 10+ ligues |
| **Coût** | Gratuit | Gratuit |
| **Fiabilité** | Risque timeout | Très fiable |
| **Setup** | Simple | Moyen |

## Configuration (Étapes obligatoires)

### 1. Ajouter les secrets GitHub

Allez sur: https://github.com/Danymcflyy/OddsTracker/settings/secrets/actions

Ajoutez ces 4 secrets (cliquez sur "New repository secret" pour chaque):

#### Secret 1: `NEXT_PUBLIC_SUPABASE_URL`
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: L'URL de votre projet Supabase
- Exemple: `https://xxxxxxxxxxxxx.supabase.co`
- ⚠️ Trouvez-le dans votre `.env.local` ou sur Supabase Dashboard

#### Secret 2: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Votre clé publique Supabase (anon key)
- Exemple: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ⚠️ Trouvez-le dans votre `.env.local` ou sur Supabase Dashboard

#### Secret 3: `SUPABASE_SERVICE_ROLE_KEY`
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Votre clé service role Supabase (ATTENTION: très sensible!)
- Exemple: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ⚠️ Trouvez-le dans votre `.env.local` ou sur Supabase Dashboard → Settings → API

#### Secret 4: `ODDS_API_IO_KEY`
- **Name**: `ODDS_API_IO_KEY`
- **Value**: Votre clé API Odds-API.io
- Exemple: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- ⚠️ Trouvez-le dans votre `.env.local` ou sur https://odds-api.io/dashboard

### 2. Désactiver les anciens workflows (optionnel)

Si vous ne voulez garder que le nouveau système direct:

```bash
# Supprimer les anciens workflows qui appellent Vercel
rm .github/workflows/sync-odds.yml
rm .github/workflows/sync-odds-10min.yml

git add .github/workflows/
git commit -m "Remove old Vercel-calling workflows"
git push
```

**OU** gardez-les désactivés:
1. Allez sur Actions → Workflow → "..." → Disable workflow

### 3. Tester le nouveau workflow

1. Allez sur: https://github.com/Danymcflyy/OddsTracker/actions
2. Cliquez sur "Sync Odds Direct (GitHub Actions)"
3. Cliquez sur "Run workflow" → "Run workflow"
4. Attendez 1-2 minutes
5. Vérifiez les logs:
   - ✅ "SYNC TERMINÉ" = succès
   - ❌ Erreurs = vérifiez les secrets

### 4. Vérifier que ça fonctionne

Après le premier run réussi:

1. Allez sur votre app Vercel (UI)
2. Vérifiez que les données sont à jour
3. Vérifiez les logs GitHub Actions régulièrement

## Monitoring

### Vérifier les exécutions

- **GitHub Actions**: https://github.com/Danymcflyy/OddsTracker/actions
- Vous verrez chaque exécution avec son statut
- Cliquez sur une exécution pour voir les logs détaillés

### Fréquence

- Par défaut: **Toutes les 10 minutes**
- Peut être ajusté dans `.github/workflows/sync-odds-direct.yml`:
  ```yaml
  schedule:
    - cron: '*/5 * * * *'  # Toutes les 5 minutes
    - cron: '*/15 * * * *' # Toutes les 15 minutes
  ```

## Troubleshooting

### Erreur: "NEXT_PUBLIC_SUPABASE_URL is not defined"
→ Vérifiez que vous avez bien ajouté le secret sur GitHub

### Erreur: "ODDS_API_IO_KEY manquée"
→ Vérifiez que vous avez bien ajouté le secret `ODDS_API_IO_KEY`

### Erreur: "Cannot connect to Supabase"
→ Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est correct

### Le workflow ne démarre pas automatiquement
→ Attendez 10 minutes ou déclenchez-le manuellement avec "Run workflow"

## Comparaison des coûts

### Minutes GitHub Actions utilisées

```
Estimation par exécution:
- Setup Node.js + npm install: ~30 secondes
- Sync logic: ~30-60 secondes
- Total: ~60-90 secondes par run

Fréquence: Toutes les 10 minutes
= 6 runs/heure × 24h × 30j = 4320 runs/mois
× 90 secondes = 6480 minutes/mois

Quota gratuit (repo public): ILLIMITÉ ✅
```

### Si le repo était privé
- 2000 minutes gratuites/mois
- Dépassement: 6480 - 2000 = 4480 minutes
- Mais **repo public = gratuit illimité** ✅

## Migration depuis l'ancien système

### Ce qui change
- ❌ Plus d'appel HTTP à Vercel `/api/cron/sync-odds`
- ❌ Plus besoin de `CRON_SECRET`
- ✅ Exécution directe du code dans GitHub Actions
- ✅ Variables d'environnement dans GitHub Secrets

### Ce qui reste identique
- ✅ Même logique de synchronisation
- ✅ Même code métier
- ✅ Même base de données Supabase
- ✅ Même API Odds-API.io

### Rollback possible
Si vous voulez revenir à l'ancien système:
1. Réactivez les anciens workflows
2. Désactivez le nouveau workflow
3. Les deux systèmes sont compatibles

## Prochaines étapes recommandées

1. ✅ Configurer les 4 secrets GitHub (voir ci-dessus)
2. ✅ Tester manuellement le workflow
3. ✅ Vérifier les logs après 20-30 minutes
4. ✅ Désactiver les anciens workflows si tout fonctionne
5. ✅ Profiter du timeout de 6 heures et de la scalabilité illimitée!
