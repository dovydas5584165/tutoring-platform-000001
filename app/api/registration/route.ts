/**
 * Creates a tutor or client account (Supabase Auth user + profile and lessons).
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";
import { SITE_URL, CONTACT_EMAIL } from "@/lib/site";
import { clientIp, rateLimit, safeEqual, tooMany } from "@/lib/security";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/**
 * Same answer whether or not the email already has an account, so the form can't be used to find out
 * who is registered (user enumeration). The real outcome goes to the mailbox.
 */
const checkEmail = () => NextResponse.json(
  { message: "Patikrinkite el. paštą: išsiuntėme nuorodą registracijai patvirtinti.", pendingConfirmation: true },
  { status: 201 }
);

const payloadSchema = z.object({
  email: z.string().email("Neteisingas el. pašto formatas"),
  slaptazodis: z.string().min(8, "Slaptažodis per trumpas (min 8 simboliai)").max(72, "Slaptažodis per ilgas"),
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
  if (!rateLimit(`register:${clientIp(req)}`, 5, 60 * 60_000)) return tooMany();
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
      if (!expected || !safeEqual(inviteCode?.trim() ?? "", expected)) {
        return NextResponse.json({ message: "Neteisingas mokytojo kvietimo kodas." }, { status: 403 });
      }
    }

    // 1. Create an UNCONFIRMED auth user and a confirmation link. The account only works after the
    //    owner of the mailbox clicks it, so nobody can pre-register (pre-hijack) someone else's email.
    const { data: linkData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password: slaptazodis,
      options: {
        data: { role, vardas, pavarde, vaikovardas },
        redirectTo: `${SITE_URL}/auth/log-in`,
      },
    });

    if (authError || !linkData?.user) {
      const exists = authError && ((authError as any).code === "email_exists" || /already (been )?registered/i.test(authError.message));
      if (exists) {
        // Tell the real owner instead of the person filling in the form
        await sendEmail({
          to: email,
          subject: "Bandymas registruotis Tiksliukai.lt",
          html: `<p>Sveiki,</p><p>kažkas bandė užregistruoti paskyrą šiuo el. pašto adresu, bet jūs jau turite paskyrą.</p>
            <p>Jei tai buvote jūs, <a href="${SITE_URL}/auth/log-in">prisijunkite</a> arba
            <a href="${SITE_URL}/auth/forgot_pass">atkurkite slaptažodį</a>. Jei ne – šį laišką galite ignoruoti.</p>
            <p>Tiksliukai.lt · ${CONTACT_EMAIL}</p>`,
        });
        return checkEmail();
      }
      console.error("Auth creation failed:", authError);
      return NextResponse.json({ message: "Registracija nepavyko. Bandykite dar kartą." }, { status: 400 });
    }
    const userData = { user: linkData.user };

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
        { message: "Registracijos klaida" },
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

    // 3. Email the confirmation link (our SMTP). Without it the account can't be used, so roll back on failure.
    const mail = await sendEmail({
      to: email,
      subject: "Patvirtinkite registraciją – Tiksliukai.lt",
      html: `<p>Sveiki, ${esc(vardas)}!</p>
        <p>Paspauskite nuorodą, kad patvirtintumėte el. paštą ir užbaigtumėte registraciją:</p>
        <p><a href="${linkData.properties.action_link}">Patvirtinti registraciją</a></p>
        <p>Jei registravotės ne jūs, šį laišką galite ignoruoti.</p>
        <p>Tiksliukai.lt · ${CONTACT_EMAIL}</p>`,
    });
    if (!mail.success) {
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      return NextResponse.json({ message: "Nepavyko išsiųsti patvirtinimo laiško. Bandykite vėliau." }, { status: 500 });
    }

    return checkEmail();
  } catch (err: any) {
    console.error("Registration fatal error:", err);

    return NextResponse.json(
      { message: "Nežinoma serverio klaida" },
      { status: 500 }
    );
  }
}
