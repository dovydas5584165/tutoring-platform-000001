"use client";

import { useState } from "react";
import { ClipboardList, Copy, Check } from "lucide-react";
import { ADMIN_EMAIL, PLACEHOLDERS, templates } from "@/lib/tutorEmailTemplates";

const STEPS: { title: string; text: React.ReactNode }[] = [
  {
    title: "Pasirinkite pamoką",
    text: <>Skiltyje <b>„Mokinių užklausos“</b> paspauskite jums tinkamą laiką ir patvirtinkite. Mokinys automatiškai gaus laišką su jūsų kontaktais.</>,
  },
  {
    title: "Parašykite mokiniui per 24 val.",
    text: <>Išsiųskite laišką pagal <b>1 šabloną</b> su pamokos nuoroda. Visada pridėkite <b>CC: {ADMIN_EMAIL}</b>. Mygtukas „Rašyti mokiniui“ prie pamokos tai padaro už jus.</>,
  },
  {
    title: "Praveskite pamoką",
    text: <>Prisijunkite laiku. Jei mokinys vėluoja daugiau nei 10 min. ir nepranešė, galite atsijungti. Po pamokos <b>išrašykite sąskaitą</b> ir <b>pridėkite pažymį/pastabą</b> (mygtukai viršuje).</>,
  },
  {
    title: "Reikia atšaukti? Perkelkite",
    text: <>Ne vėliau kaip prieš 24 val. parašykite mokiniui pagal <b>2 šabloną</b>: paaiškinkite priežastį ir pasiūlykite 2–3 naujus laikus. CC: {ADMIN_EMAIL}.</>,
  },
  {
    title: "Nepavyksta perkelti? Administracija",
    text: <>Jei negalite pasiūlyti naujo laiko arba mokinys neatsako per 24 val., parašykite administracijai pagal <b>3 šabloną</b> į {ADMIN_EMAIL}. Pamoką perduosime kitam mokytojui.</>,
  },
];

/** Replaces the old "Kokybės rodikliai" block: how a lesson works + copyable email templates. */
export default function TutorWorkflowGuide() {
  const list = templates(PLACEHOLDERS);
  const [active, setActive] = useState(list[0].id);
  const [copied, setCopied] = useState(false);
  const t = list.find((x) => x.id === active)!;

  const copy = async () => {
    const text = `${t.to === "admin" ? `Kam: ${ADMIN_EMAIL}` : `Kam: [mokinio el. paštas]\nCC: ${ADMIN_EMAIL}`}\nTema: ${t.subject}\n\n${t.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      alert("Nepavyko nukopijuoti – pažymėkite tekstą ir nukopijuokite ranka.");
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6 border-b pb-3 flex items-center gap-2">
        <ClipboardList className="text-[#3B65CE]" /> Darbo tvarka
      </h2>

      <ol className="grid gap-4 md:grid-cols-5 mb-8">
        {STEPS.map((s, i) => (
          <li key={s.title} className="bg-gray-50 rounded-lg p-4">
            <div className="w-8 h-8 rounded-full bg-[#3B65CE] text-white font-bold flex items-center justify-center mb-2">{i + 1}</div>
            <p className="font-semibold mb-1">{s.title}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{s.text}</p>
          </li>
        ))}
      </ol>

      <h3 className="text-lg font-semibold mb-3">Laiškų šablonai</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {list.map((x) => (
          <button
            key={x.id}
            onClick={() => setActive(x.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
              x.id === active ? "bg-[#3B65CE] text-white border-[#3B65CE]" : "border-gray-300 hover:border-[#3B65CE]"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-gray-50">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-sm">
          <div className="text-gray-600">
            <b>Kam:</b> {t.to === "admin" ? ADMIN_EMAIL : "mokinio el. paštas"}
            {t.to === "student" && <> · <b>CC:</b> {ADMIN_EMAIL}</>}
            <br />
            <b>Tema:</b> {t.subject}
          </div>
          <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border hover:border-[#3B65CE]">
            {copied ? <><Check size={14} className="text-green-600" /> Nukopijuota</> : <><Copy size={14} /> Kopijuoti</>}
          </button>
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 p-4 leading-relaxed">{t.body}</pre>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Laukus [laužtiniuose skliaustuose] pakeiskite savo informacija. Prie kiekvienos suderintos pamokos rasite mygtukus, kurie atidaro jau užpildytą laišką.
      </p>
    </section>
  );
}
