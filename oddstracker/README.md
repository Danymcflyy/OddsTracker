# 🎯 OddsTracker

Tracker de cotes sportives Pinnacle avec historique.

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- VS Code (recommandé)

## 🚀 Installation

### 1. Ouvrir dans VS Code

```bash
# Extraire le projet
unzip oddstracker.zip
cd oddstracker

# Ouvrir dans VS Code
code .
```

### 2. Installer les dépendances

Ouvrir le terminal VS Code (`Ctrl+ù` ou `View > Terminal`) :

```bash
npm install
```

### 3. Configurer l'environnement

```bash
# Copier le fichier exemple
cp .env.example .env
```

Éditer `.env` et configurer :
- `ODDSPAPI_API_KEY` : Ta clé API OddsPapi
- `APP_PASSWORD` : Mot de passe pour l'app

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# Initialiser les données
npm run db:seed
```

### 5. Tester la connexion API

```bash
npm run test:api
```

## 📁 Structure du projet

```
oddstracker/
├── prisma/
│   └── schema.prisma      # Schéma de base de données
├── src/
│   ├── lib/
│   │   ├── api/           # Client API OddsPapi
│   │   │   ├── index.ts
│   │   │   └── oddspapi.ts
│   │   ├── db/            # Accès base de données
│   │   │   ├── index.ts
│   │   │   ├── prisma.ts
│   │   │   └── queries.ts
│   │   └── sync/          # Service de synchronisation
│   │       ├── index.ts
│   │       └── sync-service.ts
│   ├── scripts/           # Scripts utilitaires
│   │   ├── seed.ts
│   │   ├── sync-daily.ts
│   │   └── test-api.ts
│   └── types/
│       └── index.ts       # Types TypeScript
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run test:api` | Tester la connexion API OddsPapi |
| `npm run db:generate` | Générer le client Prisma |
| `npm run db:push` | Créer/mettre à jour les tables |
| `npm run db:seed` | Initialiser les données |
| `npm run db:studio` | Ouvrir Prisma Studio (interface DB) |
| `npm run sync:daily` | Synchroniser les cotes actuelles |
| `npm run dev` | Lancer l'app Next.js (à venir) |

## 🔧 Configuration VS Code recommandée

### Extensions à installer

1. **Prisma** - Coloration syntaxique pour schema.prisma
2. **ESLint** - Linting JavaScript/TypeScript
3. **Prettier** - Formatage de code

### Settings.json

Ajouter dans `.vscode/settings.json` :

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

## 📊 Base de données

### Modèles principaux

- **Sport** : Football, Hockey, Tennis, Volleyball
- **League** : Premier League, NHL, Roland Garros...
- **Team** : Équipes/joueurs
- **Fixture** : Matchs avec date, score, statut
- **Odds** : Cotes Pinnacle (Opening/Closing)

### Visualiser les données

```bash
npm run db:studio
```

Ouvre une interface web sur http://localhost:5555

## 🔄 Synchronisation

### Sync quotidienne

```bash
npm run sync:daily
```

Récupère les cotes actuelles pour tous les sports/ligues configurés.

### Sports configurés

- ⚽ Football : 10 ligues (EPL, Liga, Bundesliga...)
- 🏒 Hockey : 3 ligues (NHL, SHL, Liiga)
- 🎾 Tennis : 4 Grand Slams
- 🏐 Volleyball : 2 ligues

## ⚠️ Limites API

| Plan | Requêtes/mois | Usage |
|------|---------------|-------|
| Gratuit | 200 | Tests uniquement |
| Custom | Illimité | Production |

La sync quotidienne utilise environ **20-40 requêtes** par exécution.

## 🐛 Dépannage

### "API_KEY non configurée"

Vérifier que `.env` contient ta vraie clé API.

### "Cannot find module '@prisma/client'"

```bash
npm run db:generate
```

### Erreurs de base de données

```bash
# Recréer la DB depuis zéro
rm prisma/dev.db
npm run db:push
npm run db:seed
```

## 📝 Prochaines étapes

1. ✅ Connexion API fonctionnelle
2. ✅ Base de données configurée
3. ⏳ Interface web (Next.js)
4. ⏳ Export CSV/XLSX
5. ⏳ Filtres et recherche
6. ⏳ Historique complet

## 📞 Support

Questions ? Ouvre une issue ou contacte le développeur.
