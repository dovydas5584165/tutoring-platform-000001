
'use client';

import React, { useEffect, useRef, useState } from 'react';

/* ---------- Types ---------- */
type TreeKind = 'pine' | 'oak' | 'birch' | 'dead';
type ObsKind = 'bump' | 'pothole' | 'person' | 'carcass' | 'log';
type CrashKind = 'deer' | 'tree' | 'car' | 'person';
interface Tree { z: number; side: -1 | 1; offset: number; heightScale: number; eyes: boolean; kind: TreeKind; seed: number }
interface Deer { z: number; x: number; dir: -1 | 1; speed: number; legPhase: number; hold: number; turns: number; turnT: number }
interface Obstacle { z: number; x: number; kind: ObsKind; seed: number; hit: boolean }
interface Traffic { z: number; x: number; v: number; dir: -1 | 1; color: string; seed: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; size: number; color: string }
interface Splat { x: number; y: number; r: number; drip: number }
interface Crash { t: number; kind: CrashKind; particles: Particle[]; splats: Splat[]; reason: string }
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
  obstacles: Obstacle[]; nextObsDistance: number; cars: Traffic[]; carTimer: number;
  gear: number; shiftT: number; stallT: number; brakeLevel: number; locked: boolean; msg: string;
  curve: number; cA: number; cB: number; frame: number;
  engine: number; nitroLock: boolean; jolt: number; splats: Splat[]; splatT: number;
  willArrive: boolean; mapProg: number; mapPath: [number, number][]; mapTotal: number;
  mapKnots: number[]; mapSum: number; mapFrames: number;
  ev: ActiveEv | null; evTimer: number; pending: string[]; nitro: number; nitroF: number; limit: number; minLimit: number;
  toast: string; toastT: number;
}
interface Ending { won: boolean; title: string; text: string }
interface Hud { speed: number; gear: number; rpm: number; msg: string; time: number; meters: number; nitro: number; nlock: boolean; engine: number; toast: string; ev: EvView | null }

/* ---------- Constants ---------- */
const WIN_CHANCE = 0.2;
const WIN_ARRIVE = 60;
const WIN_LIMIT = 90;
const LOSE_ARRIVE = 120;
const LOSE_LIMIT = 60;
const GEAR_FRAC = [0.22, 0.42, 0.62, 0.82, 1];
const GEAR_MULT = [2.0, 1.4, 1.0, 0.75, 0.55];
const DEATH_CHANCE = 0.3;
const COMBO_POOL = 'qertyuiopfghlzxcvbm'.split('');
const GAME_KEYS = 'wasdkjn';
const CAR_COLORS = ['#7f1d1d', '#1e3a5f', '#3f3f46', '#14532d', '#78350f', '#52525b', '#4c1d95', '#a8a29e'];

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

const curveAt = (d: number, a: number, b: number) => {
  const s = Math.max(-1, Math.min(1, 0.7 * Math.sin(d * 0.021 + a) + 0.55 * Math.sin(d * 0.0537 + b)));
  const m = Math.max(0, Math.abs(s) - 0.3) / 0.7;
  return Math.sign(s) * m * Math.min(1, d / 80);
};

const makeMap = (): { path: [number, number][]; total: number } => {
  const n = 8 + Math.floor(Math.random() * 4);
  const path: [number, number][] = [];
  let y = 70 + Math.random() * 22;
  for (let i = 0; i < n; i++) {
    const x = 12 + (112 * i) / (n - 1) + (i > 0 && i < n - 1 ? (Math.random() - 0.5) * 10 : 0);
    if (i === n - 1) y = 10 + Math.random() * 30;
    else if (i > 0) y = Math.min(92, Math.max(14, y + (Math.random() - 0.5) * 60));
    path.push([x, y]);
  }
  const total = path.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]), 0);
  return { path, total };
};
const mapPoints = (path: [number, number][], total: number, f: number) => {
  const target = f * total;
  let acc = 0;
  const pts: [number, number][] = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const [x0, y0] = path[i - 1], [x1, y1] = path[i];
    const l = Math.hypot(x1 - x0, y1 - y0);
    if (acc + l >= target) { const k = (target - acc) / l; pts.push([x0 + (x1 - x0) * k, y0 + (y1 - y0) * k]); return pts; }
    acc += l;
    pts.push(path[i]);
  }
  return pts;
};
const mapRateAt = (knots: number[], f: number, frames: number) => {
  const u = (Math.min(f, frames) / frames) * (knots.length - 1);
  const i = Math.min(knots.length - 2, Math.floor(u));
  const k = u - i, s = k * k * (3 - 2 * k);
  return knots[i] + (knots[i + 1] - knots[i]) * s;
};

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
  const map = makeMap();
  const mapFrames = (willArrive ? WIN_ARRIVE : LOSE_ARRIVE) * 60;
  const mapKnots = Array.from({ length: 14 }, () => 0.3 + Math.random() * 1.9);
  let mapSum = 0;
  for (let f = 0; f < mapFrames; f++) mapSum += mapRateAt(mapKnots, f, mapFrames);
  return {
    status, car, playerX: 0.5, speed: 0, distance: 0, wheelAngle: 0,
    keys: { w: false, a: false, s: false, d: false, n: false },
    trees, deer: [], nextDeerDistance: 100 + Math.random() * 60, crash: null,
    obstacles: [], nextObsDistance: 50 + Math.random() * 30, cars: [], carTimer: 100 + Math.random() * 100,
    gear: 1, shiftT: 0, stallT: 0, brakeLevel: 0, locked: false, msg: '',
    curve: 0, cA: Math.random() * 6.28, cB: Math.random() * 6.28, frame: 0,
    engine: 100, nitroLock: false, jolt: 0, splats: [], splatT: 0,
    willArrive, mapProg: 0, mapPath: map.path, mapTotal: map.total, mapKnots, mapSum, mapFrames,
    ev: null, evTimer: 18 * 60 + Math.random() * 600, pending: [], nitro: 100, nitroF: 0,
    limit: (willArrive ? WIN_LIMIT : LOSE_LIMIT) * 60, minLimit: (willArrive ? 66 : 25) * 60,
    toast: '', toastT: 0,
  };
};

