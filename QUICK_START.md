# 🚀 Quick Start - OddsTracker

Guide de démarrage rapide pour OddsTracker.

## ⚡ Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# 3. Lancer le projet
npm run dev
```

Ouvrir http://localhost:3000

## 🔒 Correctif de Sécurité Appliqué

✅ **xlsx** remplacé par **exceljs** pour corriger 2 vulnérabilités de haute gravité.

### Vérification
```bash
npm audit
# Résultat attendu: found 0 vulnerabilities
```

Si vous voyez encore des vulnérabilités, consultez [SECURITY_FIXES.md](SECURITY_FIXES.md).

## 📋 Checklist Avant de Commencer

### 1. Configuration Supabase
- [ ] Créer un compte sur https://supabase.com
- [ ] Créer un nouveau projet
- [ ] Exécuter le SQL depuis `lib/db/migrations/001_initial_schema.sql`
- [ ] Récupérer les clés d'API (URL, anon key, service role key)

### 2. Configuration Odds-API.io
- [ ] Obtenir une clé API Odds-API.io
- [ ] Vérifier les quotas disponibles

### 3. Variables d'Environnement (.env.local)
```env
# Application
APP_PASSWORD=votre_mot_de_passe_securise
APP_SESSION_SECRET=secret_32_caracteres_aleatoires

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx

# Odds-API.io API
ODDSPAPI_API_KEY=votre_cle_api
ODDSPAPI_BASE_URL=https://api.oddspapi.io

# Vercel Cron
CRON_SECRET=secret_pour_cron
```

### 4. Installation
```bash
npm install
```

### 5. Vérification
```bash
# Vérifier la sécurité
npm audit

# Vérifier TypeScript
npx tsc --noEmit

# Lancer le dev server
npm run dev
```

## 📂 Structure du Projet

```
oddstracker/
├── app/                    # Routes Next.js
│   ├── (auth)/            # Login
│   ├── (dashboard)/       # Dashboard + sports
│   └── api/               # API routes
├── components/            # Composants React
│   ├── ui/               # shadcn/ui (16 composants)
│   ├── auth/             # Authentification
│   ├── layout/           # Layout
│   └── tables/           # Tableaux
├── lib/                   # Logique métier
│   ├── db/               # Supabase
│   ├── api/              # Odds-API.io
│   ├── auth/             # JWT
│   ├── sync/             # Synchronisation
│   ├── export/           # CSV/XLSX
│   └── utils/            # Utilitaires
├── hooks/                 # Hooks personnalisés
├── types/                 # Types TypeScript
└── Documentation/         # Guides et docs
```

## 🎨 Composants UI Disponibles

```tsx
import {
  Button, Input, Label, Select, Calendar,
  Badge, Card, Table, Separator, Skeleton,
  Dialog, Popover, DropdownMenu, Toast
} from "@/components/ui";
```

Voir [components/ui/README.md](components/ui/README.md) pour les exemples.

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev          # Lancer le dev server
npm run build        # Build production
npm start            # Démarrer en production
npm run lint         # Linter

# Sécurité
npm audit            # Vérifier les vulnérabilités
npm outdated         # Packages obsolètes

# Nettoyage
rm -rf node_modules package-lock.json && npm install
```

Voir [npm-commands.md](npm-commands.md) pour plus de commandes.

## 📚 Documentation Complète

| Fichier | Description |
|---------|-------------|
| [README.md](README.md) | Guide général du projet |
| [INSTALLATION_COMPLETE.md](INSTALLATION_COMPLETE.md) | **Vue d'ensemble complète** ⭐ |
| [NEXT_STEPS.md](NEXT_STEPS.md) | Plan de développement (10 phases) |
| [SHADCN_SETUP.md](SHADCN_SETUP.md) | Configuration shadcn/ui |
| [SECURITY_FIXES.md](SECURITY_FIXES.md) | Correctifs de sécurité |
| [CHANGELOG.md](CHANGELOG.md) | Historique des changements |
| [PROJECT_SPEC.md](PROJECT_SPEC.md) | Spécifications techniques |
| [npm-commands.md](npm-commands.md) | Commandes npm |

## 🎯 Prochaines Étapes de Développement

1. **Phase 2 - Authentification** (1h)
   - Implémenter la logique de login
   - Protéger les routes

2. **Phase 3 - API Odds-API.io** (3h)
   - Intégration complète
   - Gestion des rate limits

3. **Phase 4 - Import Historique** (4h)
   - Import depuis janvier 2019
   - 4 sports

4. **Phases 5-10** - Interface, filtres, export, etc.

Voir [NEXT_STEPS.md](NEXT_STEPS.md) pour le plan complet.

## ⚠️ Problèmes Courants

### npm install échoue
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Erreurs TypeScript
Vérifier que strict mode est activé dans `tsconfig.json`

### Port 3000 déjà utilisé
```bash
# Utiliser un autre port
PORT=3001 npm run dev
```

## 🔐 Sécurité

- ✅ 0 vulnérabilités après correction xlsx → exceljs
- ✅ TypeScript strict mode activé
- ✅ Variables d'environnement sécurisées
- ✅ Middleware d'authentification configuré

## 💡 Conseils

1. Toujours lancer `npm audit` avant de déployer
2. Garder les dépendances à jour avec `npm outdated`
3. Utiliser `npm ci` en CI/CD
4. Commit le `package-lock.json`

## 🆘 Aide

- **Documentation** : Voir les fichiers .md dans le repo
- **Issues** : Créer une issue sur GitHub
- **Spécifications** : Voir [PROJECT_SPEC.md](PROJECT_SPEC.md)

---

**Prêt à coder !** 🚀

Commencez par `npm install` puis `npm run dev`
