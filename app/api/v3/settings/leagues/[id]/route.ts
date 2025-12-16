/**
 * API Route - PATCH /api/v3/settings/leagues/[id]
 * Met à jour le statut tracked d'une ligue
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leagueId = params.id;
    const body = await request.json();
    const { tracked } = body;

    if (typeof tracked !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'Le champ "tracked" doit être un booléen',
        },
        { status: 400 }
      );
    }

    // Mettre à jour le statut tracked
    const { data, error } = await supabaseAdmin
      .from('leagues')
      .update({ tracked })
      .eq('id', leagueId)
      .select('id, name, tracked')
      .single();

    if (error) {
      console.error('Erreur update league:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la mise à jour de la ligue',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Erreur PATCH /api/v3/settings/leagues/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
      },
      { status: 500 }
    );
  }
}
