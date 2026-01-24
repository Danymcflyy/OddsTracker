# 📚 OddsTracker v4 - Documentation

**Application de suivi et d'analyse de cotes sportives en temps réel**

Version 4.0.0 - The Odds API v4 + Architecture Modernisée

---

## 📘 Documentation Disponible

### 🎯 Guides Principaux

| Document | Description | À lire pour... |
|----------|-------------|----------------|
| **[SYNTHESE-CORRECTIONS.md](./SYNTHESE-CORRECTIONS.md)** | 🔧 Corrections 20 Jan 2026 | Comprendre les dernières modifications |
| **[MARCHES-DISPONIBLES.md](./MARCHES-DISPONIBLES.md)** | 📊 Liste complète des marchés | Choisir les marchés à suivre |
| **[GETTING_STARTED_V4.md](./GETTING_STARTED_V4.md)** | 🚀 Démarrage rapide v4 | Premiers pas avec v4 |
| **[CHANGELOG.md](./CHANGELOG.md)** | 📝 Historique des modifications | Suivre l'évolution |

### 📦 Guides Anciens (Référence)

| Document | Description | Note |
|----------|-------------|------|
| **[INSTALLATION_CLIENT.md](../INSTALLATION_CLIENT.md)** | Installation client v3 | ⚠️ Version obsolète |
| **[LIVRAISON.md](./LIVRAISON.md)** | Document de livraison v2 | ⚠️ Référence historique |
| **[LOCALHOST_SETUP.md](./LOCALHOST_SETUP.md)** | Setup localhost v2 | ⚠️ Référence historique |

---

## 📖 Description

OddsTracker v4 est une application professionnelle de tracking de cotes sportives utilisant **The Odds API v4**. Elle capture les cotes d'ouverture et de clôture sur 70+ championnats de football avec **toutes les variations de points** pour les marchés spreads/totals.

### ✨ Nouveautés v4 (Janvier 2026)

- ✅ **The Odds API v4** avec alternate markets (18 variations par marché)
- ✅ **33 marchés disponibles** (vs 6 en v3)
- ✅ **Interface de sélection des marchés** organisée par groupes
- ✅ **Extraction complète** des cotes home/away/draw/over/under
- ✅ **70 championnats** disponibles (EPL, La Liga, Ligue 1, Bundesliga, etc.)
- ✅ **Capture automatique** des scores et cotes de clôture
- ✅ **Cellules colorées** Win/Loss/Push sur resultats

### 🎯 Fonctionnalités Clés

- ✅ Cotes d'ouverture + clôture automatiques
- ✅ Toutes les variations de points (spreads: -2.25 à +2.25, totals: 1.5 à 4.5)
- ✅ Filtres avancés (équipe, marché, résultat, date)
- ✅ Sélection personnalisée des marchés suivis
- ✅ Export CSV avec filtres appliqués
- ✅ GitHub Actions 24/7 (fonctionne PC éteint)

---

## 🚀 Stack Technique

- **Frontend**: Next.js 14 (App Router) + TypeScript + React 18
- **UI**: Tailwind CSS + shadcn/ui + TanStack Table v8
- **Base de données**: Supabase (PostgreSQL Cloud)
- **Source de données**: **The Odds API v4** (Pinnacle)
- **Automatisation**: GitHub Actions (4 workflows)
- **Authentication**: JWT + Session cookies

---

## ⚡ Installation Rapide

### 1. Pré-requis

- Node.js 18+ installé
- Compte Supabase (gratuit)
- Clé The Odds API v4 (gratuit: 500 crédits/mois)

### 2. Installation

**macOS (recommandé):**
```bash
# Double-cliquez sur:
./OddsTracker.command
```

**Windows:**
```bash
# Double-cliquez sur:
OddsTracker.bat
```

**Ligne de commande:**
```bash
# 1. Cloner
git clone https://github.com/Danymcflyy/OddsTracker.git
cd OddsTracker

# 2. Installer
npm install

# 3. Configurer .env.local
cp .env.example .env.local
# Éditer .env.local avec vos clés

# 4. Lancer
npm run dev
```

