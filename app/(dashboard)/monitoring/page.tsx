/**
 * Monitoring Page
 * Displays real-time monitoring statistics
 */

import { Metadata } from 'next';
import { MonitoringDashboard } from '@/components/monitoring/monitoring-dashboard';

export const metadata: Metadata = {
  title: 'Monitoring - OddsTracker',
  description: 'Real-time monitoring and statistics',
};

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monitoring</h1>
        <p className="text-muted-foreground">
          Real-time statistics and performance metrics
        </p>
      </div>

      <MonitoringDashboard />
    </div>
  );
}
