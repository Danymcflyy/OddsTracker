/**
 * Match Discovery Service - Per League (V2)
 * Découvre les nouveaux matchs pour UNE ligue spécifique
 * Conçu pour exécution parallèle
 */

import { getOddsApiClient } from '@/lib/api/oddsapi/client';
import { supabaseAdmin } from '@/lib/db';
import type { OddsApiEvent } from '@/lib/api/oddsapi/types';

export interface LeagueMatchDiscoveryResult {
  league_id: string;
  league_name: string;
  discovered: number;
  updated: number;
  errors: string[];
  duration_ms: number;
  success: boolean;
}

/**
 * Découvre les nouveaux matchs pour une ligue spécifique
 * Utilisé par le système V2 de synchronisation parallèle
 */
export async function discoverMatchesForLeague(
  sportId: string,
  sportOddsapiKey: string,
  leagueId: string,
  leagueOddsapiKey: string,
  leagueName: string
): Promise<LeagueMatchDiscoveryResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let discovered = 0;
  let updated = 0;

  try {
    const client = getOddsApiClient();
    if (!client) {
      throw new Error('Client Odds-API.io non disponible');
    }

    // Période de recherche : maintenant + 30 jours
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Appel API pour cette ligue uniquement
    const events = await client.getEvents({
      sport: sportOddsapiKey,
      league: leagueOddsapiKey,
      fromDate: now,
      toDate: futureDate,
    });

    console.log(`  📋 [${leagueName}] ${events.length} événements trouvés`);

    // Traiter chaque événement
    for (const event of events) {
      try {
        const result = await upsertMatch(sportId, leagueId, event);

        if (result === 'created') discovered++;
        else if (result === 'updated') updated++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Event ${event.id}: ${errorMessage}`);
      }
    }

    return {
      league_id: leagueId,
      league_name: leagueName,
      discovered,
      updated,
      errors,
      duration_ms: Date.now() - startTime,
      success: errors.length === 0
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(`League discovery failed: ${errorMessage}`);

    return {
      league_id: leagueId,
      league_name: leagueName,
      discovered: 0,
      updated: 0,
      errors,
      duration_ms: Date.now() - startTime,
      success: false
    };
  }
}

/**
 * Crée ou met à jour un match dans la base de données
 * (Réutilisé de V1)
 */
async function upsertMatch(
  sportId: string,
  leagueId: string,
  event: OddsApiEvent
): Promise<'created' | 'updated' | 'error'> {
  try {
    // Récupérer ou créer les équipes
    const homeTeamId = await getOrCreateTeam(sportId, event.home);
    const awayTeamId = await getOrCreateTeam(sportId, event.away);

    if (!homeTeamId || !awayTeamId) {
      console.error(`     ⚠️  Impossible de créer les équipes pour event ${event.id}`);
      return 'error';
    }

    // Vérifier si le match existe déjà
    const { data: existing } = await (supabaseAdmin as any)
      .from('matches')
      .select('id')
      .eq('oddsapi_id', event.id)
      .single();

    // Mapper le status de l'API vers notre statut interne
    const internalStatus = event.status === 'pending' ? 'scheduled' :
                          event.status === 'settled' ? 'finished' :
                          event.status || 'scheduled';

    const matchData = {
      oddsapi_id: event.id,
      sport_id: sportId,
      league_id: leagueId,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      match_date: event.date,
      status: internalStatus,
      home_score: event.scores?.home || null,
      away_score: event.scores?.away || null,
    };

    if (existing) {
      // Mettre à jour
      const { error: updateError } = await (supabaseAdmin as any)
        .from('matches')
        .update(matchData)
        .eq('id', existing.id);

      if (updateError) {
        console.error(`     ❌ Erreur update match ${event.id}:`, updateError.message);
        return 'error';
      }

      return 'updated';
    } else {
      // Créer
      const { error: insertError } = await (supabaseAdmin as any)
        .from('matches')
        .insert(matchData);

      if (insertError) {
        console.error(`     ❌ Erreur insert match ${event.id}:`, insertError.message);
        return 'error';
      }

      return 'created';
    }
  } catch (error) {
    console.error(`     ❌ Erreur upsert match:`, error);
    return 'error';
  }
}

/**
 * Récupère une équipe existante ou en crée une nouvelle
 * (Réutilisé de V1)
 */
async function getOrCreateTeam(
  sportId: string,
  teamName: string
): Promise<string | null> {
  if (!teamName || teamName.trim() === '') {
    return null;
  }

  const normalized = normalizeTeamName(teamName);

  try {
    // Chercher par nom exact de l'API
    const { data: existing } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('sport_id', sportId)
      .eq('oddsapi_name', teamName)
      .single();

    if (existing) {
      return existing.id;
    }

    // Créer une nouvelle équipe
    const { data: created, error: insertError } = await supabaseAdmin
      .from('teams')
      .insert({
        sport_id: sportId,
        oddsapi_name: teamName,
        normalized_name: normalized,
        display_name: teamName,
      } as any)
      .select('id')
      .single();

    if (insertError) {
      console.error(`     ❌ Erreur création équipe ${teamName}:`, insertError.message);
      return null;
    }

    return created?.id || null;
  } catch (error) {
    console.error(`     ❌ Erreur getOrCreateTeam ${teamName}:`, error);
    return null;
  }
}

/**
 * Normalise un nom d'équipe pour le matching
 * (Réutilisé de V1)
 */
function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime accents
    .replace(/\s+/g, ' ') // Normalise espaces
    .trim();
}
