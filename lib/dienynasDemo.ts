/**
 * Fictional data and the analytics behind the /dienynas demo (an e-diary for schools with analytics
 * for teachers, administration and parents). Nothing here reads or writes the database.
 *
 * The numbers are simulated from fixed seeds using only + − × ÷ and sqrt (no Math.exp/log/pow), so
 * every JavaScript engine produces the same bits: the server render and the browser always agree.
 */

/* ========================= number helpers ========================= */

export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const mean = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);

/** Semester grade from an average, rounded the way Lithuanian schools do it: x,5 goes up. */
export const roundGrade = (x: number) => clamp(Math.floor(x + 0.5 + 1e-9), 1, 10);

/** 7.25 → "7,3" (Lithuanian decimal comma). */
export const fmt = (x: number, digits = 1) => x.toFixed(digits).replace(".", ",");

/** 0.8 → "+0,8", −0.8 → "−0,8", 0.02 → "0,0". */
export function fmtSigned(x: number, digits = 1) {
  const s = Math.abs(x).toFixed(digits);
  if (Number(s) === 0) return s.replace(".", ",");
  return (x > 0 ? "+" : "−") + s.replace(".", ",");
}

/** 0.62 → "62 %" (Lithuanian spacing). */
export const fmtPct = (p: number, digits = 0) => `${fmt(p * 100, digits)}\u00a0%`;

/** Lithuanian count word: plural(3, ["darbas", "darbai", "darbų"]) → "3 darbai". */
export function plural(n: number, [one, few, many]: [string, string, string]) {
  const d = n % 10, dd = n % 100;
  const word = d === 1 && dd !== 11 ? one : d >= 2 && (dd < 11 || dd > 19) ? few : many;
  return `${n} ${word}`;
}

/** Deterministic PRNG (mulberry32), integer maths only. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Rand = () => number;

/** Roughly standard-normal sample (Irwin–Hall: sum of 12 uniforms − 6). */
const gauss = (r: Rand) => {
  let s = 0;
  for (let i = 0; i < 12; i++) s += r();
  return s - 6;
};

/** e^x with plain arithmetic, so it is bit-identical in every engine. */
function expDet(x: number) {
  let k = 0;
  while (Math.abs(x) > 0.5) { x /= 2; k++; }
  let term = 1, s = 1;
  for (let i = 1; i < 14; i++) { term = (term * x) / i; s += term; }
  while (k-- > 0) s *= s;
  return s;
}
const logistic = (x: number) => 1 / (1 + expDet(-x));

/** "09-22" → weeks since 1 September (the semester's first day). */
export function weekOf(date: string) {
  const [m, d] = date.split("-").map(Number);
  const before = { 9: 0, 10: 30, 11: 61, 12: 91, 1: 122 }[m] ?? 0;
  return (before + d - 1) / 7;
}

/** "11-19" → "lapkričio 19 d." */
export function fmtDate(date: string) {
  const [m, d] = date.split("-").map(Number);
  const months: Record<number, string> = { 9: "rugsėjo", 10: "spalio", 11: "lapkričio", 12: "gruodžio", 1: "sausio" };
  return `${months[m] ?? ""} ${d} d.`;
}

/* ========================= analytics ========================= */

export type WorkType = "KD" | "SD" | "ND";
export const WORK_TYPES: Record<WorkType, string> = {
  KD: "Kontrolinis darbas",
  SD: "Savarankiškas darbas",
  ND: "Namų darbai",
};

export type Prediction = {
  /** Expected semester average (done grades + forecast for the planned works). */
  mean: number;
  /** Expected semester grade and its likely range. */
  grade: number;
  low: number;
  high: number;
  /** Trend in grade points per week (recent works weigh more). */
  slope: number;
  /** Forecast for each planned work, same order as the input. */
  future: number[];
  /** Typical distance of a single grade from the trend line. */
  resid: number;
};

/**
 * Semester grade forecast. Recent grades weigh more (each older one × 0.8) and the trend is fitted
 * by weighted least squares. Future works start halfway between the trend line and the weighted
 * mean (one bad test is not a new normal), the trend is damped to 30 % and capped at ±1,5 points,
 * and the range widens with how jumpy the grades are and how much of the semester is still ahead.
 */
