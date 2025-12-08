/**
 * Types pour l'authentification et les sessions
 */

/**
 * Payload JWT de session
 */
export interface SessionPayload {
  isAuthenticated: boolean;
  createdAt: number; // Timestamp de création
  expiresAt: number; // Timestamp d'expiration
}

/**
 * Données de connexion (formulaire)
 */
export interface LoginCredentials {
  password: string;
}

/**
 * Réponse de connexion
 */
export interface LoginResponse {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Réponse de déconnexion
 */
export interface LogoutResponse {
  success: boolean;
  message?: string;
}

/**
 * Données de changement de mot de passe
 */
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Réponse de changement de mot de passe
 */
export interface ChangePasswordResponse {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * État d'authentification de l'utilisateur
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

/**
 * Durée de session (en millisecondes)
 */
export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 heures

/**
 * Nom du cookie de session
 */
export const SESSION_COOKIE_NAME = "oddstracker-session";
