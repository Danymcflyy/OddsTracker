#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');
  const { scanAllOpeningOdds } = await import('@/lib/services/theoddsapi/opening-odds');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('🎯 TEST WORKFLOW OPENING ODDS\n');

  // Récupérer les marchés trackés
  const { data: settingsData } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'tracked_markets')
    .single();

  const trackedMarkets = settingsData?.value || [];
  console.log(`📊 Marchés trackés: ${trackedMarkets.join(', ')}\n`);

  // Récupérer un événement à venir
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'upcoming')
    .gte('commence_time', new Date().toISOString())
    .order('commence_time', { ascending: true })
    .limit(1);

  if (!events || events.length === 0) {
    console.log('❌ Aucun événement à venir trouvé');
    return;
  }

  const event = events[0];
  console.log(`🏆 Événement test: ${event.home_team} vs ${event.away_team}`);
  console.log(`   Date: ${new Date(event.commence_time).toLocaleString('fr-FR')}`);
  console.log(`   Event ID: ${event.id}`);
  console.log(`   API ID: ${event.api_id}\n`);

  // Scanner les opening odds
  console.log('🔍 Scan des opening odds...\n');

  try {
    const result = await scanAllOpeningOdds();

    console.log('✅ Résultat du scan:');
    console.log(`   Événements processés: ${result.eventsProcessed}`);
    console.log(`   Marchés capturés: ${result.marketsCaptured}`);
    console.log(`   Erreurs: ${result.errors}`);
    console.log(`   Crédits utilisés: ${result.creditsUsed}`);
    console.log('');

    // Vérifier les données capturées pour notre événement
    console.log('📊 Vérification des données capturées:\n');
    const { data: marketStates } = await supabase
      .from('market_states')
      .select('*')
      .eq('event_id', event.id);

    if (marketStates && marketStates.length > 0) {
      console.log(`✅ ${marketStates.length} market_states trouvés pour cet événement:`);
      marketStates.forEach(ms => {
        console.log(`   - ${ms.market_key}: ${ms.status}`);
        if (ms.opening_odds) {
          console.log(`     Opening odds:`, JSON.stringify(ms.opening_odds, null, 2));
        }
        if (ms.opening_odds_variations && ms.opening_odds_variations.length > 0) {
          console.log(`     Variations: ${ms.opening_odds_variations.length} trouvées`);
        }
      });
    } else {
      console.log('⚠️ Aucun market_state trouvé pour cet événement');
    }

  } catch (error: any) {
    console.error('❌ Erreur lors du scan:', error.message);
    console.error(error);
  }
}

run();