export function predictSemester(points: { t: number; grade: number }[], futureWeeks: number[]): Prediction {
  const n = points.length;
  if (!n) return { mean: 0, grade: 0, low: 0, high: 0, slope: 0, future: [], resid: 0 };
  const w: number[] = [];
  let wi = 1;
  for (let i = n - 1; i >= 0; i--) { w[i] = wi; wi *= 0.8; }
  const sw = sum(w);
  const tm = sum(points.map((p, i) => w[i] * p.t)) / sw;
  const gm = sum(points.map((p, i) => w[i] * p.grade)) / sw;
  const sxx = sum(points.map((p, i) => w[i] * (p.t - tm) * (p.t - tm)));
  const sxy = sum(points.map((p, i) => w[i] * (p.t - tm) * (p.grade - gm)));
  const slope = n > 2 && sxx > 0 ? sxy / sxx : 0;
  const tLast = points[n - 1].t;
  const level = (gm + slope * (tLast - tm) + gm) / 2;
  const future = futureWeeks.map((t) => clamp(level + clamp(slope * 0.3 * (t - tLast), -1.5, 1.5), 1, 10));
  const total = n + future.length;
  const avg = (sum(points.map((p) => p.grade)) + sum(future)) / total;
  const resid = Math.sqrt(sum(points.map((p, i) => w[i] * (p.grade - (gm + slope * (p.t - tm))) ** 2)) / sw);
  const spread = clamp(0.3 + (2.2 * (resid * Math.sqrt(future.length) + Math.abs(slope) * future.length)) / total, 0.35, 1.1);
  return { mean: avg, grade: roundGrade(avg), low: roundGrade(avg - spread), high: roundGrade(avg + spread), slope, future, resid };
}

export type Requirement =
  | { status: "secured" }
  | { status: "impossible"; avg: number }
  | { status: "possible"; avg: number; example: number[] };

/**
 * What the remaining works need for the semester grade (arithmetic mean, x,5 rounds up) to reach
 * `target`, plus one set of whole grades that gets there.
 */
export function requiredAverage(grades: number[], remaining: number, target: number): Requirement {
  const need = (target - 0.5) * (grades.length + remaining) - sum(grades);
  if (remaining <= 0) return need <= 1e-9 ? { status: "secured" } : { status: "impossible", avg: 11 };
  const avg = need / remaining;
  if (avg <= 1) return { status: "secured" };
  if (avg > 10 + 1e-9) return { status: "impossible", avg };
  const total = Math.ceil(need - 1e-9);
  const base = Math.floor(total / remaining);
  const extra = total - base * remaining;
  const example = Array.from({ length: remaining }, (_, i) => (i >= remaining - extra ? base + 1 : base));
  return { status: "possible", avg, example };
}

/** Test score (0–1) → grade on a common school conversion scale (95 % → 10, 85 % → 9 … < 15 % → 1). */
export function scoreToGrade(p: number) {
  let g = 1;
  for (const cut of [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95]) if (p >= cut - 1e-9) g++;
  return g;
}

/** Pearson correlation; 0 when one side doesn't vary. */
function corr(a: number[], b: number[]) {
  const ma = mean(a), mb = mean(b);
  let sab = 0, saa = 0, sbb = 0;
  for (let i = 0; i < a.length; i++) {
    sab += (a[i] - ma) * (b[i] - mb);
    saa += (a[i] - ma) ** 2;
    sbb += (b[i] - mb) ** 2;
  }
  return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : 0;
}

export type Risk = "critical" | "warning" | null;

/* ========================= teacher: 8b mathematics ========================= */

export type Skill = "laipsniai" | "standartine" | "procentai" | "pokyciai" | "skliaustai" | "trupmenos" | "tekstiniai";
export const SKILLS: Record<Skill, string> = {
  laipsniai: "Veiksmai su laipsniais",
  standartine: "Standartinė išraiška",
  procentai: "Procentų skaičiavimas",
  pokyciai: "Procentiniai pokyčiai",
  skliaustai: "Lygtys su skliaustais",
  trupmenos: "Lygtys su trupmenomis",
  tekstiniai: "Tekstiniai uždaviniai",
};

