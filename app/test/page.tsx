"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  Compass, 
  ArrowRight, 
  BookOpen, 
  Building2, 
  Briefcase,
  GraduationCap
} from "lucide-react";

// --- DATA & TYPES SECTION ---

type CareerType = 'A' | 'B' | 'C' | 'D' | 'E';

interface Profession {
  title: string;
  salary: string;
}

interface ResultData {
  title: string;
  summary: string;
  positives: string[];
  negatives: string[];
  communication: string;
  exams: string;
  uniLt: string;
  uniEu: string;
  professions: Profession[];
}

const RESULTS: Record<CareerType, ResultData> = {
  A: {
    title: "Sistemų Architektas (Inžinerinis-Techninis)",
    summary: "Tu esi strategas, kuris mato pasaulį per logikos ir struktūros prizmę. Tavo smegenys geriausiai veikia sprendžiant sudėtingas technines mįsles.",
    positives: ["Loginis mąstymas", "Preciziškumas", "Algoritminis mąstymas", "Savarankiškumas"],
    negatives: ["Socialinis nuovargis", "Per didelis kritiškumas", "Perfekcionizmas"],
    communication: "Draugai tave vertina už tavo objektyvumą ir problemų sprendimo įgūdžius. Tu nemėgsti tuščių kalbų, kalbi faktais ir vertini intelektualų ryšį.",
    exams: "Matematika (valstybinis), Fizika, Informacinės Technologijos, Anglų kalba.",
    uniLt: "KTU Informatikos fakultetas, VU Matematikos ir informatikos fakultetas, VILNIUS TECH.",
    uniEu: "TU Delft (Olandija), ETH Zurich (Šveicarija), Miuncheno technikos universitetas.",
    professions: [
      { title: "Programinės įrangos inžinierius", salary: "1800-5500€" },
      { title: "Duomenų mokslininkas", salary: "2200-5000€" },
      { title: "Kibernetinio saugumo analitikas", salary: "2000-4500€" },
      { title: "Dirbtinio intelekto kūrėjas", salary: "2500-6000€" },
      { title: "Debesijos sistemų architektas", salary: "2500-5500€" },
      { title: "Robotikos inžinierius", salary: "1800-3800€" },
    ]
  },
  B: {
    title: "Žmonių Ugdytojas (Socialinis-Emocinis)",
    summary: "Tavo stiprybė – empatija ir komunikacija. Tu jauti kitų emocijas ir gebi juos motyvuoti bei nukreipti teisinga linkme.",
    positives: ["Empatija", "Klausymo įgūdžiai", "Diplomatija", "Kantrybė"],
    negatives: ["Sunkumas brėžti ribas", "Emocinis jautrumas kitiems", "Kritikos baimė"],
    communication: "Esi draugų būrio patarėjas. Moki išklausyti, suprasti be žodžių ir visada rasti tinkamą paguodos ar palaikymo frazę.",
    exams: "Lietuvių kalba, Anglų kalba, Biologija (psichologijai) arba Istorija.",
    uniLt: "VU Psichologijos fakultetas, VDU Socialinių mokslų fakultetas, LSMU.",
    uniEu: "Amsterdamo universitetas (Olandija), KU Leuven (Belgija), Kopenhagos universitetas.",
    professions: [
      { title: "Psichologas", salary: "1200-2800€" },
      { title: "Personalo vadovas", salary: "1500-3800€" },
      { title: "Karjeros konsultantas", salary: "1000-4000€" },
      { title: "Socialinių projektų lyderis", salary: "1100-2200€" },
      { title: "Mediatorius (taikytojas)", salary: "1300-3000€" },
      { title: "Ryšių su visuomene specialistas", salary: "1400-3200€" },
    ]
  },
  C: {
    title: "Vizijų Kūrėjas (Kūrybinis-Meninis)",
    summary: "Tu esi idėjų generatorius, kuriam reikia laisvės ir saviraiškos. Pasaulį matai kaip drobę, kurioje viską galima pakeisti.",
    positives: ["Kūrybiškumas", "Originalumas", "Vizualinis mąstymas", "Intuicija"],
    negatives: ["Chaotiškumas", "Rutinos netoleravimas", "Nepastovumas"],
    communication: "Esi charizmatiškas ir įkvepiantis. Draugai tave vertina už kitokį požiūrį į gyvenimą ir gebėjimą pralinksminti bei nustebinti.",
    exams: "Lietuvių kalba, Anglų kalba, Dailės arba Architektūros stojamieji egzaminai.",
    uniLt: "Vilniaus Dailės Akademija (VDA), LMTA, ISM Kūrybinės industrijos.",
    uniEu: "UAL Londonas (JK), Dizaino akademija Eindhoven (Olandija), Aalto universitetas (Suomija).",
    professions: [
      { title: "Vartotojo sąsajos (UX/UI) dizaineris", salary: "1600-4000€" },
      { title: "Meno vadovas (Art Director)", salary: "2200-4500€" },
      { title: "Vaizdo montuotojas", salary: "1300-3000€" },
      { title: "Architektas", salary: "1500-3500€" },
      { title: "Žaidimų kūrėjas", salary: "1700-4200€" },
      { title: "Turinio kūrėjas", salary: "1000-5000€" },
    ]
  },
  D: {
    title: "Strategas & Lyderis (Verslo-Vadybinis)",
    summary: "Esi ambicingas žmogus, orientuotas į rezultatą ir sėkmę. Gebi matyti didįjį paveikslą ir vesti komandas į priekį.",
    positives: ["Lyderystė", "Ryžtingumas", "Strategija", "Derybiniai įgūdžiai"],
    negatives: ["Nekantrumas", "Poilsio ignoravimas", "Polinkis dominuoti"],
    communication: "Esi būrio lyderis ir organizatorius. Draugai pasitiki tavo sprendimais. Kalbi užtikrintai, motyvuoji kitus veikti.",
    exams: "Matematika (valstybinis), Anglų kalba, Geografija arba Istorija.",
    uniLt: "ISM Vadybos ir ekonomikos universitetas, VU Verslo mokykla.",
    uniEu: "SSE Stokholmas (Švedija), IE verslo mokykla (Ispanija), HEC Paryžius (Prancūzija).",
    professions: [
      { title: "Verslininkas (Antrepreneris)", salary: "Neribota" },
      { title: "Investicinės bankininkystės specialistas", salary: "2500-7000€" },
      { title: "Projektų vadovas", salary: "1800-4000€" },
      { title: "Pardavimų direktorius", salary: "2000-6000€" },
      { title: "Strateginis konsultantas", salary: "2200-5000€" },
      { title: "Produkto vadovas", salary: "2000-4500€" },
    ]
  },
  E: {
    title: "Saugotojas & Tyrėjas (Mokslo-Struktūrinis)",
    summary: "Tu vertini faktus, tvarką ir preciziškumą. Esi patikimas žmogus, kuris užtikrina kokybę ir stabilumą.",
    positives: ["Atsakomybė", "Atidumas detalėms", "Sąžiningumas", "Metodiškumas"],
    negatives: ["Baimė keisti planus", "Perfekcionizmas detalėse", "Sunkus prisitaikymas"],
    communication: "Esi tas draugas, kurio žodis yra šventas. Komunikuoji ramiai, logiškai, nemėgsti pagražinimų. Vertini punktualumą.",
    exams: "Biologija, Chemija, Matematika, Lietuvių kalba.",
    uniLt: "VU Medicinos fakultetas, LSMU, VU Gamtos mokslų centras.",
    uniEu: "Heidelbergo universitetas (Vokietija), Karolinska Institutet (Švedija), Kembridžas (JK).",
    professions: [
      { title: "Chirurgas / Gydytojas", salary: "2500-6500€" },
      { title: "Vaistininkas", salary: "1400-2500€" },
      { title: "Mikrobiologas", salary: "1300-2800€" },
      { title: "Buhalteris / Auditorius", salary: "1300-3000€" },
      { title: "Teismo medicinos ekspertas", salary: "1400-2800€" },
      { title: "Finansų kontrolierius", salary: "1800-4000€" },
    ]
  }
};

