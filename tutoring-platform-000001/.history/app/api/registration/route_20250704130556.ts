import { NextResponse } from "next/server";
import { z } from "zod";

import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const payloadSchema = z.object({
  email: z.string().email(),
  slaptazodis: z.string().min(6, "Slaptažodis per trumpas (min 6)"),
  vardas: z.string().min(1),
  pavarde: z.string().min(1),
  role: z.enum(["tutor", "client"]),
  vaikoVardas: z.string().optional(),
  pamokos: z.array(z.string()).min(1, "Reikia pasirinkti bent vieną pamoką"),
});

type RegistrationPayload = z.infer<typeof payloadSchema>;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = payloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 422 }
      );
    }

    const {
      email,
      slaptazodis,
      vardas,
      pavarde,
      role,
      vaikoVardas,
      pamokos,
    } = parsed.data;

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existing } = await supabaseAdmin
      .from("auth.users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { message: "Šis el. paštas jau užregistruotas." },
        { status: 409 }
      );
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: slaptazodis,
    });

    if (signUpError || !authData?.user) {
      return NextResponse.json(
        { message: signUpError?.message ?? "Nepavyko sukurti vartotojo" },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        name: `${vardas} ${pavarde}`.trim(),
        email: normalizedEmail,
        role,
        vaikoVardas: role === "client" ? vaikoVardas ?? null : null,
        pamokos,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { message: "Klaida įrašant profilį" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { userId, role, message: "Registracija sėkminga" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Registration fatal error:", err);
    return NextResponse.json(
      { message: err.message ?? "Nežinoma serverio klaida" },
      { status: 500 }
    );
  }
}
