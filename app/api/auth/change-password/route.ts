import { NextResponse } from "next/server";
import { verifySession } from "@/lib/auth/session";
import type { ChangePasswordInput, ChangePasswordResponse } from "@/types/auth";

/**
 * POST /api/auth/change-password
 * Le mot de passe est défini dans .env.local (APP_PASSWORD)
 * Cette route retourne un message informatif
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

    return NextResponse.json<ChangePasswordResponse>(
      {
        success: false,
        error: "Pour changer le mot de passe, modifiez la variable APP_PASSWORD dans le fichier .env.local et redémarrez l'application",
      },
      { status: 400 }
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
