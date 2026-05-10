import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const { fixOdds } = await import('../lib/services/repairs');

  try {
    console.log('🏃 Running fix-odds repair script...');
    const result = await fixOdds();

    console.log('');
    console.log(result.log);
    
    if (result.resetCount > 0) {
      console.log(`🎉 Successfully reset ${result.resetCount} markets!`);
    }

    console.log('✅ Repair completed');
  } catch (err: any) {
    console.error('');
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

main();
