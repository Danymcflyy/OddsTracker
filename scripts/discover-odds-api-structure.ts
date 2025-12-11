/**
 * Discovery Script - Explore Odds-API.io structure
 *
 * Récupère:
 * 1. Les sports disponibles
 * 2. Les ligues/tournois pour chaque sport
 * 3. Un événement par ligue pour analyser les marchés
 * 4. Les marchés Pinnacle réels
 *
 * Génère un rapport JSON pour configuration
 */

import "./load-env";
import { oddsApiClient } from "@/lib/api/oddsapi/client";

interface DiscoveryReport {
  timestamp: string;
  sports: {
    [sport: string]: {
      leagues: {
        [leagueKey: string]: {
          leagueName: string;
          eventCount: number;
          sample_event_id?: number;
          markets?: string[];
          outcomes?: {
            [market: string]: string[];
          };
        };
      };
    };
  };
}

const report: DiscoveryReport = {
  timestamp: new Date().toISOString(),
  sports: {},
};

async function main() {
  console.log("🔍 Starting Odds-API.io Discovery\n");

  try {
    // 1. Discover Football
    console.log("🏈 Discovering Football leagues...");
    await discoverFootball();

    // 2. Discover Tennis
    console.log("\n🎾 Discovering Tennis tournaments...");
    await discoverTennis();

    // 3. Save report
    console.log("\n💾 Saving discovery report...");
    const fs = await import("fs").then((m) => m.promises);
    await fs.writeFile(
      "/Users/perso/Desktop/OddsTracker/scripts/discovery-report.json",
      JSON.stringify(report, null, 2)
    );

    // 4. Generate summary
    console.log("\n📊 === DISCOVERY SUMMARY ===\n");
    for (const [sport, data] of Object.entries(report.sports)) {
      const leagueCount = Object.keys(data.leagues).length;
      console.log(`${sport}:`);
      console.log(`  Leagues/Tournaments found: ${leagueCount}`);
      for (const [key, league] of Object.entries(data.leagues)) {
        const markets = league.markets ? league.markets.length : 0;
        console.log(`    - ${league.leagueName} (${markets} markets)`);
      }
    }

    console.log(
      "\n✅ Discovery complete. Report saved to scripts/discovery-report.json"
    );
  } catch (error) {
    console.error("\n💥 Discovery failed:", error);
    process.exit(1);
  }
}

