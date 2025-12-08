# 🔌 Intégration OddsPapi - OddsTracker

Système complet de synchronisation des cotes depuis l'API OddsPapi vers Supabase.

## 📁 Structure

```
lib/oddspapi/
├── client.ts           ← Client API OddsPapi
├── sync-service.ts     ← Service de synchronisation
└── README.md           ← Ce fichier

scripts/
├── test-oddspapi.ts    ← Script de test de l'API
└── sync-odds.ts        ← Script de synchronisation manuelle
```

## 🚀 Démarrage rapide

### 1. Configuration

Créer ou éditer `.env.local` :

```env
# API OddsPapi
ODDSPAPI_API_KEY=votre_cle_api_ici
ODDSPAPI_BASE_URL=https://api.the-odds-api.com

# Supabase (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 2. Exécuter la migration SQL

Aller dans Supabase > SQL Editor et exécuter le contenu de :
```
lib/db/migrations/001_initial_schema.sql
```

### 3. Tester la connexion API

```bash
npm run test:oddspapi
```

Affiche :
- ✅ Statut de connexion
- 📊 Quota API (requêtes utilisées/restantes)
- 🏆 Liste des sports disponibles
- ⚽ Exemple de cotes Pinnacle

### 4. Synchroniser les données

```bash
npm run sync:odds
```

Récupère et sauvegarde :
- 📅 Fixtures (matchs à venir)
- 💰 Cotes Pinnacle (opening/closing)
- 🏆 Scores des matchs terminés

## 🔧 API Client

### Fonctions disponibles

```typescript
import {
  checkApiStatus,
  getSports,
  getOdds,
  getScores,
  extractPinnacleOdds
} from "@/lib/oddspapi/client";

// Vérifier la connexion
const status = await checkApiStatus();
// → { connected: true, requestsUsed: 1, requestsRemaining: 499 }

// Lister les sports
const sports = await getSports();
// → { success: true, data: [...] }

// Récupérer les cotes (Premier League)
const odds = await getOdds("soccer_epl", {
  regions: "eu",
  markets: "h2h,spreads,totals",
  bookmakers: "pinnacle",
});
// → { success: true, data: [...], requestsUsed: 2 }

// Extraire les cotes Pinnacle
const pinnacle = extractPinnacleOdds(odds.data[0]);
// → { lastUpdate: "2025-01-01T...", markets: { h2h: {...}, spreads: {...} } }
```

### Rate Limiting

Le client respecte automatiquement :
- **1 seconde** entre chaque requête
- **Incrémentation du compteur** dans `settings.api_requests_count`

## 📊 Service de Synchronisation

### Configuration des ligues

Éditer `lib/oddspapi/sync-service.ts` :

```typescript
export const SPORTS_CONFIG = [
  {
    key: "soccer_epl",              // Clé OddsPapi
    name: "Premier League",         // Nom affiché
    sport_slug: "football",         // Slug dans notre DB
    country: "England",             // Pays
  },
  // Ajouter d'autres ligues ici...
];
```

**Sports keys disponibles** (exemples) :
- Football : `soccer_epl`, `soccer_spain_la_liga`, `soccer_germany_bundesliga`
- Hockey : `icehockey_nhl`, `icehockey_sweden_hockey_league`
- Tennis : `tennis_atp_french_open`, `tennis_wta_french_open`

### Utilisation programmatique

```typescript
import { getSyncService } from "@/lib/oddspapi/sync-service";

const syncService = getSyncService();

// Synchroniser avec callback de progression
const result = await syncService.syncCurrent({
  onProgress: (progress) => {
    console.log(`${progress.currentLeague}: ${progress.fixturesProcessed} fixtures`);
  },
});

if (result.success) {
  console.log(`✅ ${result.progress.oddsAdded} cotes ajoutées`);
}
```

### Progression en temps réel

```typescript
// Démarrer la sync
syncService.syncCurrent({
  onProgress: (progress) => {
    // Mettre à jour l'UI
    setProgress(progress);
  },
});

// Annuler
syncService.abort();

