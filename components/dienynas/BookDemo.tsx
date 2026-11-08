"use client";

/**
 * "Užsakyti demonstraciją" form. Nothing is sent from the site: the request is written into an
 * email to our address and opened in the visitor's mail app (mailto:), with Gmail / Outlook links
 * and copy buttons for computers without a mail app.
 */

import { useState } from "react";
import { Check, Copy, ExternalLink, Mail, Send } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/site";

const ROLES = ["Direktorius(-ė)", "Pavaduotojas(-a) ugdymui", "Mokytojas(-a)", "IT specialistas(-ė)", "Kita"];
const SIZES = ["Iki 300 mokinių", "300–600 mokinių", "600–1000 mokinių", "Daugiau nei 1000 mokinių"];

type Letter = { subject: string; body: string };

/** Email text from the form fields; empty optional fields are left out. */
function compose(f: Record<string, string>): Letter {
  const line = (label: string, v: string) => (v.trim() ? [`${label}: ${v.trim()}`] : []);
  const body = [
    "Sveiki,",
    "",
    "norėtume pamatyti elektroninio dienyno su analitika demonstraciją.",
    "",
    ...line("Mokykla", f.school),
    ...line("Vardas, pavardė", f.name),
    ...line("Pareigos", f.role),
    ...line("El. paštas", f.email),
    ...line("Telefonas", f.phone),
    ...line("Mokinių skaičius", f.size),
    ...line("Patogus laikas", f.time),
    ...(f.message.trim() ? ["", f.message.trim()] : []),
    "",
    "Pagarbiai,",
    f.name.trim(),
  ].join("\r\n");
  return { subject: `Demonstracijos užsakymas – ${f.school.trim()}`, body };
}

const q = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");

export default function BookDemo() {
  const [f, setF] = useState({ school: "", name: "", role: "", email: "", phone: "", size: "", time: "", message: "" });
  const [letter, setLetter] = useState<Letter | null>(null);
  const [copied, setCopied] = useState<"" | "letter" | "email">("");

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = compose(f);
    setLetter(l);
    window.location.href = `mailto:${CONTACT_EMAIL}?${q({ subject: l.subject, body: l.body })}`;
  };

  const copy = async (what: "letter" | "email") => {
    try {
      await navigator.clipboard.writeText(what === "email" ? CONTACT_EMAIL : `Kam: ${CONTACT_EMAIL}\nTema: ${letter?.subject}\n\n${letter?.body.replace(/\r\n/g, "\n")}`);
      setCopied(what);
      setTimeout(() => setCopied(""), 1600);
    } catch {}
  };

  const input = "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 sm:text-sm";
  const label = "block text-sm font-semibold text-slate-800";

  if (letter) {
    return (
      <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200 sm:p-7" aria-live="polite">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600"><Check size={26} aria-hidden /></div>
        <h3 className="mt-4 text-xl font-extrabold text-slate-900">Laiškas paruoštas</h3>
        <p className="mt-2 text-slate-600 leading-relaxed">
          Atidarėme jūsų el. pašto programą su paruoštu laišku adresu <b className="text-slate-900">{CONTACT_EMAIL}</b> – belieka paspausti „Siųsti“. Atsakysime ir suderinsime demonstracijos laiką.
        </p>
        <p className="mt-5 text-sm font-semibold text-slate-800">Programa neatsidarė? Siųskite per naršyklę:</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <a
            href={`https://mail.google.com/mail/?${q({ view: "cm", fs: "1", to: CONTACT_EMAIL, su: letter.subject, body: letter.body })}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-800 hover:border-brand hover:text-brand"
          >
            Gmail <ExternalLink size={15} aria-hidden />
          </a>
          <a
            href={`https://outlook.office.com/mail/deeplink/compose?${q({ to: CONTACT_EMAIL, subject: letter.subject, body: letter.body })}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-800 hover:border-brand hover:text-brand"
          >
            Outlook <ExternalLink size={15} aria-hidden />
          </a>
          <button type="button" onClick={() => copy("letter")} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-800 hover:border-brand hover:text-brand sm:col-span-2">
            {copied === "letter" ? <Check size={15} className="text-green-600" aria-hidden /> : <Copy size={15} aria-hidden />}
            {copied === "letter" ? "Nukopijuota" : "Kopijuoti laišką"}
          </button>
        </div>
        <button type="button" onClick={() => setLetter(null)} className="mt-5 text-sm font-semibold text-brand hover:underline underline-offset-4">
          ← Taisyti duomenis
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="bd-school" className={label}>Mokykla *</label>
          <input id="bd-school" required maxLength={120} autoComplete="organization" value={f.school} onChange={set("school")} className={input} placeholder="Mokyklos pavadinimas" />
        </div>
        <div>
          <label htmlFor="bd-name" className={label}>Vardas, pavardė *</label>
          <input id="bd-name" required maxLength={80} autoComplete="name" value={f.name} onChange={set("name")} className={input} />
        </div>
        <div>
          <label htmlFor="bd-role" className={label}>Pareigos</label>
          <select id="bd-role" value={f.role} onChange={set("role")} className={input}>
            <option value="">Pasirinkite</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="bd-email" className={label}>El. paštas *</label>
          <input id="bd-email" type="email" required maxLength={100} autoComplete="email" value={f.email} onChange={set("email")} className={input} />
        </div>
        <div>
          <label htmlFor="bd-phone" className={label}>Telefonas</label>
          <input id="bd-phone" type="tel" maxLength={30} autoComplete="tel" value={f.phone} onChange={set("phone")} className={input} placeholder="+370" />
        </div>
        <div>
          <label htmlFor="bd-size" className={label}>Mokinių skaičius</label>
          <select id="bd-size" value={f.size} onChange={set("size")} className={input}>
            <option value="">Pasirinkite</option>
            {SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="bd-time" className={label}>Patogus laikas</label>
          <input id="bd-time" maxLength={80} value={f.time} onChange={set("time")} className={input} placeholder="Pvz., antradieniais po 14 val." />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="bd-message" className={label}>Klausimai ar pageidavimai</label>
          <textarea id="bd-message" rows={3} maxLength={1000} value={f.message} onChange={set("message")} className={input} placeholder="Ką norėtumėte pamatyti per demonstraciją?" />
        </div>
      </div>
      <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-lg font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-strong active:scale-[0.99] transition">
        <Send size={20} aria-hidden /> Užsakyti demonstraciją
      </button>
      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <Mail size={14} className="mt-0.5 shrink-0" aria-hidden />
        <span>
          Paspaudus atsidarys jūsų el. paštas su paruoštu laišku adresu{" "}
          <button type="button" onClick={() => copy("email")} className="font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-brand">
            {CONTACT_EMAIL}
          </button>
          {copied === "email" ? " (nukopijuota)" : ""}. Svetainėje duomenys nesaugomi.
        </span>
      </p>
    </form>
  );
}
