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

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "📦 Node.js n'est pas installé sur votre système"
    echo "🔄 Installation automatique de Node.js..."
    echo ""

    # Télécharger l'installateur Node.js LTS pour macOS
    echo "⬇️  Téléchargement de Node.js (version LTS)..."
    curl -o /tmp/node-installer.pkg https://nodejs.org/dist/v20.11.0/node-v20.11.0.pkg

    if [ $? -eq 0 ]; then
        echo "📦 Installation de Node.js (mot de passe administrateur requis)..."
        sudo installer -pkg /tmp/node-installer.pkg -target /

        if [ $? -eq 0 ]; then
            echo "✅ Node.js installé avec succès!"
            rm /tmp/node-installer.pkg
        else
            echo "❌ Erreur lors de l'installation de Node.js"
            echo "Veuillez installer Node.js manuellement depuis https://nodejs.org"
            echo "Appuyez sur une touche pour fermer..."
            read -n 1
            exit 1
        fi
    else
        echo "❌ Erreur lors du téléchargement de Node.js"
        echo "Veuillez installer Node.js manuellement depuis https://nodejs.org"
        echo "Appuyez sur une touche pour fermer..."
        read -n 1
        exit 1
    fi
    echo ""
fi

# Afficher la version de Node.js installée
NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION détecté"
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

# Lancer le serveur en arrière-plan
npm run dev &
SERVER_PID=$!

# Attendre que le serveur démarre (8 secondes)
echo "⏳ Démarrage en cours..."
sleep 8

# Ouvrir automatiquement le navigateur
echo "🌐 Ouverture du navigateur..."
open http://localhost:3000

# Attendre que le serveur se termine
wait $SERVER_PID

# Si le serveur s'arrête
echo ""
echo "🛑 Serveur arrêté"
echo "Appuyez sur une touche pour fermer cette fenêtre..."
read -n 1
