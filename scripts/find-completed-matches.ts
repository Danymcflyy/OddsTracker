#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi');

  console.log('🔍 Recherche de matchs terminés récemment sur l\'API...\n');

  const client = getTheOddsApiClient();

  try {
    // Récupérer les scores des 3 derniers jours
    console.log('📡 Récupération des scores Champions League (3 derniers jours)...\n');

    const response = await client.getScores('soccer_uefa_champs_league', {
      daysFrom: '3',
      dateFormat: 'iso',
    });

    const scores = response.data;
    console.log(`✅ ${scores.length} événements récents trouvés\n`);

    if (scores.length === 0) {
      console.log('⚠️  Aucun événement récent');
      return;
    }

    // Filtrer les matchs terminés
    const completedMatches = scores.filter(s => s.completed);
    console.log(`📊 ${completedMatches.length} matchs terminés:\n`);

    if (completedMatches.length === 0) {
      console.log('⚠️  Aucun match terminé dans les 3 derniers jours\n');
      console.log('💡 Les matchs de Champions League sont peut-être programmés plus tard');
      return;
    }

    for (const match of completedMatches.slice(0, 5)) {
      console.log(`✅ ${match.home_team} vs ${match.away_team}`);
      console.log(`   Date: ${new Date(match.commence_time).toLocaleString('fr-FR')}`);
      console.log(`   API ID: ${match.id}`);
      console.log(`   Terminé: ${match.completed ? 'Oui' : 'Non'}`);

      // Extraire les scores
      const homeScore = match.scores?.find(s => s.name === match.home_team)?.score;
      const awayScore = match.scores?.find(s => s.name === match.away_team)?.score;

      if (homeScore !== undefined && awayScore !== undefined) {
        console.log(`   Score: ${homeScore} - ${awayScore}`);
      }

      console.log('');
    }

    if (completedMatches.length > 0) {
      console.log('\n💡 On peut tester la capture de closing odds sur ces matchs!');
      console.log(`   Crédits estimés: ${completedMatches.slice(0, 2).length * 7} pour 2 matchs\n`);
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

run();
