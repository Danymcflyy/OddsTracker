import { NextRequest, NextResponse } from 'next/server';
import {
  getCountries,
  getLeagues,
  getMarketOptions,
} from '@/lib/db/queries/v3/filter-options';

/**
 * GET /api/v3/filter-options
 * Récupère toutes les options de filtres pour le sport spécifié
 *
 * Query params:
 * - sport: string (default: 'football')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sport = searchParams.get('sport') || 'football';

    // Récupérer toutes les options en parallèle
    const [countries, leagues, markets] = await Promise.all([
      getCountries(),
      getLeagues(sport),
      getMarketOptions(sport),
    ]);

    // Formater pour les composants de filtres
    const filterOptions = {
      countries: countries.map((c) => ({ id: c.id, name: c.name })),
      leagues: leagues.map((l) => ({
        id: l.id,
        name: l.display_name || l.name,
        countryName: l.country_name,
      })),
      markets: markets.map((m) => ({ id: m.id, name: m.label })),
    };

    return NextResponse.json({
      success: true,
      data: filterOptions,
    });
  } catch (error) {
    console.error('Erreur API filter-options:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch filter options',
      },
      { status: 500 }
    );
  }
}
