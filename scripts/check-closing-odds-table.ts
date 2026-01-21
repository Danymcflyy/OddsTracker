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

  console.log('🔍 Vérification de la table closing_odds...\n');

  const { data, error } = await supabase
    .from('closing_odds')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Table closing_odds:', error.message);
    console.log('\n💡 La table closing_odds n\'existe pas ou est vide');
    console.log('   Les colonnes "Clôture" resteront donc vides pour le moment\n');
    return;
  }

  console.log('✅ Table closing_odds existe!');
  console.log('Colonnes:', Object.keys(data?.[0] || {}).join(', '));
  console.log('\nExemple:', JSON.stringify(data?.[0], null, 2));
}

run();
