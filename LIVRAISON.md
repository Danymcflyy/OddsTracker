# 📦 Document de Livraison - OddsTracker v2.0

**Date de livraison:** Décembre 2025
**Version:** 2.0 - Architecture Localhost + GitHub Actions
**Client:** [Nom du client]

---

## 🎯 Résumé du projet

**OddsTracker** est une application web de suivi et d'analyse de cotes sportives en temps réel, avec un focus sur le football européen professionnel.

### Points clés

- ✅ Synchronisation automatique des cotes toutes les 5 minutes
- ✅ Support de multiples ligues en parallèle (scalable)
- ✅ Interface web moderne et responsive
- ✅ Export des données (CSV/XLSX)
- ✅ Gestion dynamique des ligues suivies
- ✅ Système 100% automatisé (fonctionne même PC éteint)

---

## 📦 Contenu de la livraison

### 1. Code source

**Repository GitHub:** https://github.com/Danymcflyy/OddsTracker

**Structure:**
```
OddsTracker/
├── app/                         # Pages et routes Next.js
├── components/                  # Composants UI réutilisables
├── lib/                         # Logique métier et API
├── scripts/                     # Scripts de synchronisation
├── .github/workflows/           # Automatisation GitHub Actions
├── OddsTracker.command         # Lanceur macOS
├── OddsTracker.bat             # Lanceur Windows
├── INSTALLATION_CLIENT.md      # 📘 Guide d'installation (LIRE EN PREMIER)
└── package.json                # Dépendances npm
```

### 2. Documentation

| Document | Description | Priorité |
|----------|-------------|----------|
| **INSTALLATION_CLIENT.md** | 📘 Guide d'installation complet pas à pas | 🔴 PRIORITAIRE |
| **README.md** | Vue d'ensemble et architecture | ⚪ Lecture recommandée |
| **LIVRAISON.md** | Ce document - Résumé de livraison | ⚪ Lecture recommandée |
| **CHANGELOG.md** | Historique des modifications | 🔵 Référence |
| **.github/MAINTENANCE.md** | Guide de maintenance | 🔵 Référence |

### 3. Lanceurs desktop

- **OddsTracker.command** (macOS) - Double-clic pour démarrer
- **OddsTracker.bat** (Windows) - Double-clic pour démarrer

---

## 🏗️ Architecture technique

### Vue d'ensemble

```
┌─────────────────────────────────────────┐
│  GitHub Actions (Cloud Automatique)    │
│  ✅ Toutes les 5 minutes               │
│  ✅ Indépendant du PC client           │
│  ✅ Timeout: 1 heure (vs 60s Vercel)   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│       Supabase (PostgreSQL Cloud)       │
│  ✅ Base de données centralisée         │
│  ✅ 500 MB gratuit                      │
│  ✅ Accessible 24/7                     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Next.js Application (Localhost)      │
│  ✅ Interface utilisateur               │
│  ✅ http://localhost:3000               │
│  ✅ Fonctionne offline (lecture)        │
└─────────────────────────────────────────┘
```

### Technologies utilisées

| Composant | Technologie | Version | Licence |
|-----------|-------------|---------|---------|
| Frontend | Next.js | 14.2+ | MIT |
| UI Framework | React | 18.x | MIT |
| Styling | Tailwind CSS | 3.x | MIT |
| Base de données | PostgreSQL (Supabase) | 15.x | Open Source |
| API Cotes | Odds-API.io | v3 | Commercial |
| Automatisation | GitHub Actions | - | Gratuit (repo public) |

---

## 🔑 Comptes et services requis

### 1. Supabase (Base de données)

**Compte:** Gratuit
**URL:** https://supabase.com
**Quota gratuit:** 500 MB de stockage, illimité en requêtes
**Utilisation:** Stockage des matchs, cotes, ligues

**Configuration requise:**
- ✅ Projet créé
- ✅ Migrations SQL appliquées (voir `lib/db/migrations/v3/`)
- ✅ 3 clés API récupérées

### 2. Odds-API.io (Source des cotes)

**Compte:** Gratuit
**URL:** https://odds-api.io
**Quota gratuit:** 5,000 requêtes/heure
**Utilisation:** Récupération des cotes sportives (Pinnacle)

**Usage moyen:**
- ~720 requêtes/heure (toutes les 5 min)
- Marge: 85%+ disponible
- Suffisant pour 10+ ligues simultanées

### 3. GitHub (Code + Automatisation)

