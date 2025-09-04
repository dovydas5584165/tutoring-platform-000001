import { NextResponse } from "next/server";
import { z } from "zod";
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

    // 1️⃣ Check duplicates in users table
    const { data: existingUser, error: lookupErr } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (lookupErr) {
      console.error("Lookup error:", lookupErr);
      return NextResponse.json({ message: "DB klaida" }, { status: 500 });
    }
    if (existingUser) {
      return NextResponse.json(
        { message: "Šis el. paštas jau užregistruotas." },
        { status: 409 }
      );
    }

    // 2️⃣ Check duplicates in Supabase Auth users
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email=eq.${normalizedEmail}`,
    });

    if (authUsersError) {
      console.error("Auth users fetch error:", authUsersError);
      return NextResponse.json(
        { message: "Nepavyko patikrinti vartotojo" },
        { status: 500 }
      );
    }
    if (authUsers?.users?.length) {
      return NextResponse.json(
        { message: "Šis el. paštas jau užregistruotas." },
        { status: 409 }
      );
    }

    // 3️⃣ Create Auth user
    const { data: authData, error: signUpErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: slaptazodis,
        email_confirm: true,
      });

    if (signUpErr || !authData?.user) {
      console.error("CreateUser error:", signUpErr);
      return NextResponse.json(
        { message: signUpErr?.message ?? "Nepavyko sukurti vartotojo" },
        { status: 400 }
      );
    }

    // 4️⃣ Insert profile into users table
    const userId = authData.user.id;
    const { error: insertErr } = await supabaseAdmin.from("users").insert({
      id: userId,
      name: `${vardas} ${pavarde}`.trim(),
      email: normalizedEmail,
      role,
      vaikoVardas: role === "client" ? vaikoVardas ?? null : null,
      pamokos,
    });

    if (insertErr) {
      console.error("Insert error:", insertErr);
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
