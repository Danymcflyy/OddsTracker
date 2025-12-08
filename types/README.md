# 📦 Types TypeScript - OddsTracker

Documentation complète de la structure des types TypeScript de l'application.

## 📁 Structure des fichiers

```
types/
├── index.ts              ← Export centralisé de tous les types
├── database.ts           ← Types générés depuis le schéma SQL (9 tables)
├── fixture.ts            ← Types pour les fixtures et matchs
├── odds.ts               ← Types pour les cotes et marchés
├── sports.ts             ← Types pour les sports, ligues, pays
├── api.ts                ← Types pour les réponses API
├── oddspapi.ts           ← Types pour l'API externe OddsPapi
├── auth.ts               ← Types pour l'authentification
├── settings.ts           ← Types pour les paramètres de l'app
├── filters.ts            ← Types pour les filtres UI
└── README.md             ← Ce fichier
```

## 🎯 Utilisation

### Import centralisé

```typescript
// ✅ Recommandé : Import depuis l'index
import { Fixture, ApiResponse, SportSlug } from "@/types";

// ❌ À éviter : Import direct
import { Fixture } from "@/types/fixture";
```

### Types de base de données

Les types générés depuis [database.ts](./database.ts) correspondent exactement au schéma SQL :

```typescript
import { Fixture, Odd, Sport } from "@/types";

// Type Row : Données telles qu'elles sont en DB
const fixture: Fixture = {
  id: 1,
  oddspapi_id: "abc123",
  sport_id: 10,
  league_id: 1,
  home_team_id: 1,
  away_team_id: 2,
  start_time: "2025-01-01T20:00:00Z",
  home_score: null,
  away_score: null,
  status: "scheduled",
  created_at: "2025-01-01T10:00:00Z",
  updated_at: "2025-01-01T10:00:00Z",
};
```

### Types enrichis (avec relations)

Pour afficher des données avec leurs relations, utilisez les types `With*` :

```typescript
import { FixtureWithDetails, FixtureWithOdds } from "@/types";

// Fixture avec équipes, ligue et pays
const fixtureWithDetails: FixtureWithDetails = {
  ...fixture, // Tous les champs de Fixture
  home_team: { id: 1, name: "PSG" },
  away_team: { id: 2, name: "OM" },
  league: {
    id: 1,
    name: "Ligue 1",
    country: { id: 1, name: "France" },
  },
};

// Fixture avec cotes
const fixtureWithOdds: FixtureWithOdds = {
  ...fixtureWithDetails,
  odds: [
    /* Array d'Odd */
  ],
};
```

## 📋 Types par catégorie

### 1. Database (database.ts)

Types générés depuis le schéma SQL. Chaque table a 3 types :

- **Row** : Lecture (SELECT)
- **Insert** : Insertion (INSERT)
- **Update** : Mise à jour (UPDATE)

```typescript
import { Fixture, FixtureInsert, FixtureUpdate } from "@/types";

// Lecture
const fixture: Fixture = await db.select();

// Insertion
const newFixture: FixtureInsert = {
  oddspapi_id: "abc123",
  sport_id: 10,
  league_id: 1,
  home_team_id: 1,
  away_team_id: 2,
  start_time: "2025-01-01T20:00:00Z",
  // Les champs optionnels peuvent être omis
};

// Mise à jour
const updates: FixtureUpdate = {
  home_score: 2,
  away_score: 1,
  status: "finished",
};
```

**9 tables disponibles** :

| Table       | Type Row   | Type Insert        | Type Update        |
| ----------- | ---------- | ------------------ | ------------------ |
| sports      | Sport      | SportInsert        | SportUpdate        |
| countries   | Country    | CountryInsert      | CountryUpdate      |
| leagues     | League     | LeagueInsert       | LeagueUpdate       |
| teams       | Team       | TeamInsert         | TeamUpdate         |
| fixtures    | Fixture    | FixtureInsert      | FixtureUpdate      |
| markets     | Market     | MarketInsert       | MarketUpdate       |
| outcomes    | Outcome    | OutcomeInsert      | OutcomeUpdate      |
| odds        | Odd        | OddInsert          | OddUpdate          |
| settings    | Setting    | SettingInsert      | SettingUpdate      |
| sync_logs   | SyncLog    | SyncLogInsert      | SyncLogUpdate      |

### 2. Fixtures (fixture.ts)

Types pour les matchs avec leurs détails :

```typescript
import {
  FixtureWithDetails,
  FixtureWithOdds,
  FixtureWithEnrichedOdds,
  FixtureStatus,
} from "@/types";

// Fixture avec équipes et ligue
const fixtureWithDetails: FixtureWithDetails = {
  /* ... */
};

// Fixture avec cotes basiques
const fixtureWithOdds: FixtureWithOdds = {
  /* ... */
};

// Fixture avec cotes enrichies (market + outcome)
const fixtureWithEnrichedOdds: FixtureWithEnrichedOdds = {
  /* ... */
};

// Statut typé
const status: FixtureStatus = "scheduled"; // "live" | "finished" | "postponed" | "cancelled"
```

