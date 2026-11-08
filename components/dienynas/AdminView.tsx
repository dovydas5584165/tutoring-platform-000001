"use client";

/**
 * Administration view of the /dienynas demo: whole-school KPIs, which teachers grade more strictly
 * or leniently than their students' results predict, same-topic tests across parallel classes, and
 * a class × subject heatmap.
 */

import { useState } from "react";
import { DEMO, SUBJECTS, CLASSES, fmt, fmtDate, fmtPct, fmtSigned, plural, type TeacherStat } from "@/lib/dienynasDemo";
import { C, ChartCard, DataTable, DivergingBars, DivergingLegend, Dumbbell, Heatmap, Stat, TipBody } from "./charts";

const A = DEMO.admin;

/** Teacher of a class in a subject (for the heatmap tooltip). */
const teacherOf = (cls: string, subject: string) => A.teachers.find((t) => t.subject === subject && t.classes.includes(cls))?.name;

/** Maths teachers, most lenient first (A.teachers is sorted by deviation). */
const math = A.teachers.filter((t) => t.subject === "Matematika");

/** The same-topic test pair whose gap the students' results explain least. */
const story = A.sharedTopics
  .filter((g) => g.rows.length === 2 && g.rows[0].teacher !== g.rows[1].teacher)
  .map((g) => ({ ...g, gap: Math.abs(g.rows[0].dev - g.rows[1].dev) }))
  .sort((a, b) => b.gap - a.gap)[0];

export default function AdminView() {
  const [sel, setSel] = useState(A.teachers[0].name);
  const t = A.teachers.find((x) => x.name === sel)!;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Mokyklos vidurkis" value={fmt(A.schoolAvg)} sub={`${plural(CLASSES.length, ["klasė", "klasės", "klasių"])} · ${plural(A.students, ["mokinys", "mokiniai", "mokinių"])}`} />
        <Stat label="Rizikos grupėje" value={`${A.atRisk}`} sub={`${fmtPct(A.atRisk / A.students)} mokinių`} />
        <Stat label="Lankomumas" value={fmtPct(A.attendance, 1)} sub="šį pusmetį" />
        <Stat label="Vertinimas nukrypsta" value={`${A.flagged} iš ${A.teachers.length}`} sub="mokytojų (0,5 balo ir daugiau)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <ChartCard
          id="demo-teachers"
          title="Ar visi mokytojai vertina vienodai?"
          sub="Kiek mokytojo rašomų pažymių vidurkis skiriasi nuo to, ko tikėtumėmės iš tų pačių mokinių pagal jų kitų dalykų ir NMPP rezultatus."
          table={
            <DataTable
              head={["Mokytojas", "Dalykas", "Vidurkis", "Lūkestis", "Skirtumas"]}
              rows={A.teachers.map((x) => [x.name, x.subject, fmt(x.avg), fmt(x.expected), fmtSigned(x.dev)])}
            />
          }
        >
          <DivergingBars
            label="Mokytojų pažymių nuokrypis nuo lūkesčio"
            rows={A.teachers.map((x) => ({
              key: x.name,
              label: x.name,
              sub: `${x.subject} · ${x.classes.length > 4 ? "visos klasės" : x.classes.join(", ")}`,
              value: x.dev,
              valueLabel: fmtSigned(x.dev),
              aria: `${x.name}, ${x.subject}: ${fmtSigned(x.dev)} balo nuo lūkesčio`,
              tip: <TipBody value={`${fmtSigned(x.dev)} balo`} label={`${x.name} · ${x.subject}`} lines={[`Vidurkis ${fmt(x.avg)}, lūkestis ${fmt(x.expected)}`, `${plural(x.tests.length, ["darbas", "darbai", "darbų"])}`]} />,
            }))}
            extent={1.2}
            neutral={0.3}
            selected={sel}
            onSelect={setSel}
            leftLabel="Griežčiau"
            rightLabel="Palankiau"
            ticks={[-1, -0.5, 0, 0.5, 1]}
            fmtTick={(v) => (v === 0 ? "0" : fmtSigned(v))}
          />
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Pilka – skirtumas mažesnis nei 0,3 balo. Spustelėkite mokytoją – dešinėje matysite jo darbus.
          </p>
        </ChartCard>

        <TeacherDetail t={t} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          id="demo-shared"
          title="Ta pati tema – skirtingi rezultatai"
          sub="Matematikos kontroliniai ta pačia tema paraleliose klasėse."
          table={
            <DataTable
              head={["Klasė", "Mokytojas", "Tema", "Vidurkis", "Lūkestis"]}
              rows={A.sharedTopics.flatMap((g) => g.rows.map((r) => [r.cls, r.teacher, g.topic, fmt(r.avg), fmt(r.expected)]))}
            />
          }
        >
          <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-slate-500 bg-white" aria-hidden /> Lūkestis pagal mokinių pasiekimus</li>
            <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: C.blue }} aria-hidden /> Vidurkis aukštesnis</li>
            <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: C.orange }} aria-hidden /> Vidurkis žemesnis</li>
          </ul>
          <Dumbbell
            label="Tos pačios temos kontrolinių vidurkiai ir lūkesčiai"
            domain={[5.5, 8.5]}
            ticks={[6, 7, 8]}
            fmtTick={(v) => String(v)}
            groups={A.sharedTopics.map((g) => ({
              title: `${g.grade} klasės · „${g.topic}“`,
              rows: g.rows.map((r) => ({
                key: r.cls,
                label: r.cls,
                sub: r.teacher,
                expected: r.expected,
                actual: r.avg,
                actualLabel: fmt(r.avg),
                aria: `${r.cls}, ${r.teacher}: vidurkis ${fmt(r.avg)}, lūkestis ${fmt(r.expected)}`,
                tip: <TipBody value={`Vidurkis ${fmt(r.avg)}`} label={`${r.cls} · ${r.teacher}`} lines={[`Lūkestis ${fmt(r.expected)} (${fmtSigned(r.dev)})`]} />,
              })),
            }))}
          />
          {story && (
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
              <b className="text-slate-900">{story.grade} klasės, „{story.topic}“:</b> {story.rows[0].cls} vidurkis {fmt(story.rows[0].avg)}, {story.rows[1].cls} – {fmt(story.rows[1].avg)}.
              Pagal mokinių pasiekimus tikėtumėmės {fmt(story.rows[0].expected)} ir {fmt(story.rows[1].expected)}, tad skirtumo nepaaiškina mokiniai –
              verta palyginti abu kontrolinius ir vertinimo kriterijus.
            </p>
          )}
        </ChartCard>

        <ChartCard
          id="demo-heatmap"
          title="Klasių ir dalykų vidurkiai"
          sub={`Spalva – skirtumas nuo mokyklos vidurkio (${fmt(A.schoolAvg)}).`}
          table={
            <DataTable head={["Klasė", ...SUBJECTS]} rows={A.heat.map((h) => [h.cls, ...h.values.map((v) => fmt(v))])} />
          }
        >
          <Heatmap
            label="Klasių ir dalykų vidurkiai"
            cols={[...SUBJECTS]}
            short={["Liet.", "Mat.", "Angl.", "Ist.", "Gamt.", "Inf."]}
            rows={A.heat.map((h) => ({ key: h.cls, label: h.cls, values: h.values }))}
            center={A.schoolAvg}
            fmtValue={(v) => fmt(v)}
            tipFor={(cls, subject, v) => (
              <TipBody value={fmt(v)} label={`${cls} · ${subject}`} lines={[`${fmtSigned(v - A.schoolAvg)} nuo mokyklos vidurkio`, `Mokytojas: ${teacherOf(cls, subject) ?? "–"}`]} />
            )}
          />
          <div className="mt-3">
            <DivergingLegend left="Žemiau vidurkio" right="Aukščiau" />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Matematikos stulpelis margas: aukščiausi vidurkiai ten, kur dėsto {math[0].name}, žemiausi – kur {math[math.length - 1].name}.
            Tai ne klasių, o vertinimo skirtumas (žr. „Ta pati tema – skirtingi rezultatai“).
          </p>
        </ChartCard>
      </div>
    </div>
  );
}

