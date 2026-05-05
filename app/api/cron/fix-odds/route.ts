import { NextResponse } from 'next/server';
import { fixOdds } from '@/lib/services/repairs';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  // SECURITY CHECK
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.SUPABASE_CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await fixOdds();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[fix-odds] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
