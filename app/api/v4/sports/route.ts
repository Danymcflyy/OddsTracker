/**
 * API Route: Sports Management
 * GET /api/v4/sports - Get all sports
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Get all soccer sports (don't filter by active - show all available leagues)
    const { data: sports, error } = await supabaseAdmin
      .from('sports')
      .select('*')
      .order('title');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      sports: sports || [],
    });
  } catch (error) {
    console.error('Failed to get sports:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get sports',
      },
      { status: 500 }
    );
  }
}
