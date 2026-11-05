'use client';

import React, { useEffect, useRef, useState } from 'react';

/* ---------- Types ---------- */
type TreeKind = 'pine' | 'oak' | 'birch' | 'dead';
interface Tree { z: number; side: -1 | 1; offset: number; heightScale: number; eyes: boolean; kind: TreeKind; seed: number }
interface Deer { z: number; x: number; dir: -1 | 1; speed: number; legPhase: number; hold: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; size: number; color: string }
interface Splat { x: number; y: number; r: number; drip: number }
interface Crash { t: number; kind: 'deer' | 'tree'; particles: Particle[]; splats: Splat[]; reason: string }
interface Vehicle {
  id: string; name: string; mission: string; place: string; winText: string; loseText: string; dieText: string;
  maxKmh: number; accel: number; brake: number; handling: number;
  hood: [string, string]; accent: string; siren: [string, string];
}
interface ActiveEv {
  kind: 'talk' | 'combo'; title: string; who: string; text: string; options: string[]; seq: string[];
  idx: number; mistakes: number; t: number; max: number; lethal: boolean;
}
interface EvView { kind: 'talk' | 'combo'; title: string; who: string; text: string; options: string[]; seq: string[]; idx: number; left: number; lethal: boolean }
interface GameState {
  status: 'START' | 'PLAYING' | 'CRASH' | 'ENDED';
  car: Vehicle; playerX: number; speed: number; distance: number; wheelAngle: number;
  keys: { w: boolean; a: boolean; s: boolean; d: boolean; n: boolean };
  trees: Tree[]; deer: Deer[]; nextDeerDistance: number; crash: Crash | null;
  gear: number; shiftT: number; stallT: number; brakeLevel: number; locked: boolean; msg: string;
  curve: number; curveTarget: number; curveTimer: number; frame: number;
  willArrive: boolean; mapProg: number; mapFinal: number; mapRate: number; mapTimer: number;
  ev: ActiveEv | null; evTimer: number; pending: string[]; nitro: number; nitroF: number; limit: number;
  toast: string; toastT: number;
}
interface Ending { won: boolean; title: string; text: string }
interface Hud { speed: number; gear: number; rpm: number; msg: string; time: number; meters: number; nitro: number; toast: string; ev: EvView | null }

/* ---------- Constants ---------- */
const TIME_LIMIT = 150;
const GEAR_FRAC = [0.22, 0.42, 0.62, 0.82, 1];
const GEAR_MULT = [2.0, 1.4, 1.0, 0.75, 0.55];
const WIN_CHANCE = 0.2;
const DEATH_CHANCE = 0.3;
const COMBO_POOL = 'qertyuiopfghlzxcvbm'.split('');
const GAME_KEYS = 'wasdkjn';

const VEHICLES: Vehicle[] = [
  { id: 'police', name: 'Police Cruiser', mission: 'Reach the murder scene', place: 'CRIME SCENE',
    winText: 'You secured the murder scene before the trail went cold.', loseText: 'The killer is long gone.',
    dieText: 'The hostage did not survive the call.',
    maxKmh: 170, accel: 0.0034, brake: 0.0024, handling: 1.2, hood: ['#1b2a47', '#0b1220'], accent: '#3b82f6', siren: ['#ff1f1f', '#2a5bff'] },
  { id: 'ambulance', name: 'Ambulance', mission: 'Save the dying patient', place: 'PATIENT',
    winText: 'You reached the patient in time. They will live.', loseText: 'The patient died before you arrived.',
    dieText: 'The patient died while you were treating her.',
    maxKmh: 140, accel: 0.0028, brake: 0.0021, handling: 0.95, hood: ['#7d8088', '#3a3d44'], accent: '#ef4444', siren: ['#ff1f1f', '#ffffff'] },
  { id: 'fire', name: 'Fire Truck', mission: 'Reach the burning building', place: 'FIRE',
    winText: 'You reached the fire. The crew opens the hydrants.', loseText: 'The building burned to the ground.',
    dieText: 'The resident stopped answering. The line went dead.',
    maxKmh: 105, accel: 0.0020, brake: 0.0016, handling: 0.75, hood: ['#7a1414', '#3a0808'], accent: '#f59e0b', siren: ['#ff1f1f', '#ff8a00'] },
];

const EVENTS: Record<string, {
  talk: { title: string; who: string; text: string; options: string[] };
  combo: { title: string; who: string; text: string; lethal: boolean };
}> = {
  police: {
    talk: { title: 'Hostage on the line', who: 'Hostage', text: '"He is still in the house with me... what do I do?"', options: ['Stay calm and hide', 'Keep talking to him, I am coming', 'Tell me exactly where he is'] },
    combo: { title: 'Run the plate', who: 'Dispatch', text: 'Type the code to trace the suspect vehicle.', lethal: false },
  },
  ambulance: {
    talk: { title: 'Talk to the victim', who: 'Victim', text: '"I cannot feel my legs... am I dying?"', options: ['You will be fine, stay awake', 'Where does it hurt?', 'Do not move, we are close'] },
    combo: { title: 'Emergency operation', who: 'Paramedic', text: 'Type the sequence to operate. Every mistake can kill her.', lethal: true },
  },
  fire: {
    talk: { title: 'Trapped resident', who: 'Resident', text: '"The smoke is everywhere, I cannot find the door!"', options: ['Get low and crawl to the window', 'Stay where you are, we are coming', 'Cover your face and count to ten'] },
    combo: { title: 'Charge the pump', who: 'Crew', text: 'Type the code to pressurize the hoses.', lethal: false },
  },
};

const makeEvent = (car: Vehicle): ActiveEv => {
  const def = EVENTS[car.id];
  const talk = Math.random() < 0.5;
  const len = 5 + Math.floor(Math.random() * 2);
  const seq = Array.from({ length: len }, () => COMBO_POOL[Math.floor(Math.random() * COMBO_POOL.length)]);
  const base = { idx: 0, mistakes: 0, seq: [] as string[], options: [] as string[] };
  return talk
    ? { ...base, kind: 'talk', ...def.talk, lethal: true, t: 600, max: 600 }
    : { ...base, kind: 'combo', ...def.combo, seq, t: 780, max: 780 };
};

/* ---------- Dark, creepy themes that drift with distance ---------- */
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgba = (h: string, a: number) => `rgba(${hex(h)},${a})`;
const T = (skyTop: string, skyBot: string, gr1: string, gr2: string, treeA: string, treeB: string, sil: string) =>
  ({ skyTop: hex(skyTop), skyBot: hex(skyBot), gr1: hex(gr1), gr2: hex(gr2), treeA: hex(treeA), treeB: hex(treeB), sil: hex(sil) });
