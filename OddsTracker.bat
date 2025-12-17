@echo off
REM OddsTracker Launcher pour Windows
REM Double-cliquer sur ce fichier pour lancer l'application

REM Aller dans le dossier du projet
cd /d "%~dp0"

REM Afficher le titre
echo ╔═══════════════════════════════════════╗
echo ║       🎯 OddsTracker v2.0            ║
echo ║   Application de suivi de cotes      ║
echo ╚═══════════════════════════════════════╝
echo.

REM Vérifier que .env.local existe
if not exist .env.local (
    echo ❌ Erreur: Fichier .env.local manquant!
    echo.
    echo Veuillez créer le fichier .env.local avec:
    echo   - NEXT_PUBLIC_SUPABASE_URL
    echo   - NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo   - SUPABASE_SERVICE_ROLE_KEY
    echo   - ODDS_API_IO_KEY
    echo.
    echo Appuyez sur une touche pour fermer...
    pause >nul
    exit /b 1
)

REM Vérifier que node_modules existe
if not exist node_modules (
    echo 📦 Installation des dépendances...
    call npm install
    if errorlevel 1 (
        echo.
        echo ❌ Erreur lors de l'installation des dépendances
        echo Appuyez sur une touche pour fermer...
        pause >nul
        exit /b 1
    )
    echo.
)

REM Informations
echo ✅ Configuration OK
echo 🌐 Démarrage du serveur...
echo.
echo 📍 L'application sera accessible sur: http://localhost:3000
echo 📊 Synchronisation automatique via GitHub Actions (toutes les 10 min)
echo.
echo ⚠️  NE PAS FERMER cette fenêtre tant que vous utilisez l'application
echo ⛔ Pour arrêter: Appuyez sur Ctrl+C dans cette fenêtre
echo.
echo ═══════════════════════════════════════════════════════════
echo.

REM Lancer le serveur
call npm run dev

REM Si le serveur s'arrête
echo.
echo 🛑 Serveur arrêté
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul
