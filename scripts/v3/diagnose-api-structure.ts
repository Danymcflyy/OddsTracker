/**
 * Diagnostic - Structure réelle de l'API
 * Affiche les données brutes pour comprendre la structure
 */

// Charger les variables d'environnement EN PREMIER
import './load-env';

const API_KEY = process.env.ODDS_API_IO_KEY;
const BASE_URL = 'https://api2.odds-api.io/v3';

async function diagnoseAPI() {
  console.log('🔍 DIAGNOSTIC - Structure de l\'API Odds-API.io\n');
  console.log('='.repeat(60));

  if (!API_KEY) {
    console.error('❌ ODDS_API_IO_KEY non trouvée');
    process.exit(1);
  }

  try {
    // Récupérer les événements football
    const url = `${BASE_URL}/events?apiKey=${API_KEY}&sport=football`;
    console.log(`📡 Requête: ${url.substring(0, 80)}...\n`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
      process.exit(1);
    }

    const data = await response.json();
    console.log(`✅ Réponse reçue: ${data.length} événements\n`);

    // Afficher le PREMIER événement complet
    if (data.length > 0) {
      console.log('📋 STRUCTURE DU PREMIER ÉVÉNEMENT:');
      console.log('='.repeat(60));
      console.log(JSON.stringify(data[0], null, 2));
      console.log('\n' + '='.repeat(60));

      // Afficher toutes les clés disponibles
      console.log('\n📊 CLÉS DISPONIBLES DANS L\'ÉVÉNEMENT:');
      console.log('-'.repeat(60));
      const keys = Object.keys(data[0]);
      keys.forEach(key => {
        const value = data[0][key];
        const type = typeof value;
        const preview = type === 'object'
          ? JSON.stringify(value).substring(0, 50) + '...'
          : String(value).substring(0, 50);
        console.log(`  • ${key.padEnd(20)} [${type.padEnd(8)}] = ${preview}`);
      });

      // Compter les ligues uniques
      console.log('\n📊 ANALYSE DES LIGUES:');
      console.log('-'.repeat(60));

      // Essayer différentes clés possibles pour la ligue
      const possibleLeagueKeys = ['league_key', 'league', 'leagueKey', 'league_id', 'leagueId'];
      const possibleLeagueNames = ['league_title', 'league_name', 'leagueName', 'leagueTitle'];

      for (const key of possibleLeagueKeys) {
        if (data[0][key] !== undefined) {
          console.log(`  ✅ Clé ligue trouvée: "${key}" = ${data[0][key]}`);
        }
      }

      for (const key of possibleLeagueNames) {
        if (data[0][key] !== undefined) {
          console.log(`  ✅ Nom ligue trouvé: "${key}" = ${data[0][key]}`);
        }
      }

      // Afficher quelques exemples de ligues
      console.log('\n📋 EXEMPLES DE LIGUES (premiers 10):');
      console.log('-'.repeat(60));
      const leaguesFound = new Map<string, any>();

      data.slice(0, 100).forEach((event: any) => {
        // Trouver le bon champ pour la ligue
        let leagueKey = null;
        let leagueName = null;

        for (const key of possibleLeagueKeys) {
          if (event[key]) {
            leagueKey = event[key];
            break;
          }
        }

        for (const key of possibleLeagueNames) {
          if (event[key]) {
            leagueName = event[key];
            break;
          }
        }

        if (leagueKey && !leaguesFound.has(leagueKey)) {
          leaguesFound.set(leagueKey, leagueName || leagueKey);
        }
      });

      let count = 0;
      for (const [key, name] of leaguesFound) {
        if (count < 10) {
          console.log(`  ${(count + 1).toString().padStart(2)}. ${name} (${key})`);
          count++;
        }
      }

      console.log(`\n  Total ligues uniques trouvées (sur 100 premiers événements): ${leaguesFound.size}`);
    } else {
      console.log('⚠️  Aucun événement retourné');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnostic terminé\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécution
diagnoseAPI().catch(console.error);
