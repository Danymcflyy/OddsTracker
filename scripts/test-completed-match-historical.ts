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

  console.log('🔍 TEST HISTORICAL - Match terminé le plus ancien\n');

  // Chercher le match terminé le plus ancien avec api_event_id
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'completed')
    .not('home_score', 'is', null)
    .not('away_score', 'is', null)
    .not('api_event_id', 'is', null)
    .order('commence_time', { ascending: true }) // Le plus ancien d'abord
    .limit(1);

  if (error) {
    console.log('❌ Erreur DB:', error.message);
    return;
  }

  if (!events || events.length === 0) {
    console.log('❌ Aucun match terminé avec api_event_id trouvé');
    return;
  }

  const testEvent = events[0];
  const eventDate = new Date(testEvent.commence_time);
  const now = new Date();
  const hoursDiff = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60));

  console.log(`✅ Match trouvé:\n`);
  console.log(`   ${testEvent.home_team} vs ${testEvent.away_team}`);
  console.log(`   Score: ${testEvent.home_score} - ${testEvent.away_score}`);
  console.log(`   Date: ${eventDate.toLocaleString('fr-FR')}`);
  console.log(`   Il y a: ${hoursDiff} heures (${Math.floor(hoursDiff / 24)} jours)`);
  console.log(`   Sport: ${testEvent.sport_key}`);
  console.log(`   API Event ID: ${testEvent.api_event_id}\n`);

  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST HISTORICAL API');
  console.log('═══════════════════════════════════════════════════════\n');

  // Date closing: 5 minutes avant le match
  const closingDate = new Date(eventDate.getTime() - 5 * 60 * 1000).toISOString();
  console.log(`📅 Date closing testée (5 min avant): ${new Date(closingDate).toLocaleString('fr-FR')}\n`);

  // Test 1: Avec Pinnacle uniquement
  console.log('TEST 1: Avec filtre PINNACLE\n');

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
    console.log(`✅ Réponse reçue`);
    console.log(`   Timestamp: ${result1.data?.timestamp}`);
    console.log(`   Previous: ${result1.data?.previous_timestamp || 'N/A'}`);
    console.log(`   Next: ${result1.data?.next_timestamp || 'N/A'}`);
    console.log(`   Bookmakers Pinnacle: ${bookmakers1.length}\n`);

    if (bookmakers1.length > 0) {
      console.log('🎉 PINNACLE DISPONIBLE !');
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
      console.log('⚠️ Pinnacle absent pour ce timestamp');

      if (hoursDiff < 24) {
        console.log(`\n💡 Note: Le match date de moins de 24h`);
        console.log(`   Il se peut qu'il y ait un délai avant que les données Historical`);
        console.log(`   soient disponibles. Recommandation: Tester avec un match plus ancien.`);
      }
    }

  } catch (error: any) {
    console.log('❌ Erreur:', error.message);
    if (error.response?.data) {
      console.log('Détails:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // Test 2: Sans filtre
  console.log('\n\nTEST 2: SANS filtre bookmaker (tous)\n');

  try {
    const result2 = await client.getHistoricalOdds(
      testEvent.sport_key,
      testEvent.api_event_id,
      {
        date: closingDate,
        regions: 'eu',
        markets: 'h2h',
        // PAS de filtre
        oddsFormat: 'decimal',
        dateFormat: 'iso',
      }
    );

    const bookmakers2 = result2.data?.data?.bookmakers || [];
    console.log(`✅ Réponse reçue`);
    console.log(`   Timestamp: ${result2.data?.timestamp}`);
    console.log(`   Total bookmakers: ${bookmakers2.length}\n`);

    if (bookmakers2.length > 0) {
      console.log('📚 Bookmakers disponibles:');
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
        console.log('\n⚠️ Pinnacle non disponible');
        console.log('   Autres bookmakers sont OK ✅');
      }
    } else {
      console.log('⚠️ Aucun bookmaker disponible');

      if (hoursDiff < 168) { // 7 jours
        console.log(`\n💡 Match trop récent: ${Math.floor(hoursDiff / 24)} jours`);
        console.log(`   L'Historical API nécessite peut-être un délai minimum`);
        console.log(`   avant que les données soient archivées.`);
      }
    }

  } catch (error: any) {
    console.log('❌ Erreur:', error.message);
  }

  console.log(`\n\n📊 Total crédits utilisés: ${client.getRequestCount()} requêtes`);
  console.log(`   (Historical API: ~10 crédits/requête)\n`);

  console.log('═══════════════════════════════════════════════════════');
  console.log('CONCLUSION');
  console.log('═══════════════════════════════════════════════════════\n');

  if (hoursDiff < 168) {
    console.log('⏰ Le match testé est trop récent (< 7 jours)');
    console.log('\n💡 Recommandation:');
    console.log('   Pour tester vraiment l\'Historical API avec Pinnacle,');
    console.log('   il faudrait soit:');
    console.log('   1. Attendre 7 jours après un match');
    console.log('   2. Utiliser le workflow Pré-Kickoff pour closing odds (81% moins cher)');
  }
}

run();
