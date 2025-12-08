# OddsTracker

Application Next.js 14 pour suivre et analyser les cotes sportives (Football, Hockey, Tennis, Volleyball) via Supabase et l’API OddsPapi.

## 🚀 Installation rapide

```bash
git clone <repository-url>
cd OddsTracker
npm install
cp .env.example .env.local
```

Remplir `.env.local` avec les clés Supabase, OddsPapi et les secrets d’app (cf. PROJECT_SPEC.md). Lancer :

```bash
npm run dev
```

## 🧱 Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Table v8
- Supabase (PostgreSQL) pour les données
- OddsPapi pour les cotes historiques
- Vercel (hébergement + cron quotidien)

## 📁 Structure

```
app/ (routes, API, pages dashboard)
components/ (auth, layout, tables, settings…)
lib/ (db queries, client OddsPapi, sync, export)
hooks/, types/, middleware.ts
```

## 🔐 Auth

- Mot de passe unique défini via `APP_PASSWORD`
- Session cookie HTTP-only (secret `APP_SESSION_SECRET`)
- Changement de mot de passe via la page Réglages

## 🔄 Synchronisation

- API OddsPapi (Pinnacle) via client `lib/api/oddspapi.ts`
- Import historique + sync quotidienne
- Cron Vercel (06:00) protégé par `CRON_SECRET`
- Logs enregistrés dans la table `sync_logs`

## 📊 Fonctionnalités clés

- Tableaux par sport avec filtres, colonnes dynamiques et colorisation gagnant/perdant
- Export CSV/XLSX respectant filtres/colonnes visibles
- Gestion des colonnes, favoris et filtres avancés
- Page Réglages : sync manuelle/auto, quota API, mot de passe, logs

## ☁️ Déploiement

1. Créer projet Supabase + exécuter `lib/db/migrations/001_initial_schema.sql`
2. Configurer les variables d’environnement sur Vercel
3. Déployer (`vercel` ou Git -> Vercel)
4. Cron et headers sont définis dans `vercel.json`

## 📄 Support

Consulter `PROJECT_SPEC.md` pour le cahier des charges complet. Pour toute question, contacter le développeur.
