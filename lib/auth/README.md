# 🔐 Système d'Authentification - OddsTracker

Documentation complète du système d'authentification par mot de passe unique.

## 📁 Architecture

```
lib/auth/
├── session.ts              ← Gestion des sessions JWT + cookies
└── README.md               ← Ce fichier

app/api/auth/
├── login/route.ts          ← POST /api/auth/login
├── logout/route.ts         ← POST /api/auth/logout
└── change-password/route.ts ← POST /api/auth/change-password

middleware.ts               ← Protection des routes (root du projet)
```

## 🔑 Fonctionnement

### 1. Mot de Passe Unique

L'application utilise un **mot de passe unique** partagé par tous les utilisateurs :

- Stocké dans la table `settings` avec la clé `password_hash`
- Hash bcrypt (10 rounds)
- Minimum 8 caractères
- Configurable via `/settings` après connexion

### 2. Sessions JWT

Les sessions sont gérées avec JWT (JSON Web Tokens) :

- **Durée** : 24 heures (défini dans `types/auth.ts`)
- **Stockage** : Cookie httpOnly sécurisé
- **Nom** : `oddstracker-session`
- **Algorithme** : HS256

```typescript
// Payload de la session
interface SessionPayload {
  isAuthenticated: boolean;
  createdAt: number;
  expiresAt: number;
}
```

### 3. Protection des Routes

Le middleware Next.js protège automatiquement toutes les routes sauf :

- `/login` (page publique)
- `/api/auth/login` (endpoint public)
- Fichiers statiques (`_next/static`, `_next/image`, `favicon.ico`)

## 🚀 Utilisation

### Créer une Session (Login)

```typescript
import { createSession } from "@/lib/auth/session";

// Après vérification du mot de passe
await createSession();
// → Crée un token JWT et le stocke dans un cookie
```

### Vérifier une Session

```typescript
import { verifySession } from "@/lib/auth/session";

const isAuthenticated = await verifySession();
// → true si session valide, false sinon
```

### Récupérer le Payload

```typescript
import { getSessionPayload } from "@/lib/auth/session";

const payload = await getSessionPayload();
if (payload) {
  console.log("Session créée le:", new Date(payload.createdAt));
  console.log("Expire le:", new Date(payload.expiresAt));
}
```

### Supprimer une Session (Logout)

```typescript
import { deleteSession } from "@/lib/auth/session";

await deleteSession();
// → Supprime le cookie de session
```

### Renouveler une Session

```typescript
import { renewSession } from "@/lib/auth/session";

try {
  const newToken = await renewSession();
  console.log("Session renouvelée");
} catch (error) {
  console.log("Session invalide, impossible de renouveler");
}
```

## 📡 API Routes

### POST /api/auth/login

Authentifie l'utilisateur avec le mot de passe unique.

**Body** :

```json
{
  "password": "mon_mot_de_passe"
}
```

**Responses** :

```typescript
// Succès (200)
{
  "success": true,
  "message": "Connexion réussie"
}

// Première connexion - définit le mot de passe (200)
{
  "success": true,
  "message": "Mot de passe défini et connexion réussie"
}

// Mot de passe incorrect (401)
{
  "success": false,
  "error": "Mot de passe incorrect"
}

// Validation échouée (400)
{
  "success": false,
  "error": "Le mot de passe doit contenir au moins 8 caractères"
}
```

**Fonctionnalités** :

- Première connexion : Si `password_hash` est vide, le mot de passe fourni devient le mot de passe
- Délai de 1 seconde en cas d'échec (protection brute force)
- Création automatique de la session en cas de succès

### POST /api/auth/logout

Déconnecte l'utilisateur en supprimant sa session.

**Body** : Aucun

**Response** :

```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

**Alternative GET** :

```
GET /api/auth/logout
```

Permet la déconnexion via un simple lien. Redirige vers `/login`.

### POST /api/auth/change-password

Change le mot de passe (nécessite authentification).

**Body** :

```json
{
  "currentPassword": "ancien_password",
  "newPassword": "nouveau_password",
  "confirmPassword": "nouveau_password"
}
```

**Responses** :

```typescript
// Succès (200)
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}

// Non authentifié (401)
{
  "success": false,
  "error": "Non authentifié"
}

// Mot de passe actuel incorrect (401)
{
  "success": false,
  "error": "Mot de passe actuel incorrect"
}

