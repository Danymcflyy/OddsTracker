
import { NextResponse } from "next/server";
import { OddsPapiClient } from "@/lib/api/oddspapi";
import { supabaseAdmin } from "@/lib/db";
import type { Database } from "@/types/database";
import type {
  OddsPapiFixture,
  OddsPapiMarketOdds,
  OddsPapiTournament,
  OddsPapiTournamentOdds,
} from "@/lib/api/types";

export const dynamic = "force-dynamic";

/**
 * Ce script de test manuel effectue une synchronisation complète pour la Premier League,
 * mais se limite aux 5 premiers matchs trouvés pour des raisons de sécurité et de quota.
 *
 * Il va :
 * 1. Récupérer les informations sur le tournoi "Premier League".
 * 2. Récupérer tous les matchs à venir pour ce tournoi.
 * 3. Récupérer toutes les cotes pour ce tournoi.
 * 4. Traiter les 5 PREMIERS matchs :
 *    - Créer/Mettre à jour les équipes, le match (fixture).
 *    - Analyser la structure complexe des cotes.
 *    - Créer/Mettre à jour les marchés, les résultats (outcomes) et les cotes.
 * 5. Renvoyer un résumé des opérations.
 */
export async function GET() {
  console.log("🚀 Démarrage du test de synchronisation manuelle avec sauvegarde DB...");

  const client = new OddsPapiClient();
  const FOOTBALL_SPORT_ID = 10;
  const MATCH_LIMIT = 5;
  let summary = {
    fixturesProcessed: 0,
    teamsAdded: 0,
    fixturesAdded: 0,
    marketsAdded: 0,
    outcomesAdded: 0,
    oddsAdded: 0,
  };

  try {
    // ÉTAPE 1: Trouver la Premier League
    console.log("🔍 1/4 - Recherche du tournoi 'Premier League'...");
    const tournaments = await client.getTournaments(FOOTBALL_SPORT_ID);
    const premierLeague = tournaments.find(
      (t) =>
        t.tournamentName?.toLowerCase() === "premier league" &&
        t.categorySlug?.toLowerCase() === "england"
    );

    if (!premierLeague) {
      throw new Error("Premier League not found in tournaments list.");
    }
    console.log(`✅ Tournoi trouvé: ${premierLeague.tournamentName} (ID: ${premierLeague.tournamentId})`);
    
    // Upsert des méta-données (Sport, Pays, Championnat)
    const sport = await getOrCreate("sports", { oddspapi_id: FOOTBALL_SPORT_ID }, { name: "Football", slug: "football" });
    const country = await getOrCreate("countries", { name: premierLeague.categoryName }, { oddspapi_slug: premierLeague.categorySlug });
    const league = await getOrCreate("leagues", { oddspapi_id: premierLeague.tournamentId }, {
        name: premierLeague.tournamentName,
        slug: premierLeague.tournamentSlug,
        sport_id: sport.id,
        country_id: country.id,
    });


    // ÉTAPE 2: Récupérer les matchs à venir
    console.log("🔍 2/4 - Récupération des matchs à venir...");
    const upcomingFixtures = await client.getFixtures({ tournamentId: premierLeague.tournamentId });
    console.log(`✅ ${upcomingFixtures.length} matchs trouvés.`);


    // ÉTAPE 3: Récupérer les cotes
    console.log("🔍 3/4 - Récupération des cotes...");
    const oddsData = await client.getOddsByTournaments([premierLeague.tournamentId], { markets: "h2h,totals" });
    const oddsByFixtureId = new Map(oddsData.map((o) => [o.fixtureId, o]));
    console.log(`✅ ${oddsData.length} ensembles de cotes trouvés.`);


    // ÉTAPE 4: Traiter les 5 premiers matchs
    console.log(`⚙️ 4/4 - Traitement des ${MATCH_LIMIT} premiers matchs...`);
    const fixturesToProcess = upcomingFixtures.slice(0, MATCH_LIMIT);

    for (const fixtureData of fixturesToProcess) {
      // Upsert Équipes
      const homeTeam = await getOrCreate("teams", { name: fixtureData.homeTeam.name }, { oddspapi_id: fixtureData.homeTeam.id });
      if (homeTeam.isNew) summary.teamsAdded++;
      const awayTeam = await getOrCreate("teams", { name: fixtureData.awayTeam.name }, { oddspapi_id: fixtureData.awayTeam.id });
      if (awayTeam.isNew) summary.teamsAdded++;

      // Upsert Fixture
      const fixture = await getOrCreate("fixtures", { oddspapi_id: fixtureData.id }, {
        sport_id: sport.id,
        league_id: league.id,
        home_team_id: homeTeam.id,
        away_team_id: awayTeam.id,
        start_time: fixtureData.startTime,
        status: fixtureData.status,
      });
      if (fixture.isNew) summary.fixturesAdded++;
      summary.fixturesProcessed++;

      // Trouver et traiter les cotes correspondantes
      const fixtureOdds = oddsByFixtureId.get(fixtureData.id);
      if (fixtureOdds && fixtureOdds.markets) {
        // La réponse API utilise un objet où les clés sont des IDs, pas un tableau
        for (const market of Object.values(fixtureOdds.markets as unknown as Record<string, OddsPapiMarketOdds>)) {
          const dbMarket = await getOrCreate("markets", { oddspapi_id: market.marketId }, { name: market.marketName });
          if (dbMarket.isNew) summary.marketsAdded++;

          for (const outcome of market.outcomes) {
            const dbOutcome = await getOrCreate("outcomes", { oddspapi_id: outcome.outcomeId, market_id: dbMarket.id }, { name: outcome.outcomeName });
            if (dbOutcome.isNew) summary.outcomesAdded++;

            const {isNew} = await getOrCreate("odds", {
                fixture_id: fixture.id,
                market_id: dbMarket.id,
                outcome_id: dbOutcome.id
            }, {
                closing_price: outcome.price,
                closing_timestamp: outcome.lastUpdated,
            });
            if(isNew) summary.oddsAdded++;
          }
        }
      }
       console.log(`  - Match traité: ${fixtureData.homeTeam.name} vs ${fixtureData.awayTeam.name}`);
    }

    return NextResponse.json({
      message: `Test de synchronisation terminé avec succès pour ${MATCH_LIMIT} matchs.`,
      summary,
    });
  } catch (error) {
    console.error("❌ Erreur lors du test de synchronisation:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    const errorDetails = error instanceof Error && 'body' in error ? (error as any).body : null;
    return NextResponse.json({ error: "Erreur lors du test de synchronisation", details: errorMessage, body: errorDetails }, { status: 500 });
  }
}

// Helper générique pour faire un get-or-create (upsert)
type TableName = keyof Database['public']['Tables'];
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type UniqueColumns<T extends TableName> = Partial<TableRow<T>>;

async function getOrCreate<T extends TableName>(
    table: T, 
    uniqueColumns: UniqueColumns<T>, 
    insertData: Omit<TableInsert<T>, keyof UniqueColumns<T>>
): Promise<TableRow<T> & { isNew: boolean }> {
    
    const supabaseTable = supabaseAdmin as any;
    let query = supabaseTable.from(table).select().match(uniqueColumns).maybeSingle();
    const { data: existingRaw, error: selectError } = await query;
    if (selectError) throw new Error(`Erreur SELECT sur ${table}: ${selectError.message}`);
    const existing = existingRaw as TableRow<T> | null;

    if (existing) {
        return { ...existing, isNew: false };
    }

    const fullInsertData = { ...uniqueColumns, ...insertData };
    const { data: createdRaw, error: insertError } = await supabaseTable
        .from(table)
        .insert(fullInsertData as Record<string, unknown>)
        .select()
        .single();
    const created = createdRaw as TableRow<T> | null;

    if (insertError) {
        // Gérer le cas d'une "race condition" où l'enregistrement a été créé entre le SELECT et l'INSERT
        if (insertError.code === '23505') { // unique_violation
            const { data: finalRaw, error: finalSelectError } = await supabaseTable.from(table).select().match(uniqueColumns).single();
            if (finalSelectError) throw new Error(`Erreur SELECT après race condition sur ${table}: ${finalSelectError.message}`);
            const final = finalRaw as TableRow<T>;
            return { ...final, isNew: false };
        }
        throw new Error(`Erreur INSERT sur ${table}: ${insertError.message}`);
    }

    if (!created) {
        throw new Error(`INSERT sur ${table} n'a pas retourné de ligne`);
    }

    return { ...created, isNew: true };
}
