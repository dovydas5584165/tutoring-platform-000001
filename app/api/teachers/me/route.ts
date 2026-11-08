/**
 * Logged-in tutor reads and saves their own tutor card.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { tutorFromRequest } from "../../../../lib/lessonRequests";
import { editableFields } from "../../../../lib/teacherProfiles";

/** Logged-in tutor: their own card (or null if they don't have one yet). */
export async function GET(req: NextRequest) {
  const tutor = await tutorFromRequest(req);
  if (!tutor) return NextResponse.json({ error: "Neprisijungta" }, { status: 401 });
  const { data } = await supabaseAdmin.from("teacher_profiles").select("*").eq("user_id", tutor.id).maybeSingle();
  return NextResponse.json({
    teacher: data,
    suggestedName: [tutor.vardas, tutor.pavarde].filter(Boolean).join(" "),
  });
}

/**
 * Logged-in tutor: save their own card. Creates it on first save.
 * New cards start hidden so the admin can check them before they go public.
 */
export async function PUT(req: NextRequest) {
  const tutor = await tutorFromRequest(req);
  if (!tutor) return NextResponse.json({ error: "Neprisijungta" }, { status: 401 });

  const fields = editableFields(await req.json().catch(() => ({})));
  if ("name" in fields && !fields.name) return NextResponse.json({ error: "Įveskite vardą" }, { status: 400 });

  const { data: existing } = await supabaseAdmin.from("teacher_profiles").select("id").eq("user_id", tutor.id).maybeSingle();

  const { data, error } = existing
    ? await supabaseAdmin.from("teacher_profiles")
        .update({ ...fields, updated_at: new Date().toISOString() }).eq("id", existing.id).select().single()
    : await supabaseAdmin.from("teacher_profiles")
        .insert({ ...fields, name: fields.name || [tutor.vardas, tutor.pavarde].filter(Boolean).join(" ") || tutor.email,
                  user_id: tutor.id, visible: false, sort_order: 1000 })
        .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ teacher: data });
}
