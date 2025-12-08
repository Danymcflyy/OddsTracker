import prisma from './prisma';
import type { FilterOptions, FixtureWithOdds } from '@/types';
import { Prisma } from '@prisma/client';

// ===========================================
// SPORTS & LIGUES
// ===========================================

export async function getOrCreateSport(key: string, name: string) {
  return prisma.sport.upsert({
    where: { key },
    update: { name },
    create: { key, name },
  });
}

export async function getOrCreateLeague(
  key: string, 
  name: string, 
  sportId: string,
  country?: string
) {
  return prisma.league.upsert({
    where: { key },
    update: { name, country },
    create: { key, name, sportId, country },
  });
}

export async function getOrCreateTeam(name: string, country?: string) {
  return prisma.team.upsert({
    where: { name_country: { name, country: country || '' } },
    update: {},
    create: { name, country },
  });
}

// ===========================================
// FIXTURES
// ===========================================

export async function upsertFixture(data: {
  externalId: string;
  sportId: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  commenceTime: Date;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
}) {
  return prisma.fixture.upsert({
    where: { externalId: data.externalId },
    update: {
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      status: data.status,
    },
    create: data,
  });
}

export async function getFixtures(filters: FilterOptions) {
  const where: Prisma.FixtureWhereInput = {};

  if (filters.sport) {
    where.sport = { key: filters.sport };
  }
  if (filters.league) {
    where.league = { key: filters.league };
  }
  if (filters.country) {
    where.league = { ...where.league as object, country: filters.country };
  }
  if (filters.team) {
    where.OR = [
      { homeTeam: { name: { contains: filters.team } } },
      { awayTeam: { name: { contains: filters.team } } },
    ];
  }
  if (filters.dateFrom) {
    where.commenceTime = { ...where.commenceTime as object, gte: filters.dateFrom };
  }
  if (filters.dateTo) {
    where.commenceTime = { ...where.commenceTime as object, lte: filters.dateTo };
  }

  return prisma.fixture.findMany({
    where,
    include: {
      sport: true,
      league: true,
      homeTeam: true,
      awayTeam: true,
      odds: true,
    },
    orderBy: { commenceTime: 'desc' },
  });
}

export async function getFixturesWithOdds(filters: FilterOptions): Promise<FixtureWithOdds[]> {
  const fixtures = await getFixtures(filters);

  return fixtures.map((f) => ({
    id: f.id,
    date: f.commenceTime,
    country: f.league.country || '',
    league: f.league.name,
    homeTeam: f.homeTeam.name,
    awayTeam: f.awayTeam.name,
    homeScore: f.homeScore,
    awayScore: f.awayScore,
    status: f.status,
    odds: f.odds
      .filter((o) => {
        if (filters.market && o.market !== filters.market) return false;
        if (filters.oddsType && o.oddsType !== filters.oddsType) return false;
        if (filters.oddsMin && o.homeOdds < filters.oddsMin) return false;
        if (filters.oddsMax && o.homeOdds > filters.oddsMax) return false;
        return true;
      })
      .map((o) => ({
        market: o.market,
        type: o.oddsType,
        home: o.homeOdds,
        draw: o.drawOdds,
        away: o.awayOdds,
        line: o.line,
      })),
  }));
}

// ===========================================
// COTES
// ===========================================

export async function upsertOdds(data: {
  fixtureId: string;
  market: 'H2H' | 'SPREADS' | 'TOTALS' | 'DOUBLE_CHANCE';
  oddsType: 'OPENING' | 'CLOSING';
  homeOdds: number;
  drawOdds?: number | null;
  awayOdds: number;
  line?: number | null;
  timestamp: Date;
}) {
  return prisma.odds.upsert({
    where: {
      fixtureId_market_oddsType_line: {
        fixtureId: data.fixtureId,
        market: data.market,
        oddsType: data.oddsType,
        line: data.line || 0,
      },
    },
    update: {
      homeOdds: data.homeOdds,
      drawOdds: data.drawOdds,
      awayOdds: data.awayOdds,
      timestamp: data.timestamp,
    },
    create: data,
  });
}

// ===========================================
// SETTINGS
// ===========================================

export async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: 'settings' } });
  
  if (!settings) {
    // Créer les settings par défaut
    const bcrypt = await import('bcryptjs');
    const defaultPassword = process.env.APP_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    
    settings = await prisma.settings.create({
      data: {
        id: 'settings',
        passwordHash,
      },
    });
  }
  
  return settings;
}

export async function updateSettings(data: {
  passwordHash?: string;
  lastSyncDate?: Date;
  apiRequestsUsed?: number;
}) {
  return prisma.settings.update({
    where: { id: 'settings' },
    data,
  });
}

export async function incrementApiRequests(count: number = 1) {
  return prisma.settings.update({
    where: { id: 'settings' },
    data: {
      apiRequestsUsed: { increment: count },
    },
  });
}

export async function verifyPassword(password: string): Promise<boolean> {
  const settings = await getSettings();
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, settings.passwordHash);
}

// ===========================================
// SYNC LOGS
// ===========================================

export async function createSyncLog(data: {
  type: string;
  sport?: string;
  league?: string;
}) {
  return prisma.syncLog.create({
    data: {
      ...data,
      status: 'started',
    },
  });
}

export async function updateSyncLog(
  id: string,
  data: {
    status?: string;
    fixturesAdded?: number;
    oddsAdded?: number;
    requestsUsed?: number;
    error?: string;
    completedAt?: Date;
  }
) {
  return prisma.syncLog.update({
    where: { id },
    data,
  });
}

export async function getSyncLogs(limit: number = 20) {
  return prisma.syncLog.findMany({
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
}

// ===========================================
// STATISTIQUES
// ===========================================

export async function getStats() {
  const [
    totalFixtures,
    totalOdds,
    sports,
    leagues,
    settings,
    recentSyncs,
  ] = await Promise.all([
    prisma.fixture.count(),
    prisma.odds.count(),
    prisma.sport.count({ where: { active: true } }),
    prisma.league.count({ where: { active: true } }),
    getSettings(),
    getSyncLogs(5),
  ]);

  return {
    totalFixtures,
    totalOdds,
    activeSports: sports,
    activeLeagues: leagues,
    apiRequestsUsed: settings.apiRequestsUsed,
    apiRequestsMax: settings.apiRequestsMax,
    lastSyncDate: settings.lastSyncDate,
    recentSyncs,
  };
}