const spawnDeer = (st: GameState, diff: number) => {
  const make = (dir: -1 | 1, zBonus: number): Deer => {
    const z = 22 - diff * 4 + Math.random() * 6 + zBonus;
    const x = dir === 1 ? -1.2 : 1.2;
    let speed = 0.10 + Math.random() * 0.07 + diff * 0.04;
    return {
      z, x, dir, speed, legPhase: 0,
      hold: Math.random() < 0.3 ? 10 + Math.floor(Math.random() * 20) : 0,
      turns: 0, turnT: Math.random() < 0.5 ? 10 + Math.floor(Math.random() * 30) : 9999,
    };
  };
  const dir: -1 | 1 = Math.random() < 0.5 ? 1 : -1;
  st.deer.push(make(dir, 0));
  if (diff > 0.3 && Math.random() < 0.5) st.deer.push(make(dir === 1 ? -1 : 1, 4));
};

const spawnObstacle = (st: GameState) => {
  const r = Math.random();
  const kind: ObsKind = r < 0.28 ? 'bump' : r < 0.5 ? 'pothole' : r < 0.68 ? 'person' : r < 0.84 ? 'carcass' : 'log';
  let x = (Math.random() * 2 - 1) * 0.65;
  if (kind === 'bump') x = 0;
  if (kind === 'log') x = (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.3);
  st.obstacles.push({ z: 42 + Math.random() * 30, x, kind, seed: Math.random(), hit: false });
};

const spawnCar = (st: GameState) => {
  const dir: -1 | 1 = Math.random() < 0.55 ? -1 : 1;
  if (st.cars.some((c) => c.dir === dir && Math.abs(c.z - 45) < 12)) return;
  st.cars.push({
    z: 45, dir, x: (dir === -1 ? -0.45 : 0.45) + (Math.random() - 0.5) * 0.1,
    v: dir === -1 ? 0.10 + Math.random() * 0.10 : 0.08 + Math.random() * 0.10,
    color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)], seed: Math.random(),
  });
};

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

