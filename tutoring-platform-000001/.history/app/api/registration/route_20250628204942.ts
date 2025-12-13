import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const {
      email,
      slaptazodis,
      vardas,
      pavarde,
      role,
      vaikoVardas,
      pamokos,
    } = await req.json();

    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail || !slaptazodis) {
      return NextResponse.json(
        { message: "El. paštas ir slaptažodis yra privalomi." },
        { status: 400 }
      );
    }

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

    const { error: insertError } = await supabase
      .from("users")
      .insert({
        id: userId,
        name: `${vardas || ""} ${pavarde || ""}`.trim(),
        email: normalizedEmail,
        role: role || "user",
        vaikoVardas: vaikoVardas || null,
        pamokos: Array.isArray(pamokos) ? pamokos : [],
      });

    if (insertError) {
      return NextResponse.json(
        { message: insertError.message },
        { status: 500 }
      );
    }

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