/** Suggested next step for a weak skill. */
const SKILL_TIPS: Record<Skill, string> = {
  laipsniai: "Trumpas kartojimas apie laipsnių savybes pamokos pradžioje.",
  standartine: "Kelios užduotys su labai dideliais ir mažais skaičiais.",
  procentai: "Užduotys „kiek procentų sudaro“ su paprastais skaičiais.",
  pokyciai: "Pakartokite, kaip skaičiuoti padidėjimą ir sumažėjimą procentais.",
  skliaustai: "Skliaustų atskleidimo pratimai prieš sudėtingesnes lygtis.",
  trupmenos: "Skirkite pamoką lygtims su trupmenomis: daugyba iš bendrojo vardiklio.",
  tekstiniai: "Spręskite tekstinius uždavinius poromis: pirmiausia užrašyti lygtį.",
};

type Question = { skill: Skill; b: number; label?: string; /** answers don't depend on ability (unclear wording) */ noisy?: boolean };
export type Work = { date: string; type: WorkType; topic: string; questions?: Question[] };

export const TEACHER = { name: "R. Petrauskienė", subject: "Matematika", className: "8b", period: "I pusmetis" };

/** Works already graded, oldest first. */
export const WORKS: Work[] = [
  { date: "09-08", type: "ND", topic: "Kartojimas" },
  { date: "09-15", type: "SD", topic: "Laipsniai", questions: [
    { skill: "laipsniai", b: -1.3 }, { skill: "laipsniai", b: -0.7 }, { skill: "laipsniai", b: -0.1 }, { skill: "standartine", b: 0.2 },
  ] },
  { date: "09-22", type: "KD", topic: "Laipsniai ir standartinė išraiška", questions: [
    { skill: "laipsniai", b: -1.1 }, { skill: "laipsniai", b: -0.4 }, { skill: "standartine", b: -0.3 },
    { skill: "standartine", b: 0.3 }, { skill: "laipsniai", b: 0.5 }, { skill: "tekstiniai", b: 0.9 },
  ] },
  { date: "09-29", type: "ND", topic: "Standartinė išraiška" },
  { date: "10-06", type: "SD", topic: "Procentai", questions: [
    { skill: "procentai", b: -1.0 }, { skill: "procentai", b: -0.4 }, { skill: "pokyciai", b: 0.5 }, { skill: "procentai", b: 0.1 },
  ] },
  { date: "10-13", type: "KD", topic: "Procentai", questions: [
    { skill: "procentai", b: -1.1 }, { skill: "procentai", b: -0.5 }, { skill: "pokyciai", b: 0.4 },
    { skill: "pokyciai", b: 0.9 }, { skill: "tekstiniai", b: 1.0 }, { skill: "procentai", b: 0.2 },
  ] },
  { date: "10-20", type: "ND", topic: "Lygtys" },
  { date: "10-22", type: "SD", topic: "Tiesinės lygtys", questions: [
    { skill: "skliaustai", b: -0.8 }, { skill: "skliaustai", b: -0.2 }, { skill: "trupmenos", b: 0.9 }, { skill: "skliaustai", b: 0.3 },
  ] },
  { date: "11-05", type: "KD", topic: "Tiesinės lygtys", questions: [
    { skill: "skliaustai", b: -1.4, label: "Paprasta lygtis" },
    { skill: "skliaustai", b: -0.6, label: "Lygtis su skliaustais" },
    { skill: "trupmenos", b: 0.8, label: "Lygtis su trupmenomis" },
    { skill: "skliaustai", b: 0.0, label: "Skliaustai abiejose pusėse" },
    { skill: "tekstiniai", b: 1.75, label: "Uždavinys apie kainas" },
    { skill: "trupmenos", b: 1.85, label: "Trupmenos abiejose pusėse" },
    { skill: "skliaustai", b: -0.3, label: "Sprendinio patikrinimas" },
    { skill: "tekstiniai", b: 0.5, label: "Uždavinys apie amžių", noisy: true },
  ] },
];

/** Works still ahead this semester. */
export const PLANNED: Work[] = [
  { date: "11-19", type: "SD", topic: "Tiesinė funkcija" },
  { date: "12-03", type: "KD", topic: "Tiesinė funkcija" },
  { date: "12-17", type: "KD", topic: "Pusmečio kontrolinis" },
];

const NAMES = [
  "Adomas N.", "Augustas M.", "Austėja K.", "Benas K.", "Dominykas L.", "Emilija V.", "Gabija L.", "Goda P.",
  "Herkus Ž.", "Jokūbas Š.", "Joris V.", "Kamilė B.", "Liepa M.", "Lukas G.", "Matas P.", "Miglė A.",
  "Nojus R.", "Rokas B.", "Rugilė T.", "Smiltė D.", "Titas Č.", "Ugnė S.", "Urtė J.", "Viltė R.",
];

