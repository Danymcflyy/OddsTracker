/**
 * Service de synchronisation OddsPapi → Supabase
 * Récupère les cotes depuis l'API et les stocke dans la base de données
 */

import { supabaseAdmin } from "@/lib/db";
import {
  getOdds,
  getScores,
  extractPinnacleOdds,
  type OddsPapiEvent,
  type OddsPapiScore,
} from "./client";

// Configuration des sports à synchroniser
export const SPORTS_CONFIG = [
  {
    key: "soccer_epl",
    name: "Premier League",
    sport_slug: "football",
    country: "England",
  },
  {
    key: "soccer_spain_la_liga",
    name: "La Liga",
    sport_slug: "football",
    country: "Spain",
  },
  {
    key: "soccer_germany_bundesliga",
    name: "Bundesliga",
    sport_slug: "football",
    country: "Germany",
  },
  {
    key: "icehockey_nhl",
    name: "NHL",
    sport_slug: "hockey",
    country: "USA",
  },
  {
    key: "tennis_atp_french_open",
    name: "Roland Garros",
    sport_slug: "tennis",
    country: "France",
  },
] as const;

export interface SyncProgress {
  status: "idle" | "running" | "completed" | "error";
  currentSport?: string;
  currentLeague?: string;
  fixturesProcessed: number;
  fixturesTotal: number;
  oddsAdded: number;
  requestsUsed: number;
  errors: string[];
  startTime?: Date;
  endTime?: Date;
}

export interface SyncResult {
  success: boolean;
  progress: SyncProgress;
  logId?: number;
}

/**
 * Service de synchronisation
 */
export class OddsSyncService {
  private progress: SyncProgress = {
    status: "idle",
    fixturesProcessed: 0,
    fixturesTotal: 0,
    oddsAdded: 0,
    requestsUsed: 0,
    errors: [],
  };

  private syncLogId?: number;
  private aborted = false;
  private db = supabaseAdmin as any;

  /**
   * Récupère la progression actuelle
   */
  getProgress(): SyncProgress {
    return { ...this.progress };
  }

  /**
   * Annule la synchronisation en cours
   */
  abort(): void {
    this.aborted = true;
  }

