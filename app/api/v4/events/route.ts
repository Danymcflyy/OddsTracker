import { NextResponse } from 'next/server';
import { fetchEventsForTable } from '@/lib/db/queries-frontend';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract params
    const sportKey = searchParams.get('sportKey') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const search = searchParams.get('search') || undefined;
    const marketKey = searchParams.get('marketKey') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const sortField = searchParams.get('sortField') || undefined;
    const sortDirection = (searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc';
    const cursor = searchParams.get('cursor') || undefined;
    const cursorDirection = (searchParams.get('cursorDirection') as 'next' | 'prev') || undefined;

    // Advanced filters - Separate opening/closing odds ranges
    const openingOddsMin = searchParams.get('openingOddsMin') ? parseFloat(searchParams.get('openingOddsMin')!) : undefined;
    const openingOddsMax = searchParams.get('openingOddsMax') ? parseFloat(searchParams.get('openingOddsMax')!) : undefined;
    const closingOddsMin = searchParams.get('closingOddsMin') ? parseFloat(searchParams.get('closingOddsMin')!) : undefined;
    const closingOddsMax = searchParams.get('closingOddsMax') ? parseFloat(searchParams.get('closingOddsMax')!) : undefined;
    const movementDirection = (searchParams.get('movementDirection') as 'all' | 'up' | 'down' | 'stable') || undefined;
    const outcome = searchParams.get('outcome') || undefined;
    const pointValue = searchParams.get('pointValue') ? parseFloat(searchParams.get('pointValue')!) : undefined;
    const dropMin = searchParams.get('dropMin') ? parseFloat(searchParams.get('dropMin')!) : undefined;
    const status = searchParams.get('status') || undefined;
    const minSnapshots = searchParams.get('minSnapshots') ? parseInt(searchParams.get('minSnapshots')!) : undefined;

    const result = await fetchEventsForTable({
      sportKey,
      dateFrom,
      dateTo,
      search,
      marketKey,
      page,
      pageSize,
      sortField,
      sortDirection,
      cursor,
      cursorDirection,
      openingOddsMin,
      openingOddsMax,
      closingOddsMin,
      closingOddsMax,
      movementDirection,
      outcome,
      pointValue,
      dropMin,
      status,
      minSnapshots
    });

    return NextResponse.json({
      success: true,
      ...result,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error in events API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}// RPC enabled: 1769542670