function TeacherDetail({ t }: { t: TeacherStat }) {
  const tests = [...t.tests].sort((a, b) => Math.abs(b.dev) - Math.abs(a.dev)).slice(0, 6);
  const verdict =
    t.dev >= 0.5
      ? `Pažymiai vidutiniškai ${fmt(t.dev)} balo aukštesni, nei tikėtųsi pagal mokinių pasiekimus. Testai gali būti lengvesni arba vertinimas – palankesnis.`
      : t.dev <= -0.5
        ? `Pažymiai vidutiniškai ${fmt(-t.dev)} balo žemesni, nei tikėtųsi pagal mokinių pasiekimus. Testai gali būti sunkesni arba vertinimas – griežtesnis.`
        : "Pažymiai atitinka mokinių pasiekimus – vertinimas nuoseklus.";
  return (
    <ChartCard
      id="demo-teacher-detail"
      title={t.name}
      sub={`${t.subject} · ${t.classes.length > 4 ? "visos klasės" : t.classes.join(", ")} · ${plural(t.tests.length, ["darbas", "darbai", "darbų"])}`}
      table={<DataTable head={["Darbas", "Klasė", "Vidurkis", "Lūkestis", "Skirtumas"]} rows={t.tests.map((x) => [x.title, x.cls, fmt(x.avg), fmt(x.expected), fmtSigned(x.dev)])} />}
    >
      <div className="grid grid-cols-3 gap-2">
        {[
          ["Vidurkis", fmt(t.avg)],
          ["Lūkestis", fmt(t.expected)],
          ["Skirtumas", fmtSigned(t.dev)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{l}</p>
            <p className="text-xl font-bold text-slate-900">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{verdict}</p>
      <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t.tests.length > tests.length ? `Labiausiai nukrypę ${tests.length} darbai iš ${t.tests.length}` : "Darbai"}
      </p>
      <DivergingBars
        label={`${t.name} darbų nuokrypis nuo lūkesčio`}
        rows={tests.map((x) => ({
          key: `${x.cls}-${x.title}`,
          label: x.title,
          sub: `${x.cls} · ${fmtDate(x.date)}`,
          value: x.dev,
          valueLabel: fmtSigned(x.dev),
          aria: `${x.title}, ${x.cls}: vidurkis ${fmt(x.avg)}, lūkestis ${fmt(x.expected)}`,
          tip: <TipBody value={`Vidurkis ${fmt(x.avg)}`} label={`${x.title} · ${x.cls}`} lines={[`Lūkestis ${fmt(x.expected)} (${fmtSigned(x.dev)})`]} />,
        }))}
        extent={1.6}
        leftLabel="Sunkesnis"
        rightLabel="Lengvesnis"
        ticks={[-1.5, 0, 1.5]}
        fmtTick={(v) => (v === 0 ? "0" : fmtSigned(v))}
      />
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Rodoma administracijai ir pačiam mokytojui – kaip pagrindas pokalbiui apie vienodus vertinimo kriterijus.
      </p>
    </ChartCard>
  );
}
