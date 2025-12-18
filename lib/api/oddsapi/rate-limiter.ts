/**
 * Rate Limiter pour Odds-API.io
 * Gère le quota de 5000 requêtes par jour
 * Persiste l'état dans Supabase pour survie aux redémarrages
 */

import { supabaseAdmin } from '@/lib/db';
import { SettingKey } from '@/types/settings';

interface RateLimitState {
  requestsUsedToday: number;
  resetTime: Date;
}

const DAILY_LIMIT = 5000;  // Odds-API.io daily limit
const HOURLY_LIMIT = 5000;  // Also treated as hourly for safety
const HAS_ADMIN_CLIENT = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Vérifie si on peut faire une requête
 * Lance une erreur si quota atteint
 */
export async function checkRateLimit(): Promise<void> {
  if (!HAS_ADMIN_CLIENT) {
    // Sans client admin, on ne peut pas tracker persistent
    // Utiliser le client OddsApiClient pour le tracking
    return;
  }

  const state = await getOrInitializeRateLimitState();

  if (state.requestsUsedToday >= DAILY_LIMIT) {
    const hoursUntilReset = getHoursUntilReset(state.resetTime);
    throw new Error(
      `Quota quotidien OddsApi atteint (${state.requestsUsedToday}/${DAILY_LIMIT}). ` +
      `Réessayez dans ${hoursUntilReset} heure(s).`
    );
  }
}

/**
 * Incrémenter le compteur de requêtes
 */
export async function incrementRateLimit(count: number = 1): Promise<void> {
  if (!HAS_ADMIN_CLIENT) {
    return;
  }

  const state = await getOrInitializeRateLimitState();
  const newCount = state.requestsUsedToday + count;

  try {
    await updateRateLimitState(newCount);

    if (newCount % 100 === 0) {
      console.log(`📊 Odds-API.io requests today: ${newCount}/${DAILY_LIMIT}`);
    }

    if (newCount >= DAILY_LIMIT * 0.9) {
      console.warn(`⚠️  Approaching quota: ${newCount}/${DAILY_LIMIT}`);
    }
  } catch (error) {
    console.error('Impossible de mettre à jour le compteur de rate limit', error);
    // Ne pas bloquer sur l'update du compteur
  }
}

/**
 * Récupère l'état actuel du rate limit
 */
export async function getRateLimitState(): Promise<RateLimitState> {
  if (!HAS_ADMIN_CLIENT) {
    return {
      requestsUsedToday: 0,
      resetTime: getNextResetTime(),
    };
  }

  return getOrInitializeRateLimitState();
}

/**
 * Réinitialise le rate limit (pour tests)
 */
export async function resetRateLimit(): Promise<void> {
  if (!HAS_ADMIN_CLIENT) {
    return;
  }

  try {
    await supabaseAdmin.from('settings').upsert(
      [
        {
          key: 'odds_api_requests_count',
          value: '0',
          updated_at: new Date().toISOString(),
        },
        {
          key: 'odds_api_reset_date',
          value: getNextResetTime().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'key' }
    );
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du rate limit', error);
  }
}

/**
 * Récupère l'état du rate limit depuis la DB
 * Réinitialise si le jour a changé
 */
async function getOrInitializeRateLimitState(): Promise<RateLimitState> {
  const state = await readRateLimitState();
  const now = new Date();

  // Vérifier si le jour a changé
  if (!state.resetTime || now >= state.resetTime) {
    const nextReset = getNextResetTime();
    await updateRateLimitState(0, nextReset);
    return { requestsUsedToday: 0, resetTime: nextReset };
  }

  return state;
}

/**
 * Lit l'état du rate limit depuis Supabase
 */
async function readRateLimitState(): Promise<RateLimitState> {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('key,value')
      .in('key', ['odds_api_requests_count', 'odds_api_reset_date']);

    if (error || !data) {
      return {
        requestsUsedToday: 0,
        resetTime: getNextResetTime(),
      };
    }

    let requestsUsedToday = 0;
    let resetTime: Date | null = null;

    const rows = data as Array<{ key: string; value: string | null }>;
    rows.forEach((row) => {
      if (row.key === 'odds_api_requests_count') {
        requestsUsedToday = parseInt(row.value ?? '0', 10) || 0;
      } else if (row.key === 'odds_api_reset_date' && row.value) {
        resetTime = new Date(row.value);
      }
    });

    return {
      requestsUsedToday,
      resetTime: resetTime || getNextResetTime(),
    };
  } catch (error) {
    console.error('Erreur lors de la lecture du rate limit', error);
    return {
      requestsUsedToday: 0,
      resetTime: getNextResetTime(),
    };
  }
}

/**
 * Met à jour l'état du rate limit dans Supabase
 */
async function updateRateLimitState(
  requestsUsedToday: number,
  resetTime?: Date
): Promise<void> {
  try {
    const entries = [
      {
        key: 'odds_api_requests_count',
        value: String(requestsUsedToday),
        updated_at: new Date().toISOString(),
      },
    ];

    if (resetTime) {
      entries.push({
        key: 'odds_api_reset_date',
        value: resetTime.toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    await (supabaseAdmin as any)
      .from('settings')
      .upsert(entries, { onConflict: 'key' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rate limit', error);
    throw error;
  }
}

/**
 * Calcule le prochain timestamp UTC 00:00:00
 */function getNextResetTime(): Date {
  const next = new Date();
  next.setUTCHours(0, 0, 0, 0);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

/**
 * Calcule les heures restantes jusqu'au reset
 */
function getHoursUntilReset(resetTime: Date): number {
  const now = new Date();
  const diffMs = resetTime.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60));
}

/**
 * Middleware pour vérifier rate limit avant requête API
 */
export function createRateLimitMiddleware() {
  return async (req: any, res: any, next: () => void) => {
    try {
      await checkRateLimit();
      next();
    } catch (error) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

/**
 * Logger pour monitorage
 */
export class RateLimitLogger {
  static async logState(): Promise<void> {
    const state = await getRateLimitState();
    const remaining = DAILY_LIMIT - state.requestsUsedToday;
    const percentUsed = ((state.requestsUsedToday / DAILY_LIMIT) * 100).toFixed(1);

    console.log(`
📊 === ODDS-API.IO RATE LIMIT STATUS ===
   Used:      ${state.requestsUsedToday}/${DAILY_LIMIT} requests
   Remaining: ${remaining} requests
   Usage:     ${percentUsed}%
   Reset at:  ${state.resetTime.toISOString()}
========================================
    `);
  }

  static async logWarningIfNearLimit(): Promise<void> {
    const state = await getRateLimitState();
    const percentUsed = (state.requestsUsedToday / DAILY_LIMIT) * 100;

    if (percentUsed >= 80) {
      console.warn(`⚠️  WARNING: Using ${percentUsed.toFixed(1)}% of daily quota!`);
    }
  }
}
