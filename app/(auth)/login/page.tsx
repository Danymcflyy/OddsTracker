import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-5">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-8 w-8"
            >
              <path
                d="M5 3v18M19 3v18M12 8v13M3 19h18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M8 11l4-3 4 2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm tracking-wide text-muted-foreground uppercase">
              Bienvenue sur
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              OddsTracker
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analyse des cotes Pinnacle depuis 2019
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-slate-100">
          <CardHeader className="space-y-1">
            <CardTitle>Connexion sécurisée</CardTitle>
            <CardDescription>
              Entrez votre mot de passe pour accéder au tableau de bord.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>OddsTracker - Suivi des cotes Opening & Closing</p>
          <p>Football • Hockey • Tennis • Volleyball</p>
        </div>
      </div>
    </div>
  );
}
