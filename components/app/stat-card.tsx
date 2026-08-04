export function StatCard({
  label,
  value,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 lg:p-6 transition-all duration-300 hover:-translate-y-0.5 ${
        accent
          ? "border-accent/25 bg-gradient-to-br from-accent/8 to-surface shadow-[0_8px_32px_rgba(0,229,160,.06)]"
          : "border-line bg-surface hover:border-line-strong"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-3">{label}</p>
      <p className={`font-display text-3xl lg:text-4xl font-extrabold tnum tracking-[-.03em] ${accent ? "text-accent score-glow" : "text-text"}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-dim mt-2">{hint}</p>}
    </div>
  );
}
