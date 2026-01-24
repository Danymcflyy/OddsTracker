import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  // Vérifier les colonnes de la table market_states
  const { data: columns, error: colError } = await supabase.rpc('get_table_columns', {
    table_name: 'market_states'
  }).maybeSingle();

  // Alternative: récupérer un row et voir les clés
  const { data: sample, error } = await supabase
    .from('market_states')
    .select('*')
    .eq('status', 'captured')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== COLONNES DISPONIBLES ===');
  console.log(Object.keys(sample));
  console.log('');

  console.log('=== DÉTAIL DU SAMPLE ===');
  console.log(JSON.stringify(sample, null, 2));

  // Chercher un spreads avec variations
  const { data: spreadsData } = await supabase
    .from('market_states')
    .select('*')
    .eq('market_key', 'spreads')
    .eq('status', 'captured')
    .limit(3);

  console.log('\n=== SPREADS CAPTURÉS ===');
  for (const ms of spreadsData || []) {
    console.log(`\n--- Event ${ms.event_id} ---`);
    console.log('opening_odds:', JSON.stringify(ms.opening_odds, null, 2));
    console.log('opening_odds_variations:', JSON.stringify(ms.opening_odds_variations, null, 2));
  }
}

main().catch(console.error);
