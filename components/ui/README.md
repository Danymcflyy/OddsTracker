# Composants UI - shadcn/ui

Ce dossier contient tous les composants UI basés sur shadcn/ui, configurés pour OddsTracker.

## Composants Disponibles

### Formulaires
- **Button** - Bouton avec variantes (default, destructive, outline, secondary, ghost, link) et tailles
- **Input** - Champ de saisie texte
- **Label** - Libellé de formulaire accessible
- **Select** - Menu déroulant avec recherche
- **Calendar** - Sélecteur de date avec react-day-picker

### Affichage
- **Badge** - Badge coloré avec variantes (default, secondary, destructive, outline, winner, loser)
- **Card** - Carte avec Header, Title, Description, Content et Footer
- **Table** - Tableau HTML stylisé avec Header, Body, Row, Cell
- **Separator** - Ligne de séparation horizontale ou verticale
- **Skeleton** - Composant de chargement animé

### Overlay
- **Dialog** - Modale avec Header, Title, Description, Footer
- **Popover** - Menu contextuel positionné
- **DropdownMenu** - Menu déroulant avec items, séparateurs, checkboxes
- **Toast** - Notifications avec Toaster provider

## Utilisation

### Import des composants

```tsx
// Import individuel
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Ou import groupé depuis l'index
import { Button, Input, Card } from "@/components/ui";
```

### Exemples

#### Button

```tsx
<Button variant="default">Bouton principal</Button>
<Button variant="outline" size="sm">Petit bouton</Button>
<Button variant="destructive">Supprimer</Button>
<Button variant="ghost">Discret</Button>
```

#### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu de la carte
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Ouvrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titre</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <div>Contenu</div>
    <DialogFooter>
      <Button>Confirmer</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Toast

```tsx
import { useToast } from "@/hooks/use-toast";

function Component() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "Succès",
          description: "L'opération s'est bien déroulée",
        });
      }}
    >
      Afficher toast
    </Button>
  );
}
```

#### Select

```tsx
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Sélectionner" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
    <SelectItem value="3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

#### Badge avec variantes winner/loser

```tsx
<Badge variant="winner">Gagné</Badge>
<Badge variant="loser">Perdu</Badge>
```

## Variantes de couleurs personnalisées

Les composants utilisent les couleurs définies dans [globals.css](../../app/globals.css) :

- **winner** - Vert pour les paris gagnants
- **loser** - Rouge pour les paris perdants

Ces variantes sont disponibles dans Badge et peuvent être étendues aux autres composants.

## Dépendances

Tous les composants utilisent :
- **@radix-ui** - Primitives UI accessibles
- **class-variance-authority** - Gestion des variantes CSS
- **tailwind-merge** - Fusion de classes Tailwind
- **lucide-react** - Icônes

## Documentation officielle

Pour plus d'informations sur les composants et leurs props :
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
