#!/bin/bash

echo "📦 Création du ZIP client pour OddsTracker..."
echo ""

# Vérifier que .env.local existe
if [ ! -f .env.local ]; then
    echo "❌ ERREUR: .env.local manquant!"
    echo "Le fichier .env.local doit être présent pour le client"
    exit 1
fi

# Nom du fichier ZIP
ZIP_NAME="OddsTracker-Client-$(date +%Y%m%d).zip"

# Créer le ZIP en excluant les dossiers inutiles
echo "🗜️  Compression en cours..."
zip -r "../$ZIP_NAME" . \
    -x "*.git/*" \
    -x "node_modules/*" \
    -x ".next/*" \
    -x "*.DS_Store" \
    -x "create-client-zip.sh" \
    -x "*.log" \
    -x "recap_cron_vercel_github_nex.textClipping" \
    -q

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ZIP créé avec succès!"
    echo "📍 Emplacement: /Users/perso/Desktop/$ZIP_NAME"
    echo ""
    
    # Afficher la taille
    SIZE=$(du -h "../$ZIP_NAME" | cut -f1)
    echo "📊 Taille: $SIZE"
    echo ""
    echo "🚀 Prêt à envoyer au client!"
else
    echo "❌ Erreur lors de la création du ZIP"
    exit 1
fi
