import DashboardLayout from "./(dashboard)/layout";
import DashboardPage from "./(dashboard)/page";

/**
 * Page racine (/)
 * Affiche la page d'accueil du dashboard avec son layout
 */
export default function HomePage() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}
