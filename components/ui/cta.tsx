import Link from "next/link";

export function Cta({ href = "/inscription", label = "Lancer mon analyse" }: { href?: string; label?: string }) {
  return (
    <Link href={href}
      className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5
                 font-bold text-[13.5px] text-accent-ink hover:brightness-110 transition">
      {label} <span aria-hidden>→</span>
    </Link>
  );
}
