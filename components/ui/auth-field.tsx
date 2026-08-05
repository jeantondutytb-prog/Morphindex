import { forwardRef } from "react";

export const AuthInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string }
>(function AuthInput({ label, id, className = "", ...props }, ref) {
  const inputId = id ?? props.name;
  return (
    <div>
      <label htmlFor={inputId} className="block font-mono text-[10px] uppercase tracking-[.12em] text-dim mb-2">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-xl border border-line/80 bg-surface/50 px-4 py-3.5 text-[15px] text-text placeholder:text-dim outline-none transition-all focus:border-accent/40 focus:bg-surface/80 focus:ring-1 focus:ring-accent/15 ${className}`}
        {...props}
      />
    </div>
  );
});

export function AuthButton({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className="w-full rounded-xl bg-accent px-6 py-3.5 font-bold text-accent-ink hover:brightness-110 transition disabled:opacity-40 cta-shine relative overflow-hidden"
      {...props}
    >
      {children}
    </button>
  );
}

export function AuthCheckbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <span className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-line bg-bg/60 transition-colors group-hover:border-accent/40">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-opacity ${checked ? "opacity-100" : "opacity-0"}`}
          aria-hidden
        >
          <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" />
        </svg>
      </span>
      <span className="text-sm text-muted leading-relaxed">{children}</span>
    </label>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-line-strong bg-bg/40 px-3 py-2 text-sm text-muted">
      {message}
    </p>
  );
}

export function AuthFooterLink({ children }: { children: React.ReactNode }) {
  return <p className="mt-8 pt-6 border-t border-line/80 text-sm text-dim">{children}</p>;
}