/** Students whose story the demo tells: ability (logits), weekly change, a weak skill. */
const STORIES: Record<string, { theta: number; slope: number; weak?: Skill }> = {
  "Matas P.": { theta: 2.3, slope: -0.31, weak: "trupmenos" },
  "Gabija L.": { theta: -0.7, slope: 0.27 },
  "Nojus R.": { theta: -1.1, slope: -0.02, weak: "tekstiniai" },
  "Ugnė S.": { theta: 2.7, slope: 0.01 },
};

/** The child shown in the parent view. */
export const CHILD = "Matas P.";

export type Mark = number | "n";
export type StudentRow = {
  name: string;
  marks: Mark[];
  avg: number;
  pred: Prediction;
  risk: Risk;
  riskReason: string | null;
  /** Share of points earned per skill (0–1), weakest first. */
  skills: { skill: Skill; name: string; score: number }[];
};

export type QuestionStat = { nr: number; label: string; skill: string; score: number; discrimination: number; hard: boolean; unclear: boolean };
export type SkillStat = { skill: Skill; name: string; score: number; weak: boolean; tip: string };

function simulateClass() {
  const r = seeded(20261105);
  const lastKd = WORKS.length - 1;
  const qScores: number[][] = WORKS[lastKd].questions!.map(() => []);
  const qTotals: number[] = [];
  const skillPts: Record<string, { got: number; max: number }> = {};

  const students: StudentRow[] = NAMES.map((name) => {
    const story = STORIES[name];
    const theta = story?.theta ?? 1.05 + 0.75 * gauss(r);
    const slope = story?.slope ?? 0.03 * gauss(r);
    const offset = {} as Record<Skill, number>;
    for (const s of Object.keys(SKILLS) as Skill[]) offset[s] = 0.35 * gauss(r);
    if (story?.weak) offset[story.weak] -= 0.9;

    const mine: Record<string, { got: number; max: number }> = {};
    const marks: Mark[] = WORKS.map((work, wIdx) => {
      const th = theta + slope * weekOf(work.date);
      if (!work.questions) return clamp(Math.round(6.6 + 0.95 * th + 0.6 * gauss(r)), 2, 10);
      if (!story && r() < 0.04) return "n";
      const scores = work.questions.map((q) => {
        const p = q.noisy ? 0.45 : logistic(th + offset[q.skill] - q.b);
        const s = clamp(p + 0.22 * gauss(r), 0, 1);
        for (const bucket of [mine, skillPts]) {
          bucket[q.skill] ??= { got: 0, max: 0 };
          bucket[q.skill].got += s;
          bucket[q.skill].max += 1;
        }
        return s;
      });
      if (wIdx === lastKd) {
        scores.forEach((s, i) => qScores[i].push(s));
        qTotals.push(sum(scores));
      }
      return scoreToGrade(mean(scores));
    });

    const graded = WORKS.map((w, i) => ({ t: weekOf(w.date), grade: marks[i] })).filter(
      (p): p is { t: number; grade: number } => p.grade !== "n",
    );
    const avg = mean(graded.map((p) => p.grade));
    const pred = predictSemester(graded, PLANNED.map((w) => weekOf(w.date)));
    const skills = (Object.keys(mine) as Skill[])
      .map((s) => ({ skill: s, name: SKILLS[s], score: mine[s].got / mine[s].max }))
      .sort((a, b) => a.score - b.score);

    const g = graded.map((p) => p.grade);
    const drop = mean(g.slice(0, 4)) - mean(g.slice(-3));
    let risk: Risk = null;
    let riskReason: string | null = null;
    if (pred.grade <= 4 || avg < 4.5) {
      risk = "critical";
      riskReason = `Prognozė ${pred.grade} – gresia nepatenkinamas įvertinimas`;
    } else if (drop >= 1.5 && pred.slope < -0.1) {
      risk = "warning";
      riskReason = `Paskutinių 3 darbų vidurkis ${fmt(drop)} balo žemesnis nei rugsėjį`;
    }
    return { name, marks, avg, pred, risk, riskReason, skills };
  });

  const questions: QuestionStat[] = WORKS[lastKd].questions!.map((q, i) => {
    const rest = qTotals.map((t, k) => t - qScores[i][k]);
    const score = mean(qScores[i]);
    const discrimination = corr(qScores[i], rest);
    return {
      nr: i + 1,
      label: q.label ?? SKILLS[q.skill],
      skill: SKILLS[q.skill],
      score,
      discrimination,
      hard: score < 0.5 && discrimination >= 0.2,
      unclear: discrimination < 0.2,
    };
  });

  const skills: SkillStat[] = (Object.keys(skillPts) as Skill[])
    .map((s) => {
      const score = skillPts[s].got / skillPts[s].max;
      return { skill: s, name: SKILLS[s], score, weak: score < 0.6, tip: SKILL_TIPS[s] };
    })
    .sort((a, b) => a.score - b.score);

  return { students, questions, skills };
}