**Compte:** Gratuit
**Repository:** https://github.com/Danymcflyy/OddsTracker
**Quota gratuit:** Illimité (Actions sur repo public)
**Utilisation:** Hébergement code + workflows automatiques

**Configuration requise:**
- ✅ 4 secrets configurés (voir `INSTALLATION_CLIENT.md`)

---

## ⚡ Démarrage rapide (5 minutes)

### Pour le client technique

```bash
# 1. Cloner le projet
git clone https://github.com/Danymcflyy/OddsTracker.git
cd OddsTracker

# 2. Installer les dépendances
npm install

# 3. Créer .env.local avec vos clés
# (Voir INSTALLATION_CLIENT.md pour les valeurs)

# 4. Lancer l'application
npm run dev

# 5. Ouvrir http://localhost:3000
```

### Pour le client non-technique

1. **Double-cliquez** sur `OddsTracker.command` (Mac) ou `OddsTracker.bat` (Windows)
2. Attendez le démarrage (~10 secondes)
3. Ouvrez http://localhost:3000 dans votre navigateur

📘 **Guide complet:** Voir `INSTALLATION_CLIENT.md`

---

## 📊 Fonctionnalités livrées

### ✅ Version 2.0 (Actuelle)

#### Synchronisation automatique (V2 Parallel)

