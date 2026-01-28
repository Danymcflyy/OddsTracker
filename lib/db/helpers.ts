/**
 * Database Helpers for The Odds API v4 Schema
 */

import { supabaseAdmin } from '@/lib/supabase/admin';
import type {
  Sport,
  Event,
  MarketState,
  ClosingOdds,
  Setting,
  ApiUsageLog,
  EventWithMarketProgress,
  AppSettings,
  InsertSport,
  InsertEvent,
  InsertMarketState,
  InsertClosingOdds,
  InsertApiUsageLog,
} from './types';

/**
 * Settings Helpers
 */
export async function getSetting<K extends keyof AppSettings>(
  key: K
): Promise<AppSettings[K] | null> {
  const { data, error } = await (supabaseAdmin as any)
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error(`Failed to get setting ${key}:`, error);
    return null;
  }

  if (!data) {
    // Setting doesn't exist yet - return null without logging error
    return null;
  }

  return data.value as AppSettings[K];
}

export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<boolean> {
  const { error } = await (supabaseAdmin as any)
    .from('settings')
    .update({ value: value as any, updated_at: new Date().toISOString() })
    .eq('key', key);

  if (error) {
    console.error(`Failed to update setting ${key}:`, error);
    return false;
  }

  return true;
}

export async function getAllSettings(): Promise<Partial<AppSettings>> {
  const { data, error } = await (supabaseAdmin as any)
    .from('settings')
    .select('key, value');

  if (error || !data) {
    console.error('Failed to get settings:', error);
    return {};
  }

  return data.reduce((acc: Partial<AppSettings>, { key, value }: any) => {
    acc[key as keyof AppSettings] = value as any;
    return acc;
  }, {} as Partial<AppSettings>);
}

/**
 * Sports Helpers
 */
export async function upsertSport(sport: InsertSport): Promise<Sport | null> {
  const { data, error } = await (supabaseAdmin as any)
    .from('sports')
    .upsert(sport as any, { onConflict: 'api_key' })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert sport:', error);
    return null;
  }

  return data as unknown as Sport;
}

export async function getActiveSports(): Promise<Sport[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from('sports')
    .select('*')
    .eq('active', true)
    .order('title');

  if (error) {
    console.error('Failed to get active sports:', error);
    return [];
  }

  return (data || []) as unknown as Sport[];
}

export async function getTrackedSports(): Promise<Sport[]> {
  const trackedKeys = await getSetting('tracked_sports');
  if (!trackedKeys || trackedKeys.length === 0) return [];

  const { data, error } = await (supabaseAdmin as any)
    .from('sports')
    .select('*')
    .in('api_key', trackedKeys)
    .eq('active', true);

  if (error) {
    console.error('Failed to get tracked sports:', error);
    return [];
  }

  return (data || []) as unknown as Sport[];
}

/**
 * Events Helpers
 */
export async function upsertEvent(event: InsertEvent): Promise<Event | null> {
  const { data, error } = await (supabaseAdmin as any)
    .from('events')
    .upsert(event, { onConflict: 'api_event_id' })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert event:', error);
    return null;
  }

  return data;
}

export async function getEventByApiId(apiEventId: string): Promise<Event | null> {
  const { data, error } = await (supabaseAdmin as any)
    .from('events')
    .select('*')
    .eq('api_event_id', apiEventId)
    .single();

  if (error) {
    console.error('Failed to get event:', error);
    return null;
  }

  return data;
}

export async function getUpcomingEvents(sportKey?: string): Promise<Event[]> {
  let query = (supabaseAdmin as any)
    .from('events')
    .select('*')
    .in('status', ['upcoming', 'live'])
    .order('commence_time');

  if (sportKey) {
    query = query.eq('sport_key', sportKey);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to get upcoming events:', error);
    return [];
  }

  return (data || []) as Event[];
}

export async function getCompletedEventsWithoutClosing(): Promise<Event[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from('events')
    .select(`
      *,
      closing_odds!left(id)
    `)
    .eq('completed', true)
    .is('closing_odds.id', null)
    .order('commence_time', { ascending: false });

  if (error) {
    console.error('Failed to get completed events without closing:', error);
    return [];
  }

  return (data || []) as any[];
}

/**
 * Market States Helpers
 */
export async function upsertMarketState(marketState: InsertMarketState): Promise<MarketState | null> {
  const { data, error } = await (supabaseAdmin as any)
    .from('market_states')
    .upsert(marketState as any, { onConflict: 'event_id,market_key' })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert market state:', error);
    return null;
  }

  return data as MarketState;
}

export async function getPendingMarkets(eventId: string): Promise<MarketState[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from('market_states')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'pending');

  if (error) {
    console.error('Failed to get pending markets:', error);
    return [];
  }

  return (data || []) as MarketState[];
}

export async function getEventsWithPendingMarkets(): Promise<EventWithMarketProgress[]> {
  const { data, error } = await (supabaseAdmin as any)
    .from('events_with_market_progress')
    .select('*')
    .gt('markets_pending', 0)
    .in('status', ['upcoming', 'live'])
    .order('commence_time');

  if (error) {
    console.error('Failed to get events with pending markets:', error);
    return [];
  }

  return (data || []) as EventWithMarketProgress[];
}

/**
 * Closing Odds Helpers
 */
