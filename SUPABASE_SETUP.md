# Configuration Supabase - OddsTracker

Guide complet pour configurer Supabase pour OddsTracker.

## 📋 Prérequis

- Compte Supabase (gratuit) : https://supabase.com
- Accès à l'éditeur SQL de Supabase

## 🚀 Étapes de Configuration

### 1. Créer un Projet Supabase

1. Se connecter sur https://supabase.com
2. Cliquer sur "New Project"
3. Remplir les informations :
   - **Name** : oddstracker (ou autre nom)
   - **Database Password** : Générer un mot de passe fort (à sauvegarder)
   - **Region** : Choisir la région la plus proche
   - **Pricing Plan** : Free (suffisant pour le projet)
4. Cliquer sur "Create new project"
5. Attendre que le projet soit créé (~2 minutes)

### 2. Récupérer les Clés d'API

Une fois le projet créé :

1. Aller dans **Settings** (icône engrenage)
2. Cliquer sur **API** dans le menu latéral
3. Copier les informations suivantes :

```env
# URL du projet
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Clé anonyme (anon/public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Clé service role (CONFIDENTIEL - ne jamais exposer)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Configurer les Variables d'Environnement

1. Copier `.env.example` vers `.env.local` :
```bash
cp .env.example .env.local
```

2. Éditer `.env.local` et remplir les valeurs Supabase :
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
```

### 4. Exécuter les Migrations SQL

1. Ouvrir l'**SQL Editor** dans Supabase :
   - Menu latéral → **SQL Editor**
   - Cliquer sur **New query**

2. Copier le contenu complet de `lib/db/migrations/001_initial_schema.sql`

3. Coller dans l'éditeur SQL

4. Cliquer sur **Run** (ou Ctrl/Cmd + Enter)

5. Vérifier qu'il n'y a pas d'erreurs

### 5. Vérifier les Tables

1. Aller dans **Table Editor** (menu latéral)
2. Vérifier que toutes les tables sont créées :
   - ✅ sports (4 lignes insérées)
   - ✅ countries
   - ✅ leagues
   - ✅ teams
   - ✅ fixtures
   - ✅ markets
   - ✅ outcomes
   - ✅ odds
   - ✅ settings (8 lignes insérées)
   - ✅ sync_logs

### 6. Vérifier les Données Initiales

Dans **Table Editor**, ouvrir la table `sports` :
- Devrait contenir 4 lignes :
  - Football (oddspapi_id: 10)
  - Hockey (oddspapi_id: 4)
  - Tennis (oddspapi_id: 2)
  - Volleyball (oddspapi_id: 34)

Dans la table `settings` :
- Devrait contenir 8 clés :
  - password_hash
  - last_sync
  - auto_sync_enabled
  - auto_sync_time
  - extra_sync_enabled
  - extra_sync_time
  - api_requests_count
  - api_requests_reset_date

## 🔒 Sécurité

### Row Level Security (RLS)

Pour un projet en production, activez RLS :

1. Aller dans **Authentication** → **Policies**
2. Pour chaque table, créer des politiques selon vos besoins

Exemple pour la table `fixtures` (lecture publique) :
```sql
CREATE POLICY "Allow public read access"
ON fixtures FOR SELECT
TO public
USING (true);
```

Pour ce projet, **RLS peut rester désactivé** car :
- Authentification simple par mot de passe unique
- Pas de données utilisateur sensibles
- Application à usage interne

### Variables d'Environnement

⚠️ **IMPORTANT** :
- ✅ `NEXT_PUBLIC_*` : Peut être exposé côté client
- ❌ `SUPABASE_SERVICE_ROLE_KEY` : **JAMAIS** exposer côté client
  - Utiliser uniquement dans les API routes
  - Donne accès complet à la base de données

## 🧪 Tester la Connexion

Créer un fichier de test `test-supabase.ts` à la racine :

