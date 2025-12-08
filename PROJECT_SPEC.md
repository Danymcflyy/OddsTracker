# OddsTracker - Spécifications Techniques Complètes

## 📋 Résumé du Projet

**Nom** : OddsTracker  
**Client** : Codeur Ben  
**Prix** : 950 € TTC  
**Délai** : ~5 jours (livraison vendredi, point mi-parcours)  
**Type** : Application web d'analyse de cotes sportives historiques

---

## 🎯 Objectif

Créer une application web permettant de consulter et analyser les cotes historiques sportives depuis janvier 2019, avec données issues de l'API OddsPapi (bookmaker Pinnacle uniquement).

---

## 🏗️ Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js | 14+ (App Router) |
| Langage | TypeScript | 5+ |
| UI | Tailwind CSS + shadcn/ui | Latest |
| Tableau | TanStack Table | v8 |
| Base de données | PostgreSQL via Supabase | Free Tier |
| Hébergement | Vercel | Hobby (gratuit) |
| Cron Jobs | Vercel Cron | 1x/jour |
| API Cotes | OddsPapi | ~69€/mois (client) |

---

## 🔐 Authentification

### Système simple par mot de passe unique

- Pas d'email, pas de création de compte
- Un seul mot de passe défini dans les variables d'environnement
- Stockage du token de session en cookie HTTP-only
- Expiration de session : 7 jours
- Possibilité de changer le mot de passe dans les réglages

```env
# .env.local
APP_PASSWORD=motdepasse_initial_securise
APP_SESSION_SECRET=random_32_chars_secret
```

---

## 📊 Sports Couverts (4 sports)

| Sport | ID OddsPapi | Ligues | Historique depuis |
|-------|-------------|--------|-------------------|
| Football (Soccer) | 10 | Toutes disponibles via Pinnacle | Janvier 2019 |
| Hockey sur glace | 4 | Toutes disponibles via Pinnacle | Janvier 2019 |
| Tennis | 2 | Toutes disponibles via Pinnacle | Janvier 2019 |
| Volleyball | 34 | Toutes disponibles via Pinnacle | Janvier 2019 |

---

## 🗄️ Schéma de Base de Données

### Table `sports`

```sql
CREATE TABLE sports (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO sports (oddspapi_id, name, slug) VALUES
(10, 'Football', 'football'),
(4, 'Hockey', 'hockey'),
(2, 'Tennis', 'tennis'),
(34, 'Volleyball', 'volleyball');
```

### Table `countries`

```sql
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  oddspapi_slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL
);
```

### Table `leagues`

```sql
CREATE TABLE leagues (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  sport_id INTEGER REFERENCES sports(id),
  country_id INTEGER REFERENCES countries(id),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL
);

CREATE INDEX idx_leagues_sport ON leagues(sport_id);
CREATE INDEX idx_leagues_country ON leagues(country_id);
```

### Table `teams`

```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL
);
```

### Table `fixtures`

```sql
CREATE TABLE fixtures (
  id SERIAL PRIMARY KEY,
  oddspapi_id VARCHAR(50) UNIQUE NOT NULL,
  sport_id INTEGER REFERENCES sports(id),
  league_id INTEGER REFERENCES leagues(id),
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  start_time TIMESTAMP NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fixtures_sport ON fixtures(sport_id);
CREATE INDEX idx_fixtures_league ON fixtures(league_id);
CREATE INDEX idx_fixtures_start_time ON fixtures(start_time);
CREATE INDEX idx_fixtures_home_team ON fixtures(home_team_id);
CREATE INDEX idx_fixtures_away_team ON fixtures(away_team_id);
```

### Table `markets`

```sql
CREATE TABLE markets (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255)
);
```

### Table `outcomes`

```sql
CREATE TABLE outcomes (
  id SERIAL PRIMARY KEY,
  oddspapi_id INTEGER UNIQUE NOT NULL,
  market_id INTEGER REFERENCES markets(id),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255)
);

CREATE INDEX idx_outcomes_market ON outcomes(market_id);
```

### Table `odds`

```sql
CREATE TABLE odds (
  id SERIAL PRIMARY KEY,
  fixture_id INTEGER REFERENCES fixtures(id) ON DELETE CASCADE,
  market_id INTEGER REFERENCES markets(id),
  outcome_id INTEGER REFERENCES outcomes(id),
  opening_price DECIMAL(10,3),
  closing_price DECIMAL(10,3),
  opening_timestamp TIMESTAMP,
  closing_timestamp TIMESTAMP,
  is_winner BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_odds_fixture ON odds(fixture_id);
CREATE INDEX idx_odds_market ON odds(market_id);
CREATE INDEX idx_odds_outcome ON odds(outcome_id);
CREATE INDEX idx_odds_opening_price ON odds(opening_price);
CREATE INDEX idx_odds_closing_price ON odds(closing_price);
CREATE INDEX idx_odds_is_winner ON odds(is_winner);
```

