/**
 * Admin: lists tutor accounts so a card can be linked to the tutor who may edit it.
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { isAdmin } from "../../../../lib/accessCodes";

/** Admin: tutor accounts, so a card can be linked to the tutor who may edit it. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Neteisingas slaptažodis" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("users")
    .select("id, vardas, pavarde, email").eq("role", "tutor").order("vardas");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tutors: data });
}
