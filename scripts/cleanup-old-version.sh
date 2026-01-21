#!/bin/bash

# Script de nettoyage - Suppression des fichiers obsolètes de l'ancienne version
# ATTENTION : Ce script supprime définitivement les fichiers

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  🧹 Nettoyage des fichiers obsolètes (ancienne version)  ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Confirmation
read -p "⚠️  Cette action est IRRÉVERSIBLE. Continuer ? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Nettoyage annulé"
    exit 0
fi

echo ""
echo "🗑️  Suppression des fichiers obsolètes..."
echo ""

# Compteur
DELETED=0

# 1. Ancien client API
if [ -d "lib/api/oddsapi" ]; then
    echo "  - Suppression lib/api/oddsapi/"
    rm -rf lib/api/oddsapi/
    ((DELETED++))
fi

# 2. API v3
if [ -d "lib/api/v3" ]; then
    echo "  - Suppression lib/api/v3/"
    rm -rf lib/api/v3/
    ((DELETED++))
fi

# 3. OddsAPI utils
if [ -f "lib/api/oddspapi.ts" ]; then
    echo "  - Suppression lib/api/oddspapi.ts"
    rm -f lib/api/oddspapi.ts
    ((DELETED++))
fi

if [ -d "lib/oddspapi" ]; then
    echo "  - Suppression lib/oddspapi/"
    rm -rf lib/oddspapi/
    ((DELETED++))
fi

# 4. Anciennes queries
if [ -d "lib/db/queries" ]; then
    echo "  - Suppression lib/db/queries/"
    rm -rf lib/db/queries/
    ((DELETED++))
fi

# 5. Services de sync anciens
if [ -d "lib/sync" ]; then
    echo "  - Suppression lib/sync/"
    rm -rf lib/sync/
    ((DELETED++))
fi

# 6. Configurations anciennes
if [ -d "lib/config" ]; then
    echo "  - Suppression lib/config/"
    rm -rf lib/config/
    ((DELETED++))
fi

# 7. Settings anciens
if [ -d "lib/settings" ]; then
    echo "  - Suppression lib/settings/"
    rm -rf lib/settings/
    ((DELETED++))
fi

# 8. Import/Export (optionnel - commenté par défaut)
# if [ -d "lib/import" ]; then
#     echo "  - Suppression lib/import/"
#     rm -rf lib/import/
#     ((DELETED++))
# fi

# if [ -d "lib/export" ]; then
#     echo "  - Suppression lib/export/"
#     rm -rf lib/export/
#     ((DELETED++))
# fi

# 9. Anciens workflows GitHub Actions
if [ -d ".github/workflows" ]; then
    echo "  - Suppression des anciens workflows..."
    rm -f .github/workflows/sync-v1-*.yml
    rm -f .github/workflows/sync-v2-*.yml
    rm -f .github/workflows/sync-leagues-*.yml
    ((DELETED++))
fi

# 10. Anciens fichiers types
if [ -f "lib/api/types.ts" ]; then
    # Vérifier si c'est l'ancienne version (contient 'OddsApiFixture' par exemple)
    if grep -q "OddsApiFixture" lib/api/types.ts 2>/dev/null; then
        echo "  - Suppression lib/api/types.ts (ancienne version)"
        rm -f lib/api/types.ts
        ((DELETED++))
    fi
fi

# 11. Routes API v3
if [ -d "app/api/v3" ]; then
    echo "  - Suppression app/api/v3/"
    rm -rf app/api/v3/
    ((DELETED++))
fi

# 12. Page settings/leagues (obsolète avec v4)
if [ -d "app/(dashboard)/settings/leagues" ]; then
    echo "  - Suppression app/(dashboard)/settings/leagues/"
    rm -rf app/\(dashboard\)/settings/leagues/
    ((DELETED++))
fi

# 13. Composants v3
if [ -d "components/tables/v3" ]; then
    echo "  - Suppression components/tables/v3/"
    rm -rf components/tables/v3/
    ((DELETED++))
fi

# 14. Fichiers de backup
echo "  - Suppression fichiers .bak"
find . -name "*.bak" -type f -delete 2>/dev/null
((DELETED++))

# 15. Anciennes routes API
if [ -f "app/api/markets/route.ts" ]; then
    echo "  - Suppression app/api/markets/route.ts (ancienne version)"
    rm -f app/api/markets/route.ts
    ((DELETED++))
fi

if [ -f "app/api/settings/route.ts" ]; then
    # Vérifier si c'est l'ancienne version
    if grep -q "updateFollowedTournaments" app/api/settings/route.ts 2>/dev/null; then
        echo "  - Suppression app/api/settings/route.ts (ancienne version)"
        rm -f app/api/settings/route.ts
        ((DELETED++))
    fi
fi

echo ""
echo "✅ Nettoyage terminé !"
echo "📊 $DELETED dossiers/fichiers supprimés"
echo ""

# Vérification du build
echo "🔍 Vérification de la compilation TypeScript..."
if npm run build; then
    echo ""
    echo "✅ Build réussi ! Aucune dépendance manquante."
else
    echo ""
    echo "⚠️  Le build a échoué. Vérifiez les erreurs ci-dessus."
    echo "    Il peut y avoir des références aux anciens fichiers dans le frontend."
fi

echo ""
echo "📋 Voir CLEANUP_REPORT.md pour plus de détails"
