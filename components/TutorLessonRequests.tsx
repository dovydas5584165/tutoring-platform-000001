"use client";

/**
 * Tutor dashboard panel: open client requests and lessons the tutor already picked.
 */

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { CalendarCheck, Loader2, Mail, Phone, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { fmtLessonTime, mailtoLink, templates } from "@/lib/tutorEmailTemplates";

type OpenRequest = {
  id: string;
  created_at: string;
  student_name: string;
  grade: string;
  subject: string;
  topic: string | null;
  slots: string[];
};
type MyLesson = OpenRequest & { email: string; phone: string | null; chosen_slot: string };

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtDay = (d: Date) => cap(format(d, "cccc, MMMM d", { locale: lt }));
const fmtFull = (d: Date) => format(d, "EEEE, MMMM d 'd.' HH:mm", { locale: lt });
const fmtTime = (d: Date) => format(d, "HH:mm");

/** Groups ISO times by calendar day, sorted by date. */
function byDay(slots: string[]) {
  const groups = new Map<string, Date[]>();
  for (const s of slots) {
    const d = new Date(s);
    const k = format(d, "yyyy-MM-dd");
    groups.set(k, [...(groups.get(k) || []), d]);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

/** Bearer token of the logged-in tutor for API calls. */
async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Tutor dashboard panel: open client requests for the tutor's subjects + lessons they already picked. */
export default function TutorLessonRequests() {
  const [open, setOpen] = useState<OpenRequest[]>([]);
  const [mine, setMine] = useState<MyLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<{ id: string; slot: string } | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [flash, setFlash] = useState("");
  const [me, setMe] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/lesson-requests/tutor", { headers: await authHeaders(), cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nepavyko gauti užklausų");
      setOpen(data.open || []);
      setMine(data.mine || []);
      setMe(data.me?.name || "");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const claim = async () => {
    if (!picked) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/lesson-requests/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ requestId: picked.id, slot: picked.slot }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Nepavyko pasirinkti laiko");
      } else {
        setFlash(
          `Pamoka suderinta: ${data.request.student_name}, ${fmtFull(new Date(data.request.chosen_slot))}. ` +
            (data.studentEmailed ? "Mokiniui išsiųstas laiškas su jūsų kontaktais." : "⚠️ Mokiniui laiško išsiųsti nepavyko – susisiekite patys.")
        );
      }
      setPicked(null);
      await load();
    } finally {
      setClaiming(false);
    }
  };

  const now = Date.now();
  const upcoming = mine.filter((m) => new Date(m.chosen_slot).getTime() > now - 3600_000);

  return (
    <section className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#3B65CE]">
      <div className="flex justify-between items-center mb-6 border-b pb-3 gap-3">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <CalendarCheck className="text-[#3B65CE]" /> Mokinių užklausos
          {open.length > 0 && <span className="text-sm bg-red-500 text-white rounded-full px-2.5 py-0.5">{open.length}</span>}
        </h2>
        <button onClick={load} className="text-gray-500 hover:text-[#3B65CE] p-2" aria-label="Atnaujinti">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {flash && (
        <div className="mb-5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 text-sm flex justify-between gap-3">
          <span>✅ {flash}</span>
          <button onClick={() => setFlash("")} className="font-bold">×</button>
        </div>
      )}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && open.length === 0 && !error && (
        <p className="text-gray-600 italic">Šiuo metu naujų užklausų jūsų dalykams nėra.</p>
      )}

      <ul className="space-y-5">
        {open.map((r) => (
          <li key={r.id} className="border rounded-xl p-5 hover:shadow-md transition">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <p className="text-lg font-bold">
                {r.student_name} <span className="text-gray-500 font-normal">· {r.grade}</span>
              </p>
              <span className="text-xs font-semibold uppercase tracking-wide bg-blue-50 text-[#3B65CE] px-2.5 py-1 rounded-full">
                {r.subject}
              </span>
            </div>
            {r.topic && <p className="text-sm text-gray-700 mb-1">Tema: „{r.topic}“</p>}
            <p className="text-xs text-gray-400 mb-4">Pateikta {new Date(r.created_at).toLocaleString("lt-LT")}</p>

            <p className="text-sm font-medium text-gray-700 mb-2">Pasirinkite vieną laiką, kada galite vesti pamoką:</p>
            <div className="space-y-2">
              {byDay(r.slots).map(([day, times]) => (
                <div key={day} className="flex flex-wrap items-center gap-2">
                  <span className="w-48 shrink-0 text-sm text-gray-600">{fmtDay(times[0])}</span>
                  {times.map((t) => {
                    const iso = t.toISOString();
                    const on = picked?.id === r.id && picked.slot === iso;
                    return (
                      <button
                        key={iso}
                        onClick={() => setPicked(on ? null : { id: r.id, slot: iso })}
                        disabled={claiming}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${
                          on ? "bg-[#3B65CE] text-white border-[#3B65CE] ring-4 ring-[#3B65CE]/20" : "border-gray-300 hover:border-[#3B65CE] hover:bg-blue-50"
                        }`}
                      >
                        {fmtTime(t)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {picked?.id === r.id && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-blue-50 p-3">
                <span className="text-sm">
                  Vesite pamoką <b>{fmtFull(new Date(picked.slot))}</b>?
                </span>
                <button
                  onClick={claim}
                  disabled={claiming}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-60"
                >
                  {claiming && <Loader2 size={16} className="animate-spin" />} Patvirtinti
                </button>
                <button onClick={() => setPicked(null)} className="px-3 py-2 text-gray-600 hover:text-gray-900">
                  Atšaukti
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {upcoming.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-8 mb-3">Jūsų suderintos pamokos</h3>
          <ul className="space-y-3">
            {upcoming.map((m) => (
              <li key={m.id} className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-bold">
                    {cap(fmtFull(new Date(m.chosen_slot)))} · <span className="capitalize">{m.subject}</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    {m.student_name} ({m.grade}){m.topic ? ` · „${m.topic}“` : ""}
                  </p>
                </div>
                <div className="w-full flex flex-wrap gap-2 order-last">
                  {templates({ student: m.student_name, subject: m.subject, when: fmtLessonTime(m.chosen_slot), tutor: me || "[jūsų vardas]" }, m.email).map((t, i) => (
                    <a
                      key={t.id}
                      href={mailtoLink(t, m.email)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                        i === 0 ? "bg-[#3B65CE] text-white border-[#3B65CE] hover:bg-[#2f54b3]" : "bg-white border-gray-300 hover:border-[#3B65CE]"
                      }`}
                    >
                      {i === 0 ? "✉️ Rašyti mokiniui" : i === 1 ? "Atšaukti / perkelti" : "Administracijai"}
                    </a>
                  ))}
                </div>
                <div className="flex flex-col text-sm gap-1">
                  <a href={`mailto:${m.email}`} className="flex items-center gap-1.5 text-[#3B65CE] hover:underline">
                    <Mail size={14} /> {m.email}
                  </a>
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 text-[#3B65CE] hover:underline">
                      <Phone size={14} /> {m.phone}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
