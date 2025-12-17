# 🏠 Configuration Localhost - OddsTracker

## 🎯 Architecture Finale

Votre système fonctionne maintenant de cette façon:

```
┌─────────────────────────────────────────┐
│  GitHub Actions (Cloud - Automatique)  │
│  ✅ S'exécute toutes les 10 minutes    │
│  ✅ Indépendant de votre PC            │
│  ✅ Timeout: 6 heures                  │
│                                         │
│  1. npm install                         │
│  2. Charge les secrets GitHub          │
│  3. Execute: npx tsx scripts/...       │
│  4. Écrit directement dans Supabase    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│        Supabase (Cloud)                 │
│  ✅ Base de données PostgreSQL          │
│  ✅ Source de vérité unique             │
│  ✅ Toujours accessible                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   Next.js App (Localhost)               │
│  ✅ Interface UI seulement              │
│  ✅ Lecture de Supabase                 │
│  ✅ npm run dev                         │
│  ✅ http://localhost:3000               │
└─────────────────────────────────────────┘
```

## 🚀 Démarrage du projet en local

### 1. Prérequis

- Node.js 20+ installé
- Fichier `.env.local` configuré avec vos clés

### 2. Installation

```bash
cd /Users/perso/Desktop/OddsTracker
npm install
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez: http://localhost:3000

## 📋 Variables d'environnement requises

Créez/vérifiez votre fichier `.env.local`:

```bash
# Supabase (Base de données Cloud)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Odds-API.io (Source des cotes)
ODDS_API_IO_KEY=xxxxxxxxxxxxxxxx
```

## 🤖 Automatisation (GitHub Actions)

### Comment ça fonctionne

1. **Toutes les 10 minutes**: GitHub Actions se déclenche automatiquement
2. **Indépendant de votre PC**: Fonctionne même si votre machine est éteinte
3. **Écrit dans Supabase**: Les données sont synchronisées dans le cloud
4. **Vous consultez les données**: Via votre interface localhost

### Vérifier que l'automatisation fonctionne

Allez sur: https://github.com/Danymcflyy/OddsTracker/actions

Vous devriez voir des exécutions régulières du workflow "Sync Odds Direct (GitHub Actions)".

## 🔧 Scripts disponibles

### Développement local

```bash
# Lancer le serveur de développement
npm run dev

# Build de production (test local)
npm run build
npm start
```

### Scripts de synchronisation manuelle

```bash
# Synchroniser manuellement les matchs et cotes
npx tsx scripts/github-actions-sync.ts

# Tester le système batch
npx tsx scripts/test-batched-odds.ts
```

## 📊 Workflow des données

```
1. GitHub Actions (toutes les 10 min)
   ↓
   Appelle Odds-API.io
   ↓
   Écrit dans Supabase
   ↓
2. Votre localhost (Next.js)
   ↓
   Lit depuis Supabase
   ↓
   Affiche dans l'UI
```

## ⚠️ Ce qui a changé vs Vercel

| Aspect | Avant (Vercel) | Maintenant (Localhost) |
|--------|---------------|----------------------|
| **Hébergement UI** | Vercel Cloud | Localhost |
| **Synchronisation** | Vercel Cron (60s max) | GitHub Actions (6h max) |
| **Base de données** | Supabase | Supabase (inchangé) |
| **Timeout** | 60 secondes ❌ | 6 heures ✅ |
| **Scalabilité** | 1-2 ligues | 10+ ligues ✅ |
| **Accessibilité** | Public (URL) | Local uniquement |

## 🔒 Sécurité

### Secrets GitHub Actions

Les variables d'environnement sensibles sont stockées dans GitHub Secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ODDS_API_IO_KEY`

Ces secrets sont **privés** et jamais exposés dans le code.

### Fichier .env.local

⚠️ **Ne JAMAIS commiter** le fichier `.env.local` (déjà dans `.gitignore`)

## 🐛 Troubleshooting

### "Cannot find module @supabase/supabase-js"

```bash
npm install
```

### "NEXT_PUBLIC_SUPABASE_URL is not defined"

Vérifiez que votre `.env.local` contient toutes les variables requises.

### Le site ne démarre pas

```bash
# Nettoyer et réinstaller
rm -rf .next node_modules
npm install
npm run dev
```

### Les données ne se mettent pas à jour

1. Vérifiez que GitHub Actions fonctionne: https://github.com/Danymcflyy/OddsTracker/actions
2. Vérifiez les secrets GitHub: https://github.com/Danymcflyy/OddsTracker/settings/secrets/actions
3. Rafraîchissez la page localhost (Ctrl+R ou Cmd+R)

## 📱 Accès depuis d'autres appareils

Le site localhost n'est accessible QUE depuis votre machine.

**Pour y accéder depuis un autre appareil sur votre réseau local:**

1. Trouvez votre IP locale:
   ```bash
   # Mac/Linux
   ifconfig | grep inet

   # Windows
   ipconfig
   ```

2. Lancez Next.js sur toutes les interfaces:
   ```bash
   npm run dev -- -H 0.0.0.0
   ```

3. Accédez depuis l'autre appareil:
   ```
   http://[VOTRE_IP_LOCALE]:3000
   ```

## ✅ Avantages de cette architecture

1. **Pas de coût d'hébergement** (Vercel gratuit non utilisé)
2. **Pas de limite de timeout** (6h vs 60s)
3. **Scalable** (10+ ligues sans problème)
4. **Indépendant** (GitHub Actions tourne même si votre PC est éteint)
5. **Simple** (npm run dev et c'est parti)

## 🎯 Ce que vous NE devez PLUS faire

- ❌ Déployer sur Vercel
- ❌ Utiliser vercel.json
- ❌ Configurer Vercel Cron
- ❌ S'inquiéter du timeout de 60 secondes

## 🎯 Ce que vous devez faire

- ✅ Lancer `npm run dev` pour travailler localement
- ✅ Vérifier GitHub Actions régulièrement
- ✅ Toutes les données sont dans Supabase (accessible partout)
- ✅ Ajouter des ligues dans `/settings/leagues` quand vous voulez

## 📚 Prochaines étapes

1. ✅ Système fonctionnel (déjà fait!)
2. Personnaliser les filtres et colonnes dans l'UI
3. Ajouter d'autres ligues (Ligue 1, La Liga, etc.)
4. Profiter du système sans limite de timeout!
