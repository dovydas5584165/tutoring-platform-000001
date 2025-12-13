import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { email, slaptazodis, vardas, pavarde, role, vaikoVardas, pamokos } =
      await req.json();

    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !slaptazodis) {
      return NextResponse.json(
        { message: "El. paštas ir slaptažodis yra privalomi." },
        { status: 400 }
      );
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: slaptazodis,
    });

    if (signUpError) {
      return NextResponse.json(
        { message: signUpError.message },
        { status: 400 }
      );
    }

    if (!authData?.user) {
      return NextResponse.json(
        { message: "Nepavyko sukurti vartotojo." },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 2. Insert matching user profile in `users` table using same userId
    const { error: insertError } = await supabase
      .from("users")
      .insert({
        id: userId, // <- match auth.users.id exactly here
        name: `${vardas || ""} ${pavarde || ""}`.trim(),
        email: normalizedEmail,
        role: role || "user",
        vaikoVardas: vaikoVardas || null,
        pamokos: pamokos || [],
      });

    if (insertError) {
      // Optional: rollback user creation in auth.users here if you want data consistency
      return NextResponse.json(
        { message: insertError.message },
        { status: 500 }
      );
    }

    // 3. Success response with synced user ID
    return NextResponse.json(
      { message: "Registracija sėkminga", userId, role: role || "user" },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Nežinoma klaida" },
      { status: 500 }
    );
  }
}
