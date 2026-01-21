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

  console.log('🔍 Vérification du schéma market_states...\n');

  const { data, error } = await supabase
    .from('market_states')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log('✅ Colonnes disponibles dans market_states:');
  console.log(Object.keys(data || {}).join('\n'));

  console.log('\n📊 Exemple de données:\n');
  console.log(JSON.stringify(data, null, 2));
}

run();
