
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'closing_odds_snapshots' });
  
  if (error) {
    // Fallback: try to select one row and check keys
    const { data: rows } = await supabase.from('closing_odds_snapshots').select('*').limit(1);
    if (rows && rows.length > 0) {
      console.log("Columns found in snapshot:", Object.keys(rows[0]));
    } else {
      console.log("No data in snapshot table to check columns.");
    }
  } else {
    console.log("Columns:", data);
  }
}

checkColumns();