### 3. Odds (odds.ts)

Types pour les cotes avec détails :

```typescript
import {
  OddWithDetails,
  OddsByMarket,
  OddComparison,
  MARKET_TYPES,
} from "@/types";

// Cote avec market et outcome
const oddWithDetails: OddWithDetails = {
  id: 1,
  fixture_id: 1,
  market_id: 1,
  outcome_id: 1,
  opening_price: 1.85,
  closing_price: 1.92,
  // ...
  market: {
    id: 1,
    name: "1X2",
    description: "Match Result",
  },
  outcome: {
    id: 1,
    name: "Home",
    description: "Home team wins",
  },
};

// Cotes groupées par marché
const oddsByMarket: OddsByMarket = {
  market: { id: 1, name: "1X2" },
  odds: [
    /* OddWithOutcome[] */
  ],
};

// Constantes de marchés
const marketType = MARKET_TYPES.MATCH_RESULT; // "1X2"
```

### 4. Sports (sports.ts)

Types pour les sports, ligues et pays :

```typescript
import {
  SportSlug,
  SportOddspapiId,
  SPORT_MAPPINGS,
  getSportNameBySlug,
} from "@/types";

// Slugs typés
const slug: SportSlug = SportSlug.FOOTBALL; // "football"

// IDs OddsPapi
const oddspapiId: SportOddspapiId = SportOddspapiId.FOOTBALL; // 10

// Mapping complet
const mapping = SPORT_MAPPINGS[SportSlug.FOOTBALL];
// { oddspapi_id: 10, name: "Football" }

// Helper functions
const name = getSportNameBySlug(SportSlug.FOOTBALL); // "Football"
```

**Sports disponibles** :

| Sport      | Slug         | OddsPapi ID |
| ---------- | ------------ | ----------- |
| Football   | football     | 10          |
| Hockey     | hockey       | 4           |
| Tennis     | tennis       | 2           |
| Volleyball | volleyball   | 34          |

### 5. API (api.ts)

Types pour les réponses API :

```typescript
import {
  ApiResponse,
  PaginatedResponse,
  SyncResponse,
  ApiUsageStats,
} from "@/types";

// Réponse simple
const response: ApiResponse<Fixture[]> = {
  data: [
    /* fixtures */
  ],
  error: undefined,
};

// Réponse paginée
const paginatedResponse: PaginatedResponse<Fixture> = {
  data: [
    /* fixtures */
  ],
  pagination: {
    total: 100,
    page: 1,
    pageSize: 20,
    totalPages: 5,
  },
};

// Réponse de synchronisation
const syncResponse: SyncResponse = {
  success: true,
  sport_id: 10,
  sport_name: "Football",
  records_fetched: 150,
  records_inserted: 120,
  records_updated: 30,
  duration_ms: 5432,
  log_id: 1,
};
```

### 6. OddsPapi (oddspapi.ts)

Types pour l'API externe OddsPapi :

```typescript
import {
  OddspapiFixture,
  OddspapiOdd,
  OddspapiFixturesParams,
  ODDSPAPI_CONSTANTS,
} from "@/types";

// Fixture depuis l'API
const oddspapiFixture: OddspapiFixture = {
  id: "abc123",
  sport_id: 10,
  league_id: 1,
  name: "PSG vs OM",
  start_timestamp: 1704135600,
  status: "scheduled",
  home_team: "PSG",
  away_team: "OM",
  home_score: null,
  away_score: null,
  odds: [
    /* OddspapiOdd[] */
  ],
};

// Paramètres de requête
const params: OddspapiFixturesParams = {
  sport_id: 10,
  date_from: "2025-01-01",
  date_to: "2025-01-31",
  bookmaker: "pinnacle",
  page: 1,
  per_page: 100,
};

// Constantes
const bookmaker = ODDSPAPI_CONSTANTS.BOOKMAKER; // "pinnacle"
```

### 7. Auth (auth.ts)

Types pour l'authentification :

```typescript
import {
  SessionPayload,
  LoginCredentials,
  LoginResponse,
  SESSION_DURATION,
} from "@/types";

// Payload JWT
const payload: SessionPayload = {
  isAuthenticated: true,
  createdAt: Date.now(),
  expiresAt: Date.now() + SESSION_DURATION, // 24h
};

// Formulaire de connexion
const credentials: LoginCredentials = {
  password: "mon_mot_de_passe",
};

// Réponse
const response: LoginResponse = {
  success: true,
  message: "Connexion réussie",
};
```

### 8. Settings (settings.ts)

Types pour les paramètres de l'application :

