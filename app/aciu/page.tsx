"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { CheckCircle2, Mail, CalendarCheck, Video } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import { subjectOf } from "@/lib/subjects";

type Summary = { subject: string; email: string; slots: string[]; updated: boolean };

function ThankYou() {
  const params = useSearchParams();
  const subject = params.get("dalykas") || "";
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem("tk-last-request") || "null");
      if (s?.slots) setSummary(s);
    } catch {}
  }, []);

  const steps = [
    { Icon: Mail, text: <>Patvirtinimą jau išsiuntėme{summary?.email ? <> į <b>{summary.email}</b></> : ""}. Nematote? Patikrinkite „Reklamos“ ar „Šlamšto“ aplanką.</> },
    { Icon: CalendarCheck, text: <>Kai mokytojas pasirinks vieną iš jūsų laikų, gausite laišką su jo kontaktais ir kvietimu į kalendorių.</> },
    { Icon: Video, text: <>Mokytojas atsiųs „Google Meet“ nuorodą ir susitars dėl pamokos detalių.</> },
  ];

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={44} />
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold">{summary?.updated ? "Užklausa atnaujinta!" : "Ačiū! Užklausa išsiųsta"}</h1>
      {subject && (
        <p className="mt-3 text-slate-600">
          Jūsų <b>{subjectOf(subject)}</b> pamokos laikus jau mato mūsų mokytojai.
        </p>
      )}

      <ol className="mt-10 space-y-3 text-left">
        {steps.map(({ Icon, text }, i) => (
          <li key={i} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#3B65CE] text-white flex items-center justify-center"><Icon size={20} /></div>
            <p className="text-slate-700 pt-2">{text}</p>
          </li>
        ))}
      </ol>

      {summary && summary.slots.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-semibold text-slate-700 mb-2">Jūsų pasirinkti laikai</p>
          <ul className="flex flex-wrap justify-center gap-2">
            {summary.slots.map((s) => (
              <li key={s} className="text-xs bg-blue-50 text-[#3B65CE] font-semibold px-3 py-1.5 rounded-full">
                {format(new Date(s), "MMMM d 'd.' (EEE) HH:mm", { locale: lt })}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/" className="px-6 py-3 rounded-xl bg-[#3B65CE] text-white font-semibold hover:bg-[#2f54b3]">Į pradžią</Link>
        {subject && (
          <Link href={`/schedule/${subject}`} className="px-6 py-3 rounded-xl border border-slate-300 font-semibold hover:bg-slate-50">
            Pakeisti laikus
          </Link>
        )}
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Klausimai? Rašykite <a href="mailto:info.tiksliukai@gmail.com" className="underline">info.tiksliukai@gmail.com</a>
      </p>
    </main>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <div className="flex-1">
        <Suspense fallback={null}>
          <ThankYou />
        </Suspense>
      </div>
      <SiteFooter />
    </div>
  );
}
