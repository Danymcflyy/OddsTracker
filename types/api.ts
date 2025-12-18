/**
 * Type de base pour les logs de synchronisation
 */
export interface SyncLog {
  id: number;
  sport_id: number;
  success: boolean;
  records_fetched: number;
  records_inserted: number;
  records_updated: number;
  duration_ms: number;
  error_message?: string;
  created_at: string;
}

/**
 * Réponse API standard
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

/**
 * Réponse API avec erreur
 */
export interface ApiError {
  error: string;
  details?: string;
  statusCode?: number;
}

/**
 * Réponse API paginée
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * Paramètres de pagination
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Paramètres de tri
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Réponse de synchronisation
 */
export interface SyncResponse {
  success: boolean;
  sport_id: number;
  sport_name: string;
  records_fetched: number;
  records_inserted: number;
  records_updated: number;
  duration_ms: number;
  log_id: number;
  error?: string;
}

/**
 * Réponse de synchronisation multiple (tous les sports)
 */
export interface MultipleSyncResponse {
  total_sports: number;
  successful: number;
  failed: number;
  results: SyncResponse[];
  total_duration_ms: number;
}

/**
 * Statistiques de l'API OddsPapi
 */
export interface ApiUsageStats {
  requests_count: number;
  requests_limit: number;
  requests_remaining: number;
  reset_date: string;
  usage_percent: number;
}

/**
 * Réponse de l'export
 */
export interface ExportResponse {
  success: boolean;
  filename: string;
  rows_exported: number;
  format: "csv" | "xlsx";
  size_bytes?: number;
}

/**
 * Options d'export
 */
export interface ExportOptions {
  format: "csv" | "xlsx";
  columns?: string[];
  filters?: Record<string, any>;
  sort?: SortParams;
  filename?: string;
}

/**
 * Réponse de mise à jour des paramètres
 */
export interface SettingsUpdateResponse {
  success: boolean;
  updated_keys: string[];
  message?: string;
}

/**
 * Log de synchronisation avec détails du sport
 */
export interface SyncLogWithSport extends SyncLog {
  sport: {
    id: number;
    name: string;
    slug: string;
  };
}

/**
 * Statistiques de synchronisation
 */
export interface SyncStats {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  success_rate: number;
  total_records_fetched: number;
  total_records_inserted: number;
  last_sync_date: string | null;
  average_duration_ms: number;
}
