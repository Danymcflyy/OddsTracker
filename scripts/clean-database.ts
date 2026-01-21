#!/usr/bin/env npx tsx

/**
 * Clean Database - Vide les événements et market_states
 * Garde les sports et settings
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanDatabase() {
  console.log('🧹 Nettoyage de la base de données...\n');

  try {
    // 1. Compter les données avant
    const { count: eventsBefore } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    const { count: marketStatesBefore } = await supabase
      .from('market_states')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Avant nettoyage:');
    console.log(`  - Events: ${eventsBefore}`);
    console.log(`  - Market States: ${marketStatesBefore}\n`);

    // 2. Supprimer market_states (dépend de events)
    console.log('🗑️  Suppression des market_states...');
    const { error: marketError } = await supabase
      .from('market_states')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (marketError) {
      console.error('❌ Erreur lors de la suppression des market_states:', marketError);
      process.exit(1);
    }
    console.log('✅ Market states supprimés\n');

    // 3. Supprimer events
    console.log('🗑️  Suppression des events...');
    const { error: eventsError } = await supabase
      .from('events')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (eventsError) {
      console.error('❌ Erreur lors de la suppression des events:', eventsError);
      process.exit(1);
    }
    console.log('✅ Events supprimés\n');

    // 4. Vérifier
    const { count: eventsAfter } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    const { count: marketStatesAfter } = await supabase
      .from('market_states')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Après nettoyage:');
    console.log(`  - Events: ${eventsAfter}`);
    console.log(`  - Market States: ${marketStatesAfter}\n`);

    // 5. Vérifier que sports et settings sont toujours là
    const { count: sportsCount } = await supabase
      .from('sports')
      .select('*', { count: 'exact', head: true });

    const { count: settingsCount } = await supabase
      .from('app_settings')
      .select('*', { count: 'exact', head: true });

    console.log('✅ Données préservées:');
    console.log(`  - Sports: ${sportsCount}`);
    console.log(`  - Settings: ${settingsCount}\n`);

    console.log('🎉 Base de données nettoyée avec succès!\n');
    console.log('📝 Prochaines étapes:');
    console.log('  1. Accéder à http://localhost:3000/settings/data-collection');
    console.log('  2. Sélectionner quelques ligues (ex: EPL, La Liga)');
    console.log('  3. Sélectionner quelques marchés (ex: h2h, spreads, totals)');
    console.log('  4. Sauvegarder');
    console.log('  5. Lancer un scan: npm run test:opening-odds\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

cleanDatabase();