```typescript
import {
  AppSettings,
  EditableSettings,
  SettingKey,
  settingsArrayToObject,
  DEFAULT_SETTINGS,
} from "@/types";

// Paramètres typés
const settings: AppSettings = {
  password_hash: "...",
  last_sync: "2025-01-01T10:00:00Z",
  auto_sync_enabled: true,
  auto_sync_time: "06:00",
  extra_sync_enabled: false,
  extra_sync_time: "18:00",
  api_requests_count: 150,
  api_requests_reset_date: "2025-02-01",
};

// Paramètres modifiables dans l'UI
const editableSettings: EditableSettings = {
  auto_sync_enabled: true,
  auto_sync_time: "06:00",
  extra_sync_enabled: false,
  extra_sync_time: "18:00",
};

// Helper pour convertir DB → Object
const settingsObject = settingsArrayToObject(settingsFromDB);
```

**Clés de paramètres** :

| Clé                       | Type    | Description                      |
| ------------------------- | ------- | -------------------------------- |
| password_hash             | string  | Hash bcrypt du mot de passe      |
| last_sync                 | string  | Timestamp de la dernière sync    |
| auto_sync_enabled         | boolean | Sync automatique activée         |
| auto_sync_time            | string  | Heure de sync auto (HH:mm)       |
| extra_sync_enabled        | boolean | Sync supplémentaire activée      |
| extra_sync_time           | string  | Heure de sync extra (HH:mm)      |
| api_requests_count        | number  | Nombre de requêtes API           |
| api_requests_reset_date   | string  | Date de reset du compteur        |

### 9. Filters (filters.ts)

Types pour les filtres de l'interface :

```typescript
import { Filters, DateRangeFilter, OddsRangeFilter } from "@/types";

// Filtres complets
const filters: Filters = {
  dateRange: {
    from: new Date("2025-01-01"),
    to: new Date("2025-01-31"),
  },
  countryId: 1,
  leagueId: null,
  teamSearch: "PSG",
  marketType: "1X2",
  oddsRange: {
    min: 1.5,
    max: 3.0,
    type: "closing",
  },
};
```

## 🔧 Helpers et Utilitaires

### Sports

```typescript
import { getSportBySlug, getSportNameBySlug, getOddspapiIdBySlug } from "@/types";

const slug = getSportBySlug("football"); // SportSlug.FOOTBALL
const name = getSportNameBySlug(SportSlug.FOOTBALL); // "Football"
const oddspapiId = getOddspapiIdBySlug(SportSlug.FOOTBALL); // 10
```

### Settings

```typescript
import { settingsArrayToObject, objectToSettingsArray } from "@/types";

// DB array → Object typé
const settings = settingsArrayToObject(dbSettings);

// Object → DB array
const dbArray = objectToSettingsArray(settings);
```

### OddsPapi

```typescript
import { unixToIso, parseMatchName } from "@/types";

// Unix timestamp → ISO string
const isoDate = unixToIso(1704135600); // "2025-01-01T20:00:00.000Z"

// Extraire équipes depuis le nom du match
const teams = parseMatchName("PSG vs OM");
// { homeTeam: "PSG", awayTeam: "OM" }
```

## 🎨 Conventions

### Nomenclature

- **Row** : Type pour lecture (SELECT)
- **Insert** : Type pour insertion (INSERT)
- **Update** : Type pour mise à jour (UPDATE)
- **With*** : Type enrichi avec relations (ex: `FixtureWithDetails`)
- **Input** : Type pour formulaires/API (ex: `CreateFixtureInput`)
- **Response** : Type pour réponses API (ex: `LoginResponse`)
- **Params** : Type pour paramètres de requête (ex: `PaginationParams`)
- **Stats** : Type pour statistiques (ex: `OddStats`)

### Organisation

1. **database.ts** : Source de vérité, générée depuis le schéma SQL
2. **Fichiers spécifiques** : Extension des types de base avec relations et logique métier
3. **index.ts** : Point d'entrée unique pour tous les imports

### Typage strict

```typescript
// ✅ Bon : Utiliser les types explicites
const fixture: Fixture = await getFixture(id);

// ❌ Mauvais : Laisser TypeScript inférer
const fixture = await getFixture(id);

// ✅ Bon : Typer les paramètres et retours
async function getFixture(id: number): Promise<Fixture> {
  // ...
}

// ❌ Mauvais : Omettre les types
async function getFixture(id) {
  // ...
}
```

## 📚 Ressources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/generating-types)
- [Database Schema](../lib/db/migrations/001_initial_schema.sql)

## ✅ Checklist

Lors de l'ajout d'un nouveau type :

- [ ] Créer le type dans le fichier approprié
- [ ] Exporter depuis index.ts
- [ ] Documenter dans ce README si nécessaire
- [ ] Utiliser les types de base (database.ts) quand possible
- [ ] Créer des helpers si nécessaire
- [ ] Respecter les conventions de nomenclature

---

**Dernière mise à jour** : 2025-01-01