  /**
   * Synchronise les cotes actuelles pour tous les sports configurés
   */
  async syncCurrent(options: {
    sports?: string[];
    onProgress?: (progress: SyncProgress) => void;
  } = {}): Promise<SyncResult> {
    this.progress = {
      status: "running",
      fixturesProcessed: 0,
      fixturesTotal: 0,
      oddsAdded: 0,
      requestsUsed: 0,
      errors: [],
      startTime: new Date(),
    };
    this.aborted = false;

    try {
      // Créer un log de synchronisation
      const { data: syncLog, error: logError } = await this.db
        .from("sync_logs")
        .insert({
          sport_id: 1, // On mettra à jour par sport après
          status: "running",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (logError || !syncLog) {
        throw new Error("Erreur lors de la création du log de sync");
      }

      this.syncLogId = syncLog.id;

      // Filtrer les sports à synchroniser
      const sportsToSync = SPORTS_CONFIG.filter(
        (s) => !options.sports || options.sports.includes(s.sport_slug)
      );

      for (const leagueConfig of sportsToSync) {
        if (this.aborted) break;

        this.progress.currentLeague = leagueConfig.name;
        options.onProgress?.(this.progress);

        try {
          await this.syncLeague(leagueConfig);
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Unknown error";
          this.progress.errors.push(`${leagueConfig.name}: ${msg}`);
        }
      }

      this.progress.status = "completed";
      this.progress.endTime = new Date();

      // Mettre à jour le log
      await this.updateSyncLog("success");

      // Mettre à jour la date de dernière sync
      await this.db
        .from("settings")
        .update({
          value: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("key", "last_sync");

      return {
        success: true,
        progress: this.progress,
        logId: this.syncLogId,
      };
    } catch (error) {
      this.progress.status = "error";
      this.progress.errors.push(
        error instanceof Error ? error.message : "Unknown error"
      );
      this.progress.endTime = new Date();

      await this.updateSyncLog("error");

      return {
        success: false,
        progress: this.progress,
        logId: this.syncLogId,
      };
    }
  }

  /**
   * Synchronise une ligue spécifique
   */
  private async syncLeague(leagueConfig: typeof SPORTS_CONFIG[number]): Promise<void> {
    console.log(`\n[SYNC] Synchronisation de ${leagueConfig.name}...`);

    // 1. Récupérer le sport en DB
    const sport = await this.getOrCreateSport(leagueConfig.sport_slug);

    // 2. Récupérer le pays
    const country = await this.getOrCreateCountry(leagueConfig.country);

    // 3. Récupérer la ligue
    const league = await this.getOrCreateLeague(
      leagueConfig.key,
      leagueConfig.name,
      sport.id,
      country.id
    );

    // 4. Récupérer les cotes depuis l'API
    const oddsResult = await getOdds(leagueConfig.key, {
      regions: "eu",
      markets: "h2h,spreads,totals",
      bookmakers: "pinnacle",
    });

    this.progress.requestsUsed++;

    if (!oddsResult.success || !oddsResult.data) {
      throw new Error(oddsResult.error || "Erreur API");
    }

    console.log(`  ✓ ${oddsResult.data.length} événements récupérés`);

    // 5. Traiter chaque événement
    for (const event of oddsResult.data) {
      if (this.aborted) break;
      await this.processEvent(event, sport.id, league.id);
      this.progress.fixturesProcessed++;
    }

    // 6. Récupérer les scores
    const scoresResult = await getScores(leagueConfig.key, { daysFrom: 3 });
    this.progress.requestsUsed++;

    if (scoresResult.success && scoresResult.data) {
      console.log(`  ✓ ${scoresResult.data.length} scores récupérés`);
      for (const score of scoresResult.data) {
        await this.updateScore(score);
      }
    }
  }

  /**
   * Récupère ou crée un sport
   */
  private async getOrCreateSport(slug: string) {
    const { data: existing } = await this.db
      .from("sports")
      .select("*")
      .eq("slug", slug)
      .single();

    if (existing) return existing;

    throw new Error(`Sport ${slug} introuvable dans la base de données`);
  }

  /**
   * Récupère ou crée un pays
   */
  private async getOrCreateCountry(countryName: string) {
    const slug = countryName.toLowerCase().replace(/\s+/g, "-");

    const { data: existing } = await this.db
      .from("countries")
      .select("*")
      .eq("oddspapi_slug", slug)
      .single();

    if (existing) return existing;

    const { data: created, error } = await this.db
      .from("countries")
      .insert({ oddspapi_slug: slug, name: countryName })
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Erreur lors de la création du pays ${countryName}`);
    }

    return created;
  }

  /**
   * Récupère ou crée une ligue
   */
  private async getOrCreateLeague(
    leagueKey: string,
    leagueName: string,
    sportId: number,
    countryId: number
  ) {
    // Générer un oddspapi_id à partir du key
    const oddspapiId = leagueKey.split("_").slice(-1)[0].charCodeAt(0);

    const { data: existing } = await this.db
      .from("leagues")
      .select("*")
      .eq("slug", leagueKey)
      .single();

    if (existing) return existing;

    const { data: created, error } = await this.db
      .from("leagues")
      .insert({
        oddspapi_id: oddspapiId,
        sport_id: sportId,
        country_id: countryId,
        name: leagueName,
        slug: leagueKey,
      })
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Erreur lors de la création de la ligue ${leagueName}`);
    }

    return created;
  }

  /**
   * Récupère ou crée une équipe
   */
  private async getOrCreateTeam(teamName: string) {
    // Générer un oddspapi_id à partir du nom
    const oddspapiId = teamName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const { data: existing } = await this.db
      .from("teams")
      .select("*")
      .eq("name", teamName)
      .single();

    if (existing) return existing;

    const { data: created, error } = await this.db
      .from("teams")
      .insert({ oddspapi_id: oddspapiId, name: teamName })
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Erreur lors de la création de l'équipe ${teamName}`);
    }

    return created;
  }

  /**
   * Traite un événement et l'enregistre en DB
   */
  private async processEvent(
    event: OddsPapiEvent,
    sportId: number,
    leagueId: number
  ): Promise<void> {
    // 1. Créer les équipes
    const homeTeam = await this.getOrCreateTeam(event.home_team);
    const awayTeam = await this.getOrCreateTeam(event.away_team);

    // 2. Créer ou mettre à jour le fixture
    const { data: fixture, error: fixtureError } = await this.db
      .from("fixtures")
      .upsert(
        {
          oddspapi_id: event.id,
          sport_id: sportId,
          league_id: leagueId,
          home_team_id: homeTeam.id,
          away_team_id: awayTeam.id,
          start_time: event.commence_time,
          status: "scheduled",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "oddspapi_id",
        }
      )
      .select()
      .single();

    if (fixtureError || !fixture) {
      console.error("Erreur fixture:", fixtureError);
      return;
    }

    // 3. Extraire et enregistrer les cotes Pinnacle
    const pinnacleOdds = extractPinnacleOdds(event);

    if (pinnacleOdds) {
      await this.saveOdds(fixture.id, pinnacleOdds);
    }
  }

  /**
   * Sauvegarde les cotes dans la base de données
   */
  private async saveOdds(
    fixtureId: number,
    pinnacleOdds: { lastUpdate: string; markets: Record<string, Record<string, number>> }
  ): Promise<void> {
    const timestamp = pinnacleOdds.lastUpdate;

    // Pour chaque marché (h2h, spreads, totals)
    for (const [marketKey, outcomes] of Object.entries(pinnacleOdds.markets)) {
      // Créer ou récupérer le market
      const market = await this.getOrCreateMarket(marketKey);

      // Créer les outcomes et odds
      for (const [outcomeName, price] of Object.entries(outcomes)) {
        if (outcomeName.endsWith("_point")) continue; // Skip les points

        const outcome = await this.getOrCreateOutcome(outcomeName, market.id);

        // Insérer les cotes (closing pour l'instant)
        await this.db.from("odds").insert({
          fixture_id: fixtureId,
          market_id: market.id,
          outcome_id: outcome.id,
          closing_price: price,
          closing_timestamp: timestamp,
        });

        this.progress.oddsAdded++;
      }
    }
  }

  /**
   * Récupère ou crée un marché
   */
  private async getOrCreateMarket(marketKey: string) {
    const marketNames: Record<string, string> = {
      h2h: "Match Result (1X2)",
      spreads: "Handicap",
      totals: "Over/Under",
    };

    const oddspapiId = marketKey.charCodeAt(0);
    const name = marketNames[marketKey] || marketKey;

    const { data: existing } = await this.db
      .from("markets")
      .select("*")
      .eq("oddspapi_id", oddspapiId)
      .single();

    if (existing) return existing;

    const { data: created, error } = await this.db
      .from("markets")
      .insert({ oddspapi_id: oddspapiId, name })
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Erreur lors de la création du marché ${name}`);
    }

    return created;
  }

  /**
   * Récupère ou crée un outcome
   */
  private async getOrCreateOutcome(outcomeName: string, marketId: number) {
    const oddspapiId = outcomeName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const { data: existing } = await this.db
      .from("outcomes")
      .select("*")
      .eq("name", outcomeName)
      .eq("market_id", marketId)
      .single();

    if (existing) return existing;

    const { data: created, error } = await this.db
      .from("outcomes")
      .insert({ oddspapi_id: oddspapiId, market_id: marketId, name: outcomeName })
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Erreur lors de la création de l'outcome ${outcomeName}`);
    }

