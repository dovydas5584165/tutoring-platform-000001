"use client";

/**
 * Teacher view of the /dienynas demo: the 8b maths gradebook with semester-grade forecasts, a card
 * for the selected student, what the class is missing (skills) and a question-by-question analysis
 * of the latest test.
 */

import { useState } from "react";
import { Info, Lightbulb, OctagonAlert, Send, TriangleAlert } from "lucide-react";
import { DEMO, TEACHER, WORK_TYPES, fmt, fmtDate, fmtPct, fmtSigned, plural, type Mark, type StudentRow } from "@/lib/dienynasDemo";
import { C, ChartCard, Columns, DataTable, HBars, Sparkline, Stat, TipBody, TipLayer, useTip } from "./charts";

const T = DEMO.teacher;
const numeric = (marks: Mark[]) => marks.filter((m): m is number => m !== "n");
const critical = T.students.filter((s) => s.risk === "critical").length;
const weakSkills = T.skills.filter((s) => s.weak);
const sat = T.lastKd.distribution.reduce((a, b) => a + b, 0);

export default function TeacherView() {
  const [filter, setFilter] = useState<"all" | "risk">("all");
  const [selected, setSelected] = useState("Matas P.");
  const student = T.students.find((s) => s.name === selected)!;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Klasės vidurkis" value={fmt(T.classAvg)} sub={`${plural(T.students.length, ["mokinys", "mokiniai", "mokinių"])} · ${plural(T.columns.length, ["darbas", "darbai", "darbų"])}`} />
        <Stat label="Prognozuojamas pusmečio vidurkis" value={fmt(T.predictedAvg)} delta={{ text: fmtSigned(T.predictedAvg - T.classAvg), good: T.predictedAvg >= T.classAvg }} sub="jei niekas nesikeis" />
        <Stat label="Rizikos grupėje" value={`${T.atRisk}`} sub={`iš jų ${critical} – gresia nepatenkinamas`} />
        <Stat label="Paskutinis kontrolinis" value={fmt(T.lastKd.avg)} delta={{ text: fmtSigned(T.lastKd.avg - T.lastKd.previousAvg), good: T.lastKd.avg >= T.lastKd.previousAvg }} sub="nei ankstesnių vidurkis" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <Gradebook filter={filter} setFilter={setFilter} selected={selected} onSelect={setSelected} />
        <StudentCard key={student.name} s={student} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          id="demo-skills"
          title="Ko trūksta klasei"
          sub="Surinkta taškų pagal temas visuose šio pusmečio darbuose. Siekiamas lygis – 60 %."
          table={<DataTable head={["Tema", "Surinkta taškų", "Būsena"]} rows={T.skills.map((s) => [s.name, fmtPct(s.score), s.weak ? "Reikia pakartoti" : "Gerai"])} />}
        >
          <HBars
            label="Temų įsisavinimas"
            target={0.6}
            rows={T.skills.map((s) => ({
              key: s.skill,
              label: s.name,
              value: s.score,
              valueLabel: fmtPct(s.score),
              emphasis: s.weak,
              aria: `${s.name}: ${fmtPct(s.score)}${s.weak ? ", žemiau siekiamo lygio" : ""}`,
              tip: <TipBody value={fmtPct(s.score)} label={s.name} lines={[s.weak ? "Žemiau 60 % lygio" : "Virš 60 % lygio"]} />,
            }))}
          />
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-block h-3 w-px bg-slate-500" aria-hidden /> siekiamas lygis (60 %)
          </p>
          <ul className="mt-4 space-y-2">
            {weakSkills.map((s) => (
              <li key={s.skill} className="flex gap-2.5 rounded-xl bg-orange-50 p-3 text-sm leading-relaxed text-slate-700">
                <Lightbulb size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden />
                <span><b className="text-slate-900">{s.name}.</b> {s.tip}</span>
              </li>
            ))}
          </ul>
        </ChartCard>

        <ChartCard
          id="demo-questions"
          title={`Kontrolinis „${T.lastKd.topic}“: užduočių analizė`}
          sub={`${fmtDate(T.lastKd.date)} · rašė ${sat} · vidurkis ${fmt(T.lastKd.avg)} (${fmtSigned(T.lastKd.avg - T.lastKd.previousAvg)} nei ankstesnių kontrolinių)`}
          table={
            <DataTable
              head={["Užduotis", "Surinkta taškų", "Skiriamoji geba"]}
              rows={T.questions.map((q) => [`${q.nr}. ${q.label}`, fmtPct(q.score), fmt(q.discrimination, 2)])}
            />
          }
        >
          <HBars
            label="Surinkta taškų pagal užduotis"
            rows={T.questions.map((q) => ({
              key: String(q.nr),
              label: (
                <span className="flex items-center gap-1">
                  <span className="tabular-nums text-slate-400">{q.nr}.</span>
                  <span className="min-w-0">{q.label}</span>
                  {q.unclear && <Info size={14} className="shrink-0 text-slate-500" aria-label="galbūt neaiški" />}
                </span>
              ),
              value: q.score,
              valueLabel: fmtPct(q.score),
              emphasis: q.hard,
              aria: `${q.nr} užduotis, ${q.label}: ${fmtPct(q.score)}`,
              tip: <TipBody value={fmtPct(q.score)} label={`${q.nr}. ${q.label}`} lines={[`Tema: ${q.skill.toLowerCase()}`, `Skiriamoji geba: ${fmt(q.discrimination, 2)}`]} />,
            }))}
          />
          <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
            {T.questions.filter((q) => q.hard).map((q) => (
              <li key={q.nr} className="flex gap-2.5">
                <TriangleAlert size={18} className="mt-0.5 shrink-0 text-orange-600" aria-hidden />
                <span><b className="text-slate-900">{q.nr} užduotis</b> – surinkta tik {fmtPct(q.score)} taškų. Verta pakartoti: {q.skill.toLowerCase()}.</span>
              </li>
            ))}
            {T.questions.filter((q) => q.unclear).map((q) => (
              <li key={q.nr} className="flex gap-2.5">
                <Info size={18} className="mt-0.5 shrink-0 text-slate-500" aria-hidden />
                <span>
                  <b className="text-slate-900">{q.nr} užduotis</b> neatskiria stipresnių mokinių nuo silpnesnių (skiriamoji geba {fmt(q.discrimination, 2)}):
                  ir stiprūs, ir silpni ją sprendė panašiai. Galbūt neaiški formuluotė – verta peržiūrėti.
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Pažymių pasiskirstymas</p>
          <Columns
            label="Kontrolinio pažymių pasiskirstymas"
            height={64}
            values={T.lastKd.distribution}
            labels={T.lastKd.distribution.map((_, i) => String(i + 1))}
            tips={T.lastKd.distribution.map((n, i) => <TipBody key={i} value={plural(n, ["mokinys", "mokiniai", "mokinių"])} label={`Pažymys ${i + 1}`} />)}
          />
        </ChartCard>
      </div>
    </div>
  );
}

/* ---------- gradebook ---------- */

function Gradebook({ filter, setFilter, selected, onSelect }: { filter: "all" | "risk"; setFilter: (f: "all" | "risk") => void; selected: string; onSelect: (n: string) => void }) {
  const { ref, tip, bind } = useTip();
  const rows = filter === "risk" ? T.students.filter((s) => s.risk) : T.students;
  const chip = (f: "all" | "risk", label: string) => (
    <button
      type="button"
      onClick={() => setFilter(f)}
      aria-pressed={filter === f}
      className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${filter === f ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
    >
      {label}
    </button>
  );

  return (
    <section ref={ref} id="demo-gradebook" className="relative min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 xl:flex xl:flex-col">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">Dienynas · {TEACHER.className} {TEACHER.subject.toLowerCase()}</h3>
          <p className="mt-1 text-sm text-slate-500">Spustelėkite mokinį – pamatysite jo kortelę.</p>
        </div>
        <div className="flex gap-2">
          {chip("all", `Visi (${T.students.length})`)}
          {chip("risk", `Rizikos grupė (${T.atRisk})`)}
        </div>
      </div>

      {/* on xl the table fills whatever height the student card gives the row */}
      <div className="xl:relative xl:min-h-[22rem] xl:flex-1">
      <div className="max-h-[26.5rem] overflow-auto rounded-xl border border-slate-200 xl:absolute xl:inset-0 xl:max-h-none">
        <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-xs text-slate-500">
              <th className="sticky top-0 left-0 z-20 border-b border-slate-200 bg-slate-50 px-2.5 py-2 text-left font-semibold">Mokinys</th>
              {T.columns.map((c, i) => (
                <th key={i} className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-0.5 py-2 text-[11px] font-medium">
                  <span
                    tabIndex={0}
                    {...bind(<TipBody value={`Vidurkis ${fmt(c.avg)}`} label={`${WORK_TYPES[c.type]} „${c.topic}“`} lines={[fmtDate(c.date), c.absent ? `Nebuvo: ${c.absent}` : "Rašė visi"]} />)}
                    className="flex cursor-default flex-col items-center gap-0.5 rounded outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <span className="tabular-nums">{c.date}</span>
                    <span className={`rounded px-1 text-[10px] font-bold leading-4 ${c.type === "KD" ? "bg-slate-800 text-white" : c.type === "SD" ? "bg-slate-200 text-slate-700" : "text-slate-500"}`}>{c.type}</span>
                  </span>
                </th>
              ))}
              <th className="sticky top-0 z-10 border-b border-l border-slate-200 bg-slate-50 px-2 py-2 font-semibold">Vid.</th>
              <th className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-2 py-2 font-semibold">
                <span
                  tabIndex={0}
                  {...bind(<TipBody value="Pusmečio prognozė" label="Tikėtinas pusmečio pažymys ir jo intervalas, jei mokinys toliau mokysis kaip dabar." />)}
                  className="inline-flex cursor-default items-center gap-1 rounded outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Prognozė <Info size={12} aria-hidden />
                </span>
              </th>
              <th className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-2 py-2 font-semibold">Eiga</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const sel = s.name === selected;
              const bg = sel ? "bg-brand-soft" : "bg-white group-hover:bg-slate-50";
              const g = numeric(s.marks);
              return (
                <tr
                  key={s.name}
                  onClick={() => onSelect(s.name)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(s.name); } }}
                  tabIndex={0}
                  aria-selected={sel}
                  data-student={s.name}
                  className="group cursor-pointer outline-none focus-visible:[&>td]:bg-brand-soft"
                >
                  <td className={`sticky left-0 z-[5] border-b border-slate-100 px-2.5 py-1.5 ${bg}`}>
                    <span className="flex items-center gap-1.5 whitespace-nowrap font-medium text-slate-900">
                      {s.name}
                      {s.risk === "critical" && <OctagonAlert size={15} className="text-red-600" aria-label="rizika: nepatenkinamas" />}
                      {s.risk === "warning" && <TriangleAlert size={15} className="text-amber-500" aria-label="rizika: pažymiai krenta" />}
                    </span>
                  </td>
                  {s.marks.map((m, i) => (
                    <td key={i} className={`border-b border-slate-100 px-0.5 py-1.5 text-center tabular-nums ${bg}`}>
                      {m === "n" ? (
                        <span className="text-slate-400" title="Nebuvo pamokoje">n</span>
                      ) : (
                        <span className={`inline-block min-w-6 rounded px-1 ${m <= 3 ? "bg-red-50 font-bold text-red-700" : T.columns[i].type === "KD" ? "font-semibold text-slate-900" : "text-slate-700"}`}>{m}</span>
                      )}
                    </td>
                  ))}
                  <td className={`border-b border-l border-slate-100 px-2 py-1.5 text-center font-semibold tabular-nums text-slate-900 ${bg}`}>{fmt(s.avg)}</td>
                  <td className={`border-b border-slate-100 px-2 py-1.5 text-center ${bg}`}><PredBadge s={s} /></td>
                  <td className={`border-b border-slate-100 px-2 py-1.5 ${bg}`}>
                    <Sparkline
                      width={56}
                      values={g}
                      accent={s.pred.slope <= -0.15 ? C.orange : s.pred.slope >= 0.15 ? C.blue : C.grayLine}
                      label={`${s.name} pažymių eiga: ${g.join(", ")}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="text-xs text-slate-500">
              <td className="sticky bottom-0 left-0 z-20 border-t border-slate-200 bg-slate-50 px-2.5 py-2 font-semibold">Klasės vid.</td>
              {T.columns.map((c, i) => <td key={i} className="sticky bottom-0 z-10 border-t border-slate-200 bg-slate-50 px-0.5 py-2 text-center tabular-nums">{fmt(c.avg)}</td>)}
              <td className="sticky bottom-0 z-10 border-t border-l border-slate-200 bg-slate-50 px-2 py-2 text-center font-semibold tabular-nums text-slate-700">{fmt(T.classAvg)}</td>
              <td className="sticky bottom-0 z-10 border-t border-slate-200 bg-slate-50 px-2 py-2 text-center tabular-nums">{fmt(T.predictedAvg)}</td>
              <td className="sticky bottom-0 z-10 border-t border-slate-200 bg-slate-50" />
            </tr>
          </tfoot>
        </table>
      </div>
      </div>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span><b className="text-slate-700">KD</b> kontrolinis</span>
        <span><b className="text-slate-700">SD</b> savarankiškas</span>
        <span><b className="text-slate-700">ND</b> namų darbai</span>
        <span><b className="text-slate-700">n</b> nebuvo</span>
        <span className="flex items-center gap-1"><TriangleAlert size={13} className="text-amber-500" aria-hidden /> pažymiai krenta</span>
        <span className="flex items-center gap-1"><OctagonAlert size={13} className="text-red-600" aria-hidden /> gresia nepatenkinamas</span>
      </p>
      <TipLayer tip={tip} />
    </section>
  );
}

function PredBadge({ s }: { s: StudentRow }) {
  const tone = s.risk === "critical" ? "bg-red-50 text-red-700" : s.risk === "warning" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-900";
  return (
    <span className={`inline-flex items-baseline gap-1 whitespace-nowrap rounded-md px-2 py-0.5 font-bold tabular-nums ${tone}`}>
      {s.pred.grade}
      {s.pred.low !== s.pred.high && <span className="text-[11px] font-medium opacity-75">{s.pred.low}–{s.pred.high}</span>}
    </span>
  );
}

/* ---------- student card ---------- */

function StudentCard({ s }: { s: StudentRow }) {
  const [sent, setSent] = useState(false);
  const g = numeric(s.marks);
  const classAt = T.columns.filter((_, i) => s.marks[i] !== "n").map((c) => c.avg);
  const initials = s.name.split(" ").map((w) => w[0]).join("");
  const weakest = s.skills.slice(0, 3);
  return (
    <aside id="demo-student" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft font-bold text-brand" aria-hidden>{initials}</div>
        <div className="min-w-0">
          <p className="font-bold leading-tight text-slate-900">{s.name}</p>
          <p className="text-sm text-slate-500">{TEACHER.className} · {TEACHER.subject}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Vidurkis</p>
          <p className="text-2xl font-bold text-slate-900">{fmt(s.avg)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Pusmečio prognozė</p>
          <p className="text-2xl font-bold text-slate-900">
            {s.pred.grade}
            {s.pred.low !== s.pred.high && <span className="ml-1 text-sm font-medium text-slate-500">({s.pred.low}–{s.pred.high})</span>}
          </p>
        </div>
      </div>

      {s.riskReason && (
        <p className={`mt-3 flex gap-2 rounded-xl px-3 py-2 text-sm leading-snug ${s.risk === "critical" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-900"}`}>
          {s.risk === "critical" ? <OctagonAlert size={17} className="mt-px shrink-0 text-red-600" aria-hidden /> : <TriangleAlert size={17} className="mt-px shrink-0 text-amber-500" aria-hidden />}
          {s.riskReason}
        </p>
      )}

      <p className="mt-4 mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Pažymių eiga</p>
      <Sparkline values={g} compare={classAt} width={250} height={54} strong accent={s.pred.slope <= -0.15 ? C.orange : C.blue} label={`${s.name} pažymiai: ${g.join(", ")}; pilka – klasės vidurkis`} />
      <p className="mt-1 text-xs text-slate-500">Pilka linija – klasės vidurkis.</p>

      <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Silpniausios temos</p>
      <ul className="space-y-2">
        {weakest.map((k) => (
          <li key={k.skill} className="text-sm">
            <span className="flex justify-between gap-2 text-slate-700"><span className="truncate">{k.name}</span><b className="tabular-nums text-slate-900">{fmtPct(k.score)}</b></span>
            <span className="mt-1 block h-1.5 rounded-full bg-slate-100">
              <span className="block h-full rounded-full" style={{ width: `${k.score * 100}%`, background: k.score < 0.6 ? C.orange : C.gray }} />
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex gap-2 text-sm leading-relaxed text-slate-600">
        <Lightbulb size={17} className="mt-0.5 shrink-0 text-brand" aria-hidden />
        <span>Pasiūlykite papildomų užduočių temai „{weakest[0].name.toLowerCase()}“{s.risk ? " ir aptarkite su tėvais" : ""}.</span>
      </p>
      <button
        type="button"
        onClick={() => setSent(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-800 hover:border-brand hover:text-brand"
      >
        <Send size={16} aria-hidden /> {sent ? "Demo: žinutė neišsiųsta" : "Parašyti tėvams"}
      </button>
    </aside>
  );
}
