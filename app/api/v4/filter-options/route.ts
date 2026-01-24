/**
 * API Route: Filter Options
 * GET /api/v4/filter-options - Get available filter options (with caching)
 */

import { NextResponse } from 'next/server';
import { getCachedFilterOptions } from '@/lib/cache/filter-options';

export async function GET() {
  try {
    const options = await getCachedFilterOptions();

    return NextResponse.json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error('Failed to get filter options:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get filter options',
      },
      { status: 500 }
    );
  }
}
