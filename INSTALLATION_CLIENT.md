# 📦 Guide d'Installation - OddsTracker

**Version:** 2.0 (Localhost + GitHub Actions)
**Date:** Décembre 2025
**Système:** macOS / Windows

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation rapide (5 minutes)](#installation-rapide)
3. [Configuration détaillée](#configuration-détaillée)
4. [Démarrage de l'application](#démarrage-de-lapplication)
5. [Configuration GitHub Actions](#configuration-github-actions)
6. [Vérification du fonctionnement](#vérification-du-fonctionnement)
7. [Utilisation quotidienne](#utilisation-quotidienne)
8. [Dépannage](#dépannage)

---

## 🎯 Prérequis

### Logiciels requis

| Logiciel | Version minimum | Installation |
|----------|-----------------|--------------|
| **Node.js** | 20.0+ | [nodejs.org](https://nodejs.org) |
| **Git** | Latest | [git-scm.com](https://git-scm.com) |
| **Terminal** | Natif | Terminal (Mac) / PowerShell (Windows) |

### Comptes requis

| Service | Type | Prix | Utilisation |
|---------|------|------|-------------|
| **Supabase** | Cloud DB | Gratuit | Base de données PostgreSQL |
| **Odds-API.io** | API | Gratuit (5000 req/h) | Source des cotes sportives |
| **GitHub** | Repository | Gratuit | Hébergement code + automatisation |

### Vérifier l'installation de Node.js

```bash
# Dans le terminal, tapez:
node --version
# Devrait afficher: v20.x.x ou supérieur

npm --version
# Devrait afficher: 10.x.x ou supérieur
```

Si ces commandes ne fonctionnent pas, installez Node.js depuis [nodejs.org](https://nodejs.org).

---

## ⚡ Installation rapide (5 minutes)

### Étape 1: Cloner le projet

```bash
# Ouvrez le terminal et naviguez vers votre dossier de travail
cd ~/Desktop

# Clonez le projet
git clone https://github.com/Danymcflyy/OddsTracker.git

# Entrez dans le dossier
cd OddsTracker
```

### Étape 2: Installer les dépendances

```bash
npm install
```

⏱️ **Temps estimé:** 2-3 minutes

### Étape 3: Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet:

```bash
# Supabase (Base de données)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Odds-API.io (Source des cotes)
ODDS_API_IO_KEY=votre_cle_api_ici
```

⚠️ **Important:** Remplacez les valeurs par vos vraies clés (voir [Configuration détaillée](#configuration-détaillée))

### Étape 4: Lancer l'application

**Sur macOS:**
```bash
# Double-cliquez sur le fichier depuis le Finder:
OddsTracker.command

# OU depuis le terminal:
npm run dev
```

**Sur Windows:**
```bash
# Double-cliquez sur le fichier depuis l'Explorateur:
OddsTracker.bat

# OU depuis PowerShell:
npm run dev
```

### Étape 5: Ouvrir l'application

Ouvrez votre navigateur: **http://localhost:3000**

✅ **Installation terminée!**

---

## 🔧 Configuration détaillée

### 1. Obtenir les clés Supabase

#### a) Créer un projet Supabase (si nécessaire)

1. Allez sur [supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Créez un nouveau projet (gratuit)
   - **Nom:** OddsTracker
   - **Database Password:** Notez-le bien!
   - **Region:** Europe West (recommandé)

#### b) Récupérer les clés

1. Dans votre projet Supabase, allez dans **Settings** → **API**
2. Copiez les valeurs suivantes:

| Clé | Où la trouver | Exemple |
|-----|---------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project API keys → anon public | `eyJhbGciOiJIUzI...` (très long) |
| `SUPABASE_SERVICE_ROLE_KEY` | Project API keys → service_role (⚠️ Secret!) | `eyJhbGciOiJIUzI...` (très long) |

#### c) Appliquer les migrations de base de données

1. Dans Supabase, allez dans **SQL Editor**
2. Créez une nouvelle query
3. Copiez le contenu de `lib/db/migrations/v3/001_initial_schema_v3.sql`
4. Cliquez sur **Run**
5. Répétez pour tous les fichiers de migration (dans l'ordre 001, 002, etc.)

✅ **Base de données configurée!**

### 2. Obtenir la clé Odds-API.io

#### a) Créer un compte

1. Allez sur [odds-api.io](https://odds-api.io)
2. Cliquez sur "Sign Up" (gratuit)
3. Vérifiez votre email

#### b) Récupérer la clé API

1. Connectez-vous à [odds-api.io/dashboard](https://odds-api.io/dashboard)
2. Copiez votre **API Key**
3. Collez-la dans `.env.local` comme valeur de `ODDS_API_IO_KEY`

**Quota gratuit:** 5,000 requêtes/heure (largement suffisant)

---

## 🚀 Démarrage de l'application

### Méthode 1: Lanceurs desktop (Recommandé)

#### Sur macOS

1. Double-cliquez sur **OddsTracker.command** depuis le Finder
2. L'application démarre automatiquement
3. Une fenêtre de terminal s'ouvre avec les logs
4. Ouvrez http://localhost:3000

#### Sur Windows

1. Double-cliquez sur **OddsTracker.bat** depuis l'Explorateur
2. L'application démarre automatiquement
3. Une fenêtre de commande s'ouvre avec les logs
4. Ouvrez http://localhost:3000

### Méthode 2: Ligne de commande

```bash
# Naviguez vers le dossier du projet
cd ~/Desktop/OddsTracker

# Lancez le serveur de développement
npm run dev
```

Ouvrez: **http://localhost:3000**

### Arrêter l'application

- **Lanceurs desktop:** Fermez la fenêtre de terminal/commande
- **Ligne de commande:** Appuyez sur `Ctrl+C` dans le terminal

---

## ⚙️ Configuration GitHub Actions

GitHub Actions synchronise automatiquement les cotes **toutes les 5 minutes**, même si votre ordinateur est éteint.

### Étape 1: Ajouter les secrets GitHub

1. Allez sur: https://github.com/Danymcflyy/OddsTracker/settings/secrets/actions
2. Cliquez sur **"New repository secret"**
3. Ajoutez ces 4 secrets (un par un):

| Nom du secret | Valeur | Source |
|---------------|--------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Votre URL Supabase | Même valeur que dans `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Votre clé anon | Même valeur que dans `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Votre clé service role | Même valeur que dans `.env.local` |
| `ODDS_API_IO_KEY` | Votre clé API | Même valeur que dans `.env.local` |

### Étape 2: Tester le workflow

1. Allez sur: https://github.com/Danymcflyy/OddsTracker/actions
2. Cliquez sur **"Sync Odds V2 Parallel (5-min)"**
3. Cliquez sur **"Run workflow"** → **"Run workflow"**
4. Attendez 2-5 minutes
5. Vérifiez les logs:
   - ✅ "V2 PARALLEL SYNC COMPLETED" = succès!
   - ❌ Erreurs = vérifiez les secrets

### Étape 3: Vérifier l'automatisation

Après 5-10 minutes, retournez sur la page Actions. Vous devriez voir de nouvelles exécutions automatiques avec l'événement **"schedule"** (au lieu de "workflow_dispatch").

✅ **Automatisation active!** Les cotes se synchronisent toutes les 5 minutes.

---

## ✅ Vérification du fonctionnement

### 1. Vérifier l'application locale

- [ ] ✅ L'application s'ouvre sur http://localhost:3000
- [ ] ✅ La page d'accueil affiche des matchs
- [ ] ✅ Les filtres fonctionnent (pays, ligues, équipes)
- [ ] ✅ Les cotes (opening/current) sont affichées

### 2. Vérifier la base de données

1. Connectez-vous à Supabase
2. Allez dans **Table Editor**
3. Vérifiez ces tables:
   - `matches`: Doit contenir des matchs
   - `odds`: Doit contenir des cotes
   - `leagues`: Doit contenir des ligues

### 3. Vérifier GitHub Actions

1. Allez sur: https://github.com/Danymcflyy/OddsTracker/actions
2. Les workflows doivent s'exécuter toutes les 5 minutes
3. Statut: ✅ (vert) = succès

### 4. Vérifier le quota API

1. Allez sur: https://odds-api.io/dashboard
2. Vérifiez votre consommation:
   - **Objectif:** ~720 requêtes/heure
   - **Limite:** 5,000 requêtes/heure
   - **Marge:** 85%+ disponible

---

## 💼 Utilisation quotidienne

### Démarrer l'application

**Méthode simple:**
1. Double-cliquez sur `OddsTracker.command` (Mac) ou `OddsTracker.bat` (Windows)
2. Attendez que le serveur démarre (~10 secondes)
3. Ouvrez http://localhost:3000

### Gérer les ligues suivies

1. Dans l'application, allez sur **Settings** → **Ligues suivies**
2. Utilisez la barre de recherche pour trouver une ligue
3. Activez/désactivez les ligues avec le switch
4. Les changements sont automatiques

**Ligues actives:**
- ✅ England - Premier League
- ✅ Italy - Serie B

**Ajouter une nouvelle ligue:**
1. Cherchez la ligue (ex: "La Liga")
2. Activez le switch
3. Dans 5 minutes max, les matchs apparaissent!

### Filtrer et exporter les données

**Filtres disponibles:**
- Pays
- Ligues
- Équipes
- Plage de cotes (opening/current)
- Date de match

**Export:**
1. Appliquez vos filtres
2. Cliquez sur **"Export"**
3. Choisissez CSV ou XLSX
4. Le fichier respecte les filtres actifs

### Monitorer la synchronisation

**Vérifier que tout fonctionne:**
1. Allez sur https://github.com/Danymcflyy/OddsTracker/actions
2. Vous devez voir des exécutions régulières (toutes les ~5 min)
3. Statut vert = tout va bien!

**En cas de problème:**
- Vérifiez les logs de l'exécution qui a échoué
- Vérifiez votre quota API: https://odds-api.io/dashboard

---

## 🐛 Dépannage

### Problème: "Cannot find module"

**Cause:** Dépendances npm manquantes

**Solution:**
```bash
cd ~/Desktop/OddsTracker
rm -rf node_modules
npm install
npm run dev
```

### Problème: "Port 3000 already in use"

**Cause:** Une autre application utilise le port 3000

**Solution:**
```bash
# Trouver et arrêter le processus
lsof -ti:3000 | xargs kill -9

# OU utiliser un autre port
npm run dev -- -p 3001
# Puis ouvrez: http://localhost:3001
```

### Problème: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Cause:** Fichier `.env.local` manquant ou mal configuré

**Solution:**
1. Vérifiez que le fichier `.env.local` existe à la racine du projet
2. Vérifiez que toutes les variables sont définies
3. Redémarrez l'application

### Problème: Les données ne se mettent pas à jour

**Causes possibles:**

1. **GitHub Actions ne fonctionne pas:**
   - Allez sur https://github.com/Danymcflyy/OddsTracker/actions
   - Vérifiez qu'il y a des exécutions récentes
   - Si erreurs: vérifiez les secrets GitHub

2. **Quota API dépassé:**
   - Allez sur https://odds-api.io/dashboard
   - Si quota épuisé: attendez la prochaine heure

3. **Cache navigateur:**
   - Faites Ctrl+R (ou Cmd+R) pour rafraîchir
   - Ou Ctrl+Shift+R pour forcer le rafraîchissement

### Problème: GitHub Actions échoue

**Erreur: "ODDS_API_IO_KEY manquée"**

**Solution:**
1. Allez sur: https://github.com/Danymcflyy/OddsTracker/settings/secrets/actions
2. Vérifiez que le secret `ODDS_API_IO_KEY` existe
3. Si non, ajoutez-le avec votre clé API

**Erreur: "Cannot connect to Supabase"**

**Solution:**
1. Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est correct
2. Allez sur Supabase → Settings → API
3. Copiez à nouveau la service_role key
4. Mettez à jour le secret GitHub

### Problème: Application lente

**Solutions:**
1. Fermez les onglets inutiles du navigateur
2. Réduisez le nombre de ligues trackées
3. Vérifiez votre connexion internet
4. Redémarrez l'application

---

## 📞 Support

### Documentation complémentaire

- `README.md` - Vue d'ensemble du projet
- `CHANGELOG.md` - Historique des modifications
- `.github/MAINTENANCE.md` - Guide de maintenance
- `LOCALHOST_SETUP.md` - Configuration localhost détaillée

### En cas de problème

1. Consultez cette documentation
2. Vérifiez les logs de l'application
3. Vérifiez les logs GitHub Actions
4. Contactez le support technique

---

## ✅ Checklist de livraison

- [ ] Node.js 20+ installé
- [ ] Projet cloné depuis GitHub
- [ ] Dépendances npm installées (`npm install`)
- [ ] Fichier `.env.local` créé avec toutes les clés
- [ ] Migrations Supabase appliquées
- [ ] Application démarre en local (http://localhost:3000)
- [ ] Secrets GitHub configurés (4 secrets)
- [ ] GitHub Actions fonctionne (test manuel réussi)
- [ ] Workflow automatique actif (vérifier après 10 min)
- [ ] Ligues trackées configurées dans l'UI
- [ ] Données synchronisées visibles dans l'application

---

**🎉 Installation terminée! Profitez d'OddsTracker!**