```typescript
import { supabase } from "./lib/db";

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from("sports")
      .select("*");

    if (error) throw error;

    console.log("✅ Connexion Supabase réussie !");
    console.log("Sports récupérés :", data);
  } catch (error) {
    console.error("❌ Erreur de connexion :", error);
  }
}

testConnection();
```

Exécuter :
```bash
npx tsx test-supabase.ts
```

## 📊 Structure de la Base de Données

### Tables Principales

```
sports (4 sports)
  ├── leagues (compétitions par sport)
  │   └── fixtures (matchs)
  │       └── odds (cotes par match)
  │           ├── markets (types de paris)
  │           └── outcomes (résultats possibles)
  ├── teams (équipes)
  └── countries (pays)

settings (configuration app)
sync_logs (logs de synchronisation)
```

### Index Optimisés

Tous les index sont déjà créés dans la migration :
- Index sur les foreign keys
- Index sur les champs souvent filtrés (sport_id, league_id, etc.)
- Index sur les prix (opening_price, closing_price)
- Index sur le statut des paris (is_winner)

## 🔄 Types TypeScript

Les types TypeScript sont générés automatiquement depuis le schéma SQL :
- Fichier : `types/database.ts`
- Import : `import type { Database, Fixture, Odd } from "@/types/database"`

Avantages :
- ✅ Autocomplétion complète dans VS Code
- ✅ Vérification des types au build
- ✅ Erreurs de type détectées avant le runtime

Exemple d'utilisation :
```typescript
import { supabase } from "@/lib/db";
import type { Fixture } from "@/types/database";

const { data, error } = await supabase
  .from("fixtures")
  .select("*")
  .eq("sport_id", 10);

// data est typé comme Fixture[]
```

## 📝 Requêtes Fréquentes

### Récupérer tous les matchs d'un sport
```typescript
const { data } = await supabase
  .from("fixtures")
  .select("*")
  .eq("sport_id", 10) // Football
  .order("start_time", { ascending: false });
```

### Récupérer un match avec ses cotes
```typescript
const { data } = await supabase
  .from("fixtures")
  .select(`
    *,
    odds (
      *,
      market:markets (*),
      outcome:outcomes (*)
    )
  `)
  .eq("id", fixtureId)
  .single();
```

### Récupérer les ligues d'un sport
```typescript
const { data } = await supabase
  .from("leagues")
  .select(`
    *,
    country:countries (*)
  `)
  .eq("sport_id", 10);
```

## 🚨 Résolution de Problèmes

### Erreur "Missing env.NEXT_PUBLIC_SUPABASE_URL"
- Vérifier que `.env.local` existe
- Vérifier que les variables sont correctement définies
- Redémarrer le serveur de dev : `npm run dev`

### Erreur de connexion
- Vérifier que le projet Supabase est actif
- Vérifier les clés API (copier/coller depuis Supabase)
- Vérifier que l'URL contient bien `https://`

### Tables manquantes
- Vérifier que toute la migration SQL a été exécutée
- Vérifier qu'il n'y a pas d'erreurs dans l'SQL Editor
- Re-exécuter la migration si nécessaire

### Erreur de types TypeScript
- Vérifier que `types/database.ts` existe
- Vérifier l'import : `import type { Database } from "@/types/database"`
- Redémarrer le serveur TypeScript dans VS Code

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase Client Library](https://supabase.com/docs/reference/javascript/introduction)
- [SQL Editor](https://supabase.com/docs/guides/database/overview)
- [Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

## ✅ Checklist de Configuration

- [ ] Projet Supabase créé
- [ ] Clés API récupérées
- [ ] Variables d'environnement configurées dans `.env.local`
- [ ] Migration SQL exécutée sans erreurs
- [ ] Table `sports` contient 4 lignes
- [ ] Table `settings` contient 8 lignes
- [ ] Connexion testée avec succès
- [ ] Types TypeScript disponibles

---

**Prochaine étape** : Démarrer le serveur de dev et tester l'application !

```bash
npm run dev
```