// Vérifier l'état
const progress = syncService.getProgress();
// → { status: "running", fixturesProcessed: 42, oddsAdded: 126, ... }
```

## 📋 Mapping des données

### OddsPapi → Supabase

| API OddsPapi | Table Supabase | Notes |
|--------------|----------------|-------|
| `event.id` | `fixtures.oddspapi_id` | ID unique du match |
| `event.home_team` | `teams.name` | Créé automatiquement |
| `event.away_team` | `teams.name` | Créé automatiquement |
| `event.commence_time` | `fixtures.start_time` | Date du match |
| `bookmaker.markets[].key` | `markets.name` | h2h, spreads, totals |
| `outcome.name` | `outcomes.name` | Home, Draw, Away, Over, Under |
| `outcome.price` | `odds.closing_price` | Cote décimale |
| `bookmaker.last_update` | `odds.closing_timestamp` | Date de la cote |

### Schéma de données

```
Sport (football, hockey...)
  └─→ League (Premier League, NHL...)
      └─→ Fixtures (matchs)
          ├─→ Teams (home_team, away_team)
          └─→ Odds (cotes par fixture)
              ├─→ Market (h2h, spreads, totals)
              └─→ Outcome (Home, Draw, Away, Over, Under)
```

## 🔄 Flux de synchronisation

```
1. Récupérer les ligues configurées (SPORTS_CONFIG)
   ↓
2. Pour chaque ligue :
   a. Créer/récupérer Sport, Country, League en DB
   b. Appeler API : GET /v4/sports/{sport_key}/odds
   c. Pour chaque événement :
      - Créer teams (home/away)
      - Créer/update fixture
      - Extraire cotes Pinnacle
      - Créer markets, outcomes, odds
   d. Appeler API : GET /v4/sports/{sport_key}/scores
   e. Mettre à jour les scores
   ↓
3. Mettre à jour sync_logs et settings.last_sync
```

## 📊 Tables Supabase créées

Pendant la synchronisation, ces tables sont automatiquement remplies :

- ✅ **countries** : Pays des compétitions
- ✅ **leagues** : Compétitions (Premier League, NHL...)
- ✅ **teams** : Équipes/joueurs
- ✅ **fixtures** : Matchs avec dates et scores
- ✅ **markets** : Types de paris (1X2, Handicap, O/U)
- ✅ **outcomes** : Résultats possibles (Home, Draw, Away...)
- ✅ **odds** : Cotes Pinnacle avec timestamps
- ✅ **sync_logs** : Logs de chaque synchronisation

## 🧪 Tests

### Test complet

```bash
# 1. Tester l'API
npm run test:oddspapi

# 2. Synchroniser (mode test avec 1 ligue)
npm run sync:odds

# 3. Vérifier dans Supabase
# Aller dans Table Editor > fixtures, odds, etc.
```

### Exemples de requêtes SQL

```sql
-- Compter les fixtures par sport
SELECT s.name, COUNT(f.id) as total
FROM fixtures f
JOIN sports s ON f.sport_id = s.id
GROUP BY s.name;

-- Voir les dernières cotes ajoutées
SELECT
  f.start_time,
  ht.name as home,
  at.name as away,
  m.name as market,
  o.name as outcome,
  od.closing_price
FROM odds od
JOIN fixtures f ON od.fixture_id = f.id
JOIN teams ht ON f.home_team_id = ht.id
JOIN teams at ON f.away_team_id = at.id
JOIN markets m ON od.market_id = m.id
JOIN outcomes o ON od.outcome_id = o.id
ORDER BY od.created_at DESC
LIMIT 10;

-- Vérifier les logs de sync
SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT 5;
```

## ⚠️ Limites API

| Plan | Requêtes/mois | Coût |
|------|---------------|------|
| Gratuit | 500 | $0 |
| Starter | 10,000 | $25/mois |
| Pro | 50,000 | $99/mois |

**Estimation** : 1 sync complète (5 ligues) = ~10-15 requêtes

## 🐛 Dépannage

### "API_KEY non configurée"

```bash
# Vérifier que la clé est dans .env.local
grep ODDSPAPI_API_KEY .env.local
```

### "Sport introuvable dans la base de données"

```bash
# Exécuter la migration SQL
# lib/db/migrations/001_initial_schema.sql contient les 4 sports pré-insérés
```

### "Erreur lors de la création de..."

Vérifier que :
1. La migration SQL a été exécutée
2. SUPABASE_SERVICE_ROLE_KEY est défini
3. Les clés Supabase sont valides

### Réinitialiser les données

```sql
-- ⚠️ SUPPRIME TOUTES LES DONNÉES
TRUNCATE TABLE odds, outcomes, markets, fixtures, teams, leagues, countries CASCADE;
```

## 📚 Ressources

- [Documentation OddsPapi](https://the-odds-api.com/liveapi/guides/v4/)
- [Sports disponibles](https://the-odds-api.com/sports-odds-data/sports-apis.html)
- [Types de marchés](https://the-odds-api.com/sports-odds-data/betting-markets.html)
- [Schéma Supabase](../db/migrations/001_initial_schema.sql)

---

**Dernière mise à jour** : 2025-01-01