// Validation échouée (400)
{
  "success": false,
  "error": "Les nouveaux mots de passe ne correspondent pas"
}
```

**Validations** :

- Nouveau mot de passe ≥ 8 caractères
- Nouveau ≠ ancien
- `newPassword` === `confirmPassword`
- Mot de passe actuel correct

## 🛡️ Middleware

Le middleware protège automatiquement toutes les routes.

### Comportement

**Pages Web** :

- Session valide → Accès autorisé
- Session invalide/manquante → Redirection vers `/login`
- Session expirée → Suppression du cookie + redirection

**API Routes** :

- Session valide → Accès autorisé
- Session invalide/manquante → `401 Unauthorized`

### Configuration

```typescript
// middleware.ts
export const config = {
  matcher: [
    // Exclut les fichiers statiques
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### Routes Publiques

```typescript
const publicPaths = ["/login"];
const publicApiPaths = ["/api/auth/login"];
```

Pour ajouter une route publique, modifier ces tableaux dans `middleware.ts`.

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

1. **JWT avec secret fort** :

   - Secret de 32+ caractères aléatoires
   - Généré automatiquement par `scripts/setup-env.js`
   - Stocké dans `.env.local` (jamais committé)

2. **Cookies sécurisés** :

   - `httpOnly: true` (inaccessible en JavaScript)
   - `secure: true` en production (HTTPS uniquement)
   - `sameSite: 'lax'` (protection CSRF)
   - `path: '/'` (toute l'application)

3. **Hash bcrypt** :

   - 10 rounds (équilibre performance/sécurité)
   - Hash stocké en DB, jamais le mot de passe en clair

4. **Protection brute force** :

   - Délai de 1 seconde après échec de login
   - Messages d'erreur génériques

5. **Validation stricte** :
   - Minimum 8 caractères
   - Vérification type et présence

### Variables d'Environnement

```env
# .env.local
APP_SESSION_SECRET=your-32-character-random-secret
APP_PASSWORD=your-initial-password
```

⚠️ **IMPORTANT** :

- `APP_SESSION_SECRET` est requis pour signer les JWT
- `APP_PASSWORD` n'est utilisé que pour la doc, le vrai mot de passe est en DB
- Ne JAMAIS committer `.env.local`

## 📊 Flux d'Authentification

### Login

```
1. Utilisateur soumet le formulaire /login
   ↓
2. POST /api/auth/login { password }
   ↓
3. Récupération password_hash depuis DB (settings)
   ↓
4a. Si hash vide → Première connexion
    - Créer le hash avec bcrypt
    - Sauvegarder en DB
    - Créer la session
    ↓
4b. Si hash existe → Vérifier le mot de passe
    - bcrypt.compare(password, hash)
    - Si invalide → 401 + délai 1s
    - Si valide → Créer la session
    ↓
5. createSession()
   - Générer token JWT
   - Stocker dans cookie httpOnly
   ↓
6. Redirection vers /
```

### Navigation Protégée

```
1. Utilisateur accède à une page/API
   ↓
2. Middleware intercepte la requête
   ↓
3. Vérifier le cookie de session
   ↓
4. Vérifier le JWT (signature + expiration)
   ↓
5a. JWT valide → NextResponse.next()
   ↓
5b. JWT invalide/absent
    - Page web → Redirect /login
    - API → 401 Unauthorized
```

### Logout

```
1. Utilisateur clique "Déconnexion"
   ↓
2. POST /api/auth/logout
   ↓
3. deleteSession()
   - Supprime le cookie
   ↓
4. Redirection vers /login
```

## 🧪 Tests Manuels

### 1. Première Connexion

```bash
# Réinitialiser le password_hash dans Supabase
UPDATE settings SET value = '' WHERE key = 'password_hash';

# Tester le login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"test12345"}'

# Devrait retourner:
# { "success": true, "message": "Mot de passe défini et connexion réussie" }
```

### 2. Login Normal

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"test12345"}' \
  -c cookies.txt

# Vérifier que le cookie existe
cat cookies.txt
```

### 3. Route Protégée

```bash
# Sans cookie → 401
curl http://localhost:3000/api/fixtures/football

# Avec cookie → 200
curl http://localhost:3000/api/fixtures/football \
  -b cookies.txt
```

### 4. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt

# Vérifier que le cookie est supprimé
```

### 5. Changement de Mot de Passe

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "currentPassword":"test12345",
    "newPassword":"newpass123",
    "confirmPassword":"newpass123"
  }'
```

## 🐛 Debugging

### Vérifier la Session en DB

```sql
-- Supabase SQL Editor
SELECT value FROM settings WHERE key = 'password_hash';
```

### Logs Serveur

```typescript
// Activer les logs dans session.ts
console.log("Token créé:", token);
console.log("Payload:", payload);
```

### Cookies dans le Navigateur

```javascript
// Console DevTools
document.cookie;
// Devrait afficher: oddstracker-session=eyJ...
```

### JWT Decoder

Copier le token et décoder sur [jwt.io](https://jwt.io) pour inspecter le payload.

## ❓ FAQ

### Le mot de passe est-il stocké en clair ?

Non, seul le hash bcrypt est stocké en base de données.

### Peut-on avoir plusieurs utilisateurs ?

Non, l'application utilise un mot de passe unique partagé. Pour multi-utilisateurs, il faudrait modifier l'architecture.

### Combien de temps dure la session ?

24 heures (défini dans `SESSION_DURATION` dans `types/auth.ts`).

### Que se passe-t-il si on change APP_SESSION_SECRET ?

Toutes les sessions existantes deviennent invalides. Les utilisateurs devront se reconnecter.

### Comment réinitialiser le mot de passe ?

Depuis l'interface Supabase :

```sql
UPDATE settings SET value = '' WHERE key = 'password_hash';
```

Puis se connecter avec un nouveau mot de passe.

---

**Documentation mise à jour** : 2025-01-01
