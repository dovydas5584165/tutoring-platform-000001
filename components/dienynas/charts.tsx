"use client";

/**
 * Small hand-made charts for the /dienynas demo: horizontal bars, columns, diverging bars, dumbbells,
 * heatmap, line chart with forecast, sparkline, stat tile, and a card with a table-view toggle.
 * One colour rule across the page: blue = above expectation, orange = below / needs attention,
 * grey = context. Every value a tooltip shows is also in the card's table view.
 */

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { ChartColumn, Table2 } from "lucide-react";

export const C = {
  blue: "#3b65ce",
  orange: "#eb6834",
  gray: "#cbd5e1",
  grayLine: "#94a3b8",
  grid: "#e2e8f0",
  axis: "#cbd5e1",
  ink: "#0f172a",
  critical: "#d03b3b",
  warning: "#fab219",
  good: "#0ca30c",
};

/** Diverging steps (OKLCH L 0.90 / 0.76 / 0.58) around a slate midpoint; deepest step takes white text. */
const DIV = {
  below: ["#fcd4c6", "#eb9a7c", "#cb4b0c"],
  above: ["#cedeff", "#8fb0f6", "#4773dd"],
  mid: "#f1f5f9",
};

/** Fill + text colour for a deviation from a baseline (heatmap cells, legend). */
export function divergingColor(d: number) {
  const a = Math.abs(d);
  const step = a < 0.25 ? -1 : a < 0.6 ? 0 : a < 1 ? 1 : 2;
  if (step < 0) return { bg: DIV.mid, fg: C.ink };
  return { bg: (d < 0 ? DIV.below : DIV.above)[step], fg: step === 2 ? "#ffffff" : C.ink };
}

/* ========================= tooltip ========================= */

type Tip = { x: number; y: number; below: boolean; content: ReactNode } | null;

/** Tooltip anchored to the hovered or focused mark, positioned inside `ref`'s box. */
export function useTip() {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip>(null);
  const show = (el: Element, content: ReactNode) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const r = el.getBoundingClientRect();
    const x = Math.max(Math.min(r.left + r.width / 2 - box.left, box.width - 100), Math.min(100, box.width / 2));
    const below = r.top - box.top < 64;
    setTip({ x, y: below ? r.bottom - box.top : r.top - box.top, below, content });
  };
  const hide = () => setTip(null);
  /** Spread onto a mark: hover and keyboard focus show the same details. */
  const bind = (content: ReactNode) => ({
    onPointerEnter: (e: React.PointerEvent) => show(e.currentTarget, content),
    onPointerLeave: hide,
    onFocus: (e: React.FocusEvent) => show(e.currentTarget, content),
    onBlur: hide,
  });
  return { ref, tip, show, hide, bind };
}

export function TipLayer({ tip }: { tip: Tip }) {
  if (!tip) return null;
  return (
    <div
      role="tooltip"
      className={`pointer-events-none absolute z-30 w-max max-w-[16rem] -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs leading-relaxed text-slate-300 shadow-xl ${
        tip.below ? "mt-2" : "-mt-2 -translate-y-full"
      }`}
      style={{ left: tip.x, top: tip.y }}
    >
      {tip.content}
    </div>
  );
}

/** Tooltip body: value first (bold, white), then the label and details. */
export function TipBody({ value, label, lines }: { value: ReactNode; label: ReactNode; lines?: ReactNode[] }) {
  return (
    <>
      <span className="block text-sm font-bold text-white tabular-nums">{value}</span>
      <span className="block">{label}</span>
      {lines?.map((l, i) => <span key={i} className="block">{l}</span>)}
    </>
  );
}

/* ========================= card + table view ========================= */

