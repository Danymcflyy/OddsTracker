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

  console.log('═══════════════════════════════════════════════════════');
  console.log('FINALISATION MANUELLE DES CLOSING ODDS');
  console.log('═══════════════════════════════════════════════════════\n');

  // Trouver tous les événements qui ont des snapshots mais pas de closing_odds finalisés
  const { data: eventsWithSnapshots } = await supabase
    .from('closing_odds_snapshots')
    .select('event_id')
    .eq('is_selected', false);

  if (!eventsWithSnapshots || eventsWithSnapshots.length === 0) {
    console.log('ℹ️ Aucun événement à finaliser');
    return;
  }

  const uniqueEventIds = [...new Set(eventsWithSnapshots.map(s => s.event_id))];

  console.log(`📊 ${uniqueEventIds.length} événement(s) avec snapshots non finalisés\n`);

  let finalized = 0;
  let skipped = 0;

  for (const eventId of uniqueEventIds) {
    // Récupérer l'événement
    const { data: event } = await supabase
      .from('events')
      .select('home_team, away_team, commence_time, status')
      .eq('id', eventId)
      .single();

    if (!event) continue;

    console.log(`\n🏆 ${event.home_team} vs ${event.away_team}`);
    console.log(`   Date: ${new Date(event.commence_time).toLocaleString('fr-FR')}`);
    console.log(`   Status: ${event.status}`);

    // Vérifier si déjà finalisé
    const { data: existing } = await supabase
      .from('closing_odds')
      .select('id')
      .eq('event_id', eventId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('   ✓ Déjà finalisé');
      skipped++;
      continue;
    }

    // Récupérer tous les snapshots
    const { data: snapshots } = await supabase
      .from('closing_odds_snapshots')
      .select('*')
      .eq('event_id', eventId)
      .order('bookmaker_last_update', { ascending: false });

    if (!snapshots || snapshots.length === 0) {
      console.log('   ⚠️ Aucun snapshot trouvé');
      continue;
    }

    console.log(`   📸 ${snapshots.length} snapshot(s) disponibles`);

    // Afficher les snapshots
    snapshots.forEach(s => {
      console.log(`      M${s.minutes_before_kickoff}: ${s.bookmaker} - ${new Date(s.bookmaker_last_update).toLocaleTimeString('fr-FR')}`);
    });

    // Sélectionner le meilleur (dernière mise à jour)
    const bestSnapshot = snapshots[0];

    console.log(`   ✅ Meilleur snapshot: M${bestSnapshot.minutes_before_kickoff} (${bestSnapshot.bookmaker})`);

    // Marquer comme sélectionné
    const { error: updateError } = await supabase
      .from('closing_odds_snapshots')
      .update({ is_selected: true })
      .eq('id', bestSnapshot.id);

    if (updateError) {
      console.log(`   ❌ Erreur update: ${updateError.message}`);
      continue;
    }

    // Copier dans closing_odds
    const { error: upsertError } = await supabase
      .from('closing_odds')
      .upsert({
        event_id: eventId,
        markets: bestSnapshot.markets,
        captured_at: bestSnapshot.captured_at,
        bookmaker_update: bestSnapshot.bookmaker_last_update,
        capture_status: 'success',
        used_historical_api: false,
      });

    if (upsertError) {
      console.log(`   ❌ Erreur upsert: ${upsertError.message}`);
      continue;
    }

    console.log('   ✅ Closing odds finalisées');
    finalized++;
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('RÉSUMÉ');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Événements finalisés: ${finalized}`);
  console.log(`⏭️ Événements skippés: ${skipped}`);
  console.log('═══════════════════════════════════════════════════════');
}

run().catch(console.error);
