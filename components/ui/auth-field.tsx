import { forwardRef } from "react";

const DEFAULT_PLACEHOLDERS: Partial<Record<string, string>> = {
  email: "nom@email.com",
  password: "****",
};

export const AuthInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; hideLabel?: boolean }
>(function AuthInput({ label, id, className = "", hideLabel, type, placeholder, ...props }, ref) {
  const inputId = id ?? props.name;
  const resolvedPlaceholder =
    placeholder ?? (type ? DEFAULT_PLACEHOLDERS[type] : undefined);

  return (
    <div>
      {!hideLabel && (
        <label htmlFor={inputId} className="block font-mono text-[10px] uppercase tracking-[.12em] text-dim mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        placeholder={resolvedPlaceholder}
        className={`w-full rounded-xl border border-line/80 bg-surface/50 px-4 py-3.5 text-[15px] text-text placeholder:text-dim/70 outline-none transition-all focus:border-accent/40 focus:bg-surface/80 focus:ring-1 focus:ring-accent/15 ${className}`}
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

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-line-strong bg-bg/40 px-3 py-2 text-sm text-muted">
      {message}
    </p>
  );
}

export function AuthFooterLink({ children }: { children: React.ReactNode }) {
  return <p className="mt-8 pt-6 border-t border-line/80 text-sm text-dim text-center">{children}</p>;
}