### Table `settings`

```sql
CREATE TABLE settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
('password_hash', ''),
('last_sync', ''),
('auto_sync_enabled', 'true'),
('auto_sync_time', '06:00'),
('extra_sync_enabled', 'false'),
('extra_sync_time', '18:00'),
('api_requests_count', '0'),
('api_requests_reset_date', '');
```

### Table `sync_logs`

```sql
CREATE TABLE sync_logs (
  id SERIAL PRIMARY KEY,
  sport_id INTEGER REFERENCES sports(id),
  status VARCHAR(20) NOT NULL,
  records_fetched INTEGER DEFAULT 0,
  records_inserted INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_sync_logs_sport ON sync_logs(sport_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
```

---

## 🔌 Intégration API OddsPapi

### Configuration

```env
ODDSPAPI_API_KEY=cle_api_client
ODDSPAPI_BASE_URL=https://api.oddspapi.io
```

### Endpoints utilisés

| Endpoint | Usage |
|----------|-------|
| `GET /v4/sports` | Liste des sports disponibles |
| `GET /v4/tournaments` | Liste des compétitions par sport |
| `GET /v4/fixtures` | Liste des matchs par compétition |
| `GET /v4/odds-by-tournaments` | Cotes actuelles par compétition |
| `GET /v4/historical-odds` | Historique des cotes par match |
| `GET /v4/settlements` | Résultats des matchs |
| `GET /account` | Vérification quota API |

### Paramètres standards

```typescript
const DEFAULT_PARAMS = {
  bookmakers: 'pinnacle',
  // Pas de limit sur les bookmakers car Pinnacle uniquement
};
```

### Clé OddsPapi

- La clé API est stockée dans Supabase (`settings.oddspapi_api_key`) et éditable depuis la page ⚙️ Réglages.  
- En production (Vercel), mettez d’abord une valeur via l’interface puis, si besoin, synchronisez avec la variable d’environnement.  
- Les services (`auto-sync`, scripts) appliquent automatiquement la dernière valeur enregistrée, avec repli sur `ODDSPAPI_API_KEY` défini dans l’environnement local.

### Gestion des rate limits

- Cooldown `/v4/historical-odds` : 5000ms
- Cooldown `/v4/odds-by-tournaments` : 1000ms
- Implémenter un système de queue avec délai entre requêtes
- Logger toutes les erreurs API dans `sync_logs`

### Processus d'import manuel (scripts/manual-oddspapi-fetch.ts)

Deux passages suffisent pour chaque match :

1. **Avant le match (import initial)**
   ```bash
   npm run manual:oddspapi -- --sport=<ID> --tournament=<ID> --days=<N> --limit=<M> --insert
   ```
   - Récupère les fixtures via `/v4/odds-by-tournaments` (markets 101 + 1025).  
   - En cas d’échec, bascule automatiquement sur `/v4/historical-odds`.  
   - Normalise les équipes (mêmes mappings que l’import CSV).  
   - Insère une seule fois les cotes d’ouverture (1X2, Over/Under 2.5, Asian handicap).  
   - Exemple Premier League :
     ```bash
     npm run manual:oddspapi -- --sport=10 --tournament=17 --days=7 --limit=5 --insert
     ```

2. **Après le match (finalisation)**
  ```bash
  npm run manual:oddspapi -- --sport=<ID> --tournament=<ID> --days=<N> --limit=<M> --insert --historical=true
  ```
  - Force l’utilisation de `/v4/historical-odds`.  
  - Respecte automatiquement un cooldown de 5s entre deux fixtures.  
  - Récupère la dernière cote disponible (closing) pour chaque marché et met à jour les scores.  
  - Après ce passage, la fixture est marquée comme verrouillée (`odds_locked_at`) afin d’éviter toute réécriture.

> **Paramètres importants** : `--sport`, `--tournament`, `--days`, `--limit`, `--insert`, `--historical`.  
> La commande fonctionne de manière identique en mode manuel aujourd’hui et sera réutilisée telle quelle par la future automatisation (cron/sync-service).

IDs tournois disponibles dans `TOURNAMENT_IDS.md`.

### Finalisation & verrouillage des matchs

