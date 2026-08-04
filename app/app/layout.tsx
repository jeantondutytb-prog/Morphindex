import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("email, is_admin")
    .eq("id", user.id)
    .single();

  // Fallback si migration 0005 pas encore appliquée (colonne is_admin absente)
  let email = profile?.email ?? user.email ?? "";
  let isAdmin = profile?.is_admin === true;
  if (profileErr) {
    const { data: fallback } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();
    email = fallback?.email ?? email;
    isAdmin = false;
  }

  return (
    <AppShell email={email} isAdmin={isAdmin}>
      {children}
    </AppShell>
  );
}
