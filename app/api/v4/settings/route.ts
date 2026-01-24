/**
 * API Route: Settings Management
 * GET /api/v4/settings - Get all settings
 * PUT /api/v4/settings - Update settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getAllSettings, updateSetting } from '@/lib/db/helpers';
import { requireAuth, UnauthorizedError } from '@/lib/auth/middleware';
import { UpdateSettingSchema, formatValidationError } from '@/lib/validation/schemas';
import type { AppSettings } from '@/lib/db/types';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getAllSettings();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get settings',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require authentication for settings updates
    await requireAuth(request);

    const body = await request.json();

    // Validate input with Zod
    const validated = UpdateSettingSchema.parse(body);
    const { key, value } = validated;

    const success = await updateSetting(key as keyof AppSettings, value);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update setting' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Setting ${key} updated successfully`,
    });
  } catch (error) {
    // Handle authentication errors
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        formatValidationError(error),
        { status: 400 }
      );
    }

    console.error('Failed to update setting:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update setting',
      },
      { status: 500 }
    );
  }
}
