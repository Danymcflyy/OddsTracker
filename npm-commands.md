# Commandes npm Utiles - OddsTracker

## 📦 Installation

```bash
# Installer toutes les dépendances
npm install

# Installer une dépendance de production
npm install <package-name>

# Installer une dépendance de développement
npm install -D <package-name>
```

## 🔒 Sécurité

```bash
# Vérifier les vulnérabilités
npm audit

# Rapport détaillé JSON
npm audit --json

# Corriger automatiquement
npm audit fix

# Forcer les corrections (peut inclure des breaking changes)
npm audit fix --force

# Vérifier les packages obsolètes
npm outdated
```

## 🚀 Développement

```bash
# Lancer le serveur de développement
npm run dev

# Build de production
npm run build

# Démarrer en mode production
npm start

# Lancer le linter
npm run lint
```

## 🧹 Nettoyage

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache npm
npm cache clean --force

# Vérifier l'intégrité des packages
npm ci
```

## 📊 Informations

```bash
# Version de npm
npm --version

# Version de Node.js
node --version

# Liste des packages installés
npm list

# Liste niveau 0 (sans les dépendances des dépendances)
npm list --depth=0

# Informations sur un package
npm info <package-name>

# Voir les scripts disponibles
npm run
```

## 🔄 Mises à Jour

```bash
# Mettre à jour un package spécifique
npm update <package-name>

# Mettre à jour tous les packages
npm update

# Installer la dernière version d'un package
npm install <package-name>@latest

# Vérifier les nouvelles versions disponibles
npm outdated
```

## 🎯 Commandes Spécifiques OddsTracker

```bash
# Installation complète
npm install

# Vérification de sécurité (doit afficher 0 vulnérabilités)
npm audit

# Lancer en développement
npm run dev

# Build pour production
npm run build

# Vérifier le code avec ESLint
npm run lint
```

## ⚠️ Résolution de Problèmes

### Erreur de dépendances

```bash
# 1. Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# 2. Nettoyer le cache npm
npm cache clean --force

# 3. Réinstaller
npm install
```

### Erreur de TypeScript

```bash
# Vérifier la version de TypeScript
npx tsc --version

# Vérifier la configuration
cat tsconfig.json
```

### Erreur de Build

```bash
# Nettoyer le cache Next.js
rm -rf .next

# Rebuild
npm run build
```

## 🔐 Audit de Sécurité Actuel

Après le remplacement de `xlsx` par `exceljs`, le projet devrait afficher :

```bash
npm audit
# found 0 vulnerabilities
```

Si vous voyez encore des vulnérabilités, consultez [SECURITY_FIXES.md](SECURITY_FIXES.md).

## 📚 Ressources

- [Documentation npm](https://docs.npmjs.com/)
- [npm CLI Commands](https://docs.npmjs.com/cli/v9/commands)
- [Next.js CLI](https://nextjs.org/docs/app/api-reference/next-cli)

## 💡 Conseils

1. **Toujours vérifier npm audit avant de déployer**
   ```bash
   npm audit
   ```

2. **Garder les dépendances à jour**
   ```bash
   npm outdated
   npm update
   ```

3. **Utiliser npm ci en CI/CD** (plus rapide et déterministe)
   ```bash
   npm ci
   ```

4. **Vérifier la compatibilité Node.js**
   ```bash
   node --version  # Doit être >= 18
   ```

5. **Utiliser les lock files** (package-lock.json)
   - Ne jamais le supprimer sauf pour résoudre des problèmes
   - Le commit dans Git pour garantir la cohérence
