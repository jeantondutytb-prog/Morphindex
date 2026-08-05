const ITEMS = [
  "Photo supprimée après analyse",
  "Rapport en 3 minutes",
  "100 % en français",
  "7 points actionnables",
  "Routine personnalisée",
  "Sans carte bancaire pour démarrer",
  "Softmaxing & hardmaxing",
];

export function TrustMarquee() {
  const track = [...ITEMS, ...ITEMS];

  return (
    <div className="border-y border-line bg-surface/60 overflow-hidden py-3">
      <div className="marquee-track flex w-max gap-8">
        {track.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-2 shrink-0 font-mono text-[10px] uppercase tracking-[.14em] text-dim whitespace-nowrap"
          >
            <span className="size-1 rounded-full bg-accent/70" aria-hidden />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
