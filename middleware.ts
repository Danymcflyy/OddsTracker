import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/types/auth";

/**
 * Middleware Next.js pour protéger les routes
 * Vérifie que l'utilisateur a une session valide avant d'accéder aux pages protégées
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chemins publics qui ne nécessitent pas d'authentification
  const publicPaths = ["/login"];

  // API routes publiques
  const publicApiPaths = ["/api/auth/login", "/api/sync/test"];

  // Vérifier si le chemin est public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isPublicApi = publicApiPaths.some((path) => pathname.startsWith(path));

  if (isPublicPath || isPublicApi) {
    return NextResponse.next();
  }

  // Routes API protégées (nécessitent authentification)
  if (pathname.startsWith("/api/")) {
    return verifyApiRequest(request);
  }

  // Pages web protégées
  return verifyPageRequest(request);
}

/**
 * Vérifie les requêtes API protégées
 */
async function verifyApiRequest(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Non authentifié", message: "Session manquante" },
      { status: 401 }
    );
  }

  // Vérifier le token JWT
  const isValid = await verifyToken(token);

  if (!isValid) {
    return NextResponse.json(
      { error: "Non authentifié", message: "Session invalide ou expirée" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

/**
 * Vérifie les requêtes de pages web protégées
 */
async function verifyPageRequest(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    // Rediriger vers la page de connexion
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Vérifier le token JWT
  const isValid = await verifyToken(token);

  if (!isValid) {
    // Token invalide ou expiré, supprimer le cookie et rediriger
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

/**
 * Vérifie la validité d'un token JWT
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const SESSION_SECRET = new TextEncoder().encode(
      process.env.APP_SESSION_SECRET || ""
    );

    const verified = await jwtVerify(token, SESSION_SECRET);
    const payload = verified.payload as any;

    // Vérifier que la session n'est pas expirée
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return false;
    }

    return payload.isAuthenticated === true;
  } catch (error) {
    return false;
  }
}

/**
 * Configuration du matcher
 * Définit quels chemins doivent passer par le middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
