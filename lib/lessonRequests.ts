import { supabaseAdmin } from "./supabaseAdmin";

/* ---------- shared rules (used by the page, the API and the dashboard) ---------- */

import { LESSON_MINUTES, MAX_DAYS_AHEAD, MIN_NOTICE_HOURS } from "./lessonRequestRules";
export { MIN_SLOTS, MAX_SLOTS } from "./lessonRequestRules";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tiksliukai.lt";
const TZ = "Europe/Vilnius";

export type LessonRequestRow = {
  id: string;
  created_at: string;
  student_name: string;
  grade: string;
  subject: string;
  topic: string | null;
  email: string;
  phone: string | null;
  slots: string[];
  status: "open" | "claimed" | "cancelled";
  tutor_id: string | null;
  chosen_slot: string | null;
  claimed_at: string | null;
};

/** Normalises client-sent times; drops invalid, duplicate, too-early and too-late ones. */
export function cleanSlots(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const now = Date.now();
  const earliest = now + MIN_NOTICE_HOURS * 3600_000;
  const latest = now + MAX_DAYS_AHEAD * 86400_000;
  const seen = new Set<number>();
  for (const v of input) {
    const t = new Date(String(v)).getTime();
    if (!Number.isFinite(t) || t < earliest || t > latest) continue;
    seen.add(t);
  }
  return [...seen].sort((a, b) => a - b).map((t) => new Date(t).toISOString());
}

export const sameInstant = (a: string, b: string) => new Date(a).getTime() === new Date(b).getTime();

