#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi');
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔍 Test de synchronisation des scores\n');

  const client = getTheOddsApiClient();

  try {
    // Récupérer les scores des matchs Champions League des 3 derniers jours
    console.log('📡 Récupération des scores (3 derniers jours)...\n');

    const response = await client.getScores('soccer_uefa_champs_league', {
      daysFrom: '3',
      dateFormat: 'iso',
    });

    const scores = response.data;
    const creditsUsed = response.headers.requestsLast;

    console.log(`✅ ${scores.length} événements récents trouvés`);
    console.log(`   Crédits utilisés: ${creditsUsed}\n`);

    // Filtrer les matchs terminés
    const completedMatches = scores.filter(s => s.completed);
    console.log(`📊 ${completedMatches.length} matchs terminés:\n`);

    if (completedMatches.length === 0) {
      console.log('⚠️  Aucun match terminé dans les 3 derniers jours');
      return;
    }

    let updatedCount = 0;
    let notFoundCount = 0;

    // Pour chaque match terminé
    for (const score of completedMatches.slice(0, 10)) {
      console.log(`\n🏆 ${score.home_team} vs ${score.away_team}`);
      console.log(`   Date: ${new Date(score.commence_time).toLocaleString('fr-FR')}`);
      console.log(`   API ID: ${score.id}`);

      // Extraire les scores
      const homeScore = score.scores?.find(s => s.name === score.home_team)?.score;
      const awayScore = score.scores?.find(s => s.name === score.away_team)?.score;

      if (homeScore !== undefined && awayScore !== undefined) {
        console.log(`   ⚽ Score: ${homeScore} - ${awayScore}`);
      } else {
        console.log(`   ⚠️  Scores non disponibles`);
      }

      // Vérifier si l'événement existe en DB
      const { data: existingEvent, error: findError } = await supabase
        .from('events')
        .select('id, home_team, away_team, status, home_score, away_score')
        .eq('api_event_id', score.id)
        .single();

      if (findError || !existingEvent) {
        console.log(`   ❌ Non trouvé en DB`);
        notFoundCount++;
        continue;
      }

      console.log(`   ✅ Trouvé en DB (ID: ${existingEvent.id})`);
      console.log(`      Status actuel: ${existingEvent.status}`);
      console.log(`      Score actuel: ${existingEvent.home_score ?? '?'} - ${existingEvent.away_score ?? '?'}`);

      // Mettre à jour les scores
      if (score.completed && homeScore !== undefined && awayScore !== undefined) {
        const { error: updateError } = await supabase
          .from('events')
          .update({
            status: 'completed',
            completed: true,
            home_score: parseInt(homeScore),
            away_score: parseInt(awayScore),
            last_api_update: score.last_update || new Date().toISOString(),
          })
          .eq('id', existingEvent.id);

        if (updateError) {
          console.log(`   ❌ Erreur mise à jour: ${updateError.message}`);
        } else {
          console.log(`   ✅ Score mis à jour: ${homeScore} - ${awayScore}`);
          updatedCount++;
        }
      }
    }

    console.log('\n\n📊 RÉSUMÉ DE LA SYNCHRONISATION:\n');
    console.log(`   ✅ Événements mis à jour: ${updatedCount}`);
    console.log(`   ❌ Événements non trouvés en DB: ${notFoundCount}`);
    console.log(`   📈 Crédits utilisés: ${creditsUsed}`);
    console.log(`   📉 Crédits restants: ~${29 - creditsUsed}\n`);

    // Vérifier les événements mis à jour en DB
    console.log('🔍 Vérification des événements complétés en DB:\n');

    const { data: completedEvents, error: queryError } = await supabase
      .from('events')
      .select('home_team, away_team, home_score, away_score, status')
      .eq('status', 'completed')
      .order('commence_time', { ascending: false })
      .limit(5);

    if (queryError) {
      console.error('❌ Erreur query:', queryError);
    } else if (completedEvents && completedEvents.length > 0) {
      console.log(`   Derniers événements complétés en DB:\n`);
      for (const evt of completedEvents) {
        console.log(`   ✅ ${evt.home_team} ${evt.home_score ?? '?'} - ${evt.away_score ?? '?'} ${evt.away_team}`);
      }
    } else {
      console.log('   ⚠️  Aucun événement complété en DB');
    }

    console.log('\n💡 La synchronisation des scores fonctionne!');
    console.log('   Les scores peuvent maintenant être affichés dans le tableau frontend\n');

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

run();
