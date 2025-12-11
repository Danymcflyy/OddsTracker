/**
 * Test Sports Slugs
 * Récupère les slugs de sports valides pour /v3/odds/updated
 */

import "./load-env";

async function main() {
  const apiKey = process.env.ODDS_API_IO_KEY;
  const baseUrl = process.env.ODDS_API_BASE_URL || "https://api2.odds-api.io";

  console.log("📚 Fetching valid sports slugs...\n");

  const url = `${baseUrl}/v3/sports?apiKey=${apiKey}`;
  console.log(`URL: ${url}\n`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("✅ Available sports:\n");

    if (Array.isArray(data)) {
      data.forEach((sport: any, index: number) => {
        console.log(`${index + 1}. Name: "${sport.name}"`);
        console.log(`   Slug: "${sport.slug}"`);
        console.log("");
      });
    }

    // Montrer les slugs pour Football et Tennis
    console.log("━".repeat(50));
    console.log("\n🎯 For discovery, use these slugs:\n");

    const footballSports = data.filter((s: any) => s.name.toLowerCase().includes("football") || s.slug.includes("football"));
    const tennisSports = data.filter((s: any) => s.name.toLowerCase().includes("tennis") || s.slug.includes("tennis"));

    console.log("🏈 Football sports:");
    footballSports.forEach((sport: any) => {
      console.log(`   "${sport.slug}"`);
    });

    console.log("\n🎾 Tennis sports:");
    tennisSports.forEach((sport: any) => {
      console.log(`   "${sport.slug}"`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