export function fmtSlot(iso: string) {
  return new Date(iso).toLocaleString("lt-LT", {
    timeZone: TZ, weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/** Escapes LIKE wildcards so `ilike` works as a case-insensitive equals. */
export const likeExact = (s: string) => s.replace(/[\\%_]/g, (c) => "\\" + c);

/** Tutor (id + email + name) for every tutor who teaches `subject`. */
export async function tutorsForSubject(subject: string) {
  const { data: lesson } = await supabaseAdmin.from("lessons").select("id").ilike("name", likeExact(subject)).maybeSingle();
  if (!lesson) return [];
  const { data: links } = await supabaseAdmin.from("user_lessons").select("user_id").eq("lesson_id", lesson.id);
  const ids = (links || []).map((l) => l.user_id);
  if (!ids.length) return [];
  const { data: tutors } = await supabaseAdmin
    .from("users").select("id, email, vardas, pavarde").in("id", ids).eq("role", "tutor");
  return tutors || [];
}

/** Lower-cased lesson names the tutor teaches. */
export async function subjectsForTutor(tutorId: string) {
  const { data } = await supabaseAdmin.from("user_lessons").select("lessons(name)").eq("user_id", tutorId);
  return (data || [])
    .map((r: any) => (Array.isArray(r.lessons) ? r.lessons[0]?.name : r.lessons?.name))
    .filter(Boolean)
    .map((n: string) => n.toLowerCase());
}

/** Resolves the logged-in tutor from the `Authorization: Bearer <supabase access token>` header. */
export async function tutorFromRequest(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: profile } = await supabaseAdmin
    .from("users").select("id, email, vardas, pavarde, role").eq("id", data.user.id).maybeSingle();
  if (!profile || profile.role !== "tutor") return null;
  return profile as { id: string; email: string; vardas: string; pavarde: string; role: string };
}

/* ---------- calendar invite ---------- */

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function lessonCalendar(r: LessonRequestRow, tutorName: string) {
  const start = new Date(r.chosen_slot!);
  const end = new Date(start.getTime() + LESSON_MINUTES * 60_000);
  const title = `Pamoka: ${r.subject} (${r.student_name} su ${tutorName})`;
  const details = `Tiksliukai.lt pamoka.${r.topic ? ` Tema: ${r.topic}.` : ""}`;
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tiksliukai//Pamokos//LT", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${r.id}@tiksliukai.lt`, `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText(title)}`, `DESCRIPTION:${icsText(details)}`,
    "BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", "DESCRIPTION:Pamoka po valandos", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR", "",
  ].join("\r\n");
  const google =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(title)}&dates=${icsDate(start)}/${icsDate(end)}&details=${encodeURIComponent(details)}`;
  return { ics, google, attachment: { filename: "pamoka.ics", content: ics, contentType: "text/calendar; charset=utf-8" } };
}

/* ---------- emails ---------- */

const wrap = (title: string, body: string) => `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a">
<div style="max-width:560px;margin:0 auto;padding:24px">
<div style="background:#3B65CE;color:#fff;padding:20px 24px;border-radius:16px 16px 0 0"><h1 style="margin:0;font-size:20px">${title}</h1></div>
<div style="background:#fff;padding:24px;border-radius:0 0 16px 16px;line-height:1.6">${body}
<p style="color:#64748b;font-size:12px;margin-top:24px">Tiksliukai.lt · info.tiksliukai@gmail.com</p></div></div></body></html>`;

const slotList = (slots: string[]) =>
  `<ul style="padding-left:18px;margin:8px 0">${slots.map((s) => `<li>${esc(fmtSlot(s))}</li>`).join("")}</ul>`;

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#3B65CE;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:bold">${label}</a>`;

export function requestReceivedEmail(r: LessonRequestRow) {
  return wrap("Gavome jūsų užklausą",
    `<p>Sveiki, <b>${esc(r.student_name)}</b>!</p>
     <p>Jūsų <b>${esc(r.subject)}</b> pamokos užklausa perduota mūsų mokytojams. Kai vienas iš jų pasirinks laiką, gausite laišką su mokytojo kontaktais.</p>
     <p>Jūsų pasirinkti laikai:</p>${slotList(r.slots)}
     <p style="color:#64748b;font-size:13px">Norite pakeisti laikus? Tiesiog užpildykite formą dar kartą tuo pačiu el. paštu – užklausa bus atnaujinta.</p>
     <p style="color:#64748b;font-size:13px">Pateikdami užklausą patvirtinote, kad esate pilnametis, mokinio tėvas ar globėjas arba turite jų sutikimą, kad sutinkate su <a href="${SITE_URL}/taisykles">taisyklėmis</a> ir prašote pamokas pradėti dar per 14 dienų atsisakymo terminą.</p>`);
}

export function newRequestTutorEmail(r: LessonRequestRow, tutorId: string) {
  return wrap("Nauja pamokos užklausa",
    `<p><b>${esc(r.student_name)}</b> (${esc(r.grade)}) ieško mokytojo: <b>${esc(r.subject)}</b>${r.topic ? `, tema: „${esc(r.topic)}“` : ""}.</p>
     <p>Tinkami laikai:</p>${slotList(r.slots)}
     <p>Pirmas pasirinkęs laiką mokytojas gauna pamoką.</p>
     <p>${button(`${SITE_URL}/tutor_dashboard/${tutorId}`, "Pasirinkti laiką")}</p>`);
}

export function claimedStudentEmail(r: LessonRequestRow, tutor: { vardas: string; pavarde: string; email: string }, google: string) {
  const name = `${tutor.vardas} ${tutor.pavarde}`;
  return wrap("Jūsų pamoka suderinta! 🎉",
    `<p>Sveiki, <b>${esc(r.student_name)}</b>!</p>
     <p>Mokytojas pasirinko jūsų <b>${esc(r.subject)}</b> pamokos laiką:</p>
     <p style="font-size:18px;font-weight:bold;background:#eef2ff;padding:12px 16px;border-radius:10px">${esc(fmtSlot(r.chosen_slot!))}</p>
     <p><b>Jūsų mokytojas:</b> ${esc(name)}<br><b>El. paštas:</b> <a href="mailto:${esc(tutor.email)}">${esc(tutor.email)}</a></p>
     <p>Mokytojas susisieks dėl pamokos detalių. Galite tiesiog <b>atsakyti į šį laišką</b> – jis pateks tiesiai mokytojui.</p>
     <p>${button(google, "Pridėti į Google kalendorių")}</p>
     <p style="color:#64748b;font-size:13px">Prisegtas failas <i>pamoka.ics</i> – atidarykite jį, kad pamoka atsirastų jūsų kalendoriuje.</p>
     <p style="color:#64748b;font-size:13px">Pamokos kaina – 25 € už 45 min., jei nesusitarta kitaip. Taikomos <a href="${SITE_URL}/taisykles">naudojimosi taisyklės</a>.
     Per 14 dienų galite atsisakyti sutarties nenurodydami priežasties – <a href="${SITE_URL}/sutarties-atsisakymas">sutarties atsisakymo forma</a>.
     Įvykusios pamokos atsisakyti nebegalima, nes prašėte jas pradėti per šį terminą.</p>`);
}

export function claimedTutorEmail(r: LessonRequestRow, tutorName: string, google: string) {
  return wrap("Pamoka jūsų kalendoriuje",
    `<p>Sveiki, <b>${esc(tutorName)}</b>!</p>
     <p>Jūs pasirinkote pamoką: <b>${esc(fmtSlot(r.chosen_slot!))}</b>.</p>
     <p><b>Mokinys:</b> ${esc(r.student_name)} (${esc(r.grade)})<br>
        <b>Dalykas:</b> ${esc(r.subject)}${r.topic ? `<br><b>Tema:</b> ${esc(r.topic)}` : ""}<br>
        <b>El. paštas:</b> <a href="mailto:${esc(r.email)}">${esc(r.email)}</a><br>
        <b>Telefonas:</b> ${r.phone ? esc(r.phone) : "nenurodytas"}</p>
     <p>Mokinys jau gavo laišką su jūsų kontaktais. Susisiekite su juo dėl pamokos detalių – atsakymas į šį laišką nueis mokiniui.</p>
     <p>${button(google, "Pridėti į Google kalendorių")}</p>`);
}
