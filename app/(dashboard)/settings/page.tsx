"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Settings as SettingsIcon, Key, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Paramètres</p>
        <h1 className="text-3xl font-semibold text-slate-900">⚙️ Configuration</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Gérez les paramètres de votre application OddsTracker
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Data Collection Settings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Collecte de Données
            </CardTitle>
            <CardDescription>
              Configurez les sports et marchés à suivre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/data-collection">
              <Button className="w-full">
                Configurer
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Column Customization */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table2 className="h-5 w-5 text-primary" />
              Personnalisation Colonnes
            </CardTitle>
            <CardDescription>
              Noms et ordre des colonnes du tableau
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings/columns">
              <Button className="w-full">
                Personnaliser
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Configuration API
            </CardTitle>
            <CardDescription>
              Clés API et paramètres de connexion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">The Odds API</span>
                <span className="font-medium text-green-600">✓ Configurée</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supabase</span>
                <span className="font-medium text-green-600">✓ Connectée</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Modifiez les clés dans le fichier .env.local
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              Informations Système
            </CardTitle>
            <CardDescription>
              Version et configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">v4.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">API Version</span>
                <span className="font-medium">The Odds API v4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environnement</span>
                <span className="font-medium">{process.env.NODE_ENV || 'development'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>À propos de l'authentification</CardTitle>
          <CardDescription>
            Gestion du mot de passe de connexion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Le mot de passe de connexion est défini dans la variable <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">APP_PASSWORD</code> du fichier <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">.env.local</code>.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Pour modifier votre mot de passe :
          </p>
          <ol className="list-decimal list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>Ouvrez le fichier <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">.env.local</code></li>
            <li>Modifiez la valeur de <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">APP_PASSWORD</code></li>
            <li>Redémarrez l'application avec <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">npm run dev</code></li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
