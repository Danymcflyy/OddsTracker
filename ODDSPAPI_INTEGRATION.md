# ✅ Intégration OddsPapi → Supabase Terminée

L'intégration complète de l'API OddsPapi avec votre base de données Supabase est maintenant fonctionnelle !

## 🎉 Ce qui a été créé

### 1. Client API (`lib/oddspapi/client.ts`)
- ✅ Connexion à l'API OddsPapi
- ✅ Rate limiting automatique (1 req/seconde)
- ✅ Compteur de requêtes dans Supabase
- ✅ Extraction des cotes Pinnacle
- ✅ Gestion des erreurs et retry

**Fonctions disponibles** :
- `checkApiStatus()` - Vérifier la connexion
- `getSports()` - Lister les sports
- `getOdds(sportKey)` - Récupérer les cotes
- `getScores(sportKey)` - Récupérer les scores
- `extractPinnacleOdds(event)` - Extraire cotes Pinnacle

### 2. Service de Synchronisation (`lib/oddspapi/sync-service.ts`)
- ✅ Mapping complet OddsPapi → Supabase
- ✅ Gestion automatique des relations (sports, leagues, teams, fixtures, odds)
- ✅ Upsert des données (mise à jour si existe)
- ✅ Progression en temps réel
- ✅ Logs dans `sync_logs`
- ✅ Gestion des erreurs et rollback

**Schéma de données** :
```
Sports (4 pré-insérés: Football, Hockey, Tennis, Volleyball)
  └─→ Countries (créés automatiquement)
      └─→ Leagues (Premier League, NHL...)
          └─→ Fixtures (matchs)
              ├─→ Teams (home/away)
              └─→ Odds
                  ├─→ Markets (h2h, spreads, totals)
                  └─→ Outcomes (Home, Draw, Away...)
```

### 3. Scripts de Test et Sync

**`scripts/test-oddspapi.ts`** - Test de connexion
```bash
npm run test:oddspapi
```
Affiche :
- ✅ Statut de connexion
- 📊 Quota API (requêtes utilisées/restantes)
- 🏆 Sports disponibles
- ⚽ Exemple de cotes Pinnacle

**`scripts/sync-odds.ts`** - Synchronisation manuelle
```bash
npm run sync:odds
```
Récupère et sauvegarde :
- 📅 Fixtures (matchs à venir)
- 💰 Cotes Pinnacle (closing)
- 🏆 Scores des matchs
- 📊 Logs dans `sync_logs`

### 4. Documentation

**`lib/oddspapi/README.md`** - Guide complet
- 📖 API complète
- 🔧 Configuration
- 🧪 Tests
- 🐛 Dépannage
- 📊 Mapping des données

## 🚀 Utilisation

### Prérequis

1. **Exécuter la migration SQL** (si pas déjà fait) :
   - Aller dans Supabase > SQL Editor
   - Copier/coller le contenu de `lib/db/migrations/001_initial_schema.sql`
   - Cliquer sur "Run"

2. **Configurer la clé API** dans `.env.local` :
```env
ODDSPAPI_API_KEY=votre_cle_api_ici
ODDSPAPI_BASE_URL=https://api.the-odds-api.com
```

3. **Installer tsx** (pour exécuter les scripts TypeScript) :
```bash
npm install
```

### Étapes de test

```bash
# 1. Tester la connexion API
npm run test:oddspapi

# 2. Synchroniser les données (première fois)
npm run sync:odds

# 3. Vérifier dans Supabase Table Editor
#    - fixtures : les matchs
#    - odds : les cotes
#    - sync_logs : les logs
```

## 📊 Configuration des ligues

Par défaut, ces ligues sont synchronisées :

| Sport | Ligue | Clé OddsPapi |
|-------|-------|--------------|
| ⚽ Football | Premier League | `soccer_epl` |
| ⚽ Football | La Liga | `soccer_spain_la_liga` |
| ⚽ Football | Bundesliga | `soccer_germany_bundesliga` |
| 🏒 Hockey | NHL | `icehockey_nhl` |
| 🎾 Tennis | Roland Garros | `tennis_atp_french_open` |

