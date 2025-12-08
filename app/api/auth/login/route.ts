import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/db";
import type { LoginCredentials, LoginResponse } from "@/types/auth";

/**
 * POST /api/auth/login
 * Authentifie l'utilisateur avec un mot de passe unique
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

    if (password.length < 8) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          error: "Le mot de passe doit contenir au moins 8 caractères",
        },
        { status: 400 }
      );
    }

    // Récupérer le hash du mot de passe depuis la base de données
    const { data: settings, error: dbError } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "password_hash")
      .single();

    if (dbError || !settings) {
      console.error("Erreur lors de la récupération du mot de passe:", dbError);
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          error: "Erreur de configuration - mot de passe non défini",
        },
        { status: 500 }
      );
    }

    const passwordHash = settings.value;

    // Si le hash est vide, c'est la première connexion
    // On doit créer le hash avec le mot de passe fourni
    if (!passwordHash || passwordHash === "") {
      // Premier login - définir le mot de passe
      const newHash = await bcrypt.hash(password, 10);

      const { error: updateError } = await supabaseAdmin
        .from("settings")
        .update({ value: newHash, updated_at: new Date().toISOString() })
        .eq("key", "password_hash");

      if (updateError) {
        console.error("Erreur lors de la définition du mot de passe:", updateError);
        return NextResponse.json<LoginResponse>(
          {
            success: false,
            error: "Erreur lors de la définition du mot de passe",
          },
          { status: 500 }
        );
      }

      // Créer la session
      await createSession();

      return NextResponse.json<LoginResponse>(
        {
          success: true,
          message: "Mot de passe défini et connexion réussie",
        },
        { status: 200 }
      );
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, passwordHash);

    if (!isValid) {
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