/** One work's column in the gradebook: class average and how many were absent. */
function workStats(students: StudentRow[], idx: number) {
  const grades = students.map((s) => s.marks[idx]).filter((m): m is number => m !== "n");
  return { avg: mean(grades), absent: students.length - grades.length, grades };
}

function buildTeacher() {
  const { students, questions, skills } = simulateClass();
  const lastIdx = WORKS.length - 1;
  const columns = WORKS.map((w, i) => ({ ...w, ...workStats(students, i) }));
  const last = columns[lastIdx];
  const previousKd = columns.filter((c, i) => c.type === "KD" && i < lastIdx);
  const distribution = Array.from({ length: 10 }, (_, g) => last.grades.filter((x) => x === g + 1).length);
  return {
    students,
    columns,
    questions,
    skills,
    classAvg: mean(students.map((s) => s.avg)),
    predictedAvg: mean(students.map((s) => s.pred.mean)),
    atRisk: students.filter((s) => s.risk).length,
    lastKd: { ...WORKS[lastIdx], avg: last.avg, previousAvg: mean(previousKd.map((c) => c.avg)), distribution, absent: last.absent },
  };
}

/* ========================= administration: whole school ========================= */

export const CLASSES = ["5a", "5b", "6a", "6b", "7a", "7b", "8a", "8b"] as const;
export const SUBJECTS = ["Lietuvių k.", "Matematika", "Anglų k.", "Istorija", "Gamtos m.", "Informatika"] as const;
type Subject = (typeof SUBJECTS)[number];

const CLASS_LEVEL: Record<string, number> = { "5a": 0.15, "5b": -0.1, "6a": 0.05, "6b": 0.1, "7a": 0.25, "7b": -0.2, "8a": 0.1, "8b": -0.35 };
const CLASS_SIZE: Record<string, number> = { "5a": 26, "5b": 25, "6a": 27, "6b": 24, "7a": 28, "7b": 23, "8a": 26, "8b": 24 };
const SUBJECT_BASE: Record<Subject, number> = { "Lietuvių k.": 7.2, Matematika: 6.9, "Anglų k.": 7.9, Istorija: 7.5, "Gamtos m.": 7.3, Informatika: 8.2 };

/** Same-topic maths tests written by every parallel class (compared side by side). */
export const SHARED_MATH_TOPIC: Record<string, string> = { "5": "Natūralieji skaičiai", "6": "Trupmenos", "7": "Lygtys", "8": "Procentai" };
const OTHER_MATH_TOPIC: Record<string, string> = { "5": "Geometrinės figūros", "6": "Dešimtainės trupmenos", "7": "Proporcijos", "8": "Laipsniai" };
const TEST_NAMES: Record<Exclude<Subject, "Matematika">, [string, string]> = {
  "Lietuvių k.": ["Rašinys", "Skaitymo testas"],
  "Anglų k.": ["Unit 2 testas", "Žodyno testas"],
  Istorija: ["Kontrolinis darbas", "Šaltinių analizė"],
  "Gamtos m.": ["Kontrolinis darbas", "Laboratorinis darbas"],
  Informatika: ["Projektas", "Testas"],
};

