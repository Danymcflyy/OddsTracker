# Changelog - OddsTracker

Tous les changements notables du projet sont documentés ici.

## [Non publié] - 2025-12-04

### 🔒 Sécurité

#### Remplacement de xlsx par exceljs
- **Problème** : Le package `xlsx@0.18.5` contient 2 vulnérabilités de haute gravité
  - Prototype Pollution (GHSA-4r6h-8v6p-xvw6)
  - Regular Expression Denial of Service - ReDoS (GHSA-5pgg-2g8v-p4x9)
- **Solution** : Remplacement par `exceljs@4.4.0`
  - ✅ Aucune vulnérabilité connue
  - ✅ Mieux maintenu
  - ✅ Support TypeScript natif
  - ✅ Plus de fonctionnalités (styles, formats, etc.)
- **Fichiers modifiés** :
  - `package.json` - Dépendance mise à jour
  - `lib/export/xlsx-export.ts` - Code réécrit avec ExcelJS

### ✨ Ajouté

#### Infrastructure
- ✅ Projet Next.js 14 initialisé avec App Router
- ✅ TypeScript 5+ configuré en mode strict
- ✅ Tailwind CSS avec configuration personnalisée
- ✅ ESLint configuré

#### Composants UI (shadcn/ui)
- ✅ 16 composants UI installés et configurés
  - Button (6 variantes, 4 tailles)
  - Input, Label, Select, Calendar
  - Badge (avec variantes winner/loser personnalisées)
  - Card, Table, Separator, Skeleton
  - Dialog, Popover, DropdownMenu
  - Toast + Toaster
- ✅ Thème personnalisé avec couleurs du projet (vert/rouge pour paris)
- ✅ Export centralisé via `components/ui/index.ts`

#### Structure du Projet
- ✅ Routes complètes (auth, dashboard, API)
- ✅ Pages pour 4 sports (Football, Hockey, Tennis, Volleyball)
- ✅ Pages de réglages et d'accueil
- ✅ API routes (auth, fixtures, sync, export, settings)

#### Bibliothèques et Services
- ✅ Client Supabase configuré
- ✅ Client OddsPapi avec types
- ✅ Service d'authentification (JWT avec jose)
- ✅ Services de synchronisation (historique et quotidienne)
- ✅ Services d'export (CSV et XLSX avec ExcelJS)
- ✅ Utilitaires (dates, cotes, détection gagnant/perdant)

#### Hooks Personnalisés
- ✅ `use-fixtures.ts` - Récupération des matchs
- ✅ `use-filters.ts` - Gestion des filtres
- ✅ `use-column-visibility.ts` - Visibilité des colonnes
- ✅ `use-toast.ts` - Notifications

#### Types TypeScript
- ✅ Types pour fixtures, odds, filtres, API
- ✅ Types pour les réponses OddsPapi
- ✅ Interfaces complètes pour toutes les entités

#### Base de Données
- ✅ Schéma SQL complet (9 tables)
- ✅ Index optimisés pour les performances
- ✅ Migration initiale documentée

#### Documentation
- ✅ `README.md` - Guide général
- ✅ `NEXT_STEPS.md` - Plan de développement (10 phases)
- ✅ `INSTALLATION_COMPLETE.md` - Vue d'ensemble complète
- ✅ `SHADCN_SETUP.md` - Documentation shadcn/ui
- ✅ `SECURITY_FIXES.md` - Correctifs de sécurité
- ✅ `npm-commands.md` - Commandes npm utiles
- ✅ `components/ui/README.md` - Guide des composants UI
- ✅ `PROJECT_SPEC.md` - Spécifications complètes
- ✅ `.env.example` - Template variables d'environnement

#### Configuration
- ✅ `vercel.json` - Configuration cron job
- ✅ `middleware.ts` - Authentification
- ✅ `components.json` - Configuration shadcn/ui
- ✅ `tailwind.config.ts` - Configuration Tailwind complète
- ✅ `tsconfig.json` - TypeScript strict mode

### 📦 Dépendances

#### Production
- next@14.2.0
- react@18.3.0
- react-dom@18.3.0
- @supabase/supabase-js@2.39.0
- @tanstack/react-table@8.11.0
- bcryptjs@2.4.3
- jose@5.2.0
- date-fns@3.0.0
- **exceljs@4.4.0** (remplace xlsx)
- lucide-react@0.309.0
- class-variance-authority@0.7.0
- clsx@2.1.0
- tailwind-merge@2.2.0
- 8 packages @radix-ui/*
- react-day-picker@8.10.0

#### Développement
- typescript@5
- tailwindcss@3.4.0
- tailwindcss-animate@1.0.7
- autoprefixer@10
- postcss@8
- @types/* (node, react, react-dom, bcryptjs)

### 📊 Statistiques

- **68 fichiers TypeScript** créés (.ts/.tsx)
- **16 composants UI** configurés
- **10+ fichiers de documentation**
- **9 tables de base de données**
- **0 vulnérabilités** de sécurité

## Prochaines Étapes

Voir [NEXT_STEPS.md](NEXT_STEPS.md) pour le plan détaillé de développement.

### Phase 2 - Authentification (Jour 1 - 1h)
- [ ] Implémenter la logique de login complète
- [ ] Protéger les routes avec le middleware
- [ ] Implémenter le changement de mot de passe

### Phase 3 - Intégration API OddsPapi (Jour 2 - 3h)
- [ ] Compléter le client API
- [ ] Tester les endpoints
- [ ] Implémenter la gestion des rate limits

### Phase 4 - Import Historique (Jour 2-3 - 4h)
- [ ] Script d'import historique depuis 01/2019
- [ ] Import pour les 4 sports
- [ ] Vérification de l'intégrité des données

### Phases 5-10
- [ ] Interface tableaux avec TanStack Table
- [ ] Filtres fonctionnels
- [ ] Coloration gagnant/perdant
- [ ] Export CSV/XLSX fonctionnel
- [ ] Page réglages complète
- [ ] Cron job et déploiement

---

**Format du changelog** : [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)
**Versioning** : [Semantic Versioning](https://semver.org/)
