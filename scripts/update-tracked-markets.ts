#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('📊 Mise à jour des marchés suivis...\n');

  // Marchés recommandés pour Pinnacle (football)
  const recommendedMarkets = [
    'h2h',              // Match Winner (1X2)
    'spreads',          // Handicap (devient alternate_spreads à l'API)
    'totals',           // Over/Under (devient alternate_totals à l'API)
    'h2h_h1',           // 1ère Mi-Temps Winner
    'spreads_h1',       // 1ère Mi-Temps Handicap
    'totals_h1',        // 1ère Mi-Temps Over/Under
    'team_totals',      // Total buts par équipe
  ];

  // Marchés à RETIRER (non disponibles pour football)
  const marketsToRemove = [
    'h2h_h2',               // 2ème mi-temps (non dispo)
    'spreads_h2',           // 2ème mi-temps (non dispo)
    'totals_h2',            // 2ème mi-temps (non dispo)
    'alternate_team_totals', // Non disponible
  ];

  console.log('✅ Marchés recommandés pour Pinnacle Football:');
  recommendedMarkets.forEach(m => console.log(`  - ${m}`));

  console.log('\n❌ Marchés à retirer (non disponibles):');
  marketsToRemove.forEach(m => console.log(`  - ${m}`));

  // Mettre à jour (structure key-value)
  const { error } = await supabase
    .from('settings')
    .update({ value: recommendedMarkets })
    .eq('key', 'tracked_markets');

  if (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }

  console.log('\n✅ Marchés mis à jour avec succès!\n');
  console.log('💡 Note: Les market_states existants pour les anciens marchés restent en base');
  console.log('   mais ne seront plus scannés lors des prochaines découvertes.\n');
}

run();
