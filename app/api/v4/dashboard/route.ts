import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db/queries-frontend';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sportKey = searchParams.get('sport') || undefined;

    const stats = await getDashboardStats(sportKey);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}