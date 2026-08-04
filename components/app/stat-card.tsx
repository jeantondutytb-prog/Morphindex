import Link from "next/link";

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
      className={`rounded-2xl border p-5 lg:p-6 ${
        accent
          ? "border-accent/25 bg-accent/5"
          : "border-line bg-surface"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-dim mb-3">{label}</p>
      <p className={`font-display text-3xl lg:text-4xl font-extrabold tnum ${accent ? "text-accent" : "text-text"}`}>
        {value}
      </p>
      {hint && <p className="text-xs text-dim mt-2">{hint}</p>}
    </div>
  );
}
