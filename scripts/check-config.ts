#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');

  console.log('🔍 Vérification de la configuration\n');

  // Vérifier les variables d'environnement
  console.log('📋 Variables d\'environnement:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Défini' : '❌ Manquant');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Défini' : '❌ Manquant');
  console.log('  ODDS_API_KEY:', process.env.ODDS_API_KEY ? '✅ Défini' : '❌ Manquant');
  console.log('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Vérifier les settings
  console.log('⚙️ Configuration des marchés:');
  const { data: settings, error: settingsError } = await supabase
    .from('settings')
    .select('*');

  if (settingsError) {
    console.log('❌ Erreur:', settingsError.message);
    return;
  }

  const trackedMarkets = settings?.find(s => s.key === 'tracked_markets');
  const trackedSports = settings?.find(s => s.key === 'tracked_sports');

  console.log('  Marchés trackés:', trackedMarkets?.value || 'Aucun');
  console.log('  Sports trackés:', trackedSports?.value || 'Aucun');
  console.log('');

  // Vérifier les événements à venir
  console.log('📅 Événements à venir:');
  const { data: upcomingEvents, error: eventsError } = await supabase
    .from('events')
    .select('id, home_team, away_team, commence_time, status')
    .gte('commence_time', new Date().toISOString())
    .eq('status', 'upcoming')
    .order('commence_time', { ascending: true })
    .limit(5);

  if (eventsError) {
    console.log('❌ Erreur:', eventsError.message);
  } else {
    console.log(`  ${upcomingEvents?.length || 0} événements trouvés`);
    upcomingEvents?.forEach(e => {
      const date = new Date(e.commence_time).toLocaleString('fr-FR');
      console.log(`  - ${date}: ${e.home_team} vs ${e.away_team}`);
    });
  }
  console.log('');

  // Vérifier les événements terminés récents
  console.log('✅ Événements terminés récents:');
  const { data: completedEvents, error: completedError } = await supabase
    .from('events')
    .select('id, home_team, away_team, home_score, away_score, commence_time, status')
    .eq('status', 'completed')
    .gte('commence_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('commence_time', { ascending: false })
    .limit(5);

  if (completedError) {
    console.log('❌ Erreur:', completedError.message);
  } else {
    console.log(`  ${completedEvents?.length || 0} événements trouvés`);
    completedEvents?.forEach(e => {
      const date = new Date(e.commence_time).toLocaleString('fr-FR');
      const score = e.home_score !== null ? `${e.home_score} - ${e.away_score}` : 'N/A';
      console.log(`  - ${date}: ${e.home_team} vs ${e.away_team} (${score})`);
    });
  }
}

run();
