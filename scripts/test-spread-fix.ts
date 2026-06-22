/**
 * Test d'intégration pour la correction des bugs de spreads
 * 1. Bug J League : handicaps côté "away" uniquement ignorés
 * 2. Bug Sunderland : doublons miroirs (H+1.5 / H-1.5)
 */

import { extractOddsFromMarket, mergeVariationsByPoint } from '../lib/services/theoddsapi/utils';

// ─────────────────────────────────────────────────────────────────────────────
// DONNÉES DE TEST
// ─────────────────────────────────────────────────────────────────────────────

// Scénario 1 – J League : l'API renvoie le handicap 2.0 UNIQUEMENT du côté Away
const jLeagueMarket = {
  key: 'alternate_spreads',
  outcomes: [
    // Handicaps du côté Home (points négatifs = favoris)
    { name: 'Shimizu S Pulse', point: -0.25, price: 1.96 },
    { name: 'Avispa Fukuoka',  point:  0.25, price: 1.85 },
    { name: 'Shimizu S Pulse', point: -0.5,  price: 2.16 },
    { name: 'Avispa Fukuoka',  point:  0.5,  price: 1.69 },
    // Handicap 2.0 présent UNIQUEMENT du côté Away (bug !)
    { name: 'Avispa Fukuoka',  point: 2.0,   price: 1.20 },
    // Pas de ligne "Shimizu S Pulse, point: -2.0" dans la réponse
  ],
};

// Scénario 2 – Sunderland : l'API renvoie les deux miroirs (+1.5 ET -1.5)
const sunderlandMarket = {
  key: 'alternate_spreads',
  outcomes: [
    { name: 'Sunderland',        point:  1.5,  price: 1.31 },
    { name: 'Manchester United', point: -1.5,  price: 3.37 },
    // Miroir redondant renvoyé par l'API
    { name: 'Sunderland',        point: -1.5,  price: 3.37 },
    { name: 'Manchester United', point:  1.5,  price: 1.31 },
    // Autre ligne normale
    { name: 'Sunderland',        point:  0.5,  price: 1.97 },
    { name: 'Manchester United', point: -0.5,  price: 1.85 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER : afficher les résultats
// ─────────────────────────────────────────────────────────────────────────────
function printResults(label: string, variations: any[]) {
  console.log(`\n${label}`);
  console.log('Points trouvés :', variations.map(v => v.point).join(', '));
  variations.forEach(v => {
    console.log(`  point=${v.point} | home=${v.home ?? '—'} | away=${v.away ?? '—'}`);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1 – J League : le point -2.0 (miroir du away 2.0) doit apparaître
// ─────────────────────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════');
console.log('TEST 1 : Handicap manquant (J League)');
console.log('═══════════════════════════════════════');

const jResults = extractOddsFromMarket(
  jLeagueMarket as any,
  'Shimizu S Pulse',
  'Avispa Fukuoka'
);
const jMerged = mergeVariationsByPoint(jResults);
printResults('→ Résultats extraits :', jMerged);

const has2 = jMerged.some(v => Math.abs(v.point ?? 0) === 2);
console.log(has2
  ? '✅ PASS : Le handicap 2.0 est bien présent.'
  : '❌ FAIL : Le handicap 2.0 EST TOUJOURS ABSENT.');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2 – Sunderland : on ne doit PAS avoir H+1.5 ET H-1.5 comme deux lignes
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════');
console.log('TEST 2 : Doublons miroirs (Sunderland)');
console.log('═══════════════════════════════════════');

const sResults = extractOddsFromMarket(
  sunderlandMarket as any,
  'Sunderland',
  'Manchester United'
);
const sMerged = mergeVariationsByPoint(sResults);
printResults('→ Résultats extraits :', sMerged);

const points = sMerged.map(v => v.point ?? 0);
const hasDuplicate1_5 = points.filter(p => Math.abs(p) === 1.5).length > 1;
const hasDuplicate0_5 = points.filter(p => Math.abs(p) === 0.5).length > 1;

console.log(!hasDuplicate1_5
  ? '✅ PASS : Pas de doublon pour le handicap 1.5.'
  : '❌ FAIL : Doublon 1.5 toujours présent.');
console.log(!hasDuplicate0_5
  ? '✅ PASS : Pas de doublon pour le handicap 0.5.'
  : '❌ FAIL : Doublon 0.5 toujours présent.');

const totalExpected = 2; // 0.5 et 1.5 uniquement
console.log(sMerged.length === totalExpected
  ? `✅ PASS : ${sMerged.length} variation(s) au total (attendu: ${totalExpected}).`
  : `❌ FAIL : ${sMerged.length} variation(s) au total (attendu: ${totalExpected}).`);

console.log('\nDone.');
