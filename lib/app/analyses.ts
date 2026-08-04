import { createAdminClient } from "@/lib/supabase/admin";

export type AnalysisListItem = {
  id: string;
  status: string;
  created_at: string;
  unlocked: boolean;
  indice_actuel: number | null;
  indice_atteignable: number | null;
  points_count: number | null;
  premier_point_libelle: string | null;
};

export async function getAnalysesList(userId: string): Promise<AnalysisListItem[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("analyses")
    .select("id, status, created_at, unlocked, indice_actuel, indice_atteignable, points_count, premier_point_libelle")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getLatestAccessibleAnalysis(userId: string, isAdmin: boolean) {
  const admin = createAdminClient();
  let query = admin
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "done")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!isAdmin) {
    query = query.eq("unlocked", true);
  }

  const { data } = await query.maybeSingle();
  return data;
}
