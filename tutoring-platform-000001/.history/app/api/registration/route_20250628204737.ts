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

    // Normalizuojam el. paštą (pašalinam tarpus, mažosios raidės)
    const normalizedEmail = (email || "").trim().toLowerCase();

    // Privalomi laukai
    if (!normalizedEmail || !slaptazodis) {
      return NextResponse.json(
        { message: "El. paštas ir slaptažodis yra privalomi." },
        { status: 400 }
      );
    }

    // 1. Sukuriam vartotoją Supabase autentifikacijoje
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: slaptazodis,
    });

    if (signUpError) {
      console.error("Supabase signUpError:", signUpError);
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

    // 2. Įrašom vartotojo profilį į 'users' lentelę (sutampa su auth.users.id)
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
      console.error("Supabase insertError:", insertError);
      // Optional: rollback auth vartotojo sukūrimą, jei reikalinga
      return NextResponse.json(
        { message: insertError.message },
        { status: 500 }
      );
    }

    // 3. Sėkmingas atsakymas
    return NextResponse.json(
      { message: "Registracija sėkminga", userId, role: role || "user" },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Catch error:", err);
    return NextResponse.json(
      { message: err.message || "Nežinoma klaida" },
      { status: 500 }
    );
  }
}