- Les matchs terminés sont détectés via `GET /v4/settlements` (scores + statut).  
- Pour chaque fixture terminée non verrouillée :
  1. Lancer le script en mode historique (cf. ci-dessus) pour récupérer la clôture.  
  2. Mettre à jour `fixtures.status`, `home_score`, `away_score`, puis renseigner `fixtures.odds_locked_at`.  
- Une fois verrouillée, la fixture n’est plus affectée par les imports suivants (aucune suppression de ses cotes).

### Stratégies de clôture configurables

- **Option A – “Historical only” (valeur par défaut)** : ouverture et fermeture récupérées via `/v4/historical-odds`. C’est la source la plus fiable mais elle consomme une requête par match lors de la finalisation.  
- **Option B – “Odds by tournaments”** : l’ouverture continue d’utiliser l’historique, mais la clôture s’appuie sur `/v4/odds-by-tournaments` groupé par tournoi avant d’appliquer les settlements. Cela réduit drastiquement le nombre de requêtes lors du verrouillage des matchs terminés tout en conservant la dernière cote disponible.

L’option se règle depuis la page Réglages → bloc “Clôture des cotes”. Le service `auto-sync-service` lit ce paramètre avant chaque exécution et applique automatiquement la stratégie choisie.

### Automatisation (cron futur)

- Le service `lib/sync/sync-service.ts` et les routes `/api/sync/*` devront reproduire exactement les deux phases ci-dessus :
  1. **Phase ouverture** déclenchée manuellement ou via cron pour charger les matchs à venir.
  2. **Phase clôture** (quotidienne) qui repère les fixtures terminées, récupère l'historique (`--historical=true`) puis verrouille `odds_locked_at`.
- L’implémentation pourra simplement orchestrer le même script via `tsx` ou réutiliser ses helpers (normalisation, cooldown, mapping équipes).
- Couverture : même avec 4 sports suivis (ex. football, hockey, tennis, volleyball) et 3–5 championnats par sport, on reste <200 requêtes/jour (40 matches/jour ⇒ ~40 imports ouverture + 40 finalisations + 4 calls settlements). Les quotas OddsPapi sont donc largement respectés tant que l’on limite la liste des tournois à ceux définis dans `TOURNAMENT_IDS.md`.

---

## 📐 Structure des Fichiers

