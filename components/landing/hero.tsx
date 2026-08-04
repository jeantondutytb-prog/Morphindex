import { Cta } from "@/components/ui/cta";
import { LabelMono } from "@/components/ui/label-mono";

export function Hero() {
  return (
    <section className="border-b border-line px-5 py-12 md:px-11 md:py-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-10 min-[780px]:flex-row min-[780px]:items-center min-[780px]:gap-16">
        <div className="flex-1">
          <LinkWordmark />
          <LabelMono>Analyse faciale · en français</LabelMono>
          <h1 className="font-display text-[32px] min-[780px]:text-[46px] font-extrabold leading-[.99] tracking-[-.04em] max-w-[13ch] mb-6">
            Mesure d&apos;abord.{" "}
            <em className="font-serif italic font-normal text-accent not-italic-fix">Décide ensuite.</em>
          </h1>
          <div className="flex items-baseline gap-4 tnum mb-3">
            <span className="font-display text-[48px] min-[780px]:text-[66px] font-extrabold leading-[.84] tracking-[-.055em] text-num-idle">6,4</span>
            <span className="text-2xl text-num-idle">→</span>
            <span className="font-display text-[48px] min-[780px]:text-[66px] font-extrabold leading-[.84] tracking-[-.055em] text-accent">7,8</span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[.15em] text-dim mb-8">
            Indice actuel → atteignable en 12 mois · exemple
          </p>
          <Cta />
          <p className="mt-4 font-mono text-[10.5px] text-dim">
            18 ans et plus · photo supprimée après analyse
          </p>
        </div>
        <div className="flex-1 flex justify-center min-[780px]:justify-end">
          <div className="relative w-full max-w-[300px] min-[780px]:max-w-none aspect-[4/5] rounded-2xl overflow-hidden bg-surface">
            <div
              className="absolute inset-0 grayscale-[.72] contrast-[1.1] brightness-[.86]"
              style={{
                background: "linear-gradient(135deg, #1a1d24 0%, #0c0e12 50%, #262c36 100%)",
              }}
            />
            <Annotation label="cernes −0,4" className="top-[18%] left-[8%]" />
            <Annotation label="peau 5,8" className="top-[42%] right-[8%]" />
            <Annotation label="mâchoire nette" className="bottom-[22%] left-[12%]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function LinkWordmark() {
  return (
    <div className="font-display text-lg font-extrabold mb-6">
      Morph<span className="text-accent">Index</span>
    </div>
  );
}

function Annotation({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`absolute font-mono text-[10px] px-2 py-1 rounded ${className}`}
      style={{ background: "rgba(8,9,11,.8)", border: "1px solid rgba(0,229,160,.28)" }}
    >
      {label}
    </span>
  );
}
