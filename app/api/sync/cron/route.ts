"use server";

import { NextResponse } from "next/server";

import { autoSyncService } from "@/lib/sync/auto-sync-service";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await autoSyncService.sync();

  return NextResponse.json({
    success: true,
    stats,
  });
}