const THEMES = [
  T('#04060d', '#0e1424', '#05100a', '#0b1c12', '#06160e', '#0a1f14', '#030806'),
  T('#0d0716', '#2a1228', '#0a0c09', '#141a10', '#0a1a11', '#0f2417', '#08040c'),
  T('#03090f', '#122430', '#06110d', '#0c1f1b', '#0a2220', '#0f2d29', '#040b0b'),
  T('#140605', '#3a1a10', '#130e07', '#211a0b', '#1c1a08', '#2b230c', '#0a0503'),
  T('#0a1220', '#3d3a44', '#0b1a10', '#14291c', '#0c2a1d', '#123826', '#0a1414'),
];
const getTheme = (meters: number) => {
  const seg = 400;
  const i = Math.floor(meters / seg);
  const f = (meters % seg) / seg;
  const t = f < 0.6 ? 0 : (f - 0.6) / 0.4;
  const s = t * t * (3 - 2 * t);
  const A = THEMES[i % THEMES.length], B = THEMES[(i + 1) % THEMES.length];
  const m = (k: keyof typeof A) => A[k].map((v, n) => Math.round(v + (B[k][n] - v) * s));
  const c = (k: keyof typeof A) => `rgb(${m(k)})`;
  return { skyTop: c('skyTop'), skyBot: c('skyBot'), gr1: c('gr1'), gr2: c('gr2'), treeA: c('treeA'), treeB: c('treeB'), sil: c('sil'), fog: m('skyBot').join(',') };
};

/* ---------- Map ---------- */
const MAP_PATH: [number, number][] = [[12, 92], [30, 74], [22, 56], [50, 48], [62, 66], [88, 58], [98, 34], [80, 22], [104, 12], [124, 22]];
const MAP_TOTAL = MAP_PATH.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - MAP_PATH[i][0], p[1] - MAP_PATH[i][1]), 0);
const mapPoints = (f: number) => {
  const target = f * MAP_TOTAL;
  let acc = 0;
  const pts: [number, number][] = [MAP_PATH[0]];
  for (let i = 1; i < MAP_PATH.length; i++) {
    const [x0, y0] = MAP_PATH[i - 1], [x1, y1] = MAP_PATH[i];
    const l = Math.hypot(x1 - x0, y1 - y0);
    if (acc + l >= target) { const k = (target - acc) / l; pts.push([x0 + (x1 - x0) * k, y0 + (y1 - y0) * k]); return pts; }
    acc += l;
    pts.push(MAP_PATH[i]);
  }
  return pts;
};

/* ---------- Trees ---------- */
const pickKind = (): TreeKind => {
  const r = Math.random();
  return r < 0.45 ? 'pine' : r < 0.65 ? 'oak' : r < 0.85 ? 'birch' : 'dead';
};
const rollTree = (t: Tree) => {
  t.offset = 1.05 + Math.random() * 1.3;
  t.eyes = Math.random() < 0.12;
  t.kind = pickKind();
  t.seed = Math.random();
  t.heightScale = 0.85 + Math.random() * 0.5;
};

/* ---------- State ---------- */
const makeState = (car: Vehicle, status: GameState['status']): GameState => {
  const trees: Tree[] = [];
  for (let i = 1; i <= 60; i++) {
    for (const side of [-1, 1] as const) {
      const t: Tree = { z: i * 0.8 + (side === 1 ? 0.4 : 0), side, offset: 0, heightScale: 1, eyes: false, kind: 'pine', seed: 0 };
      rollTree(t);
      trees.push(t);
    }
  }
  const willArrive = Math.random() < WIN_CHANCE;
  return {
    status, car, playerX: 0, speed: 0, distance: 0, wheelAngle: 0,
    keys: { w: false, a: false, s: false, d: false, n: false },
    trees, deer: [], nextDeerDistance: 60 + Math.random() * 50, crash: null,
    gear: 1, shiftT: 0, stallT: 0, brakeLevel: 0, locked: false, msg: '',
    curve: 0, curveTarget: 0, curveTimer: 200, frame: 0,
    willArrive, mapProg: 0, mapFinal: willArrive ? 1 : 0.75 + Math.random() * 0.2, mapRate: 1, mapTimer: 0,
    ev: null, evTimer: 18 * 60 + Math.random() * 600, pending: [], nitro: 100, nitroF: 0, limit: TIME_LIMIT * 60,
    toast: '', toastT: 0,
  };
};

/* Deer are fast (real deer sprint) and often aim at where you will be */
const spawnDeer = (st: GameState, diff: number) => {
  const make = (dir: -1 | 1, zBonus: number): Deer => {
    const z = 46 - diff * 8 + Math.random() * 6 + zBonus;
    const x = dir === 1 ? -1.5 : 1.5;
    let speed = 0.05 + Math.random() * 0.04 + diff * 0.02;
    const aimed = Math.random() < 0.5 + diff * 0.4;
    if (aimed) {
      const t = Math.max(1, (z - 2.2) / Math.max(st.speed, 0.12));
      speed = Math.min(0.13, Math.max(0.045, Math.abs(st.playerX - x) / t));
    }
    return { z, x, dir, speed, legPhase: 0, hold: !aimed && Math.random() < 0.4 ? 20 + Math.floor(Math.random() * 25) : 0 };
  };
  const dir: -1 | 1 = Math.random() < 0.5 ? 1 : -1;
  st.deer.push(make(dir, 0));
  if (diff > 0.4 && Math.random() < 0.4) st.deer.push(make(dir === 1 ? -1 : 1, 7));
};

