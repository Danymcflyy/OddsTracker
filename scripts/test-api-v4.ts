/**
 * Script de test - The Odds API v4
 * Teste la connexion et affiche les sports disponibles
 *
 * Usage: npx tsx scripts/test-api-v4.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { getTheOddsApiClient } from '../lib/api/theoddsapi/client';

async function testApi() {
  console.log('🧪 Test de connexion à The Odds API v4\n');

  try {
    // 1. Vérifier la clé API
    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey) {
      console.error('❌ ERREUR : Variable d\'environnement ODDS_API_KEY manquante');
      console.log('\n💡 Solution : Ajouter ODDS_API_KEY dans .env.local\n');
      process.exit(1);
    }

    console.log('✅ Clé API trouvée :', apiKey.substring(0, 8) + '...\n');

    // 2. Tester la connexion en récupérant les sports
    console.log('📡 Récupération des sports disponibles...\n');

    const client = getTheOddsApiClient();
    const response = await client.getSports();

    console.log('✅ Connexion réussie !\n');
    console.log('📊 Statistiques :');
    console.log('   - Sports actifs :', response.data.filter(s => s.active).length);
    console.log('   - Requêtes restantes :', response.headers.requestsRemaining);
    console.log('   - Requêtes utilisées :', response.headers.requestsUsed);

    // 3. Afficher les sports de football
    const soccerSports = response.data
      .filter(s => s.active && s.group === 'Soccer')
      .sort((a, b) => a.title.localeCompare(b.title));

    console.log('\n⚽ Sports de football disponibles :\n');
    soccerSports.forEach(sport => {
      console.log(`   - ${sport.title} (${sport.key})`);
    });

    console.log('\n💡 Prochaines étapes :');
    console.log('   1. Aller sur http://localhost:3000/settings/data-collection');
    console.log('   2. Sélectionner les ligues à suivre');
    console.log('   3. Lancer le workflow "Sync Events" depuis GitHub Actions');

  } catch (error: any) {
    console.error('\n❌ ERREUR lors du test :', error.message);

    if (error.message.includes('401')) {
      console.log('\n💡 Clé API invalide. Vérifier sur https://the-odds-api.com/');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Quota dépassé. Attendre ou upgrader le plan.');
    } else {
      console.log('\n💡 Vérifier la connexion internet et la configuration.');
    }

    process.exit(1);
  }
}

testApi();
