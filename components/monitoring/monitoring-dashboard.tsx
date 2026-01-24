'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, Database, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MonitoringStats {
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

export function MonitoringDashboard() {
  const [stats, setStats] = React.useState<MonitoringStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/v4/monitoring');
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to fetch monitoring stats');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || 'Failed to load monitoring data'}</AlertDescription>
      </Alert>
    );
  }

  const quotaPercent = ((500 - stats.api.creditsRemaining) / 500) * 100;
  const quotaStatus = quotaPercent > 90 ? 'critical' : quotaPercent > 75 ? 'warning' : 'ok';

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {quotaStatus === 'critical' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Quota Critical</AlertTitle>
          <AlertDescription>
            {quotaPercent.toFixed(1)}% of API quota used ({stats.api.creditsRemaining} credits remaining)
          </AlertDescription>
        </Alert>
      )}

      {quotaStatus === 'warning' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Quota Warning</AlertTitle>
          <AlertDescription>
            {quotaPercent.toFixed(1)}% of API quota used ({stats.api.creditsRemaining} credits remaining)
          </AlertDescription>
        </Alert>
      )}

      {stats.jobs.failedLast24h > 5 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>High Error Rate</AlertTitle>
          <AlertDescription>
            {stats.jobs.failedLast24h} jobs failed in the last 24 hours
          </AlertDescription>
        </Alert>
      )}

      {/* API Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="API Quota"
          value={`${stats.api.creditsRemaining} / 500`}
          description={`${quotaPercent.toFixed(1)}% used today`}
          icon={Activity}
          trend={quotaStatus === 'ok' ? 'positive' : quotaStatus === 'warning' ? 'neutral' : 'negative'}
        />

        <StatCard
          title="Requests Today"
          value={stats.api.requestsToday.toString()}
          description={`${stats.api.creditsUsedToday} credits used`}
          icon={TrendingUp}
        />

        <StatCard
          title="Success Rate"
          value={`${stats.api.successRate.toFixed(1)}%`}
          description="API call success rate"
          icon={CheckCircle}
          trend={stats.api.successRate > 95 ? 'positive' : stats.api.successRate > 80 ? 'neutral' : 'negative'}
        />

        <StatCard
          title="Avg Response"
          value={`${stats.api.avgDuration.toFixed(0)}ms`}
          description="Average API duration"
          icon={Clock}
        />
      </div>

      {/* Events & Markets */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Events
            </CardTitle>
            <CardDescription>Event statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatRow label="Total Events" value={stats.events.total} />
              <StatRow label="Upcoming" value={stats.events.upcoming} variant="info" />
              <StatRow label="Live" value={stats.events.live} variant="success" />
              <StatRow label="Completed" value={stats.events.completed} variant="muted" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Markets
            </CardTitle>
            <CardDescription>Market capture statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatRow label="Capture Rate" value={`${stats.markets.captureRate.toFixed(1)}%`} variant="success" />
              <StatRow label="Captured" value={stats.markets.captured} variant="success" />
              <StatRow label="Pending" value={stats.markets.pending} variant="info" />
              <StatRow label="Not Offered" value={stats.markets.notOffered} variant="muted" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Job Status
          </CardTitle>
          <CardDescription>Last execution times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <JobRow
              label="Event Sync"
              timestamp={stats.jobs.lastSync}
            />
            <JobRow
              label="Opening Odds Scan"
              timestamp={stats.jobs.lastOpeningScan}
            />
            <JobRow
              label="Closing Odds Scan"
              timestamp={stats.jobs.lastClosingScan}
            />
            <StatRow
              label="Failed Jobs (24h)"
              value={stats.jobs.failedLast24h}
              variant={stats.jobs.failedLast24h > 5 ? 'destructive' : stats.jobs.failedLast24h > 0 ? 'warning' : 'success'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: 'positive' | 'neutral' | 'negative';
}

function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  const trendColor = trend === 'positive' ? 'text-green-600' : trend === 'negative' ? 'text-red-600' : 'text-yellow-600';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${trend ? trendColor : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

interface StatRowProps {
  label: string;
  value: number | string;
  variant?: 'success' | 'info' | 'warning' | 'destructive' | 'muted' | 'default';
}

function StatRow({ label, value, variant = 'default' }: StatRowProps) {
  const variantClasses = {
    success: 'text-green-600 font-semibold',
    info: 'text-blue-600 font-semibold',
    warning: 'text-yellow-600 font-semibold',
    destructive: 'text-red-600 font-semibold',
    muted: 'text-muted-foreground',
    default: '',
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${variantClasses[variant]}`}>{value}</span>
    </div>
  );
}

interface JobRowProps {
  label: string;
  timestamp: string | null;
}

function JobRow({ label, timestamp }: JobRowProps) {
  const timeAgo = timestamp ? getTimeAgo(timestamp) : 'Never';
  const isRecent = timestamp ? new Date(timestamp).getTime() > Date.now() - 6 * 60 * 60 * 1000 : false;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${isRecent ? 'text-green-600' : 'text-yellow-600'}`}>
        {timeAgo}
      </span>
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
