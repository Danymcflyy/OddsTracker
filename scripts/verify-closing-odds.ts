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

  console.log('🔍 Vérification des closing odds sauvegardées\n');

  const { data, error } = await supabase
    .from('closing_odds')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.log('❌ Erreur:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️ Aucune closing odds trouvée');
    return;
  }

  const closingOdds = data[0];

  console.log('✅ Closing odds trouvées\n');
  console.log('📊 Détails:');
  console.log(`   Event ID: ${closingOdds.event_id}`);
  console.log(`   Captured at: ${closingOdds.captured_at}`);
  console.log(`   Capture status: ${closingOdds.capture_status}`);
  console.log(`   Used Historical API: ${closingOdds.used_historical_api}`);
  console.log(`   Created at: ${closingOdds.created_at}`);

  console.log('\n📈 Markets:');
  console.log(JSON.stringify(closingOdds.markets, null, 2));

  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('home_team, away_team, commence_time, status, home_score, away_score')
    .eq('id', closingOdds.event_id)
    .single();

  if (event) {
    console.log('\n🏆 Événement associé:');
    console.log(`   ${event.home_team} vs ${event.away_team}`);
    console.log(`   Status: ${event.status}`);
    console.log(`   Kick-off: ${event.commence_time}`);
    if (event.home_score !== null && event.away_score !== null) {
      console.log(`   Score: ${event.home_score} - ${event.away_score}`);
    }
  }
}

run();
