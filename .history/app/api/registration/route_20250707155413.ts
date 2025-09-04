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

    const { email, slaptazodis, vardas, pavarde, role, vaikoVardas, pamokos } =
      parsed.data;

    // Use the database function to register the user
    const { data, error } = await supabaseAdmin.rpc('register_lt_user', {
      email,
      slaptazodis,
      vardas,
      pavarde,
      role,
      vaikoVardas: vaikoVardas || null,
      pamokos
    });

    if (error) {
      console.error("Registration error:", error);
      return NextResponse.json(
        { message: error.message || "Registracijos klaida" },
        { status: 400 }
      );
    }

    if (!data.success) {
      return NextResponse.json(
        { message: data.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        userId: data.userId, 
        role: data.role, 
        message: data.message 
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