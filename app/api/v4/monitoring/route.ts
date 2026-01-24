import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Récupérer les logs récents
    const { data: logs, error } = await (supabaseAdmin as any)
      .from('api_usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Récupérer le quota mensuel (approximatif)
    const { count } = await (supabaseAdmin as any)
        .from('api_usage_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setDate(1)).toISOString()); // Depuis le 1er du mois

    return NextResponse.json({
      success: true,
      data: {
        logs: logs || [],
        usage_month: count || 0,
        usage_limit: 1500000 // Limite The Odds API (exemple)
      },
    });
  } catch (error) {
    console.error('Error in monitoring API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}