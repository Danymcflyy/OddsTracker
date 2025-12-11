/**
 * Test Odds-API.io Connection
 * Debug script pour tester la connexion et les paramètres
 */

import "./load-env";

async function main() {
  const apiKey = process.env.ODDS_API_IO_KEY;
  const baseUrl = process.env.ODDS_API_BASE_URL || "https://api2.odds-api.io";

  if (!apiKey) {
    console.error("❌ ODDS_API_IO_KEY not set in .env.local");
    process.exit(1);
  }

  console.log(`🔌 Testing Odds-API.io Connection\n`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`API Key: ${apiKey.substring(0, 10)}...`);
  console.log("");

  // Test 1: Simple sports endpoint (no parameters)
  console.log("📋 Test 1: GET /v3/sports (no parameters)\n");
  try {
    const url = `${baseUrl}/v3/sports?apiKey=${apiKey}`;
    console.log(`URL: ${url}\n`);

    const response = await fetch(url);
    const text = await response.text();

    console.log(`Status: ${response.status}`);
    console.log(`Response (first 500 chars):`);
    console.log(text.substring(0, 500));
    console.log("");

    if (response.ok) {
      console.log("✅ Sports endpoint works!\n");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    console.log("");
  }

  // Test 2: Events with minimal parameters
  console.log(
    "📋 Test 2: GET /v3/events with sport=football (no league, no dates)\n"
  );
  try {
    const url = `${baseUrl}/v3/events?sport=football&apiKey=${apiKey}`;
    console.log(`URL: ${url}\n`);

    const response = await fetch(url);
    const text = await response.text();

    console.log(`Status: ${response.status}`);
    console.log(`Response (first 500 chars):`);
    console.log(text.substring(0, 500));
    console.log("");

    if (response.ok) {
      const data = JSON.parse(text);
      if (data.events) {
        console.log(`✅ Found ${data.events.length} events`);
        if (data.events.length > 0) {
          console.log(`First event:`, JSON.stringify(data.events[0], null, 2).substring(0, 300));
        }
      }
    }
    console.log("");
  } catch (error) {
    console.error("❌ Error:", error);
    console.log("");
  }

  // Test 3: Events with league parameter
  console.log(
    "📋 Test 3: GET /v3/events with sport=football&league=england-premier-league\n"
  );
  try {
    const url = `${baseUrl}/v3/events?sport=football&league=england-premier-league&apiKey=${apiKey}`;
    console.log(`URL: ${url}\n`);

    const response = await fetch(url);
    const text = await response.text();

    console.log(`Status: ${response.status}`);
    console.log(`Response (first 500 chars):`);
    console.log(text.substring(0, 500));
    console.log("");

    if (response.ok) {
      const data = JSON.parse(text);
      if (data.events) {
        console.log(`✅ Found ${data.events.length} events`);
      }
    } else {
      // Try to parse error
      try {
        const data = JSON.parse(text);
        console.log("Error details:", JSON.stringify(data, null, 2));
      } catch {
        console.log("Raw error:", text);
      }
    }
    console.log("");
  } catch (error) {
    console.error("❌ Error:", error);
    console.log("");
  }

  // Test 4: Odds updated endpoint
  console.log("📋 Test 4: GET /v3/odds/updated with sport=football\n");
  try {
    const sinceTimestamp = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
    const url = `${baseUrl}/v3/odds/updated?sport=football&since=${sinceTimestamp}&apiKey=${apiKey}`;
    console.log(`URL: ${url}\n`);

    const response = await fetch(url);
    const text = await response.text();

    console.log(`Status: ${response.status}`);
    console.log(`Response (first 500 chars):`);
    console.log(text.substring(0, 500));
    console.log("");

    if (response.ok) {
      const data = JSON.parse(text);
      if (data.events_updated) {
        console.log(`✅ Found ${data.events_updated.length} updated events`);
      }
    }
    console.log("");
  } catch (error) {
    console.error("❌ Error:", error);
    console.log("");
  }

  console.log("✅ Connection tests complete!");
}

main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
