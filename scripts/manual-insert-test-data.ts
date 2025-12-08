import { PrismaClient } from "@prisma/client";
import type { MarketType } from "@prisma/client";

// More realistic test data including various markets and periods
const testData = {
  events: [
    {
      id: "evt_1",
      sport_id: 10,
      start_time: "2025-12-08T20:00:00Z",
      home_team: "West Ham United",
      away_team: "Crystal Palace",
      tournament_id: 1980,
      tournament_name: "Premier League",
      country_slug: "england",
      markets: {
        // Full-Time H2H (Moneyline)
        "10208": {
          outcomes: {
            "10208": { players: { "0": { bookmakerOutcomeId: "home", price: 2.2 } } },
            "10209": { players: { "0": { bookmakerOutcomeId: "draw", price: 3.4 } } },
            "10210": { players: { "0": { bookmakerOutcomeId: "away", price: 3.4 } } },
          },
          bookmakerMarketId: "line/29/.../3372867385/0/moneyline",
        },
        // Full-Time Totals (Over/Under)
        "10174": {
            outcomes: {
                "10174": { players: { "0": { bookmakerOutcomeId: "3.0/over", price: 1.925 }}},
                "10175": { players: { "0": { bookmakerOutcomeId: "3.0/under", price: 1.909 }}}
            },
            bookmakerMarketId: "line/29/.../3372867384/0/totals"
        },
        // Full-Time Spreads (Asian Handicap)
        "1068": {
            outcomes: {
                "1068": { players: { "0": { bookmakerOutcomeId: "-0.5/home", price: 1.862 }}},
                "1069": { players: { "0": { bookmakerOutcomeId: "-0.5/away", price: 1.99 }}}
            },
            bookmakerMarketId: "line/29/.../3372867384/0/spreads"
        },
        // Half-Time H2H (Moneyline)
        "10600": {
            outcomes: {
                "10600": { players: { "0": { bookmakerOutcomeId: "-0.5/home", price: 2.38 }}}, // Corresponds to HT Home Win
                "10601": { players: { "0": { bookmakerOutcomeId: "-0.5/away", price: 1.581 }}} // Corresponds to HT Draw or Away Win
            },
            bookmakerMarketId: "line/29/.../52985102782/1/moneyline" // Note period '1'
        }
      },
    },
  ],
};

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting to insert test data using the new script...");

  for (const event of testData.events) {
    try {
      console.log(`🔄 Processing match: ${event.home_team} vs ${event.away_team}`);

      const sport = await prisma.sport.upsert({
        where: { key: "soccer" },
        update: {},
        create: { key: "soccer", name: "Football" },
      });

      const league = await prisma.league.upsert({
        where: { key: "soccer_epl" },
        update: {},
        create: {
          key: "soccer_epl",
          name: event.tournament_name,
          sportId: sport.id,
          country: event.country_slug,
        },
      });

      const homeTeam = await prisma.team.upsert({
        where: { name_country: { name: event.home_team, country: "England" } },
        update: {},
        create: { name: event.home_team, country: "England" },
      });

      const awayTeam = await prisma.team.upsert({
        where: { name_country: { name: event.away_team, country: "England" } },
        update: {},
        create: { name: event.away_team, country: "England" },
      });

      const fixture = await prisma.fixture.upsert({
        where: { externalId: event.id },
        update: {
            commenceTime: event.start_time,
        },
        create: {
          externalId: event.id,
          sportId: sport.id,
          leagueId: league.id,
          homeTeamId: homeTeam.id,
  awayTeamId: awayTeam.id,
          commenceTime: event.start_time,
          status: "SCHEDULED",
        },
      });

      console.log(`✅ Upserted fixture with ID: ${fixture.id}`);
      
      await upsertFixtureOddsFromApi(fixture.id, event.markets);

    } catch (e) {
      console.error(`❌ Failed to process event ${event.id}:`, e);
    }
  }

  console.log("✅ Finished inserting test data.");
}

async function upsertFixtureOddsFromApi(fixtureId: string, markets: any) {
    // Clear existing odds for this fixture to ensure idempotency
    await prisma.odds.deleteMany({ where: { fixtureId } });
    console.log(`🧹 Cleared old odds for fixture ${fixtureId}`);

    const oddsToCreate = [];

    for (const marketKey in markets) {
        const marketData = markets[marketKey];
        const marketId = marketData.bookmakerMarketId;
        
        // Determine MarketType and Period from the bookmakerMarketId string
        const idParts = marketId.split('/');
        const period = idParts.includes('1') ? 1 : 0; // 1 for HT, 0 for FT
        const marketTypeStr = idParts[idParts.length - 1].toUpperCase();

        let marketType: MarketType | null = null;
        if (marketTypeStr.includes('MONEYLINE')) marketType = 'H2H';
        if (marketTypeStr.includes('SPREADS')) marketType = 'SPREADS';
        if (marketTypeStr.includes('TOTALS')) marketType = 'TOTALS';

        if (!marketType) continue;

        const outcomes = marketData.outcomes;
        let oddsPayload: { home: number|null, away: number|null, draw: number|null, line: number|null } = { home: null, away: null, draw: null, line: null };

        for (const outcomeKey in outcomes) {
            const outcome = outcomes[outcomeKey].players['0'];
            const outcomeId = outcome.bookmakerOutcomeId.toLowerCase();
            const price = outcome.price;

            if (marketType === 'H2H') {
                if (outcomeId === 'home') oddsPayload.home = price;
                else if (outcomeId === 'away') oddsPayload.away = price;
                else if (outcomeId === 'draw') oddsPayload.draw = price;
            } else if (marketType === 'TOTALS') {
                const [line, side] = outcomeId.split('/');
                oddsPayload.line = parseFloat(line);
                if (side === 'over') oddsPayload.home = price; // Per schema: home = over
                if (side === 'under') oddsPayload.away = price; // Per schema: away = under
            } else if (marketType === 'SPREADS') {
                const [line, side] = outcomeId.split('/');
                oddsPayload.line = parseFloat(line);
                if (side === 'home') oddsPayload.home = price;
                if (side === 'away') oddsPayload.away = price;
            }
        }
        
        // For SPREADS and TOTALS, we create one entry per line
        if (marketType === 'TOTALS' || marketType === 'SPREADS') {
            if (oddsPayload.home !== null || oddsPayload.away !== null) {
                 oddsToCreate.push({
                    fixtureId,
                    market: marketType,
                    oddsType: 'CLOSING',
                    homeOdds: oddsPayload.home ?? 0,
                    awayOdds: oddsPayload.away ?? 0,
                    drawOdds: null,
                    line: oddsPayload.line,
                    period,
                    timestamp: new Date(),
                });
            }
        }
        // For H2H, we create a single entry
        else if (marketType === 'H2H') {
             if (oddsPayload.home !== null || oddsPayload.away !== null) {
                oddsToCreate.push({
                    fixtureId,
                    market: marketType,
                    oddsType: 'CLOSING',
                    homeOdds: oddsPayload.home ?? 0,
                    awayOdds: oddsPayload.away ?? 0,
                    drawOdds: oddsPayload.draw,
                    line: null,
                    period,
                    timestamp: new Date(),
                });
             }
        }
    }

    if (oddsToCreate.length > 0) {
        await prisma.odds.createMany({
            data: oddsToCreate,
        });
        console.log(`✅ Inserted ${oddsToCreate.length} new odds for fixture ${fixtureId}`);
    }
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

