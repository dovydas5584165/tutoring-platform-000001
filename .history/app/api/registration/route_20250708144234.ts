import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/* ---------- Validation ---------- */
const payloadSchema = z.object({
  email: z.string().email("Neteisingas el. pašto formatas"),
  slaptazodis: z.string().min(6, "Slaptažodis per trumpas (min 6)"),
  vardas: z.string().min(1, "Vardas yra privalomas"),
  pavarde: z.string().min(1, "Pavardė yra privaloma"),
  role: z.enum(["tutor", "client"]),
  vaikovardas: z.string().optional(),
  pamokos: z.array(z.string()).min(1, "Reikia bent vienos pamokos"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = payloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 422 }
      );
    }

    const { email, slaptazodis, vardas, pavarde, role, pamokos, vaikovardas } = parsed.data;

    /* ---------- 1. Create Supabase Auth User ---------- */
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: slaptazodis,
      email_confirm: true,
    });

    if (userError || !userData?.user?.id) {
      console.error("Auth creation failed:", userError?.message);
      return NextResponse.json(
        { message: userError?.message ?? "Nepavyko sukurti naudotojo" },
        { status: 400 }
      );
    }

    const userId = userData.user.id;

    /* ---------- 2. Insert Profile via RPC ---------- */
    const { data: profileData, error: profileError } = await supabaseAdmin.rpc("create_profile_v1", {
      id: userId,
      email,
      pamokos,
      pavarde,
      role,
      vardas,
      vaikovardas: vaikovardas ?? null,
    });

    if (profileError || profileData?.success !== true) {
      console.error("Profile RPC failed:", profileError?.message);
      return NextResponse.json(
        { message: profileData?.message || profileError?.message || "Profilio klaida" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        userId,
        message: profileData.message,
        role: profileData.role,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Fatal error:", err);
    return NextResponse.json(
      { message: err?.message ?? "Nežinoma klaida" },
      { status: 500 }
    );
  }
}
