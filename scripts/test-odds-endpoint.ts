/**
 * Test /v3/odds endpoint
 */

import "./load-env";

async function main() {
  const apiKey = process.env.ODDS_API_IO_KEY;
  const baseUrl = process.env.ODDS_API_BASE_URL || "https://api2.odds-api.io";

  console.log("🔍 Testing /v3/odds endpoints\n");

  // D'abord récupérer un event ID
  console.log("1️⃣ Getting an event ID first...\n");
  const eventsUrl = `${baseUrl}/v3/events?sport=football&league=england-premier-league&apiKey=${apiKey}`;
  const eventsResponse = await fetch(eventsUrl);
  const events = await eventsResponse.json();

  if (!Array.isArray(events) || events.length === 0) {
    console.error("❌ No events found");
    process.exit(1);
  }

  const eventId = events[0].id;
  console.log(`✅ Found event ID: ${eventId}\n`);

  // Test /v3/odds with this event
  console.log("2️⃣ Testing GET /v3/odds?eventId=XXX&bookmakers=Pinnacle\n");
  const oddsUrl = `${baseUrl}/v3/odds?eventId=${eventId}&bookmakers=Pinnacle&apiKey=${apiKey}`;
  console.log(`URL: ${oddsUrl}\n`);

  const oddsResponse = await fetch(oddsUrl);
  const oddsText = await oddsResponse.text();

  console.log(`Status: ${oddsResponse.status}`);
  console.log(`Response (first 1000 chars):`);
  console.log(oddsText.substring(0, 1000));
  console.log("");

  if (oddsResponse.ok) {
    console.log("✅ /v3/odds works!");
    try {
      const oddsData = JSON.parse(oddsText);
      if (Array.isArray(oddsData)) {
        console.log(`   Returns an array with ${oddsData.length} items`);
        if (oddsData.length > 0) {
          console.log(`   First item keys:`, Object.keys(oddsData[0]));
        }
      } else {
        console.log(`   Returns object with keys:`, Object.keys(oddsData));
      }
    } catch (e) {
      console.log("   Could not parse as JSON");
    }
  }

  // Test /v3/odds/updated with bookmaker
  console.log("\n3️⃣ Testing GET /v3/odds/updated?sport=football&since=XXX&bookmaker=Pinnacle\n");
  const sinceTimestamp = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
  const updatedUrl = `${baseUrl}/v3/odds/updated?sport=football&since=${sinceTimestamp}&bookmaker=Pinnacle&apiKey=${apiKey}`;
  console.log(`URL: ${updatedUrl}\n`);

  const updatedResponse = await fetch(updatedUrl);
  const updatedText = await updatedResponse.text();

  console.log(`Status: ${updatedResponse.status}`);
  console.log(`Response (first 500 chars):`);
  console.log(updatedText.substring(0, 500));
  console.log("");

  if (updatedResponse.ok) {
    console.log("✅ /v3/odds/updated works!");
    try {
      const updatedData = JSON.parse(updatedText);
      console.log(`   Response keys:`, Object.keys(updatedData));
      if (updatedData.events_updated) {
        console.log(`   Found ${updatedData.events_updated.length} updated events`);
      }
    } catch (e) {
      console.log("   Could not parse as JSON");
    }
  } else {
    console.log("❌ /v3/odds/updated failed");
  }
}

main().catch((error) => {
  console.error("💥 Error:", error);
  process.exit(1);
});
