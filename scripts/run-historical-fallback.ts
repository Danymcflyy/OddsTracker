
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
  console.log('🚀 Starting Historical Fallback Run...');
  
  try {
    const { processHistoricalFallbacks } = await import('@/lib/services/theoddsapi/historical-fallback');
    await processHistoricalFallbacks();
    console.log('✅ Historical Fallback Run Complete.');
  } catch (error) {
    console.error('❌ Error during run:', error);
  }
}

run();
