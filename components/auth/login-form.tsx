"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoginCredentials, LoginResponse } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation côté client
    if (!password) {
      setError("Le mot de passe est requis");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);

    try {
      const credentials: LoginCredentials = { password };

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la connexion");
        return;
      }

      if (data.success) {
        // Rediriger vers la page d'accueil
        router.push("/");
        router.refresh(); // Rafraîchir pour mettre à jour l'état d'authentification
      } else {
        setError(data.error || "Erreur inconnue");
      }
    } catch (err) {
      console.error("Erreur lors de la connexion:", err);
      setError("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          placeholder="Entrez votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoFocus
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Minimum 8 caractères
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full h-11" disabled={isLoading}>
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </Button>

      <div className="text-center text-xs text-muted-foreground">
        <p>Première connexion ? Définissez votre mot de passe.</p>
      </div>
    </form>
  );
}
