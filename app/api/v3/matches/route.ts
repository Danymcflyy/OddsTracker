/**
 * API Route - GET /api/v3/matches
 * Récupère les matchs avec tous leurs détails pour le tableau
 */

import { NextResponse } from 'next/server';
import { fetchMatchesForTable, type TableFilters } from '@/lib/db/queries/v3/matches';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Paramètres de base
    const sportSlug = searchParams.get('sport') || 'football';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);

    // Filtres
    const filters: TableFilters = {};

    // Date range
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    // IDs arrays
    const countryIds = searchParams.get('countryIds');
    const leagueIds = searchParams.get('leagueIds');
    const teamIds = searchParams.get('teamIds');
    const marketIds = searchParams.get('marketIds');

    if (countryIds) filters.countryIds = countryIds.split(',');
    if (leagueIds) filters.leagueIds = leagueIds.split(',');
    if (teamIds) filters.teamIds = teamIds.split(',');
    if (marketIds) filters.marketIds = marketIds.split(',');

    // Odds range
    const oddsMin = searchParams.get('oddsMin');
    const oddsMax = searchParams.get('oddsMax');
    const oddsType = searchParams.get('oddsType') as 'opening' | 'current' | undefined;

    if (oddsMin) filters.oddsMin = parseFloat(oddsMin);
    if (oddsMax) filters.oddsMax = parseFloat(oddsMax);
    if (oddsType) filters.oddsType = oddsType;

    // Fetch data
    const result = await fetchMatchesForTable(sportSlug, filters, { page, pageSize });

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Erreur GET /api/v3/matches:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des matchs',
      },
      { status: 500 }
    );
  }
}
