import './load-env';
import { supabaseAdmin } from '@/lib/db';

async function main() {
  console.log('\n🔍 Vérification des odds disponibles en DB\n');

  // 1. Vérifier les marchés disponibles
  console.log('=== MARCHÉS DISPONIBLES ===\n');
  const { data: markets } = await supabaseAdmin
    .from('markets_v2')
    .select('id, oddsapi_key, market_type, period, handicap');

  if (markets) {
    const byType = {} as Record<string, any[]>;
    markets.forEach(m => {
      const key = `${m.market_type} (${m.period || 'fulltime'})`;
      if (!byType[key]) byType[key] = [];
      byType[key].push(m);
    });

    Object.entries(byType).forEach(([type, items]) => {
      console.log(`${type}:`);
      items.forEach(m => {
        console.log(`  - ${m.oddsapi_key}${m.handicap !== null ? ` (ligne ${m.handicap})` : ''}`);
      });
      console.log();
    });
  }

  // 2. Vérifier les outcomes pour chaque marché
  console.log('=== OUTCOMES PAR MARCHÉ ===\n');
  const { data: outcomes } = await supabaseAdmin
    .from('outcomes_v2')
    .select('id, market_id, normalized_name, display_name')
    .order('normalized_name');

  if (outcomes && markets) {
    const marketMap = new Map(markets.map(m => [m.id, m]));
    const byMarket = {} as Record<string, typeof outcomes>;

    outcomes.forEach(o => {
      const market = marketMap.get(o.market_id);
      const key = market?.oddsapi_key || 'unknown';
      if (!byMarket[key]) byMarket[key] = [];
      byMarket[key].push(o);
    });

    Object.entries(byMarket).forEach(([market, items]) => {
      console.log(`${market}:`);
      items.forEach(o => {
        console.log(`  - ${o.normalized_name} (${o.display_name || '-'})`);
      });
      console.log();
    });
  }

  // 3. Vérifier les odds réellement présentes en DB
  console.log('=== ODDS PRÉSENTES EN DB ===\n');
  const { data: oddsSample } = await supabaseAdmin
    .from('opening_closing_observed')
    .select('market_name, selection')
    .order('market_name')
    .limit(100);

  if (oddsSample) {
    const uniqueOdds = new Map<string, string[]>();

    oddsSample.forEach(o => {
      if (!uniqueOdds.has(o.market_name)) {
        uniqueOdds.set(o.market_name, []);
      }
      const selections = uniqueOdds.get(o.market_name)!;
      if (!selections.includes(o.selection)) {
        selections.push(o.selection);
      }
    });

    console.log('Marchés avec odds (de l\'API):');
    uniqueOdds.forEach((selections, market) => {
      console.log(`  ${market}: ${selections.sort().join(', ')}`);
    });
  }

  // 4. Compter les odds par marché
  console.log('\n=== NOMBRE D\'ODDS PAR MARCHÉ ===\n');
  const { data: counts } = await supabaseAdmin
    .from('opening_closing_observed')
    .select('market_name');

  if (counts) {
    const countByMarket = {} as Record<string, number>;
    counts.forEach(c => {
      countByMarket[c.market_name] = (countByMarket[c.market_name] || 0) + 1;
    });

    Object.entries(countByMarket)
      .sort((a, b) => b[1] - a[1])
      .forEach(([market, count]) => {
        console.log(`${market}: ${count} odds`);
      });
  }

  console.log('\n');
}

main().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
