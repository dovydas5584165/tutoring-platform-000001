import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { sendEmail } from "../../../../lib/email";
import {
  sameInstant, subjectsForTutor, tutorFromRequest, lessonCalendar, fmtSlot,
  claimedStudentEmail, claimedTutorEmail, type LessonRequestRow,
} from "../../../../lib/lessonRequests";

/** Tutor picks one of the client's times. First tutor to claim wins. */
export async function POST(req: NextRequest) {
  const tutor = await tutorFromRequest(req);
  if (!tutor) return NextResponse.json({ error: "Neprisijungta" }, { status: 401 });

  const { requestId, slot } = await req.json().catch(() => ({}));
  if (!requestId || !slot) return NextResponse.json({ error: "Trūksta duomenų" }, { status: 400 });

  const { data: current } = await supabaseAdmin.from("lesson_requests").select("*").eq("id", requestId).maybeSingle();
  if (!current) return NextResponse.json({ error: "Užklausa nerasta" }, { status: 404 });
  const r0 = current as LessonRequestRow;

  if (r0.status !== "open") return taken();
  const subjects = await subjectsForTutor(tutor.id);
  if (!subjects.includes(r0.subject.toLowerCase())) {
    return NextResponse.json({ error: "Šio dalyko jūs nedėstote" }, { status: 403 });
  }
  const chosen = r0.slots.find((s) => sameInstant(s, slot));
  if (!chosen) return NextResponse.json({ error: "Tokio laiko užklausoje nėra" }, { status: 400 });
  if (new Date(chosen).getTime() <= Date.now()) return NextResponse.json({ error: "Šis laikas jau praėjo" }, { status: 400 });

  // Atomic: only succeeds while the request is still open, so two tutors can't both get it
  const { data: rows, error } = await supabaseAdmin
    .from("lesson_requests")
    .update({ status: "claimed", tutor_id: tutor.id, chosen_slot: chosen, claimed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", requestId).eq("status", "open")
    .select();

  if (error) {
    console.error("claim failed:", error);
    return NextResponse.json({ error: "Nepavyko pasirinkti laiko" }, { status: 500 });
  }
  if (!rows || rows.length === 0) return taken();

  const r = rows[0] as LessonRequestRow;
  const tutorName = `${tutor.vardas} ${tutor.pavarde}`;
  const cal = lessonCalendar(r, tutorName);

  const [studentMail] = await Promise.all([
    sendEmail({
      to: r.email,
      replyTo: tutor.email,
      subject: `✅ Pamoka suderinta: ${r.subject}, ${fmtSlot(r.chosen_slot!)}`,
      html: claimedStudentEmail(r, tutor, cal.google),
      attachments: [cal.attachment],
    }),
    sendEmail({
      to: tutor.email,
      replyTo: r.email,
      subject: `📅 ${r.student_name}: ${r.subject}, ${fmtSlot(r.chosen_slot!)}`,
      html: claimedTutorEmail(r, tutorName, cal.google),
      attachments: [cal.attachment],
    }),
  ]);

  return NextResponse.json({ success: true, request: r, studentEmailed: studentMail.success });
}

const taken = () =>
  NextResponse.json({ error: "Šią užklausą jau pasirinko kitas mokytojas." }, { status: 409 });