- ✅ Exécution toutes les 5 minutes via GitHub Actions
- ✅ Parallélisation par ligue (10x plus rapide que V1)
- ✅ Résilience aux erreurs (une ligue qui échoue n'affecte pas les autres)
- ✅ Logs détaillés par ligue
- ✅ Timeout: 1 heure (vs 60 secondes avant)

#### Interface utilisateur

- ✅ Tableau des matchs avec cotes opening/current
- ✅ Filtres: Pays, Ligues, Équipes, Plages de cotes
- ✅ Visibilité des colonnes personnalisable
- ✅ Export CSV/XLSX respectant les filtres
- ✅ Responsive design (desktop/mobile)

#### Gestion des ligues

- ✅ Page dédiée: `/settings/leagues`
- ✅ Recherche par nom ou pays
- ✅ Activation/désactivation en un clic
- ✅ Compteur de ligues actives
- ✅ Synchronisation automatique après changement

#### Monitoring

- ✅ Page GitHub Actions pour voir les exécutions
- ✅ Logs détaillés de chaque synchronisation
- ✅ Statistiques par ligue (matchs, cotes capturées)
- ✅ Suivi du quota API

### 📋 Limites connues

- ⚠️ Application localhost uniquement (pas d'hébergement public)
- ⚠️ Nécessite Node.js installé sur la machine
- ⚠️ Quota API: 5,000 req/h (suffisant pour 10+ ligues)
- ⚠️ Résultats historiques: Non implémenté dans cette version

---

## 🎓 Formation et utilisation

### Compétences requises

**Pour utiliser l'application:**
- 🟢 Aucune compétence technique requise
- 🟢 Savoir utiliser un navigateur web
- 🟢 Savoir double-cliquer sur un fichier

**Pour installer:**
- 🟡 Connaissance basique du terminal (copier/coller commandes)
- 🟡 Savoir créer un compte en ligne (Supabase, Odds-API)
- 🟡 Suivre des instructions pas à pas

**Pour maintenir/modifier:**
- 🔴 JavaScript/TypeScript
- 🔴 Next.js et React
- 🔴 PostgreSQL/Supabase
- 🔴 GitHub Actions

### Documentation fournie

1. **INSTALLATION_CLIENT.md** - 📘 Guide d'installation complet
   - Prérequis détaillés
   - Installation pas à pas
   - Configuration des services
   - Dépannage

2. **README.md** - Vue d'ensemble technique
   - Architecture
   - Stack technologique
   - Structure du code

3. **CHANGELOG.md** - Historique des versions
   - Version 2.0: Migration localhost + V2 Parallel
   - Versions précédentes

4. **.github/MAINTENANCE.md** - Maintenance courante
   - Scripts utiles
   - Commandes fréquentes

---

## 🔒 Sécurité et données

### Variables sensibles

**Stockées localement (`.env.local`):**
- ✅ Clés Supabase
- ✅ Clé Odds-API

**Stockées sur GitHub (Secrets):**
- ✅ Mêmes clés pour GitHub Actions
- ✅ Jamais exposées dans le code
- ✅ Chiffrées par GitHub

### Bonnes pratiques

- ⚠️ **Ne jamais** commiter le fichier `.env.local`
- ⚠️ **Ne jamais** partager vos clés API publiquement
- ✅ Les clés sont déjà dans `.gitignore`
- ✅ GitHub Secrets sont chiffrés

### Données stockées

**Base de données Supabase:**
- Matchs sportifs (publics)
- Cotes (publiques)
- Ligues et équipes (publiques)
- **Aucune donnée utilisateur personnelle**

---

## 💰 Coûts d'exploitation

### Coûts mensuels

| Service | Plan | Coût/mois | Notes |
|---------|------|-----------|-------|
| **Supabase** | Gratuit | 0€ | 500 MB suffisant |
| **Odds-API.io** | Gratuit | 0€ | 5,000 req/h suffisant |
| **GitHub Actions** | Gratuit | 0€ | Illimité (repo public) |
| **Hébergement** | Localhost | 0€ | Pas de serveur |
| **TOTAL** | - | **0€** | 100% gratuit ✅ |

### Si besoin d'upgrade

**Supabase Pro (25€/mois):**
- 8 GB stockage (vs 500 MB)
- Plus de connexions simultanées
- Support prioritaire

**Odds-API.io Premium (50€/mois):**
- 50,000 requêtes/heure (vs 5,000)
- Plus de bookmakers
- Support prioritaire

---

## 🐛 Support et maintenance

### En cas de problème

1. **Consulter la documentation**
   - `INSTALLATION_CLIENT.md` - Section "Dépannage"
   - `README.md` - FAQ

2. **Vérifier les logs**
   - Application locale: Terminal où `npm run dev` tourne
   - GitHub Actions: https://github.com/Danymcflyy/OddsTracker/actions

3. **Vérifier les services**
   - Supabase: https://app.supabase.com
   - Odds-API quota: https://odds-api.io/dashboard

4. **Solutions communes**
   - `npm install` pour réparer les dépendances
   - Redémarrer l'application
   - Vérifier `.env.local`
   - Vérifier les secrets GitHub

### Évolutions futures possibles

**Fonctionnalités suggérées:**
- 📊 Récupération des résultats historiques (matchs terminés)
- 📈 Graphiques d'évolution des cotes
- 🔔 Alertes sur mouvements de cotes importants
- 📱 Version mobile native
- 🌐 Hébergement public (Vercel avec plan Pro)

---

## ✅ Checklist de livraison

### Fichiers livrés

- [x] Code source complet sur GitHub
- [x] Documentation d'installation (`INSTALLATION_CLIENT.md`)
- [x] Lanceurs desktop (macOS + Windows)
- [x] Migrations base de données (SQL)
- [x] Workflows GitHub Actions configurés
- [x] README technique
- [x] CHANGELOG
- [x] Ce document (LIVRAISON.md)

### Fonctionnalités opérationnelles

- [x] Synchronisation automatique toutes les 5 minutes
- [x] Interface utilisateur localhost fonctionnelle
- [x] Filtres et exports de données
- [x] Gestion des ligues dans l'UI
- [x] Logs et monitoring

### Tests effectués

- [x] Installation complète testée (macOS)
- [x] Workflow GitHub Actions testé (run manuel + automatique)
- [x] Synchronisation de 2 ligues testée (Premier League + Serie B)
- [x] Capture de ~2,250 cotes testée
- [x] Lanceurs desktop testés

---

## 📞 Contacts

**Repository:** https://github.com/Danymcflyy/OddsTracker
**Actions:** https://github.com/Danymcflyy/OddsTracker/actions
**Issues:** https://github.com/Danymcflyy/OddsTracker/issues

**Supabase:** https://app.supabase.com
**Odds-API:** https://odds-api.io/dashboard

---

## 🎉 Notes finales

### Points forts du système

✅ **100% gratuit** - Aucun coût d'exploitation
✅ **Scalable** - Support de 10+ ligues simultanément
✅ **Fiable** - Timeout de 1h vs 60s avant
✅ **Automatisé** - Fonctionne même PC éteint
✅ **Simple** - Double-clic pour démarrer
✅ **Flexible** - Facile d'ajouter/retirer des ligues

### Prochaine étape recommandée

📘 **Lire `INSTALLATION_CLIENT.md`** et suivre les instructions pas à pas.

---

**Bonne utilisation d'OddsTracker! 🚀**

*Document de livraison v2.0 - Décembre 2025*
