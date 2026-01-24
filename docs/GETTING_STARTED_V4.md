# 🚀 Guide de démarrage - OddsTracker V4

## ✅ Ce qui est fait

- ✅ Migrations SQL appliquées dans Supabase
- ✅ Backend v4 complet (discovery, opening-odds, closing-odds)
- ✅ GitHub Actions workflows configurés
- ✅ Frontend adapté pour v4
- ✅ Nettoyage des fichiers v3

## 📋 Ce qu'il reste à faire

### 1. Configurer la clé API The Odds API

**Option A : Via variable d'environnement (Recommandé pour production)**

Modifier `.env.local` :
```bash
# Remplacer cette ligne :
ODDS_API_IO_KEY=votre_ancienne_cle

# Par celle-ci :
ODDS_API_KEY=votre_cle_theoddsapi
```

**Option B : Via la base de données**

La clé peut aussi être stockée dans la table `settings` :
```sql
INSERT INTO settings (key, value)
VALUES ('api_key', '"votre_cle_theoddsapi"')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

**🔑 Obtenir une clé API :**
1. Aller sur https://the-odds-api.com/
2. S'inscrire (plan gratuit = 500 requêtes/mois)
3. Copier votre clé API

### 2. Configurer les paramètres initiaux

Se rendre sur l'interface : `http://localhost:3000/settings/data-collection`

**Configurer :**
- **Sports suivis** : Sélectionner les ligues de football à tracker
- **Marchés suivis** : Choisir les marchés de cotes (h2h, totals, spreads, etc.)
- **Fréquence de scan** : 10 minutes (recommandé) ou ajuster selon vos besoins
- **Fallback historique** : Désactivé par défaut (coûte 10× plus cher)

**Valeurs recommandées pour débuter :**
```
Sports :
  ✓ EPL (soccer_epl)
  ✓ Ligue 1 (soccer_france_ligue_one)

Marchés :
  ✓ h2h (Moneyline 1X2)
  ✓ totals (Over/Under)

Fréquence : 10 minutes
Fallback : Désactivé
```

### 3. Tester les workflows manuellement

**A. Découverte des événements (0 crédits - GRATUIT)**

```bash
# Depuis GitHub Actions
1. Aller sur : https://github.com/VOTRE_USERNAME/OddsTracker/actions
2. Sélectionner "Sync Events (v4)"
3. Cliquer "Run workflow"
```

Ou en local :
```bash
# Installer les dépendances si pas déjà fait
npm install

# Exécuter le script de découverte
node --loader ts-node/esm scripts/test-discovery.ts
```

**B. Scan des cotes d'ouverture (~6 crédits par événement)**

```bash
# Via GitHub Actions
1. Aller sur : https://github.com/VOTRE_USERNAME/OddsTracker/actions
2. Sélectionner "Scan Opening Odds (v4)"
3. Cliquer "Run workflow"
```

**C. Récupération des cotes de clôture (~8 crédits par événement)**

```bash
# Via GitHub Actions
1. Aller sur : https://github.com/VOTRE_USERNAME/OddsTracker/actions
2. Sélectionner "Sync Scores & Closing Odds (v4)"
3. Cliquer "Run workflow"
```

### 4. Vérifier que tout fonctionne

**A. Vérifier dans Supabase**

Aller dans votre projet Supabase > Table Editor :

```sql
-- Vérifier les sports découverts
SELECT * FROM sports WHERE active = true;

-- Vérifier les événements
SELECT COUNT(*) FROM events;

-- Vérifier les cotes capturées
SELECT COUNT(*) FROM market_states WHERE status = 'captured';

-- Vérifier les logs d'utilisation API
SELECT * FROM api_usage_logs ORDER BY created_at DESC LIMIT 10;
```

**B. Vérifier dans l'interface web**

```bash
npm run dev
```

Ouvrir : http://localhost:3000

1. **Dashboard** : Doit afficher le nombre d'événements et la consommation API
2. **Football** : Doit lister les matchs avec cotes d'ouverture/clôture
3. **Settings** : Doit afficher les sports et marchés configurés

### 5. Lancer en production (Vercel)

```bash
# 1. Configurer les variables d'environnement dans Vercel
ODDS_API_KEY=votre_cle_theoddsapi
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CRON_SECRET=votre_secret_cron

# 2. Déployer
git push origin main

# 3. Vérifier les workflows GitHub Actions
# Ils tourneront automatiquement selon les horaires configurés
```

## 📊 Monitoring de la consommation API

**Quota par défaut : 500 requêtes/mois (plan gratuit)**

### Coût estimé par événement :
- **Découverte** : 0 crédit (GRATUIT !)
- **Opening odds** : ~6 crédits (1 requête par événement)
- **Closing odds** : ~8 crédits (1 requête par événement)

### Exemple de consommation mensuelle :

**Scénario conservateur (EPL uniquement) :**
```
- 38 matchs/mois × 6 crédits (opening) = 228 crédits
- 38 matchs/mois × 8 crédits (closing) = 304 crédits
TOTAL : ~532 crédits/mois
```

**Scénario avec plusieurs ligues :**
```
- EPL (38 matchs) + Ligue 1 (38 matchs) = 76 matchs/mois
- 76 × 6 (opening) + 76 × 8 (closing) = 1064 crédits/mois
⚠️ Nécessite un plan payant !
```

### Vérifier la consommation :

```sql
-- Consommation aujourd'hui
SELECT SUM(credits_used) as credits_today
FROM api_usage_logs
WHERE created_at >= CURRENT_DATE;

-- Consommation ce mois
SELECT SUM(credits_used) as credits_month
FROM api_usage_logs
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE);

-- Détail par job
SELECT
  job_name,
  COUNT(*) as executions,
  SUM(credits_used) as total_credits,
  AVG(credits_used) as avg_credits
FROM api_usage_logs
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY job_name;
```

## 🐛 Dépannage

### Problème : "ODDS_API_KEY environment variable is required"

**Solution :** Ajouter `ODDS_API_KEY` dans `.env.local` et redémarrer le serveur.

### Problème : Aucun événement ne s'affiche

**Solution :**
1. Vérifier que des sports sont configurés dans Settings
2. Lancer manuellement le workflow "Sync Events"
3. Vérifier les logs dans Supabase `api_usage_logs`

### Problème : Les cotes ne se capturent pas

**Solution :**
1. Vérifier que les marchés sont configurés dans Settings
2. S'assurer que le workflow "Scan Opening Odds" tourne
3. Vérifier qu'il y a des événements avec `status='upcoming'` dans la table `events`

### Problème : Quota API dépassé

**Solution :**
1. Réduire le nombre de ligues suivies
2. Augmenter la fréquence de scan (ex: 15 ou 30 minutes au lieu de 10)
3. Upgrader vers un plan payant sur https://the-odds-api.com/

## 📚 Ressources

- Documentation The Odds API : https://the-odds-api.com/liveapi/guides/v4/
- Support : https://github.com/the-odds-api/samples-v4
- Pricing : https://the-odds-api.com/#pricing-section
