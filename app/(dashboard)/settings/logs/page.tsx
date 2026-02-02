'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LogEntry {
  id: string;
  job_name: string;
  endpoint: string;
  sport_key: string | null;
  request_params: any;
  credits_used: number;
  credits_remaining: number | null;
  events_processed: number;
  markets_captured: number;
  success: boolean;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

export default function LogsPage() {
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'error' | 'success' | 'odds'>('error');

  React.useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const response = await fetch('/api/v4/monitoring');
      const result = await response.json();
      if (result.success && result.data && result.data.logs) {
        setLogs(result.data.logs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'error') return !log.success;
    if (filter === 'success') return log.success;
    if (filter === 'odds') {
        return log.job_name.includes('opening_odds') || log.job_name.includes('sync_scores');
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Logs & Monitoring</h1>
        <p className="text-muted-foreground">
          Historique des appels API et diagnostic des erreurs
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Journal d&apos;activité</CardTitle>
              <CardDescription>
                Derniers 50 appels à l&apos;API The Odds API
              </CardDescription>
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="odds" className="text-blue-600">Cotes</TabsTrigger>
                <TabsTrigger value="error" className="text-red-600">Erreurs</TabsTrigger>
                <TabsTrigger value="success" className="text-green-600">Succès</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Aucun log trouvé pour ce filtre
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex flex-col gap-2 rounded-lg border p-4 text-sm ${
                      !log.success ? 'bg-red-50 border-red-200' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-semibold">{log.job_name}</span>
                        {log.sport_key && (
                          <Badge variant="outline" className="text-xs">
                            {log.sport_key}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <Clock className="h-3 w-3" />
                        {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 bg-background/50 p-2 rounded border border-border/50">
                      <div>
                        <span className="text-muted-foreground text-xs block">Endpoint</span>
                        <code className="text-xs">{log.endpoint.split('?')[0]}</code>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs block">Crédits</span>
                        <span className="font-mono">{log.credits_used}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs block">Données</span>
                        <span>{log.events_processed} events / {log.markets_captured} mkts</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs block">Durée</span>
                        <span>{log.duration_ms ? `${log.duration_ms}ms` : '-'}</span>
                      </div>
                    </div>

                    {log.error_message && (
                      <div className="mt-2 text-red-700 bg-red-100 p-2 rounded text-xs font-mono break-all">
                        {log.error_message}
                      </div>
                    )}
                    
                    {log.request_params && Object.keys(log.request_params).length > 0 && (
                       <details className="mt-1">
                         <summary className="text-xs text-muted-foreground cursor-pointer hover:underline">
                           Voir paramètres
                         </summary>
                         <pre className="mt-2 text-[10px] bg-slate-950 text-slate-50 p-2 rounded overflow-x-auto">
                           {JSON.stringify(log.request_params, null, 2)}
                         </pre>
                       </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
