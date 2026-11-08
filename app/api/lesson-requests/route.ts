/**
 * Public endpoint where a client submits (or updates) a lesson request with 5+ possible times.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { sendEmail } from "../../../lib/email";
import { clientIp, rateLimit, tooMany } from "../../../lib/security";
import {
  MIN_SLOTS, MAX_SLOTS, cleanSlots, tutorsForSubject, likeExact,
  requestReceivedEmail, newRequestTutorEmail, type LessonRequestRow,
} from "../../../lib/lessonRequests";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** Client submits a lesson request with 5+ possible times. Public endpoint. */
export async function POST(req: NextRequest) {
  // Sends emails, so cap submissions per IP (spam / email bombing)
  if (!rateLimit(`lesson-req:${clientIp(req)}`, 5, 10 * 60_000)) return tooMany();
  try {
    const body = await req.json();

    // Bots fill hidden fields; pretend success
    if (body.website) return NextResponse.json({ success: true });

    const student_name = str(body.name, 100);
    const grade = str(body.grade, 40);
    const subject = str(body.subject, 80);
    const topic = str(body.topic, 500) || null;
    const email = str(body.email, 120).toLowerCase();
    const phone = str(body.phone, 30) || null;
    const slots = cleanSlots(body.slots);

    if (body.agreed !== true) return bad("Pažymėkite patvirtinimo varnelę.");
    if (student_name.length < 3) return bad("Įveskite vardą ir pavardę.");
    if (!grade) return bad("Pasirinkite klasę.");
    if (!subject) return bad("Nenurodytas dalykas.");
    if (!EMAIL_RE.test(email)) return bad("Įveskite teisingą el. paštą.");
    if (phone && !/^[+\d\s()-]{6,30}$/.test(phone)) return bad("Neteisingas telefono numeris.");
    if (slots.length < MIN_SLOTS) return bad(`Pasirinkite bent ${MIN_SLOTS} būsimus laikus.`);
    if (slots.length > MAX_SLOTS) return bad(`Galima pasirinkti daugiausiai ${MAX_SLOTS} laikų.`);

    const fields = { student_name, grade, subject, topic, email, phone, slots, updated_at: new Date().toISOString() };

    // One open request per email + subject: resubmitting updates it instead of creating a duplicate
    const { data: existing } = await supabaseAdmin
      .from("lesson_requests").select("id")
      .eq("email", email).ilike("subject", likeExact(subject)).eq("status", "open")
      .maybeSingle();

    const { data: row, error } = existing
      ? await supabaseAdmin.from("lesson_requests").update(fields).eq("id", existing.id).eq("status", "open").select().single()
      : await supabaseAdmin.from("lesson_requests").insert(fields).select().single();

    if (error || !row) {
      console.error("lesson_requests save failed:", error);
      return NextResponse.json({ error: "Nepavyko išsaugoti užklausos. Bandykite dar kartą." }, { status: 500 });
    }

    const r = row as LessonRequestRow;
    await sendEmail({ to: email, subject: `Gavome jūsų užklausą – ${subject}`, html: requestReceivedEmail(r) });

    // Tell matching tutors only about new requests, not about edits
    if (!existing) {
      const tutors = await tutorsForSubject(subject);
      await Promise.all(
        tutors.filter((t) => EMAIL_RE.test(t.email || "")).map((t) =>
          sendEmail({ to: t.email, subject: `🔔 Nauja užklausa: ${subject} (${grade})`, html: newRequestTutorEmail(r, t.id) })
        )
      );
    }

    return NextResponse.json({ success: true, updated: Boolean(existing) });
  } catch (e) {
    console.error("lesson-requests POST error:", e);
    return NextResponse.json({ error: "Vidinė serverio klaida" }, { status: 500 });
  }
}

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });
