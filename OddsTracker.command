#!/bin/bash

# OddsTracker Launcher pour macOS
# Double-cliquer sur ce fichier pour lancer l'application

# Obtenir le chemin du dossier où se trouve ce script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Aller dans le dossier du projet
cd "$SCRIPT_DIR"

# Afficher le titre
echo "╔═══════════════════════════════════════╗"
echo "║       🎯 OddsTracker v2.0            ║"
echo "║   Application de suivi de cotes      ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Vérifier que .env.local existe
if [ ! -f .env.local ]; then
    echo "❌ Erreur: Fichier .env.local manquant!"
    echo ""
    echo "Veuillez créer le fichier .env.local avec:"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - ODDS_API_IO_KEY"
    echo ""
    echo "Appuyez sur une touche pour fermer..."
    read -n 1
    exit 1
fi

# Vérifier que node_modules existe
if [ ! -d node_modules ]; then
    echo "📦 Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Erreur lors de l'installation des dépendances"
        echo "Appuyez sur une touche pour fermer..."
        read -n 1
        exit 1
    fi
    echo ""
fi

# Informations
echo "✅ Configuration OK"
echo "🌐 Démarrage du serveur..."
echo ""
echo "📍 L'application sera accessible sur: http://localhost:3000"
echo "📊 Synchronisation automatique via GitHub Actions (toutes les 10 min)"
echo ""
echo "⚠️  NE PAS FERMER cette fenêtre tant que vous utilisez l'application"
echo "⛔ Pour arrêter: Appuyez sur Ctrl+C dans cette fenêtre"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Lancer le serveur
npm run dev

# Si le serveur s'arrête
echo ""
echo "🛑 Serveur arrêté"
echo "Appuyez sur une touche pour fermer cette fenêtre..."
read -n 1
