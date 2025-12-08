# 🔐 Composants d'Authentification

Composants React pour l'authentification dans OddsTracker.

## 📁 Fichiers

```
components/auth/
├── login-form.tsx      ← Formulaire de connexion
└── README.md           ← Ce fichier
```

## 🎨 LoginForm

Formulaire de connexion avec validation et gestion d'état.

### Utilisation

```tsx
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
```

### Fonctionnalités

- ✅ Validation côté client (minimum 8 caractères)
- ✅ Affichage des erreurs
- ✅ État de chargement (loading)
- ✅ Redirection automatique après connexion
- ✅ Support de la première connexion (définition du mot de passe)
- ✅ Accessibilité (labels, autofocus)
- ✅ Responsive

### Props

Aucune prop - Le composant gère son état interne.

### État interne

```typescript
const [password, setPassword] = useState("");        // Mot de passe saisi
const [error, setError] = useState("");              // Message d'erreur
const [isLoading, setIsLoading] = useState(false);   // État de chargement
```

### Validation

1. **Champ requis** : Le mot de passe ne doit pas être vide
2. **Longueur minimale** : 8 caractères minimum

### Flux

```
1. Utilisateur saisit le mot de passe
   ↓
2. Validation côté client
   ↓
3. POST /api/auth/login
   ↓
4a. Succès (200)
    - Redirection vers /
    - router.refresh() pour mettre à jour l'état
   ↓
4b. Erreur (401, 400, 500)
    - Affichage du message d'erreur
    - Focus reste sur le champ
```

### Messages d'erreur

| Code | Message                                                |
| ---- | ------------------------------------------------------ |
| 400  | "Le mot de passe doit contenir au moins 8 caractères" |
| 401  | "Mot de passe incorrect"                               |
| 500  | "Erreur lors de la connexion"                          |
| -    | "Erreur de connexion au serveur" (catch)               |

### Exemple de réponse API

```typescript
// Succès
{
  "success": true,
  "message": "Connexion réussie"
}

// Erreur
{
  "success": false,
  "error": "Mot de passe incorrect"
}
```

## 🎨 Page de Login

La page de login ([app/(auth)/login/page.tsx](../../app/(auth)/login/page.tsx)) utilise le composant LoginForm.

### Structure

```tsx
<div className="min-h-screen flex items-center justify-center">
  {/* Logo OddsTracker */}
  <div className="text-center mb-8">
    <svg>...</svg>
    <h1>OddsTracker</h1>
    <p>Analyse des cotes sportives Pinnacle</p>
  </div>

  {/* Carte de connexion */}
  <Card>
    <CardHeader>
      <CardTitle>Connexion</CardTitle>
      <CardDescription>...</CardDescription>
    </CardHeader>
    <CardContent>
      <LoginForm />
    </CardContent>
  </Card>

  {/* Footer */}
  <div>
    <p>OddsTracker - Suivi des cotes Opening/Closing</p>
    <p>Football • Hockey • Tennis • Volleyball</p>
  </div>
</div>
```

### Design

- **Fond** : Dégradé subtle (slate-50 → slate-100)
- **Logo** : Icône de graphique (bars chart)
- **Carte** : Centrée avec shadow-lg
- **Responsive** : Padding de 4 (1rem) sur mobile
- **Dark mode** : Supporté via Tailwind

### Accessibilité

- ✅ Autofocus sur le champ de mot de passe
- ✅ Labels associés aux inputs
- ✅ Messages d'erreur clairs
- ✅ États de chargement visibles
- ✅ Contraste suffisant

## 🎨 Styles

### Composants shadcn/ui utilisés

- **Button** : Bouton de soumission avec état de chargement
- **Input** : Champ de mot de passe
- **Label** : Label du champ
- **Card** : Carte englobante
- **CardHeader, CardTitle, CardDescription** : En-tête de la carte
- **CardContent** : Contenu de la carte

### Classes Tailwind personnalisées

```css
/* Fond dégradé */
bg-gradient-to-br from-slate-50 to-slate-100

/* Logo container */
w-16 h-16 rounded-2xl bg-primary/10

/* Erreur */
rounded-md bg-destructive/10 p-3 text-sm text-destructive
```

## 🔧 Personnalisation

### Changer le logo

Remplacer le SVG dans `app/(auth)/login/page.tsx` :

```tsx
<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
  {/* Votre logo ici */}
  <img src="/logo.svg" alt="Logo" className="w-10 h-10" />
</div>
```

### Changer les couleurs

Modifier dans `app/globals.css` :

```css
:root {
  --primary: 222.2 47.4% 11.2%; /* Couleur principale */
  --destructive: 0 84.2% 60.2%; /* Couleur d'erreur */
}
```

### Ajouter un message personnalisé

```tsx
<CardDescription className="text-center">
  Votre message personnalisé ici
</CardDescription>
```

## 🧪 Tests

### Test manuel

1. Ouvrir `http://localhost:3000/login`
2. Essayer de soumettre sans mot de passe → Erreur "Le mot de passe est requis"
3. Essayer avec "test" → Erreur "Le mot de passe doit contenir au moins 8 caractères"
4. Essayer avec "wrongpassword" → Erreur "Mot de passe incorrect" (401)
5. Essayer avec le bon mot de passe → Redirection vers `/`

### Test avec curl

```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"test12345"}' \
  -c cookies.txt

# Vérifier le cookie
cat cookies.txt
```

## 🐛 Debugging

### Le formulaire ne se soumet pas

Vérifier la console navigateur pour les erreurs JavaScript.

### Erreur "Erreur de connexion au serveur"

- Vérifier que le serveur Next.js est démarré (`npm run dev`)
- Vérifier que l'API route `/api/auth/login` existe

### Redirection ne fonctionne pas

Vérifier que `router.push("/")` et `router.refresh()` sont appelés après succès.

### Cookie non défini

Vérifier que l'API route appelle `createSession()` après validation du mot de passe.

## 📚 Ressources

- [API Route Login](../../app/api/auth/login/route.ts)
- [Types Auth](../../types/auth.ts)
- [Session Manager](../../lib/auth/session.ts)
- [shadcn/ui Button](../ui/button.tsx)
- [shadcn/ui Input](../ui/input.tsx)
- [shadcn/ui Card](../ui/card.tsx)

---

**Dernière mise à jour** : 2025-01-01