```
oddstracker/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Menu accueil
│   │   ├── football/
│   │   │   └── page.tsx
│   │   ├── hockey/
│   │   │   └── page.tsx
│   │   ├── tennis/
│   │   │   └── page.tsx
│   │   ├── volleyball/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── change-password/route.ts
│   │   ├── fixtures/
│   │   │   └── [sport]/route.ts
│   │   ├── sync/
│   │   │   ├── manual/route.ts
│   │   │   └── cron/route.ts
│   │   ├── export/
│   │   │   ├── csv/route.ts
│   │   │   └── xlsx/route.ts
│   │   └── settings/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn/ui components
│   ├── auth/
│   │   └── login-form.tsx
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── nav-menu.tsx
│   ├── tables/
│   │   ├── data-table.tsx              # Composant générique TanStack
│   │   ├── columns/
│   │   │   ├── football-columns.tsx
│   │   │   ├── hockey-columns.tsx
│   │   │   ├── tennis-columns.tsx
│   │   │   └── volleyball-columns.tsx
│   │   ├── filters/
│   │   │   ├── date-range-filter.tsx
│   │   │   ├── country-filter.tsx
│   │   │   ├── league-filter.tsx
│   │   │   ├── team-filter.tsx
│   │   │   ├── market-filter.tsx
│   │   │   └── odds-range-filter.tsx
│   │   ├── column-visibility.tsx
│   │   └── export-buttons.tsx
│   └── settings/
│       ├── sync-settings.tsx
│       ├── password-change.tsx
│       └── api-usage.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts                    # Client Supabase
│   │   ├── queries/
│   │   │   ├── fixtures.ts
│   │   │   ├── odds.ts
│   │   │   ├── leagues.ts
│   │   │   └── settings.ts
│   │   └── migrations/
│   │       └── 001_initial_schema.sql
│   ├── api/
│   │   ├── oddspapi.ts                 # Client API OddsPapi
│   │   └── types.ts                    # Types API responses
│   ├── sync/
│   │   ├── sync-service.ts             # Service de synchronisation
│   │   ├── historical-sync.ts          # Import historique initial
│   │   └── daily-sync.ts               # Sync quotidienne
│   ├── auth/
│   │   ├── session.ts
│   │   └── middleware.ts
│   ├── export/
│   │   ├── csv-export.ts
│   │   └── xlsx-export.ts
│   └── utils/
│       ├── date.ts
│       ├── odds-format.ts
│       └── winner-detection.ts
├── hooks/
│   ├── use-fixtures.ts
│   ├── use-filters.ts
│   └── use-column-visibility.ts
├── types/
│   ├── fixture.ts
│   ├── odds.ts
│   ├── filters.ts
│   └── api.ts
├── middleware.ts                       # Auth middleware
├── .env.example
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🎨 Interface Utilisateur

### Palette de couleurs (Pro & Sobre)

```css
:root {
  /* Couleurs principales */
  --background: #ffffff;
  --foreground: #0f172a;
  
  /* Couleurs neutres */
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --border: #e2e8f0;
  
  /* Couleurs d'accent */
  --primary: #1e40af;          /* Bleu foncé */
  --primary-foreground: #ffffff;
  
  /* Couleurs de résultat */
  --winner: #16a34a;           /* Vert - Pari gagnant */
  --winner-bg: #dcfce7;        /* Vert clair - Background */
  --loser: #dc2626;            /* Rouge - Pari perdant */
  --loser-bg: #fee2e2;         /* Rouge clair - Background */
  
  /* Couleurs de statut */
  --info: #0ea5e9;
  --warning: #f59e0b;
}
```

### Page de connexion

```
┌─────────────────────────────────────────┐
│                                         │
│           🎯 OddsTracker                │
│                                         │
│      ┌─────────────────────────┐        │
│      │  Mot de passe           │        │
│      │  ••••••••••             │        │
│      └─────────────────────────┘        │
│                                         │
│      [ Se connecter ]                   │
│                                         │
└─────────────────────────────────────────┘
```

### Page d'accueil (Menu)

```
┌─────────────────────────────────────────────────────────┐
│  🎯 OddsTracker                          [⚙️ Réglages] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│    Sélectionnez un sport                               │
│                                                         │
│    ┌─────────────┐  ┌─────────────┐                    │
│    │     ⚽      │  │     🏒      │                    │
│    │  Football   │  │   Hockey    │                    │
│    │  125,432    │  │   45,231    │                    │
│    │   matchs    │  │   matchs    │                    │
│    └─────────────┘  └─────────────┘                    │
│                                                         │
│    ┌─────────────┐  ┌─────────────┐                    │
│    │     🎾      │  │     🏐      │                    │
│    │   Tennis    │  │  Volleyball │                    │
│    │   89,102    │  │   23,456    │                    │
│    │   matchs    │  │   matchs    │                    │
│    └─────────────┘  └─────────────┘                    │
│                                                         │
│    Dernière mise à jour : 04/12/2025 06:00            │
│    Requêtes API ce mois : 1,234 / 5,000               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Page Sport (Tableau)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🎯 OddsTracker  │  ⚽ Football                              [⚙️] [🏠 Accueil] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  FILTRES                                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │ Pays ▼       │ │ Ligue ▼      │ │ Équipe       │ │ Type pari ▼  │           │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘           │
│  ┌──────────────────────────┐ ┌────────────────────────────────────┐           │
│  │ 📅 01/01/2024 - 04/12/24 │ │ Cotes: [1.40] - [1.60] [Opening ▼] │           │
│  └──────────────────────────┘ └────────────────────────────────────┘           │
│                                                                                 │
│  [📊 Colonnes]  [📥 Export CSV]  [📥 Export XLSX]      Résultats: 1,234       │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Date       │ Pays    │ Ligue        │ Home        │ Away       │ Score │ Score │
│            │         │              │             │            │ Home  │ Away  │
├────────────┼─────────┼──────────────┼─────────────┼────────────┼───────┼───────┤
│ 04/12/2024 │ England │ Premier Lg   │ Liverpool   │ Man City   │   2   │   1   │
├────────────┼─────────┼──────────────┼─────────────┼────────────┼───────┼───────┤
│                                                                                 │
│ ... suite colonnes cotes ...                                                   │
│                                                                                 │
│ │ 1-Open │ 1-Close │ X-Open │ X-Close │ 2-Open │ 2-Close │ O2.5-O │ O2.5-C │  │
│ ├────────┼─────────┼────────┼─────────┼────────┼─────────┼────────┼────────┤  │
│ │ [2.10] │ [2.05]  │  3.40  │  3.35   │  3.20  │  3.30   │  1.85  │ [1.80] │  │
│ │  vert  │  vert   │        │         │        │         │        │  vert  │  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ◀ Précédent    Page 1 / 124    Suivant ▶          25 ▼ par page              │
└─────────────────────────────────────────────────────────────────────────────────┘

