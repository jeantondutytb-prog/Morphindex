import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminUser } from "@/lib/auth/create-admin-user";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/** Bootstrap one-shot d'un compte admin (protégé par ADMIN_BOOTSTRAP_SECRET). */
export async function POST(req: Request) {
  const secret = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "ADMIN_BOOTSTRAP_SECRET non configuré." }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "non autorisé" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "email et password (8 car. min.) requis." }, { status: 400 });
  }

  const admin = createAdminClient();
  const result = await createAdminUser(admin, parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    email: result.email,
    userId: result.userId,
    created: result.created,
    loginUrl: "/connexion",
  });
}
