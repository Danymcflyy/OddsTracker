/**
 * Validation Schemas using Zod
 * Ensures type-safe input validation for API routes
 */

import { z } from 'zod';

/**
 * Settings validation
 */
export const UpdateSettingSchema = z.object({
  key: z.enum([
    'tracked_sports',
    'tracked_markets',
    'bookmaker',
    'region',
    'scan_frequency',
    'scan_frequency_minutes',
    'retry_attempts',
    'enable_historical_fallback',
    'use_historical_fallback',
  ]),
  value: z.union([
    z.array(z.string()),
    z.number(),
    z.string(),
    z.boolean(),
  ]),
});

export type UpdateSettingInput = z.infer<typeof UpdateSettingSchema>;

/**
 * Events query validation
 */
export const EventsQuerySchema = z.object({
  sportKey: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  sortField: z.enum(['commence_time', 'home_team', 'away_team']).default('commence_time'),
  sortDirection: z.enum(['asc', 'desc']).default('asc'),
});

export type EventsQueryInput = z.infer<typeof EventsQuerySchema>;

/**
 * Validation error response helper
 */
export function formatValidationError(error: z.ZodError) {
  return {
    success: false,
    error: 'Validation failed',
    details: error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    })),
  };
}