Légende couleurs :
- Cellule VERTE : Pari gagnant (cote + résultat)
- Cellule ROUGE : Pari perdant (cote + résultat)
```

### Page Réglages

```
┌─────────────────────────────────────────────────────────┐
│  🎯 OddsTracker  │  ⚙️ Réglages              [🏠 Accueil] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  SYNCHRONISATION                                        │
│  ───────────────                                        │
│  Dernière sync : 04/12/2025 06:00 ✅                   │
│                                                         │
│  [ 🔄 Lancer une synchronisation manuelle ]            │
│                                                         │
│  Mise à jour automatique principale                    │
│  ┌─────────────────────────────────────┐               │
│  │ ✅ Activée    Heure : [06:00]       │               │
│  └─────────────────────────────────────┘               │
│                                                         │
│  Mise à jour automatique supplémentaire                │
│  ┌─────────────────────────────────────┐               │
│  │ ☐ Désactivée  Heure : [18:00]       │               │
│  └─────────────────────────────────────┘               │
│                                                         │
│  UTILISATION API                                        │
│  ───────────────                                        │
│  Requêtes ce mois : 1,234 / 5,000                      │
│  ████████████░░░░░░░░ 24.7%                            │
│  Réinitialisation : 01/01/2025                         │
│                                                         │
│  SÉCURITÉ                                               │
│  ─────────                                              │
│  ┌─────────────────────────────────────┐               │
│  │ Ancien mot de passe : [••••••]      │               │
│  │ Nouveau mot de passe : [••••••]     │               │
│  │ Confirmer : [••••••]                │               │
│  └─────────────────────────────────────┘               │
│  [ Changer le mot de passe ]                           │
│                                                         │
│  LOGS DE SYNCHRONISATION                                │
│  ───────────────────────                                │
│  04/12/2025 06:00 - Football - ✅ 234 matchs           │
│  04/12/2025 06:01 - Hockey - ✅ 45 matchs              │
│  04/12/2025 06:02 - Tennis - ✅ 89 matchs              │
│  04/12/2025 06:02 - Volleyball - ✅ 23 matchs          │
│  03/12/2025 06:00 - Football - ❌ Erreur API           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Colonnes par Sport

### Colonnes communes (tous sports)

| Colonne | Type | Filtrable | Triable |
|---------|------|-----------|---------|
| Date | date | ✅ (range) | ✅ |
| Pays | string | ✅ (select) | ✅ |
| Ligue | string | ✅ (select) | ✅ |
| Home | string | ✅ (search) | ✅ |
| Away | string | ✅ (search) | ✅ |
| Score Home | number | ❌ | ✅ |
| Score Away | number | ❌ | ✅ |

### Colonnes cotes dynamiques

Les colonnes de cotes sont générées dynamiquement selon les marchés disponibles via l'API pour chaque match. Format : `{MarketName}-Open` et `{MarketName}-Close`.

**Marchés Football (Soccer) - ID OddsPapi** :
- 101 : 1X2 (Home/Draw/Away) → `1-Open`, `1-Close`, `X-Open`, `X-Close`, `2-Open`, `2-Close`
- Over/Under 0.5, 1.5, 2.5, 3.5, 4.5, 5.5 → `O0.5-Open`, `O0.5-Close`, `U0.5-Open`, etc.
- Handicap Asiatique → `AH-0.5-Open`, `AH+0.5-Open`, etc.
- Double Chance → `1X-Open`, `12-Open`, `X2-Open`, etc.
- Both Teams To Score → `BTTS-Y-Open`, `BTTS-N-Open`, etc.

**Marchés Hockey** :
- Moneyline (1X2 ou Home/Away selon ligue)
- Over/Under (totaux buts)
- Puck Line (handicap)

**Marchés Tennis** :
- Moneyline (vainqueur match)
- Set Handicap
- Total Games Over/Under
- Set Betting

**Marchés Volleyball** :
- Moneyline
- Set Handicap
- Total Points
- Set Betting

### Gestion visibilité colonnes

```typescript
interface ColumnVisibility {
  [columnId: string]: boolean;
}

// Stockage localStorage par sport
const STORAGE_KEY = 'oddstracker_columns_{sport}';

// Colonnes visibles par défaut
const DEFAULT_VISIBLE = [
  'date', 'country', 'league', 'home', 'away', 
  'scoreHome', 'scoreAway', '1-open', '1-close',
  'x-open', 'x-close', '2-open', '2-close'
];
```

---

## 🎨 Coloration des cellules (Gagnant/Perdant)

### Logique de détermination du gagnant

