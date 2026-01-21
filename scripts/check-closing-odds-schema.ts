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

  console.log('🔍 Vérification du schéma closing_odds\n');

  // Check existing rows
  const { data, error } = await supabase
    .from('closing_odds')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Erreur:', error.message);
    console.log('Détails:', JSON.stringify(error, null, 2));
  } else {
    if (data && data.length > 0) {
      console.log('✅ Colonnes existantes dans closing_odds:');
      console.log(Object.keys(data[0]).join(', '));
      console.log('\n📊 Exemple de données:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️ Table vide, création d\'un test...');

      // Try to insert a test row to discover schema
      const { error: insertError } = await supabase
        .from('closing_odds')
        .insert({
          event_id: '00000000-0000-0000-0000-000000000000',
          markets: { h2h: { home: 2.0, draw: 3.0, away: 2.5 } },
          captured_at: new Date().toISOString(),
          status: 'success'
        });

      if (insertError) {
        console.log('Erreur insertion test:', insertError.message);
      }
    }
  }
}

run();
