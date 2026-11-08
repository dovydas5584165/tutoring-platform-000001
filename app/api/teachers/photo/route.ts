import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { isAdmin } from "../../../../lib/accessCodes";
import { tutorFromRequest } from "../../../../lib/lessonRequests";
import { PHOTO_BUCKET, MAX_PHOTO_BYTES } from "../../../../lib/teacherProfiles";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** Upload a tutor photo (admin or logged-in tutor). Form field: "file". Returns its public URL. */
export async function POST(req: NextRequest) {
  const admin = isAdmin(req);
  const tutor = admin ? null : await tutorFromRequest(req);
  if (!admin && !tutor) return NextResponse.json({ error: "Neprisijungta" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Nėra failo" }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Tinka tik JPG, PNG arba WEBP nuotraukos" }, { status: 400 });
  if (file.size > MAX_PHOTO_BYTES) return NextResponse.json({ error: "Nuotrauka per didelė (daugiausiai 4 MB)" }, { status: 400 });

  const path = `profiles/${tutor?.id ?? "admin"}-${Date.now()}.${ext}`;
  const { error } = await supabaseAdmin.storage.from(PHOTO_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) {
    console.error("photo upload failed:", error);
    return NextResponse.json({ error: "Nepavyko įkelti nuotraukos" }, { status: 500 });
  }
  const { data } = supabaseAdmin.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
