/**
 * API Route: Events (for frontend table)
 * GET /api/v4/events - Get events with odds for table display
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchEventsForTable } from '@/lib/db/queries-frontend';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params = {
      sportKey: searchParams.get('sport') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined,
      marketKey: searchParams.get('marketKey') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '50'),
      sortField: searchParams.get('sortField') || 'commence_time',
      sortDirection: (searchParams.get('sortDirection') || 'asc') as 'asc' | 'desc',
    };

    const result = await fetchEventsForTable(params);

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page: params.page,
      pageSize: params.pageSize,
    });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch events',
      },
      { status: 500 }
    );
  }
}