### Ajouter d'autres ligues

Éditer `lib/oddspapi/sync-service.ts` :

```typescript
export const SPORTS_CONFIG = [
  // Ligues existantes...
  {
    key: "soccer_italy_serie_a",    // Clé OddsPapi
    name: "Serie A",                // Nom affiché
    sport_slug: "football",         // Slug sport (dans notre DB)
    country: "Italy",               // Pays
  },
  // Ajouter d'autres ligues ici...
];
```

**Clés disponibles** : https://the-odds-api.com/sports-odds-data/sports-apis.html

## 🔄 Intégration dans l'application

### API Route (sync manuelle depuis l'UI)

Créer `app/api/sync/manual/route.ts` :

```typescript
import { NextResponse } from "next/server";
import { getSyncService } from "@/lib/oddspapi/sync-service";

export async function POST() {
  const syncService = getSyncService();

  const result = await syncService.syncCurrent();

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: `${result.progress.oddsAdded} cotes synchronisées`,
      stats: result.progress,
    });
  }

  return NextResponse.json({
    success: false,
    error: result.progress.errors.join(", "),
  }, { status: 500 });
}
```

### Utilisation dans les composants

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SyncButton() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/sync/manual", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ Erreur: ${data.error}`);
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button onClick={handleSync} disabled={syncing}>
      {syncing ? "Synchronisation..." : "Synchroniser"}
    </Button>
  );
}
```

## 📋 Vérification des données

### SQL rapide

```sql
-- Compter les fixtures par sport
SELECT s.name, COUNT(f.id) as total
FROM fixtures f
JOIN sports s ON f.sport_id = s.id
GROUP BY s.name;

-- Dernières cotes ajoutées
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
```

## ⚠️ Important

### Limites API

| Plan | Requêtes/mois | Coût |
|------|---------------|------|
| Gratuit | 500 | $0 |
| Starter | 10,000 | $25/mois |

**1 synchronisation complète = ~10-15 requêtes**

### Données actuelles vs historiques

⚠️ **L'API OddsPapi ne fournit QUE les cotes actuelles** (closing)

Pour récupérer les cotes **opening** :
- Soit synchroniser 2 fois par jour (opening + closing)
- Soit utiliser l'endpoint historique (payant)

### Fréquence recommandée

- **Tests** : 1x par jour
- **Production** : 2x par jour (matin + soir avant les matchs)
- **Quotas** : Surveiller `settings.api_requests_count`

## 🐛 Dépannage

### "API_KEY non configurée"
→ Ajouter `ODDSPAPI_API_KEY` dans `.env.local`

### "Sport introuvable"
→ Exécuter la migration SQL (`001_initial_schema.sql`)

### "Erreur lors de la création de..."
→ Vérifier que `SUPABASE_SERVICE_ROLE_KEY` est défini

### Réinitialiser toutes les données
```sql
TRUNCATE TABLE odds, outcomes, markets, fixtures, teams, leagues, countries CASCADE;
```

## 📚 Ressources

- [Documentation OddsPapi](https://the-odds-api.com/liveapi/guides/v4/)
- [Sports disponibles](https://the-odds-api.com/sports-odds-data/sports-apis.html)
- [Schéma Supabase](lib/db/migrations/001_initial_schema.sql)
- [Guide complet](lib/oddspapi/README.md)

## ✅ Prochaines étapes

1. ✅ Tester la connexion : `npm run test:oddspapi`
2. ✅ Synchroniser les données : `npm run sync:odds`
3. ✅ Vérifier dans Supabase Table Editor
4. ⏳ Créer l'API route `/api/sync/manual`
5. ⏳ Ajouter le bouton de sync dans `/settings`
6. ⏳ Configurer le cron Vercel pour sync automatique

---

**Intégration créée le** : 2025-01-01
**Fichiers modifiés** : package.json, .env.local (à compléter)