```typescript
interface WinnerResult {
  isWinner: boolean;
  isLoser: boolean;
  isVoid: boolean;
}

function determineWinner(
  fixture: Fixture,
  market: Market,
  outcome: Outcome
): WinnerResult {
  const { homeScore, awayScore } = fixture;
  
  // Match non terminé
  if (homeScore === null || awayScore === null) {
    return { isWinner: false, isLoser: false, isVoid: false };
  }
  
  // Logique par type de marché
  switch (market.type) {
    case '1X2':
      return determine1X2Winner(homeScore, awayScore, outcome);
    case 'OVER_UNDER':
      return determineOverUnderWinner(homeScore, awayScore, market.line, outcome);
    case 'HANDICAP':
      return determineHandicapWinner(homeScore, awayScore, market.line, outcome);
    // ... autres marchés
  }
}

function determine1X2Winner(
  homeScore: number,
  awayScore: number,
  outcome: '1' | 'X' | '2'
): WinnerResult {
  const result = homeScore > awayScore ? '1' 
               : homeScore < awayScore ? '2' 
               : 'X';
  
  return {
    isWinner: result === outcome,
    isLoser: result !== outcome,
    isVoid: false
  };
}
```

### Application du style

```tsx
// Composant cellule de cote
function OddsCell({ value, isWinner, isLoser }: OddsCellProps) {
  const bgClass = isWinner 
    ? 'bg-green-100 text-green-800' 
    : isLoser 
    ? 'bg-red-100 text-red-800' 
    : '';
    
  return (
    <td className={cn('px-3 py-2 text-right font-mono', bgClass)}>
      {value?.toFixed(2) ?? '-'}
    </td>
  );
}

// Composant cellule de score (même logique)
function ScoreCell({ value, isWinningTeam }: ScoreCellProps) {
  const bgClass = isWinningTeam 
    ? 'bg-green-100 text-green-800 font-bold' 
    : 'bg-red-100 text-red-800';
    
  return (
    <td className={cn('px-3 py-2 text-center', bgClass)}>
      {value ?? '-'}
    </td>
  );
}
```

---

## 🔍 Filtres

### Composant FilterBar

```tsx
interface Filters {
  dateRange: { from: Date; to: Date } | null;
  countryId: number | null;
  leagueId: number | null;
  teamSearch: string;
  marketType: string | null;
  oddsRange: {
    min: number | null;
    max: number | null;
    type: 'opening' | 'closing';
  };
}
```

### Filtre fourchette de cotes

```tsx
function OddsRangeFilter({ value, onChange }: OddsRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span>Cotes:</span>
      <Input
        type="number"
        step="0.01"
        placeholder="Min"
        value={value.min ?? ''}
        onChange={(e) => onChange({ ...value, min: parseFloat(e.target.value) })}
        className="w-20"
      />
      <span>-</span>
      <Input
        type="number"
        step="0.01"
        placeholder="Max"
        value={value.max ?? ''}
        onChange={(e) => onChange({ ...value, max: parseFloat(e.target.value) })}
        className="w-20"
      />
      <Select
        value={value.type}
        onValueChange={(type) => onChange({ ...value, type })}
      >
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opening">Opening</SelectItem>
          <SelectItem value="closing">Closing</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

---

## 📥 Export

### Export CSV

```typescript
// lib/export/csv-export.ts
export async function exportToCSV(
  data: FixtureWithOdds[],
  visibleColumns: string[],
  filename: string
): Promise<Blob> {
  const headers = visibleColumns.map(col => getColumnLabel(col));
  const rows = data.map(row => 
    visibleColumns.map(col => formatCellValue(row, col))
  );
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
}
```

### Export XLSX

```typescript
// lib/export/xlsx-export.ts
import * as XLSX from 'xlsx';

