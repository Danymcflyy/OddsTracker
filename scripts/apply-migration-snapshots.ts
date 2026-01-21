#!/usr/bin/env npx tsx

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log('═══════════════════════════════════════════════════════');
  console.log('APPLICATION DE LA MIGRATION: closing_odds_snapshots');
  console.log('═══════════════════════════════════════════════════════\n');

  // Lire le fichier de migration
  const migrationPath = path.resolve(__dirname, '../supabase/migrations/20260121000000_create_closing_odds_snapshots.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Fichier de migration non trouvé:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📄 Migration SQL:\n');
  console.log(migrationSQL);
  console.log('\n═══════════════════════════════════════════════════════\n');

  // Exécuter la migration
  console.log('⚙️ Exécution de la migration...\n');

  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL }).catch(() => ({
    data: null,
    error: null,
  }));

  // Si la fonction RPC n'existe pas, essayer directement
  if (error || !data) {
    console.log('ℹ️ Tentative avec requête directe...\n');

    // Diviser en plusieurs requêtes
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    for (const statement of statements) {
      if (statement.includes('CREATE TABLE') || statement.includes('CREATE INDEX')) {
        try {
          const { error: execError } = await supabase.rpc('query', {
            query_text: statement + ';'
          }).catch(() => ({ error: null }));

          if (execError) {
            console.log(`⚠️ ${statement.substring(0, 50)}... → Peut-être déjà existant`);
          } else {
            console.log(`✅ ${statement.substring(0, 50)}...`);
          }
        } catch (e) {
          console.log(`⚠️ ${statement.substring(0, 50)}...`);
        }
      }
    }
  }

  // Vérifier que la table existe
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('VÉRIFICATION');
  console.log('═══════════════════════════════════════════════════════\n');

  const { data: tableCheck, error: checkError } = await supabase
    .from('closing_odds_snapshots')
    .select('id')
    .limit(1);

  if (checkError) {
    console.log('❌ Erreur:', checkError.message);
    console.log('\n⚠️ La migration doit être appliquée manuellement:');
    console.log('\n1. Allez sur: https://supabase.com/dashboard');
    console.log('2. Sélectionnez votre projet');
    console.log('3. SQL Editor → New query');
    console.log('4. Copiez le contenu de:');
    console.log('   supabase/migrations/20260121000000_create_closing_odds_snapshots.sql');
    console.log('5. Collez et exécutez (Run)\n');
    process.exit(1);
  }

  console.log('✅ Table closing_odds_snapshots créée avec succès!');
  console.log('\n📊 Structure de la table:');
  console.log('   - id (UUID)');
  console.log('   - event_id (UUID)');
  console.log('   - captured_at (TIMESTAMPTZ)');
  console.log('   - bookmaker_last_update (TIMESTAMPTZ)');
  console.log('   - minutes_before_kickoff (INTEGER)');
  console.log('   - markets (JSONB)');
  console.log('   - bookmaker (TEXT)');
  console.log('   - api_request_count (INTEGER)');
  console.log('   - is_selected (BOOLEAN)');
  console.log('   - created_at (TIMESTAMPTZ)');

  console.log('\n✅ Migration appliquée avec succès!\n');
}

run().catch(console.error);
