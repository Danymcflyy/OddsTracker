#!/usr/bin/env node

/**
 * Script de configuration des variables d'environnement
 * Génère un fichier .env.local avec des secrets aléatoires
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envLocalPath = path.join(__dirname, '..', '.env.local');
const envExamplePath = path.join(__dirname, '..', '.env.example');

console.log('🔧 Configuration des variables d\'environnement...\n');

// Générer un secret aléatoire
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Lire le template
let template = fs.readFileSync(envExamplePath, 'utf-8');

// Générer les secrets
const sessionSecret = generateSecret(32);
const cronSecret = generateSecret(32);

console.log('✅ Secrets générés :');
console.log(`   APP_SESSION_SECRET: ${sessionSecret.substring(0, 16)}...`);
console.log(`   CRON_SECRET: ${cronSecret.substring(0, 16)}...`);
console.log('');

// Créer le contenu du fichier
const content = `# OddsTracker - Variables d'Environnement Locales
# Généré automatiquement le ${new Date().toLocaleString('fr-FR')}

# ============================================
# APPLICATION
# ============================================
# Mot de passe pour accéder à l'application (minimum 8 caractères)
APP_PASSWORD=changeme123

# Secret pour les sessions JWT (32 caractères aléatoires)
APP_SESSION_SECRET=${sessionSecret}

# ============================================
# SUPABASE
# ============================================
# URL de votre projet Supabase (depuis Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Clé anonyme/publique (depuis Settings > API > Project API keys > anon public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx

# Clé service role (depuis Settings > API > Project API keys > service_role)
# ⚠️ CONFIDENTIEL - Ne jamais exposer côté client
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx

# ============================================
# ODDSPAPI API
# ============================================
# Votre clé API OddsPapi
ODDSPAPI_API_KEY=votre_cle_api

# URL de base de l'API (ne pas modifier sauf indication contraire)
ODDSPAPI_BASE_URL=https://api.oddspapi.io

# ============================================
# VERCEL CRON
# ============================================
# Secret pour sécuriser le endpoint de cron
CRON_SECRET=${cronSecret}

# ============================================
# ENVIRONNEMENT (optionnel)
# ============================================
NODE_ENV=development
`;

// Vérifier si .env.local existe déjà
if (fs.existsSync(envLocalPath)) {
  console.log('⚠️  Le fichier .env.local existe déjà.');
  console.log('   Voulez-vous le remplacer ? (Ctrl+C pour annuler)');
  console.log('');

  // Attendre 3 secondes avant de continuer
  setTimeout(() => {
    fs.writeFileSync(envLocalPath, content);
    console.log('✅ Fichier .env.local mis à jour !');
    printNextSteps();
  }, 3000);
} else {
  fs.writeFileSync(envLocalPath, content);
  console.log('✅ Fichier .env.local créé !');
  printNextSteps();
}

function printNextSteps() {
  console.log('');
  console.log('📋 Prochaines étapes :');
  console.log('');
  console.log('1. Éditer .env.local et remplir les valeurs manquantes :');
  console.log('   - APP_PASSWORD (changez "changeme123")');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL');
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  console.log('   - ODDSPAPI_API_KEY');
  console.log('');
  console.log('2. Suivre le guide SUPABASE_SETUP.md pour configurer Supabase');
  console.log('');
  console.log('3. Installer les dépendances et démarrer :');
  console.log('   npm install');
  console.log('   npm run dev');
  console.log('');
  console.log('🎉 C\'est tout ! Bon développement !');
}
