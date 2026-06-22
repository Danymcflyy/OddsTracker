import { NextResponse } from 'next/server';
import { fixDuplicates } from '@/lib/services/repairs';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; 

export async function GET(request: Request) {
  // SECURITY CHECK
  const authHeader = request.headers.get('authorization');
  const expectedAuth1 = `Bearer ${process.env.SUPABASE_CRON_SECRET}`;
  const expectedAuth2 = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth1 && authHeader !== expectedAuth2) {
    console.warn('Unauthorized cron/manual access attempt to fix-duplicates');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[API] Starting manual duplicate fix...');
    const result = await fixDuplicates();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[API] Error during fix-duplicates:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
