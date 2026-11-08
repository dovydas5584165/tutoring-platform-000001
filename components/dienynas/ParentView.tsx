"use client";

/**
 * Parent view of the /dienynas demo: plain-language insights about one child, a card per subject
 * with the expected semester grade, the grade trend with a forecast, and a "what does it take to
 * get a 7?" calculator.
 */

import { useState } from "react";
import { CalendarDays, CircleCheck, OctagonAlert, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import {
  DEMO, WORK_TYPES, fmt, fmtDate, fmtPct, gradedPoints, mean, parentInsights, plural, predictTrack, requiredAverage, weekOf,
  type Prediction, type SubjectTrack,
} from "@/lib/dienynasDemo";
import { C, ChartCard, DataTable, LineLegend, Sparkline, TrendChart, type TrendPoint } from "./charts";

const P = DEMO.parent;
const INSIGHTS = parentInsights(P.subjects);
const SUMMARY = P.subjects.map((s) => {
  const grades = gradedPoints(s).map((p) => p.grade);
  return { s, grades, avg: mean(grades), classAvg: mean(s.marks.map((m) => m.classAvg)), pred: predictTrack(s) };
});
const firstName = P.child.name.split(" ")[0];
const MONTHS = [
  { t: 0, label: "rugsėjis" },
  { t: weekOf("10-01"), label: "spalis" },
  { t: weekOf("11-01"), label: "lapkritis" },
  { t: weekOf("12-01"), label: "gruodis" },
];

/** Status chip for a subject card. */
function status(x: (typeof SUMMARY)[number]) {
  if (x.pred.slope <= -0.15) return { Icon: TrendingDown, label: "Krenta", cls: "bg-amber-50 text-amber-900", icon: "text-amber-500" };
  if (x.s.missingHomework > 0) return { Icon: TriangleAlert, label: "Neatlikti ND", cls: "bg-amber-50 text-amber-900", icon: "text-amber-500" };
  if (x.pred.slope >= 0.15) return { Icon: TrendingUp, label: "Kyla", cls: "bg-green-50 text-green-800", icon: "text-green-600" };
  return { Icon: CircleCheck, label: "Stabilu", cls: "bg-slate-100 text-slate-700", icon: "text-green-600" };
}

export default function ParentView() {
  const [subject, setSubject] = useState("Matematika");
  const x = SUMMARY.find((r) => r.s.subject === subject)!;
  const overall = mean(SUMMARY.map((r) => r.avg));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg font-bold text-brand" aria-hidden>
            {P.child.name.split(" ").map((w) => w[0]).join("")}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight text-slate-900">{P.child.name}</p>
            <p className="text-sm text-slate-500">{P.child.className} klasė · I pusmetis</p>
          </div>
        </div>
        <dl className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:gap-6">
          {[
            ["Bendras vidurkis", fmt(overall)],
            ["Lankomumas", fmtPct(P.child.attendance, 1)],
            ["Praleista pamokų", `${P.child.missed} (${P.child.excused} pateis.)`],
          ].map(([l, v]) => (
            <div key={l} className="min-w-0">
              <dt className="text-xs text-slate-500">{l}</dt>
              <dd className="font-bold text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section id="demo-insights" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="font-bold text-slate-900">Ką verta žinoti šią savaitę</h3>
          <p className="mt-1 text-sm text-slate-500">Įžvalgos parašytos paprastai – be lentelių ir vidurkių skaičiavimo.</p>
          <ul className="mt-4 space-y-3">
            {INSIGHTS.map((i) => {
              const Icon = i.tone === "warning" ? TriangleAlert : i.tone === "good" ? CircleCheck : CalendarDays;
              const color = i.tone === "warning" ? "text-amber-500" : i.tone === "good" ? "text-green-600" : "text-brand";
              return (
                <li key={i.title} className="flex gap-3">
                  <Icon size={19} className={`mt-0.5 shrink-0 ${color}`} aria-hidden />
                  <div className="min-w-0 text-sm leading-relaxed">
                    <p className="font-semibold text-slate-900">{i.title}</p>
                    <p className="text-slate-600">{i.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <h3 className="font-bold text-slate-900">Dalykai</h3>
          <p className="mt-1 text-sm text-slate-500">Prognozė – tikėtinas pusmečio pažymys, jei mokymasis nesikeis. Spustelėkite dalyką.</p>
          <div id="demo-subjects" className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SUMMARY.map((r) => {
              const st = status(r);
              const sel = r.s.subject === subject;
              return (
                <button
                  key={r.s.subject}
                  type="button"
                  onClick={() => setSubject(r.s.subject)}
                  aria-pressed={sel}
                  data-subject={r.s.subject}
                  className={`rounded-xl border p-3 text-left transition-colors ${sel ? "border-brand bg-brand-soft" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-900">{r.s.subject}</span>
                      <span className="block truncate text-xs text-slate-500">{r.s.teacher}</span>
                    </span>
                    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>
                      <st.Icon size={12} className={st.icon} aria-hidden /> {st.label}
                    </span>
                  </span>
                  <span className="mt-2 flex items-end justify-between gap-2">
                    <span>
                      <span className="block text-xs text-slate-500">Vidurkis · prognozė</span>
                      <span className="block text-lg font-bold text-slate-900">
                        {fmt(r.avg)} <span className="text-slate-400">·</span> {r.pred.grade}
                        {r.pred.low !== r.pred.high && <span className="ml-1 text-xs font-medium text-slate-500">({r.pred.low}–{r.pred.high})</span>}
                      </span>
                    </span>
                    <Sparkline values={r.grades} accent={r.pred.slope <= -0.15 ? C.orange : C.blue} label={`${r.s.subject}: ${r.grades.join(", ")}`} />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <ChartCard
          id="demo-trend"
          title={`${x.s.subject}: pažymių eiga ir prognozė`}
          sub={`Vidurkis ${fmt(x.avg)}, klasės – ${fmt(x.classAvg)}. Prognozuojamas pusmečio pažymys – ${x.pred.grade}${x.pred.low !== x.pred.high ? ` (tikėtina ${x.pred.low}–${x.pred.high})` : ""}.`}
          table={
            <DataTable
              head={["Data", "Darbas", firstName, "Klasės vid."]}
              rows={[
                ...x.s.marks.map((m) => [m.date, `${m.type} „${m.topic}“`, m.grade === "n" ? "nebuvo" : m.grade, fmt(m.classAvg)]),
                ...x.s.planned.map((p, i) => [p.date, `${p.type} „${p.topic}“`, `≈ ${fmt(x.pred.future[i])}`, "–"]),
              ]}
            />
          }
        >
          <div className="mb-3">
            <LineLegend items={[{ label: firstName, color: C.blue }, { label: "Klasės vidurkis", color: C.grayLine }, { label: "Prognozė", color: C.blue, dashed: true }]} />
          </div>
          <TrendChart points={trendPoints(x.s, x.pred)} name={firstName} monthTicks={MONTHS} fmtValue={(v) => fmt(v)} />
        </ChartCard>

        <WhatIf key={x.s.subject} s={x.s} grades={x.grades} pred={x.pred} />
      </div>
    </div>
  );
}

function trendPoints(s: SubjectTrack, pred: Prediction): TrendPoint[] {
  const band = Math.max(0.6, pred.resid);
  return [
    ...s.marks.map((m) => ({
      t: weekOf(m.date),
      date: fmtDate(m.date),
      title: `${WORK_TYPES[m.type]} „${m.topic}“`,
      mine: m.grade === "n" ? null : m.grade,
      classAvg: m.classAvg,
    })),
    ...s.planned.map((p, i) => ({
      t: weekOf(p.date),
      date: fmtDate(p.date),
      title: `${WORK_TYPES[p.type]} „${p.topic}“`,
      mine: null,
      classAvg: null,
      forecast: pred.future[i],
      low: Math.max(1, pred.future[i] - band),
      high: Math.min(10, pred.future[i] + band),
    })),
  ];
}

/* ---------- what-if calculator ---------- */

function WhatIf({ s, grades, pred }: { s: SubjectTrack; grades: number[]; pred: Prediction }) {
  const [target, setTarget] = useState(Math.min(10, pred.grade + 1));
  const n = s.planned.length;
  const req = requiredAverage(grades, n, target);
  const and = (xs: number[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} ir ${xs[xs.length - 1]}` : String(xs[0]));

  return (
    <section id="demo-whatif" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="font-bold text-slate-900">Ko reikia norint gauti…</h3>
      <p className="mt-1 text-sm text-slate-500">{s.subject}: iki pusmečio pabaigos liko {plural(n, ["darbas", "darbai", "darbų"])}.</p>

      <div role="radiogroup" aria-label="Norimas pusmečio pažymys" className="mt-4 grid grid-cols-7 gap-1.5">
        {[4, 5, 6, 7, 8, 9, 10].map((g) => (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={target === g}
            data-target={g}
            onClick={() => setTarget(g)}
            className={`rounded-lg py-2 text-base font-bold tabular-nums transition-colors ${target === g ? "bg-brand text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4" aria-live="polite">
        {req.status === "possible" && (
          <>
            <p className="text-sm text-slate-600">Kad pusmečio pažymys būtų <b className="text-slate-900">{target}</b>, likusiuose darbuose reikia vidutiniškai</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">{fmt(Math.ceil(req.avg * 10 - 1e-9) / 10)}</p>
            <p className="mt-1 text-sm text-slate-600">Pavyzdžiui: {and(req.example)}.</p>
          </>
        )}
        {req.status === "secured" && (
          <p className="flex gap-2 text-sm leading-relaxed text-slate-700">
            <CircleCheck size={19} className="mt-0.5 shrink-0 text-green-600" aria-hidden />
            <span><b className="text-slate-900">{target}</b> jau užtikrintas – net jei likę darbai nepavyktų.</span>
          </p>
        )}
        {req.status === "impossible" && (
          <p className="flex gap-2 text-sm leading-relaxed text-slate-700">
            <OctagonAlert size={19} className="mt-0.5 shrink-0 text-red-600" aria-hidden />
            <span>Šį pusmetį <b className="text-slate-900">{target}</b> nebepasiekiamas: likusiuose darbuose reikėtų vidutiniškai {fmt(req.avg)} iš 10.</span>
          </p>
        )}
      </div>

      <ul className="mt-4 space-y-1.5 text-sm">
        {s.planned.map((p) => (
          <li key={p.date} className="flex justify-between gap-3">
            <span className="text-slate-700">{WORK_TYPES[p.type]} „{p.topic}“</span>
            <span className="shrink-0 text-slate-500">{fmtDate(p.date)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Dabar {plural(grades.length, ["pažymys", "pažymiai", "pažymių"])}, vidurkis {fmt(mean(grades))}. Pusmečio pažymys – visų pažymių vidurkis, nuo x,5 apvalinama į viršų.
      </p>
    </section>
  );
}
