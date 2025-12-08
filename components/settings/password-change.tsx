"use client";

import * as React from "react";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface PasswordChangeProps {
  onSubmit?: (payload: { currentPassword: string; newPassword: string; confirmation: string }) => Promise<void> | void;
  submitting?: boolean;
}

export function PasswordChange({ onSubmit, submitting = false }: PasswordChangeProps) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");

    if (newPassword !== confirmation) {
      setStatus("error");
      return;
    }

    try {
      await onSubmit?.({ currentPassword, newPassword, confirmation });
      setStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Sécurité
        </CardTitle>
        <CardDescription>Mettre à jour le mot de passe de l’application.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label className="text-sm font-medium" htmlFor="current-password">
              Mot de passe actuel
            </Label>
            <Input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm font-medium" htmlFor="new-password">
              Nouveau mot de passe
            </Label>
            <Input
              id="new-password"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="mt-1"
              placeholder="Minimum 8 caractères"
            />
          </div>
          <div>
            <Label className="text-sm font-medium" htmlFor="confirm-password">
              Confirmation
            </Label>
            <Input
              id="confirm-password"
              type="password"
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-1"
              placeholder="Confirmez le mot de passe"
            />
          </div>

          {status === "success" && (
            <p className="text-sm text-emerald-600">Mot de passe mis à jour avec succès.</p>
          )}
          {status === "error" && (
            <p className="text-sm text-rose-600">
              Impossible de mettre à jour le mot de passe. Vérifiez les informations saisies.
            </p>
          )}

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Mise à jour..." : "Mettre à jour"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
