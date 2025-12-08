"use client";

import * as React from "react";
import { RefreshCw, Settings as SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

type SyncValues = {
  autoSyncEnabled: boolean;
  autoSyncTime: string;
  extraSyncEnabled: boolean;
  extraSyncTime: string;
};

export interface SyncSettingsProps extends SyncValues {
  lastSync: string;
  syncing?: boolean;
  onManualSync?: () => Promise<void> | void;
  onChange?: (values: SyncValues) => void;
}

export function SyncSettings({
  lastSync,
  autoSyncEnabled,
  autoSyncTime,
  extraSyncEnabled,
  extraSyncTime,
  syncing: syncingProp = false,
  onManualSync,
  onChange,
}: SyncSettingsProps) {
  const [values, setValues] = React.useState<SyncValues>({
    autoSyncEnabled,
    autoSyncTime,
    extraSyncEnabled,
    extraSyncTime,
  });
  const [syncing, setSyncing] = React.useState(syncingProp);

  React.useEffect(() => {
    setValues({ autoSyncEnabled, autoSyncTime, extraSyncEnabled, extraSyncTime });
  }, [autoSyncEnabled, autoSyncTime, extraSyncEnabled, extraSyncTime]);

  React.useEffect(() => {
    setSyncing(syncingProp);
  }, [syncingProp]);

  const emitChange = (next: SyncValues) => {
    setValues(next);
    onChange?.(next);
  };

  const handleManualSync = async () => {
    if (!onManualSync) return;
    try {
      setSyncing(true);
      await onManualSync();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1">
        <CardTitle className="flex items-center gap-2 text-lg">
          <SettingsIcon className="h-5 w-5" />
          Synchronisation
        </CardTitle>
        <CardDescription>Lancez une sync manuelle ou configurez les horaires automatiques.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium text-slate-900">Dernière synchronisation</p>
            <p className="text-sm text-muted-foreground">{lastSync}</p>
          </div>
          <Button className="gap-2" disabled={!onManualSync || syncing} onClick={handleManualSync}>
            <RefreshCw className="h-4 w-4" />
            {syncing ? "Synchronisation..." : "Sync manuelle"}
          </Button>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Sync automatique principale</p>
              <p className="text-xs text-muted-foreground">Exécution quotidienne</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={values.autoSyncTime}
                onChange={(event) =>
                  emitChange({ ...values, autoSyncTime: event.target.value || "06:00" })
                }
                className="h-9 rounded-md border px-2 text-sm shadow-sm"
              />
              <Switch
                checked={values.autoSyncEnabled}
                onCheckedChange={(checked) => emitChange({ ...values, autoSyncEnabled: checked })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Sync supplémentaire</p>
              <p className="text-xs text-muted-foreground">Permet une mise à jour en soirée</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={values.extraSyncTime}
                onChange={(event) =>
                  emitChange({ ...values, extraSyncTime: event.target.value || "18:00" })
                }
                className="h-9 rounded-md border px-2 text-sm shadow-sm"
              />
              <Switch
                checked={values.extraSyncEnabled}
                onCheckedChange={(checked) => emitChange({ ...values, extraSyncEnabled: checked })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
