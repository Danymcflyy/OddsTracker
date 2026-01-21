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
  console.log('VÉRIFICATION TABLE: closing_odds_snapshots');
  console.log('═══════════════════════════════════════════════════════\n');

  // Vérifier que la table existe
  const { data: tableCheck, error: checkError } = await supabase
    .from('closing_odds_snapshots')
    .select('*')
    .limit(5);

  if (checkError) {
    console.log('❌ Erreur:', checkError.message);
    console.log('\n⚠️ La table n\'existe pas ou il y a un problème de permissions\n');
    process.exit(1);
  }

  console.log(`✅ Table existe et accessible`);
  console.log(`📊 ${tableCheck?.length || 0} snapshot(s) actuellement\n`);

  if (tableCheck && tableCheck.length > 0) {
    console.log('═══════════════════════════════════════════════════════');
    console.log('DERNIERS SNAPSHOTS');
    console.log('═══════════════════════════════════════════════════════\n');

    for (const snapshot of tableCheck) {
      console.log(`📸 Snapshot ID: ${snapshot.id}`);
      console.log(`   Event ID: ${snapshot.event_id}`);
      console.log(`   Position: M${snapshot.minutes_before_kickoff}`);
      console.log(`   Bookmaker: ${snapshot.bookmaker}`);
      console.log(`   Capturé: ${new Date(snapshot.captured_at).toLocaleString('fr-FR')}`);
      console.log(`   Bookmaker MAJ: ${new Date(snapshot.bookmaker_last_update).toLocaleString('fr-FR')}`);
      console.log(`   Sélectionné: ${snapshot.is_selected ? '✅' : '⏳'}`);
      console.log(`   Marchés: ${Object.keys(snapshot.markets || {}).join(', ')}`);
      console.log('');
    }
  } else {
    console.log('ℹ️ Aucun snapshot capturé pour le moment (normal si pas de match dans M-10 à M+10)\n');
  }

  // Stats
  console.log('═══════════════════════════════════════════════════════');
  console.log('STATISTIQUES');
  console.log('═══════════════════════════════════════════════════════\n');

  const { data: stats } = await supabase
    .from('closing_odds_snapshots')
    .select('bookmaker, minutes_before_kickoff, is_selected');

  if (stats && stats.length > 0) {
    // Bookmakers
    const bookmakerCounts = stats.reduce((acc: any, s: any) => {
      acc[s.bookmaker] = (acc[s.bookmaker] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Par bookmaker:');
    Object.entries(bookmakerCounts).forEach(([bm, count]) => {
      console.log(`   ${bm}: ${count}`);
    });
    console.log('');

    // Positions
    const positionCounts = stats.reduce((acc: any, s: any) => {
      const pos = `M${s.minutes_before_kickoff}`;
      acc[pos] = (acc[pos] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Par position:');
    Object.entries(positionCounts)
      .sort(([a], [b]) => {
        const numA = parseInt(a.replace('M', ''));
        const numB = parseInt(b.replace('M', ''));
        return numB - numA;
      })
      .forEach(([pos, count]) => {
        console.log(`   ${pos}: ${count}`);
      });
    console.log('');

    // Sélectionnés
    const selectedCount = stats.filter((s: any) => s.is_selected).length;
    console.log(`📊 Snapshots sélectionnés: ${selectedCount} / ${stats.length}`);
    console.log('');
  } else {
    console.log('ℹ️ Aucune statistique disponible (table vide)\n');
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ Vérification terminée');
  console.log('═══════════════════════════════════════════════════════\n');
}

run().catch(console.error);
