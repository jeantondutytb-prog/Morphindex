import { Suspense } from "react";
import { AppShell } from "@/components/app/shell";
import { AppShellSkeleton } from "@/components/app/shell-skeleton";
import { requireAppSession } from "@/lib/auth/session";

async function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { email, isAdmin } = await requireAppSession();
  return (
    <AppShell email={email} isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </Suspense>
  );
}
