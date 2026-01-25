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

    // Advanced filters
    const oddsMin = searchParams.get('oddsMin') ? parseFloat(searchParams.get('oddsMin')!) : undefined;
    const oddsMax = searchParams.get('oddsMax') ? parseFloat(searchParams.get('oddsMax')!) : undefined;
    const oddsType = (searchParams.get('oddsType') as 'opening' | 'closing' | 'both') || undefined;
    const outcome = searchParams.get('outcome') || undefined;
    const pointValue = searchParams.get('pointValue') ? parseFloat(searchParams.get('pointValue')!) : undefined;
    const dropMin = searchParams.get('dropMin') ? parseFloat(searchParams.get('dropMin')!) : undefined;
    const status = searchParams.get('status') || undefined;
    const minSnapshots = searchParams.get('minSnapshots') ? parseInt(searchParams.get('minSnapshots')!) : undefined;

    console.log('[API] Events Request Params:', { 
      sportKey, dateFrom, oddsMin, oddsMax, outcome, marketKey, dropMin, status, minSnapshots 
    });

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
      oddsMin,
      oddsMax,
      oddsType,
      outcome,
      pointValue,
      dropMin,
      status,
      minSnapshots
    });

    console.log('[API] Events Result Count:', result.data.length);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error in events API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}