#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');
  const { getTheOddsApiClient } = await import('@/lib/api/theoddsapi/client');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const client = getTheOddsApiClient();

  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST CAPTURE CLOSING ODDS - PROCHAIN MATCH');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Trouver le prochain match le plus proche
  const { data: upcomingEvents, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'upcoming')
    .gte('commence_time', new Date().toISOString())
    .order('commence_time', { ascending: true })
    .limit(5);

  if (error) {
    console.error('❌ Erreur DB:', error.message);
    return;
  }

  if (!upcomingEvents || upcomingEvents.length === 0) {
    console.log('❌ Aucun match à venir trouvé');
    return;
  }

  console.log(`📊 ${upcomingEvents.length} match(s) à venir:\n`);

  upcomingEvents.forEach((event, i) => {
    const kickoff = new Date(event.commence_time);
    const now = new Date();
    const minutesUntil = Math.floor((kickoff.getTime() - now.getTime()) / (60 * 1000));

    console.log(`${i + 1}. ${event.home_team} vs ${event.away_team}`);
    console.log(`   Sport: ${event.sport_key}`);
    console.log(`   Kick-off: ${kickoff.toLocaleString('fr-FR')}`);
    console.log(`   Dans: ${minutesUntil} minutes`);
    console.log(`   API Event ID: ${event.api_event_id || '❌ MANQUANT'}\n`);
  });

  const selectedEvent = upcomingEvents[0];

  console.log('═══════════════════════════════════════════════════════');
  console.log(`TEST SUR: ${selectedEvent.home_team} vs ${selectedEvent.away_team}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // 2. Récupérer les cotes actuelles
  console.log('🔍 Récupération des cotes actuelles...\n');

  try {
    const response = await client.getOdds(selectedEvent.sport_key, {
      regions: 'eu',
      markets: 'h2h,spreads,totals',
      oddsFormat: 'decimal',
      dateFormat: 'iso',
    });

    const odds = response.data;

    console.log(`✅ ${odds.length} événements retournés par l'API\n`);

    // Trouver notre événement
    const apiEvent = odds.find(e => e.id === selectedEvent.api_event_id);

    if (!apiEvent) {
      console.log('❌ Événement non trouvé dans la réponse API');
      console.log('\nÉvénements disponibles:');
      odds.slice(0, 3).forEach(e => {
        console.log(`   - ${e.home_team} vs ${e.away_team} (ID: ${e.id})`);
      });
      return;
    }

    console.log('✅ Événement trouvé dans l\'API\n');
    console.log(`📊 Bookmakers disponibles: ${apiEvent.bookmakers?.length || 0}\n`);

    if (!apiEvent.bookmakers || apiEvent.bookmakers.length === 0) {
      console.log('⚠️ Aucun bookmaker disponible');
      return;
    }

    // Afficher les bookmakers
    apiEvent.bookmakers.forEach((bookmaker: any) => {
      console.log(`📚 ${bookmaker.key}:`);
      console.log(`   Last update: ${bookmaker.last_update}`);
      console.log(`   Marchés: ${bookmaker.markets?.length || 0}`);

      bookmaker.markets?.forEach((market: any) => {
        console.log(`\n   ${market.key.toUpperCase()}:`);
        market.outcomes?.forEach((outcome: any) => {
          const point = outcome.point ? ` (${outcome.point})` : '';
          console.log(`     ${outcome.name}: ${outcome.price}${point}`);
        });
      });
      console.log('');
    });

    // 3. Simuler la capture
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('SIMULATION DE CAPTURE');
    console.log('═══════════════════════════════════════════════════════\n');

    const now = new Date();
    const kickoff = new Date(selectedEvent.commence_time);
    const minutesBeforeKickoff = Math.floor((kickoff.getTime() - now.getTime()) / (60 * 1000));

    console.log(`Position actuelle: M${minutesBeforeKickoff > 0 ? '+' : ''}${minutesBeforeKickoff}`);
    console.log(`Kick-off: ${kickoff.toLocaleString('fr-FR')}\n`);

    if (minutesBeforeKickoff < -10 || minutesBeforeKickoff > 10) {
      console.log('⚠️ Événement hors de la fenêtre de capture (M-10 à M+10)');
      console.log(`   Fenêtre actuelle: M-10 à M+10`);
      console.log(`   Position: M${minutesBeforeKickoff}`);
      return;
    }

    // Vérifier si déjà capturé
    const { data: existing } = await supabase
      .from('closing_odds_snapshots')
      .select('*')
      .eq('event_id', selectedEvent.id)
      .order('minutes_before_kickoff', { ascending: false });

    if (existing && existing.length > 0) {
      console.log(`📸 ${existing.length} snapshot(s) existant(s):\n`);
      existing.forEach(s => {
        console.log(`   M${s.minutes_before_kickoff}: ${s.bookmaker} - ${new Date(s.bookmaker_last_update).toLocaleTimeString('fr-FR')}`);
      });
      console.log('');
    } else {
      console.log('ℹ️ Aucun snapshot existant\n');
    }

    // Sélectionner le meilleur bookmaker
    const bookmakerPriority = ['pinnacle', 'bet365', 'betfair_ex_eu', 'onexbet'];
    let selectedBookmaker = null;

    for (const preferred of bookmakerPriority) {
      const found = apiEvent.bookmakers.find((b: any) => b.key === preferred);
      if (found) {
        selectedBookmaker = found;
        break;
      }
    }

    if (!selectedBookmaker) {
      selectedBookmaker = apiEvent.bookmakers[0];
    }

    console.log(`✅ Bookmaker sélectionné: ${selectedBookmaker.key}\n`);

    // Extraire les marchés
    const markets: any = {};
    selectedBookmaker.markets?.forEach((market: any) => {
      const odds: any = {
        last_update: market.last_update || selectedBookmaker.last_update,
      };

      market.outcomes?.forEach((outcome: any) => {
        const name = outcome.name.toLowerCase();

        if (name.includes('home') || name === selectedEvent.home_team.toLowerCase()) {
          odds.home = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        } else if (name.includes('away') || name === selectedEvent.away_team.toLowerCase()) {
          odds.away = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        } else if (name.includes('draw')) {
          odds.draw = outcome.price;
        } else if (name.includes('over')) {
          odds.over = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        } else if (name.includes('under')) {
          odds.under = outcome.price;
          if (outcome.point !== undefined) odds.point = outcome.point;
        }
      });

      markets[market.key] = odds;
    });

    console.log('📊 Données à sauvegarder:\n');
    console.log(JSON.stringify({
      event_id: selectedEvent.id,
      minutes_before_kickoff: minutesBeforeKickoff,
      bookmaker: selectedBookmaker.key,
      bookmaker_last_update: selectedBookmaker.last_update,
      markets,
    }, null, 2));

    // 4. Demander confirmation pour sauvegarder
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('SAUVEGARDE');
    console.log('═══════════════════════════════════════════════════════\n');

    // Sauvegarder automatiquement
    const { error: insertError } = await supabase
      .from('closing_odds_snapshots')
      .insert({
        event_id: selectedEvent.id,
        captured_at: now.toISOString(),
        bookmaker_last_update: selectedBookmaker.last_update,
        minutes_before_kickoff: minutesBeforeKickoff,
        markets: markets,
        bookmaker: selectedBookmaker.key,
        api_request_count: 1,
      });

    if (insertError) {
      console.log(`❌ Erreur sauvegarde: ${insertError.message}`);
    } else {
      console.log('✅ Snapshot sauvegardé avec succès!');
    }

    console.log(`\n💰 Crédits utilisés: ${client.getRequestCount()} requête(s)`);

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  }
}

run().catch(console.error);
