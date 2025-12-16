
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PROJECT_ID = 'lgpxxzrimxpwbvyfiqvh'; // Replace with your actual project ID
const OUTPUT_FILE = path.resolve(__dirname, '../types/supabase.ts');

async function generateSupabaseTypes() {
  console.log(`Generating Supabase types for project: ${PROJECT_ID}...`);
  console.log(`Output will be written to: ${OUTPUT_FILE}`);

  try {
    // Use npx to execute the locally installed supabase CLI
    const command = `npx supabase gen types typescript --project-id ${PROJECT_ID} --schema public > ${OUTPUT_FILE}`;
    
    // Execute the command
    const { stdout, stderr } = await execAsync(command);

    if (stdout) {
      console.log('stdout:', stdout);
    }
    if (stderr) {
      console.error('stderr:', stderr);
    }

    console.log('Supabase types generated successfully!');
  } catch (error) {
    console.error('Error generating Supabase types:', error);
    if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error code:', (error as any).code);
    }
    process.exit(1);
  }
}

generateSupabaseTypes();
