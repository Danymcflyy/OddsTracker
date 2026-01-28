import { NextResponse } from 'next/server';
import { getSetting, updateSetting, getAllSettings, syncMarketStatesWithTrackedMarkets } from '@/lib/db/helpers';
import { requireAuth } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Authentification requise pour lire les settings sensibles
    await requireAuth(request as any);

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Case 1: Get a specific setting by key
    if (key) {
      const value = await getSetting(key as any);

      return NextResponse.json({
        success: true,
        data: value,
      });
    }

    // Case 2: Get all settings (no key parameter)
    const allSettings = await getAllSettings();

    return NextResponse.json({
      success: true,
      settings: allSettings,
    });
  } catch (error) {
    console.error('Error in settings API:', error);
    return NextResponse.json(
      { success: false, error: 'Unauthorized or failed' },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuth(request as any);

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing key or value' },
        { status: 400 }
      );
    }

    await updateSetting(key, value);

    // When tracked_markets changes, sync market_states for all upcoming events
    let syncResult = null;
    if (key === 'tracked_markets' && Array.isArray(value)) {
      console.log('[Settings] tracked_markets updated, syncing market_states...');
      syncResult = await syncMarketStatesWithTrackedMarkets(value);
    }

    return NextResponse.json({
      success: true,
      syncResult,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}