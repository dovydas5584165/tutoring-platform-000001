"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  Download,
  FileText,
  Loader2,
  User,
  Target,
  BrainCircuit,
  Activity,
  Users,
  Clock,
  ShieldAlert,
  Zap
} from "lucide-react";

// --- TIPAI IR DUOMENŲ STRUKTŪROS ---

type Dimension = 'impact' | 'structure' | 'ideas' | 'interaction' | 'momentum' | 'composure' | 'engagement';

interface Question {
  id: number;
  text: string;
  dimension: Dimension;
  positive: boolean; // Ar atsakymas "Taip" prideda tašką, ar atima
}

// Demonstracinis klausimų masyvas. Tikroje sistemoje čia būtų 214 klausimų.
const DEMO_QUESTIONS: Question[] = [
  { id: 1, text: "Grupiniuose darbuose dažniausiai aš imuosi lyderio vaidmens.", dimension: "impact", positive: true },
  { id: 2, text: "Mano mokymosi užrašai ir failai kompiuteryje visada yra idealiai surūšiuoti.", dimension: "structure", positive: true },
  { id: 3, text: "Mane dažnai aplanko neįprastos, originalios idėjos, kurios kitiems atrodo keistos.", dimension: "ideas", positive: true },
  { id: 4, text: "Man labai lengva pajausti, kai klasės draugas yra nusiminęs.", dimension: "interaction", positive: true },
  { id: 5, text: "Sprendimus priimu greitai, net ir neturėdamas visos informacijos.", dimension: "momentum", positive: true },
  { id: 6, text: "Prieš svarbius kontrolinius ar egzaminus stipriai stresuoju ir sunkiai užmiegu.", dimension: "composure", positive: false },
  { id: 7, text: "Mokausi papildomai net ir tuos dalykus, kurių mokytojai neužduoda.", dimension: "engagement", positive: true },
  { id: 8, text: "Man labiau patinka sekti tiksliomis instrukcijomis, o ne improvizuoti.", dimension: "structure", positive: true },
  { id: 9, text: "Konkurencija su bendraklasiais mane skatina mokytis geriau.", dimension: "impact", positive: true },
  { id: 10, text: "Mieliau atlieku praktines, rutinines užduotis nei diskutuoju apie teorijas.", dimension: "ideas", positive: false },
  { id: 11, text: "Galiu lengvai užkalbinti nepažįstamą žmogų renginyje ar būrelyje.", dimension: "interaction", positive: true },
  { id: 12, text: "Atlikdamas užduotį linkęs ilgai dvejoti ir tikrinti kelis kartus.", dimension: "momentum", positive: false },
  { id: 13, text: "Kai gaunu blogą pažymį, greitai jį pamirštu ir judu toliau.", dimension: "composure", positive: true },
  { id: 14, text: "Mokyklos taisyklės man atrodo prasmingos ir aš jų laikausi.", dimension: "engagement", positive: true },
];

const DIMENSION_NAMES: Record<Dimension, string> = {
  impact: "Poveikis ir ambicijos",
  structure: "Organizavimas ir struktūra",
  ideas: "Idėjos ir pokyčiai",
  interaction: "Bendradarbiavimas",
  momentum: "Darbo tempas",
  composure: "Emocinis stabilumas",
  engagement: "Įsitraukimas ir autonomija"
};

const TOTAL_REAL_QUESTIONS = 214; // Simuliuojamas pilno testo ilgis

