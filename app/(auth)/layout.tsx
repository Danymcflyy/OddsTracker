/**
 * Layout pour les pages d'authentification
 * Pas de navigation, pas de sidebar, juste le contenu centré
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
