/**
 * Test direct de l'API Odds-API.io
 * Pour diagnostiquer le problème HTTP 400
 */

// Charger les variables d'environnement EN PREMIER
import './load-env';

const API_KEY = process.env.ODDS_API_IO_KEY;
const BASE_URL = 'https://api2.odds-api.io/v3';

async function testAPI() {
  console.log('🔍 Test direct de l\'API Odds-API.io\n');
  console.log('='.repeat(60));

  if (!API_KEY) {
    console.error('❌ ODDS_API_IO_KEY non trouvée');
    process.exit(1);
  }

  console.log(`✅ API Key trouvée: ${API_KEY.substring(0, 20)}...`);
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  // Test 1: Récupérer tous les événements sans filtre sport
  console.log('📋 TEST 1: Récupération de tous les événements');
  console.log('-'.repeat(60));

  try {
    const url1 = `${BASE_URL}/events?apiKey=${API_KEY}`;
    console.log(`URL: ${url1}\n`);

    const response1 = await fetch(url1);
    console.log(`Status: ${response1.status} ${response1.statusText}`);

    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`✅ Succès! ${data1.length} événements reçus`);

      if (data1.length > 0) {
        const sports = new Set(data1.map((e: any) => e.sport_key));
        console.log(`\n📊 Sports disponibles: ${Array.from(sports).join(', ')}`);

        // Afficher quelques exemples
        console.log(`\n📋 Exemples d'événements:`);
        data1.slice(0, 3).forEach((event: any) => {
          console.log(`   • ${event.sport_key} | ${event.league_key} | ${event.home_team} vs ${event.away_team}`);
        });
      }
    } else {
      const errorText = await response1.text();
      console.error(`❌ Erreur: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }

  console.log('\n' + '='.repeat(60));

  // Test 2: Avec filtre sport=football
  console.log('📋 TEST 2: Récupération avec sport=football');
  console.log('-'.repeat(60));

  try {
    const url2 = `${BASE_URL}/events?apiKey=${API_KEY}&sport=football`;
    console.log(`URL: ${url2}\n`);

    const response2 = await fetch(url2);
    console.log(`Status: ${response2.status} ${response2.statusText}`);

    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`✅ Succès! ${data2.length} événements football reçus`);

      if (data2.length > 0) {
        const leagues = new Set(data2.map((e: any) => e.league_key));
        console.log(`\n📊 ${leagues.size} ligues football disponibles`);
        console.log(`Exemples: ${Array.from(leagues).slice(0, 5).join(', ')}`);
      }
    } else {
      const errorText = await response2.text();
      console.error(`❌ Erreur: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }

  console.log('\n' + '='.repeat(60));

  // Test 3: Avec filtre sport=soccer
  console.log('📋 TEST 3: Récupération avec sport=soccer');
  console.log('-'.repeat(60));

  try {
    const url3 = `${BASE_URL}/events?apiKey=${API_KEY}&sport=soccer`;
    console.log(`URL: ${url3}\n`);

    const response3 = await fetch(url3);
    console.log(`Status: ${response3.status} ${response3.statusText}`);

    if (response3.ok) {
      const data3 = await response3.json();
      console.log(`✅ Succès! ${data3.length} événements soccer reçus`);

      if (data3.length > 0) {
        const leagues = new Set(data3.map((e: any) => e.league_key));
        console.log(`\n📊 ${leagues.size} ligues soccer disponibles`);
        console.log(`Exemples: ${Array.from(leagues).slice(0, 5).join(', ')}`);
      }
    } else {
      const errorText = await response3.text();
      console.error(`❌ Erreur: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Erreur réseau:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Tests terminés\n');
}

// Exécution
testAPI().catch(console.error);
