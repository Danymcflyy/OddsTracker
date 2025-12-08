import Link from "next/link";
import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  d="M4 20V8m8 12V4m8 16V12M2 20h20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M6 12l4-3 4 2 4-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Tableau de bord
              </p>
              <h1 className="text-xl font-semibold text-slate-900">
                OddsTracker
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Réglages
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
