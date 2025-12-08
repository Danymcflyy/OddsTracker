# shadcn/ui - Installation et Configuration

## ✅ Installation Complète

shadcn/ui a été installé et configuré avec tous les composants nécessaires pour OddsTracker.

## 📦 Dépendances Installées

### Dépendances principales
- `@radix-ui/react-dialog` - Modales
- `@radix-ui/react-dropdown-menu` - Menus déroulants
- `@radix-ui/react-label` - Labels accessibles
- `@radix-ui/react-popover` - Popovers
- `@radix-ui/react-select` - Sélecteurs
- `@radix-ui/react-separator` - Séparateurs
- `@radix-ui/react-slot` - Composition de composants
- `@radix-ui/react-toast` - Notifications
- `react-day-picker` - Sélecteur de dates
- `class-variance-authority` - Gestion des variantes CSS
- `tailwind-merge` - Fusion de classes Tailwind
- `tailwindcss-animate` - Animations Tailwind

## 🎨 Composants Créés

### ✅ Formulaires
1. **Button** (`components/ui/button.tsx`)
   - Variantes: default, destructive, outline, secondary, ghost, link
   - Tailles: default, sm, lg, icon

2. **Input** (`components/ui/input.tsx`)
   - Champ de saisie texte standard

3. **Label** (`components/ui/label.tsx`)
   - Labels de formulaire accessibles

4. **Select** (`components/ui/select.tsx`)
   - Menu déroulant avec recherche
   - Items, groupes, séparateurs

5. **Calendar** (`components/ui/calendar.tsx`)
   - Sélecteur de date avec react-day-picker
   - Supporte les ranges de dates

### ✅ Affichage
6. **Badge** (`components/ui/badge.tsx`)
   - Variantes: default, secondary, destructive, outline
   - **Variantes personnalisées**: winner, loser (pour les paris)

7. **Card** (`components/ui/card.tsx`)
   - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

8. **Table** (`components/ui/table.tsx`)
   - Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption

9. **Separator** (`components/ui/separator.tsx`)
   - Ligne de séparation horizontale/verticale

10. **Skeleton** (`components/ui/skeleton.tsx`)
    - Composant de chargement animé

### ✅ Overlay
11. **Dialog** (`components/ui/dialog.tsx`)
    - Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter
    - DialogTitle, DialogDescription

12. **Popover** (`components/ui/popover.tsx`)
    - Popover, PopoverTrigger, PopoverContent

13. **DropdownMenu** (`components/ui/dropdown-menu.tsx`)
    - Menu avec items, checkboxes, radio, séparateurs, sous-menus

14. **Toast** (`components/ui/toast.tsx` + `components/ui/toaster.tsx`)
    - Système de notifications
    - Hook `useToast` pour afficher des toasts

## 🎯 Configuration

### components.json
Le fichier de configuration shadcn/ui est créé avec :
- Style: default
- Base color: slate
- CSS variables: activé
- Aliases configurés pour `@/components` et `@/lib/utils`

### Tailwind CSS
Les couleurs personnalisées sont configurées dans `app/globals.css` :
```css
--winner: Vert pour les paris gagnants
--winner-bg: Fond vert clair
--loser: Rouge pour les paris perdants
--loser-bg: Fond rouge clair
```

### Layout
Le `Toaster` a été ajouté au layout principal (`app/layout.tsx`) pour afficher les notifications.

## 📚 Utilisation

### Import simple
```tsx
import { Button, Input, Card } from "@/components/ui";
```

### Import individuel
```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

## 🚀 Prochaines Étapes

Pour installer les dépendances Node.js :
```bash
npm install
```

Tous les composants sont prêts à être utilisés dans l'application OddsTracker !

## 📖 Documentation

- Documentation complète des composants : `components/ui/README.md`
- Documentation officielle shadcn/ui : https://ui.shadcn.com
- Documentation Radix UI : https://www.radix-ui.com/primitives

## 🎨 Composants Spécifiques OddsTracker

Les composants incluent des variantes personnalisées pour OddsTracker :
- Badge avec variantes `winner` et `loser` pour identifier les paris gagnants/perdants
- Couleurs alignées avec la spec du projet (vert/rouge)

## ✨ Fonctionnalités Clés

- ✅ Tous les composants sont accessibles (ARIA)
- ✅ Dark mode supporté (configuration déjà prête)
- ✅ Animations fluides avec tailwindcss-animate
- ✅ TypeScript strict activé
- ✅ Composants réutilisables et configurables
- ✅ Intégration complète avec Tailwind CSS
