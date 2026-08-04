import { AppContainer } from "@/components/app/app-container";

/** Skeleton contenu page — sidebar déjà visible via le layout. */
export default function AppLoading() {
  return (
    <AppContainer>
      <div className="space-y-6 lg:space-y-8 animate-pulse">
        <header>
          <div className="h-3 w-20 rounded bg-line/60 mb-2" />
          <div className="h-8 w-56 rounded bg-line mb-2" />
          <div className="h-4 w-72 max-w-full rounded bg-line/50" />
        </header>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-surface border border-line" />
          ))}
        </div>
        <div className="h-56 rounded-2xl bg-surface border border-line" />
      </div>
    </AppContainer>
  );
}