async function discoverFootball() {
  if (!report.sports["Football"]) {
    report.sports["Football"] = { leagues: {} };
  }

  // Ligues présumées à tester
  const presumedLeagues = [
    "england-premier-league",
    "spain-la-liga",
    "italy-serie-a",
    "germany-bundesliga",
    "france-ligue-1",
    "uefa-champions-league",
    "uefa-europa-league",
    "portugal-primeira-liga",
    "netherlands-eredivisie",
    "belgium-pro-league",
    "scotland-premiership",
    "turkey-super-lig",
    "austria-bundesliga",
    "switzerland-super-league",
    "greece-super-league",
  ];

  for (const leagueKey of presumedLeagues) {
    try {
      console.log(`  📋 ${leagueKey}...`);

      // Chercher d'abord les événements futurs
      let events = await oddsApiClient.getEvents({
        sport: "football",
        league: leagueKey,
        fromDate: new Date(),
        toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }).catch(() => null as any);

      // Si aucun événement futur, chercher les événements passés
      if (!events || events.length === 0) {
        events = await oddsApiClient.getEvents({
          sport: "football",
          league: leagueKey,
          fromDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          toDate: new Date(),
        }).catch(() => null as any);
      }

      if (!events || events.length === 0) {
        console.log(`     ⚠️  No events found (league may not exist or no odds available)`);
        continue;
      }

      const leagueName =
        events[0].league_title || leagueKey.replace(/-/g, " ");
      report.sports["Football"].leagues[leagueKey] = {
        leagueName,
        eventCount: events.length,
        sample_event_id: events[0].id,
      };

      console.log(`     ✅ Found ${events.length} events`);

      // Analyser les marchés du premier événement
      try {
        const odds = await oddsApiClient.getOdds(events[0].id);
        const pinnacle = odds.bookmakers?.find((b) => b.key === "Pinnacle" || b.key?.toLowerCase() === "pinnacle");

        if (pinnacle) {
          const markets = pinnacle.markets.map((m) => m.key);
          const outcomes: { [market: string]: string[] } = {};

          for (const market of pinnacle.markets) {
            outcomes[market.key] = market.outcomes.map((o) => o.name);
          }

          report.sports["Football"].leagues[leagueKey].markets = markets;
          report.sports["Football"].leagues[leagueKey].outcomes = outcomes;

          console.log(
            `     📈 Markets: ${markets.join(", ").substring(0, 60)}...`
          );
        }
      } catch (error) {
        console.log(`     ⚠️  Could not fetch odds details`);
      }
    } catch (error) {
      console.log(`     ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}

async function discoverTennis() {
  if (!report.sports["Tennis"]) {
    report.sports["Tennis"] = { leagues: {} };
  }

  // Tournois présumés - utiliser le sport slug "tennis" tout court
  const presumedTournaments = [
    // Grand Slams
    "australian-open",
    "roland-garros",
    "wimbledon",
    "us-open",

    // ATP Masters 1000
    "atp-indian-wells",
    "atp-miami",
    "atp-madrid",
    "atp-rome",
    "atp-montreal",
    "atp-cincinnati",
    "atp-shanghai",
    "atp-paris",

    // ATP Finals
    "atp-finals",

    // WTA 1000
    "wta-beijing",
    "wta-dubai",
    "wta-doha",

    // WTA Finals
    "wta-finals",
  ];

  // Essayer d'abord avec "tennis" comme sport slug
  const sportSlugs = ["tennis", "tennis_atp", "tennis_wta", "atp", "wta"];

  for (const tournamentKey of presumedTournaments) {
    let found = false;

    for (const sportSlug of sportSlugs) {
      if (found) break;

      try {
        console.log(`  📋 ${tournamentKey} (${sportSlug})...`);

        // Chercher d'abord les événements futurs
        let events = await oddsApiClient.getEvents({
          sport: sportSlug,
          league: tournamentKey,
          fromDate: new Date(),
          toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }).catch(() => null as any);

        // Si aucun événement futur, chercher les événements passés
        if (!events || events.length === 0) {
          events = await oddsApiClient.getEvents({
            sport: sportSlug,
            league: tournamentKey,
            fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            toDate: new Date(),
          }).catch(() => null as any);
        }

        if (!events || events.length === 0) {
          continue;
        }

        const tournamentName =
          events[0].league_title || tournamentKey.replace(/-/g, " ");
        report.sports["Tennis"].leagues[tournamentKey] = {
          leagueName: tournamentName,
          eventCount: events.length,
          sample_event_id: events[0].id,
        };

        console.log(`     ✅ Found ${events.length} events (sport: ${sportSlug})`);

        // Analyser les marchés
        try {
          const odds = await oddsApiClient.getOdds(events[0].id);
          const pinnacle = odds.bookmakers?.find((b) => b.key === "Pinnacle" || b.key?.toLowerCase() === "pinnacle");

          if (pinnacle) {
            const markets = pinnacle.markets.map((m) => m.key);
            const outcomes: { [market: string]: string[] } = {};

            for (const market of pinnacle.markets) {
              outcomes[market.key] = market.outcomes.map((o) => o.name);
            }

            report.sports["Tennis"].leagues[tournamentKey].markets = markets;
            report.sports["Tennis"].leagues[tournamentKey].outcomes = outcomes;

            console.log(
              `     📈 Markets: ${markets.join(", ").substring(0, 60)}...`
            );
          }
        } catch (error) {
          console.log(`     ⚠️  Could not fetch odds details`);
        }

        found = true;
      } catch (error) {
        // Continue trying other sport slugs
      }
    }

    if (!found) {
      console.log(`  📋 ${tournamentKey}... ⚠️  Not found in any sport slug`);
    }
  }
}

main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
