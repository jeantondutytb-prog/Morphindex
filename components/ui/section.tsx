import { LabelMono } from "./label-mono";

export function Section({
  id, kicker, title, children,
}: {
  id?: string;
  kicker?: string;
  title?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-b border-line px-5 py-12 md:px-11 md:py-16">
      <div className="max-w-6xl mx-auto">
        {kicker && <LabelMono>{kicker}</LabelMono>}
        {title && (
          <h2 className="font-display text-[27px] md:text-[32px] font-extrabold leading-[1.08] tracking-[-.035em] mb-3">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}
