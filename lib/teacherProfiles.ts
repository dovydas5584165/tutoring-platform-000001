/**
 * Server-side helpers for tutor cards (table: teacher_profiles): types, photo limits and field whitelists.
 */

export type TeacherProfile = {
  id: string;
  user_id: string | null;
  name: string;
  subject: string;
  experience: string;
  description: string;
  img: string | null;
  sort_order: number;
  visible: boolean;
};

export const PHOTO_BUCKET = "teacher photos";
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // Vercel request limit is ~4.5 MB

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** Picks only the fields a tutor (or admin) may edit, cleaned up. */
export function editableFields(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if ("name" in body) out.name = str(body.name, 100);
  if ("subject" in body) out.subject = str(body.subject, 120);
  if ("experience" in body) out.experience = str(body.experience, 60);
  if ("description" in body) out.description = str(body.description, 1500);
  if ("img" in body) {
    const img = str(body.img, 500);
    // Only our own storage (or empty) — no arbitrary external URLs
    out.img = img && img.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/`) ? img : null;
  }
  return out;
}

/** Extra fields only the admin may change. */
export function adminFields(body: Record<string, unknown>) {
  const out = editableFields(body);
  if (typeof body.visible === "boolean") out.visible = body.visible;
  if (body.sort_order !== undefined && Number.isFinite(Number(body.sort_order))) out.sort_order = Math.round(Number(body.sort_order));
  if ("user_id" in body) out.user_id = body.user_id ? String(body.user_id) : null;
  return out;
}