    return created;
  }

  /**
   * Met à jour le score d'un match
   */
  private async updateScore(scoreData: OddsPapiScore): Promise<void> {
    if (!scoreData.scores || scoreData.scores.length < 2) return;

    const homeScoreData = scoreData.scores.find((s) => s.name === scoreData.home_team);
    const awayScoreData = scoreData.scores.find((s) => s.name === scoreData.away_team);

    if (homeScoreData && awayScoreData) {
      await this.db
        .from("fixtures")
        .update({
          home_score: parseInt(homeScoreData.score) || null,
          away_score: parseInt(awayScoreData.score) || null,
          status: scoreData.completed ? "finished" : "live",
          updated_at: new Date().toISOString(),
        })
        .eq("oddspapi_id", scoreData.id);
    }
  }

  /**
   * Met à jour le log de synchronisation
   */
  private async updateSyncLog(status: string): Promise<void> {
    if (!this.syncLogId) return;

    await this.db
      .from("sync_logs")
      .update({
        status,
        records_fetched: this.progress.fixturesProcessed,
        records_inserted: this.progress.oddsAdded,
        error_message: this.progress.errors.join("; ") || null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", this.syncLogId);
  }
}

// Singleton
let syncService: OddsSyncService | null = null;

export function getSyncService(): OddsSyncService {
  if (!syncService) {
    syncService = new OddsSyncService();
  }
  return syncService;
}
