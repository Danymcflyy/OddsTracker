import { NextResponse } from 'next/server';
import { getFilterOptions } from '@/lib/db/queries-frontend';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const options = await getFilterOptions();

    return NextResponse.json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error('Error in filter-options API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}