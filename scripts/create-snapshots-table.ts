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

  console.log('═══════════════════════════════════════════════════════');
  console.log('CRÉATION DE LA TABLE: closing_odds_snapshots');
  console.log('═══════════════════════════════════════════════════════\n');

  // Vérifier si la table existe déjà
  console.log('🔍 Vérification si la table existe...\n');

  const { data: existingData, error: existingError } = await supabase
    .from('closing_odds_snapshots')
    .select('id')
    .limit(1);

  if (!existingError) {
    console.log('✅ Table closing_odds_snapshots existe déjà!');
    console.log('ℹ️ Aucune action nécessaire.\n');
    return;
  }

  console.log('ℹ️ Table n\'existe pas encore. Création nécessaire...\n');
  console.log('📋 Pour créer la table, suivez ces étapes:\n');
  console.log('1. Allez sur: https://supabase.com/dashboard');
  console.log('2. Sélectionnez votre projet');
  console.log('3. Cliquez sur "SQL Editor" dans la sidebar');
  console.log('4. Cliquez sur "New query"');
  console.log('5. Copiez et collez le SQL ci-dessous:');
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('SQL À EXÉCUTER:');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`
CREATE TABLE IF NOT EXISTS closing_odds_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL,
  bookmaker_last_update TIMESTAMPTZ,
  minutes_before_kickoff INTEGER NOT NULL,
  markets JSONB NOT NULL,
  bookmaker TEXT NOT NULL,
  api_request_count INTEGER DEFAULT 1,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, minutes_before_kickoff, bookmaker)
);

CREATE INDEX idx_closing_snapshots_event ON closing_odds_snapshots(event_id);
CREATE INDEX idx_closing_snapshots_selected ON closing_odds_snapshots(event_id, is_selected);
CREATE INDEX idx_closing_snapshots_timing ON closing_odds_snapshots(minutes_before_kickoff);
CREATE INDEX idx_closing_snapshots_captured_at ON closing_odds_snapshots(captured_at);
`);

  console.log('═══════════════════════════════════════════════════════\n');
  console.log('6. Cliquez sur "Run" (ou Ctrl+Enter)');
  console.log('7. Vous devriez voir "Success. No rows returned"\n');
  console.log('Une fois fait, relancez ce script pour vérifier.\n');
}

run().catch(console.error);
