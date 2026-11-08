/**
 * Creates a tutor or client account (Supabase Auth user + profile and lessons).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const payloadSchema = z.object({
  email: z.string().email("Neteisingas el. pašto formatas"),
  slaptazodis: z.string().min(6, "Slaptažodis per trumpas (min 6)"),
  vardas: z.string().min(1, "Vardas yra privalomas"),
  pavarde: z.string().min(1, "Pavardė yra privaloma"),
  role: z.enum(["tutor", "client"], {
    errorMap: () => ({ message: "Rolė turi būti 'tutor' arba 'client'" }),
  }),
  vaikoVardas: z.string().optional(),
  inviteCode: z.string().optional(),
  agreed: z.literal(true, { errorMap: () => ({ message: "Pažymėkite patvirtinimo varnelę" }) }),
  pamokos: z.array(z.string()).min(1, "Reikia pasirinkti bent vieną pamoką"),
});

/** Validates the form, creates the auth user and profile; rolls back the auth user on failure. */
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

    const { email, slaptazodis, vardas, pavarde, role, vaikoVardas: vaikovardas, pamokos, inviteCode } = parsed.data;

    // Tutors see children's names and contacts, so only invited tutors may register as one.
    // Set TUTOR_INVITE_CODE in the environment and give the code only to approved tutors.
    if (role === "tutor") {
      const expected = process.env.TUTOR_INVITE_CODE;
      if (!expected || inviteCode?.trim() !== expected) {
        return NextResponse.json({ message: "Neteisingas mokytojo kvietimo kodas." }, { status: 403 });
      }
    }

    // 1. Create user in Supabase Auth via Admin API
    const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: slaptazodis,
      email_confirm: true,
      user_metadata: { role, vardas, pavarde, vaikovardas },
    });

    if (authError || !userData) {
      console.error("Auth creation failed:", authError);
      return NextResponse.json(
        { message: authError?.message || "Auth creation failed" },
        { status: 400 }
      );
    }

    // 2. Insert user profile and lessons via RPC
    const { data, error } = await supabaseAdmin.rpc("register_lt_user_v1", {
      uid: userData.user.id,
      email,
      pamokos,
      pavarde,
      role,
      vaiko_vardas: vaikovardas ?? null,
      vardas,
    });

    if (error) {
      console.error("RPC error:", error);

      // Rollback auth user creation to keep DB consistent
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);

      return NextResponse.json(
        { message: error.message || "Registracijos klaida" },
        { status: 400 }
      );
    }

    if (!data || data.success !== true) {
      console.error("Registration failed (payload):", data);

      // Rollback auth user creation on failure
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);

      return NextResponse.json(
        { message: data?.message || "Registracija nepavyko" },
        { status: 400 }
      );
    }

    // 3. Return success with user info
    return NextResponse.json(
      {
        userId: data.userId,
        role: data.role,
        message: data.message,
      },
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
