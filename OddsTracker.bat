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

REM Vérifier si Node.js est installé
where node >nul 2>&1
if errorlevel 1 (
    echo 📦 Node.js n'est pas installé sur votre système
    echo 🔄 Installation automatique de Node.js...
    echo.

    REM Télécharger l'installateur Node.js LTS pour Windows
    echo ⬇️  Téléchargement de Node.js (version LTS)...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\node-installer.msi'"

    if errorlevel 1 (
        echo ❌ Erreur lors du téléchargement de Node.js
        echo Veuillez installer Node.js manuellement depuis https://nodejs.org
        echo Appuyez sur une touche pour fermer...
        pause >nul
        exit /b 1
    )

    echo 📦 Installation de Node.js...
    msiexec /i "%TEMP%\node-installer.msi" /passive /norestart

    if errorlevel 1 (
        echo ❌ Erreur lors de l'installation de Node.js
        echo Veuillez installer Node.js manuellement depuis https://nodejs.org
        echo Appuyez sur une touche pour fermer...
        pause >nul
        exit /b 1
    )

    echo ✅ Node.js installé avec succès!
    echo ⚠️  Veuillez redémarrer ce lanceur pour terminer l'installation
    echo Appuyez sur une touche pour fermer...
    pause >nul
    exit /b 0
)

REM Afficher la version de Node.js installée
for /f "delims=" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% détecté
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

REM Lancer le serveur en arrière-plan
echo ⏳ Démarrage en cours...
start /B npm run dev

REM Attendre que le serveur démarre (8 secondes)
timeout /t 8 /nobreak >nul

REM Ouvrir automatiquement le navigateur
echo 🌐 Ouverture du navigateur...
start http://localhost:3000

REM Attendre indéfiniment (le serveur tourne en arrière-plan)
echo.
echo ✅ Serveur démarré ! Le navigateur devrait s'ouvrir automatiquement.
echo.
pause

REM Si on arrive ici, l'utilisateur a appuyé sur une touche
echo.
echo 🛑 Fermeture...
echo Appuyez sur une touche pour fermer cette fenêtre...
pause >nul
