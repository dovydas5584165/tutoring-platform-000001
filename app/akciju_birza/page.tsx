"use client";

import React, { useEffect, useState } from "react";

/**
 * Akcijų biržos žaidimas – mokomasis žaidimas apie sudėtines palūkanas,
 * žvakių grafikus ir krizes. Visi duomenys sugeneruojami atsitiktinai.
 */

/* ---------- spalvos: tik mėlyna + neutralios ---------- */

const BLUE = "#3B82F6";
const BLUE_LIGHT = "#93C5FD";
const BG = "#000000";
const PANEL = "#0D0D10";
const BORDER = "#24242A";
const TEXT = "#E7E7EA";
const MUTED = "#8A8A93";

/* ---------- tipai ---------- */

type Stock = { id: string; name: string; ticker: string; mu: number; sigma: number; basePrice: number };
type Candle = { o: number; h: number; l: number; c: number };
type Hold = { id: string; label: string; years: number; candles: number; sub: number; unit: string };
type CrisisTpl = { id: string; title: string; depth: number; fall: number; recovery: number; text: string };
type Crisis = { tpl: CrisisTpl; start: number };
type Phase = "trade" | "reveal" | "result";

type Period = { hold: Hold; candles: Candle[]; expected: number[]; crisis: Crisis | null; entry: number };

type Result = {
  round: number;
  stock: Stock;
  hold: Hold;
  amount: number;
  value: number;
  change: number;
  pct: number;
  perYear: number;
  crisis: Crisis | null;
  drawdown: number;
};

/* ---------- duomenys ---------- */

const START_BALANCE = 1000;
const HISTORY_DAYS = 40;
const REVEAL_MS = 2200;

// mu – vidutinis metinis augimas, sigma – metiniai svyravimai
const STOCKS: Stock[] = [
  { id: "tiksliukai", name: "Tiksliukai", ticker: "TIKS", mu: 0.09, sigma: 0.18, basePrice: 25 },
  { id: "zalgiris", name: "Žalgiris", ticker: "ZALG", mu: 0.07, sigma: 0.25, basePrice: 48 },
  { id: "tamo", name: "Tamo", ticker: "TAMO", mu: 0.05, sigma: 0.1, basePrice: 12 },
  { id: "claude", name: "Claude", ticker: "CLDE", mu: 0.14, sigma: 0.4, basePrice: 120 },
  { id: "nike", name: "Nike", ticker: "NIKE", mu: 0.04, sigma: 0.22, basePrice: 85 },
];

// viena žvakė = diena / savaitė / mėnuo / ketvirtis
const HOLDS: Hold[] = [
  { id: "1m", label: "1 mėn.", years: 1 / 12, candles: 21, sub: 4, unit: "diena" },
  { id: "1y", label: "1 m.", years: 1, candles: 52, sub: 5, unit: "savaitė" },
  { id: "5y", label: "5 m.", years: 5, candles: 60, sub: 4, unit: "mėnuo" },
  { id: "10y", label: "10 m.", years: 10, candles: 40, sub: 12, unit: "ketvirtis" },
  { id: "20y", label: "20 m.", years: 20, candles: 80, sub: 12, unit: "ketvirtis" },
];

const CRISES: CrisisTpl[] = [
  {
    id: "2008",
    title: "Krizė, panaši į 2008 m. finansų krizę",
    depth: 0.5,
    fall: 1.4,
    recovery: 4,
    text:
      "2008 m. bankrutavus JAV bankui Lehman Brothers prasidėjo pasaulinė finansų krizė. S&P 500 indeksas nuo 2007 m. spalio iki 2009 m. kovo nukrito apie 57 %, o ankstesnį aukščiausią lygį vėl pasiekė tik 2013 m.",
  },
  {
    id: "2000",
    title: "Krizė, panaši į 2000 m. interneto burbulą",
    depth: 0.45,
    fall: 2.5,
    recovery: 5,
    text:
      "2000 m. sprogo interneto bendrovių akcijų burbulas. Nasdaq indeksas iki 2002 m. spalio nukrito beveik 78 %, o ankstesnį rekordą pasiekė tik 2015 m.",
  },
  {
    id: "2020",
    title: "Krizė, panaši į 2020 m. pandemijos krachą",
    depth: 0.33,
    fall: 0.07,
    recovery: 0.4,
    text:
      "2020 m. vasarį–kovą dėl COVID-19 pandemijos S&P 500 per maždaug mėnesį nukrito apie 34 %, tačiau jau rugpjūtį pasiekė naują rekordą.",
  },
];

