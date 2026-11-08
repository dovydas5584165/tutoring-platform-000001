import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { isAdmin, generateCode } from "../../../lib/accessCodes";

const unauthorized = () => NextResponse.json({ error: "Neteisingas slaptažodis" }, { status: 401 });

/** List all codes, newest first. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const { data, error } = await supabaseAdmin
    .from("access_codes").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ codes: data });
}

/** Create a code for a company. Valid for `months` (default 1) from now. */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const company = String(body.company ?? "").trim().slice(0, 100);
  if (!company) return NextResponse.json({ error: "Įveskite įmonės pavadinimą" }, { status: 400 });

  const months = Math.min(Math.max(Number(body.months) || 1, 1), 12);
  const expires = new Date();
  expires.setMonth(expires.getMonth() + months);

  const custom = String(body.code ?? "").trim().toLowerCase();
  if (custom && !/^[a-z0-9-]{4,40}$/.test(custom)) {
    return NextResponse.json({ error: "Kodas: 4–40 simbolių, tik raidės, skaičiai ir brūkšneliai" }, { status: 400 });
  }
  const code = custom || generateCode(company);

  const { data, error } = await supabaseAdmin
    .from("access_codes")
    .insert({ code, company, expires_at: expires.toISOString() })
    .select().single();
  if (error) {
    const msg = error.code === "23505" ? "Toks kodas jau yra" : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ code: data });
}

/** Turn a code on/off, or extend it by N months (from its expiry, or from now if already expired). */
export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toLowerCase();
  if (!code) return NextResponse.json({ error: "Trūksta kodo" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (typeof body.active === "boolean") update.active = body.active;
  if (body.extendMonths) {
    const { data: row } = await supabaseAdmin.from("access_codes").select("expires_at").eq("code", code).maybeSingle();
    if (!row) return NextResponse.json({ error: "Kodas nerastas" }, { status: 404 });
    const base = new Date(Math.max(new Date(row.expires_at).getTime(), Date.now()));
    base.setMonth(base.getMonth() + Math.min(Math.max(Number(body.extendMonths) || 1, 1), 12));
    update.expires_at = base.toISOString();
    update.active = true;
  }

  const { data, error } = await supabaseAdmin.from("access_codes").update(update).eq("code", code).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ code: data });
}
