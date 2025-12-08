import { 
  getSports, 
  getOdds, 
  getScores,
  extractPinnacleOdds 
} from '@/lib/api';
import {
  getOrCreateSport,
  getOrCreateLeague,
  getOrCreateTeam,
  upsertFixture,
  upsertOdds,
  createSyncLog,
  updateSyncLog,
  updateSettings,
} from '@/lib/db';
import { TARGET_SPORTS, type SyncProgress } from '@/types';

// ===========================================
// SYNC SERVICE
// ===========================================

export class SyncService {
  private progress: SyncProgress = {
    status: 'idle',
    fixturesProcessed: 0,
    fixturesTotal: 0,
    oddsAdded: 0,
    requestsUsed: 0,
    errors: [],
  };

  private syncLogId?: string;
  private aborted = false;

  getProgress(): SyncProgress {
    return { ...this.progress };
  }

  abort(): void {
    this.aborted = true;
  }

  /**
   * Synchronise les matchs et cotes actuels
   */
  async syncCurrent(options: {
    sports?: string[];
    onProgress?: (progress: SyncProgress) => void;
  } = {}): Promise<SyncProgress> {
    this.progress = {
      status: 'running',
      fixturesProcessed: 0,
      fixturesTotal: 0,
      oddsAdded: 0,
      requestsUsed: 0,
      errors: [],
      startTime: new Date(),
    };
    this.aborted = false;

    // Créer le log
    const syncLog = await createSyncLog({ type: 'daily' });
    this.syncLogId = syncLog.id;

    try {
      // Filtrer les sports à synchroniser
      const sportsToSync = TARGET_SPORTS.filter(
        (s) => !options.sports || options.sports.includes(s.key)
      );

      for (const sportConfig of sportsToSync) {
        if (this.aborted) break;

        this.progress.currentSport = sportConfig.name;
        options.onProgress?.(this.progress);

        // Créer/récupérer le sport en DB
        const sport = await getOrCreateSport(sportConfig.key, sportConfig.name);

        for (const leagueConfig of sportConfig.leagues) {
          if (this.aborted) break;

          this.progress.currentLeague = leagueConfig.name;
          options.onProgress?.(this.progress);

          try {
            // Créer/récupérer la ligue
            const league = await getOrCreateLeague(
              leagueConfig.key,
              leagueConfig.name,
              sport.id,
              leagueConfig.country
            );

            // Récupérer les cotes
            const oddsResult = await getOdds(leagueConfig.key, {
              regions: 'eu',
              markets: 'h2h,spreads,totals',
              bookmakers: 'pinnacle',
            });

            this.progress.requestsUsed++;

            if (!oddsResult.success || !oddsResult.data) {
              this.progress.errors.push(`${leagueConfig.name}: ${oddsResult.error}`);
              continue;
            }

            // Traiter chaque événement
            for (const event of oddsResult.data) {
              if (this.aborted) break;

              await this.processEvent(event, sport.id, league.id);
              this.progress.fixturesProcessed++;
            }

            // Récupérer les scores
            const scoresResult = await getScores(leagueConfig.key, { daysFrom: 3 });
            this.progress.requestsUsed++;

            if (scoresResult.success && scoresResult.data) {
              for (const score of scoresResult.data) {
                await this.updateScore(score);
              }
            }

          } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            this.progress.errors.push(`${leagueConfig.name}: ${msg}`);
          }
        }
      }

      this.progress.status = 'completed';
      this.progress.endTime = new Date();

    } catch (error) {
      this.progress.status = 'error';
      this.progress.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    // Mettre à jour le log
    await updateSyncLog(this.syncLogId, {
      status: this.progress.status,
      fixturesAdded: this.progress.fixturesProcessed,
      oddsAdded: this.progress.oddsAdded,
      requestsUsed: this.progress.requestsUsed,
      error: this.progress.errors.join('; '),
      completedAt: new Date(),
    });

    // Mettre à jour la date de dernière sync
    await updateSettings({ lastSyncDate: new Date() });

    return this.progress;
  }

  /**
   * Traite un événement et l'enregistre en DB
   */
  private async processEvent(
    event: any,
    sportId: string,
    leagueId: string
  ): Promise<void> {
    // Créer les équipes
    const homeTeam = await getOrCreateTeam(event.home_team);
    const awayTeam = await getOrCreateTeam(event.away_team);

    // Créer le fixture
    const fixture = await upsertFixture({
      externalId: event.id,
      sportId,
      leagueId,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      commenceTime: new Date(event.commence_time),
    });

    // Extraire les cotes Pinnacle
    const pinnacleOdds = extractPinnacleOdds(event);
    
    if (pinnacleOdds) {
      const timestamp = new Date(pinnacleOdds.lastUpdate);

      // Enregistrer les cotes H2H
      if (pinnacleOdds.markets.h2h) {
        const h2h = pinnacleOdds.markets.h2h;
        await upsertOdds({
          fixtureId: fixture.id,
          market: 'H2H',
          oddsType: 'CLOSING', // Pour l'instant on considère comme closing
          homeOdds: h2h[event.home_team] || 0,
          drawOdds: h2h['Draw'] || null,
          awayOdds: h2h[event.away_team] || 0,
          timestamp,
        });
        this.progress.oddsAdded++;
      }

      // Enregistrer les spreads
      if (pinnacleOdds.markets.spreads) {
        const spreads = pinnacleOdds.markets.spreads;
        const homeLine = spreads[`${event.home_team}_line`];
        await upsertOdds({
          fixtureId: fixture.id,
          market: 'SPREADS',
          oddsType: 'CLOSING',
          homeOdds: spreads[event.home_team] || 0,
          awayOdds: spreads[event.away_team] || 0,
          line: homeLine,
          timestamp,
        });
        this.progress.oddsAdded++;
      }

      // Enregistrer les totals
      if (pinnacleOdds.markets.totals) {
        const totals = pinnacleOdds.markets.totals;
        const line = totals['Over_line'] || totals['Under_line'];
        await upsertOdds({
          fixtureId: fixture.id,
          market: 'TOTALS',
          oddsType: 'CLOSING',
          homeOdds: totals['Over'] || 0,
          awayOdds: totals['Under'] || 0,
          line,
          timestamp,
        });
        this.progress.oddsAdded++;
      }
    }
  }

  /**
   * Met à jour le score d'un match
   */
  private async updateScore(scoreData: any): Promise<void> {
    if (!scoreData.scores || scoreData.scores.length < 2) return;

    const homeScoreData = scoreData.scores.find(
      (s: any) => s.name === scoreData.home_team
    );
    const awayScoreData = scoreData.scores.find(
      (s: any) => s.name === scoreData.away_team
    );

    if (homeScoreData && awayScoreData) {
      await upsertFixture({
        externalId: scoreData.id,
        sportId: '', // Sera ignoré car update
        leagueId: '',
        homeTeamId: '',
        awayTeamId: '',
        commenceTime: new Date(scoreData.commence_time),
        homeScore: parseInt(homeScoreData.score) || null,
        awayScore: parseInt(awayScoreData.score) || null,
        status: scoreData.completed ? 'COMPLETED' : 'LIVE',
      });
    }
  }
}

// Singleton
let syncService: SyncService | null = null;

export function getSyncService(): SyncService {
  if (!syncService) {
    syncService = new SyncService();
  }
  return syncService;
}
