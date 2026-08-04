/** Coquille statique affichée pendant le chargement auth (Suspense). */
export function AppShellSkeleton() {
  return (
    <div className="min-h-screen flex animate-pulse">
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 fixed inset-y-0 left-0 border-r border-line bg-surface">
        <div className="p-6 pb-4">
          <div className="h-7 w-32 rounded bg-line" />
        </div>
        <div className="flex-1 px-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-line/60" />
          ))}
        </div>
        <div className="p-4">
          <div className="h-24 rounded-2xl bg-line/40" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px] pb-20 lg:pb-0">
        <header className="lg:hidden sticky top-0 z-40 border-b border-line bg-surface px-5 h-14 flex items-center justify-between">
          <div className="h-6 w-28 rounded bg-line" />
          <div className="h-4 w-16 rounded bg-line/60" />
        </header>

        <main className="flex-1 w-full bg-bg">
          <div className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-10 lg:py-10 space-y-6">
            <div className="h-8 w-48 rounded bg-line" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-surface border border-line" />
              ))}
            </div>
            <div className="h-48 rounded-2xl bg-surface border border-line" />
          </div>
        </main>

        <nav className="lg:hidden fixed bottom-0 inset-x-0 border-t border-line bg-surface">
          <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-1">
                <div className="h-4 w-4 rounded bg-line/60" />
                <div className="h-2 w-10 rounded bg-line/40" />
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
