import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vardas, pavarde, vaikoVardas, pamokos, email, slaptazodis, role } = body;

    if (
      !email ||
      !slaptazodis ||
      !vardas ||
      !pavarde ||
      !pamokos ||
      !Array.isArray(pamokos) ||
      pamokos.length === 0 ||
      !role
    ) {
      return NextResponse.json(
        { message: "Užpildykite visus privalomus laukus." },
        { status: 400 }
      );
    }

    if (role !== "tutor" && (!vaikoVardas || vaikoVardas.trim() === "")) {
      return NextResponse.json(
        { message: "Vaiko vardas yra privalomas klientui." },
        { status: 400 }
      );
    }

    // Check if user with this email exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      return NextResponse.json(
        { message: "Klaida tikrinant vartotoją.", error: fetchError.message },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { message: "Vartotojas su tokiu el. paštu jau egzistuoja." },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(slaptazodis, 10);

    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        name: `${vardas} ${pavarde}`,
        vaikoVardas: role !== "tutor" ? vaikoVardas : null,
        pamokos,
        email,
        password: hashedPassword,
        role,
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json(
        { message: "Registracijos klaida", error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Registracija sėkminga", userId: user.id });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Serverio klaida", error: err.message },
      { status: 500 }
    );
  }
}
