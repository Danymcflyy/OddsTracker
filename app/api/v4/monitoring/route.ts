/**
 * API Route: Monitoring Stats
 * GET /api/v4/monitoring - Get monitoring statistics
 */

import { NextResponse } from 'next/server';
import { getMonitoringStats } from '@/lib/monitoring/stats';

export async function GET() {
  try {
    const stats = await getMonitoringStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Failed to get monitoring stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get monitoring stats',
      },
      { status: 500 }
    );
  }
}