export default function ForestDeerGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'ENDED'>('START');
  const [selected, setSelected] = useState<Vehicle>(VEHICLES[0]);
  const [highScore, setHighScore] = useState(0);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [hud, setHud] = useState<Hud>({ speed: 0, gear: 1, rpm: 0, msg: '', time: LOSE_LIMIT, meters: 0, nitro: 100, nlock: false, engine: 100, toast: '', ev: null });
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

    const startCrash = (st: GameState, kind: CrashKind, hx: number, reason: string) => {
      const gore = kind === 'deer' || kind === 'person';
      const cols = gore ? ['#b91c1c', '#dc2626', '#7f1d1d', '#991b1b']
        : kind === 'car' ? ['#d1d5db', '#9ca3af', '#f59e0b', '#374151']
        : ['#8b5a2b', '#4a3524', '#2f6b3f', '#c9c9c9'];
      const particles: Particle[] = [];
      for (let i = 0; i < (gore ? 120 : 60); i++) {
        particles.push({ x: 380 + hx * 180, y: 250, vx: (Math.random() - 0.5) * 24, vy: -Math.random() * 16 - 2, life: 40 + Math.random() * 40, size: 3 + Math.random() * 8, color: cols[Math.floor(Math.random() * cols.length)] });
      }
      const splats: Splat[] = [];
      if (gore) for (let i = 0; i < 16; i++) splats.push({ x: 150 + Math.random() * 460, y: 40 + Math.random() * 230, r: 10 + Math.random() * 38, drip: 0 });
      st.status = 'CRASH';
      st.ev = null;
      st.crash = { t: 0, kind, particles, splats, reason };
    };

    const toast = (st: GameState, s: string) => { st.toast = s; st.toastT = 150; };

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
          st.limit = Math.max(st.minLimit, st.frame + 120, st.limit - 5 * 60);
          toast(st, 'Too slow. -5 seconds');
        }
      }
      return false;
    };

    const hitObstacle = (st: GameState, o: Obstacle): boolean => {
      const dx = Math.abs(o.x - st.playerX);
      const s = st.speed;
      if (o.kind === 'bump') {
        o.hit = true;
        if (s > 0.32) { st.jolt = 1.4; st.speed *= 0.7; st.engine = Math.max(1, st.engine - 12); toast(st, 'HARD LANDING - SUSPENSION DAMAGED'); }
        else if (s > 0.2) { st.jolt = 0.7; st.speed *= 0.9; toast(st, 'Speed bump - slow down'); }
        else st.jolt = Math.max(st.jolt, s / 0.2 * 0.3);
      } else if (o.kind === 'pothole' && dx < 0.35) {
        o.hit = true;
        st.jolt = 0.8 + s; st.speed *= 0.85; st.engine = Math.max(1, st.engine - (s > 0.3 ? 6 : 2));
        toast(st, 'POTHOLE');
      } else if (o.kind === 'carcass' && dx < 0.42) {
        o.hit = true;
        st.jolt = 0.9; st.speed *= 0.6;
        for (let i = 0; i < 7; i++) st.splats.push({ x: 150 + Math.random() * 460, y: 120 + Math.random() * 150, r: 8 + Math.random() * 22, drip: 0 });
        st.splatT = 260;
        toast(st, 'You drove over something dead');
      } else if (o.kind === 'person' && dx < 0.4) {
        o.hit = true;
        startCrash(st, 'person', o.x - st.playerX, 'You ran over a stranger standing in the road. They never moved.');
        return true;
      } else if (o.kind === 'log' && dx < 0.52) {
        o.hit = true;
        if (s > 0.12) { startCrash(st, 'tree', o.x - st.playerX, 'You slammed into a fallen log at full speed.'); return true; }
        st.speed = 0; st.jolt = 0.6; toast(st, 'Blocked by a log - steer around it');
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
      if (st.jolt > 0) st.jolt = st.jolt > 0.02 ? st.jolt * 0.9 : 0;
      if (st.splatT > 0) {
        st.splatT--;
        for (const s of st.splats) s.drip = Math.min(60, s.drip + 0.3);
        if (st.splatT === 0) st.splats = [];
      }
      const keys = st.keys;
      const top = (g: number) => (car.maxKmh / 400) * GEAR_FRAC[g - 1] * (1 + 0.3 * st.nitroF);
      let rpm = st.speed / top(st.gear);

      if (st.shiftT > 0) st.shiftT--;
      if (st.stallT > 0 && keys.w) st.stallT--;
      if (st.nitroLock && st.nitro >= 30) st.nitroLock = false;
      const nit = keys.n && st.nitro > 0 && !st.nitroLock && st.stallT === 0 && st.shiftT === 0;
      st.nitroF += ((nit ? 1 : 0) - st.nitroF) * 0.06;
      st.nitro = nit ? Math.max(0, st.nitro - 0.5) : Math.min(100, st.nitro + 0.03);
      if (nit && st.nitro <= 0) st.nitroLock = true;
      const power = Math.min(1, 0.3 + st.engine / 55);
      let acc = 0;
      if (st.stallT === 0 && st.shiftT === 0 && keys.w) {
        const tq = rpm < 0.18 ? 0.25 : rpm < 0.8 ? 1 : rpm < 1 ? 1 - (rpm - 0.8) * 4 : -0.4;
        acc = car.accel * tq * GEAR_MULT[st.gear - 1] * power;
      }
      if (nit) acc += car.accel * 1.6 * power;
      st.brakeLevel = keys.s ? Math.min(1, st.brakeLevel + 0.05) : Math.max(0, st.brakeLevel - 0.12);
      st.locked = st.brakeLevel > 0.85 && st.speed > 0.15;
      let dec = 0.0004 + st.speed * st.speed * 0.0015;
      if ((!keys.w && !nit) || st.stallT > 0) dec += 0.0008 + 0.0012 * Math.min(1.3, rpm);
      if (rpm > 1.05) dec += Math.min(0.006, (rpm - 1) * 0.004);
      dec += car.brake * st.brakeLevel * (st.locked ? 0.55 : 1);
      st.speed = Math.max(0, st.speed + acc - dec);
      rpm = st.speed / top(st.gear);
      if (st.gear > 1 && rpm < 0.09 && st.stallT === 0) { st.stallT = 60; st.gear = 1; }

      if (rpm > 0.97 && st.speed > 0.02) st.engine = Math.max(0, st.engine - (0.12 + (rpm - 0.97) * 1.5));
      else if (rpm < 0.85) st.engine = Math.min(100, st.engine + 0.004);
      if (st.engine <= 0) {
        end(st, { won: false, title: 'Engine Blown', text: 'You redlined the engine until it tore itself apart on the road.' }, meters);
        return;
      }

      st.msg = st.stallT > 0 ? 'ENGINE STALLED - HOLD W TO RESTART'
        : st.locked ? 'WHEELS LOCKED - RELEASE THE BRAKE'
        : rpm > 0.97 ? (st.gear < 5 ? 'REDLINE - SHIFT UP (K) - ENGINE DAMAGE' : 'REDLINE - EASE OFF THE GAS - ENGINE DAMAGE')
        : keys.w && rpm < 0.2 && st.gear > 1 ? 'ENGINE LUGGING - SHIFT DOWN (J)'
        : st.engine < 40 ? 'ENGINE DAMAGED - POWER LOSS' : '';

      st.curve = curveAt(st.distance, st.cA, st.cB);
      st.playerX -= st.curve * st.speed * st.speed * 0.07;

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
        nitro: st.nitro, nlock: st.nitroLock, engine: st.engine, toast: st.toastT > 0 ? st.toast : '',
        ev: ev ? { kind: ev.kind, title: ev.title, who: ev.who, text: ev.text, options: ev.options, seq: ev.seq, idx: ev.idx, left: ev.t / ev.max, lethal: ev.lethal } : null,
      });

      if (st.mapProg < 1) st.mapProg = Math.min(1, st.mapProg + mapRateAt(st.mapKnots, st.frame, st.mapFrames) / st.mapSum);
      if (st.mapProg >= 0.9999) { end(st, { won: true, title: 'Mission Complete', text: car.winText }, meters); return; }
      if (st.frame >= st.limit) { end(st, { won: false, title: 'Too Late', text: car.loseText }, meters); return; }

      if (Math.abs(st.playerX) > 0.92) {
        startCrash(st, 'tree', st.playerX > 0 ? 0.9 : -0.9, 'You left the narrow road and slammed into the trees.');
        return;
      }

      for (const t of st.trees) {
        t.z -= st.speed;
        if (t.z < 0.5) { t.z += 48; rollTree(t); }
      }

      if (st.distance >= st.nextObsDistance) { spawnObstacle(st); st.nextObsDistance = st.distance + 30 + Math.random() * 40; }
      for (const o of st.obstacles) {
        o.z -= st.speed;
        if (!o.hit && o.z < 1.6 && o.z > 0.2 && hitObstacle(st, o)) return;
      }
      st.obstacles = st.obstacles.filter((o) => o.z > 0.1);

      if (--st.carTimer <= 0) { spawnCar(st); st.carTimer = 70 + Math.random() * 140; }
      for (const c of st.cars) {
        c.z -= st.speed - c.dir * c.v;
        // Traffic checks obstacles too!
        for (const o of st.obstacles) {
          if (!o.hit && Math.abs(o.z - c.z) < 0.6 && Math.abs(o.x - c.x) < 0.3) {
            c.v *= 0.5; // traffic slows down or brakes for obstacles
          }
        }
        if (c.z < 3 && c.z > 0.3 && Math.abs(c.x - st.playerX) < 0.42) {
          startCrash(st, 'car', c.x - st.playerX, c.dir === -1 ? 'Head-on collision with oncoming traffic.' : 'You plowed into the back of another car.');
          return;
        }
      }
      st.cars = st.cars.filter((c) => c.z > 0.3 && c.z < 85);

      if (st.deer.length === 0 && st.distance >= st.nextDeerDistance) spawnDeer(st, diff);
      const before = st.deer.length;
      for (const d of st.deer) {
        d.z -= st.speed;
        d.legPhase += 0.5;
        if (d.hold > 0 && Math.abs(d.x) < 0.5) { d.hold--; if (d.hold === 0) d.hold = -1; }
        else {
          if (--d.turnT <= 0 && d.turns < 2 && Math.abs(d.x) < 1.1) {
            d.dir = d.dir === 1 ? -1 : 1;
            d.turns++;
            d.turnT = 12 + Math.random() * 25;
          }
          d.x += d.dir * d.speed * (d.hold < 0 ? 1.4 : 1);
        }
        // Wider deer collision box so it's much easier to hit/avoid
        if (d.z < 4.6 && d.z > 0.2 && Math.abs(d.x - st.playerX) < 0.62 && st.speed > 0.01) {
          startCrash(st, 'deer', d.x - st.playerX, 'A deer sprinted in front of you and you hit it.');
          st.deer = st.deer.filter((o) => o !== d);
          return;
        }
      }
      st.deer = st.deer.filter((d) => d.z >= 0.3 && Math.abs(d.x) <= 1.75);
      if (before > 0 && st.deer.length === 0) st.nextDeerDistance = st.distance + (70 + Math.random() * 140) * (1 - 0.5 * diff);
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
      const bob = Math.sin(st.distance * 0.9) * 1.1 * Math.min(1, st.speed / 0.3);
      const jolt = st.jolt > 0 ? Math.sin(st.frame * 1.7) * st.jolt * 7 : 0;
      ctx.translate(0, bob + jolt);

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

      const roadTopWidth = 30;
      const roadBottomWidth = W * 0.84;
      const roadHalf = (p: number) => roadTopWidth * 0.5 + (roadBottomWidth * 0.5 - roadTopWidth * 0.5) * p;
      const roadTopX = centerX - st.playerX * roadTopWidth * 0.5;
      const roadBottomX = centerX - st.playerX * roadBottomWidth * 0.5;

      const offs = new Float32Array(72);
      { let v = 0, o = 0; for (let i = 1; i < 72; i++) { v += curveAt(st.distance + i, st.cA, st.cB) * 0.0035; o += v; offs[i] = o; } }
      const bendAt = (z: number) => {
        if (z <= 0) return 0;
        if (z >= 71) return offs[71];
        const i = Math.floor(z);
        return offs[i] + (offs[i + 1] - offs[i]) * (z - i);
      };
      const roadCX = (p: number, z: number) => roadTopX + (roadBottomX - roadTopX) * p + bendAt(z) * roadHalf(p);
      const rowY = (p: number) => horizonY + (H - horizonY) * p;

      const STEPS = 60;
      const strip = (a: number, b: number, color: string) => {
        const L: [number, number][] = [], R: [number, number][] = [];
        for (let i = 0; i <= STEPS; i++) {
          const p = (i / STEPS) * 1.06;
          const z = p > 0.0001 ? 1.6 / p : 1000;
          const cx = roadCX(p, z), hw = a + (b - a) * p, y = rowY(p);
          L.push([cx - hw, y]); R.push([cx + hw, y]);
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        L.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]);
        ctx.closePath(); ctx.fill();
      };
      strip(roadTopWidth * 0.7, roadBottomWidth * 0.58, '#1f1912');
      strip(roadTopWidth * 0.5, roadBottomWidth * 0.5, '#14151b');

      ctx.strokeStyle = 'rgba(170,170,160,0.3)'; ctx.lineWidth = 3;
      for (const s of [-0.94, 0.94]) {
        ctx.beginPath();
        for (let i = 0; i <= STEPS; i++) {
          const p = (i / STEPS) * 1.06, z = p > 0.0001 ? 1.6 / p : 1000;
          const x = roadCX(p, z) + s * roadHalf(p), y = rowY(p);
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.strokeStyle = '#8f6f33';
      const phase = (st.distance / 2.5) % 1;
      for (let i = 0; i < 24; i++) {
        const z1 = Math.max(1.51, (i + 1 - phase) * 2.5), z2 = z1 + 1.1;
        const p1 = Math.min(1.06, 1.6 / z1), p2 = Math.min(1.06, 1.6 / z2);
        ctx.lineWidth = Math.max(1.5, 9 / z1);
        ctx.beginPath();
        ctx.moveTo(roadCX(p1, z1), rowY(p1));
        ctx.lineTo(roadCX(p2, z2), rowY(p2));
        ctx.stroke();
      }

      const drawTree = (t: Tree) => {
        const p = 1.6 / t.z;
        if (p <= 0 || p > 2.4) return;
        const sy = rowY(p);
        const sx = roadCX(p, t.z) + t.side * roadHalf(p) * t.offset;
        const tw = 210 * p * t.heightScale;
        const tH = 640 * p * t.heightScale;
        const sway = Math.sin(now / 900 + t.seed * 20) * tw * 0.025;
        const rn = (n: number) => { const v = Math.sin(t.seed * 1000 + n * 12.9898) * 43758.5453; return v - Math.floor(v); };
        const litLeft = t.side === 1;
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
        const sy = rowY(p);
        const sx = roadCX(p, d.z) + d.x * roadHalf(p);
        const scale = p * 4.2; // Made deer noticeably larger and easier to hit
        const bodyW = 75 * scale, bodyH = 36 * scale, legH = 38 * scale;
        ctx.save();
        ctx.translate(sx, sy);
        if (d.dir === -1) ctx.scale(-1, 1);
        const swing = d.hold > 0 ? 0 : Math.sin(d.legPhase) * 12 * scale;
        ctx.strokeStyle = '#4a2c16'; ctx.lineWidth = Math.max(2, 6 * scale);
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

      const drawObstacle = (o: Obstacle) => {
        const z = o.z, p = 1.6 / z;
        if (p <= 0 || p > 2.5) return;
        const sy = rowY(p);
        const sx = roadCX(p, z) + o.x * roadHalf(p);
        const sc = p * 3.4;
        ctx.save();
        ctx.globalAlpha = Math.min(1, 1.5 - z / 40);

        if (o.kind === 'bump') {
          const quadAt = (za: number, zb: number, col: string) => {
            const pa = Math.min(1.06, 1.6 / za), pb = Math.min(1.06, 1.6 / zb);
            const ca = roadCX(pa, za), cb = roadCX(pb, zb), ha = roadHalf(pa), hb = roadHalf(pb);
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.moveTo(ca - ha, rowY(pa)); ctx.lineTo(ca + ha, rowY(pa)); ctx.lineTo(cb + hb, rowY(pb)); ctx.lineTo(cb - hb, rowY(pb));
            ctx.closePath(); ctx.fill();
          };
          const z0 = Math.max(1.52, z);
          quadAt(z0, z0 + 1.1, '#2e2a20');
          quadAt(z0 + 0.25, z0 + 0.6, 'rgba(214,170,40,0.75)');
        } else if (o.kind === 'pothole') {
          const rx = roadHalf(p) * 0.28;
          ctx.fillStyle = '#2a2a2e'; ctx.beginPath(); ctx.ellipse(sx, sy, rx * 1.12, rx * 0.26, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#030304'; ctx.beginPath(); ctx.ellipse(sx, sy, rx, rx * 0.21, 0, 0, Math.PI * 2); ctx.fill();
        } else if (o.kind === 'log') {
          const half = roadHalf(p) * 0.42, hh = 24 * sc;
          ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(sx, sy, half * 1.05, hh * 0.25, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#2b1c11'; ctx.beginPath(); ctx.roundRect(sx - half, sy - hh, half * 2, hh, hh / 2); ctx.fill();
          ctx.fillStyle = 'rgba(190,140,90,0.18)'; ctx.beginPath(); ctx.roundRect(sx - half + hh * 0.3, sy - hh * 0.9, half * 2 - hh * 0.6, hh * 0.25, hh * 0.12); ctx.fill();
        } else if (o.kind === 'carcass') {
          ctx.translate(sx, sy);
          ctx.fillStyle = 'rgba(80,8,8,0.85)'; ctx.beginPath(); ctx.ellipse(0, -2 * sc, 48 * sc, 8 * sc, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#4a3020'; ctx.beginPath(); ctx.ellipse(0, -9 * sc, 32 * sc, 10 * sc, 0, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.translate(sx, sy);
          ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(0, 0, 26 * sc, 5 * sc, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#0b0b0f'; ctx.beginPath(); ctx.roundRect(-14 * sc, -110 * sc, 28 * sc, 60 * sc, 6 * sc); ctx.fill();
          ctx.fillStyle = '#cfcabd'; ctx.beginPath(); ctx.arc(0, -118 * sc, 8 * sc, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      };

      const drawTraffic = (c: Traffic) => {
        const z = c.z, p = 1.6 / z;
        if (p <= 0 || p > 2.6) return;
        const sy = rowY(p);
        const sx = roadCX(p, z) + c.x * roadHalf(p);
        const w = roadHalf(p) * 0.38, h = w * 0.7; // Bigger traffic cars
        ctx.save();
        ctx.globalAlpha = Math.min(1, 1.5 - z / 40);
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(sx, sy, w * 0.62, h * 0.1, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = c.color;
        ctx.beginPath(); ctx.roundRect(sx - w / 2, sy - h * 0.62, w, h * 0.46, w * 0.06); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(sx - w * 0.4, sy - h * 0.6); ctx.lineTo(sx - w * 0.3, sy - h); ctx.lineTo(sx + w * 0.3, sy - h); ctx.lineTo(sx + w * 0.4, sy - h * 0.6);
        ctx.closePath(); ctx.fill();
        if (c.dir === 1) {
          ctx.fillStyle = '#ff2a2a';
          ctx.fillRect(sx - w * 0.46, sy - h * 0.52, w * 0.2, h * 0.1); ctx.fillRect(sx + w * 0.26, sy - h * 0.52, w * 0.2, h * 0.1);
        } else {
          ctx.fillStyle = '#fff6c8';
          ctx.fillRect(sx - w * 0.46, sy - h * 0.52, w * 0.2, h * 0.11); ctx.fillRect(sx + w * 0.26, sy - h * 0.52, w * 0.2, h * 0.11);
        }
        ctx.restore();
      };

      const sprites: { z: number; draw: () => void }[] = [];
      for (const t of st.trees) sprites.push({ z: t.z, draw: () => drawTree(t) });
      for (const d of st.deer) sprites.push({ z: d.z, draw: () => drawDeer(d) });
      for (const o of st.obstacles) sprites.push({ z: o.z, draw: () => drawObstacle(o) });
      for (const c of st.cars) sprites.push({ z: c.z, draw: () => drawTraffic(c) });
      sprites.sort((a, b) => b.z - a.z).forEach((s) => s.draw());

      const fog = ctx.createLinearGradient(0, horizonY - 110, 0, horizonY + 150);
      fog.addColorStop(0, `rgba(${th.fog},0)`); fog.addColorStop(0.45, `rgba(${th.fog},0.6)`); fog.addColorStop(1, `rgba(${th.fog},0)`);
      ctx.fillStyle = fog;
      ctx.fillRect(0, horizonY - 110, W, 260);
      ctx.restore();

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
      }

      if (st.status !== 'START') {
        const sp = Math.floor(now / 220) % 2;
        const sg = ctx.createLinearGradient(sp ? W : 0, 0, W / 2, 0);
        sg.addColorStop(0, rgba(car.siren[sp], 0.3)); sg.addColorStop(1, rgba(car.siren[sp], 0));
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, H);
      }

      const splats = st.crash ? st.crash.splats : st.splats;
      if (splats.length) {
        ctx.save();
        ctx.globalAlpha = st.crash ? 1 : Math.min(1, st.splatT / 90);
        for (const s of splats) {
          ctx.fillStyle = 'rgba(120,10,10,0.82)'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(120,10,10,0.82)'; ctx.fillRect(s.x - 2, s.y + s.r * 0.6, 4, s.drip);
        }
        ctx.restore();
      }

      // Bigger, more prominent player car hood in the foreground
      const hood = ctx.createLinearGradient(0, H * 0.76, 0, H);
      hood.addColorStop(0, car.hood[0]); hood.addColorStop(1, car.hood[1]);
      ctx.fillStyle = hood;
      ctx.beginPath();
      ctx.moveTo(W * 0.12, H); ctx.quadraticCurveTo(centerX, H * 0.72, W * 0.88, H);
      ctx.closePath(); ctx.fill();

      if (st.engine < 55 && st.status === 'PLAYING') {
        const sev = (55 - st.engine) / 55;
        for (let i = 0; i < 9; i++) {
          const rise = ((now / 18 + i * 37) % 110);
          const px = centerX + Math.sin(now / 400 + i * 2) * 36 + (i - 4) * 9;
          ctx.fillStyle = `rgba(${st.engine < 25 ? '30,30,30' : '110,110,115'},${0.3 * sev * (1 - rise / 110)})`;
          ctx.beginPath(); ctx.arc(px, H * 0.82 - rise, 12 + rise * 0.25, 0, Math.PI * 2); ctx.fill();
        }
      }

      // GPS map bottom left
      const mx = 12, my = H - 124, mw = 146, mh = 108;
      ctx.save();
      ctx.translate(mx, my);
      ctx.fillStyle = '#050d09'; ctx.fillRect(0, 0, mw, mh);
      ctx.strokeStyle = '#3f5c46'; ctx.lineWidth = 3; ctx.strokeRect(0, 0, mw, mh);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.strokeStyle = '#223428'; ctx.lineWidth = 5;
      ctx.beginPath(); st.mapPath.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      const done = mapPoints(st.mapPath, st.mapTotal, st.mapProg);
      ctx.strokeStyle = car.accent; ctx.lineWidth = 3;
      ctx.beginPath(); done.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      const [dx, dy] = st.mapPath[st.mapPath.length - 1];
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI * 2); ctx.fill();
      const [px, py] = done[done.length - 1];
      ctx.fillStyle = Math.floor(now / 400) % 2 ? '#ffffff' : car.accent;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7fa68a'; ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'left'; ctx.fillText(car.place, 6, 14);
      ctx.textAlign = 'right'; ctx.fillText(`${(12 * (1 - st.mapProg)).toFixed(1)} km`, mw - 6, mh - 6);
      ctx.restore();
      ctx.restore();

      if (st.crash) {
        for (const p of st.crash.particles) {
          if (p.life <= 0) continue;
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        }
      }
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
    <div className="fixed inset-0 bg-black text-white font-mono select-none overflow-hidden flex flex-col justify-between">
      <style>{`
        @keyframes sirenA { 0%,49% { opacity: 1 } 50%,100% { opacity: .12 } }
        @keyframes sirenB { 0%,49% { opacity: .12 } 50%,100% { opacity: 1 } }
      `}</style>

      <div className="relative flex-1 w-full h-full">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ imageRendering: 'pixelated', filter: 'brightness(0.85) contrast(1.15) saturate(0.7)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)' }} />

        {gameState === 'PLAYING' && (
          <>
            <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="text-xs text-slate-400">
                  <div className="text-sm text-slate-200 mb-1">{selected.mission}</div>
                  <span className="hidden sm:inline">
                    <kbd className="px-1 bg-slate-800 rounded">W</kbd> gas <kbd className="px-1 bg-slate-800 rounded">S</kbd> brake <kbd className="px-1 bg-slate-800 rounded">A</kbd>
                    <kbd className="px-1 bg-slate-800 rounded">D</kbd> steer <kbd className="px-1 bg-slate-800 rounded">K</kbd> up <kbd className="px-1 bg-slate-800 rounded">J</kbd> down <kbd className="px-1 bg-sky-700 rounded">N</kbd> nitro
                  </span>
                </div>
                <div className="flex items-end gap-3 sm:gap-5">
                  {stats.map(([l, v, u]) => (
                    <div key={l} className="text-right">
                      <span className="block text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400">{l}</span>
                      <span className={`text-base sm:text-xl font-bold ${l === 'Time' && hud.time <= 30 ? 'text-red-500' : 'text-indigo-400'}`}>{v} <small className="text-[10px] font-normal">{u}</small></span>
                    </div>
                  ))}
                  <div className="w-20 sm:w-28">
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 text-right">RPM</span>
                    <div className="h-2.5 bg-slate-800 mt-1"><div className={`h-full ${hud.rpm > 0.95 ? 'bg-red-500' : 'bg-indigo-400'}`} style={{ width: `${Math.min(100, hud.rpm * 100)}%` }} /></div>
                    <span className="block text-[10px] uppercase tracking-wider text-sky-300 text-right mt-1">Nitro</span>
                    <div className="h-2.5 bg-slate-800 mt-1"><div className={`h-full ${hud.nlock ? 'bg-slate-500' : 'bg-sky-400'}`} style={{ width: `${hud.nitro}%` }} /></div>
                  </div>
                </div>
              </div>
              {hud.msg && <p className="mt-2 text-center text-xs sm:text-sm font-bold text-red-500">{hud.msg}</p>}
              {hud.toast && <p className="mt-1 text-center text-xs sm:text-sm font-bold text-emerald-300">{hud.toast}</p>}
            </div>

            {/* iPhone / Mobile Touch Controls Overlay */}
            <div className="absolute bottom-4 inset-x-4 flex justify-between items-end pointer-events-auto sm:hidden">
              <div className="flex gap-2">
                <button type="button"
                  onPointerDown={() => { stateRef.current.keys.a = true; }}
                  onPointerUp={() => { stateRef.current.keys.a = false; }}
                  className="w-16 h-16 rounded-2xl bg-black/60 border border-white/30 text-2xl font-bold flex items-center justify-center active:bg-white/30">◀</button>
                <button type="button"
                  onPointerDown={() => { stateRef.current.keys.d = true; }}
                  onPointerUp={() => { stateRef.current.keys.d = false; }}
                  className="w-16 h-16 rounded-2xl bg-black/60 border border-white/30 text-2xl font-bold flex items-center justify-center active:bg-white/30">▶</button>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button type="button"
                    onClick={() => { const st = stateRef.current; if (st.gear > 1) { st.gear--; st.shiftT = 14; } }}
                    className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/20 text-xs font-bold">J(-)</button>
                  <button type="button"
                    onClick={() => { const st = stateRef.current; if (st.gear < 5) { st.gear++; st.shiftT = 14; } }}
                    className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/20 text-xs font-bold">K(+)</button>
                  <button type="button"
                    onPointerDown={() => { stateRef.current.keys.n = true; }}
                    onPointerUp={() => { stateRef.current.keys.n = false; }}
                    className="w-12 h-12 rounded-xl bg-sky-600/80 border border-white/30 text-xs font-bold">N</button>
                </div>
                <div className="flex gap-2">
                  <button type="button"
                    onPointerDown={() => { stateRef.current.keys.s = true; }}
                    onPointerUp={() => { stateRef.current.keys.s = false; }}
                    className="w-20 h-16 rounded-2xl bg-red-950/80 border border-red-500/40 text-xs font-bold">BRAKE</button>
                  <button type="button"
                    onPointerDown={() => { stateRef.current.keys.w = true; }}
                    onPointerUp={() => { stateRef.current.keys.w = false; }}
                    className="w-24 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-sm font-bold">GAS</button>
                </div>
              </div>
            </div>

            {ev && (
              <div className="absolute right-3 top-28 sm:top-40 w-72 sm:w-80 rounded-xl border border-white/20 bg-black/90 p-3 sm:p-4 backdrop-blur">
                <div className="text-[10px] text-slate-400">{ev.who}</div>
                <div className="text-xs sm:text-sm font-bold mb-1">{ev.title}</div>
                <p className="text-[11px] sm:text-xs text-slate-300 mb-3">{ev.text}</p>
                {ev.kind === 'talk' ? (
                  <div className="flex flex-col gap-2">
                    {ev.options.map((o, i) => (
                      <button key={o} type="button" onClick={() => answer(i + 1)} className="text-left text-[11px] sm:text-xs px-3 py-2 rounded-lg border border-white/25 hover:bg-white/10 cursor-pointer">
                        <b className="text-indigo-300 mr-2">{i + 1}</b>{o}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-1.5 justify-center">
                    {ev.seq.map((c, i) => (
                      <div key={i} className="w-8 h-9 sm:w-9 sm:h-10 flex items-center justify-center rounded-md text-base sm:text-lg font-bold uppercase border-2 bg-white/10">{c}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {gameState === 'START' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center overflow-auto"
            style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a1f33 0%, #05060b 70%)' }}>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-1 tracking-tight">Night Run</h2>
            <p className="max-w-xl text-slate-300 text-xs mb-4 leading-relaxed">
              Pick your emergency vehicle and reach the scene before the clock runs out. Playable with keyboard or touch controls on iPhone.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-[820px] mb-5">
              {VEHICLES.map((c) => {
                const on = selected.id === c.id;
                return (
                  <button key={c.id} type="button" onClick={() => setSelected(c)}
                    className="relative p-3 text-left rounded-2xl cursor-pointer overflow-hidden transition-transform duration-200"
                    style={{
                      transform: on ? 'translateY(-4px) scale(1.02)' : 'none',
                      border: `2px solid ${on ? c.accent : '#2a3042'}`,
                      background: `radial-gradient(ellipse at 50% 20%, ${c.accent}30, #080a12 70%)`,
                    }}>
                    <VehicleArt v={c} />
                    <div className="text-base font-extrabold mt-1">{c.name}</div>
                    <div className="text-[11px] text-slate-300 mb-2">{c.mission}</div>
                    <div className="flex flex-col gap-1">
                      <StatBar label="Speed" v={c.maxKmh / 170} color={c.accent} />
                      <StatBar label="Handling" v={c.handling / 1.2} color={c.accent} />
                    </div>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={initGame} className="px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold cursor-pointer text-base">Start Driving</button>
          </div>
        )}

        {gameState === 'ENDED' && ending && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center ${ending.won ? 'bg-emerald-950/85' : 'bg-red-950/85'}`}>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">{ending.title}</h2>
            <p className="max-w-md text-slate-200 text-sm mb-4">{ending.text}</p>
            <p className="text-base sm:text-lg text-indigo-400 mb-6">Distance driven: <b>{hud.meters} m</b></p>
            <div className="flex gap-3">
              <button type="button" onClick={initGame} className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold cursor-pointer">Try Again</button>
              <button type="button" onClick={changeVehicle} className="px-6 py-2.5 rounded-xl border-2 border-white/60 hover:bg-white/10 font-bold cursor-pointer">Change Vehicle</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

