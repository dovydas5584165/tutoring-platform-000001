import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vardas, pavarde, vaikoVardas, pamokos, email, slaptazodis, role } = body;

    // Validation (same as yours)
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

    // Step 1: Sign up user in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: slaptazodis,
    });

    if (signUpError) {
      return NextResponse.json(
        { message: "Registracijos klaida (auth): " + signUpError.message },
        { status: 400 }
      );
    }

    if (!authData?.user) {
      return NextResponse.json(
        { message: "Registracijos klaida: vartotojas nebuvo sukurtas auth sistemoje." },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Step 2: Insert user profile into your custom users table
    const { data: insertedUser, error: insertError } = await supabase
      .from("users")
      .insert({
        id: userId, // use the same id as auth.users
        name: `${vardas} ${pavarde}`,
        vaikoVardas: role !== "tutor" ? vaikoVardas : null,
        pamokos,
        email,
        role,
      })
      .select("id")
      .single();

    if (insertError) {
      // Optional rollback: delete user from auth if insert fails
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { message: "Registracijos klaida (profile): " + insertError.message },
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
