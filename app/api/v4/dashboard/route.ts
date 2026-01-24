/**
 * API Route: Dashboard Statistics
 * GET /api/v4/dashboard - Get dashboard stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db/queries-frontend';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sportKey = searchParams.get('sport') || undefined;

    const stats = await getDashboardStats(sportKey);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Failed to get dashboard stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get dashboard stats',
      },
      { status: 500 }
    );
  }
}
