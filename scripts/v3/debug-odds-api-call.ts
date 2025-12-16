/**
 * Debug - Appel direct à l'API pour les cotes
 * Pour comprendre l'erreur HTTP 400
 */

// Charger les variables d'environnement EN PREMIER
import './load-env';

import { supabaseAdmin } from '@/lib/db';

const API_KEY = process.env.ODDS_API_IO_KEY;
const BASE_URL = 'https://api2.odds-api.io/v3';

async function debugOddsApiCall() {
  console.log('🔍 DEBUG - Appel API pour les cotes\n');
  console.log('='.repeat(60));

  try {
    // Récupérer quelques matchs de la base
    const { data: matches } = await supabaseAdmin
      .from('matches')
      .select(`
        id,
        oddsapi_id,
        match_date,
        status,
        home_team:teams!matches_home_team_id_fkey(display_name),
        away_team:teams!matches_away_team_id_fkey(display_name)
      `)
      .eq('status', 'scheduled')
      .gte('match_date', new Date().toISOString())
      .order('match_date', { ascending: true })
      .limit(5);

    if (!matches || matches.length === 0) {
      console.log('❌ Aucun match trouvé avec status=scheduled');
      return;
    }

    console.log(`✅ ${matches.length} matchs trouvés:\n`);
    matches.forEach((m: any) => {
      console.log(`  • ID ${m.oddsapi_id}: ${m.home_team?.display_name} vs ${m.away_team?.display_name}`);
      console.log(`    Date: ${m.match_date}, Status: ${m.status}`);
    });

    // Prendre juste le premier match pour tester
    const eventId = matches[0].oddsapi_id;
    console.log(`\n📡 Test API pour event ID: ${eventId}`);
    console.log('-'.repeat(60));

    // Test 1: Endpoint /v3/odds avec eventId
    console.log('\n📋 TEST 1: GET /v3/odds?eventId=' + eventId);
    const url1 = `${BASE_URL}/odds?eventId=${eventId}&bookmakers=Pinnacle&markets=h2h,totals,spreads&apiKey=${API_KEY}`;
    console.log(`URL: ${url1.substring(0, 100)}...`);

    const response1 = await fetch(url1);
    console.log(`Status: ${response1.status} ${response1.statusText}`);

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Succès!');
      console.log('Structure:', JSON.stringify(data1, null, 2).substring(0, 500) + '...');
    } else {
      const error1 = await response1.text();
      console.log('❌ Erreur:', error1);
    }

    // Test 2: Endpoint /v3/odds/multi avec eventIds
    console.log('\n📋 TEST 2: GET /v3/odds/multi?eventIds=' + eventId);
    const url2 = `${BASE_URL}/odds/multi?eventIds=${eventId}&bookmakers=Pinnacle&markets=h2h,totals,spreads&apiKey=${API_KEY}`;
    console.log(`URL: ${url2.substring(0, 100)}...`);

    const response2 = await fetch(url2);
    console.log(`Status: ${response2.status} ${response2.statusText}`);

    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Succès!');
      console.log('Array length:', Array.isArray(data2) ? data2.length : 'Not an array');
      if (Array.isArray(data2) && data2.length > 0) {
        console.log('Premier élément:', JSON.stringify(data2[0], null, 2).substring(0, 500) + '...');
      }
    } else {
      const error2 = await response2.text();
      console.log('❌ Erreur:', error2);
    }

    // Test 3: Plusieurs IDs
    if (matches.length > 1) {
      const eventIds = matches.slice(0, 3).map((m: any) => m.oddsapi_id).join(',');
      console.log('\n📋 TEST 3: GET /v3/odds/multi avec plusieurs IDs');
      const url3 = `${BASE_URL}/odds/multi?eventIds=${eventIds}&bookmakers=Pinnacle&markets=h2h&apiKey=${API_KEY}`;
      console.log(`URL: ${url3.substring(0, 100)}...`);

      const response3 = await fetch(url3);
      console.log(`Status: ${response3.status} ${response3.statusText}`);

      if (response3.ok) {
        const data3 = await response3.json();
        console.log('✅ Succès!');
        console.log('Array length:', Array.isArray(data3) ? data3.length : 'Not an array');
      } else {
        const error3 = await response3.text();
        console.log('❌ Erreur:', error3);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Debug terminé\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

debugOddsApiCall().catch(console.error);
