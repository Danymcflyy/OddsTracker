/**
 * Alert System
 * Checks for anomalies and sends alerts
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/utils/logger';

export interface Alert {
  type: 'quota_warning' | 'quota_critical' | 'high_error_rate' | 'no_sync' | 'capture_rate_low';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value?: number;
  threshold?: number;
  timestamp: string;
}

/**
 * Check all alert conditions and return triggered alerts
 */
export async function checkAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();

  // 1. Check API quota
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const usage = await (supabaseAdmin as any)
    .from('api_usage_logs')
    .select('credits_used, credits_remaining')
    .gte('created_at', today.toISOString());

  const creditsUsed = (usage.data || []).reduce(
    (sum: number, log: any) => sum + (log.credits_used || 0),
    0
  );
  const creditsRemaining = usage.data?.[0]?.credits_remaining || 500;
  const quotaUsagePercent = ((500 - creditsRemaining) / 500) * 100;

  if (quotaUsagePercent > 90) {
    alerts.push({
      type: 'quota_critical',
      severity: 'critical',
      message: 'API quota critical: ' + quotaUsagePercent.toFixed(1) + '% used',
      value: quotaUsagePercent,
      threshold: 90,
      timestamp: now.toISOString(),
    });
  } else if (quotaUsagePercent > 75) {
    alerts.push({
      type: 'quota_warning',
      severity: 'warning',
      message: 'API quota warning: ' + quotaUsagePercent.toFixed(1) + '% used',
      value: quotaUsagePercent,
      threshold: 75,
      timestamp: now.toISOString(),
    });
  }

  // Log alerts
  if (alerts.length > 0) {
    logger.warn('Alerts triggered', { count: alerts.length });
  }

  return alerts;
}

/**
 * Send alert notification
 */
export async function sendAlert(alert: Alert): Promise<void> {
  logger.warn('Alert', { alert });
}