export function ChartCard({
  title, sub, table, action, children, className = "", id,
}: {
  title: ReactNode;
  sub?: ReactNode;
  table?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const [asTable, setAsTable] = useState(false);
  return (
    <section id={id} className={`min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 ${className}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold leading-snug text-slate-900 text-pretty">{title}</h3>
          {sub && <p className="mt-1 text-sm leading-relaxed text-slate-500 text-pretty">{sub}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          {table && (
            <button
              type="button"
              onClick={() => setAsTable(!asTable)}
              aria-pressed={asTable}
              title={asTable ? "Rodyti grafiką" : "Rodyti lentelę"}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              {asTable ? <ChartColumn size={16} /> : <Table2 size={16} />}
              <span className="sr-only">{asTable ? "Rodyti grafiką" : "Rodyti lentelę"}</span>
            </button>
          )}
        </div>
      </header>
      {asTable ? <div className="overflow-x-auto">{table}</div> : children}
    </section>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          {head.map((h, i) => (
            <th key={h} className={`border-b border-slate-200 py-2 pr-3 font-semibold text-slate-500 ${i ? "text-right" : "text-left"}`}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-slate-100 last:border-0">
            {r.map((c, j) => (
              <td key={j} className={`py-2 pr-3 ${j ? "text-right tabular-nums" : "text-left"}`}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ========================= stat tile ========================= */

export function Stat({ label, value, sub, delta }: { label: string; value: ReactNode; sub?: ReactNode; delta?: { text: string; good: boolean | null } }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500 leading-snug">{label}</p>
      <p className="mt-1 text-[1.75rem] font-bold leading-tight text-slate-900">{value}</p>
      {(delta || sub) && (
        <p className="mt-1 text-xs leading-snug text-slate-500">
          {delta && (
            <span className={`font-semibold ${delta.good === null ? "text-slate-600" : delta.good ? "text-green-700" : "text-red-700"}`}>{delta.text} </span>
          )}
          {sub}
        </p>
      )}
    </div>
  );
}

/* ========================= horizontal bars ========================= */

export type HBarRow = { key: string; label: ReactNode; value: number; valueLabel: string; emphasis: boolean; tip: ReactNode; aria: string };

/** One bar per row, 0 → `max`; emphasised rows in orange, the rest grey; optional target tick. */
export function HBars({ rows, max = 1, target, label }: { rows: HBarRow[]; max?: number; target?: number; label: string }) {
  const { ref, tip, bind } = useTip();
  return (
    <div ref={ref} className="relative" role="group" aria-label={label}>
      <div className="grid grid-cols-1 items-center gap-y-2 sm:grid-cols-[minmax(6.5rem,11.5rem)_minmax(0,1fr)] sm:gap-x-3 sm:gap-y-1.5">
        {rows.map((r) => {
          const w = Math.max(0, Math.min(1, r.value / max)) * 100;
          return (
            <div key={r.key} className="sm:contents">
              <div className="text-sm leading-tight text-slate-700">{r.label}</div>
              <div tabIndex={0} aria-label={r.aria} {...bind(r.tip)} className="group relative h-7 cursor-default rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand">
                <div className="absolute inset-y-[7px] left-0 right-11">
                  <div
                    className="h-full rounded-r-[4px] transition-[filter] duration-150 group-hover:brightness-110"
                    style={{ width: `${w}%`, background: r.emphasis ? C.orange : C.gray }}
                  />
                  {target != null && <div className="absolute -inset-y-[5px] w-px bg-slate-500" style={{ left: `${(target / max) * 100}%` }} />}
                  <span className="absolute top-1/2 ml-1 -translate-y-1/2 rounded bg-white px-0.5 text-xs font-semibold tabular-nums text-slate-700" style={{ left: `${w}%` }}>
                    {r.valueLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <TipLayer tip={tip} />
    </div>
  );
}

/* ========================= columns ========================= */

/** Vertical columns with the value on the cap (zero columns stay empty). */
export function Columns({ values, labels, tips, height = 96, label }: { values: number[]; labels: string[]; tips: ReactNode[]; height?: number; label: string }) {
  const { ref, tip, bind } = useTip();
  const max = Math.max(1, ...values);
  return (
    <div ref={ref} className="relative" role="group" aria-label={label}>
      <div className="flex items-end gap-1 border-b border-slate-300" style={{ height: height + 18 }}>
        {values.map((v, i) => (
          <div key={i} tabIndex={0} {...bind(tips[i])} aria-label={`${labels[i]}: ${v}`} className="group flex h-full flex-1 flex-col items-center justify-end rounded-t-md outline-none focus-visible:ring-2 focus-visible:ring-brand">
            {v > 0 && <span className="mb-1 text-[11px] font-semibold tabular-nums text-slate-600">{v}</span>}
            <div className="w-full max-w-6 rounded-t-[4px] transition-[filter] group-hover:brightness-110" style={{ height: (v / max) * height, background: C.blue }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1">
        {labels.map((l) => <span key={l} className="flex-1 text-center text-[11px] tabular-nums text-slate-500">{l}</span>)}
      </div>
      <TipLayer tip={tip} />
    </div>
  );
}

/* ========================= diverging bars ========================= */

export type DivRow = { key: string; label: ReactNode; sub?: ReactNode; value: number; valueLabel: string; tip: ReactNode; aria: string };

/** Bars left (orange) or right (blue) of zero; |value| below `neutral` stays grey. Rows are selectable. */
export function DivergingBars({
  rows, extent, neutral = 0.3, selected, onSelect, leftLabel, rightLabel, ticks, fmtTick, label,
}: {
  rows: DivRow[];
  extent: number;
  neutral?: number;
  selected?: string;
  onSelect?: (key: string) => void;
  leftLabel: string;
  rightLabel: string;
  ticks: number[];
  fmtTick: (t: number) => string;
  label: string;
}) {
  const { ref, tip, bind } = useTip();
  const pos = (v: number) => 50 + (Math.max(-extent, Math.min(extent, v)) / extent) * 50;
  const row = "grid grid-cols-1 gap-x-3 sm:grid-cols-[minmax(7.5rem,12rem)_minmax(0,1fr)]";
  return (
    <div ref={ref} className="relative" role="group" aria-label={label}>
      <div className="flex flex-col">
        <div className={row}>
          <div className="hidden sm:block" />
          <div className="mx-2 mb-1 flex justify-between gap-2 text-[11px] font-medium text-slate-500 sm:ml-0">
            <span>← {leftLabel}</span>
            <span className="text-right">{rightLabel} →</span>
          </div>
        </div>
        {rows.map((r) => {
          const color = Math.abs(r.value) < neutral ? C.grayLine : r.value < 0 ? C.orange : C.blue;
          const a = pos(Math.min(0, r.value)), b = pos(Math.max(0, r.value));
          const isSel = selected === r.key;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => onSelect?.(r.key)}
              aria-pressed={onSelect ? isSel : undefined}
              aria-label={r.aria}
              {...bind(r.tip)}
              className={`group ${row} items-center rounded-lg py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                isSel ? "bg-brand-soft" : onSelect ? "hover:bg-slate-50" : ""
              }`}
            >
              <span className="min-w-0 pl-2">
                <span className={`block truncate text-sm leading-tight ${isSel ? "font-semibold text-slate-900" : "text-slate-700"}`}>{r.label}</span>
                {r.sub && <span className="block truncate text-xs text-slate-500">{r.sub}</span>}
              </span>
              <span className="relative mx-2 block h-7 sm:ml-0">
                <span className="absolute inset-y-0 left-1/2 w-px bg-slate-400" />
                <span
                  className={`absolute top-[7px] bottom-[7px] transition-[filter] group-hover:brightness-110 ${r.value < 0 ? "rounded-l-[4px]" : "rounded-r-[4px]"}`}
                  style={{ left: `${a}%`, width: `${Math.max(b - a, 0.6)}%`, background: color }}
                />
                <span
                  className={`absolute top-1/2 -translate-y-1/2 text-xs font-semibold tabular-nums text-slate-700 ${r.value < 0 ? "-translate-x-full pr-1.5" : "pl-1.5"}`}
                  style={{ left: `${r.value < 0 ? a : b}%` }}
                >
                  {r.valueLabel}
                </span>
              </span>
            </button>
          );
        })}
        <div className={row}>
          <div className="hidden sm:block" />
          <div className="relative mx-2 mt-1 h-4 border-t border-slate-300 sm:ml-0">
            {ticks.map((t) => (
              <span key={t} className="absolute -translate-x-1/2 pt-0.5 text-[11px] tabular-nums text-slate-500" style={{ left: `${pos(t)}%` }}>
                {fmtTick(t)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <TipLayer tip={tip} />
    </div>
  );
}

/* ========================= dumbbell ========================= */

export type DumbbellRow = { key: string; label: ReactNode; sub?: ReactNode; expected: number; actual: number; actualLabel: string; tip: ReactNode; aria: string };

/** Expected (hollow) → actual (filled: blue above, orange below) on one scale, grouped. */
export function Dumbbell({ groups, domain, ticks, fmtTick, label }: { groups: { title: string; rows: DumbbellRow[] }[]; domain: [number, number]; ticks: number[]; fmtTick: (t: number) => string; label: string }) {
  const { ref, tip, bind } = useTip();
  const x = (v: number) => ((Math.max(domain[0], Math.min(domain[1], v)) - domain[0]) / (domain[1] - domain[0])) * 100;
  const row = "grid grid-cols-1 gap-x-3 sm:grid-cols-[minmax(7rem,11rem)_minmax(0,1fr)]";
  return (
    <div ref={ref} className="relative" role="group" aria-label={label}>
      <div className="flex flex-col">
        {groups.map((g, gi) => (
          <Fragment key={g.title}>
            <p className={`${gi ? "mt-3" : ""} mb-1 pl-2 text-xs font-semibold uppercase tracking-wide text-slate-500`}>{g.title}</p>
            {g.rows.map((r) => {
              const lo = Math.min(x(r.expected), x(r.actual)), hi = Math.max(x(r.expected), x(r.actual));
              const up = r.actual >= r.expected;
              return (
                <div key={r.key} tabIndex={0} aria-label={r.aria} {...bind(r.tip)} className={`${row} items-center rounded-lg py-0.5 outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand`}>
                  <span className="min-w-0 pl-2">
                    <span className="block truncate text-sm leading-tight text-slate-700">{r.label}</span>
                    {r.sub && <span className="block truncate text-xs text-slate-500">{r.sub}</span>}
                  </span>
                  <span className="relative ml-4 mr-10 block h-8 sm:ml-0">
                    {ticks.map((t) => <span key={t} className="absolute inset-y-0 w-px bg-slate-100" style={{ left: `${x(t)}%` }} />)}
                    <span className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-slate-300" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
                    <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-500 bg-white" style={{ left: `${x(r.expected)}%` }} />
                    <span
                      className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
                      style={{ left: `${x(r.actual)}%`, background: up ? C.blue : C.orange }}
                    />
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 text-xs font-semibold tabular-nums text-slate-700 ${up ? "pl-3" : "-translate-x-full pr-3"}`}
                      style={{ left: `${x(r.actual)}%` }}
                    >
                      {r.actualLabel}
                    </span>
                  </span>
                </div>
              );
            })}
          </Fragment>
        ))}
        <div className={row}>
          <div className="hidden sm:block" />
          <div className="relative ml-4 mr-10 mt-1 h-4 border-t border-slate-300 sm:ml-0">
            {ticks.map((t) => (
              <span key={t} className="absolute -translate-x-1/2 pt-0.5 text-[11px] tabular-nums text-slate-500" style={{ left: `${x(t)}%` }}>{fmtTick(t)}</span>
            ))}
          </div>
        </div>
      </div>
      <TipLayer tip={tip} />
    </div>
  );
}

