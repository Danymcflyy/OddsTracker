# 🚀 OddsTracker - Installation Client

## Installation ULTRA SIMPLE (2 clics)

### 1️⃣ Dézipper le projet
Extraire le dossier "OddsTracker" où vous voulez sur votre ordinateur.

### 2️⃣ Double-cliquer sur le lanceur

**Mac :** Double-cliquer sur "OddsTracker.command"
**Windows :** Double-cliquer sur "OddsTracker.bat"

✨ **Le lanceur fait TOUT AUTOMATIQUEMENT :**
1. **Détecte et installe Node.js** si nécessaire (première fois uniquement, ~2 min)
   - Sur Mac : demandera votre mot de passe administrateur
   - Sur Windows : installation silencieuse en arrière-plan
2. **Installe les dépendances** de l'application (première fois uniquement, 2-3 min)
3. **Démarre le serveur** automatiquement
4. **Ouvre votre navigateur** sur http://localhost:3000

**Note Windows :** Si Node.js est installé pour la première fois, le lanceur vous demandera de le relancer une seconde fois (pour appliquer les variables d'environnement).

💡 **Astuce :** Créez un raccourci sur votre bureau pour lancer l'application en 1 clic :
- **Mac :** Faites glisser "OddsTracker.command" vers le bureau en maintenant ⌘+⌥
- **Windows :** Clic droit sur "OddsTracker.bat" → "Envoyer vers" → "Bureau (créer un raccourci)"

---

## ✅ C'est tout !
- L'application récupère les données automatiquement
- Les données se synchronisent toutes les 5 minutes via GitHub Actions
- Vous pouvez activer/désactiver des ligues sur : http://localhost:3000/settings/leagues

## ⚠️ Important
- Ne pas fermer la fenêtre du terminal tant que vous utilisez l'application
- Pour arrêter : Appuyez sur Ctrl+C dans la fenêtre du terminal

## ❓ En cas de problème
- Vérifier que Node.js est bien installé : `node --version`
- Relancer le lanceur (il réinstallera les dépendances si nécessaire)
- Contacter le développeur
