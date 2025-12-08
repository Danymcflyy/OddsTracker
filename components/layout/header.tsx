export function Header() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🎯 OddsTracker</h1>
          <nav className="flex gap-4">
            <a href="/settings" className="text-sm hover:text-primary">
              ⚙️ Réglages
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
