# Prochaines Étapes - OddsTracker

## ✅ Complété

- [x] Initialisation du projet Next.js 14 avec TypeScript strict
- [x] Configuration Tailwind CSS
- [x] Configuration shadcn/ui (components.json)
- [x] Structure de dossiers complète selon la spec
- [x] Fichiers de configuration (.env.example, tsconfig.json, etc.)
- [x] Schéma SQL complet (migrations/001_initial_schema.sql)
- [x] Routes de l'application (auth, dashboard, API)
- [x] Types TypeScript de base
- [x] Hooks personnalisés de base
- [x] Composants de base (Button, DataTable, LoginForm, Header)
- [x] Middleware d'authentification (structure de base)
- [x] README et documentation

## 📋 À Faire - Phase 1 : Setup (Jour 1 - 2h)

1. [ ] Installer les dépendances Node.js
   ```bash
   npm install
   ```

2. [ ] Créer le projet Supabase
   - Créer un compte sur https://supabase.com
   - Créer un nouveau projet
   - Récupérer les clés d'API

3. [ ] Exécuter les migrations SQL
   - Ouvrir l'éditeur SQL dans Supabase
   - Copier/coller le contenu de `lib/db/migrations/001_initial_schema.sql`
   - Exécuter le script

4. [ ] Configurer `.env.local`
   - Copier `.env.example` vers `.env.local`
   - Remplir toutes les variables d'environnement
   - Générer un secret de session sécurisé (32 caractères)

5. [ ] Installer les composants shadcn/ui supplémentaires nécessaires
   ```bash
   npx shadcn-ui@latest add input
   npx shadcn-ui@latest add select
   npx shadcn-ui@latest add table
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add dropdown-menu
   npx shadcn-ui@latest add calendar
   npx shadcn-ui@latest add popover
   ```

6. [ ] Tester le démarrage du projet
   ```bash
   npm run dev
   ```

7. [ ] Déployer sur Vercel (version initiale)
   - Connecter le repo GitHub à Vercel
   - Configurer les variables d'environnement
   - Déployer

## 📋 À Faire - Phase 2 : Authentification (Jour 1 - 1h)

1. [ ] Implémenter la page de login complète
   - Formulaire de connexion fonctionnel
   - Validation du mot de passe
   - Gestion des erreurs

2. [ ] Implémenter l'API de login (`app/api/auth/login/route.ts`)
   - Vérifier le mot de passe avec bcrypt
   - Créer la session JWT
   - Retourner le cookie de session

3. [ ] Implémenter l'API de logout (`app/api/auth/logout/route.ts`)
   - Supprimer le cookie de session

4. [ ] Compléter le middleware d'authentification
   - Vérifier la session JWT
   - Rediriger vers /login si non authentifié
   - Protéger toutes les routes sauf /login

5. [ ] Implémenter le changement de mot de passe
   - Formulaire dans la page settings
   - API endpoint pour changer le mot de passe
   - Mise à jour dans la table settings

6. [ ] Tester l'authentification complète

## 📋 À Faire - Phase 3 : Intégration API OddsPapi (Jour 2 - 3h)

1. [ ] Compléter le client API OddsPapi (`lib/api/oddspapi.ts`)
   - Implémenter toutes les méthodes
   - Gérer les rate limits
   - Logger les erreurs

2. [ ] Créer les types TypeScript pour toutes les réponses API
   - Compléter `lib/api/types.ts`

3. [ ] Tester les endpoints principaux
   - Récupérer les sports
   - Récupérer les tournois
   - Récupérer les fixtures
   - Récupérer les cotes historiques

4. [ ] Implémenter la queue de requêtes avec délais
   - 5000ms pour historical-odds
   - 1000ms pour odds-by-tournaments

## 📋 À Faire - Phase 4 : Import Historique (Jour 2-3 - 4h)

1. [ ] Créer le script d'import historique
   - Compléter `lib/sync/historical-sync.ts`
   - Import par sport
   - Gestion de la reprise sur erreur

2. [ ] Importer les données historiques
   - Football depuis 01/2019
   - Hockey depuis 01/2019
   - Tennis depuis 01/2019
   - Volleyball depuis 01/2019

3. [ ] Vérifier l'intégrité des données importées

## 📋 À Faire - Phase 5 : Interface Tableau (Jour 3-4 - 4h)

1. [ ] Créer les colonnes pour chaque sport
   - Football (`components/tables/columns/football-columns.tsx`)
   - Hockey
   - Tennis
   - Volleyball

2. [ ] Implémenter la pagination côté serveur

3. [ ] Implémenter le tri des colonnes

4. [ ] Implémenter la gestion de visibilité des colonnes

5. [ ] Connecter les tableaux aux données Supabase

## 📋 À Faire - Phase 6 : Filtres (Jour 4 - 2h)

1. [ ] Créer les composants de filtres
   - Filtre par pays
   - Filtre par ligue
   - Filtre par équipe (recherche)
   - Filtre par date (range picker)
   - Filtre par type de pari
   - Filtre par fourchette de cotes

2. [ ] Connecter les filtres aux requêtes

## 📋 À Faire - Phase 7 : Coloration Gagnant/Perdant (Jour 4 - 1h)

1. [ ] Compléter la logique de détection gagnant/perdant
   - Pour tous les types de marchés
   - Football, Hockey, Tennis, Volleyball

2. [ ] Appliquer les styles aux cellules

## 📋 À Faire - Phase 8 : Export (Jour 4 - 1h)

1. [ ] Compléter les fonctions d'export
   - CSV avec encodage UTF-8
   - XLSX

2. [ ] Créer les API endpoints

3. [ ] Créer les boutons d'export dans l'interface

## 📋 À Faire - Phase 9 : Page Réglages (Jour 5 - 2h)

1. [ ] Implémenter la synchronisation manuelle

2. [ ] Implémenter la configuration des syncs automatiques

3. [ ] Afficher le compteur de requêtes API

4. [ ] Afficher les logs de synchronisation

## 📋 À Faire - Phase 10 : Cron & Finalisation (Jour 5 - 2h)

1. [ ] Implémenter le service de synchronisation quotidienne

2. [ ] Tester le cron job en local

3. [ ] Déployer sur Vercel avec le cron configuré

4. [ ] Tests end-to-end

5. [ ] Optimisation responsive mobile

6. [ ] Nettoyage du code

7. [ ] Documentation finale

## 🎯 Commandes Utiles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint

# Ajouter un composant shadcn/ui
npx shadcn-ui@latest add [component-name]
```

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Table](https://tanstack.com/table/v8)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OddsPapi API](https://oddspapi.io/docs)
