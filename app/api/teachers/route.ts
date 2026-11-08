import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { isAdmin } from "../../../lib/accessCodes";
import { adminFields } from "../../../lib/teacherProfiles";

const PUBLIC_COLUMNS = "id, name, subject, experience, description, img";
const unauthorized = () => NextResponse.json({ error: "Neteisingas slaptažodis" }, { status: 401 });

/** Public: visible tutor cards in display order. Admin (?all=1 + secret): every card with all fields. */
export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "1";
  if (all && !isAdmin(req)) return unauthorized();

  let q = supabaseAdmin.from("teacher_profiles").select(all ? "*" : PUBLIC_COLUMNS)
    .order("sort_order").order("created_at");
  if (!all) q = q.eq("visible", true);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ teachers: data }, all ? undefined : { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300" } });
}

/** Admin: add a tutor card (goes to the end of the list). */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const fields = adminFields(await req.json().catch(() => ({})));
  if (!fields.name) return NextResponse.json({ error: "Įveskite vardą" }, { status: 400 });

  if (fields.sort_order === undefined) {
    const { data: last } = await supabaseAdmin.from("teacher_profiles").select("sort_order")
      .order("sort_order", { ascending: false }).limit(1).maybeSingle();
    fields.sort_order = (last?.sort_order ?? 0) + 1;
  }
  const { data, error } = await supabaseAdmin.from("teacher_profiles").insert(fields).select().single();
  if (error) return NextResponse.json({ error: friendly(error) }, { status: 400 });
  return NextResponse.json({ teacher: data });
}

/** Admin: edit a card. Body: { id, ...fields } */
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const body = await req.json().catch(() => ({}));
  if (!body.id) return NextResponse.json({ error: "Trūksta id" }, { status: 400 });
  const fields = adminFields(body);
  if ("name" in fields && !fields.name) return NextResponse.json({ error: "Vardas negali būti tuščias" }, { status: 400 });

  const { data, error } = await supabaseAdmin.from("teacher_profiles")
    .update({ ...fields, updated_at: new Date().toISOString() }).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: friendly(error) }, { status: 400 });
  return NextResponse.json({ teacher: data });
}

/** Admin: delete a card. Body: { id } */
export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "Trūksta id" }, { status: 400 });
  const { error } = await supabaseAdmin.from("teacher_profiles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

function friendly(error: { code?: string; message: string }) {
  return error.code === "23505" ? "Ši mokytojo paskyra jau susieta su kita kortele" : error.message;
}
