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
    });

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