import { supabaseAdmin } from '../lib/supabase/admin';
import { scanAllOpeningOdds } from '../lib/services/theoddsapi/opening-odds';

async function main() {
  console.log('\n🔍 TEST: Scan Complet avec Nouveaux Corrections\n');

  // Find events with pending markets
  const { data: marketStates } = await supabaseAdmin
    .from('market_states')
    .select(`
      event_id,
      events(
        id,
        api_id,
        home_team,
        away_team,
        sport:sports(key)
      )
    `)
    .eq('status', 'pending')
    .limit(1);

  if (!marketStates || marketStates.length === 0) {
    console.log('❌ Aucun marché pending trouvé');
    return;
  }

  const event = (marketStates[0] as any).events;

  if (!event) {
    console.log('❌ Aucun événement trouvé');
    return;
  }

  console.log(`📅 Événement trouvé: ${event.home_team} vs ${event.away_team}`);
  console.log(`   Event DB ID: ${event.id}`);
  console.log(`   Event API ID: ${event.api_id}\n`);

  console.log('🏃 Lancement du scan des cotes d\'ouverture...\n');

  const result = await scanAllOpeningOdds();

  console.log('\n' + '='.repeat(80));
  console.log('RÉSULTAT DU SCAN');
  console.log('='.repeat(80) + '\n');

  console.log(`✅ Marchés capturés: ${result.captured}`);
  console.log(`💰 Crédits utilisés: ${result.creditsUsed}`);
  console.log(`❌ Erreurs: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log('\nErreurs rencontrées:');
    result.errors.forEach(err => console.log(`  - ${err}`));
  }

  console.log('\n' + '='.repeat(80));
  console.log('VÉRIFICATION EN BASE DE DONNÉES');
  console.log('='.repeat(80) + '\n');

  // Check the stored data
  const { data: updatedEvent } = await supabaseAdmin
    .from('events')
    .select(`
      id,
      home_team,
      away_team,
      market_states(
        market_key,
        status,
        opening_odds,
        opening_odds_variations
      )
    `)
    .eq('id', event.id)
    .single();

  if (updatedEvent) {
    console.log(`📊 Événement: ${(updatedEvent as any).home_team} vs ${(updatedEvent as any).away_team}\n`);

    (updatedEvent as any).market_states.forEach((ms: any) => {
      console.log(`Market: ${ms.market_key}`);
      console.log(`  Status: ${ms.status}`);

      if (ms.opening_odds_variations && ms.opening_odds_variations.length > 0) {
        console.log(`  Variations: ${ms.opening_odds_variations.length}`);

        // Show first variation
        console.log(`  Exemple (1ère variation):`);
        console.log(`    ${JSON.stringify(ms.opening_odds_variations[0])}`);

        // Show second variation if exists
        if (ms.opening_odds_variations.length > 1) {
          console.log(`  Exemple (2ème variation):`);
          console.log(`    ${JSON.stringify(ms.opening_odds_variations[1])}`);
        }
      } else {
        console.log(`  ⚠️ Aucune variation stockée`);
      }
      console.log('');
    });
  }

  console.log('✅ Test terminé');
}

main();
