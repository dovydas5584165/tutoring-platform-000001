import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { email, slaptazodis, vardas, pavarde, role, vaikoVardas, pamokos } = await req.json();

    // Direct sign-up without validations
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: slaptazodis,
    });

    if (signUpError) {
      return NextResponse.json({ message: signUpError.message }, { status: 400 });
    }

    if (!authData?.user) {
      return NextResponse.json({ message: "User creation failed" }, { status: 500 });
    }

    const userId = authData.user.id;

    // Insert minimal user profile, no checks
    const { error: insertError } = await supabase
      .from("users")
      .insert({
        id: userId,
        name: `${vardas || ""} ${pavarde || ""}`.trim(),
        email,
        role: role || "user",
        vaikoVardas: vaikoVardas || null,
        pamokos: pamokos || [],
      });

    if (insertError) {
      // Just return error, no rollback
      return NextResponse.json({ message: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Registration successful", userId });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || "Unknown error" }, { status: 500 });
  }
}