### 3. Configuration

1. Accéder à http://localhost:3000/login
2. Se connecter avec `APP_PASSWORD` (défini dans .env.local)
3. Aller dans **Settings > Data Collection**
4. Sélectionner les **Sports** (ligues)
5. Sélectionner les **Markets** (marchés)
6. **Sauvegarder**

📘 **Guide détaillé:** [GETTING_STARTED_V4.md](./GETTING_STARTED_V4.md)

---

## 🏗️ Architecture v4

```
┌──────────────────────────────────────────────────────────────┐
│           GitHub Actions (Automatisation 24/7)               │
│  ✅ Découverte événements: Toutes les 6h                    │
│  ✅ Cotes d'ouverture: Toutes les 10min                     │
│  ✅ Mise à jour cotes: Toutes les 5min                      │
│  ✅ Scores + Clôture: 2x/jour (2h, 14h UTC)                │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      │ The Odds API v4
                      │ (alternate markets)
                      ▼
┌──────────────────────────────────────────────────────────────┐
│              Supabase (PostgreSQL Cloud)                     │
│  ✅ events (matchs)                                          │
│  ✅ market_states (cotes + variations)                       │
│  ✅ sports (70 championnats)                                 │
│  ✅ app_settings (configuration)                             │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│         Next.js 14 Application (Interface)                   │
│  ✅ Table interactive (filtres, export)                      │
│  ✅ Settings (sélection sports/marchés)                      │
│  ✅ Monitoring (status GitHub Actions)                       │
│  🌐 http://localhost:3000                                    │
└──────────────────────────────────────────────────────────────┘
```

### 🔄 Workflows GitHub Actions v4

| Workflow | Fréquence | Fonction | Coût API |
|----------|-----------|----------|----------|
| **discover-events** | 6h | Découvre nouveaux matchs | Faible |
| **opening-odds** | 10min | Capture cotes d'ouverture | ~6 crédits/événement |
| **sync-odds-v2** | 5min | Met à jour cotes en continu | Gratuit (oddsapi.io) |
| **closing-odds** | 2x/jour | Capture clôture + scores | ~6 crédits/événement |

---

## ✨ Fonctionnalités

### Synchronisation automatique
- ✅ V2 Parallel: Sync par ligue en parallèle
- ✅ Fréquence: Toutes les 5 minutes
- ✅ Fonctionne même si votre PC est éteint
- ✅ Logs détaillés par ligue sur GitHub Actions

### Interface utilisateur
- ✅ Tableau des matchs avec cotes opening/current
- ✅ Filtres: Pays, Ligues, Équipes, Plages de cotes
- ✅ Visibilité des colonnes personnalisable
- ✅ Export CSV/XLSX respectant les filtres actifs
- ✅ Design responsive (desktop/mobile)

### Gestion des ligues
- ✅ Page dédiée: `/settings/leagues`
- ✅ Recherche par nom ou pays
- ✅ Activation/désactivation en un clic
- ✅ Synchronisation automatique après changement

---

## 📜 Scripts disponibles

```bash
# Développement local
npm run dev

# Build de production
npm run build

# Test de synchronisation manuelle
npx tsx scripts/github-actions-sync-v2-parallel.ts

# Test batch odds
npx tsx scripts/test-batched-odds.ts
```

---

## ⚙️ Configuration GitHub Actions

**4 secrets requis** (Settings → Secrets → Actions):

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role Supabase |
| `ODDS_API_IO_KEY` | Clé API Odds-API.io |

