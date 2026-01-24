/**
 * Authentication Middleware
 * Protects API routes from unauthorized access
 */

import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE_NAME } from '@/types/auth';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Verify JWT session token
 */
async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const SESSION_SECRET = new TextEncoder().encode(
      process.env.APP_SESSION_SECRET || ''
    );

    const verified = await jwtVerify(token, SESSION_SECRET);
    const payload = verified.payload as any;

    // Check if session is not expired
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return false;
    }

    return payload.isAuthenticated === true;
  } catch (error) {
    return false;
  }
}

/**
 * Require app password authentication
 * Used for admin/settings routes
 * Now also accepts JWT session cookies from logged-in users
 */
export async function requireAuth(request: NextRequest): Promise<void> {
  // Check for x-app-password header (for direct API calls)
  const password = request.headers.get('x-app-password');
  const expectedPassword = process.env.APP_PASSWORD;

  if (password && expectedPassword && password === expectedPassword) {
    return; // Valid password header
  }

  // Check for JWT session cookie (for logged-in users)
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    const isValid = await verifySessionToken(sessionToken);
    if (isValid) {
      return; // Valid session
    }
  }

  // Neither authentication method worked
  throw new UnauthorizedError('Invalid or missing authentication');
}

/**
 * Require cron secret for GitHub Actions workflows
 * Used for automated jobs (sync, scan, etc.)
 */
export function requireCronSecret(request: NextRequest): void {
  const secret = request.headers.get('x-cron-secret');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    throw new Error('CRON_SECRET not configured');
  }

  if (!secret || secret !== expectedSecret) {
    throw new UnauthorizedError('Invalid or missing cron secret');
  }
}

/**
 * Helper to check if request is authenticated (either method)
 */
export function isAuthenticated(request: NextRequest): boolean {
  try {
    requireAuth(request);
    return true;
  } catch {
    try {
      requireCronSecret(request);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Require either app password OR cron secret
 * Used for routes that can be called by both admin and cron jobs
 */
export function requireAnyAuth(request: NextRequest): void {
  if (!isAuthenticated(request)) {
    throw new UnauthorizedError('Authentication required');
  }
}
