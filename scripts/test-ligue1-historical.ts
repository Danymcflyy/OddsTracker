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

  console.log('🔍 TEST HISTORICAL - Ligue 1 (dernier week-end)\n');

  // Chercher un match de Ligue 1 terminé du week-end dernier
  const weekendStart = new Date('2026-01-17T00:00:00Z'); // Vendredi
  const weekendEnd = new Date('2026-01-20T23:59:59Z');   // Lundi

  console.log(`📅 Recherche de matchs entre:`);
  console.log(`   ${weekendStart.toLocaleDateString('fr-FR')}`);
  console.log(`   ${weekendEnd.toLocaleDateString('fr-FR')}\n`);

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('sport_key', 'soccer_france_ligue_one')
    .eq('status', 'completed')
    .gte('commence_time', weekendStart.toISOString())
    .lte('commence_time', weekendEnd.toISOString())
    .not('home_score', 'is', null)
    .not('away_score', 'is', null)
    .order('commence_time', { ascending: false })
    .limit(3);

  if (error) {
    console.log('❌ Erreur DB:', error.message);
    return;
  }

  if (!events || events.length === 0) {
    console.log('⚠️ Aucun match de Ligue 1 trouvé pour ce week-end');
    console.log('\nEssayons avec tous les matchs récents de Ligue 1...\n');

    const { data: recentEvents } = await supabase
      .from('events')
      .select('*')
      .eq('sport_key', 'soccer_france_ligue_one')
      .eq('status', 'completed')
      .not('home_score', 'is', null)
      .not('api_id', 'is', null)
      .order('commence_time', { ascending: false })
      .limit(3);

    if (!recentEvents || recentEvents.length === 0) {
      console.log('❌ Aucun match de Ligue 1 terminé trouvé');
      return;
    }

    console.log(`✅ ${recentEvents.length} match(s) récent(s) trouvé(s):\n`);
    recentEvents.forEach((e, i) => {
      console.log(`${i + 1}. ${e.home_team} vs ${e.away_team}`);
      console.log(`   Score: ${e.home_score} - ${e.away_score}`);
      console.log(`   Date: ${new Date(e.commence_time).toLocaleDateString('fr-FR')}`);
      console.log(`   API ID: ${e.api_id || 'N/A'}\n`);
    });

    // Utiliser le premier match qui a un api_id
    const testEvent = recentEvents.find(e => e.api_id);

    if (!testEvent) {
      console.log('❌ Aucun match avec api_id trouvé');
      return;
    }

    await testHistoricalOdds(client, testEvent);
    return;
  }

  console.log(`✅ ${events.length} match(s) du week-end trouvé(s):\n`);
  events.forEach((e, i) => {
    console.log(`${i + 1}. ${e.home_team} vs ${e.away_team}`);
    console.log(`   Score: ${e.home_score} - ${e.away_score}`);
    console.log(`   Date: ${new Date(e.commence_time).toLocaleString('fr-FR')}`);
    console.log(`   API ID: ${e.api_id || 'N/A'}\n`);
  });

  // Utiliser le premier match qui a un api_id
  const testEvent = events.find(e => e.api_id);

  if (!testEvent) {
    console.log('⚠️ Aucun match avec api_id, impossible de tester Historical API');
    return;
  }

  await testHistoricalOdds(client, testEvent);
}

async function testHistoricalOdds(client: any, event: any) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST HISTORICAL API');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`🏆 Match sélectionné: ${event.home_team} vs ${event.away_team}`);
  console.log(`   Score: ${event.home_score} - ${event.away_score}`);
  console.log(`   Kick-off: ${new Date(event.commence_time).toLocaleString('fr-FR')}`);
  console.log(`   API ID: ${event.api_id}\n`);

  // Test 1: Avec Pinnacle uniquement
  console.log('TEST 1: Historical API avec filtre Pinnacle\n');

  const closingDate = new Date(new Date(event.commence_time).getTime() - 5 * 60 * 1000).toISOString();
  console.log(`📅 Date closing (5 min avant): ${closingDate}\n`);

  try {
    const result1 = await client.getHistoricalOdds(
      event.sport_key,
      event.api_id,
      {
        date: closingDate,
        regions: 'eu',
        markets: 'h2h',
        bookmakers: 'pinnacle',
        oddsFormat: 'decimal',
        dateFormat: 'iso',
      }
    );

    const bookmakers1 = result1.data?.data?.bookmakers || [];
    console.log(`✅ Réponse reçue`);
    console.log(`   Timestamp: ${result1.data?.timestamp}`);
    console.log(`   Bookmakers avec Pinnacle: ${bookmakers1.length}\n`);

    if (bookmakers1.length > 0) {
      console.log('🎉 PINNACLE TROUVÉ DANS HISTORICAL API !');
      bookmakers1.forEach(b => {
        console.log(`\n📚 ${b.key}:`);
        b.markets?.forEach(m => {
          console.log(`   ${m.key}:`, m.outcomes?.map(o => `${o.name}:${o.price}`).join(', '));
        });
      });
    } else {
      console.log('⚠️ Pinnacle absent pour ce match/timestamp');
    }

  } catch (error: any) {
    console.log('❌ Erreur:', error.message);
  }

  // Test 2: Sans filtre pour voir tous les bookmakers disponibles
  console.log('\n\nTEST 2: Historical API SANS filtre bookmaker\n');

  try {
    const result2 = await client.getHistoricalOdds(
      event.sport_key,
      event.api_id,
      {
        date: closingDate,
        regions: 'eu',
        markets: 'h2h',
        // PAS de filtre bookmaker
        oddsFormat: 'decimal',
        dateFormat: 'iso',
      }
    );

    const bookmakers2 = result2.data?.data?.bookmakers || [];
    console.log(`✅ Réponse reçue`);
    console.log(`   Timestamp: ${result2.data?.timestamp}`);
    console.log(`   Bookmakers totaux: ${bookmakers2.length}\n`);

    if (bookmakers2.length > 0) {
      console.log('📚 Liste des bookmakers disponibles:');
      bookmakers2.forEach(b => console.log(`   - ${b.key}`));

      const hasPinnacle = bookmakers2.some(b => b.key === 'pinnacle');
      if (hasPinnacle) {
        console.log('\n🎉 PINNACLE EST DISPONIBLE !');
      } else {
        console.log('\n⚠️ Pinnacle absent de la liste');
      }
    } else {
      console.log('⚠️ Aucun bookmaker disponible à ce timestamp');
    }

  } catch (error: any) {
    console.log('❌ Erreur:', error.message);
  }

  console.log(`\n\n📊 Total crédits utilisés: ${client.getRequestCount()} requêtes`);
}

run();
