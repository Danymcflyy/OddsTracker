# 🚀 Commencez Ici - OddsTracker

Bienvenue sur OddsTracker ! Suivez ce guide pour démarrer rapidement.

## ⚡ Configuration Rapide (5 minutes)

### 1. Générer le fichier .env.local

```bash
npm run setup:env
```

Ce script va :
- ✅ Créer le fichier `.env.local`
- ✅ Générer automatiquement `APP_SESSION_SECRET` et `CRON_SECRET`
- ✅ Ajouter des valeurs par défaut

### 2. Configurer Supabase

#### A. Créer un projet Supabase
1. Aller sur https://supabase.com
2. Créer un compte (gratuit)
3. Cliquer sur "New Project"
4. Remplir les informations :
   - Name : oddstracker
   - Database Password : Générer et sauvegarder
   - Region : Europe (ou votre région)
5. Attendre ~2 minutes que le projet soit créé

#### B. Récupérer les clés API
1. Aller dans **Settings** → **API**
2. Copier les 3 valeurs suivantes :

```
URL du projet
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

Clé anon public
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

Clé service_role (confidentielle)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

3. Coller ces valeurs dans `.env.local`

#### C. Exécuter la migration SQL
1. Dans Supabase, aller dans **SQL Editor**
2. Cliquer sur "New query"
3. Ouvrir le fichier `lib/db/migrations/001_initial_schema.sql`
4. Copier tout le contenu et le coller dans l'éditeur
5. Cliquer sur "Run" (ou Ctrl/Cmd + Enter)
6. Vérifier qu'il n'y a pas d'erreurs

✅ Votre base de données est prête !

### 3. Configurer OddsPapi (optionnel pour l'instant)

Pour l'instant, vous pouvez laisser une valeur par défaut.
Vous configurerez la vraie clé API plus tard lors du développement de la Phase 3.

### 4. Éditer .env.local

Ouvrir `.env.local` et modifier :

```env
# Changer le mot de passe par défaut
APP_PASSWORD=votre_mot_de_passe_securise

# Coller les valeurs Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# OddsPapi (optionnel pour l'instant)
ODDSPAPI_API_KEY=cle_temporaire
```

### 5. Installer et démarrer

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de dev
npm run dev
```

Ouvrir http://localhost:3000 🎉

## ✅ Checklist de Démarrage

- [ ] `npm run setup:env` exécuté
- [ ] Projet Supabase créé
- [ ] Migration SQL exécutée dans Supabase
- [ ] Clés Supabase dans `.env.local`
- [ ] Mot de passe changé dans `.env.local`
- [ ] `npm install` exécuté sans erreurs
- [ ] `npm run dev` démarre l'application
- [ ] http://localhost:3000 accessible

## 📚 Documentation Complète

Pour aller plus loin, consultez :

| Document | Quand le lire |
|----------|---------------|
| **[QUICK_START.md](QUICK_START.md)** | Guide rapide général |
| **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** | Guide détaillé Supabase |
| **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)** | Résumé de la configuration |
| **[PROJECT_SPEC.md](PROJECT_SPEC.md)** | Spécifications complètes |
| **[NEXT_STEPS.md](NEXT_STEPS.md)** | Plan de développement |

## 🎯 État Actuel

### ✅ Complété
- Phase 1 : Setup (Next.js, TypeScript, Tailwind, shadcn/ui)
- Configuration Supabase
- Types TypeScript
- Documentation

### ⏭️ Prochaine Phase
Phase 2 : Authentification (voir [NEXT_STEPS.md](NEXT_STEPS.md))

## 🆘 Problèmes Courants

### "Missing env.NEXT_PUBLIC_SUPABASE_URL"
→ Vérifier que `.env.local` existe et contient les bonnes valeurs
→ Redémarrer le serveur : `npm run dev`

### "npm install" échoue
→ Supprimer node_modules et package-lock.json
→ Relancer : `npm install`

### Port 3000 déjà utilisé
→ Utiliser un autre port : `PORT=3001 npm run dev`

### Erreurs TypeScript dans l'IDE
→ Redémarrer le serveur TypeScript dans VS Code
→ Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

## 📊 Structure du Projet

```
oddstracker/
├── .env.local              ← Vos variables d'environnement
├── app/                    ← Routes Next.js
├── components/             ← Composants React (16 composants UI)
├── lib/                    ← Logique métier
│   └── db/                 ← Client Supabase + queries
├── types/                  ← Types TypeScript
│   └── database.ts         ← Types auto-générés de la DB
└── scripts/                ← Scripts utilitaires
    └── setup-env.js        ← Générateur .env.local
```

## 💡 Commandes Utiles

```bash
# Configuration
npm run setup:env           # Générer .env.local

# Développement
npm run dev                 # Dev server
npm run build               # Build production
npm start                   # Démarrer en production

# Qualité
npm run lint                # Linter
npm audit                   # Vérifier sécurité

# Nettoyage
rm -rf node_modules package-lock.json && npm install
```

## 🎨 Technologies Utilisées

- **Next.js 14** - Framework React
- **TypeScript 5** - Typage statique
- **Tailwind CSS** - Styling utility-first
- **shadcn/ui** - Composants UI (16 installés)
- **Supabase** - Base de données PostgreSQL
- **TanStack Table** - Tableaux interactifs
- **ExcelJS** - Export XLSX sécurisé
- **jose** - JWT pour les sessions

## 🎉 C'est Parti !

Vous êtes prêt à développer !

Commencez par :
```bash
npm run setup:env
npm install
npm run dev
```

Puis consultez [NEXT_STEPS.md](NEXT_STEPS.md) pour la Phase 2.

**Bon développement ! 🚀**
