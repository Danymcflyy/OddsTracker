/**
 * API Route - GET /api/v3/markets
 * Récupère les marchés actifs pour un sport
 */

import { NextResponse } from 'next/server';
import { fetchActiveMarkets } from '@/lib/db/queries/v3/markets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sportSlug = searchParams.get('sport') || 'football';

    const markets = await fetchActiveMarkets(sportSlug);

    return NextResponse.json({
      success: true,
      data: markets,
    });
  } catch (error) {
    console.error('Erreur GET /api/v3/markets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des marchés',
      },
      { status: 500 }
    );
  }
}
