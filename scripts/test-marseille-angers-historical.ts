#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.ODDS_API_KEY;
const BASE_URL = 'https://api.the-odds-api.com/v4';
const SPORT_KEY = 'soccer_france_ligue_one';
const HOME_TEAM_SEARCH = 'Marseille';
const AWAY_TEAM_SEARCH = 'Angers';

// Match Date: 2025-10-29T20:05:00Z
// On remonte jour par jour pour trouver l'apparition
const DATES_TO_CHECK = [
    '2025-10-18T12:00:00Z', // J-11
    '2025-10-19T12:00:00Z', // J-10
    '2025-10-20T12:00:00Z', // J-9
    '2025-10-21T12:00:00Z', // J-8
    '2025-10-22T12:00:00Z', // J-7
];

if (!API_KEY) {
  console.error('❌ Error: ODDS_API_KEY is not defined in .env.local');
  process.exit(1);
}

async function checkDate(date: string) {
  const url = new URL(`${BASE_URL}/historical/sports/${SPORT_KEY}/odds`);
  url.searchParams.append('apiKey', API_KEY!); 
  url.searchParams.append('regions', 'eu');
  url.searchParams.append('markets', 'h2h,spreads,totals');
  url.searchParams.append('date', date);
  url.searchParams.append('bookmakers', 'pinnacle');
  url.searchParams.append('oddsFormat', 'decimal');

  try {
    const response = await fetch(url.toString());
    const json = await response.json();
    const match = json.data?.find((e: any) => 
      (e.home_team.includes(HOME_TEAM_SEARCH) && e.away_team.includes(AWAY_TEAM_SEARCH))
    );

    if (match && match.bookmakers?.length > 0) {
        return match;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function run() {
  console.log('🔍 RECHERCHE DU PREMIER OPENING DISPONIBLE...\n');
  
  let firstOpening = null;
  let openingDate = '';

  for (const date of DATES_TO_CHECK) {
      process.stdout.write(`⏳ Vérification du ${date}... `);
      const result = await checkDate(date);
      if (result) {
          console.log('✅ TROUVÉ !');
          firstOpening = result;
          openingDate = date;
          break; // On s'arrête au premier trouvé
      } else {
          console.log('❌ Pas encore de cotes');
      }
  }

  if (firstOpening) {
      const pin = firstOpening.bookmakers[0];
      console.log('\n═══════════════════════════════════════════════════════');
      console.log(`🚀 PREMIER OPENING DÉTECTÉ`);
      console.log(`📅 Date du snapshot : ${openingDate}`);
      console.log(`🕒 Dernière MAJ Pinnacle : ${pin.last_update}`);
      console.log('═══════════════════════════════════════════════════════\n');

      pin.markets.forEach((m: any) => {
          console.log(`🔹 ${m.key.toUpperCase()}:`);
          m.outcomes.forEach((o: any) => {
              console.log(`   > ${o.name} ${o.point !== undefined ? '('+o.point+')' : ''}: ${o.price}`);
          });
      });
  } else {
      console.log('\n❌ Aucune cote trouvée dans la plage de dates testée.');
  }
}

run();