# ✅ Checklist Migration v4 - OddsTracker

## 🎉 Statut de la migration : COMPLÈTE

### ✅ Étapes terminées

- [x] **Migrations SQL** appliquées dans Supabase
- [x] **Backend v4** complet (services discovery, opening-odds, closing-odds)
- [x] **GitHub Actions workflows** créés et configurés
- [x] **Frontend** adapté (dashboard + page football)
- [x] **API routes v4** créées (/api/v4/*)
- [x] **Nettoyage** des fichiers v3 obsolètes
- [x] **Build** réussi sans erreurs

## 🚀 Étapes pour rendre l'application fonctionnelle

### 1️⃣ Configurer la clé API The Odds API

**Action immédiate :**

1. Obtenir une clé API gratuite :
   - Aller sur https://the-odds-api.com/
   - Créer un compte (plan gratuit = 500 requêtes/mois)
   - Copier votre clé API

2. Configurer dans `.env.local` :
   ```bash
   # Remplacer cette ligne :
   ODDS_API_KEY=YOUR_API_KEY_HERE

   # Par votre vraie clé :
   ODDS_API_KEY=votre_cle_ici
   ```

### 2️⃣ Tester la connexion API

```bash
# Installer tsx si pas déjà fait
npm install -D tsx

# Tester la connexion
npx tsx scripts/test-api-v4.ts
```

**Résultat attendu :**
```
✅ Connexion réussie !
📊 Statistiques :
   - Sports actifs : 67
   - Requêtes restantes : 499
⚽ Sports de football disponibles :
   - English Premier League (soccer_epl)
   - French Ligue 1 (soccer_france_ligue_one)
   ...
```

### 3️⃣ Démarrer l'application

```bash
npm run dev
```

Ouvrir : http://localhost:3000

### 4️⃣ Configurer les paramètres initiaux

Aller sur : http://localhost:3000/settings/data-collection

**Configuration recommandée pour débuter :**

- **Sports suivis** :
  - ✅ EPL (soccer_epl)
  - ✅ Ligue 1 (soccer_france_ligue_one)

- **Marchés suivis** :
  - ✅ h2h (Moneyline 1X2)
  - ✅ totals (Over/Under)
  - ✅ spreads (Handicap)

- **Fréquence de scan** : 10 minutes
- **Fallback historique** : ❌ Désactivé (coûte 10× plus cher)

Cliquer sur **"Save Settings"**

### 5️⃣ Lancer la découverte des événements

**Option A : Via GitHub Actions**

1. Aller sur : https://github.com/VOTRE_USERNAME/OddsTracker/actions
2. Sélectionner : "Sync Events (v4)"
3. Cliquer : "Run workflow" → "Run workflow"

**Option B : En local (pour tester)**

Créer un fichier `scripts/run-discovery.ts` :
```typescript
import { syncSports, syncEvents } from '../lib/services/theoddsapi/discovery';

async function main() {
  console.log('🔍 Découverte des sports...');
  const sportsResult = await syncSports();
  console.log(`✅ ${sportsResult.sportsCount} sports synchronisés`);

  console.log('\n📅 Découverte des événements...');
  const eventsResult = await syncEvents();
  console.log(`✅ ${eventsResult.eventsCount} événements découverts`);
  console.log(`📊 ${eventsResult.creditsUsed} crédits utilisés (0 normalement)`);
}

main().catch(console.error);
```

Exécuter :
```bash
npx tsx scripts/run-discovery.ts
```

### 6️⃣ Vérifier les données dans Supabase

Aller dans votre projet Supabase → Table Editor :

**Vérifier les sports :**
```sql
SELECT * FROM sports WHERE active = true;
```
**Attendu :** Au moins 2 lignes (EPL, Ligue 1)

**Vérifier les événements :**
```sql
SELECT
  id,
  sport_key,
  home_team,
  away_team,
  commence_time
FROM events
ORDER BY commence_time
LIMIT 10;
```
**Attendu :** Des matchs à venir

**Vérifier les market_states :**
```sql
SELECT
  e.home_team,
  e.away_team,
  ms.market_key,
  ms.status
FROM market_states ms
JOIN events e ON e.id = ms.event_id
LIMIT 10;
```
**Attendu :** Des lignes avec status = 'pending'

### 7️⃣ Lancer le scan des cotes d'ouverture

**Via GitHub Actions :**

1. Aller sur : Actions
2. Sélectionner : "Scan Opening Odds (v4)"
3. Cliquer : "Run workflow"

**Vérifier dans Supabase :**
```sql
SELECT
  e.home_team,
  e.away_team,
  ms.market_key,
  ms.status,
  ms.opening_captured_at
FROM market_states ms
JOIN events e ON e.id = ms.event_id
WHERE ms.status = 'captured'
LIMIT 10;
```
**Attendu :** Des cotes capturées avec `opening_captured_at` rempli

### 8️⃣ Vérifier l'interface web

**Dashboard (http://localhost:3000) :**
- Nombre de matchs disponibles
- Dernière synchronisation
- Crédits API utilisés aujourd'hui

**Page Football (http://localhost:3000/football) :**
- Liste des matchs avec cotes
- Filtres fonctionnels
- Colonnes dynamiques (Ouverture/Clôture)

## 📊 Monitoring de la consommation

**Vérifier la consommation API :**
```sql
-- Consommation aujourd'hui
SELECT SUM(credits_used) as credits_today
FROM api_usage_logs
WHERE created_at >= CURRENT_DATE;

-- Détail par job
SELECT
  job_name,
  COUNT(*) as executions,
  SUM(credits_used) as total_credits
FROM api_usage_logs
GROUP BY job_name
ORDER BY total_credits DESC;
```

## 🐛 Troubleshooting

### Erreur : "ODDS_API_KEY environment variable is required"

**Solution :**
1. Vérifier que `ODDS_API_KEY` est dans `.env.local`
2. Redémarrer le serveur : `npm run dev`

### Aucun événement ne s'affiche

**Solution :**
1. Vérifier les settings : http://localhost:3000/settings/data-collection
2. Lancer "Sync Events" manuellement
3. Vérifier les logs : `SELECT * FROM api_usage_logs ORDER BY created_at DESC;`

### Les cotes ne se capturent pas

**Solution :**
1. Vérifier que des événements existent : `SELECT COUNT(*) FROM events;`
2. Vérifier les market_states : `SELECT COUNT(*) FROM market_states WHERE status='pending';`
3. Lancer "Scan Opening Odds" manuellement

## 📚 Documentation

- **Guide complet** : [docs/GETTING_STARTED_V4.md](docs/GETTING_STARTED_V4.md)
- **The Odds API** : https://the-odds-api.com/liveapi/guides/v4/
- **Architecture v4** : [docs/ARCHITECTURE_V4.md](docs/ARCHITECTURE_V4.md)

## 🎯 Prochaines étapes (optionnel)

- [ ] Déployer sur Vercel
- [ ] Configurer les variables d'environnement Vercel
- [ ] Tester les workflows automatiques (6h, 10min, 2×/jour)
- [ ] Monitorer la consommation API
- [ ] Ajuster les paramètres selon vos besoins

---

**Besoin d'aide ?** Consultez [docs/GETTING_STARTED_V4.md](docs/GETTING_STARTED_V4.md)
