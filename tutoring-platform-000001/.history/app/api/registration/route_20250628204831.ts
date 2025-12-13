function isValidEmail(email: string): boolean {
  // Griežtas RFC 5322 regex (šiek tiek supaprastintas)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { message: `El. pašto adresas "${normalizedEmail}" yra neteisingas.` },
        { status: 400 }
      );
    }

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
    console.error("Catch error:", err);
    return NextResponse.json(
      { message: err.message || "Nežinoma klaida" },
      { status: 500 }
    );
  }
}
