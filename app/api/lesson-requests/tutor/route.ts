import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { subjectsForTutor, tutorFromRequest, type LessonRequestRow } from "../../../../lib/lessonRequests";

/**
 * Requests for the logged-in tutor's dashboard:
 *  - open:    requests in subjects they teach, without the client's contacts
 *  - mine:    requests they claimed, with contacts
 */
export async function GET(req: NextRequest) {
  const tutor = await tutorFromRequest(req);
  if (!tutor) return NextResponse.json({ error: "Neprisijungta" }, { status: 401 });

  const subjects = await subjectsForTutor(tutor.id);
  const now = Date.now();

  const [openRes, mineRes] = await Promise.all([
    supabaseAdmin.from("lesson_requests").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(100),
    supabaseAdmin.from("lesson_requests").select("*").eq("status", "claimed").eq("tutor_id", tutor.id)
      .order("chosen_slot", { ascending: false }).limit(50),
  ]);

  if (openRes.error || mineRes.error) {
    console.error("lesson-requests tutor GET:", openRes.error || mineRes.error);
    return NextResponse.json({ error: "Nepavyko gauti užklausų" }, { status: 500 });
  }

  const open = ((openRes.data || []) as LessonRequestRow[])
    .filter((r) => subjects.includes(r.subject.toLowerCase()))
    .map((r) => ({ ...r, slots: r.slots.filter((s) => new Date(s).getTime() > now) }))
    .filter((r) => r.slots.length > 0)
    .map(({ email, phone, ...rest }) => rest); // contacts only after claiming

  return NextResponse.json({ open, mine: mineRes.data || [], me: { name: `${tutor.vardas} ${tutor.pavarde}` } });
}
