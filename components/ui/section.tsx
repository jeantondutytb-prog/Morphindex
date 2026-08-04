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
    <section id={id} className="border-b border-line px-5 py-10 md:px-11 md:py-14">
      {kicker && <LabelMono>{kicker}</LabelMono>}
      {title && (
        <h2 className="font-display text-[27px] font-extrabold leading-[1.08] tracking-[-.035em] mb-3">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
