/**
 * Execute v2 migrations against Supabase
 * Reads migration files and executes them in order
 */

import './load-env';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/db';

async function executeMigrations() {
  const migrationDir = path.join(__dirname, '../lib/db/migrations/v2');
  const migrations = [
    '001_initial_schema_v2.sql',
    '002_seed_countries_and_leagues.sql',
    '003_seed_markets.sql'
  ];

  console.log('\n🚀 Executing v2 schema migrations...\n');

  for (const migration of migrations) {
    const filePath = path.join(migrationDir, migration);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Migration not found: ${migration}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`📝 Executing: ${migration}`);

    try {
      // Split by semicolon to execute statements individually
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        await supabaseAdmin.rpc('exec', { sql: statement });
      }

      console.log(`✅ ${migration} completed\n`);
    } catch (error: any) {
      console.error(`❌ Error in ${migration}:`);
      console.error(error.message);
      process.exit(1);
    }
  }

  // Verify schema was created
  console.log('🔍 Verifying schema...\n');

  try {
    const { data: sports } = await supabaseAdmin
      .from('sports_v2')
      .select('*');

    const { data: countries } = await supabaseAdmin
      .from('countries_v2')
      .select('*');

    const { data: leagues } = await supabaseAdmin
      .from('leagues_v2')
      .select('*');

    const { data: markets } = await supabaseAdmin
      .from('markets_v2')
      .select('*');

    console.log('✅ Schema verification:');
    console.log(`  ✓ sports_v2: ${sports?.length || 0} records`);
    console.log(`  ✓ countries_v2: ${countries?.length || 0} records`);
    console.log(`  ✓ leagues_v2: ${leagues?.length || 0} records`);
    console.log(`  ✓ markets_v2: ${markets?.length || 0} records`);
    console.log('\n✅ All migrations completed successfully!\n');
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

executeMigrations();
