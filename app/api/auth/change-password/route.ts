import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifySession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/db";
import type { ChangePasswordInput, ChangePasswordResponse } from "@/types/auth";

/**
 * POST /api/auth/change-password
 * Permet de changer le mot de passe (nécessite d'être authentifié)
 *
 * Body: {
 *   currentPassword: string,
 *   newPassword: string,
 *   confirmPassword: string
 * }
 * Returns: { success: boolean, message?: string, error?: string }
 */
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    const isAuthenticated = await verifySession();

    if (!isAuthenticated) {
      return NextResponse.json<ChangePasswordResponse>(
        {
          success: false,
          error: "Non authentifié",
        },
        { status: 401 }
      );
    }

    // Parser le body
    const body: ChangePasswordInput = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json<ChangePasswordResponse>(
        {
          success: false,
          error: "Tous les champs sont requis",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json<ChangePasswordResponse>(
        {
          success: false,
          error: "Les nouveaux mots de passe ne correspondent pas",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json<ChangePasswordResponse>(
        {
          success: false,
          error: "Le nouveau mot de passe doit contenir au moins 8 caractères",
        },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json<ChangePasswordResponse>(
        {
          success: false,
          error: "Le nouveau mot de passe doit être différent de l'ancien",
        },
        { status: 400 }
      );
    }

    // Récupérer le hash actuel
    const { data: settings, error: dbError } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "password_hash")
      .single();

    if (dbError || !settings) {
      console.error("Erreur lors de la récupération du mot de passe:", dbError);
      return NextResponse.json<ChangePasswordResponse>(
        {
          success: false,
          error: "Erreur de configuration",
        },
        { status: 500 }
      );
    }

    const currentHash = settings.value;

    // Vérifier le mot de passe actuel
    const isValid = await bcrypt.compare(currentPassword, currentHash);

    if (!isValid) {
      // Attendre un peu pour éviter les attaques par force brute
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return NextResponse.json<ChangePasswordResponse>(
        {
          success: false,
          error: "Mot de passe actuel incorrect",
        },
        { status: 401 }
      );
    }

    // Créer le nouveau hash
    const newHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour dans la base de données
    const { error: updateError } = await supabaseAdmin
      .from("settings")
      .update({ value: newHash, updated_at: new Date().toISOString() })
      .eq("key", "password_hash");

    if (updateError) {
      console.error("Erreur lors de la mise à jour du mot de passe:", updateError);
      return NextResponse.json<ChangePasswordResponse>(
        {
          success: false,
          error: "Erreur lors de la mise à jour du mot de passe",
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ChangePasswordResponse>(
      {
        success: true,
        message: "Mot de passe modifié avec succès",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    return NextResponse.json<ChangePasswordResponse>(
      {
        success: false,
        error: "Erreur interne du serveur",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/change-password
 * Retourne une erreur - seul POST est autorisé
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "Méthode non autorisée",
      message: "Utilisez POST pour changer le mot de passe",
    },
    { status: 405 }
  );
}