export async function insertClosingOdds(closingOdds: InsertClosingOdds): Promise<ClosingOdds | null> {
  const { data, error } = await (supabaseAdmin as any)
    .from('closing_odds')
    .upsert(closingOdds as any, { onConflict: 'event_id' })
    .select()
    .single();

  if (error) {
    console.error('Failed to insert closing odds:', error);
    return null;
  }

  return data as ClosingOdds;
}

export async function updateClosingOdds(
  eventId: string,
  updates: Partial<InsertClosingOdds>
): Promise<boolean> {
  const { error } = await (supabaseAdmin as any)
    .from('closing_odds')
    .update(updates)
    .eq('event_id', eventId);

  if (error) {
    console.error('Failed to update closing odds:', error);
    return false;
  }

  return true;
}

/**
 * API Usage Logs Helpers
 */
export async function logApiUsage(log: InsertApiUsageLog): Promise<boolean> {
  const { error } = await (supabaseAdmin as any)
    .from('api_usage_logs')
    .insert(log as any);

  if (error) {
    console.error('Failed to log API usage:', error);
    return false;
  }

  return true;
}

export async function getApiUsageToday(): Promise<{ totalCredits: number; totalRequests: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await (supabaseAdmin as any)
    .from('api_usage_logs')
    .select('credits_used')
    .gte('created_at', today.toISOString());

  if (error) {
    console.error('Failed to get API usage today:', error);
    return { totalCredits: 0, totalRequests: 0 };
  }

  const totalCredits = (data || []).reduce((sum: number, log: any) => sum + (log.credits_used || 0), 0);
  return { totalCredits, totalRequests: data?.length || 0 };
}

/**
 * Batch Operations
 */
export async function createMarketStatesForEvent(
  eventId: string,
  markets: string[],
  deadline: string
): Promise<boolean> {
  const marketStates = markets.map(market_key => ({
    event_id: eventId,
    market_key,
    status: 'pending',
    deadline,
    attempts: 0,
  }));

  const { error } = await (supabaseAdmin as any)
    .from('market_states')
    .upsert(marketStates as any, { onConflict: 'event_id,market_key' });

  if (error) {
    console.error('Failed to create market states:', error);
    return false;
  }

  return true;
}

/**
 * Sync market_states for all upcoming events when tracked_markets changes
 * This ensures new markets are added to existing events
 */
export async function syncMarketStatesWithTrackedMarkets(
  newTrackedMarkets: string[]
): Promise<{ eventsUpdated: number; marketsAdded: number }> {
  console.log('[SyncMarketStates] Syncing market_states with new tracked_markets...');

  // Get all upcoming events
  const { data: upcomingEvents, error: eventsError } = await (supabaseAdmin as any)
    .from('events')
    .select('id, commence_time')
    .in('status', ['upcoming', 'live'])
    .gt('commence_time', new Date().toISOString());

  if (eventsError || !upcomingEvents) {
    console.error('[SyncMarketStates] Failed to get upcoming events:', eventsError);
    return { eventsUpdated: 0, marketsAdded: 0 };
  }

  if (upcomingEvents.length === 0) {
    console.log('[SyncMarketStates] No upcoming events to sync');
    return { eventsUpdated: 0, marketsAdded: 0 };
  }

  console.log(`[SyncMarketStates] Found ${upcomingEvents.length} upcoming events`);

  // Get existing market_states for these events
  const eventIds = upcomingEvents.map((e: any) => e.id);
  const { data: existingStates } = await (supabaseAdmin as any)
    .from('market_states')
    .select('event_id, market_key')
    .in('event_id', eventIds);

  // Build a set of existing (event_id, market_key) pairs
  const existingPairs = new Set(
    (existingStates || []).map((s: any) => `${s.event_id}:${s.market_key}`)
  );

  // Find missing market_states
  const missingStates: any[] = [];
  for (const event of upcomingEvents) {
    for (const marketKey of newTrackedMarkets) {
      const pairKey = `${event.id}:${marketKey}`;
      if (!existingPairs.has(pairKey)) {
        missingStates.push({
          event_id: event.id,
          market_key: marketKey,
          status: 'pending',
          deadline: event.commence_time,
          attempts: 0,
        });
      }
    }
  }

  if (missingStates.length === 0) {
    console.log('[SyncMarketStates] All market_states are already in sync');
    return { eventsUpdated: 0, marketsAdded: 0 };
  }

  console.log(`[SyncMarketStates] Adding ${missingStates.length} missing market_states...`);

  // Insert missing market_states in batches
  const BATCH_SIZE = 500;
  let totalAdded = 0;
  const eventsAffected = new Set<string>();

  for (let i = 0; i < missingStates.length; i += BATCH_SIZE) {
    const batch = missingStates.slice(i, i + BATCH_SIZE);

    const { error } = await (supabaseAdmin as any)
      .from('market_states')
      .upsert(batch, { onConflict: 'event_id,market_key' });

    if (error) {
      console.error('[SyncMarketStates] Failed to insert batch:', error);
    } else {
      totalAdded += batch.length;
      batch.forEach((s: any) => eventsAffected.add(s.event_id));
    }
  }

  console.log(`[SyncMarketStates] ✅ Added ${totalAdded} market_states to ${eventsAffected.size} events`);

  return { eventsUpdated: eventsAffected.size, marketsAdded: totalAdded };
}
