#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🔍 Recherche d\'événements récents dans la DB...\n');

  // Chercher les événements des 2 derniers jours
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .gte('commence_time', twoDaysAgo.toISOString())
    .order('commence_time', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!events || events.length === 0) {
    console.log('❌ Aucun événement récent trouvé');
    return;
  }

  console.log(`✅ ${events.length} événements récents trouvés:\n`);

  const now = new Date();

  for (const event of events) {
    const commenceTime = new Date(event.commence_time);
    const isPast = commenceTime < now;
    const statusIcon = isPast ? '✅' : '⏳';
    const timeStr = commenceTime.toLocaleString('fr-FR');

    console.log(`${statusIcon} ${event.home_team} vs ${event.away_team}`);
    console.log(`   Date: ${timeStr}`);
    console.log(`   Status: ${event.status} ${event.completed ? '(Terminé)' : '(En cours)'}`);
    console.log(`   API ID: ${event.api_event_id}`);

    if (event.completed) {
      console.log(`   Score: ${event.home_score ?? '?'} - ${event.away_score ?? '?'}`);
    }

    console.log('');
  }

  // Compter combien sont terminés
  const completedEvents = events.filter(e => e.completed || e.status === 'completed');
  console.log(`\n📊 ${completedEvents.length} événements terminés sur ${events.length}`);

  if (completedEvents.length > 0) {
    console.log('\n💡 On peut tester le closing odds sur ces événements terminés!');
  } else {
    console.log('\n⚠️  Aucun événement terminé - on devra attendre ou tester sur de futures données');
  }
}

run();
