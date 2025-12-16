/**
 * API Route - GET /api/v3/settings/leagues
 * Récupère toutes les ligues avec leur statut tracked
 */

import { NextResponse } from 'next/server';
import { getLeagues } from '@/lib/db/queries/v3/filter-options';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sportSlug = searchParams.get('sport') || 'football';
    const countryId = searchParams.get('country_id') || undefined;

    const leagues = await getLeagues(sportSlug, countryId);

    return NextResponse.json({
      success: true,
      data: leagues,
    });
  } catch (error) {
    console.error('Erreur GET /api/v3/settings/leagues:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des ligues',
      },
      { status: 500 }
    );
  }
}
