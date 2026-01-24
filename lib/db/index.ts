import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Vérification des variables d'environnement
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!envUrl || !envAnonKey) {
  console.warn(
    "⚠️  Supabase environment variables missing. The app will build but may crash at runtime if not configured."
  );
}

// Fallbacks for build time
const supabaseUrl = envUrl || "https://placeholder.supabase.co";
const supabaseAnonKey = envAnonKey || "placeholder";

// Client Supabase public (côté client et serveur)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Service role client pour les opérations admin (côté serveur uniquement)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper pour vérifier si le client admin est disponible
export const isAdminAvailable = () => {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
};
