import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vardas, pavarde, vaikoVardas, pamokos, email, slaptazodis, role } = body;

    // Validate required fields
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

    // Client-specific validation
    if (role !== "tutor" && (!vaikoVardas || vaikoVardas.trim() === "")) {
      return NextResponse.json(
        { message: "Vaiko vardas yra privalomas klientui." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows found, so ignore it here
      console.error("Error fetching user:", fetchError);
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

    // Hash the password
    const hashedPassword = await hash(slaptazodis, 10);

    // Insert new user
    const { data: insertedUser, error: insertError } = await supabase
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
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { message: "Registracijos klaida", error: insertError.message },
        { status: 500 }
      );
    }

    if (!insertedUser || !insertedUser.id) {
      console.error("No user returned after insert.");
      return NextResponse.json(
        { message: "Registracijos klaida: vartotojas nebuvo sukurtas." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Registracija sėkminga",
      userId: insertedUser.id,
    });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json(
      { message: "Serverio klaida", error: err.message || "Nežinoma klaida" },
      { status: 500 }
    );
  }
}
