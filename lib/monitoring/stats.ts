/**
 * Monitoring Stats
 * Collects and aggregates monitoring data
 */

import { supabaseAdmin } from '@/lib/supabase/admin';

export interface MonitoringStats {
  api: {
    creditsUsedToday: number;
    creditsRemaining: number;
    requestsToday: number;
    successRate: number;
    avgDuration: number;
  };
  events: {
    total: number;
    upcoming: number;
    live: number;
    completed: number;
  };
  markets: {
    pending: number;
    captured: number;
    notOffered: number;
    captureRate: number;
  };
  jobs: {
    lastSync: string | null;
    lastOpeningScan: string | null;
    lastClosingScan: string | null;
    failedLast24h: number;
  };
}

/**
 * Get comprehensive monitoring statistics
 */
export async function getMonitoringStats(): Promise<MonitoringStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // API usage stats
  const { data: apiUsage } = await (supabaseAdmin as any)
    .from('api_usage_logs')
    .select('credits_used, credits_remaining, success, duration_ms')
    .gte('created_at', today.toISOString());

  const creditsUsed = (apiUsage || []).reduce((sum: number, log: any) => sum + (log.credits_used || 0), 0);
  const creditsRemaining = apiUsage?.[0]?.credits_remaining || 0;
  const totalRequests = apiUsage?.length || 0;
  const successfulRequests = (apiUsage || []).filter((log: any) => log.success).length;
  const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
  const avgDuration = totalRequests > 0
    ? (apiUsage || []).reduce((sum: number, log: any) => sum + (log.duration_ms || 0), 0) / totalRequests
    : 0;

  // Events stats
  const { data: eventsStats } = await (supabaseAdmin as any)
    .from('events')
    .select('status')
    .gte('created_at', yesterday.toISOString());

  const total = eventsStats?.length || 0;
  const upcoming = eventsStats?.filter((e: any) => e.status === 'upcoming').length || 0;
  const live = eventsStats?.filter((e: any) => e.status === 'live').length || 0;
  const completed = eventsStats?.filter((e: any) => e.status === 'completed').length || 0;

  // Markets stats
  const { data: marketsStats } = await (supabaseAdmin as any)
    .from('market_states')
    .select('status');

  const pending = marketsStats?.filter((m: any) => m.status === 'pending').length || 0;
  const captured = marketsStats?.filter((m: any) => m.status === 'captured').length || 0;
  const notOffered = marketsStats?.filter((m: any) => m.status === 'not_offered').length || 0;
  const totalMarkets = marketsStats?.length || 0;
  const captureRate = totalMarkets > 0 ? (captured / totalMarkets) * 100 : 0;

  // Jobs stats
  const { data: lastSyncLog } = await (supabaseAdmin as any)
    .from('api_usage_logs')
    .select('created_at')
    .eq('job_name', 'sync_events')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: lastOpeningLog } = await (supabaseAdmin as any)
    .from('api_usage_logs')
    .select('created_at')
    .eq('job_name', 'scan_opening_odds')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: lastClosingLog } = await (supabaseAdmin as any)
    .from('api_usage_logs')
    .select('created_at')
    .eq('job_name', 'scan_closing_odds')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data: failedJobs } = await (supabaseAdmin as any)
    .from('api_usage_logs')
    .select('id')
    .eq('success', false)
    .gte('created_at', yesterday.toISOString());

  return {
    api: {
      creditsUsedToday: creditsUsed,
      creditsRemaining,
      requestsToday: totalRequests,
      successRate,
      avgDuration,
    },
    events: {
      total,
      upcoming,
      live,
      completed,
    },
    markets: {
      pending,
      captured,
      notOffered,
      captureRate,
    },
    jobs: {
      lastSync: lastSyncLog?.created_at || null,
      lastOpeningScan: lastOpeningLog?.created_at || null,
      lastClosingScan: lastClosingLog?.created_at || null,
      failedLast24h: failedJobs?.length || 0,
    },
  };
}
