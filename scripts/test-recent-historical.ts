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

  console.log('🔍 TEST HISTORICAL - Match d\'au moins 1 semaine\n');

  // Date limite: 7 jours en arrière minimum
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  console.log(`📅 Cherche des matchs avant le: ${new Date(oneWeekAgo).toLocaleDateString('fr-FR')}\n`);

  // Chercher des matchs terminés d'au moins 1 semaine avec api_event_id
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'completed')
    .not('home_score', 'is', null)
    .not('away_score', 'is', null)
    .not('api_event_id', 'is', null)
    .lte('commence_time', oneWeekAgo)
    .order('commence_time', { ascending: false })
    .limit(5);

  if (error) {
    console.log('❌ Erreur DB:', error.message);
    return;
  }

  if (!events || events.length === 0) {
    console.log('❌ Aucun match terminé d\'au moins 1 semaine avec api_event_id trouvé');
    console.log('\nVérification: Y a-t-il des matchs terminés?\n');

    const { data: completedEvents } = await supabase
      .from('events')
      .select('id, home_team, away_team, api_event_id, home_score, away_score, commence_time')
      .eq('status', 'completed')
      .order('commence_time', { ascending: false })
      .limit(5);

    if (completedEvents && completedEvents.length > 0) {
      console.log(`✅ ${completedEvents.length} match(s) terminé(s) trouvé(s):\n`);
      completedEvents.forEach((e, i) => {
        console.log(`${i + 1}. ${e.home_team} vs ${e.away_team}`);
        console.log(`   Score: ${e.home_score ?? 'N/A'} - ${e.away_score ?? 'N/A'}`);
        console.log(`   Date: ${new Date(e.commence_time).toLocaleDateString('fr-FR')}`);
        console.log(`   API Event ID: ${e.api_event_id || '❌ MANQUANT'}\n`);
      });

      console.log('⚠️ Le problème: Les événements n\'ont pas d\'api_event_id');
    } else {
      console.log('⚠️ Aucun match terminé dans la base');
    }

    return;
  }

  console.log(`✅ ${events.length} match(s) avec api_event_id trouvé(s):\n`);
  events.forEach((e, i) => {
    console.log(`${i + 1}. ${e.home_team} vs ${e.away_team}`);
    console.log(`   Score: ${e.home_score} - ${e.away_score}`);
    console.log(`   Date: ${new Date(e.commence_time).toLocaleDateString('fr-FR')}`);
    console.log(`   Sport: ${e.sport_key}`);
    console.log(`   API Event ID: ${e.api_event_id}\n`);
  });

  const testEvent = events[0];

  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST HISTORICAL API');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`🏆 Match sélectionné: ${testEvent.home_team} vs ${testEvent.away_team}`);
  console.log(`   Score: ${testEvent.home_score} - ${testEvent.away_score}`);
  console.log(`   Date: ${new Date(testEvent.commence_time).toLocaleString('fr-FR')}`);
  console.log(`   Sport: ${testEvent.sport_key}`);
  console.log(`   API Event ID: ${testEvent.api_event_id}\n`);

  // Test closing time: 5 minutes avant le match
  const closingDate = new Date(new Date(testEvent.commence_time).getTime() - 5 * 60 * 1000).toISOString();
  console.log(`📅 Date closing (5 min avant kick-off): ${closingDate}\n`);

  // Test 1: Avec Pinnacle uniquement (1 requête = ~10 crédits)
  console.log('TEST 1: Historical avec PINNACLE uniquement\n');

  try {
    const result1 = await client.getHistoricalOdds(
      testEvent.sport_key,
      testEvent.api_event_id,
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
    console.log(`✅ Réponse Historical API`);
    console.log(`   Timestamp retourné: ${result1.data?.timestamp}`);
    console.log(`   Bookmakers Pinnacle: ${bookmakers1.length}\n`);

    if (bookmakers1.length > 0) {
      console.log('🎉 PINNACLE DISPONIBLE DANS HISTORICAL API !');
      bookmakers1.forEach(b => {
        console.log(`\n📚 ${b.key}:`);
        console.log(`   Last update: ${b.last_update}`);
        b.markets?.forEach(m => {
          console.log(`   ${m.key}:`);
          m.outcomes?.forEach(o => {
            console.log(`     ${o.name}: ${o.price}`);
          });
        });
      });
    } else {
      console.log('⚠️ Pinnacle absent à ce timestamp');
      console.log('   Raisons possibles:');
      console.log('   - Pinnacle ne couvre pas ce sport/événement');
      console.log('   - Délai avant disponibilité des données historiques');
      console.log('   - Pinnacle n\'avait pas de cotes à ce moment précis');
    }

  } catch (error: any) {
    console.log('❌ Erreur Historical API:', error.message);
    if (error.response?.data) {
      console.log('Détails:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 2: Sans filtre pour voir TOUS les bookmakers (1 requête = ~30 crédits)
  console.log('\n\nTEST 2: Historical SANS filtre (tous bookmakers)\n');

  try {
    const result2 = await client.getHistoricalOdds(
      testEvent.sport_key,
      testEvent.api_event_id,
      {
        date: closingDate,
        regions: 'eu',
        markets: 'h2h',
        // PAS de filtre bookmaker = récupère TOUS
        oddsFormat: 'decimal',
        dateFormat: 'iso',
      }
    );

    const bookmakers2 = result2.data?.data?.bookmakers || [];
    console.log(`✅ Réponse Historical API`);
    console.log(`   Timestamp: ${result2.data?.timestamp}`);
    console.log(`   Total bookmakers: ${bookmakers2.length}\n`);

    if (bookmakers2.length > 0) {
      console.log('📚 Bookmakers disponibles dans Historical:');
      bookmakers2.forEach(b => console.log(`   - ${b.key}`));

      const pinnacle = bookmakers2.find(b => b.key === 'pinnacle');
      if (pinnacle) {
        console.log('\n🎉 PINNACLE TROUVÉ !');
        console.log(`   Marchés: ${pinnacle.markets?.length || 0}`);
        pinnacle.markets?.forEach(m => {
          console.log(`\n   ${m.key}:`);
          m.outcomes?.forEach(o => {
            console.log(`     ${o.name}: ${o.price}`);
          });
        });
      } else {
        console.log('\n⚠️ Pinnacle absent de la réponse');
        console.log('   Mais d\'autres bookmakers sont disponibles ✅');
      }
    } else {
      console.log('⚠️ Aucun bookmaker disponible à ce timestamp');
      console.log('   Possibilité: Délai de disponibilité des données historiques');
    }

  } catch (error: any) {
    console.log('❌ Erreur:', error.message);
  }

  console.log(`\n\n📊 Crédits utilisés: ${client.getRequestCount()} requêtes`);
  console.log('   (Historical API coûte ~10 crédits/requête)');
}

run();
