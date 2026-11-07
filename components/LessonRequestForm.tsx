"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { CalendarCheck, CheckCircle2, Loader2, AlertCircle, Mail, Phone, User, GraduationCap } from "lucide-react";
import WeeklyRequestCalendar from "./WeeklyRequestCalendar";
import { MIN_SLOTS } from "@/lib/lessonRequestRules";

const GRADES = [...Array.from({ length: 12 }, (_, i) => `${i + 1} klasė`), "Studentas", "Suaugęs"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Client picks 5+ times in a week grid and leaves contacts. Tutors then pick one of the times. */
export default function LessonRequestForm({ subject }: { subject: string }) {
  const [slots, setSlots] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (slots.length < MIN_SLOTS) return setError(`Pažymėkite bent ${MIN_SLOTS} laikus kalendoriuje.`);
    if (name.trim().length < 3) return setError("Įveskite vardą ir pavardę.");
    if (!grade) return setError("Pasirinkite klasę.");
    if (!EMAIL_RE.test(email.trim())) return setError("Įveskite teisingą el. paštą.");

    setStatus("sending");
    try {
      const res = await fetch("/api/lesson-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, grade, subject, email, phone, topic, slots, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Nepavyko išsiųsti užklausos.");
      setUpdated(Boolean(data.updated));
      setStatus("done");
      // Thank-you page (also a clean conversion URL for analytics). The summary stays in this tab only.
      try {
        sessionStorage.setItem("tk-last-request", JSON.stringify({ subject, email: email.trim(), slots, updated: Boolean(data.updated) }));
      } catch {}
      router.push(`/aciu?dalykas=${encodeURIComponent(subject)}`);
    } catch (err: any) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const input =
    "w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 outline-none " +
    "focus:bg-white focus:border-[#3B65CE] focus:ring-4 focus:ring-[#3B65CE]/15 disabled:opacity-60";
  const busy = status === "sending";

  if (status === "done") {
    return (
      <section className="rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5 p-8 sm:p-12 text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={44} />
        </div>
        <h2 className="text-2xl font-bold mb-2">{updated ? "Užklausa atnaujinta!" : "Užklausa išsiųsta!"}</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Jūsų laikus jau mato <b className="capitalize">{subject}</b> mokytojai. Kai vienas iš jų pasirinks laiką,
          gausite laišką į <b>{email.trim()}</b> su mokytojo kontaktais ir kvietimu į kalendorių.
        </p>
        <ul className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
          {slots.map((s) => (
            <li key={s} className="text-xs bg-blue-50 text-[#3B65CE] font-semibold px-3 py-1.5 rounded-full">
              {format(new Date(s), "MMMM d 'd.' (EEE) HH:mm", { locale: lt })}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section id="laikai" className="rounded-[2rem] bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden mb-12">
      <div className="bg-[#3B65CE] text-white px-6 sm:px-10 py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 mb-4">
          <CalendarCheck size={24} className="text-yellow-300" />
        </div>
        <h2 className="text-3xl font-extrabold leading-tight">Pasirinkite, kada galite mokytis</h2>
        <ol className="mt-4 grid sm:grid-cols-3 gap-3 text-sm text-blue-50">
          <li><b className="text-yellow-300">1.</b> Pažymėkite bent {MIN_SLOTS} jums tinkamas valandas</li>
          <li><b className="text-yellow-300">2.</b> Mokytojas pasirenka vieną iš jų</li>
          <li><b className="text-yellow-300">3.</b> Gaunate laišką su mokytojo kontaktais</li>
        </ol>
      </div>

      <form onSubmit={submit} noValidate className="p-4 sm:p-10 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 min-w-0">
          <WeeklyRequestCalendar value={slots} onChange={setSlots} disabled={busy} />
        </div>

        <div className="lg:col-span-2 min-w-0 flex flex-col gap-4">
          <input
            type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden"
          />
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={input} placeholder="Mokinio vardas, pavardė" value={name} onChange={(e) => setName(e.target.value)} disabled={busy} autoComplete="name" />
          </div>
          <div className="relative">
            <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select className={`${input} appearance-none`} value={grade} onChange={(e) => setGrade(e.target.value)} disabled={busy}>
              <option value="">Klasė</option>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={input} type="email" placeholder="El. paštas" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} autoComplete="email" />
          </div>
          <div className="relative">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={input} type="tel" placeholder="Telefonas (neprivaloma)" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={busy} autoComplete="tel" />
          </div>
          <textarea
            className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 outline-none focus:bg-white focus:border-[#3B65CE] focus:ring-4 focus:ring-[#3B65CE]/15 resize-none"
            rows={3} placeholder="Ką norėtumėte išmokti? (neprivaloma)" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={busy}
          />

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="h-14 rounded-2xl bg-[#3B65CE] hover:bg-[#2f54b3] text-white font-bold shadow-lg shadow-blue-500/25 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy ? <><Loader2 size={20} className="animate-spin" /> Siunčiama...</> : slots.length < MIN_SLOTS
              ? `Pažymėkite dar ${MIN_SLOTS - slots.length} (min. ${MIN_SLOTS})`
              : `Siųsti užklausą · ${slots.length}`}
          </button>
          <p className="text-xs text-slate-400 text-center">Užklausa nemokama ir neįpareigoja. Pamokos kaina – 25 €.</p>
          <p className="text-xs text-slate-400 text-center -mt-2">
            Siųsdami sutinkate su <Link href="/taisykles" className="underline">taisyklėmis</Link> ir{" "}
            <Link href="/privatumo-politika" className="underline">privatumo politika</Link>.
          </p>
        </div>
      </form>
    </section>
  );
}