/* ---------- Vehicle artwork for the selection screen ---------- */
const Wheel = ({ x, y, r = 15 }: { x: number; y: number; r?: number }) => (
  <g><circle cx={x} cy={y} r={r} fill="#07080b" /><circle cx={x} cy={y} r={r * 0.55} fill="#9aa1ad" /><circle cx={x} cy={y} r={r * 0.2} fill="#2b2f38" /></g>
);
const Lights = ({ x, y, w, a, b }: { x: number; y: number; w: number; a: string; b: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={7} rx={3} fill="#111" />
    <rect x={x + 2} y={y + 1} width={w / 2 - 3} height={5} rx={2} fill={a} style={{ animation: 'sirenA .5s steps(1) infinite' }} />
    <rect x={x + w / 2 + 1} y={y + 1} width={w / 2 - 3} height={5} rx={2} fill={b} style={{ animation: 'sirenB .5s steps(1) infinite' }} />
  </g>
);
const VehicleArt = ({ v }: { v: Vehicle }) => (
  <svg viewBox="0 0 260 110" className="w-full h-24 drop-shadow-[0_8px_10px_rgba(0,0,0,0.7)]">
    <ellipse cx="130" cy="98" rx="108" ry="6" fill="rgba(0,0,0,0.55)" />
    {v.id === 'police' && (<g>
      <path d="M14 78 L18 62 L58 56 L86 32 L160 32 L190 56 L240 62 L248 78 L248 86 L14 86Z" fill="#0f1b33" />
      <path d="M90 36 L158 36 L182 56 L72 56Z" fill="#7fb4ff" opacity="0.85" />
      <path d="M124 36 L126 56" stroke="#0f1b33" strokeWidth="3" />
      <rect x="64" y="62" width="120" height="22" rx="3" fill="#e9eef7" />
      <rect x="14" y="76" width="234" height="6" fill="#1d3a73" />
      <rect x="236" y="64" width="12" height="7" rx="2" fill="#fff6c8" />
      <rect x="14" y="66" width="9" height="7" rx="2" fill="#ff3030" />
      <Lights x={104} y={25} w={44} a={v.siren[0]} b={v.siren[1]} />
      <text x="96" y="78" fontSize="10" fontWeight="800" fill="#10203f" fontFamily="sans-serif">POLICE</text>
      <Wheel x={60} y={86} /><Wheel x={200} y={86} />
    </g>)}
    {v.id === 'ambulance' && (<g>
      <path d="M12 30 H150 V86 H12Z" fill="#f2f4f8" />
      <path d="M150 42 H196 L236 64 V86 H150Z" fill="#e6e9ef" />
      <path d="M160 46 H192 L220 62 H160Z" fill="#7fb4ff" opacity="0.85" />
      <rect x="12" y="60" width="224" height="8" fill="#e11d2e" />
      <rect x="62" y="38" width="30" height="10" rx="2" fill="#e11d2e" />
      <rect x="72" y="33" width="10" height="20" rx="2" fill="#e11d2e" />
      <rect x="226" y="68" width="10" height="7" rx="2" fill="#fff6c8" />
      <Lights x={92} y={22} w={44} a={v.siren[0]} b="#e8f0ff" />
      <text x="108" y="82" fontSize="10" fontWeight="800" fill="#c01020" fontFamily="sans-serif">AMBULANCE</text>
      <Wheel x={52} y={86} /><Wheel x={190} y={86} />
    </g>)}
    {v.id === 'fire' && (<g>
      <path d="M12 38 H138 V86 H12Z" fill="#c4161c" />
      <path d="M138 34 H190 L214 52 H244 V86 H138Z" fill="#a8121a" />
      <path d="M150 40 H186 L204 54 H150Z" fill="#7fb4ff" opacity="0.8" />
      <rect x="12" y="56" width="232" height="5" fill="#f7d54a" />
      <g stroke="#cfd3da" strokeWidth="3"><path d="M20 30 H132 M20 22 H132" /><path d="M30 22 V30 M50 22 V30 M70 22 V30 M90 22 V30 M110 22 V30 M130 22 V30" strokeWidth="2" /></g>
      <rect x="236" y="66" width="8" height="7" rx="2" fill="#fff6c8" />
      <rect x="28" y="66" width="22" height="16" rx="2" fill="#7a0e12" /><rect x="58" y="66" width="22" height="16" rx="2" fill="#7a0e12" /><rect x="88" y="66" width="22" height="16" rx="2" fill="#7a0e12" />
      <Lights x={146} y={27} w={36} a={v.siren[0]} b={v.siren[1]} />
      <Wheel x={48} y={86} /><Wheel x={96} y={86} /><Wheel x={196} y={86} />
    </g>)}
  </svg>
);

const StatBar = ({ label, v, color }: { label: string; v: number; color: string }) => (
  <div className="flex items-center gap-2 text-[10px] text-slate-400">
    <span className="w-14">{label}</span>
    <div className="h-2 flex-1 rounded-full bg-black/60 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.round(v * 100)}%`, background: `linear-gradient(90deg, ${color}55, ${color})` }} />
    </div>
  </div>
);

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* ---------- Component ---------- */
export default function ForestDeerGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'ENDED'>('START');
  const [selected, setSelected] = useState<Vehicle>(VEHICLES[0]);
  const [highScore, setHighScore] = useState(0);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [hud, setHud] = useState<Hud>({ speed: 0, gear: 1, rpm: 0, msg: '', time: TIME_LIMIT, meters: 0, nitro: 100, toast: '', ev: null });
  const stateRef = useRef<GameState>(makeState(VEHICLES[0], 'START'));

  const initGame = () => {
    stateRef.current = makeState(selected, 'PLAYING');
    setEnding(null);
    setGameState('PLAYING');
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  };
  const changeVehicle = () => { stateRef.current = makeState(selected, 'START'); setGameState('START'); };
  const answer = (n: number) => stateRef.current.pending.push(String(n));

  useEffect(() => {
    const fit = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.height = 300;
      c.width = Math.round((300 * window.innerWidth) / window.innerHeight);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useEffect(() => {
    const set = (e: KeyboardEvent, v: boolean) => {
      const k = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'k', 'j', 'n', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(k)) e.preventDefault();
      const keys = stateRef.current.keys;
      if (k === 'w' || k === 'arrowup') keys.w = v;
      if (k === 'a' || k === 'arrowleft') keys.a = v;
      if (k === 's' || k === 'arrowdown') keys.s = v;
      if (k === 'd' || k === 'arrowright') keys.d = v;
      if (k === 'n') keys.n = v;
    };
    const down = (e: KeyboardEvent) => {
      set(e, true);
      const st = stateRef.current;
      const k = e.key.toLowerCase();
      if (st.status !== 'PLAYING' || e.repeat) return;
      if (st.shiftT === 0) {
        if (k === 'k' && st.gear < 5) { st.gear++; st.shiftT = 14; }
        if (k === 'j' && st.gear > 1) { st.gear--; st.shiftT = 14; }
      }
      if (st.ev && k.length === 1) st.pending.push(k);
    };
    const up = (e: KeyboardEvent) => set(e, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => {
    let raf: number;

    const end = (st: GameState, e: Ending, meters: number) => {
      st.status = 'ENDED';
      st.ev = null;
      setEnding(e);
      setGameState('ENDED');
      setHighScore((p) => Math.max(p, meters));
    };

    const startCrash = (st: GameState, kind: 'deer' | 'tree', hx: number, reason: string) => {
      const cols = kind === 'deer' ? ['#b91c1c', '#dc2626', '#7f1d1d', '#991b1b'] : ['#8b5a2b', '#4a3524', '#2f6b3f', '#c9c9c9'];
      const particles: Particle[] = [];
      for (let i = 0; i < (kind === 'deer' ? 120 : 60); i++) {
        particles.push({ x: 380 + hx * 180, y: 250, vx: (Math.random() - 0.5) * 24, vy: -Math.random() * 16 - 2, life: 40 + Math.random() * 40, size: 3 + Math.random() * 8, color: cols[Math.floor(Math.random() * cols.length)] });
      }
      const splats: Splat[] = [];
      if (kind === 'deer') for (let i = 0; i < 16; i++) splats.push({ x: 150 + Math.random() * 460, y: 40 + Math.random() * 230, r: 10 + Math.random() * 38, drip: 0 });
      st.status = 'CRASH';
      st.ev = null;
      st.crash = { t: 0, kind, particles, splats, reason };
    };

    const toast = (st: GameState, s: string) => { st.toast = s; st.toastT = 150; };

    /* Returns true if the victim died and the game ended */
    const runEvents = (st: GameState, meters: number): boolean => {
      const car = st.car;
      const die = () => { end(st, { won: false, title: 'She Did Not Make It', text: car.dieText }, meters); return true; };
      if (!st.ev) {
        st.pending = [];
        if (--st.evTimer <= 0 && st.speed > 0.05) st.ev = makeEvent(car);
        return false;
      }
      const ev = st.ev;
      ev.t--;
      for (const k of st.pending) {
        if (!st.ev) break;
        if (ev.kind === 'talk') {
          const n = parseInt(k, 10);
          if (n >= 1 && n <= ev.options.length) {
            st.ev = null;
            st.evTimer = (25 + Math.random() * 20) * 60;
            if (Math.random() < DEATH_CHANCE) return die();
            st.limit += 8 * 60;
            toast(st, 'She is calmer now. +8 seconds');
          }
        } else if (k === ev.seq[ev.idx]) {
          ev.idx++;
          if (ev.idx >= ev.seq.length) {
            st.ev = null;
            st.evTimer = (25 + Math.random() * 20) * 60;
            st.limit += 6 * 60;
            toast(st, ev.lethal ? 'Operation successful. +6 seconds' : 'Done. +6 seconds');
          }
        } else if (/^[a-z]$/.test(k) && !GAME_KEYS.includes(k)) {
          ev.mistakes++;
          ev.idx = 0;
          if (ev.lethal && Math.random() < DEATH_CHANCE) return die();
          toast(st, 'Wrong key, start over');
        }
      }
      st.pending = [];
      if (st.ev && ev.t <= 0) {
        st.ev = null;
        st.evTimer = (25 + Math.random() * 20) * 60;
        if (ev.kind === 'talk') {
          if (Math.random() < DEATH_CHANCE) return die();
          toast(st, 'Silence on the line');
        } else if (ev.lethal) {
          if (Math.random() < DEATH_CHANCE) return die();
          toast(st, 'Too slow, she is barely holding on');
        } else {
          st.limit = Math.max(60, st.limit - 5 * 60);
          toast(st, 'Too slow. -5 seconds');
        }
      }
      return false;
    };

    const update = () => {
      const st = stateRef.current;
      const car = st.car;
      const meters = Math.floor(st.distance * 2);

      if (st.status === 'CRASH' && st.crash) {
        const c = st.crash;
        c.t++;
        st.speed *= 0.9;
        for (const p of c.particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.9; p.life--; }
        for (const s of c.splats) s.drip = Math.min(70, s.drip + 0.4);
        if (c.t > 80) end(st, { won: false, title: 'You Died!', text: c.reason }, meters);
        return;
      }
      if (st.status !== 'PLAYING') return;

      st.frame++;
      if (st.toastT > 0) st.toastT--;
      const keys = st.keys;
      const top = (g: number) => (car.maxKmh / 400) * GEAR_FRAC[g - 1] * (1 + 0.3 * st.nitroF);
      let rpm = st.speed / top(st.gear);

      /* Engine, gears, brakes, nitro */
      if (st.shiftT > 0) st.shiftT--;
      if (st.stallT > 0 && keys.w) st.stallT--;
      const nit = keys.n && st.nitro > 0 && st.stallT === 0 && st.shiftT === 0;
      st.nitroF += ((nit ? 1 : 0) - st.nitroF) * 0.06;
      st.nitro = nit ? Math.max(0, st.nitro - 0.4) : Math.min(100, st.nitro + 0.04);
      let acc = 0;
      if (st.stallT === 0 && st.shiftT === 0 && keys.w) {
        const tq = rpm < 0.18 ? 0.25 : rpm < 0.8 ? 1 : rpm < 1 ? 1 - (rpm - 0.8) * 4 : -0.4;
        acc = car.accel * tq * GEAR_MULT[st.gear - 1];
      }
      if (nit) acc += car.accel * 1.6;
      st.brakeLevel = keys.s ? Math.min(1, st.brakeLevel + 0.05) : Math.max(0, st.brakeLevel - 0.12);
      st.locked = st.brakeLevel > 0.85 && st.speed > 0.15;
      let dec = 0.0004 + st.speed * st.speed * 0.0015;
      if ((!keys.w && !nit) || st.stallT > 0) dec += 0.0008 + 0.0012 * Math.min(1.3, rpm);
      if (rpm > 1.05) dec += Math.min(0.006, (rpm - 1) * 0.004);
      dec += car.brake * st.brakeLevel * (st.locked ? 0.55 : 1);
      st.speed = Math.max(0, st.speed + acc - dec);
      rpm = st.speed / top(st.gear);
      if (st.gear > 1 && rpm < 0.09 && st.stallT === 0) { st.stallT = 60; st.gear = 1; }

      st.msg = st.stallT > 0 ? 'ENGINE STALLED - HOLD W TO RESTART'
        : st.locked ? 'WHEELS LOCKED - RELEASE THE BRAKE'
        : rpm > 0.97 ? 'REDLINE - SHIFT UP (K)'
        : keys.w && rpm < 0.2 && st.gear > 1 ? 'ENGINE LUGGING - SHIFT DOWN (J)' : '';

      /* Road curves push the car outward */
      if (--st.curveTimer <= 0) {
        st.curveTarget = Math.random() < 0.4 ? 0 : (Math.random() * 2 - 1) * (0.4 + 0.6 * Math.random());
        st.curveTimer = 120 + Math.random() * 240;
      }
      st.curve += (st.curveTarget - st.curve) * 0.01;
      st.playerX -= st.curve * st.speed * st.speed * 0.12;

      const steer = st.speed > 0.01 ? 0.018 * car.handling * Math.min(1, st.speed / 0.12) * (st.locked ? 0.3 : 1) : 0;
      if (keys.a) { st.playerX -= steer; st.wheelAngle = Math.max(-0.65, st.wheelAngle - 0.08); }
      else if (keys.d) { st.playerX += steer; st.wheelAngle = Math.min(0.65, st.wheelAngle + 0.08); }
      else st.wheelAngle *= 0.82;

      st.distance += st.speed;
      const diff = Math.min(1, st.frame / (110 * 60));

      if (runEvents(st, meters)) return;

      const ev = st.ev;
      setHud({
        speed: Math.round(st.speed * 400), gear: st.gear, rpm: Math.min(1.2, rpm), msg: st.msg,
        time: Math.max(0, Math.ceil((st.limit - st.frame) / 60)), meters: Math.floor(st.distance * 2),
        nitro: st.nitro, toast: st.toastT > 0 ? st.toast : '',
        ev: ev ? { kind: ev.kind, title: ev.title, who: ev.who, text: ev.text, options: ev.options, seq: ev.seq, idx: ev.idx, left: ev.t / ev.max, lethal: ev.lethal } : null,
      });

      /* Map progress: random bursts, independent of how well you drive */
      if (--st.mapTimer <= 0) { st.mapRate = Math.random() * 2.4; st.mapTimer = 60 + Math.random() * 200; }
      st.mapProg = Math.min(st.mapFinal, st.mapProg + (st.mapFinal / (TIME_LIMIT * 60 * 0.7)) * st.mapRate * Math.min(1, st.speed / 0.1));
      if (st.mapProg >= 1) { end(st, { won: true, title: 'Mission Complete', text: car.winText }, meters); return; }
      if (st.frame >= st.limit) { end(st, { won: false, title: 'Too Late', text: car.loseText }, meters); return; }

      if (Math.abs(st.playerX) > 0.92) {
        startCrash(st, 'tree', st.playerX > 0 ? 0.9 : -0.9, 'You left the narrow road and slammed into the trees.');
        return;
      }

      for (const t of st.trees) {
        t.z -= st.speed;
        if (t.z < 0.5) { t.z += 48; rollTree(t); }
      }

      if (st.deer.length === 0 && st.distance >= st.nextDeerDistance) spawnDeer(st, diff);
      const before = st.deer.length;
      for (const d of st.deer) {
        d.z -= st.speed;
        d.legPhase += 0.45;
        if (Math.abs(d.x) < 0.35 && d.hold > 0) { d.hold--; if (d.hold === 0) d.hold = -1; }
        else d.x += d.dir * d.speed * (d.hold < 0 ? 1.5 : 1);
        if (d.z < 4.2 && d.z > 0.4 && Math.abs(d.x - st.playerX) < 0.55 && st.speed > 0.01) {
          startCrash(st, 'deer', d.x - st.playerX, 'A deer sprinted in front of you and you hit it.');
          st.deer = st.deer.filter((o) => o !== d);
          return;
        }
      }
      st.deer = st.deer.filter((d) => d.z >= 0.3 && Math.abs(d.x) <= 1.75);
      if (before > 0 && st.deer.length === 0) st.nextDeerDistance = st.distance + (45 + Math.random() * 90) * (1 - 0.5 * diff);
    };

    const draw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const H = 480;
      const W = (H * canvas.width) / canvas.height;
      ctx.setTransform(canvas.height / H, 0, 0, canvas.height / H, 0, 0);
      ctx.imageSmoothingEnabled = false;

      const st = stateRef.current;
      const car = st.car;
      const meters = Math.floor(st.distance * 2);
      const th = getTheme(meters);
      const horizonY = H * 0.42;
      const centerX = W * 0.5;
      const shake = st.crash ? Math.max(0, 1 - st.crash.t / 45) * 14 : 0;
      const now = Date.now();

      ctx.save();
      if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      ctx.save();
      ctx.translate(0, Math.sin(st.distance * 9) * 2.2 * (st.speed / 0.3));

      const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
      sky.addColorStop(0, th.skyTop); sky.addColorStop(1, th.skyBot);
      ctx.fillStyle = sky;
      ctx.fillRect(0, -10, W, horizonY + 10);
      ctx.fillStyle = 'rgba(200, 210, 190, 0.35)';
      ctx.beginPath(); ctx.arc(W * 0.78, horizonY * 0.4, 24, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = th.sil;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= W; x += 25) ctx.lineTo(x, horizonY - 24 - Math.sin(x * 0.05) * 10 - Math.cos(x * 0.13) * 8);
      ctx.lineTo(W, horizonY);
      ctx.fill();

      const ground = ctx.createLinearGradient(0, horizonY, 0, H);
      ground.addColorStop(0, th.gr1); ground.addColorStop(1, th.gr2);
      ctx.fillStyle = ground;
      ctx.fillRect(0, horizonY, W, H - horizonY + 10);

      /* Wider road: the whole road now fits the screen */
      const roadTopWidth = 30;
      const roadBottomWidth = W * 0.84;
      const roadTopX = centerX - st.playerX * 15 + st.curve * 140;
      const roadBottomX = centerX - st.playerX * W * 0.3;
      const quad = (tw: number, bw: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(roadTopX - tw, horizonY); ctx.lineTo(roadTopX + tw, horizonY);
        ctx.lineTo(roadBottomX + bw, H + 10); ctx.lineTo(roadBottomX - bw, H + 10);
        ctx.closePath(); ctx.fill();
      };
      quad(roadTopWidth * 0.7, roadBottomWidth * 0.58, '#1f1912');
      quad(roadTopWidth * 0.5, roadBottomWidth * 0.5, '#14151b');
      ctx.strokeStyle = 'rgba(170,170,160,0.3)'; ctx.lineWidth = 3;
      for (const s of [-0.47, 0.47]) {
        ctx.beginPath(); ctx.moveTo(roadTopX + s * roadTopWidth, horizonY); ctx.lineTo(roadBottomX + s * roadBottomWidth, H + 10); ctx.stroke();
      }
      ctx.strokeStyle = '#8f6f33';
      const phase = (st.distance * 1.5) % 1;
      for (let i = 0; i < 16; i++) {
        const z1 = (i + phase) * 2.5 + 1, z2 = z1 + 1.1;
        const p1 = Math.min(1, (1 / z1) * 1.6), p2 = Math.min(1, (1 / z2) * 1.6);
        ctx.lineWidth = Math.max(1.5, 9 / z1);
        ctx.beginPath();
        ctx.moveTo(roadTopX + (roadBottomX - roadTopX) * p1, horizonY + (H - horizonY) * p1);
        ctx.lineTo(roadTopX + (roadBottomX - roadTopX) * p2, horizonY + (H - horizonY) * p2);
        ctx.stroke();
      }

      const roadHalf = (p: number) => roadTopWidth * 0.5 + (roadBottomWidth * 0.5 - roadTopWidth * 0.5) * p;

      /* Four tree species with bark, jagged boughs, lit side and sway */
      const drawTree = (t: Tree) => {
        const p = 1.6 / t.z;
        if (p <= 0 || p > 2.4) return;
        const sy = horizonY + (H - horizonY) * p;
        const sx = roadTopX + (roadBottomX - roadTopX) * p + t.side * roadHalf(p) * t.offset;
        const tw = 210 * p * t.heightScale;
        const tH = 640 * p * t.heightScale;
        const sway = Math.sin(now / 900 + t.seed * 20) * tw * 0.025;
        const rn = (n: number) => { const v = Math.sin(t.seed * 1000 + n * 12.9898) * 43758.5453; return v - Math.floor(v); };
        const litLeft = t.side === 1; // road is on the left of right-hand trees
        ctx.globalAlpha = Math.min(1, 1.5 - t.z / 40);

        const trunk = (w0: number, w1: number, h: number, col: string, lit: string, bend: number) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(sx - w0, sy); ctx.lineTo(sx - w1 + bend, sy - h); ctx.lineTo(sx + w1 + bend, sy - h); ctx.lineTo(sx + w0, sy);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = lit;
          ctx.beginPath();
          const a = litLeft ? -1 : 1;
          ctx.moveTo(sx + a * w0, sy); ctx.lineTo(sx + a * w1 + bend, sy - h); ctx.lineTo(sx + a * w1 * 0.2 + bend, sy - h); ctx.lineTo(sx + a * w0 * 0.2, sy);
          ctx.closePath(); ctx.fill();
        };
        const litTint = 'rgba(190,200,150,0.09)';

        if (t.kind === 'pine') {
          trunk(tw * 0.09, tw * 0.05, tH * 0.3, '#22150c', 'rgba(150,100,60,0.25)', 0);
          for (let l = 0; l < 7; l++) {
            const bot = sy - tH * (0.12 + l * 0.115), tip = bot - tH * 0.27, hw = tw * (0.62 - l * 0.07), hh = bot - tip;
            const sw = sway * (l + 1) / 7;
            ctx.fillStyle = l % 2 === 0 ? th.treeA : th.treeB;
            ctx.beginPath();
            ctx.moveTo(sx - hw, bot); ctx.lineTo(sx - hw * 0.5, bot - hh * 0.42); ctx.lineTo(sx - hw * 0.7, bot - hh * 0.46);
            ctx.lineTo(sx + sw, tip);
            ctx.lineTo(sx + hw * 0.7, bot - hh * 0.46); ctx.lineTo(sx + hw * 0.5, bot - hh * 0.42); ctx.lineTo(sx + hw, bot);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = litTint;
            ctx.beginPath();
            const a = litLeft ? -1 : 1;
            ctx.moveTo(sx + a * hw, bot); ctx.lineTo(sx + a * hw * 0.5, bot - hh * 0.42); ctx.lineTo(sx + sw, tip); ctx.lineTo(sx, bot);
            ctx.closePath(); ctx.fill();
          }
        } else if (t.kind === 'oak') {
          const h = tH * 0.5;
          trunk(tw * 0.17, tw * 0.08, h, '#2a1c11', 'rgba(170,120,70,0.22)', sway * 0.3);
          ctx.strokeStyle = '#2a1c11'; ctx.lineWidth = Math.max(1.5, tw * 0.05);
          ctx.beginPath();
          ctx.moveTo(sx, sy - h * 0.6); ctx.lineTo(sx - tw * 0.3, sy - h * 0.95);
          ctx.moveTo(sx, sy - h * 0.7); ctx.lineTo(sx + tw * 0.32, sy - h);
          ctx.stroke();
          for (let i = 0; i < 9; i++) {
            const cxp = sx + (rn(i) - 0.5) * tw * 0.95 + sway, cyp = sy - h * 0.95 - rn(i + 20) * tH * 0.32, r = tw * (0.2 + rn(i + 40) * 0.14);
            ctx.fillStyle = i % 2 ? th.treeA : th.treeB;
            ctx.beginPath(); ctx.arc(cxp, cyp, r, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = litTint;
            ctx.beginPath(); ctx.arc(cxp + (litLeft ? -r * 0.25 : r * 0.25), cyp - r * 0.2, r * 0.6, 0, Math.PI * 2); ctx.fill();
          }
        } else if (t.kind === 'birch') {
          const h = tH * 0.78;
          trunk(tw * 0.055, tw * 0.035, h, '#b9b6a8', 'rgba(255,255,240,0.25)', sway * 0.5);
          ctx.fillStyle = '#1b1a17';
          for (let i = 0; i < 9; i++) ctx.fillRect(sx - tw * 0.05 + sway * 0.5 * (i / 9), sy - h * (0.08 + i * 0.1), tw * (0.03 + rn(i) * 0.05), Math.max(1, tw * 0.012));
          ctx.strokeStyle = '#a8a597'; ctx.lineWidth = Math.max(1, tw * 0.018);
          for (let i = 0; i < 5; i++) {
            const by = sy - h * (0.45 + i * 0.12), dir = i % 2 ? 1 : -1;
            ctx.beginPath(); ctx.moveTo(sx + sway * 0.4, by); ctx.lineTo(sx + dir * tw * (0.2 + rn(i + 5) * 0.15) + sway, by - tH * 0.08); ctx.stroke();
            ctx.fillStyle = i % 2 ? th.treeB : th.treeA;
            ctx.beginPath(); ctx.ellipse(sx + dir * tw * 0.25 + sway, by - tH * 0.09, tw * 0.13, tw * 0.08, 0, 0, Math.PI * 2); ctx.fill();
          }
        } else {
          const h = tH * 0.7;
          trunk(tw * 0.1, tw * 0.03, h, '#1c1a19', 'rgba(160,150,140,0.2)', sway * 0.4);
          ctx.strokeStyle = '#1c1a19';
          const branch = (bx: number, by: number, len: number, ang: number, depth: number, n: number) => {
            if (depth === 0) return;
            const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
            ctx.lineWidth = Math.max(1, tw * 0.025 * depth);
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(ex, ey); ctx.stroke();
            branch(ex, ey, len * 0.7, ang - 0.5 - rn(n) * 0.4, depth - 1, n + 1);
            branch(ex, ey, len * 0.65, ang + 0.5 + rn(n + 7) * 0.4, depth - 1, n + 3);
          };
          for (let i = 0; i < 3; i++) branch(sx + sway * 0.4, sy - h * (0.5 + i * 0.2), tw * 0.28, -Math.PI / 2 + (i - 1) * 0.9, 3, i * 5);
        }
        ctx.globalAlpha = 1;
        if (t.eyes && p > 0.12 && p < 1.3 && Math.sin(now / (300 + t.heightScale * 400) + t.offset * 9) > -0.85) {
          ctx.fillStyle = t.heightScale > 1.1 ? '#ff2020' : '#ffd84a';
          const ex = sx - t.side * tw * 0.1, ey = sy - tH * 0.3, w = Math.max(2, tw * 0.03);
          ctx.fillRect(ex - tw * 0.05, ey, w, w * 0.5);
          ctx.fillRect(ex + tw * 0.05, ey, w, w * 0.5);
        }
      };

      const drawDeer = (d: Deer) => {
        const p = 1.6 / d.z;
        if (p <= 0 || p > 2.5) return;
        const sy = horizonY + (H - horizonY) * p;
        const sx = roadTopX + (roadBottomX - roadTopX) * p + d.x * roadHalf(p);
        const scale = p * 3.4;
        const bodyW = 68 * scale, bodyH = 32 * scale, legH = 34 * scale;
        ctx.save();
        ctx.translate(sx, sy);
        if (d.dir === -1) ctx.scale(-1, 1);
        const swing = d.hold > 0 ? 0 : Math.sin(d.legPhase) * 12 * scale;
        ctx.strokeStyle = '#4a2c16'; ctx.lineWidth = Math.max(2, 5 * scale);
        ctx.beginPath();
        ctx.moveTo(-bodyW * 0.35, -legH); ctx.lineTo(-bodyW * 0.35 + swing, 0);
        ctx.moveTo(-bodyW * 0.2, -legH); ctx.lineTo(-bodyW * 0.2 - swing, 0);
        ctx.moveTo(bodyW * 0.3, -legH); ctx.lineTo(bodyW * 0.3 - swing, 0);
        ctx.moveTo(bodyW * 0.42, -legH); ctx.lineTo(bodyW * 0.42 + swing, 0);
        ctx.stroke();
        ctx.fillStyle = '#7a4a28';
        ctx.beginPath(); ctx.roundRect(-bodyW * 0.5, -legH - bodyH * 0.85, bodyW, bodyH, 8 * scale); ctx.fill();
        ctx.fillStyle = '#cfcabd';
        ctx.beginPath(); ctx.arc(-bodyW * 0.52, -legH - bodyH * 0.65, 6 * scale, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6a3f20';
        ctx.beginPath();
        ctx.moveTo(bodyW * 0.3, -legH - bodyH * 0.6); ctx.lineTo(bodyW * 0.52, -legH - bodyH * 1.45);
        ctx.lineTo(bodyW * 0.35, -legH - bodyH * 1.45); ctx.lineTo(bodyW * 0.15, -legH - bodyH * 0.6);
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.ellipse(bodyW * 0.52, -legH - bodyH * 1.48, 14 * scale, 8 * scale, 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = '#ff3030'; ctx.shadowBlur = 12 * scale;
        ctx.fillStyle = '#ff5a3a';
        ctx.beginPath(); ctx.arc(bodyW * 0.54, -legH - bodyH * 1.52, Math.max(1.5, 3.2 * scale), 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#b8a58c'; ctx.lineWidth = Math.max(1.5, 3 * scale);
        ctx.beginPath();
        ctx.moveTo(bodyW * 0.44, -legH - bodyH * 1.55); ctx.lineTo(bodyW * 0.38, -legH - bodyH * 2.05); ctx.lineTo(bodyW * 0.25, -legH - bodyH * 2.2);
        ctx.moveTo(bodyW * 0.38, -legH - bodyH * 1.85); ctx.lineTo(bodyW * 0.52, -legH - bodyH * 2.1);
        ctx.stroke();
        ctx.restore();
      };

      const sprites: { z: number; draw: () => void }[] = [];
      for (const t of st.trees) sprites.push({ z: t.z, draw: () => drawTree(t) });
      for (const d of st.deer) sprites.push({ z: d.z, draw: () => drawDeer(d) });
      sprites.sort((a, b) => b.z - a.z).forEach((s) => s.draw());

      const fog = ctx.createLinearGradient(0, horizonY - 110, 0, horizonY + 150);
      fog.addColorStop(0, `rgba(${th.fog},0)`); fog.addColorStop(0.45, `rgba(${th.fog},0.6)`); fog.addColorStop(1, `rgba(${th.fog},0)`);
      ctx.fillStyle = fog;
      ctx.fillRect(0, horizonY - 110, W, 260);
      ctx.restore(); // end bob

      const flick = Math.random() < 0.03 ? 0.25 : 0;
      const dark = ctx.createRadialGradient(centerX, H * 0.62, 40, centerX, H * 0.62, W * 0.6);
      dark.addColorStop(0, `rgba(0,0,0,${0.1 + flick})`); dark.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.fillStyle = dark;
      ctx.fillRect(0, 0, W, H);
      const beam = ctx.createRadialGradient(centerX, H * 0.82, 20, centerX, H * 0.65, W * 0.4);
      beam.addColorStop(0, 'rgba(255,245,200,0.24)'); beam.addColorStop(1, 'rgba(255,245,200,0)');
      ctx.fillStyle = beam;
      ctx.fillRect(0, horizonY, W, H - horizonY);

      if (st.nitroF > 0.05) {
        ctx.fillStyle = `rgba(70,150,255,${0.1 * st.nitroF})`;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = `rgba(160,210,255,${0.35 * st.nitroF})`; ctx.lineWidth = 2;
        for (let i = 0; i < 18; i++) {
          const a = Math.random() * Math.PI * 2, r0 = 120 + Math.random() * 80, r1 = r0 + 60 + Math.random() * 120;
          ctx.beginPath(); ctx.moveTo(centerX + Math.cos(a) * r0 * 2, horizonY + Math.sin(a) * r0);
          ctx.lineTo(centerX + Math.cos(a) * r1 * 2, horizonY + Math.sin(a) * r1); ctx.stroke();
        }
      }

      if (st.status !== 'START') {
        const sp = Math.floor(now / 220) % 2;
        const sg = ctx.createLinearGradient(sp ? W : 0, 0, W / 2, 0);
        sg.addColorStop(0, rgba(car.siren[sp], 0.3)); sg.addColorStop(1, rgba(car.siren[sp], 0));
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, H);
      }

      if (st.crash) {
        for (const s of st.crash.splats) {
          ctx.fillStyle = 'rgba(120,10,10,0.82)'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(70,5,5,0.7)'; ctx.beginPath(); ctx.arc(s.x + s.r * 0.2, s.y + s.r * 0.2, s.r * 0.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(120,10,10,0.82)'; ctx.fillRect(s.x - 2, s.y + s.r * 0.6, 4, s.drip);
        }
      }

      /* Cockpit: thin pillars and a low hood so the full road stays visible */
      const hood = ctx.createLinearGradient(0, H * 0.82, 0, H * 0.93);
      hood.addColorStop(0, car.hood[0]); hood.addColorStop(1, car.hood[1]);
      ctx.fillStyle = hood;
      ctx.beginPath();
      ctx.moveTo(W * 0.22, H * 0.92); ctx.quadraticCurveTo(centerX, H * 0.8, W * 0.78, H * 0.92);
      ctx.lineTo(W * 0.9, H); ctx.lineTo(W * 0.1, H);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#07090d';
      ctx.fillRect(0, 0, W, 20);
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(W * 0.05, 20); ctx.lineTo(W * 0.015, H * 0.85); ctx.lineTo(0, H * 0.85);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(W, 0); ctx.lineTo(W * 0.95, 20); ctx.lineTo(W * 0.985, H * 0.85); ctx.lineTo(W, H * 0.85);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0d1118';
      ctx.beginPath(); ctx.roundRect(centerX - 55, 12, 110, 26, 6); ctx.fill();
      ctx.strokeStyle = '#1e2633'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#0b0e14';
      ctx.beginPath();
      ctx.moveTo(0, H * 0.9); ctx.quadraticCurveTo(centerX, H * 0.86, W, H * 0.9); ctx.lineTo(W, H); ctx.lineTo(0, H);
      ctx.closePath(); ctx.fill();

      const cx = W * 0.34, cy = H * 0.93;
      ctx.fillStyle = '#05070b';
      ctx.beginPath(); ctx.arc(cx, cy, 44, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = '#243044'; ctx.lineWidth = 3; ctx.stroke();
      const ang = Math.PI + Math.min(1, st.speed / (car.maxKmh / 400)) * Math.PI;
      ctx.strokeStyle = car.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * 38, cy + Math.sin(ang) * 38); ctx.stroke();

      ctx.save();
      ctx.translate(cx, H * 1.0);
      ctx.rotate(st.wheelAngle);
      ctx.strokeStyle = '#12151c'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.arc(0, 0, 82, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#242b3a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, 82, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = car.accent; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.arc(0, 0, 82, -Math.PI / 2 - 0.08, -Math.PI / 2 + 0.08); ctx.stroke();
      ctx.fillStyle = '#0f121a';
      ctx.fillRect(-78, -8, 156, 18); ctx.fillRect(-14, 0, 28, 78);
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      /* GPS map, bottom left */
      const mx = 12, my = H - 124, mw = 146, mh = 108;
      ctx.save();
      ctx.translate(mx, my);
      ctx.fillStyle = '#050d09'; ctx.fillRect(0, 0, mw, mh);
      ctx.strokeStyle = '#3f5c46'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, mw, mh);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.strokeStyle = '#223428'; ctx.lineWidth = 5;
      ctx.beginPath(); MAP_PATH.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      const done = mapPoints(st.mapProg);
      ctx.strokeStyle = car.accent; ctx.lineWidth = 3;
      ctx.beginPath(); done.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      const [dx, dy] = MAP_PATH[MAP_PATH.length - 1];
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(dx, dy - 14, 2, 10); ctx.fillRect(dx + 2, dy - 14, 8, 5);
      const [px, py] = done[done.length - 1];
      ctx.fillStyle = Math.floor(now / 400) % 2 ? '#ffffff' : car.accent;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7fa68a'; ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left'; ctx.fillText(car.place, 6, 14);
      ctx.textAlign = 'right'; ctx.fillText(`${(12 * (1 - st.mapProg)).toFixed(1)} km`, mw - 6, mh - 6);
      ctx.restore();
      ctx.restore(); // end shake

      if (st.crash) {
        for (const p of st.crash.particles) {
          if (p.life <= 0) continue;
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        }
        if (st.crash.t < 12) {
          const a = 0.5 * (1 - st.crash.t / 12);
          ctx.fillStyle = st.crash.kind === 'deer' ? `rgba(220,20,20,${a})` : `rgba(255,255,255,${a})`;
          ctx.fillRect(0, 0, W, H);
        }
      }
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let i = 0; i < 40; i++) ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    };

    const loop = () => {
      update();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) draw(ctx, canvas);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const stats: [string, string | number, string][] = [
    ['Speed', hud.speed, 'km/h'], ['Gear', hud.gear, ''], ['Time', fmt(hud.time), ''], ['Distance', hud.meters, 'm'], ['Best', highScore, 'm'],
  ];
  const ev = hud.ev;

  return (
    <div className="fixed inset-0 bg-black text-white font-mono select-none overflow-hidden">
      <style>{`
        @keyframes sirenA { 0%,49% { opacity: 1 } 50%,100% { opacity: .12 } }
        @keyframes sirenB { 0%,49% { opacity: .12 } 50%,100% { opacity: 1 } }
        @keyframes roadmove { to { background-position: 0 40px } }
      `}</style>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated', filter: 'brightness(0.85) contrast(1.15) saturate(0.7)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px), radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)' }} />

      {gameState === 'PLAYING' && (
        <>
          <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="text-xs text-slate-400">
                <div className="text-sm text-slate-200 mb-1">{selected.mission}</div>
                <kbd className="px-1 bg-slate-800 rounded">W</kbd> gas <kbd className="px-1 bg-slate-800 rounded">S</kbd> brake <kbd className="px-1 bg-slate-800 rounded">A</kbd>
                <kbd className="px-1 bg-slate-800 rounded">D</kbd> steer <kbd className="px-1 bg-slate-800 rounded">K</kbd> up <kbd className="px-1 bg-slate-800 rounded">J</kbd> down <kbd className="px-1 bg-sky-700 rounded">N</kbd> nitro
              </div>
              <div className="flex items-end gap-5">
                {stats.map(([l, v, u]) => (
                  <div key={l} className="text-right">
                    <span className="block text-[11px] uppercase tracking-wider text-slate-400">{l}</span>
                    <span className={`text-xl font-bold ${l === 'Time' && hud.time <= 30 ? 'text-red-500' : 'text-indigo-400'}`}>{v} <small className="text-xs font-normal">{u}</small></span>
                  </div>
                ))}
                <div className="w-28">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-400 text-right">RPM</span>
                  <div className="h-3 bg-slate-800 mt-1"><div className={`h-full ${hud.rpm > 0.95 ? 'bg-red-500' : 'bg-indigo-400'}`} style={{ width: `${Math.min(100, hud.rpm * 100)}%` }} /></div>
                  <span className="block text-[11px] uppercase tracking-wider text-sky-300 text-right mt-1">Nitro</span>
                  <div className="h-3 bg-slate-800 mt-1"><div className="h-full bg-sky-400" style={{ width: `${hud.nitro}%` }} /></div>
                </div>
              </div>
            </div>
            {hud.msg && <p className="mt-3 text-center text-sm font-bold text-red-500">{hud.msg}</p>}
            {hud.toast && <p className="mt-2 text-center text-sm font-bold text-emerald-300">{hud.toast}</p>}
          </div>

          {ev && (
            <div className="absolute right-3 top-28 w-80 rounded-xl border border-white/20 bg-black/80 p-4 backdrop-blur">
              <div className="text-[11px] text-slate-400">{ev.who}</div>
              <div className="text-sm font-bold mb-1">{ev.title}</div>
              <p className="text-xs text-slate-300 mb-3">{ev.text}</p>
              {ev.kind === 'talk' ? (
                <div className="flex flex-col gap-2">
                  {ev.options.map((o, i) => (
                    <button key={o} type="button" onClick={() => answer(i + 1)} className="text-left text-xs px-3 py-2 rounded-lg border border-white/25 hover:bg-white/10 cursor-pointer">
                      <b className="text-indigo-300 mr-2">{i + 1}</b>{o}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex gap-1.5 justify-center">
                  {ev.seq.map((c, i) => (
                    <div key={i} className={`w-9 h-10 flex items-center justify-center rounded-md text-lg font-bold uppercase border-2 ${i < ev.idx ? 'bg-emerald-600 border-emerald-400' : i === ev.idx ? 'border-white bg-white/15' : 'border-slate-600 text-slate-400'}`}>{c}</div>
                  ))}
                </div>
              )}
              <div className="h-1.5 mt-3 bg-slate-800 rounded"><div className="h-full rounded bg-amber-400" style={{ width: `${ev.left * 100}%` }} /></div>
            </div>
          )}
        </>
      )}

      {gameState === 'START' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center overflow-auto"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a1f33 0%, #05060b 70%)' }}>
          <h2 className="text-4xl font-extrabold mb-1 tracking-tight">Night Run</h2>
          <p className="max-w-xl text-slate-300 text-xs mb-5 leading-relaxed">
            Pick your emergency vehicle and reach the scene within {fmt(TIME_LIMIT)}. Shift with K and J, brake gently, watch for deer, hit N for nitro, and answer calls on the radio while you drive.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-[860px] mb-6">
            {VEHICLES.map((c) => {
              const on = selected.id === c.id;
              return (
                <button key={c.id} type="button" onClick={() => setSelected(c)}
                  className="relative p-4 text-left rounded-2xl cursor-pointer overflow-hidden transition-transform duration-200"
                  style={{
                    transform: on ? 'translateY(-6px) scale(1.03)' : 'none',
                    border: `2px solid ${on ? c.accent : '#2a3042'}`,
                    boxShadow: on ? `0 0 34px ${c.accent}66, inset 0 0 40px ${c.accent}18` : 'none',
                    background: `radial-gradient(ellipse at 50% 20%, ${c.accent}30, #080a12 70%)`,
                  }}>
                  <div className="absolute inset-x-0 bottom-0 h-20 opacity-40"
                    style={{ background: 'repeating-linear-gradient(0deg, #14151b 0 20px, #1d1f27 20px 40px)', animation: on ? 'roadmove .5s linear infinite' : 'none' }} />
                  <div className="relative">
                    <VehicleArt v={c} />
                    <div className="text-lg font-extrabold mt-1">{c.name}</div>
                    <div className="text-[11px] text-slate-300 mb-3">{c.mission}</div>
                    <div className="flex flex-col gap-1.5">
                      <StatBar label="Speed" v={c.maxKmh / 170} color={c.accent} />
                      <StatBar label="Accel" v={c.accel / 0.0034} color={c.accent} />
                      <StatBar label="Brakes" v={c.brake / 0.0024} color={c.accent} />
                      <StatBar label="Handling" v={c.handling / 1.2} color={c.accent} />
                    </div>
                    <div className="mt-3 text-[11px] font-bold" style={{ color: c.accent }}>{c.maxKmh} km/h top speed</div>
                  </div>
                </button>
              );
            })}
          </div>
          <button type="button" onClick={initGame} className="px-10 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold cursor-pointer text-lg">Start Driving</button>
        </div>
      )}

      {gameState === 'ENDED' && ending && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center ${ending.won ? 'bg-emerald-950/85' : 'bg-red-950/85'}`}>
          <h2 className="text-4xl font-extrabold mb-2">{ending.title}</h2>
          <p className="max-w-md text-slate-200 text-sm mb-4">{ending.text}</p>
          <p className="text-lg text-indigo-400 mb-6">Distance driven: <b>{hud.meters} m</b></p>
          <div className="flex gap-3">
            <button type="button" onClick={initGame} className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold cursor-pointer">Try Again</button>
            <button type="button" onClick={changeVehicle} className="px-6 py-2.5 rounded-xl border-2 border-white/60 hover:bg-white/10 font-bold cursor-pointer">Change Vehicle</button>
          </div>
        </div>
      )}
    </div>
  );
}
