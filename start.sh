#!/bin/bash

# Script de démarrage OddsTracker (Localhost)
# Usage: ./start.sh

echo "🚀 Démarrage OddsTracker..."
echo ""

# Vérifier que .env.local existe
if [ ! -f .env.local ]; then
    echo "❌ Erreur: .env.local manquant!"
    echo "   Créez le fichier .env.local avec vos clés:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - ODDS_API_IO_KEY"
    exit 1
fi

# Vérifier que node_modules existe
if [ ! -d node_modules ]; then
    echo "📦 Installation des dépendances..."
    npm install
    echo ""
fi

# Lancer le serveur de développement
echo "✅ Configuration OK"
echo "🌐 Lancement du serveur sur http://localhost:3000"
echo ""
echo "📊 GitHub Actions synchronise les données automatiquement toutes les 10 minutes"
echo "🔗 Vérifiez: https://github.com/Danymcflyy/OddsTracker/actions"
echo ""
echo "Press Ctrl+C pour arrêter"
echo ""

npm run dev
