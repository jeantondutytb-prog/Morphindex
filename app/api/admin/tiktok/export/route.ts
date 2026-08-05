import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/auth/is-admin";
import { renderTikTokPng } from "@/lib/tiktok/render-png";

const bodySchema = z.object({
  photoDataUrl: z.string().startsWith("data:image/"),
  exportAspect: z.enum(["1:1", "2:3"]),
  brandName: z.string().min(1).max(40),
  siteLabel: z.string().min(1).max(80),
  scoreActuel: z.number().min(0).max(10),
  scorePotentiel: z.number().min(0).max(10),
});

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "non authentifié" }, { status: 401 });

  const admin = createAdminClient();
  if (!(await isAdminUser(admin, user.id))) {
    return NextResponse.json({ error: "accès refusé" }, { status: 403 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "paramètres invalides" }, { status: 400 });
  }

  try {
    const png = await renderTikTokPng(body);
    const filename = `morphindex-tiktok-${body.exportAspect.replace(":", "x")}.png`;

    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "génération impossible" }, { status: 500 });
  }
}
