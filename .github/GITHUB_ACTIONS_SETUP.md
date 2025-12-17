# Configuration GitHub Actions pour Sync Odds

## Pourquoi GitHub Actions au lieu de Vercel Cron?

### Limitations Vercel Cron:
- ⏱️ **Timeout strict**: 5 minutes maximum
- 🌍 **Régions limitées**: Exécution limitée aux régions Vercel
- 📅 **Pas de garantie**: L'exécution peut être retardée
- 💰 **Limitations gratuites**: Fonctionnalités réduites sur plan hobby

### Avantages GitHub Actions:
- ⏱️ **Timeout généreux**: Jusqu'à 6 heures par job
- 🆓 **Gratuit**: 2000 minutes/mois pour repos privés (illimité pour publics)
- ⚡ **Fiabilité**: Exécution ponctuelle garantie
- 📊 **Meilleurs logs**: Interface de logs claire et accessible
- 🔧 **Flexibilité**: Plus de contrôle sur l'environnement

## Configuration (Étapes à suivre)

### 1. Ajouter les secrets GitHub

Allez sur votre repo GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Ajoutez ces 2 secrets:

#### Secret 1: `CRON_SECRET`
- **Name**: `CRON_SECRET`
- **Value**: La valeur de votre variable `CRON_SECRET` dans `.env.local`
- Ce secret sert à authentifier les appels au cron job

#### Secret 2: `VERCEL_URL`
- **Name**: `VERCEL_URL`
- **Value**: L'URL de votre app Vercel déployée
- Exemple: `https://your-app.vercel.app`
- ⚠️ **Sans** le `/` à la fin

### 2. Vérifier que le workflow est activé

1. Allez sur **Actions** dans votre repo GitHub
2. Vous devriez voir le workflow "Sync Odds Every 5 Minutes"
3. Si les workflows sont désactivés, cliquez sur "I understand my workflows, go ahead and enable them"

### 3. Tester manuellement

1. Allez sur **Actions** → **Sync Odds Every 5 Minutes**
2. Cliquez sur **Run workflow** → **Run workflow**
3. Attendez quelques secondes et vérifiez les logs
4. ✅ Si tout est vert, le workflow fonctionne!

### 4. Désactiver Vercel Cron (optionnel)

Si vous utilisez GitHub Actions, vous pouvez désactiver le cron Vercel:

**Option A**: Supprimer la configuration dans `vercel.json`:
```json
{
  "crons": []
}
```

**Option B**: Garder les deux (redondance) - Pas recommandé car ça double les appels API

## Comment ça marche?

```
┌─────────────────┐
│  GitHub Actions │  Toutes les 5 minutes
│   (Scheduler)   │
└────────┬────────┘
         │
         │ HTTP GET avec Authorization header
         ▼
┌─────────────────────────────────┐
│  Vercel App                     │
│  /api/cron/sync-odds            │
│                                 │
│  1. Vérification CRON_SECRET    │
│  2. Découverte matchs           │
│  3. Capture cotes (batched)     │
│  4. Logs + Response JSON        │
└─────────────────────────────────┘
```

## Monitoring

### Vérifier les exécutions:
1. **GitHub Actions**: Allez sur **Actions** → **Sync Odds Every 5 Minutes**
2. Vous verrez toutes les exécutions avec leur statut
3. Cliquez sur une exécution pour voir les logs détaillés

### En cas d'erreur:
- GitHub Actions envoie automatiquement une notification si le workflow échoue
- Vérifiez les logs dans l'interface Actions
- Les erreurs communes:
  - ❌ CRON_SECRET incorrect → Vérifiez le secret GitHub
  - ❌ VERCEL_URL incorrect → Vérifiez l'URL (sans `/` final)
  - ❌ App Vercel pas déployée → Déployez sur Vercel d'abord

## Coût et Limites

### GitHub Actions (repos privés):
- 🆓 **2000 minutes/mois gratuit**
- Chaque exécution: ~30-60 secondes
- Toutes les 5 minutes: 12 exécutions/h × 24h × 30j = 8640 exécutions/mois
- À 60 secondes chacune: **8640 minutes/mois**
- ⚠️ **Dépasse le quota gratuit!**

### Solutions:

#### Option 1: Réduire la fréquence (RECOMMANDÉ)
```yaml
schedule:
  - cron: '*/10 * * * *'  # Toutes les 10 minutes
  # = 4320 minutes/mois ✅
```

#### Option 2: Exécuter seulement pendant les heures de match
```yaml
schedule:
  # Toutes les 5 min entre 12h-23h UTC (matchs européens)
  - cron: '*/5 12-23 * * *'
```

#### Option 3: Passer le repo en public
- ✅ Minutes illimitées pour repos publics

#### Option 4: Rester sur Vercel Cron
- Vercel Cron est gratuit et suffisant si on reste sous 5 minutes

## Recommandation

Pour votre cas (Premier League uniquement):
- ✅ **Garder Vercel Cron** si l'optimisation batch fonctionne bien
- ✅ **Passer à GitHub Actions** si vous avez des problèmes de timeout
- ✅ **Utiliser fréquence 10 minutes** au lieu de 5 (économise les minutes gratuites)

## Prochaines étapes

1. ✅ Configurer les secrets GitHub (voir ci-dessus)
2. ✅ Tester manuellement le workflow
3. ✅ Vérifier les logs après 10-15 minutes
4. ✅ Décider: Garder GitHub Actions OU revenir à Vercel Cron
