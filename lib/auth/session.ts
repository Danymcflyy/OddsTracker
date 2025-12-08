import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/types/auth";
import { SESSION_DURATION, SESSION_COOKIE_NAME } from "@/types/auth";

/**
 * Secret pour signer les tokens JWT
 * IMPORTANT: Doit être défini dans .env.local
 */
const SESSION_SECRET = new TextEncoder().encode(
  process.env.APP_SESSION_SECRET || ""
);

if (!process.env.APP_SESSION_SECRET) {
  console.warn(
    "⚠️  APP_SESSION_SECRET non défini dans .env.local - utiliser un secret aléatoire"
  );
}

/**
 * Crée une nouvelle session utilisateur
 * Génère un token JWT et le stocke dans un cookie httpOnly
 *
 * @returns Le token JWT créé
 */
export async function createSession(): Promise<string> {
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION;

  // Payload de la session
  const payload: SessionPayload = {
    isAuthenticated: true,
    createdAt: now,
    expiresAt: expiresAt,
  };

  // Créer le token JWT
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(SESSION_SECRET);

  // Stocker dans un cookie httpOnly sécurisé
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION / 1000, // En secondes
    sameSite: "lax",
    path: "/",
  });

  return token;
}

/**
 * Vérifie si l'utilisateur a une session valide
 *
 * @returns true si la session est valide, false sinon
 */
export async function verifySession(): Promise<boolean> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  try {
    const verified = await jwtVerify(token, SESSION_SECRET);
    const payload = verified.payload as unknown as SessionPayload;

    // Vérifier que la session n'est pas expirée
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return false;
    }

    return payload.isAuthenticated === true;
  } catch (error) {
    // Token invalide ou expiré
    return false;
  }
}

/**
 * Récupère le payload de la session actuelle
 *
 * @returns Le payload de la session ou null si invalide
 */
export async function getSessionPayload(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, SESSION_SECRET);
    return verified.payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Supprime la session utilisateur
 * Efface le cookie de session
 */
export async function deleteSession(): Promise<void> {
  cookies().delete(SESSION_COOKIE_NAME);
}

/**
 * Vérifie si une session existe (sans vérifier sa validité)
 * Utile pour le middleware
 *
 * @returns true si un cookie de session existe
 */
export function hasSessionCookie(): boolean {
  return cookies().has(SESSION_COOKIE_NAME);
}

/**
 * Renouvelle la session en créant un nouveau token
 * Utile pour prolonger la session sans redemander le mot de passe
 *
 * @returns Le nouveau token JWT
 */
export async function renewSession(): Promise<string> {
  const isValid = await verifySession();

  if (!isValid) {
    throw new Error("Cannot renew invalid session");
  }

  // Créer une nouvelle session
  return createSession();
}
