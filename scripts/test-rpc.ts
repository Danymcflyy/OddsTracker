
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function testRpc() {
  console.log("🔍 Testing search_events RPC...\n");

  // Test 1: No filters (should return everything)
  console.log("1. Testing with NO filters...");
  const { data: data1, error: error1 } = await supabase.rpc('search_events', {
    p_page: 1,
    p_page_size: 5
  });

  if (error1) {
    console.error("❌ Error 1:", error1.message);
  } else {
    console.log(`✅ Success 1: Got ${data1.length} events`);
    if (data1.length > 0) console.log("   Sample ID:", data1[0].id);
  }

  // Test 2: Status 'completed'
  console.log("\n2. Testing with status='completed'...");
  const { data: data2, error: error2 } = await supabase.rpc('search_events', {
    p_status: 'completed',
    p_page: 1,
    p_page_size: 5
  });

  if (error2) {
    console.error("❌ Error 2:", error2.message);
  } else {
    console.log(`✅ Success 2: Got ${data2.length} events`);
  }

  // Test 3: Drop Min (Complex logic)
  console.log("\n3. Testing with drop_min=5...");
  const { data: data3, error: error3 } = await supabase.rpc('search_events', {
    p_drop_min: 5,
    p_page: 1,
    p_page_size: 5
  });

  if (error3) {
    console.error("❌ Error 3:", error3.message);
    console.log("HINT: Did you run the SQL migration?");
  } else {
    console.log(`✅ Success 3: Got ${data3.length} events`);
  }
}

testRpc();
