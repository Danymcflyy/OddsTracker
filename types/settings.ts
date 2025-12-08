import type { Setting } from "./database";

/**
 * Clés de paramètres disponibles
 */
export enum SettingKey {
  PASSWORD_HASH = "password_hash",
  LAST_SYNC = "last_sync",
  AUTO_SYNC_ENABLED = "auto_sync_enabled",
  AUTO_SYNC_TIME = "auto_sync_time",
  EXTRA_SYNC_ENABLED = "extra_sync_enabled",
  EXTRA_SYNC_TIME = "extra_sync_time",
  API_REQUESTS_COUNT = "api_requests_count",
  API_REQUESTS_RESET_DATE = "api_requests_reset_date",
  FOLLOWED_TOURNAMENTS = "followed_tournaments",
  ODDS_CLOSING_STRATEGY = "odds_closing_strategy",
  ODDSPAPI_API_KEY = "oddspapi_api_key",
}

export type OddsClosingStrategy = "historical" | "tournament";

/**
 * Paramètres typés de l'application
 */
export interface AppSettings {
  password_hash: string;
  last_sync: string | null;
  auto_sync_enabled: boolean;
  auto_sync_time: string;
  extra_sync_enabled: boolean;
  extra_sync_time: string;
  api_requests_count: number;
  api_requests_reset_date: string | null;
  followed_tournaments: string | null;
  odds_closing_strategy: OddsClosingStrategy;
  oddspapi_api_key: string | null;
}

/**
 * Paramètres modifiables via l'UI
 */
export interface EditableSettings {
  auto_sync_enabled: boolean;
  auto_sync_time: string;
  extra_sync_enabled: boolean;
  extra_sync_time: string;
  odds_closing_strategy: OddsClosingStrategy;
  oddspapi_api_key: string | null;
}

/**
 * Formulaire de mise à jour des paramètres
 */
export interface UpdateSettingsInput {
  auto_sync_enabled?: boolean;
  auto_sync_time?: string;
  extra_sync_enabled?: boolean;
  extra_sync_time?: string;
  odds_closing_strategy?: OddsClosingStrategy;
  oddspapi_api_key?: string;
}

/**
 * Configuration de synchronisation
 */
export interface SyncConfig {
  auto_sync_enabled: boolean;
  auto_sync_time: string;
  extra_sync_enabled: boolean;
  extra_sync_time: string;
  odds_closing_strategy: OddsClosingStrategy;
  oddspapi_api_key: string | null;
}

/**
 * Statistiques d'utilisation de l'API
 */
export interface ApiUsage {
  current_count: number;
  limit: number;
  remaining: number;
  reset_date: Date | null;
  percentage_used: number;
}

/**
 * Helper pour convertir les settings DB en AppSettings typé
 */
export function settingsArrayToObject(settings: Setting[]): Partial<AppSettings> {
  const obj: Partial<AppSettings> = {};

  settings.forEach((setting) => {
    const key = setting.key as keyof AppSettings;
    const value = setting.value;

    switch (key) {
      case "password_hash":
      case "auto_sync_time":
      case "extra_sync_time":
        obj[key] = value ?? "";
        break;
      case "last_sync":
      case "api_requests_reset_date":
        obj[key] = value ?? null;
        break;
      case "auto_sync_enabled":
      case "extra_sync_enabled":
        obj[key] = value === "true";
        break;
      case "api_requests_count":
        obj[key] = parseInt(value, 10) || 0;
        break;
      case "followed_tournaments":
        obj[key] = value || null;
        break;
      case "odds_closing_strategy":
        obj[key] = value === "tournament" ? "tournament" : "historical";
        break;
      case "oddspapi_api_key":
        obj[key] = value || null;
        break;
    }
  });

  return obj;
}

/**
 * Helper pour convertir un objet en tableau de settings pour la DB
 */
export function objectToSettingsArray(obj: Partial<AppSettings>): Partial<Setting>[] {
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value: String(value),
  }));
}

/**
 * Valeurs par défaut des paramètres
 */
export const DEFAULT_SETTINGS: AppSettings = {
  password_hash: "",
  last_sync: null,
  auto_sync_enabled: true,
  auto_sync_time: "06:00",
  extra_sync_enabled: false,
  extra_sync_time: "18:00",
  api_requests_count: 0,
  api_requests_reset_date: null,
  followed_tournaments: null,
  odds_closing_strategy: "historical",
  oddspapi_api_key: null,
};

export const DEFAULT_CLOSING_STRATEGY: OddsClosingStrategy = "historical";
