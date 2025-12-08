import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function authMiddleware(request: NextRequest) {
  // À implémenter - vérifier la session
  return NextResponse.next();
}
