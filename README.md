# OddsTracker

**Application de suivi et d'analyse de cotes sportives en temps réel**

Version 2.0 - Architecture Localhost + GitHub Actions

---

## 📘 Documentation

**🚀 Nouveau client?** Commencez ici: **[INSTALLATION_CLIENT.md](INSTALLATION_CLIENT.md)**

| Document | Description |
|----------|-------------|
| **[INSTALLATION_CLIENT.md](INSTALLATION_CLIENT.md)** | 📘 Guide d'installation complet (PRIORITAIRE) |
| **[LIVRAISON.md](LIVRAISON.md)** | 📦 Document de livraison et résumé projet |
| **[CHANGELOG.md](CHANGELOG.md)** | 📝 Historique des modifications |
| **[.github/MAINTENANCE.md](.github/MAINTENANCE.md)** | 🔧 Guide de maintenance |

---

## 📖 Description

OddsTracker permet de suivre l'évolution des cotes (opening vs current) pour différents sports et championnats, avec un focus sur le football professionnel européen.

### Fonctionnalités principales

- ✅ Synchronisation automatique des cotes toutes les 5 minutes
- ✅ Support de multiples ligues en parallèle (scalable)
- ✅ Filtres avancés (pays, ligues, équipes, plages de cotes)
- ✅ Export des données (CSV/XLSX)
- ✅ Gestion dynamique des ligues suivies
- ✅ Système 100% automatisé (fonctionne même PC éteint)

---

## 🚀 Stack technique

- **Frontend**: Next.js 14 (App Router) + TypeScript + React 18
- **UI**: Tailwind CSS + shadcn/ui + TanStack Table
- **Base de données**: Supabase (PostgreSQL Cloud)
- **Source de données**: Odds-API.io (Pinnacle)
- **Automatisation**: GitHub Actions (V2 Parallel)

---

## ⚡ Installation rapide

### Méthode 1: Lanceurs desktop (Recommandé)

**macOS:**
```bash
# Double-cliquez sur:
OddsTracker.command
```

**Windows:**
```bash
# Double-cliquez sur:
OddsTracker.bat
```

### Méthode 2: Ligne de commande

```bash
# 1. Cloner
git clone https://github.com/Danymcflyy/OddsTracker.git
cd OddsTracker

# 2. Installer
npm install

# 3. Configurer .env.local (voir INSTALLATION_CLIENT.md)

# 4. Lancer
npm run dev
```

Accéder à: **http://localhost:3000**

📘 **Guide complet:** [INSTALLATION_CLIENT.md](INSTALLATION_CLIENT.md)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  GitHub Actions (Cloud Automatique)    │
│  ✅ Toutes les 5 minutes               │
│  ✅ V2 Parallel: Une ligue = Un job    │
│  ✅ Timeout: 1 heure                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Supabase (PostgreSQL Cloud)       │
│  ✅ Base de données centralisée         │
│  ✅ Accessible 24/7                     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Next.js Application (Localhost)      │
│  ✅ Interface utilisateur               │
│  ✅ http://localhost:3000               │
└─────────────────────────────────────────┘
```

**Synchronisation V2 Parallel:**
- ⚡ 10x plus rapide que V1 (parallélisation par ligue)
- 🛡️ Résilient (une ligue qui échoue n'affecte pas les autres)
- 📊 Logs détaillés par ligue
- ✅ Coût: 0€ (GitHub Actions gratuit sur repo public)

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
