import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: sports, error } = await (supabaseAdmin as any)
      .from('sports')
      .select('*')
      .order('title');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: sports,
    });
  } catch (error) {
    console.error('Error in sports API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sports' },
      { status: 500 }
    );
  }
}