/* ---------- pagalbinės funkcijos ---------- */

const eur = new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR" });
const eur0 = new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const round2 = (n: number) => Math.round(n * 100) / 100;
const pctFmt = (n: number, d = 1) => `${n >= 0 ? "+" : "−"}${Math.abs(n * 100).toFixed(d)} %`;

function gauss(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function normCdf(x: number): number {
  const t = 1 / (1 + (0.3275911 * Math.abs(x)) / Math.SQRT2);
  const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
  const erf = 1 - ((((a[4] * t + a[3]) * t + a[2]) * t + a[1]) * t + a[0]) * t * Math.exp(-(x * x) / 2);
  return x >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

/** Tikimybė, kad po `years` metų vertė bus didesnė nei pirkimo (be krizių). */
const probUp = (s: Stock, years: number) => normCdf((Math.log(1 + s.mu) * Math.sqrt(years)) / s.sigma);

/** Žvakių generavimas: geometrinis Brauno judėjimas + galima krizė. */
function simulate(p0: number, s: Stock, years: number, candles: number, sub: number, crisis: Crisis | null): Candle[] {
  const dt = years / (candles * sub);
  const g = Math.log(1 + s.mu);
  const out: Candle[] = [];
  let p = p0;
  let t = 0;
  for (let i = 0; i < candles; i++) {
    const o = p;
    let h = p;
    let l = p;
    for (let k = 0; k < sub; k++) {
      t += dt;
      let drift = g;
      let vol = s.sigma;
      if (crisis) {
        const { start, tpl } = crisis;
        const L = Math.log(1 - tpl.depth);
        if (t > start && t <= start + tpl.fall) {
          drift += L / tpl.fall;
          vol *= 2;
        } else if (t > start + tpl.fall && t <= start + tpl.fall + tpl.recovery) {
          drift -= L / tpl.recovery;
          vol *= 1.3;
        }
      }
      p = Math.max(0.01, p * Math.exp(drift * dt + vol * Math.sqrt(dt) * gauss()));
      h = Math.max(h, p);
      l = Math.min(l, p);
    }
    const wick = s.sigma * Math.sqrt(dt) * 0.6;
    out.push({ o, h: h * (1 + Math.random() * wick), l: l * (1 - Math.random() * wick), c: p });
  }
  return out;
}

const genHistory = (s: Stock) =>
  simulate(s.basePrice * (0.8 + Math.random() * 0.4), s, HISTORY_DAYS / 252, HISTORY_DAYS, 4, null);

function pickCrisis(hold: Hold, forced: boolean): Crisis | null {
  const chance = 1 - Math.exp(-0.05 * hold.years); // ~5 % per metus
  if (!forced && Math.random() > chance) return null;
  const fits = CRISES.filter((c) => c.fall <= hold.years);
  const tpl = fits[Math.floor(Math.random() * fits.length)];
  const start = Math.random() * Math.max(0, hold.years - tpl.fall) * 0.8;
  return { tpl, start };
}

function maxDrawdown(c: Candle[]): number {
  let peak = c[0].o;
  let dd = 0;
  for (const k of c) {
    peak = Math.max(peak, k.h);
    dd = Math.max(dd, 1 - k.l / peak);
  }
  return dd;
}

function fmtElapsed(y: number): string {
  let yrs = Math.floor(y + 1e-9);
  let m = Math.round((y - yrs) * 12);
  if (m === 12) {
    yrs += 1;
    m = 0;
  }
  return m ? `${yrs} m. ${m} mėn.` : `${yrs} m.`;
}

const sigmaLabel = (s: number) => (s < 0.15 ? "maži" : s < 0.3 ? "vidutiniai" : "dideli");

/* ---------- žvakių grafikas ---------- */

function CandleChart({
  candles,
  shown,
  expected,
  crisisRange,
  labels,
  entry,
}: {
  candles: Candle[];
  shown: number;
  expected?: number[];
  crisisRange?: [number, number] | null;
  labels: [string, string, string];
  entry?: number;
}) {
  const W = 720;
  const H = 300;
  const PL = 6;
  const PR = 58;
  const PT = 14;
  const PB = 24;
  const n = candles.length;
  const vals = candles.flatMap((c) => [c.h, c.l]).concat(expected ?? []);
  let lo = Math.min(...vals);
  let hi = Math.max(...vals);
  const pad = (hi - lo) * 0.06 || 1;
  lo -= pad;
  hi += pad;
  const plotW = W - PL - PR;
  const plotH = H - PT - PB;
  const step = plotW / n;
  const cw = Math.max(1, step * 0.62);
  const cx = (i: number) => PL + step * (i + 0.5);
  const y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * plotH;
  const grid = [0, 1, 2, 3, 4].map((k) => lo + ((hi - lo) * k) / 4);

  const expPath =
    expected && entry !== undefined
      ? `M${PL},${y(entry)} ` + expected.map((v, i) => `L${cx(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")
      : "";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {grid.map((g, k) => (
        <g key={k}>
          <line x1={PL} x2={W - PR} y1={y(g)} y2={y(g)} stroke={BORDER} />
          <text x={W - 4} y={y(g) + 4} fontSize={11} textAnchor="end" fill={MUTED}>
            {g.toFixed(2)}
          </text>
        </g>
      ))}

      {crisisRange && (
        <g>
          <rect
            x={PL + step * crisisRange[0]}
            y={PT}
            width={Math.max(2, step * (Math.min(crisisRange[1], n) - crisisRange[0]))}
            height={plotH}
            fill={BLUE}
            opacity={0.1}
          />
          <text x={PL + step * crisisRange[0] + 4} y={PT + 12} fontSize={11} fill={BLUE_LIGHT}>
            Krizė
          </text>
        </g>
      )}

      {entry !== undefined && (
        <line x1={PL} x2={W - PR} y1={y(entry)} y2={y(entry)} stroke={MUTED} strokeDasharray="2 4" />
      )}
      {expPath && <path d={expPath} fill="none" stroke={BLUE_LIGHT} strokeWidth={1.5} strokeDasharray="5 4" opacity={0.7} />}

      {candles.slice(0, shown).map((c, i) => {
        const up = c.c >= c.o;
        const top = y(Math.max(c.o, c.c));
        const bot = y(Math.min(c.o, c.c));
        const stroke = up ? BLUE : BLUE_LIGHT;
        return (
          <g key={i}>
            <line x1={cx(i)} x2={cx(i)} y1={y(c.h)} y2={y(c.l)} stroke={stroke} strokeWidth={1} />
            <rect
              x={cx(i) - cw / 2}
              y={top}
              width={cw}
              height={Math.max(1, bot - top)}
              fill={up ? BLUE : PANEL}
              stroke={stroke}
              strokeWidth={cw > 3 ? 1 : 0}
            />
          </g>
        );
      })}

      <text x={PL} y={H - 6} fontSize={11} fill={MUTED}>{labels[0]}</text>
      <text x={PL + plotW / 2} y={H - 6} fontSize={11} fill={MUTED} textAnchor="middle">{labels[1]}</text>
      <text x={W - PR} y={H - 6} fontSize={11} fill={MUTED} textAnchor="end">{labels[2]}</text>
    </svg>
  );
}

/* ---------- žvakės paaiškinimas ---------- */

function CandleGuide() {
  const lbl = { fontSize: 11, fill: MUTED } as const;
  return (
    <details className="ab-details">
      <summary>Kaip skaityti žvakių grafiką?</summary>
      <div className="ab-guide">
        <svg viewBox="0 0 300 170" style={{ width: 300, maxWidth: "100%" }}>
          {/* kilimo žvakė */}
          <line x1={60} x2={60} y1={15} y2={155} stroke={BLUE} />
          <rect x={48} y={45} width={24} height={80} fill={BLUE} />
          <text x={80} y={19} {...lbl}>aukščiausia</text>
          <text x={80} y={49} {...lbl}>uždarymo</text>
          <text x={80} y={129} {...lbl}>atidarymo</text>
          <text x={80} y={158} {...lbl}>žemiausia</text>
          {/* kritimo žvakė */}
          <line x1={210} x2={210} y1={15} y2={155} stroke={BLUE_LIGHT} />
          <rect x={198} y={45} width={24} height={80} fill={PANEL} stroke={BLUE_LIGHT} />
          <text x={230} y={19} {...lbl}>aukščiausia</text>
          <text x={230} y={49} {...lbl}>atidarymo</text>
          <text x={230} y={129} {...lbl}>uždarymo</text>
          <text x={230} y={158} {...lbl}>žemiausia</text>
        </svg>
        <ul>
          <li>Viena žvakė – vienas laikotarpis: diena, savaitė, mėnuo ar ketvirtis.</li>
          <li><b>Pilna</b> žvakė – kaina per laikotarpį pakilo, <b>tuščia</b> – nukrito.</li>
          <li>Plonos linijos (dagtys) rodo aukščiausią ir žemiausią laikotarpio kainą.</li>
          <li>Punktyrinė linija – kaip augtų kaina, jei kasmet pakiltų vienodai (sudėtinis augimas).</li>
        </ul>
      </div>
    </details>
  );
}

/* ---------- pagrindinis komponentas ---------- */

export default function AkcijuBirzosZaidimas() {
  const [balance, setBalance] = useState(START_BALANCE);
  const [stockId, setStockId] = useState(STOCKS[0].id);
  const [history, setHistory] = useState<Candle[]>(() => genHistory(STOCKS[0]));
  const [holdId, setHoldId] = useState("5y");
  const [amount, setAmount] = useState(500);
  const [forceCrisis, setForceCrisis] = useState(false);
  const [phase, setPhase] = useState<Phase>("trade");
  const [period, setPeriod] = useState<Period | null>(null);
  const [shown, setShown] = useState(0);
  const [last, setLast] = useState<Result | null>(null);
  const [log, setLog] = useState<Result[]>([]);
  const [elapsed, setElapsed] = useState(0);
  // duomenys atsitiktiniai, todėl piešiame tik naršyklėje (išvengiame hydration neatitikimų)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stock = STOCKS.find((s) => s.id === stockId)!;
  const hold = HOLDS.find((h) => h.id === holdId)!;
  const entryPrice = history[history.length - 1].c;
  const gameOver = balance < 1 && phase !== "reveal";

  useEffect(() => {
    setAmount((a) => Math.max(1, Math.min(Math.round(a), Math.floor(balance))));
  }, [balance]);

  useEffect(() => {
    if (phase !== "reveal" || !period) return;
    if (shown >= period.candles.length) {
      finish();
      return;
    }
    const t = setTimeout(() => setShown((n) => n + 1), REVEAL_MS / period.candles.length);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, shown]);

  function pickStock(id: string) {
    const s = STOCKS.find((x) => x.id === id)!;
    setStockId(id);
    setHistory(genHistory(s));
    setPeriod(null);
    setLast(null);
    setPhase("trade");
  }

  function buy() {
    if (amount <= 0 || amount > balance) return;
    const crisis = pickCrisis(hold, forceCrisis);
    const candles = simulate(entryPrice, stock, hold.years, hold.candles, hold.sub, crisis);
    const expected = candles.map((_, i) => entryPrice * Math.pow(1 + stock.mu, ((i + 1) / hold.candles) * hold.years));
    setPeriod({ hold, candles, expected, crisis, entry: entryPrice });
    setShown(0);
    setPhase("reveal");
  }

  function finish() {
    if (!period) return;
    const exit = period.candles[period.candles.length - 1].c;
    const ratio = exit / period.entry;
    const value = round2(amount * ratio);
    const change = round2(value - amount);
    const r: Result = {
      round: log.length + 1,
      stock,
      hold: period.hold,
      amount,
      value,
      change,
      pct: ratio - 1,
      perYear: Math.pow(ratio, 1 / period.hold.years) - 1,
      crisis: period.crisis,
      drawdown: maxDrawdown(period.candles),
    };
    setBalance((b) => round2(b + change));
    setElapsed((e) => e + period.hold.years);
    setLast(r);
    setLog((l) => [r, ...l]);
    setPhase("result");
  }

  function restart() {
    setBalance(START_BALANCE);
    setLog([]);
    setLast(null);
    setPeriod(null);
    setElapsed(0);
    setAmount(500);
    pickStock(stockId);
  }

  const crisisRange: [number, number] | null =
    period && period.crisis
      ? [
          (period.crisis.start / period.hold.years) * period.hold.candles,
          ((period.crisis.start + period.crisis.tpl.fall + period.crisis.tpl.recovery) / period.hold.years) *
            period.hold.candles,
        ]
      : null;

  const showingPeriod = period && (phase === "reveal" || phase === "result");

  if (!mounted) return <div className="ab-root" style={{ background: BG, minHeight: "100vh" }} />;

  return (
    <div className="ab-root">
      <style>{CSS}</style>

      <header className="ab-header">
        <h1>Akcijų biržos žaidimas</h1>
        <div className="ab-kpis">
          <div><span>Sąskaita</span><b>{eur.format(balance)}</b></div>
          <div><span>Praėjo laiko</span><b>{fmtElapsed(elapsed)}</b></div>
          <div><span>Pirkimai</span><b>{log.length}</b></div>
        </div>
      </header>

      {gameOver ? (
        <section className="ab-panel ab-center">
          <h2>Pinigų nebeliko</h2>
          <p className="ab-muted">Pabandyk pirkti mažesnėmis sumomis arba laikyti ilgiau.</p>
          <button className="ab-btn" onClick={restart}>Pradėti iš naujo</button>
        </section>
      ) : (
        <>
          <section className="ab-stocks">
            {STOCKS.map((s) => (
              <button
                key={s.id}
                className={`ab-stock ${s.id === stockId ? "active" : ""}`}
                disabled={phase === "reveal"}
                onClick={() => pickStock(s.id)}
              >
                <b>{s.name}</b>
                <span className="ab-muted">{s.ticker}</span>
                <span>~{Math.round(s.mu * 100)} % per metus</span>
                <span className="ab-muted">Svyravimai: {sigmaLabel(s.sigma)}</span>
              </button>
            ))}
          </section>

          <section className="ab-panel">
            <div className="ab-row">
              <h3>
                {stock.name} <span className="ab-muted">{stock.ticker}</span>
              </h3>
              <span className="ab-muted">
                {showingPeriod
                  ? `Laikotarpis: ${period!.hold.label} · 1 žvakė = ${period!.hold.unit}`
                  : `Paskutinės ${HISTORY_DAYS} dienų · kaina ${eur.format(entryPrice)}`}
              </span>
            </div>

            {showingPeriod ? (
              <CandleChart
                candles={period!.candles}
                shown={shown}
                expected={period!.expected}
                entry={period!.entry}
                crisisRange={crisisRange}
                labels={["Pirkimas", "", period!.hold.label]}
              />
            ) : (
              <CandleChart candles={history} shown={history.length} labels={[`−${HISTORY_DAYS} d.`, "", "Šiandien"]} />
            )}

            {phase === "trade" && (
              <div className="ab-controls">
                <div className="ab-label">Kiek laiko laikyti?</div>
                <div className="ab-holds">
                  {HOLDS.map((h) => (
                    <button key={h.id} className={`ab-hold ${h.id === holdId ? "active" : ""}`} onClick={() => setHoldId(h.id)}>
                      <b>{h.label}</b>
                      <span>≈ {eur0.format(amount * Math.pow(1 + stock.mu, h.years))}</span>
                      <span className="ab-muted">augimo tikimybė {Math.round(probUp(stock, h.years) * 100)} %</span>
                    </button>
                  ))}
                </div>

                <div className="ab-label">
                  Pirkimo suma: <b>{eur.format(amount)}</b>
                </div>
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, Math.floor(balance))}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="ab-range"
                />
                <div className="ab-row ab-gap">
                  <div className="ab-chips">
                    {[0.25, 0.5, 1].map((f) => (
                      <button key={f} className="ab-chip" onClick={() => setAmount(Math.max(1, Math.floor(balance * f)))}>
                        {f === 1 ? "Visa suma" : `${f * 100} %`}
                      </button>
                    ))}
                  </div>
                  <label className="ab-toggle">
                    <input type="checkbox" checked={forceCrisis} onChange={(e) => setForceCrisis(e.target.checked)} />
                    Imituoti krizę
                  </label>
                </div>

                <button className="ab-btn ab-wide" onClick={buy}>
                  Pirkti už {eur.format(amount)} ir laikyti {hold.label}
                </button>
              </div>
            )}

            {phase === "reveal" && <p className="ab-muted ab-center">Laikoma {period?.hold.label}…</p>}

            {phase === "result" && last && (
              <div className="ab-result">
                <div className="ab-grid">
                  <div><span>Pirkta už</span><b>{eur.format(last.amount)}</b></div>
                  <div><span>Vertė po {last.hold.label}</span><b>{eur.format(last.value)}</b></div>
                  <div>
                    <span>Pokytis</span>
                    <b className={last.change >= 0 ? "ab-pos" : ""}>
                      {last.change >= 0 ? "+" : "−"}
                      {eur.format(Math.abs(last.change))} ({pctFmt(last.pct)})
                    </b>
                  </div>
                  {last.hold.years >= 1 && (
                    <div><span>Vidutiniškai per metus</span><b>{pctFmt(last.perYear)}</b></div>
                  )}
                </div>

                {last.hold.years >= 1 && (
                  <p className="ab-note">
                    <b>Sudėtinės palūkanos:</b> kiekvienais metais augama nuo jau padidėjusios sumos. Jei {last.stock.name} kasmet
                    augtų po {Math.round(last.stock.mu * 100)} %: {eur0.format(last.amount)} × {(1 + last.stock.mu).toFixed(2).replace(".", ",")}
                    <sup>{last.hold.years}</sup> = {eur0.format(last.amount * Math.pow(1 + last.stock.mu, last.hold.years))}.
                  </p>
                )}

                {last.crisis && (
                  <div className="ab-crisis">
                    <b>{last.crisis.tpl.title}</b>
                    <p>{last.crisis.tpl.text}</p>
                    <p className="ab-muted">
                      Šiame žaidime didžiausias kritimas nuo viršūnės buvo −{(last.drawdown * 100).toFixed(0)} %.
                      {last.change >= 0 && last.hold.years >= 5 ? " Ilgai laikant vertė spėjo atsigauti." : ""}
                    </p>
                  </div>
                )}

                <div className="ab-row ab-gap">
                  <button className="ab-btn" onClick={() => pickStock(stock.id)}>Pirkti dar kartą</button>
                </div>
              </div>
            )}

            <CandleGuide />
          </section>
        </>
      )}

      {log.length > 0 && (
        <section className="ab-panel">
          <div className="ab-row">
            <h3>Istorija</h3>
            <button className="ab-chip" onClick={restart}>Pradėti iš naujo</button>
          </div>
          <table className="ab-table">
            <thead>
              <tr>
                <th>Akcija</th>
                <th>Laikyta</th>
                <th>Pirkta už</th>
                <th>Vertė</th>
                <th>Pokytis</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {log.slice(0, 12).map((r) => (
                <tr key={r.round}>
                  <td>{r.stock.ticker}</td>
                  <td>{r.hold.label}</td>
                  <td>{eur0.format(r.amount)}</td>
                  <td>{eur0.format(r.value)}</td>
                  <td className={r.change >= 0 ? "ab-pos" : ""}>{pctFmt(r.pct, 0)}</td>
                  <td className="ab-muted">{r.crisis ? "krizė" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

/* ---------- stiliai ---------- */

const CSS = `
.ab-root{font-family:Inter,"Segoe UI",system-ui,sans-serif;background:${BG};color:${TEXT};min-height:100vh;padding:20px 16px;box-sizing:border-box;font-size:14px}
.ab-root *{box-sizing:border-box}
.ab-root>*{max-width:900px;margin-left:auto;margin-right:auto}
.ab-header{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:16px}
.ab-header h1{margin:0;font-size:20px;font-weight:600;letter-spacing:-.2px}
.ab-kpis{display:flex;gap:20px}
.ab-kpis span,.ab-grid span{display:block;font-size:11px;color:${MUTED};text-transform:uppercase;letter-spacing:.4px}
.ab-kpis b{font-size:16px;font-weight:600}
.ab-panel{background:${PANEL};border:1px solid ${BORDER};border-radius:6px;padding:14px;margin-bottom:12px}
.ab-row{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.ab-row h3{margin:0;font-size:15px;font-weight:600}
.ab-gap{margin-top:10px}
.ab-muted{color:${MUTED}}
.ab-center{text-align:center}
.ab-pos{color:${BLUE}}
.ab-stocks{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px}
@media (max-width:700px){.ab-stocks{grid-template-columns:repeat(2,1fr)}}
.ab-stock{all:unset;cursor:pointer;background:${PANEL};border:1px solid ${BORDER};border-radius:6px;padding:10px;display:flex;flex-direction:column;gap:2px;font-size:12px}
.ab-stock b{font-size:14px;font-weight:600}
.ab-stock:hover:not(:disabled){border-color:${MUTED}}
.ab-stock.active{border-color:${BLUE}}
.ab-stock:disabled{opacity:.5;cursor:not-allowed}
.ab-controls{margin-top:12px}
.ab-label{margin:10px 0 6px;color:${MUTED}}
.ab-label b{color:${TEXT}}
.ab-holds{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
@media (max-width:600px){.ab-holds{grid-template-columns:repeat(2,1fr)}}
.ab-hold{all:unset;cursor:pointer;border:1px solid ${BORDER};border-radius:6px;padding:8px;display:flex;flex-direction:column;gap:2px;font-size:12px}
.ab-hold b{font-size:14px;font-weight:600}
.ab-hold:hover{border-color:${MUTED}}
.ab-hold.active{border-color:${BLUE};background:rgba(59,130,246,.08)}
.ab-range{width:100%;accent-color:${BLUE}}
.ab-chips{display:flex;gap:6px}
.ab-chip{all:unset;cursor:pointer;border:1px solid ${BORDER};border-radius:4px;padding:4px 10px;font-size:12px;color:${TEXT}}
.ab-chip:hover{border-color:${BLUE}}
.ab-toggle{display:flex;align-items:center;gap:6px;cursor:pointer;color:${TEXT};font-size:13px}
.ab-toggle input{accent-color:${BLUE}}
.ab-btn{all:unset;cursor:pointer;background:${BLUE};color:#fff;border-radius:6px;padding:10px 16px;font-weight:600;text-align:center}
.ab-btn:hover{filter:brightness(1.1)}
.ab-wide{display:block;width:100%;margin-top:12px}
.ab-result{margin-top:12px}
.ab-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
@media (max-width:600px){.ab-grid{grid-template-columns:repeat(2,1fr)}}
.ab-grid b{font-size:15px;font-weight:600}
.ab-note{border-left:2px solid ${BLUE};padding:4px 10px;margin:12px 0;color:${TEXT}}
.ab-crisis{border:1px solid ${BLUE};border-radius:6px;padding:10px 12px;margin:12px 0}
.ab-crisis b{color:${BLUE_LIGHT}}
.ab-crisis p{margin:6px 0 0}
.ab-details{margin-top:14px;border-top:1px solid ${BORDER};padding-top:10px}
.ab-details summary{cursor:pointer;color:${BLUE_LIGHT}}
.ab-guide{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-top:10px}
.ab-guide ul{margin:0;padding-left:18px;flex:1;min-width:220px;line-height:1.6}
.ab-table{width:100%;border-collapse:collapse;font-size:13px}
.ab-table th{text-align:left;font-weight:500;color:${MUTED};padding:6px 4px;border-bottom:1px solid ${BORDER}}
.ab-table td{padding:6px 4px;border-bottom:1px solid ${BORDER}}
`;
