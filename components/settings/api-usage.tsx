"use client";

import * as React from "react";
import { Signal } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ApiUsageProps {
  used: number;
  limit: number;
  resetDate: string;
  planName?: string;
}

export function ApiUsage({ used, limit, resetDate, planName }: ApiUsageProps) {
  const usagePercent = Number.isFinite(limit) && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Signal className="h-5 w-5" />
          Utilisation API OddsPapi
        </CardTitle>
        <CardDescription>Surveillez le quota mensuel et la prochaine réinitialisation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-semibold text-slate-900">
          {used.toLocaleString("fr-FR")} / {limit.toLocaleString("fr-FR")}
        </div>
        {planName && <p className="text-sm text-muted-foreground">Plan actuel : {planName}</p>}
        <p className="text-sm text-muted-foreground">Réinitialisation le {resetDate}</p>
        <div className="w-full rounded-full bg-slate-100">
          <div className="h-3 rounded-full bg-primary transition-all" style={{ width: `${usagePercent}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">{usagePercent}% du quota consommé</p>
      </CardContent>
    </Card>
  );
}