// --- VORATINKLINIO GRAFIKO (RADAR CHART) KOMPONENTAS ---
function RadarChart({ scores }: { scores: Record<Dimension, number> }) {
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) - 40;
  const dimensions: Dimension[] = ['impact', 'structure', 'ideas', 'interaction', 'momentum', 'composure', 'engagement'];
  const angleStep = (Math.PI * 2) / dimensions.length;

  // Fono linijos
  const backgroundPolygons = [0.2, 0.4, 0.6, 0.8, 1.0].map(scale => {
    const points = dimensions.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * scale * Math.cos(angle);
      const y = center + radius * scale * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
    return <polygon key={scale} points={points} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
  });

  // Ašių linijos
  const axes = dimensions.map((dim, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const x2 = center + radius * Math.cos(angle);
    const y2 = center + radius * Math.sin(angle);
    return <line key={`axis-${dim}`} x1={center} y1={center} x2={x2} y2={y2} stroke="#e2e8f0" strokeWidth="1" />;
  });

  // Rezultatų poligonas
  const resultPoints = dimensions.map((dim, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const scoreScale = scores[dim] / 10;
    const x = center + radius * scoreScale * Math.cos(angle);
    const y = center + radius * scoreScale * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  // Etiketės
  const labels = dimensions.map((dim, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const labelRadius = radius + 20;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    
    // Teksto lygiavimas pagal poziciją
    let textAnchor = "middle";
    if (x < center - 10) textAnchor = "end";
    if (x > center + 10) textAnchor = "start";

    return (
      <text 
        key={`label-${dim}`} 
        x={x} 
        y={y} 
        textAnchor={textAnchor} 
        dominantBaseline="middle"
        className="text-[9px] md:text-[10px] font-bold fill-slate-600 print:fill-black uppercase tracking-wider"
      >
        {DIMENSION_NAMES[dim]}
      </text>
    );
  });

  return (
    <div className="flex justify-center items-center p-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {backgroundPolygons}
        {axes}
        <polygon 
          points={resultPoints} 
          fill="rgba(37, 99, 235, 0.2)" 
          stroke="#2563eb" 
          strokeWidth="2" 
          className="print:fill-slate-200 print:stroke-black"
        />
        {dimensions.map((dim, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const scoreScale = scores[dim] / 10;
          const x = center + radius * scoreScale * Math.cos(angle);
          const y = center + radius * scoreScale * Math.sin(angle);
          return <circle key={`dot-${dim}`} cx={x} cy={y} r="4" fill="#2563eb" className="print:fill-black" />;
        })}
        {labels}
      </svg>
    </div>
  );
}

// --- PAGRINDINIS KOMPONENTAS ---

export default function DeepCareerReport() {
  const [gameState, setGameState] = useState<'intro' | 'userInfo' | 'playing' | 'calculating' | 'result'>('intro');
  const [userName, setUserName] = useState("Dovydas Žilinskas");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Pradiniai balai (5 yra vidurkis, skalė 1-10)
  const [scores, setScores] = useState<Record<Dimension, number>>({
    impact: 5, structure: 5, ideas: 5, interaction: 5, momentum: 5, composure: 5, engagement: 5
  });

  const startGame = () => setGameState('userInfo');

  const startQuiz = () => {
    const shuffled = [...DEMO_QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setScores({ impact: 5, structure: 5, ideas: 5, interaction: 5, momentum: 5, composure: 5, engagement: 5 });
    setGameState('playing');
  };

  const handleAnswer = (isYes: boolean) => {
    const q = questions[currentIdx];
    
    // Skaičiavimo logika: jei atsako "Taip" į teigiamą - pridedam. Jei atsako "Taip" į neigiamą - atimame.
    let scoreChange = 0;
    if (isYes && q.positive) scoreChange = 1;
    if (isYes && !q.positive) scoreChange = -1;
    if (!isYes && q.positive) scoreChange = -1;
    if (!isYes && !q.positive) scoreChange = 1;

    setScores(prev => {
      const newScore = Math.max(1, Math.min(10, prev[q.dimension] + scoreChange));
      return { ...prev, [q.dimension]: newScore };
    });

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setGameState('calculating');
      setTimeout(() => setGameState('result'), 3000); // 3s fake loading
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  // --- ATASKAITOS TEKSTŲ GENERATORIAI (Priklauso nuo balo) ---
  const generateText = (dim: Dimension, score: number, name: string) => {
    const firstName = name.split(' ')[0] || 'Tiriamasis';
    
    switch(dim) {
      case 'impact':
        if (score >= 7) return `${firstName} pasižymi aukšta motyvacija ir orientacija į rezultatą. Jam būdingas noras lyderiauti grupiniuose projektuose ir konkurencingumas. Jis greičiausiai sieks aukštų akademinių ir profesinių tikslų, nebijodamas prisiimti atsakomybės.`;
        if (score <= 4) return `${firstName} labiau vertina komandinį darbą be griežtos hierarchijos. Jis nesiekia dominuoti ar perimti lyderio vaidmens. Motyvaciją jam labiau kuria vidinė ramybė ir balansas, o ne konkurencija ar noras būti pirmu.`;
        return `${firstName} išlaiko sveiką balansą tarp noro pasiekti asmeninių tikslų ir gebėjimo užleisti lyderio poziciją kitiems. Jis prisiims atsakomybę ten, kur jaučiasi stiprus, bet nebandys dominuoti kiekvienoje situacijoje.`;
      
      case 'structure':
        if (score >= 7) return `${firstName} demonstruoja stiprų polinkį į tvarką, planavimą ir taisyklių laikymąsi. Tikėtina, kad jis savo mokymosi procesą organizuoja labai metodiškai, daug dėmesio skiria detalėms. Jam geriausiai tinka aiškią struktūrą turinčios studijų programos.`;
        if (score <= 4) return `Savo veikloje ${firstName} teikia pirmenybę lankstumui, o ne griežtam planavimui. Per didelė biurokratija ar griežtos taisyklės gali jį demotyvuoti. Jis geriausiai veikia dinamiškoje aplinkoje, kur sprendimus galima priimti spontaniškai.`;
        return `${firstName} geba prisitaikyti: jis gali laikytis plano ir struktūros, kai to reikalauja mokykla ar egzaminai, tačiau taip pat palieka vietos lankstumui. Jis nėra pedantiškas, bet moka palaikyti būtinąją tvarką.`;
      
      case 'ideas':
        if (score >= 7) return `Kūrybiškumas ir polinkis į inovacijas yra stipriosios ${firstName} pusės. Jis mėgsta abstrakčias idėjas, teorines diskusijas ir dažnai mato globalų vaizdą. Rutina jį vargina, todėl jam rekomenduojama rinktis kūrybines arba mokslinių tyrimų kryptis.`;
        if (score <= 4) return `${firstName} yra labai praktiškas ir realistiškas. Jam svarbiau tai, kaip idėja veikia realybėje, nei ilgos teorinės diskusijos. Jis puikiai susidoroja su kasdienėmis, konkrečiomis užduotimis ir vertina laiko patikrintus metodus.`;
        return `${firstName} sėkmingai derina praktiškumą su atvirumu naujovėms. Jis gali generuoti naujas idėjas, bet visada įvertins jų pritaikomumą realybėje. Tai puikus bruožas projektų valdyme.`;
      
      case 'interaction':
        if (score >= 7) return `Tai empatiškas ir socialiai aktyvus asmuo. ${firstName} labai svarbūs santykiai su bendraklasiais ir mokytojais. Jis lengvai skaito kitų emocijas, dažnai tampa konflikto sprendėju grupėje. Jam ypač tinka socialinių mokslų, medicinos ar edukologijos kryptys.`;
        if (score <= 4) return `${firstName} yra labiau individualistas. Jis geriau susikaupia dirbdamas vienas, o nuolatinis darbas komandoje gali jį išsekinti. Jis komunikacijoje vertina faktus ir logiką, o ne emocijas.`;
        return `${firstName} yra socialiai lankstus - jis mėgsta bendrauti ir dirbti komandoje, bet taip pat vertina asmeninę erdvę ir tylą darbui. Jis moka palaikyti profesionalų atstumą, bet prireikus parodo empatiją.`;
      
      case 'momentum':
        if (score >= 7) return `Sprendimus ${firstName} priima greitai ir nedvejodamas. Jis mėgsta greitą darbo tempą ir gerai jaučiasi dinamiškoje aplinkoje. Dėl šio greičio kartais gali nukentėti dėmesys detalėms, tačiau jis puikiai tvarkosi su degančiais terminais.`;
        if (score <= 4) return `Sprendimų priėmimo procese ${firstName} yra labai atsargus ir analitiškas. Prieš pasirinkdamas (pvz., kokius egzaminus laikyti), jis išanalizuos visą įmanomą informaciją. Jis nemėgsta būti skubinamas.`;
        return `${firstName} randa aukso viduriuką tarp greičio ir kokybės. Jis nepasiduoda panikai spaudžiant laikui, bet ir nešvaisto laiko perteklinei analizei ten, kur to nereikia.`;
      
      case 'composure':
        if (score >= 7) return `Stresinėse situacijose (pvz., egzaminų sesijos metu) ${firstName} išlieka itin ramus ir racionalus. Jis moka atsiriboti nuo negatyvių emocijų ir susikoncentruoti į problemos sprendimą. Tai rodo aukštą emocinį atsparumą.`;
        if (score <= 4) return `${firstName} yra jautrus aplinkos spaudimui ir stipriai išgyvena nesėkmes. Prieš svarbius atsiskaitymus jam gali prireikti papildomo palaikymo. Iš kitos pusės, šis jautrumas daro jį labai atidų ir atsakingą.`;
        return `Paprastai ${firstName} yra ramus ir susitvardantis, tačiau ekstremaliomis sąlygomis gali parodyti stresą. Jis geba racionalizuoti savo nerimą ir panaudoti jį kaip varikliuką geresniam pasiruošimui.`;
      
      case 'engagement':
        if (score >= 7) return `${firstName} pasižymi labai stipria vidine motyvacija. Jis mokosi ne dėl pažymių ar tėvų lūkesčių, o dėl asmeninio smalsumo. Jis turi aiškius asmeninius standartus ir yra labai lojalus pasirinktai krypčiai.`;
        if (score <= 4) return `Šiuo metu ${firstName} mokymosi procese gali trūkti asmeninės prasmės. Jo motyvacija dažnai priklauso nuo išorinių veiksnių - mokytojų spaudimo, griežtų terminų ar pažymių. Jam svarbu atrasti sritį, kuri natūraliai domintų.`;
        return `${firstName} yra pakankamai įsitraukęs į savo veiklą, tačiau moka atskirti mokslus nuo asmeninio gyvenimo. Jis padarys tai, ko iš jo reikalaujama, tačiau ne visada aukos savo laisvalaikį dėl papildomų akademinių pasiekimų.`;
    }
  };

  // Dinamiškai nustatomos profesijos pagal aukščiausius balus
  const recommendedProfessions = useMemo(() => {
    let profs = [];
    if (scores.impact >= 7 && scores.ideas >= 6) profs.push("Verslo kūrėjas / Vadovas", "Marketingo strategas");
    if (scores.structure >= 7 && scores.momentum <= 5) profs.push("Duomenų analitikas / Kiekybinė ekonomika", "Auditorius", "Architektas");
    if (scores.interaction >= 7 && scores.ideas >= 6) profs.push("Žmogiškųjų išteklių vadovas", "Psichologas", "Edukologas");
    if (scores.composure >= 7 && scores.structure >= 7) profs.push("Chirurgas / Gydytojas specialistams", "Inžinierius");
    if (scores.ideas >= 8) profs.push("UX/UI Dizaineris", "Kūrybos vadovas (Art Director)");
    if (scores.momentum >= 7 && scores.impact >= 6) profs.push("Pardavimų vadovas", "Projektų vadovas");
    
    // Fallback jei balai labai vidutiniški
    if (profs.length < 3) profs.push("Verslo konsultantas", "IT Projektų vadovas", "Finansų analitikas");
    
    return profs.slice(0, 4); // Paimame top 4
  }, [scores]);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 font-sans print:bg-white flex justify-center">
      
      <div className="w-full max-w-5xl bg-white md:my-8 md:rounded-[2rem] shadow-2xl print:shadow-none print:m-0 print:rounded-none overflow-hidden flex flex-col relative min-h-screen md:min-h-[800px]">
        
        {/* --- APP HEADER (Paslėptas spausdinant) --- */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center z-10 print:hidden">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-blue-400" />
            <span className="font-bold tracking-wider">TIKSLIUKAI.LT Karjera</span>
          </div>
          {gameState === 'playing' && (
            <span className="text-xs font-medium text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              {/* Simuliuojamas didelis klausimų skaičius */}
              Klausimas {Math.min(currentIdx * 15 + 1, TOTAL_REAL_QUESTIONS)} / {TOTAL_REAL_QUESTIONS}
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col relative print:block">
          <AnimatePresence mode="wait">
            
            {/* 1. INTRO EKRANAS */}
            {gameState === 'intro' && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-8"
              >
                <div className="bg-blue-50 p-6 rounded-full inline-block shadow-inner">
                  <BrainCircuit className="w-20 h-20 text-blue-600" />
                </div>
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                    Profesionalus <span className="text-blue-600">Darbo Elgsenos</span> Tyrimas
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed mb-4">
                    Tai išsami 7 dimensijų asmenybės analizė, skirta padėti moksleiviams išsirinkti studijų kryptį. Testą sudaro daugiau nei 200 mokslu grįstų teiginių. Užtruksite apie 20 minučių.
                  </p>
                </div>
                <button 
                  onClick={startGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 px-12 rounded-2xl transition-transform hover:scale-105 shadow-xl flex items-center gap-2"
                >
                  Pradėti tyrimą <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* 2. VARTOTOJO INFO EKRANAS */}
            {gameState === 'userInfo' && (
              <motion.div 
                key="userInfo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center flex-1 p-8 text-center"
              >
                <h2 className="text-3xl font-bold mb-8">Personalizuota Ataskaita</h2>
                <div className="w-full max-w-md bg-slate-50 p-8 rounded-3xl border border-slate-200">
                  <label className="block text-left font-bold text-slate-700 mb-2">Jūsų Vardas ir Pavardė</label>
                  <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg font-semibold"
                      placeholder="Įveskite vardą..."
                    />
                  </div>
                  <button 
                    onClick={startQuiz}
                    disabled={!userName.trim()}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors flex justify-center items-center gap-2"
                  >
                    Tęsti prie klausimų <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. KLAUSIMYNAS */}
            {gameState === 'playing' && (
              <motion.div 
                key="quiz"
                className="flex flex-col flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 justify-center"
              >
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-12">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>

                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex items-center justify-center min-h-[200px] mb-12"
                >
                  <h2 className="text-2xl md:text-4xl font-bold text-center text-slate-800 leading-tight">
                    {questions[currentIdx].text}
                  </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                  <button 
                    onClick={() => handleAnswer(true)}
                    className="flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-lg text-slate-700"
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Visiškai sutinku
                  </button>
                  <button 
                    onClick={() => handleAnswer(false)}
                    className="flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-rose-500 hover:bg-rose-50 transition-all font-bold text-lg text-slate-700"
                  >
                    <XCircle className="w-6 h-6 text-rose-500" /> Nesutinku
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. SKAIČIAVIMO EKRANAS */}
            {gameState === 'calculating' && (
              <motion.div 
                key="calc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center flex-1 p-8 text-center bg-slate-900 text-white"
              >
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-8" />
                <h2 className="text-3xl font-bold mb-4">Generuojama ataskaita</h2>
                <p className="text-slate-400 text-lg max-w-md">
                  Analizuojame jūsų atsakymus ir lyginame juos su statistinėmis normomis...
                </p>
              </motion.div>
            )}

            {/* 5. REZULTATŲ EKRANAS / ATSISIUNČIAMAS PDF */}
            {gameState === 'result' && (
              <motion.div 
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 overflow-y-auto print:overflow-visible scrollbar-thin scrollbar-thumb-slate-300 bg-white"
              >
                {/* PDF Antraštė (Matoma tik spausdinant) */}
                <div className="hidden print:block border-b-2 border-slate-900 pb-6 mb-8 pt-10 px-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <h1 className="text-4xl font-black text-slate-900 mb-2">Darbo Elgsenos Profilis</h1>
                      <p className="text-lg text-slate-600 font-semibold">Tiriamasis: <span className="text-black">{userName}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">Tiksliukai.lt</p>
                      <p className="text-sm text-slate-500">Data: {new Date().toLocaleDateString('lt-LT')}</p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-slate-100 rounded-lg text-xs text-slate-600 text-justify">
                    Ši ataskaita yra konfidenciali. Jos tikslas - padėti respondentui suprasti savo natūralius elgsenos polinkius darbo ir mokymosi aplinkoje. Ataskaita neatspindi grynųjų kognityvinių gebėjimų, o labiau atskleidžia asmenines preferencijas. Informacija galioja apie 12 mėnesių, nes keičiantis patirčiai, keičiasi ir elgsena.
                  </div>
                </div>

                {/* Ekrano antraštė ir veiksmai (Paslėpta spausdinant) */}
                <div className="bg-gradient-to-b from-blue-50 to-white print:hidden p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">Tavo profilio analizė paruošta.</h2>
                    <p className="text-slate-600 mt-2">Išsami {userName} asmenybės ir profesinių polinkių ataskaita.</p>
                  </div>
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg"
                  >
                    <Download className="w-5 h-5" /> Atsisiųsti PDF
                  </button>
                </div>

                {/* Pagrindinis turinys (Matomas ir ekrane, ir PDF) */}
                <div className="p-8 md:p-10 print:p-10 space-y-12">
                  
                  {/* Radaro sekcija */}
                  <div className="flex flex-col md:flex-row items-center gap-12 print:break-inside-avoid">
                    <div className="w-full md:w-1/2">
                      <h3 className="text-2xl font-bold border-b-2 border-slate-200 print:border-black pb-3 mb-6">Profilio santrauka</h3>
                      <p className="text-slate-700 leading-relaxed mb-4 text-justify">
                        Grafike pavaizduotas jūsų įvertinimas 7 pagrindinėse elgsenos dimensijose (skalė nuo 1 iki 10). Taškai, esantys arčiau išorinio krašto, rodo stipriai išreikštą savybę.
                      </p>
                      <ul className="space-y-3 text-sm text-slate-600 print:text-black">
                        <li className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" /> Aukšti balai (7-10) rodo dominuojančias savybes.</li>
                        <li className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" /> Vidutiniai balai (5-6) rodo situacinį lankstumą.</li>
                        <li className="flex items-start gap-2"><div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5 shrink-0" /> Žemi balai (1-4) nebūtinai yra trūkumas, jie atspindi alternatyvų požiūrį (pvz., žemas struktūros balas rodo aukštą lankstumą).</li>
                      </ul>
                    </div>
                    <div className="w-full md:w-1/2 bg-slate-50 print:bg-transparent rounded-3xl p-6">
                      <RadarChart scores={scores} />
                    </div>
                  </div>

                  {/* Dimensijų aprašymai */}
                  <div className="space-y-8 print:break-before-page print:pt-10">
                    <h3 className="text-2xl font-bold border-b-2 border-slate-200 print:border-black pb-3 mb-8">Išsami dimensijų analizė</h3>
                    
                    <div className="grid md:grid-cols-2 gap-8 print:gap-6 print:block">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 print:border-b print:border-0 print:border-slate-300 print:rounded-none print:break-inside-avoid print:mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Target className="w-6 h-6 text-blue-600 print:hidden" />
                          <h4 className="font-bold text-lg uppercase tracking-wide">Poveikis ir ambicijos</h4>
                          <span className="ml-auto font-black text-blue-600 print:text-black">{scores.impact}/10</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-justify">{generateText('impact', scores.impact, userName)}</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200 print:border-b print:border-0 print:border-slate-300 print:rounded-none print:break-inside-avoid print:mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <BrainCircuit className="w-6 h-6 text-indigo-600 print:hidden" />
                          <h4 className="font-bold text-lg uppercase tracking-wide">Organizavimas ir struktūra</h4>
                          <span className="ml-auto font-black text-indigo-600 print:text-black">{scores.structure}/10</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-justify">{generateText('structure', scores.structure, userName)}</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200 print:border-b print:border-0 print:border-slate-300 print:rounded-none print:break-inside-avoid print:mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Zap className="w-6 h-6 text-amber-500 print:hidden" />
                          <h4 className="font-bold text-lg uppercase tracking-wide">Idėjos ir pokyčiai</h4>
                          <span className="ml-auto font-black text-amber-500 print:text-black">{scores.ideas}/10</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-justify">{generateText('ideas', scores.ideas, userName)}</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200 print:border-b print:border-0 print:border-slate-300 print:rounded-none print:break-inside-avoid print:mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Users className="w-6 h-6 text-emerald-600 print:hidden" />
                          <h4 className="font-bold text-lg uppercase tracking-wide">Bendradarbiavimas</h4>
                          <span className="ml-auto font-black text-emerald-600 print:text-black">{scores.interaction}/10</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-justify">{generateText('interaction', scores.interaction, userName)}</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200 print:border-b print:border-0 print:border-slate-300 print:rounded-none print:break-inside-avoid print:mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Clock className="w-6 h-6 text-rose-500 print:hidden" />
                          <h4 className="font-bold text-lg uppercase tracking-wide">Darbo tempas</h4>
                          <span className="ml-auto font-black text-rose-500 print:text-black">{scores.momentum}/10</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-justify">{generateText('momentum', scores.momentum, userName)}</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200 print:border-b print:border-0 print:border-slate-300 print:rounded-none print:break-inside-avoid print:mb-6">
                        <div className="flex items-center gap-3 mb-4">
                          <ShieldAlert className="w-6 h-6 text-teal-600 print:hidden" />
                          <h4 className="font-bold text-lg uppercase tracking-wide">Emocinis stabilumas</h4>
                          <span className="ml-auto font-black text-teal-600 print:text-black">{scores.composure}/10</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-justify">{generateText('composure', scores.composure, userName)}</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200 print:border-b print:border-0 print:border-slate-300 print:rounded-none print:break-inside-avoid print:mb-6 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                          <Activity className="w-6 h-6 text-purple-600 print:hidden" />
                          <h4 className="font-bold text-lg uppercase tracking-wide">Įsitraukimas ir autonomija</h4>
                          <span className="ml-auto font-black text-purple-600 print:text-black">{scores.engagement}/10</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-justify">{generateText('engagement', scores.engagement, userName)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rekomendacijos */}
                  <div className="bg-slate-900 print:bg-white text-white print:text-black rounded-3xl print:rounded-none print:border-t-2 print:border-black p-8 md:p-12 mt-12 print:break-inside-avoid">
                    <h3 className="text-2xl font-bold mb-6 text-blue-300 print:text-black">Ateities gairės: Karjeros kryptys</h3>
                    <p className="text-slate-300 print:text-slate-700 mb-8 max-w-3xl">
                      Remiantis išreikštais asmenybės ir elgsenos bruožais, žemiau pateiktos profesinės sritys, kuriose turite didžiausią potencialą pasiekti aukštų rezultatų ir jausti pasitenkinimą darbu.
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {recommendedProfessions.map((prof, i) => (
                        <div key={i} className="bg-white/10 print:bg-slate-100 border border-white/20 print:border-slate-300 p-4 rounded-xl flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {i + 1}
                          </div>
                          <span className="font-semibold text-lg">{prof}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/20 print:border-black flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h4 className="font-bold text-xl mb-2">Trūksta žinių svajonių studijoms?</h4>
                        <p className="text-slate-400 print:text-slate-600">Profesionalūs mokytojai padės pasiruošti VBE egzaminams.</p>
                      </div>
                      <a 
                        href="https://tiksliukai.lt" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white text-slate-900 print:border print:border-black font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shrink-0"
                      >
                        Registruotis pamokoms
                      </a>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