const TEACHER_SEEDS: { name: string; subject: Subject; classes: string[]; leniency: number }[] = [
  { name: "J. Kazlauskienė", subject: "Matematika", classes: ["5a", "6a", "7b"], leniency: 1.0 },
  { name: "T. Jankauskas", subject: "Matematika", classes: ["5b", "6b"], leniency: -0.8 },
  { name: "R. Petrauskienė", subject: "Matematika", classes: ["7a", "8a", "8b"], leniency: -0.1 },
  { name: "D. Stankevičienė", subject: "Lietuvių k.", classes: ["5a", "5b", "6a", "6b"], leniency: 0.1 },
  { name: "V. Vasiliauskienė", subject: "Lietuvių k.", classes: ["7a", "7b", "8a", "8b"], leniency: -0.3 },
  { name: "L. Žukauskaitė", subject: "Anglų k.", classes: ["5a", "5b", "6a", "6b"], leniency: 0.75 },
  { name: "M. Butkus", subject: "Anglų k.", classes: ["7a", "7b", "8a", "8b"], leniency: 0.0 },
  { name: "G. Kavaliauskas", subject: "Istorija", classes: [...CLASSES], leniency: 0.55 },
  { name: "A. Paulauskas", subject: "Gamtos m.", classes: ["5a", "5b", "6a", "6b"], leniency: -0.2 },
  { name: "E. Urbonienė", subject: "Gamtos m.", classes: ["7a", "7b", "8a", "8b"], leniency: -0.75 },
  { name: "K. Rimkus", subject: "Informatika", classes: [...CLASSES], leniency: 0.25 },
];

export type TeacherTest = { title: string; cls: string; date: string; avg: number; expected: number; dev: number; shared: boolean };
export type TeacherStat = { name: string; subject: Subject; classes: string[]; tests: TeacherTest[]; avg: number; expected: number; dev: number };

function buildAdmin(teacher: ReturnType<typeof buildTeacher>) {
  const r = seeded(7404);
  const days = ["09-17", "09-24", "10-01", "10-09", "10-16", "10-23", "11-04", "11-06"];
  // 8b maths tests are the real ones from the teacher view
  const own: Record<string, number> = {
    Procentai: teacher.columns.find((c) => c.type === "KD" && c.topic === "Procentai")!.avg,
    Laipsniai: teacher.columns.find((c) => c.type === "KD" && c.topic.startsWith("Laipsniai"))!.avg,
  };

  const teachers: TeacherStat[] = TEACHER_SEEDS.map((t) => {
    const tests: TeacherTest[] = t.classes.flatMap((cls) => {
      const grade = cls[0];
      const titles = t.subject === "Matematika" ? [SHARED_MATH_TOPIC[grade], OTHER_MATH_TOPIC[grade]] : TEST_NAMES[t.subject];
      return titles.map((title, k) => {
        let expected = SUBJECT_BASE[t.subject] + CLASS_LEVEL[cls] + 0.15 * gauss(r);
        let avg = clamp(expected + t.leniency + (k === 0 ? 0.12 : 0.3) * gauss(r), 4, 9.8);
        if (cls === "8b" && t.subject === "Matematika") {
          avg = own[title];
          expected = avg - t.leniency + 0.2 * gauss(r);
        }
        return {
          title,
          cls,
          date: days[Math.floor(r() * days.length)],
          avg,
          expected,
          dev: avg - expected,
          shared: t.subject === "Matematika" && k === 0,
        };
      });
    });
    const avg = mean(tests.map((x) => x.avg));
    const expected = mean(tests.map((x) => x.expected));
    return { ...t, tests, avg, expected, dev: avg - expected };
  }).sort((a, b) => b.dev - a.dev);

  // class × subject averages, consistent with who teaches what
  const heat = CLASSES.map((cls) => ({
    cls,
    values: SUBJECTS.map((subject) => {
      if (cls === "8b" && subject === "Matematika") return teacher.classAvg;
      const who = TEACHER_SEEDS.find((t) => t.subject === subject && t.classes.includes(cls))!;
      return clamp(SUBJECT_BASE[subject] + CLASS_LEVEL[cls] + who.leniency + 0.15 * gauss(r), 4, 9.8);
    }),
  }));
  const schoolAvg = mean(heat.flatMap((h) => h.values));

  const sharedTopics = Object.entries(SHARED_MATH_TOPIC).map(([grade, topic]) => ({
    grade,
    topic,
    rows: teachers
      .filter((t) => t.subject === "Matematika")
      .flatMap((t) => t.tests.filter((x) => x.shared && x.cls[0] === grade).map((x) => ({ ...x, teacher: t.name })))
      .sort((a, b) => a.cls.localeCompare(b.cls)),
  }));

  const otherAtRisk = [1, 3, 1, 2, 1, 3, 2];
  const students = sum(CLASSES.map((c) => CLASS_SIZE[c]));
  const atRisk = sum(otherAtRisk) + teacher.atRisk;
  return {
    teachers,
    heat,
    schoolAvg,
    sharedTopics,
    students,
    atRisk,
    attendance: 0.941,
    flagged: teachers.filter((t) => Math.abs(t.dev) >= 0.5).length,
  };
}

