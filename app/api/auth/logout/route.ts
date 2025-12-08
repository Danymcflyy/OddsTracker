import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";
import type { LogoutResponse } from "@/types/auth";

/**
 * POST /api/auth/logout
 * Déconnecte l'utilisateur en supprimant sa session
 *
 * Returns: { success: boolean, message: string }
 */
export async function POST() {
  try {
    // Supprimer la session
    await deleteSession();

    return NextResponse.json<LogoutResponse>(
      {
        success: true,
        message: "Déconnexion réussie",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    return NextResponse.json<LogoutResponse>(
      {
        success: false,
        message: "Erreur lors de la déconnexion",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/logout
 * Permet aussi la déconnexion via GET (pour les liens simples)
 */
export async function GET() {
  try {
    await deleteSession();

    // Rediriger vers la page de connexion
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"));
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de la déconnexion",
      },
      { status: 500 }
    );
  }
}
