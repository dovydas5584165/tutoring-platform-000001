import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Define a more strict schema with proper validation
const payloadSchema = z.object({
  email: z.string().email("Neteisingas el. pašto formatas"),
  slaptazodis: z.string().min(6, "Slaptažodis per trumpas (min 6)"),
  vardas: z.string().min(1, "Vardas yra privalomas"),
  pavarde: z.string().min(1, "Pavardė yra privaloma"),
  role: z.enum(["tutor", "client"], {
    errorMap: () => ({ message: "Rolė turi būti 'tutor' arba 'client'" }),
  }),
  vaikoVardas: z.string().optional(),
  pamokos: z.array(z.string()).min(1, "Reikia pasirinkti bent vieną pamoką"),
});

type RegistrationPayload = z.infer<typeof payloadSchema>;

export async function POST(req: Request) {
  try {
    // Parse and validate the request body
    const json = await req.json();
    const parsed = payloadSchema.safeParse(json);

    if (!parsed.success) {
      console.error("Validation error:", parsed.error.errors);
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 422 }
      );
    }

    const { email, slaptazodis, vardas, pavarde, role, vaikoVardas, pamokos } =
      parsed.data;

    console.log("Registration data:", {
      email,
      password_length: slaptazodis.length,
      vardas,
      pavarde,
      role,
      vaikoVardas,
      pamokos,
    });

    // Use the database function to register the user
    const { data, error } = await supabaseAdmin.rpc("register_lt_user", {
      email,
      slaptazodis,
      vardas,
      pavarde,
      role,
      vaikoVardas: vaikoVardas || null,
      pamokos: pamokos || [],
    });

    if (error) {
      console.error("Registration error from RPC:", error);
      return NextResponse.json(
        { message: error.message || "Registracijos klaida" },
        { status: 400 }
      );
    }

    if (!data || !data.success) {
      console.error("Registration failed:", data);
      return NextResponse.json(
        { message: data?.message || "Registracija nepavyko" },
        { status: 400 }
      );
    }

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