export async function exportToXLSX(
  data: FixtureWithOdds[],
  visibleColumns: string[],
  filename: string
): Promise<Blob> {
  const headers = visibleColumns.map(col => getColumnLabel(col));
  const rows = data.map(row => 
    visibleColumns.map(col => formatCellValue(row, col))
  );
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');
  
  const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return new Blob([xlsxBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
}
```

---

## 🔄 Synchronisation

### Service de synchronisation

```typescript
// lib/sync/sync-service.ts
export class SyncService {
  private api: OddsPapiClient;
  private db: SupabaseClient;
  
  async syncSport(sportId: number): Promise<SyncResult> {
    const log = await this.createSyncLog(sportId);
    
    try {
      // 1. Récupérer les tournois du sport
      const tournaments = await this.api.getTournaments(sportId, 'pinnacle');
      
      // 2. Pour chaque tournoi, récupérer les fixtures
      for (const tournament of tournaments) {
        await this.syncTournament(tournament);
        await this.delay(1000); // Rate limit
      }
      
      // 3. Marquer la sync comme réussie
      await this.completeSyncLog(log.id, 'success');
      
    } catch (error) {
      await this.completeSyncLog(log.id, 'error', error.message);
      throw error;
    }
  }
  
  async syncHistorical(sportId: number, fromDate: Date): Promise<void> {
    // Import initial historique depuis janvier 2019
    // À exécuter une seule fois lors du setup
  }
}
```

### Cron Job Vercel

```typescript
// app/api/sync/cron/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max

export async function GET(request: Request) {
  // Vérifier le token Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const syncService = new SyncService();
  const sports = [10, 4, 2, 34]; // Football, Hockey, Tennis, Volleyball
  
  for (const sportId of sports) {
    await syncService.syncSport(sportId);
  }
  
  return NextResponse.json({ success: true });
}
```

### Configuration vercel.json

```json
{
  "crons": [
    {
      "path": "/api/sync/cron",
      "schedule": "0 6 * * *"
    }
  ]
}
```

---

## 📋 Étapes de Développement

### Phase 1 : Setup (Jour 1 - 2h)

1. [ ] Créer le repo Git
2. [ ] Initialiser Next.js 14 avec TypeScript
3. [ ] Configurer Tailwind CSS
4. [ ] Installer et configurer shadcn/ui
5. [ ] Créer le projet Supabase
6. [ ] Exécuter les migrations SQL
7. [ ] Configurer les variables d'environnement
8. [ ] Déployer sur Vercel (sans fonctionnalités)

### Phase 2 : Authentification (Jour 1 - 1h)

1. [ ] Créer la page de login
2. [ ] Implémenter l'API de login
3. [ ] Configurer le middleware d'auth
4. [ ] Implémenter le changement de mot de passe
5. [ ] Tester la protection des routes

### Phase 3 : Intégration API OddsPapi (Jour 2 - 3h)

1. [ ] Créer le client API OddsPapi
2. [ ] Implémenter les types TypeScript
3. [ ] Tester les endpoints principaux
4. [ ] Gérer les rate limits
5. [ ] Implémenter la gestion des erreurs

### Phase 4 : Import Historique (Jour 2-3 - 4h)

1. [ ] Créer le script d'import historique
2. [ ] Importer les données Football depuis 01/2019
3. [ ] Importer les données Hockey depuis 01/2019
4. [ ] Importer les données Tennis depuis 01/2019
5. [ ] Importer les données Volleyball depuis 01/2019
6. [ ] Vérifier l'intégrité des données

#### Option d'import CSV/XLSX (outil de secours)

- Script : `npm run import:pinnacle <fichier>` (fichier `.csv` ou `.xlsx`)
- Fonctionnalités :
  - Parsing XLSX/CSV, normalisation des équipes/ligues via `lib/import/catalog.ts`
  - Génération d'IDs déterministes (`oddspapi_id`) + `upsert` Supabase (idempotent)
  - Insertion des marchés/outcomes (1X2, O/U 2.5) alignés avec les colonnes UI
  - `--dry-run` disponible pour valider un import sans toucher à la base
  - Journalisation dans `sync_logs` (records_fetched/inserted/status)
- Usage : principalement pour jeux de données ponctuels/démo. La sync principale reste l'API OddsPapi.

### Phase 5 : Interface Tableau (Jour 3-4 - 4h)

1. [ ] Créer le composant DataTable avec TanStack Table
2. [ ] Implémenter les colonnes Football
3. [ ] Implémenter les colonnes Hockey
4. [ ] Implémenter les colonnes Tennis
5. [ ] Implémenter les colonnes Volleyball
6. [ ] Ajouter la pagination
7. [ ] Implémenter le tri des colonnes
8. [ ] Ajouter la gestion de visibilité des colonnes

### Phase 6 : Filtres (Jour 4 - 2h)

1. [ ] Créer le filtre par pays
2. [ ] Créer le filtre par ligue
3. [ ] Créer le filtre par équipe (recherche)
4. [ ] Créer le filtre par date (range picker)
5. [ ] Créer le filtre par type de pari
6. [ ] Créer le filtre par fourchette de cotes (avec toggle Opening/Closing)
7. [ ] Connecter les filtres à la requête API

### Phase 7 : Coloration Gagnant/Perdant (Jour 4 - 1h)

1. [ ] Implémenter la logique de détection gagnant/perdant
2. [ ] Appliquer les styles vert/rouge aux cellules de cotes
3. [ ] Appliquer les styles vert/rouge aux cellules de résultat
4. [ ] Tester avec différents types de paris

### Phase 8 : Export (Jour 4 - 1h)

1. [ ] Implémenter l'export CSV
2. [ ] Implémenter l'export XLSX
3. [ ] S'assurer que l'export respecte les filtres actifs
4. [ ] S'assurer que l'export respecte les colonnes visibles

### Phase 9 : Page Réglages (Jour 5 - 2h)

1. [ ] Créer la page réglages
2. [ ] Implémenter la sync manuelle
3. [ ] Implémenter la configuration des syncs automatiques
4. [ ] Afficher le compteur de requêtes API
5. [ ] Afficher les logs de synchronisation
6. [ ] Implémenter le changement de mot de passe

### Phase 10 : Cron & Finalisation (Jour 5 - 2h)

1. [ ] Configurer le cron Vercel
2. [ ] Tester la sync automatique
3. [ ] Tests end-to-end
4. [ ] Responsive mobile
5. [ ] Nettoyage du code
6. [ ] Documentation README

---

## 🔒 Variables d'Environnement

### Fichier `.env.example`

```env
# Application
APP_PASSWORD=votre_mot_de_passe_securise
APP_SESSION_SECRET=votre_secret_session_32_caracteres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx

# OddsPapi API
ODDSPAPI_API_KEY=votre_cle_api_oddspapi
ODDSPAPI_BASE_URL=https://api.oddspapi.io

# Vercel Cron
CRON_SECRET=votre_secret_cron_verification

# Optionnel - Environnement
NODE_ENV=development
```

---

## 📖 README.md

```markdown
# OddsTracker

Application web d'analyse de cotes sportives historiques.

## Prérequis

- Node.js 18+
- Compte Supabase
- Clé API OddsPapi
- Compte Vercel

## Installation

1. Cloner le repo
2. Copier `.env.example` vers `.env.local` et remplir les valeurs
3. Installer les dépendances : `npm install`
4. Exécuter les migrations Supabase
5. Lancer en dev : `npm run dev`

## Déploiement

1. Connecter le repo à Vercel
2. Configurer les variables d'environnement dans Vercel
3. Déployer

## Utilisation

- Se connecter avec le mot de passe défini
- Sélectionner un sport depuis le menu d'accueil
- Utiliser les filtres pour affiner la recherche
- Exporter les données filtrées en CSV ou XLSX

## Support

Contact : [email du développeur]
```

---

## ✅ Critères de Validation

### Fonctionnels

- [ ] Authentification par mot de passe unique fonctionne
- [ ] 4 tableaux de données distincts (Football, Hockey, Tennis, Volleyball)
- [ ] Données historiques depuis janvier 2019
- [ ] Cotes Opening ET Closing affichées
- [ ] Bookmaker Pinnacle uniquement
- [ ] Filtres fonctionnels (pays, ligue, équipe, date, type pari, fourchette cotes)
- [ ] Toggle Opening/Closing sur le filtre de cotes
- [ ] Visibilité des colonnes personnalisable
- [ ] Export CSV et XLSX (vue filtrée)
- [ ] Coloration vert/rouge sur cellules gagnant/perdant
- [ ] Sync automatique quotidienne
- [ ] Sync manuelle depuis les réglages
- [ ] Changement de mot de passe
- [ ] Compteur de requêtes API visible

### Techniques

- [ ] Responsive (desktop-first, mobile-friendly)
- [ ] Temps de chargement < 3s sur tableau de 1000 lignes
- [ ] Pas de traces IA dans le code
- [ ] Code propre et commenté
- [ ] Variables d'environnement documentées
- [ ] README basique présent

### Livraison

- [ ] Code source sur repo Git
- [ ] Application déployée sur Vercel
- [ ] Données historiques importées
- [ ] Sync automatique configurée et fonctionnelle

---

## 🚨 Points d'Attention

1. **Rate Limits API** : Respecter les cooldowns (5s pour historical-odds, 1s pour odds-by-tournaments)
2. **Import Historique** : Peut prendre plusieurs heures, prévoir un script robuste avec reprise sur erreur
3. **Colonnes dynamiques** : Les marchés varient selon les matchs, gérer l'absence de données proprement
4. **Performance** : Utiliser la pagination côté serveur pour les grands volumes
5. **Cotes manquantes** : Si Opening ou Closing manquant, afficher "-" et ne pas colorer

---

*Document généré le 04/12/2025 - Version 1.0*
