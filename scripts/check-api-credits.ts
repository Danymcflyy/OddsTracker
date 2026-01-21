#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi');

  console.log('💰 Vérification des crédits API restants...\n');

  const client = getTheOddsApiClient();

  try {
    // Faire une requête minimale pour obtenir les headers
    const response = await client.getEvents('soccer_uefa_champs_league');

    console.log('✅ Réponse reçue\n');
    console.log('📊 Crédits API:');
    console.log(`   Utilisés dans cette requête: ${response.headers.requestsUsed || 0}`);
    console.log(`   Restants: ${response.headers.requestsRemaining}`);
    console.log(`   Total disponible: ${response.headers.requestsRemaining + (response.headers.requestsUsed || 0)}\n`);

    const remaining = parseInt(response.headers.requestsRemaining);

    console.log('💡 Estimation pour test closing odds:');
    console.log('   Par événement: ~7 crédits (7 marchés)');
    console.log('   Test sur 3 événements: ~21 crédits\n');

    if (remaining < 25) {
      console.log('⚠️  ATTENTION: Moins de 25 crédits restants');
      console.log('   Recommandation: Utiliser une nouvelle clé API ou limiter les tests\n');
    } else {
      console.log(`✅ ${remaining} crédits disponibles - Suffisant pour les tests\n`);
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

run();
