import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, is_admin")
    .eq("id", user.id)
    .single();

  return (
    <AppShell
      email={profile?.email ?? user.email ?? ""}
      isAdmin={profile?.is_admin === true}
    >
      {children}
    </AppShell>
  );
}
