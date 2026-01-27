import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    console.error('❌ ODDS_API_KEY non trouvée dans .env.local');
    return;
  }

  // URL fournie par le support
  const url = `https://api.the-odds-api.com/v4/historical/sports/soccer_france_ligue_one/events/0a6b4645e47cca769aa5d64c2df832a7/odds?apiKey=${apiKey}&date=2025-10-29T19:00:00Z&bookmakers=pinnacle&markets=draw_no_bet,btts,alternate_totals,alternate_spreads,h2h_h1,spreads_h1,totals_h1&oddsFormat=decimal&dateFormat=iso`;

  console.log('📡 Test du lien support Historical API...');
  console.log(`🔗 URL: ${url.replace(apiKey, 'REDACTED')}\n`);

  try {
    const response = await fetch(url);
    const data: any = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur API:', data);
      return;
    }

    console.log('✅ Réponse reçue !');
    console.log(`Timestamp Historical: ${data.timestamp}`);
    
    const bookmaker = data.data?.bookmakers?.[0];
    if (!bookmaker) {
      console.log('⚠️ Aucun bookmaker trouvé dans la réponse.');
      return;
    }

    console.log(`📚 Bookmaker: ${bookmaker.key}`);
    console.log(`📊 Marchés trouvés: ${bookmaker.markets.length}\n`);

    // Groupement par type de marché pour voir les variations
    const marketsByKey = new Map<string, any[]>();
    for (const m of bookmaker.markets) {
      if (!marketsByKey.has(m.key)) marketsByKey.set(m.key, []);
      marketsByKey.get(m.key)!.push(m);
    }

    for (const [key, list] of marketsByKey.entries()) {
      console.log(`🔹 Market: ${key.toUpperCase()}`);
      console.log(`   Variations: ${list.length}`);
      
      // Afficher un aperçu des points pour les alternatifs
      if (key.includes('alternate') || key.includes('spreads') || key.includes('totals')) {
        const points = list.map(m => m.outcomes[0]?.point).filter(p => p !== undefined);
        console.log(`   Points dispos: [${points.join(', ')}]`);
      }
      
      // Afficher le premier outcome pour vérification
      console.log(`   Exemple: ${JSON.stringify(list[0].outcomes[0])}`);
      console.log('---');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'appel:', error);
  }
}

run();