/* ========================= parents: one child ========================= */

export type SubjectTrack = {
  subject: string;
  teacher: string;
  marks: { date: string; type: WorkType; topic: string; grade: Mark; classAvg: number }[];
  planned: { date: string; type: WorkType; topic: string }[];
  missingHomework: number;
  weakSkill?: { name: string; score: number };
};

type Authored = Omit<SubjectTrack, "marks" | "weakSkill"> & { marks: [string, WorkType, string, Mark, number][] };

/** The child's other subjects (authored; maths comes from the teacher view). */
const OTHER_SUBJECTS: Authored[] = [
  {
    subject: "Lietuvių kalba", teacher: "V. Vasiliauskienė", missingHomework: 0,
    marks: [["09-10", "SD", "Skaitymo užduotis", 8, 7.1], ["09-24", "KD", "Rašinys", 7, 6.6], ["10-08", "ND", "Analizė", 9, 7.8], ["10-15", "KD", "Skaitymo testas", 8, 6.9], ["10-29", "SD", "Skyryba", 8, 7.2], ["11-04", "KD", "Diktantas", 8, 6.8]],
    planned: [{ date: "11-25", type: "KD", topic: "Rašinys" }, { date: "12-16", type: "SD", topic: "Kalbos kultūra" }],
  },
  {
    subject: "Anglų kalba", teacher: "M. Butkus", missingHomework: 0,
    marks: [["09-11", "SD", "Vocabulary", 9, 7.9], ["09-25", "KD", "Unit 1", 10, 7.6], ["10-09", "SD", "Grammar", 9, 8.0], ["10-23", "KD", "Unit 2", 9, 7.4], ["11-06", "SD", "Listening", 10, 8.1]],
    planned: [{ date: "11-27", type: "KD", topic: "Unit 3" }, { date: "12-11", type: "SD", topic: "Speaking" }],
  },
  {
    subject: "Fizika", teacher: "E. Urbonienė", missingHomework: 2,
    marks: [["09-16", "SD", "Judėjimas", 7, 6.5], ["09-30", "KD", "Greitis", 6, 6.1], ["10-07", "ND", "Uždaviniai", 7, 7.0], ["10-21", "KD", "Jėgos", 6, 5.9], ["11-04", "SD", "Slėgis", 7, 6.3]],
    planned: [{ date: "11-24", type: "KD", topic: "Slėgis" }, { date: "12-15", type: "KD", topic: "Pusmečio kontrolinis" }],
  },
  {
    subject: "Istorija", teacher: "G. Kavaliauskas", missingHomework: 0,
    marks: [["09-18", "SD", "Šaltiniai", 7, 7.7], ["10-02", "KD", "Reformacija", 8, 7.9], ["10-16", "SD", "Žemėlapis", 8, 8.2], ["11-06", "KD", "Abiejų Tautų Respublika", 9, 8.0]],
    planned: [{ date: "11-27", type: "SD", topic: "Šaltinių analizė" }, { date: "12-18", type: "KD", topic: "Apšvieta" }],
  },
  {
    subject: "Biologija", teacher: "A. Paulauskas", missingHomework: 0,
    marks: [["09-19", "SD", "Ląstelė", 8, 7.4], ["10-03", "KD", "Audiniai", 9, 7.2], ["10-17", "ND", "Projektas", 8, 8.1], ["11-07", "KD", "Kraujotaka", 9, 7.3]],
    planned: [{ date: "12-05", type: "KD", topic: "Kvėpavimas" }],
  },
];