const RAW_QUESTIONS = [
  // A - TECHNOLOGIJOS
  { q: "Mėgstu spręsti loginius galvosūkius.", t: "A" }, { q: "Man įdomu, kaip veikia algoritmai.", t: "A" },
  { q: "Galiu ilgai sėdėti prie vienos techninės klaidos.", t: "A" }, { q: "Man patinka tvarka skaičiuose.", t: "A" },
  { q: "Pastebiu sistemos spragas.", t: "A" }, { q: "Mėgstu automatizuoti užduotis.", t: "A" },
  { q: "Man įdomu ardyti prietaisus.", t: "A" }, { q: "Suprantu serverio ir kodo logiką.", t: "A" },
  { q: "Analizuoju statistiką ir grafikus.", t: "A" }, { q: "Mane domina kibernetinis saugumas.", t: "A" },
  // B - ŽMONĖS
  { q: "Moku išklausyti žmogų jo nepertraukdamas.", t: "B" }, { q: "Socialinės problemos man rūpi.", t: "B" },
  { q: "Galiu paaiškinti sudėtingą dalyką vaikui.", t: "B" }, { q: "Padedu kitiems siekti jų tikslų.", t: "B" },
  { q: "Harmonija komandoje man svarbiausia.", t: "B" }, { q: "Psichologija mane traukia.", t: "B" },
  { q: "Džiaugiuosi kitų pažanga.", t: "B" }, { q: "Motyvuoju nusivylusį žmogų.", t: "B" },
  { q: "Darbas turi turėti aukštesnę prasmę.", t: "B" }, { q: "Mėgstu įvairias kultūras.", t: "B" },
  // C - KŪRYBA
  { q: "Pastebiu spalvų disonansą.", t: "C" }, { q: "Daug laiko praleidžiu svajodamas.", t: "C" },
  { q: "Mėgstu kurti video/foto.", t: "C" }, { q: "Originalumas man svarbiau už taisykles.", t: "C" },
  { q: "Mėgstu keisti aplinkos dizainą.", t: "C" }, { q: "Mada ir menas mane įkvepia.", t: "C" },
  { q: "Rezultatas turi būti gražus.", t: "C" }, { q: "Mano idėjos būna keistos.", t: "C" },
  { q: "Kuriu naujus prekės ženklus.", t: "C" }, { q: "Mėgstu meistrauti rankomis.", t: "C" },
  // D - VERSLAS
  { q: "Mėgstu derybas dėl kainos.", t: "D" }, { q: "Konkurencija mane motyvuoja.", t: "D" },
  { q: "Sprendžiu greitai po spaudimu.", t: "D" }, { q: "Pinigai yra geras sėkmės matas.", t: "D" },
  { q: "Planuoju ateitį strategiškai.", t: "D" }, { q: "Nebijau finansinės rizikos.", t: "D" },
  { q: "Mėgstu vadovauti projektams.", t: "D" }, { q: "Įtikinu kitus savo idėjomis.", t: "D" },
  { q: "Turėsiu savo verslą.", t: "D" }, { q: "Statusas man yra svarbus.", t: "D" },
  // E - MOKSLAS
  { q: "Klasifikuoju informaciją.", t: "E" }, { q: "Tikrinu dokumentų detales.", t: "E" },
  { q: "Gamtos mokslai man patinka.", t: "E" }, { q: "Rutina man netrukdo.", t: "E" },
  { q: "Mėgstu laboratorinius darbus.", t: "E" }, { q: "Ekologija man prioritetas.", t: "E" },
  { q: "Dirbu susikaupęs ilgai.", t: "E" }, { q: "Saugumas man svarbiausia.", t: "E" },
  { q: "Skaitau instrukcijas iki galo.", t: "E" }, { q: "Disciplina yra mano pagrindas.", t: "E" }
] as const;

