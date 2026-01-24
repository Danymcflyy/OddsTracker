import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import type { LoginCredentials, LoginResponse } from "@/types/auth";

/**
 * POST /api/auth/login
 * Authentifie l'utilisateur avec le mot de passe défini dans .env.local
 *
 * Body: { password: string }
 * Returns: { success: boolean, message?: string, error?: string }
 */
export async function POST(request: Request) {
  try {
    // Parser le body
    const body: LoginCredentials = await request.json();
    const { password } = body;

    // Validation
    if (!password || typeof password !== "string") {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          error: "Mot de passe manquant",
        },
        { status: 400 }
      );
    }

    // Récupérer le mot de passe depuis .env.local
    const expectedPassword = process.env.APP_PASSWORD;

    if (!expectedPassword) {
      console.error("APP_PASSWORD non défini dans .env.local");
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          error: "Erreur de configuration - mot de passe non défini dans .env.local",
        },
        { status: 500 }
      );
    }

    // Vérifier le mot de passe (comparaison directe)
    if (password !== expectedPassword) {
      // Attendre un peu pour éviter les attaques par force brute
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return NextResponse.json<LoginResponse>(
        {
          success: false,
          error: "Mot de passe incorrect",
        },
        { status: 401 }
      );
    }

    // Mot de passe valide - créer la session
    await createSession();

    return NextResponse.json<LoginResponse>(
      {
        success: true,
        message: "Connexion réussie",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return NextResponse.json<LoginResponse>(
      {
        success: false,
        error: "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/login
 * Retourne une erreur - seul POST est autorisé
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "Méthode non autorisée",
      message: "Utilisez POST pour vous connecter",
    },
    { status: 405 }
  );
}
