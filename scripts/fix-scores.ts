import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const { fixScores } = await import('../lib/services/repairs');

  try {
    console.log('🏃 Running fix-scores repair script...');
    const result = await fixScores();

    console.log('');
    console.log(result.log);
    
    if (result.notFound.length > 0) {
      console.log(`⚠️  Matches not found in API scores: ${result.notFound.length}`);
    }

    if (result.updated > 0) {
      console.log(`🎉 Successfully updated ${result.updated} matches!`);
    }

    console.log('✅ Repair completed');
  } catch (err: any) {
    console.error('');
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

main();