// --- MAIN COMPONENT ---

export default function CareerQuiz() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
  const [questions, setQuestions] = useState([...RAW_QUESTIONS]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ A: 0, B: 0, C: 0, D: 0, E: 0 });

  // Shuffle questions on start
  const startGame = () => {
    // Fisher-Yates shuffle approximation
    setQuestions([...RAW_QUESTIONS].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setScores({ A: 0, B: 0, C: 0, D: 0, E: 0 });
    setGameState('playing');
  };

  const handleAnswer = (isYes: boolean) => {
    if (isYes) {
      const type = questions[currentIdx].t;
      setScores(prev => ({ ...prev, [type]: prev[type] + 1 }));
    }

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setGameState('result');
    }
  };

  const getWinner = () => {
    return Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    ) as CareerType;
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col relative">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-400" />
            <span className="font-bold tracking-wider">TIKSLIUKAI.LT</span>
          </div>
          {gameState === 'playing' && (
            <span className="text-xs md:text-sm font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              Klausimas {currentIdx + 1} / {questions.length}
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative">
          <AnimatePresence mode="wait">
            
            {/* INTRO VIEW */}
            {gameState === 'intro' && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-8"
              >
                <div className="bg-blue-50 p-6 rounded-full inline-block shadow-inner">
                  <span className="text-6xl">🧭</span>
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Karjeros Krypties Testas
                  </h1>
                  <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
                    Atrask savo profesinį kelią per specializuotą klausimyną. 
                    Sužinok, kur tavo stiprybės atneš daugiausiai sėkmės.
                  </p>
                </div>
                <button 
                  onClick={startGame}
                  className="group bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-12 rounded-xl transition-all transform hover:scale-105 shadow-xl shadow-blue-600/20 flex items-center gap-2"
                >
                  Pradėti Testą <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {/* QUIZ VIEW */}
            {gameState === 'playing' && (
              <motion.div 
                key="quiz"
                className="flex flex-col flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 justify-center"
              >
                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full mb-12 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  />
                </div>

                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex items-center justify-center min-h-[180px] mb-8"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 leading-tight">
                    {questions[currentIdx].q}
                  </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                  <button 
                    onClick={() => handleAnswer(true)}
                    className="flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all group shadow-sm hover:shadow-md"
                  >
                    <CheckCircle2 className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    <span className="font-bold text-lg text-slate-600 group-hover:text-emerald-700">Taip, tai apie mane</span>
                  </button>
                  <button 
                    onClick={() => handleAnswer(false)}
                    className="flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 bg-white hover:border-rose-500 hover:bg-rose-50 transition-all group shadow-sm hover:shadow-md"
                  >
                    <XCircle className="w-6 h-6 text-slate-300 group-hover:text-rose-500 transition-colors" />
                    <span className="font-bold text-lg text-slate-600 group-hover:text-rose-700">Ne, nelabai</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* RESULTS VIEW */}
            {gameState === 'result' && (
              <ResultsView result={RESULTS[getWinner()]} onRestart={startGame} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

// --- RESULTS SUB-COMPONENT ---

function ResultsView({ result, onRestart }: { result: ResultData, onRestart: () => void }) {
  return (
    <motion.div 
      key="result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto max-h-[85vh] md:max-h-[800px] scrollbar-thin scrollbar-thumb-slate-300"
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-10 text-center border-b border-slate-100">
        <span className="inline-block py-1.5 px-4 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-widest uppercase mb-6">
          Tavo Rezultatas
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
          {result.title}
        </h2>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          {result.summary}
        </p>
      </div>

      <div className="p-6 md:p-10 space-y-10 bg-white">
        
        {/* Strengths / Weaknesses Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
            <h3 className="text-emerald-700 font-bold mb-4 flex items-center gap-2 text-lg">
              <span className="text-2xl">💪</span> Stipriosios savybės
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.positives.map((item, i) => (
                <span key={i} className="px-3 py-1.5 bg-white text-emerald-800 text-sm font-bold rounded-lg border border-emerald-200 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
            <h3 className="text-rose-700 font-bold mb-4 flex items-center gap-2 text-lg">
              <span className="text-2xl">⚠️</span> Augimo zonos
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.negatives.map((item, i) => (
                <span key={i} className="px-3 py-1.5 bg-white text-rose-800 text-sm font-bold rounded-lg border border-rose-200 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Communication */}
          <div className="md:col-span-3 bg-slate-50 p-8 rounded-2xl border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <Briefcase size={120} />
             </div>
             <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-lg relative z-10">
               <span className="text-2xl">🤝</span> Komunikacija
             </h3>
             <p className="text-slate-600 leading-relaxed relative z-10 text-lg">{result.communication}</p>
          </div>

          {/* Exams & Promo */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg">Egzaminai</h4>
            </div>
            <p className="text-slate-600 mb-6 flex-1">{result.exams}</p>
            
            <div className="mt-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 text-white text-center shadow-lg relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <p className="text-xs font-semibold text-blue-100 mb-2 uppercase tracking-wide">Pasiruošk egzaminams</p>
              <a href="https://tiksliukai.lt" target="_blank" rel="noopener noreferrer" className="text-xl font-extrabold flex items-center justify-center gap-1">
                TIKSLIUKAI.LT <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Universities */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <GraduationCap className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg">Studijos</h4>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Lietuvoje
                </h5>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {result.uniLt}
                </p>
              </div>
              <div>
                <h5 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Europoje
                </h5>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {result.uniEu}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Professions List */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Building2 className="w-6 h-6 text-slate-400" /> Tau tinkančios profesijos
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {result.professions.map((prof, i) => (
              <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group">
                <span className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{prof.title}</span>
                <span className="text-xs font-extrabold bg-green-100 text-green-700 px-3 py-1.5 rounded-lg whitespace-nowrap ml-3 shadow-sm">
                  {prof.salary}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 text-center pb-8 border-t border-slate-100 mt-8">
          <button 
            onClick={onRestart}
            className="inline-flex items-center gap-2 text-slate-500 font-semibold hover:text-blue-600 transition-colors px-6 py-3 rounded-lg hover:bg-slate-50"
          >
            <RefreshCcw className="w-4 h-4" /> Pradėti testą iš naujo
          </button>
        </div>
      </div>
    </motion.div>
  );
}
