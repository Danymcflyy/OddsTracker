# OddsTracker

Application de suivi et d'analyse de cotes sportives en temps réel.

## Description

OddsTracker permet de suivre l'évolution des cotes (opening vs current) pour différents sports et championnats, avec un focus sur le football professionnel européen.

## Stack technique

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui + TanStack Table
- **Base de données**: Supabase (PostgreSQL Cloud)
- **Source de données**: Odds-API.io (Pinnacle)
- **Automatisation**: GitHub Actions (cron toutes les 10 minutes)

## Installation

### Prérequis

- Node.js 20+
- Compte Supabase (gratuit)
- Clé API Odds-API.io

### Configuration

1. Cloner le projet:
```bash
git clone https://github.com/Danymcflyy/OddsTracker.git
cd OddsTracker
```

2. Installer les dépendances:
```bash
npm install
```

3. Configurer les variables d'environnement:

Créer un fichier `.env.local` à la racine:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Odds API
ODDS_API_IO_KEY=votre_cle_api
```

4. Lancer l'application:
```bash
npm run dev
```

Accéder à: http://localhost:3000

## Architecture

```
┌──────────────────────────┐
│  GitHub Actions (Cloud)  │  Sync automatique
│  Toutes les 10 minutes   │  toutes les 10 min
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Supabase (PostgreSQL)   │  Base de données
│  Source de vérité unique │  centralisée
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Next.js (Localhost)     │  Interface utilisateur
│  http://localhost:3000   │  et visualisation
└──────────────────────────┘
```

## Fonctionnalités principales

- Suivi des matchs à venir avec cotes opening et current
- Filtres par pays, ligue, équipe, plage de cotes
- Visibilité des colonnes personnalisable
- Export CSV/XLSX respectant les filtres actifs
- Gestion dynamique des ligues trackées
- Synchronisation automatique via GitHub Actions

## Scripts disponibles

```bash
# Développement local
npm run dev

# Build de production
npm run build

# Test de la synchronisation
npx tsx scripts/test-batched-odds.ts
```

## Configuration GitHub Actions

Les secrets suivants doivent être configurés dans GitHub (Settings → Secrets → Actions):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ODDS_API_IO_KEY`

Voir `.github/DIRECT_SYNC_SETUP.md` pour plus de détails.

## Structure du projet

```
app/                    # Pages et routes API Next.js
  (dashboard)/          # Pages protégées (football, hockey, etc.)
  api/v3/              # API endpoints V3
components/            # Composants React réutilisables
  tables/              # Tableaux et filtres
  settings/            # Composants de configuration
lib/                   # Logique métier
  api/v3/              # Services de synchronisation
  db/                  # Queries et migrations Supabase
  config/              # Configuration ligues et marchés
hooks/                 # Hooks React personnalisés
types/                 # Types TypeScript
scripts/               # Scripts de synchronisation
  github-actions-sync.ts  # Script principal (GitHub Actions)
```

## Migrations de la base de données

Les migrations Supabase V3 se trouvent dans `lib/db/migrations/v3/`.

Pour appliquer les migrations:
1. Connectez-vous à votre projet Supabase
2. Allez dans SQL Editor
3. Exécutez les fichiers dans l'ordre (001, 002, 003, etc.)

## Documentation

- `LOCALHOST_SETUP.md` - Guide complet de configuration locale
- `CHANGELOG.md` - Historique des modifications
- `.github/DIRECT_SYNC_SETUP.md` - Configuration GitHub Actions

## Support

Pour toute question ou problème, ouvrir une issue sur GitHub.

## Licence

Projet privé - Tous droits réservés
