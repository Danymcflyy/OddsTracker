#!/usr/bin/env npx tsx

/**
 * Vérification des Données Capturées
 * Affiche un échantillon des données pour validation
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('📊 Vérification des données capturées...\n');

  try {
    // 1. Compter les événements
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Total événements: ${eventsCount}\n`);

    // 2. Prendre un événement avec des données
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        home_team,
        away_team,
        sport_key,
        market_states (
          id,
          market_key,
          status,
          opening_odds_variations
        )
      `)
      .limit(3);

    if (eventsError) {
      console.error('❌ Erreur:', eventsError);
      process.exit(1);
    }

    if (!events || events.length === 0) {
      console.log('⚠️  Aucun événement trouvé');
      process.exit(0);
    }

    // 3. Afficher les données de chaque événement
    for (const event of events) {
      console.log(`\n🏆 ${event.home_team} vs ${event.away_team}`);
      console.log(`   Ligue: ${event.sport_key}`);
      console.log(`   Markets:`);

      const marketStates = (event as any).market_states;

      if (!marketStates || marketStates.length === 0) {
        console.log('   ⚠️  Aucun market_state trouvé');
        continue;
      }

      // Grouper par market_key
      const byMarket = new Map<string, any[]>();
      for (const ms of marketStates) {
        if (!byMarket.has(ms.market_key)) {
          byMarket.set(ms.market_key, []);
        }
        byMarket.get(ms.market_key)!.push(ms);
      }

      for (const [marketKey, states] of byMarket.entries()) {
        const captured = states.filter(s => s.status === 'captured');
        const totalVariations = captured.reduce((sum, s) => {
          return sum + (s.opening_odds_variations?.length || 0);
        }, 0);

        console.log(`   ✅ ${marketKey}: ${totalVariations} variation(s)`);

        // Afficher un échantillon de données pour le premier marché
        if (captured.length > 0 && captured[0].opening_odds_variations) {
          const sample = captured[0].opening_odds_variations[0];
          console.log(`      Exemple:`, JSON.stringify(sample));
        }
      }
    }

    console.log('\n\n✅ Vérification terminée!\n');
    console.log('📝 Prochaine étape:');
    console.log('   Accéder à http://localhost:3000/football\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

run();
