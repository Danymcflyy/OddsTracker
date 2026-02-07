import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/v4/events/:id/scores
 * Update half-time scores for an event
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const eventId = params.id;
    const body = await request.json();
    const { home_score_h1, away_score_h1 } = body;

    // Validation
    if (typeof home_score_h1 !== 'number' || typeof away_score_h1 !== 'number') {
      return NextResponse.json(
        { error: 'home_score_h1 and away_score_h1 must be numbers' },
        { status: 400 }
      );
    }

    if (home_score_h1 < 0 || away_score_h1 < 0) {
      return NextResponse.json(
        { error: 'Scores cannot be negative' },
        { status: 400 }
      );
    }

    // Check event exists and is completed
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('id, status, home_score, away_score')
      .eq('id', eventId)
      .single();

    if (fetchError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only set H1 scores for completed events' },
        { status: 400 }
      );
    }

    // Validate H1 scores don't exceed FT scores
    if (event.home_score !== null && home_score_h1 > event.home_score) {
      return NextResponse.json(
        { error: 'H1 home score cannot exceed full-time home score' },
        { status: 400 }
      );
    }

    if (event.away_score !== null && away_score_h1 > event.away_score) {
      return NextResponse.json(
        { error: 'H1 away score cannot exceed full-time away score' },
        { status: 400 }
      );
    }

    // Update event with H1 scores
    const { error: updateError } = await supabase
      .from('events')
      .update({
        home_score_h1,
        away_score_h1,
        h1_score_source: 'manual',
        h1_updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (updateError) {
      console.error('Error updating H1 scores:', updateError);
      return NextResponse.json(
        { error: 'Failed to update scores' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event_id: eventId,
      home_score_h1,
      away_score_h1,
    });
  } catch (error) {
    console.error('Error in PATCH /events/:id/scores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
