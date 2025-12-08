/**
 * Script de test API OddsPapi
 * Usage: npm run test:api
 */

import 'dotenv/config';
import { 
  checkApiStatus, 
  getSports, 
  getOdds,
  extractPinnacleOdds 
} from '../lib/api/oddspapi';
import { TARGET_SPORTS } from '../types';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(color: keyof typeof colors, msg: string) {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function main() {
  console.log('\n' + colors.bold + colors.cyan);
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║         ODDSPAPI - TEST DE CONNEXION              ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log(colors.reset);

  // Test 1: Connexion
  log('bold', '\n📡 Test 1: Connexion API');
  console.log('─'.repeat(40));

  const status = await checkApiStatus();
  
  if (!status.connected) {
    log('red', `❌ Connexion échouée: ${status.error}`);
    process.exit(1);
  }

  log('green', '✅ Connexion réussie!');
  console.log(`   Requêtes utilisées: ${status.requestsUsed || '?'}`);
  console.log(`   Requêtes restantes: ${status.requestsRemaining || '?'}`);

  // Test 2: Sports
  log('bold', '\n🏆 Test 2: Liste des sports');
  console.log('─'.repeat(40));

  const sportsResult = await getSports(true);
  
  if (!sportsResult.success || !sportsResult.data) {
    log('red', `❌ Impossible de récupérer les sports: ${sportsResult.error}`);
    process.exit(1);
  }

  const sports = sportsResult.data;
  log('green', `✅ ${sports.length} sports trouvés`);

  // Vérifier nos sports cibles
  log('bold', '\n🎯 Sports cibles:');
  
  for (const target of TARGET_SPORTS) {
    const found = sports.filter(s => 
      s.key.includes(target.key) || s.group.toLowerCase().includes(target.key)
    );
    
    if (found.length > 0) {
      log('green', `\n✅ ${target.name}:`);
      found.slice(0, 5).forEach(s => {
        const icon = s.active ? '🟢' : '⚪';
        console.log(`   ${icon} ${s.title} (${s.key})`);
      });
    } else {
      log('red', `\n❌ ${target.name}: Non trouvé`);
    }
  }

  // Test 3: Cotes avec Pinnacle
  log('bold', '\n🎲 Test 3: Cotes Pinnacle');
  console.log('─'.repeat(40));

  // Tester sur Premier League
  const oddsResult = await getOdds('soccer_epl', {
    regions: 'eu',
    markets: 'h2h',
    bookmakers: 'pinnacle',
  });

  if (!oddsResult.success || !oddsResult.data) {
    log('yellow', `⚠️ Pas de cotes disponibles: ${oddsResult.error}`);
    log('yellow', '   (Normal si aucun match en cours)');
  } else {
    const events = oddsResult.data;
    log('green', `✅ ${events.length} événements avec cotes`);

    // Vérifier Pinnacle
    let pinnacleFound = false;
    
    for (const event of events.slice(0, 3)) {
      const pinnacle = extractPinnacleOdds(event);
      
      console.log(`\n   ${event.home_team} vs ${event.away_team}`);
      console.log(`   Date: ${new Date(event.commence_time).toLocaleString('fr-FR')}`);
      
      if (pinnacle) {
        pinnacleFound = true;
        log('green', '   🎯 PINNACLE:');
        
        if (pinnacle.markets.h2h) {
          const h2h = pinnacle.markets.h2h;
          console.log(`      1X2: ${h2h[event.home_team]} / ${h2h['Draw'] || '-'} / ${h2h[event.away_team]}`);
        }
      } else {
        log('yellow', '   ⚠️ Pinnacle non disponible pour ce match');
        if (event.bookmakers) {
          console.log(`      Bookmakers: ${event.bookmakers.map(b => b.key).join(', ')}`);
        }
      }
    }

    if (pinnacleFound) {
      log('green', '\n✅ PINNACLE EST DISPONIBLE! 🎉');
    } else {
      log('yellow', '\n⚠️ Pinnacle non trouvé dans les résultats');
      log('cyan', '   → Essayer avec regions=us ou uk');
    }
  }

  // Résumé
  console.log('\n' + '═'.repeat(50));
  log('bold', '📊 RÉSUMÉ');
  console.log('═'.repeat(50));
  console.log(`API connectée: ${status.connected ? '✅' : '❌'}`);
  console.log(`Sports disponibles: ${sports.length}`);
  console.log(`Requêtes restantes: ${status.requestsRemaining || '?'}`);
  
  log('bold', '\n📋 PROCHAINES ÉTAPES:');
  console.log('1. npm run db:push     → Créer la base de données');
  console.log('2. npm run db:seed     → Initialiser les données');
  console.log('3. npm run sync:daily  → Synchroniser les cotes');
  console.log('4. npm run dev         → Lancer l\'application');
}

main().catch(console.error);
