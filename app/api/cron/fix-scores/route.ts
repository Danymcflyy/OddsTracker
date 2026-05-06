import { NextResponse } from 'next/server';
import { fixScores } from '@/lib/services/repairs';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; 

export async function GET(request: Request) {
  // SECURITY CHECK
  const authHeader = request.headers.get('authorization');
  const expectedAuth1 = `Bearer ${process.env.SUPABASE_CRON_SECRET}`;
  const expectedAuth2 = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth1 && authHeader !== expectedAuth2) {
    console.warn('Unauthorized cron access attempt');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await fixScores();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[fix-scores] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