📘 **Guide détaillé:** [INSTALLATION_CLIENT.md](INSTALLATION_CLIENT.md#configuration-github-actions)

**Workflows actifs:**
- **V2 Parallel** (5 min) - Synchronisation parallèle par ligue ✅
- V1 Direct (10 min) - Désactivé (backup disponible)

---

## 📂 Structure du projet

```
OddsTracker/
├── app/                         # Pages et routes Next.js
│   ├── (dashboard)/             # Pages protégées
│   └── api/v3/                  # API endpoints V3
├── components/                  # Composants React
│   ├── tables/                  # Tableaux et filtres
│   └── settings/                # Composants de configuration
├── lib/                         # Logique métier
│   ├── api/v3/                  # Services de synchronisation
│   │   ├── match-discovery-per-league.ts    # V2 Discovery
│   │   ├── odds-capture-per-league.ts       # V2 Capture
│   │   ├── match-discovery.ts               # V1 Discovery
│   │   └── odds-capture.ts                  # V1 Capture
│   ├── db/                      # Queries et migrations
│   │   └── migrations/v3/       # Migrations SQL
│   └── config/                  # Configuration
├── scripts/                     # Scripts de synchronisation
│   ├── github-actions-sync-v2-parallel.ts   # V2 Script principal
│   ├── github-actions-sync.ts               # V1 Script (backup)
│   └── test-batched-odds.ts                 # Tests
├── .github/workflows/           # GitHub Actions
│   ├── sync-odds-direct-v2-parallel.yml     # V2 Workflow (actif)
│   └── sync-odds-direct.yml                 # V1 Workflow (désactivé)
├── OddsTracker.command          # Lanceur macOS
├── OddsTracker.bat              # Lanceur Windows
├── INSTALLATION_CLIENT.md       # 📘 Guide d'installation
├── LIVRAISON.md                 # 📦 Document de livraison
└── package.json                 # Dépendances
```

---

## 🗄️ Migrations de base de données

Les migrations Supabase V3 se trouvent dans `lib/db/migrations/v3/`.

**Pour appliquer:**
1. Connectez-vous à Supabase → SQL Editor
2. Exécutez les fichiers dans l'ordre:
   - `001_initial_schema_v3.sql`
   - `002_...` (si présent)
   - etc.

📘 **Guide détaillé:** [INSTALLATION_CLIENT.md](INSTALLATION_CLIENT.md#1-obtenir-les-clés-supabase)

---

## 💰 Coûts

**Total: 0€/mois** 🎉

| Service | Plan | Coût | Usage |
|---------|------|------|-------|
| Supabase | Gratuit | 0€ | 500 MB stockage |
| Odds-API.io | Gratuit | 0€ | 5,000 req/h (~720/h utilisées) |
| GitHub Actions | Gratuit | 0€ | Illimité (repo public) |
| Hébergement | Localhost | 0€ | Aucun serveur |

**Marge de sécurité:** 85%+ de quota API disponible

---

## 🐛 Dépannage

**Problèmes courants:**

| Problème | Solution |
|----------|----------|
| Port 3000 déjà utilisé | `lsof -ti:3000 \| xargs kill -9` |
| Module non trouvé | `rm -rf node_modules && npm install` |
| Variables non définies | Vérifier `.env.local` |
| GitHub Actions échoue | Vérifier les secrets GitHub |
| Données ne se mettent pas à jour | Vérifier GitHub Actions + rafraîchir page |

📘 **Guide complet:** [INSTALLATION_CLIENT.md](INSTALLATION_CLIENT.md#dépannage)

---

## 📞 Support

**Documentation:**
- [INSTALLATION_CLIENT.md](INSTALLATION_CLIENT.md) - Installation complète
- [LIVRAISON.md](LIVRAISON.md) - Document de livraison
- [.github/MAINTENANCE.md](.github/MAINTENANCE.md) - Maintenance

**GitHub:**
- Issues: https://github.com/Danymcflyy/OddsTracker/issues
- Actions: https://github.com/Danymcflyy/OddsTracker/actions

**Services:**
- Supabase: https://app.supabase.com
- Odds-API: https://odds-api.io/dashboard

---

## 📜 Licence

Projet privé - Tous droits réservés

---

**OddsTracker v2.0** - Synchronisation parallèle par ligue 🚀