function buildParent(teacher: ReturnType<typeof buildTeacher>) {
  const child = teacher.students.find((s) => s.name === CHILD)!;
  const math: SubjectTrack = {
    subject: "Matematika",
    teacher: TEACHER.name,
    missingHomework: 0,
    marks: WORKS.map((w, i) => ({ date: w.date, type: w.type, topic: w.topic, grade: child.marks[i], classAvg: teacher.columns[i].avg })),
    planned: PLANNED.map(({ date, type, topic }) => ({ date, type, topic })),
    weakSkill: { name: child.skills[0].name, score: child.skills[0].score },
  };
  const subjects: SubjectTrack[] = [
    math,
    ...OTHER_SUBJECTS.map((s) => ({
      ...s,
      marks: s.marks.map(([date, type, topic, grade, classAvg]) => ({ date, type, topic, grade, classAvg })),
    })),
  ];
  return { child: { name: CHILD, className: TEACHER.className, attendance: 0.962, missed: 7, excused: 6 }, subjects };
}

/** Grades with their week number (absences dropped) — the input of `predictSemester`. */
export const gradedPoints = (s: SubjectTrack) =>
  s.marks
    .filter((m): m is SubjectTrack["marks"][number] & { grade: number } => m.grade !== "n")
    .map((m) => ({ t: weekOf(m.date), grade: m.grade }));

export const predictTrack = (s: SubjectTrack) => predictSemester(gradedPoints(s), s.planned.map((p) => weekOf(p.date)));

export type Insight = { tone: "warning" | "good" | "info"; title: string; text: string };

/** Plain-language findings for parents, strongest signal first. */
export function parentInsights(subjects: SubjectTrack[]): Insight[] {
  const rows = subjects.map((s) => {
    const g = gradedPoints(s).map((p) => p.grade);
    return { s, g, pred: predictTrack(s), avg: mean(g) };
  });
  const out: Insight[] = [];

  for (const { s, g, pred } of [...rows].sort((a, b) => a.pred.slope - b.pred.slope)) {
    if (pred.slope > -0.15 || g.length < 4) continue;
    const first = mean(g.slice(0, 3)), last = mean(g.slice(-3));
    out.push({
      tone: "warning",
      title: `${s.subject}: pažymiai krenta`,
      text:
        `Pirmųjų trijų darbų vidurkis ${fmt(first)}, paskutinių trijų – ${fmt(last)}.` +
        (s.weakSkill ? ` Daugiausia klaidų – tema „${s.weakSkill.name.toLowerCase()}“ (${fmtPct(s.weakSkill.score)} taškų).` : "") +
        ` Jei niekas nesikeis, pusmečio pažymys greičiausiai bus ${pred.grade}.`,
    });
  }
  for (const { s } of rows) {
    if (s.missingHomework > 0) {
      out.push({ tone: "warning", title: `${s.subject}: neatlikti namų darbai`, text: `Per pastarąjį mėnesį neatlikti ${s.missingHomework} namų darbai. Jie pažymio nemažina, bet dažnai būna pirmas ženklas, kad tema nesiseka.` });
    }
  }
  const best = [...rows].sort((a, b) => b.avg - a.avg)[0];
  const bestClass = mean(best.s.marks.map((m) => m.classAvg));
  out.push({ tone: "good", title: `${best.s.subject}: stipriausias dalykas`, text: `Vidurkis ${fmt(best.avg)} (klasės – ${fmt(bestClass)}). Prognozuojamas pusmečio pažymys – ${best.pred.grade}.` });
  const rising = rows.filter((x) => x.pred.slope >= 0.1 && x.s !== best.s).sort((a, b) => b.pred.slope - a.pred.slope)[0];
  if (rising) {
    out.push({ tone: "good", title: `${rising.s.subject}: pažymiai kyla`, text: `Nuo ${rising.g[0]} iki ${rising.g[rising.g.length - 1]} per pusmetį – verta pagirti.` });
  }
  const next = subjects
    .flatMap((s) => s.planned.map((p) => ({ ...p, subject: s.subject })))
    .sort((a, b) => weekOf(a.date) - weekOf(b.date))
    .slice(0, 2);
  out.push({
    tone: "info",
    title: "Artimiausi atsiskaitymai",
    text: next.map((p) => `${fmtDate(p.date)} – ${p.subject.toLowerCase()}, ${WORK_TYPES[p.type].toLowerCase()} („${p.topic}“)`).join("; ") + ".",
  });
  return out;
}

/* ========================= assembled demo ========================= */

const teacher = buildTeacher();
export const DEMO = { teacher, admin: buildAdmin(teacher), parent: buildParent(teacher) };
export type Demo = typeof DEMO;