/* ========================= heatmap ========================= */

/** Rows × columns of values, coloured by deviation from `center`, value printed in each cell. */
export function Heatmap({
  cols, short, rows, center, fmtValue, tipFor, label,
}: {
  cols: string[];
  /** Column labels for phones. */
  short?: string[];
  rows: { key: string; label: string; values: number[] }[];
  center: number;
  fmtValue: (v: number) => string;
  tipFor: (row: string, col: string, v: number) => ReactNode;
  label: string;
}) {
  const { ref, tip, bind } = useTip();
  return (
    <div ref={ref} className="relative" role="group" aria-label={label}>
      <div className="overflow-x-auto">
        <div className="grid min-w-[17rem] gap-0.5" style={{ gridTemplateColumns: `2.25rem repeat(${cols.length}, minmax(2.25rem, 1fr))` }}>
          <div />
          {cols.map((c, i) => (
            <div key={c} className="pb-1 text-center text-[11px] font-medium leading-tight text-slate-500">
              {short ? <><span className="sm:hidden">{short[i]}</span><span className="hidden sm:inline">{c}</span></> : c}
            </div>
          ))}
          {rows.map((r) => (
            <Fragment key={r.key}>
              <div className="flex items-center text-sm font-semibold text-slate-700">{r.label}</div>
              {r.values.map((v, i) => {
                const { bg, fg } = divergingColor(v - center);
                return (
                  <div
                    key={cols[i]}
                    tabIndex={0}
                    aria-label={`${r.label}, ${cols[i]}: ${fmtValue(v)}`}
                    {...bind(tipFor(r.label, cols[i], v))}
                    className="flex h-9 items-center justify-center rounded-[4px] text-xs font-semibold tabular-nums outline-none transition hover:brightness-105 hover:ring-2 hover:ring-slate-900/70 focus-visible:ring-2 focus-visible:ring-slate-900"
                    style={{ background: bg, color: fg }}
                  >
                    {fmtValue(v)}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
      <TipLayer tip={tip} />
    </div>
  );
}

/** Swatch strip for the diverging scale. */
export function DivergingLegend({ left, right }: { left: string; right: string }) {
  const steps = [-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <span>{left}</span>
      <span className="flex gap-0.5" aria-hidden>
        {steps.map((s) => <span key={s} className="h-3 w-5 rounded-[3px]" style={{ background: divergingColor(s).bg }} />)}
      </span>
      <span>{right}</span>
    </div>
  );
}

/* ========================= sparkline ========================= */

/** Tiny grade line (1–10); the last point is the accent, an optional grey comparison line behind it. */
export function Sparkline({ values, compare, width = 64, height = 22, accent = C.blue, strong = false, label }: { values: number[]; compare?: number[]; width?: number; height?: number; accent?: string; strong?: boolean; label: string }) {
  if (values.length < 2) return null;
  const pad = 3;
  const pts = (vs: number[]) =>
    vs.map((v, i) => [pad + (i / (vs.length - 1)) * (width - pad * 2), pad + (1 - (v - 1) / 9) * (height - pad * 2)] as const);
  const p = pts(values);
  const last = p[p.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="overflow-visible">
      {compare && compare.length > 1 && (
        <polyline points={pts(compare).map((q) => q.join(",")).join(" ")} fill="none" stroke={C.gray} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      )}
      <polyline points={p.map((q) => q.join(",")).join(" ")} fill="none" stroke={strong ? accent : C.grayLine} strokeWidth={strong ? 2 : 1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={strong ? 4 : 3} fill={accent} stroke="#fff" strokeWidth={strong ? 2 : 1.5} />
    </svg>
  );
}

/* ========================= line chart with forecast ========================= */

/** Width of an element, kept up to date (starts at `fallback` so server and first client render agree). */
function useWidth(fallback: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

export type TrendPoint = { t: number; date: string; title: string; mine: number | null; classAvg: number | null; forecast?: number; low?: number; high?: number };

/**
 * Child's grades (blue) vs the class average (grey) over the semester, then the forecast for the
 * planned works (dashed) inside a 10 % band. Crosshair + tooltip snap to the nearest work.
 */
export function TrendChart({ points, name, monthTicks, fmtValue, height = 240 }: { points: TrendPoint[]; name: string; monthTicks: { t: number; label: string }[]; fmtValue: (v: number) => string; height?: number }) {
  const { ref, w } = useWidth(640);
  const [hover, setHover] = useState<number | null>(null);
  const m = { l: 26, r: 14, t: 12, b: 26 };
  const tMax = Math.max(...points.map((p) => p.t)) + 0.6;
  const X = (t: number) => m.l + (t / tMax) * (w - m.l - m.r);
  const Y = (v: number) => m.t + (1 - (v - 1) / 9) * (height - m.t - m.b);
  const line = (pts: [number, number][]) => pts.map(([a, b], i) => `${i ? "L" : "M"}${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join(" ");

  const mine = points.filter((p) => p.mine != null).map((p) => [p.t, p.mine!] as [number, number]);
  const cls = points.filter((p) => p.classAvg != null).map((p) => [p.t, p.classAvg!] as [number, number]);
  const fut = points.filter((p) => p.forecast != null);
  const lastMine = mine[mine.length - 1];
  const fLine = lastMine ? line([lastMine, ...fut.map((p) => [p.t, p.forecast!] as [number, number])]) : "";
  const band = lastMine && fut.length
    ? `M${X(lastMine[0])},${Y(lastMine[1])} ` +
      fut.map((p) => `L${X(p.t).toFixed(1)},${Y(p.high!).toFixed(1)}`).join(" ") +
      " " + [...fut].reverse().map((p) => `L${X(p.t).toFixed(1)},${Y(p.low!).toFixed(1)}`).join(" ") + " Z"
    : "";

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - box.left;
    let best = 0;
    points.forEach((p, i) => { if (Math.abs(X(p.t) - px) < Math.abs(X(points[best].t) - px)) best = i; });
    setHover(best);
  };
  const h = hover != null ? points[hover] : null;
  const tipLeft = h ? Math.max(90, Math.min(X(h.t), w - 90)) : 0;

  return (
    <div ref={ref} className="relative select-none overflow-hidden">
      <svg
        width={w}
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        className="block touch-pan-y"
        role="img"
        aria-label={`${name} pažymiai ir klasės vidurkis per pusmetį, su prognoze likusiems darbams`}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {[2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1={m.l} x2={w - m.r} y1={Y(v)} y2={Y(v)} stroke={C.grid} strokeWidth={1} />
            <text x={m.l - 8} y={Y(v)} dy="0.32em" textAnchor="end" fontSize={11} fill="#64748b" className="tabular-nums">{v}</text>
          </g>
        ))}
        {monthTicks.map((mt) => (
          <text key={mt.label} x={X(mt.t)} y={height - 6} fontSize={11} fill="#64748b">{mt.label}</text>
        ))}
        {band && <path d={band} fill={C.blue} opacity={0.1} />}
        <path d={line(cls)} fill="none" stroke={C.grayLine} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <path d={line(mine)} fill="none" stroke={C.blue} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {fLine && <path d={fLine} fill="none" stroke={C.blue} strokeWidth={2} strokeDasharray="5 5" strokeLinecap="round" />}
        {h && <line x1={X(h.t)} x2={X(h.t)} y1={m.t} y2={height - m.b} stroke="#475569" strokeWidth={1} />}
        {mine.map(([t, v]) => <circle key={t} cx={X(t)} cy={Y(v)} r={4} fill={C.blue} stroke="#fff" strokeWidth={2} />)}
        {fut.map((p) => <circle key={p.t} cx={X(p.t)} cy={Y(p.forecast!)} r={4} fill="#fff" stroke={C.blue} strokeWidth={2} />)}
        {h?.mine != null && <circle cx={X(h.t)} cy={Y(h.mine)} r={6} fill={C.blue} stroke="#fff" strokeWidth={2} />}
        {h?.classAvg != null && <circle cx={X(h.t)} cy={Y(h.classAvg)} r={5} fill={C.grayLine} stroke="#fff" strokeWidth={2} />}
      </svg>
      {h && (
        <div className="pointer-events-none absolute top-0 z-20 w-max max-w-[15rem] -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-2 text-xs leading-relaxed text-slate-300 shadow-xl" style={{ left: tipLeft }}>
          <span className="block font-medium text-white">{h.date} · {h.title}</span>
          {h.mine != null && <span className="block"><b className="text-white tabular-nums">{h.mine}</b> – {name}</span>}
          {h.mine == null && h.forecast == null && <span className="block">{name}: nebuvo</span>}
          {h.forecast != null && <span className="block"><b className="text-white tabular-nums">≈ {fmtValue(h.forecast)}</b> – prognozė ({fmtValue(h.low!)}–{fmtValue(h.high!)})</span>}
          {h.classAvg != null && <span className="block"><b className="text-white tabular-nums">{fmtValue(h.classAvg)}</b> – klasės vidurkis</span>}
        </div>
      )}
    </div>
  );
}

/** Legend keys that mirror the marks: solid line, grey line, dashed line. */
export function LineLegend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <svg width="18" height="6" aria-hidden>
            <line x1="1" x2="17" y1="3" y2="3" stroke={it.color} strokeWidth="2" strokeDasharray={it.dashed ? "4 3" : undefined} strokeLinecap="round" />
          </svg>
          {it.label}
        </li>
      ))}
    </ul>
  );
}
