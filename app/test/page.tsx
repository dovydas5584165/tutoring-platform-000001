"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCcw, 
  Compass, 
  ArrowRight, 
  ArrowLeft, // Added for Back button
  BookOpen, 
  Building2, 
  Briefcase,
  GraduationCap,
  Star,
  X,
  Info
} from "lucide-react";

// --- DATA & TYPES SECTION ---

type CareerType = 'A' | 'B' | 'C' | 'D' | 'E';

interface Profession {
  title: string;
  salary: string;
  description: string;
}

interface University {
  name: string;
  score: string; // Konkursinis balas
}

interface FamousPerson {
  name: string;
  role: string;
}

interface ResultData {
  title: string;
  summary: string;
  positives: string[];
  negatives: string[];
  communication: string;
  exams: string;
  uniLt: University[];
  uniEu: string;
  famousPeople: FamousPerson[];
  professions: Profession[];
}

const RESULTS: Record<CareerType, ResultData> = {
  A: {
    title: "Sistemų Architektas (Inžinerinis-Techninis)",
    summary: "Tu esi strategas, kuris mato pasaulį per logikos ir struktūros prizmę. Tavo smegenys geriausiai veikia sprendžiant sudėtingas technines mįsles, optimizuojant procesus ir kuriant ateities inovacijas.",
    positives: ["Loginis mąstymas", "Preciziškumas", "Algoritminis mąstymas", "Savarankiškumas"],
    negatives: ["Socialinis nuovargis", "Per didelis kritiškumas", "Perfekcionizmas"],
    communication: "Draugai tave vertina už tavo objektyvumą. Tu nemėgsti tuščių kalbų, kalbi faktais ir vertini intelektualų ryšį.",
    exams: "Matematika (valstybinis), Fizika, Informacinės Technologijos, Anglų kalba.",
    uniLt: [
      { name: "KTU Informatikos fak.", score: "KB: >8.2" },
      { name: "VU Matematikos ir informatikos fak.", score: "KB: >8.8" },
      { name: "VILNIUS TECH", score: "KB: >7.5" }
    ],
    uniEu: "TU Delft (Olandija), ETH Zurich (Šveicarija), Miuncheno technikos universitetas.",
    famousPeople: [
      { name: "Elon Musk", role: "Tesla & SpaceX įkūrėjas" },
      { name: "Bill Gates", role: "Microsoft įkūrėjas" },
      { name: "Margaret Hamilton", role: "NASA programuotoja" }
    ],
    professions: [
      { title: "Programinės įrangos inžinierius", salary: "2000-5500€", description: "Kuria, testuoja ir diegia kompiuterines programas. Rašo kodą, kuris valdo viską – nuo mobiliųjų programėlių iki kosminių laivų sistemų." },
      { title: "Duomenų mokslininkas", salary: "2500-5000€", description: "Analizuoja didžiulius duomenų kiekius naudodamas statistiką ir mašininį mokymąsi, kad padėtų įmonėms priimti pagrįstus sprendimus." },
      { title: "Kibernetinio saugumo analitikas", salary: "2200-4800€", description: "Apsaugo organizacijų tinklus ir duomenis nuo programišių atakų. Tai nuolatinė kova tarp gynybos ir puolimo skaitmeninėje erdvėje." },
      { title: "Dirbtinio intelekto kūrėjas", salary: "3000-6500€", description: "Kuria algoritmus, kurie leidžia kompiuteriams mokytis ir priimti sprendimus (pvz., ChatGPT, savavaldžiai automobiliai)." },
      { title: "Debesijos architektas", salary: "2800-5800€", description: "Projektuoja serverių infrastruktūrą 'debesyse' (AWS, Azure), užtikrinant, kad sistemos veiktų greitai ir patikimai." },
      { title: "Robotikos inžinierius", salary: "1800-4000€", description: "Projektuoja ir konstruoja robotus bei automatizuotas sistemas, kurios pakeičia žmogaus darbą gamyboje ar pavojingose zonose." },
      { title: "DevOps inžinierius", salary: "2500-5200€", description: "Sujungia programavimą ir sistemų administravimą, automatizuodamas programinės įrangos diegimo procesus." },
      { title: "Blockchain vystytojas", salary: "2500-6000€", description: "Kuria decentralizuotas sistemas ir kriptovaliutų technologijas, užtikrinančias saugius sandorius be tarpininkų." },
      { title: "Sistemų administratorius", salary: "1500-3000€", description: "Prižiūri įmonės kompiuterių tinklus, serverius ir įrangą, užtikrindamas sklandų kasdienį darbą." },
      { title: "Elektronikos inžinierius", salary: "1600-3500€", description: "Kuria elektronines grandines ir prietaisus – nuo išmaniųjų telefonų komponentų iki medicininės įrangos." }
    ]
  },
  B: {
    title: "Žmonių Ugdytojas (Socialinis-Emocinis)",
    summary: "Tavo stiprybė- empatija ir komunikacija. Tu jauti kitų emocijas, gebi juos motyvuoti, suprasti ir nukreipti teisinga linkme. Tau svarbu darbas, turintis prasmę.",
    positives: ["Empatija", "Klausymo įgūdžiai", "Diplomatija", "Kantrybė"],
    negatives: ["Sunkumas brėžti ribas", "Emocinis jautrumas kitiems", "Kritikos baimė"],
    communication: "Esi draugų būrio patarėjas. Moki išklausyti, suprasti be žodžių ir visada rasti tinkamą paguodos ar palaikymo frazę.",
    exams: "Lietuvių kalba, Anglų kalba, Biologija (psichologijai) arba Istorija.",
    uniLt: [
      { name: "VU Psichologijos fak.", score: "KB: >9.0" },
      { name: "LSMU (Sveikatos psichologija)", score: "KB: >8.5" },
      { name: "VDU Socialinių mokslų fak.", score: "KB: >7.0" }
    ],
    uniEu: "Amsterdamo universitetas (Olandija), KU Leuven (Belgija), Kopenhagos universitetas.",
    famousPeople: [
      { name: "Oprah Winfrey", role: "TV laidų vedėja, filantropė" },
      { name: "Michelle Obama", role: "Advokatė, rašytoja" },
      { name: "Princess Diana", role: "Humanitarė" }
    ],
    professions: [
      { title: "Klinikinis psichologas", salary: "1500-3000€", description: "Diagnozuoja ir gydo emocinius bei psichinius sutrikimus, padeda žmonėms įveikti krizes." },
      { title: "Personalo vadovas (HR)", salary: "1800-3800€", description: "Rūpinasi įmonės darbuotojų gerove, atrankomis, motyvacija ir vidine kultūra." },
      { title: "Karjeros konsultantas", salary: "1200-2500€", description: "Padeda žmonėms atrasti savo profesinį kelią, ruošti CV ir pasiruošti darbo pokalbiams." },
      { title: "Socialinis darbuotojas", salary: "1100-2000€", description: "Teikia pagalbą pažeidžiamoms visuomenės grupėms, vaikams ar senjorams, sprendžia socialines problemas." },
      { title: "Mediatorius (Taikytojas)", salary: "1500-3200€", description: "Nešališkas asmuo, padedantis spręsti konfliktus tarp dviejų šalių (pvz., skyrybų ar verslo ginčų metu)." },
      { title: "Ryšių su visuomene (PR) specialistas", salary: "1400-3500€", description: "Formuoja organizacijos ar asmens įvaizdį viešojoje erdvėje, bendrauja su žiniasklaida." },
      { title: "Mokymų treneris (Lektorius)", salary: "1500-4000€", description: "Veda seminarus ir mokymus įmonėms ar grupėms, ugdydamas specifinius įgūdžius." },
      { title: "Ergoterapeutas", salary: "1300-2400€", description: "Padeda žmonėms po traumų ar ligų susigrąžinti kasdienius įgūdžius ir savarankiškumą." },
      { title: "Renginių organizatorius", salary: "1200-3000€", description: "Planuoja ir koordinuoja šventes, konferencijas ar festivalius, užtikrindamas geras dalyvių emocijas." },
      { title: "Specialusis pedagogas", salary: "1300-2200€", description: "Dirba su vaikais, turinčiais specialiųjų poreikių, padėdamas jiems integruotis ir mokytis." }
    ]
  },
  C: {
    title: "Vizijų Kūrėjas (Kūrybinis-Meninis)",
    summary: "Tu esi idėjų generatorius, kuriam reikia laisvės. Pasaulį matai ne tokį, koks jis yra, o tokį, koks galėtų būti. Rutina tave žudo, o laisvė – įkvepia.",
    positives: ["Kūrybiškumas", "Originalumas", "Vizualinis mąstymas", "Intuicija"],
    negatives: ["Chaotiškumas", "Rutinos netoleravimas", "Nepastovumas"],
    communication: "Esi charizmatiškas. Draugai tave vertina už kitokį požiūrį į gyvenimą, estetiką ir gebėjimą nustebinti.",
    exams: "Lietuvių kalba, Anglų kalba, Dailės/Architektūros stojamieji, Istorija.",
    uniLt: [
      { name: "Vilniaus Dailės Akademija (VDA)", score: "KB: Portfelis + Egz." },
      { name: "LMTA (Muzikos ir teatro)", score: "KB: Stojamasis" },
      { name: "VU Kūrybinės industrijos", score: "KB: >6.5" }
    ],
    uniEu: "UAL Londonas (JK), Dizaino akademija Eindhoven (Olandija), Aalto universitetas (Suomija).",
    famousPeople: [
      { name: "Steve Jobs", role: "Apple įkūrėjas" },
      { name: "Coco Chanel", role: "Dizainerė" },
      { name: "Walt Disney", role: "Animacijos pionierius" }
    ],
    professions: [
      { title: "UX/UI Dizaineris", salary: "1800-4200€", description: "Kuria patogias ir estetiškas interneto svetainių bei programėlių sąsajas, rūpinasi vartotojo patirtimi." },
      { title: "Meno vadovas (Art Director)", salary: "2500-5000€", description: "Vadovauja kūrybinei komandai reklamos agentūrose ar leidyklose, atsako už bendrą vizualinį stilių." },
      { title: "Vaizdo montuotojas", salary: "1400-3200€", description: "Montuoja filmuotą medžiagą filmams, reklamoms ar YouTube kanalams, kurdamas pasakojimą vaizdais." },
      { title: "Architektas", salary: "1600-4000€", description: "Projektuoja pastatus ir erdves, derindamas inžineriją, funkcionalumą ir estetiką." },
      { title: "Žaidimų dizaineris (Game Designer)", salary: "1800-4500€", description: "Kuria vaizdo žaidimų koncepcijas, taisykles, lygius ir istorijas." },
      { title: "Turinio kūrėjas (Content Creator)", salary: "1000-5000€+", description: "Kuria tekstinį, vaizdinį ar video turinį socialiniams tinklams ir prekių ženklams." },
      { title: "Interjero dizaineris", salary: "1500-3500€", description: "Planuoja ir dekoruoja vidaus erdves, parinkdamas baldus, spalvas ir apšvietimą." },
      { title: "3D modeliuotojas", salary: "1600-3800€", description: "Kuria trimačius objektus žaidimams, filmams arba produktų vizualizacijoms." },
      { title: "Mados dizaineris", salary: "1200-4000€", description: "Kuria drabužių ir aksesuarų kolekcijas, seka mados tendencijas." },
      { title: "Copywriter (Tekstų kūrėjas)", salary: "1300-2800€", description: "Rašo įtraukiančius tekstus reklamoms, svetainėms ir straipsniams." }
    ]
  },
  D: {
    title: "Strategas & Lyderis (Verslo-Vadybinis)",
    summary: "Esi ambicingas žmogus, orientuotas į rezultatą, galią ir sėkmę. Gebi matyti didįjį paveikslą, nebijai rizikos ir moki vesti komandas į priekį.",
    positives: ["Lyderystė", "Ryžtingumas", "Strategija", "Derybiniai įgūdžiai"],
    negatives: ["Nekantrumas", "Poilsio ignoravimas", "Polinkis dominuoti"],
    communication: "Esi organizatorius. Kalbi užtikrintai, argumentuotai, motyvuoji kitus veikti. Mėgsti laimėti diskusijas.",
    exams: "Matematika (valstybinis), Anglų kalba, Geografija arba Istorija.",
    uniLt: [
      { name: "ISM Vadybos ir ekonomikos univ.", score: "KB: >7.0" },
      { name: "VU Verslo mokykla", score: "KB: >7.5" },
      { name: "KTU Ekonomikos ir verslo fak.", score: "KB: >6.5" }
    ],
    uniEu: "SSE Stokholmas (Švedija), IE verslo mokykla (Ispanija), HEC Paryžius (Prancūzija).",
    famousPeople: [
      { name: "Jeff Bezos", role: "Amazon įkūrėjas" },
      { name: "Richard Branson", role: "Virgin Group įkūrėjas" },
      { name: "Sheryl Sandberg", role: "Facebook COO" }
    ],
    professions: [
      { title: "Verslininkas (Antrepreneris)", salary: "Neribota", description: "Kuria savo verslą nuo idėjos iki realizavimo, prisiima riziką ir valdo procesus." },
      { title: "Investicijų valdytojas", salary: "3000-8000€", description: "Valdo dideles pinigų sumas, investuoja į akcijas, fondus ar nekilnojamąjį turtą." },
      { title: "Projektų vadovas (PM)", salary: "2000-4500€", description: "Planuoja, vykdo ir užbaigia projektus, koordinuoja komandos darbą ir biudžetą." },
      { title: "Pardavimų direktorius", salary: "2500-6000€", description: "Vadovauja pardavimų komandai, kuria strategijas, kaip padidinti įmonės pajamas." },
      { title: "Verslo konsultantas", salary: "2200-5500€", description: "Analizuoja kitų įmonių problemas ir teikia rekomendacijas, kaip pagerinti veiklą." },
      { title: "Produkto vadovas (Product Owner)", salary: "2400-5000€", description: "Atsako už konkretaus produkto viziją, vystymą ir sėkmę rinkoje." },
      { title: "Rinkodaros vadovas (CMO)", salary: "2000-5000€", description: "Kuria prekės ženklo strategiją, reklamnines kampanijas ir rūpinasi žinomumu." },
      { title: "Nekilnojamojo turto vystytojas", salary: "Neribota", description: "Inicijuoja statybų projektus, perka žemę ir organizuoja pastatų statybą bei pardavimą." },
      { title: "Logistikos vadovas", salary: "1800-3500€", description: "Organizuoja prekių judėjimą tarptautiniu mastu, optimizuoja tiekimo grandines." },
      { title: "Finansų direktorius (CFO)", salary: "3000-7000€", description: "Atsako už visus įmonės finansus, biudžeto planavimą ir finansines ataskaitas." }
    ]
  },
  E: {
    title: "Saugotojas & Tyrėjas (Mokslo-Struktūrinis)",
    summary: "Tu vertini faktus, tvarką ir preciziškumą. Esi patikimas, kruopštus žmogus. Mokslo, medicinos ar teisės sritys tau tinka, nes ten klaidos kaina yra didelė.",
    positives: ["Atsakomybė", "Atidumas detalėms", "Sąžiningumas", "Metodiškumas"],
    negatives: ["Baimė keisti planus", "Perfekcionizmas detalėse", "Sunkus prisitaikymas"],
    communication: "Komunikuoji ramiai, logiškai. Nemėgsti pagražinimų, vertini punktualumą ir konkretumą. Tavo žodis yra šventas.",
    exams: "Biologija, Chemija, Matematika, Lietuvių kalba.",
    uniLt: [
      { name: "LSMU (Medicina)", score: "KB: >9.5" },
      { name: "VU Medicinos fak.", score: "KB: >9.2" },
      { name: "VU Gyvybės mokslų centras", score: "KB: >8.5" }
    ],
    uniEu: "Heidelbergo universitetas (Vokietija), Karolinska Institutet (Švedija), Sorbona (Prancūzija).",
    famousPeople: [
      { name: "Marie Curie", role: "Mokslininkė" },
      { name: "Angela Merkel", role: "Politikė, fizikė" },
      { name: "Dr. House (Personažas)", role: "Diagnostikas" }
    ],
    professions: [
      { title: "Gydytojas / Chirurgas", salary: "2500-7000€", description: "Diagnozuoja ligas, atlieka operacijas ir skiria gydymą. Reikalauja ilgų studijų ir atsakomybės." },
      { title: "Biotechnologas", salary: "1600-3500€", description: "Naudoja gyvus organizmus kurdamas vaistus, maisto produktus ar naujas medžiagas." },
      { title: "Auditorius", salary: "1500-3200€", description: "Tikrina įmonių finansines ataskaitas, užtikrina, kad jos atitiktų įstatymus ir būtų tikslios." },
      { title: "Farmacininkas", salary: "1500-2800€", description: "Kuria arba išduoda vaistus, konsultuoja pacientus dėl vaistų vartojimo ir sąveikos." },
      { title: "Teismo medicinos ekspertas", salary: "1600-3000€", description: "Tiria nusikaltimų vietas ir įkalčius naudodamas mokslo metodus tiesai nustatyti." },
      { title: "Inžinierius-konstruktorius", salary: "1800-4000€", description: "Projektuoja pastatų konstrukcijas, užtikrindamas, kad jie būtų saugūs ir stabilūs." },
      { title: "Draudimo rizikos vertintojas", salary: "1700-3500€", description: "Analizuoja duomenis ir skaičiuoja tikimybes, kad nustatytų draudimo kainas ir rizikas." },
      { title: "Laboratorijos vedėjas", salary: "1600-3200€", description: "Vadovauja moksliniams tyrimams, prižiūri įrangą ir užtikrina tyrimų tikslumą." },
      { title: "Apskaitininkas / Buhalteris", salary: "1200-2800€", description: "Tvarko įmonės finansinius dokumentus, skaičiuoja atlyginimus ir mokesčius." },
      { title: "Odontologas", salary: "2500-6000€", description: "Rūpinasi pacientų burnos sveikata, gydo dantis ir atlieka estetines procedūras." }
    ]
  }
};

const RAW_QUESTIONS = [
  { q: "Mėgstu spręsti loginius galvosūkius ir mįsles.", t: "A" }, { q: "Man įdomu, kaip veikia algoritmai ir kodas.", t: "A" },
  { q: "Galiu ilgai sėdėti prie vienos techninės problemos.", t: "A" }, { q: "Man patinka aiški struktūra ir skaičiai.", t: "A" },
  { q: "Greitai pastebiu sistemos klaidas ar neefektyvumą.", t: "A" }, { q: "Mėgstu automatizuoti pasikartojančius darbus.", t: "A" },
  { q: "Man įdomu ardyti prietaisus ir suprasti jų veikimą.", t: "A" }, { q: "Suprantu kompiuterių tinklų logiką.", t: "A" },
  { q: "Analizuoju statistiką ir grafikus savo malonumui.", t: "A" }, { q: "Mane domina duomenų saugumas ir privatumas.", t: "A" },
  { q: "Moku išklausyti žmogų jo nepertraukdamas.", t: "B" }, { q: "Socialinės problemos ir nelygybė man rūpi.", t: "B" },
  { q: "Galiu lengvai paaiškinti sudėtingą dalyką vaikui.", t: "B" }, { q: "Jaučiu prasmę padėdamas kitiems tobulėti.", t: "B" },
  { q: "Gera atmosfera komandoje man svarbiau už rezultatą.", t: "B" }, { q: "Domiuosi psichologija ir žmonių elgsena.", t: "B" },
  { q: "Nuoširdžiai džiaugiuosi kitų sėkme.", t: "B" }, { q: "Moku motyvuoti nusivylusį žmogų.", t: "B" },
  { q: "Darbas be prasmės man būtų kančia.", t: "B" }, { q: "Mėgstu pažinti skirtingas kultūras.", t: "B" },
  { q: "Pastebiu, kai spalvos ar formos nedera tarpusavyje.", t: "C" }, { q: "Daug laiko praleidžiu svajodamas apie idėjas.", t: "C" },
  { q: "Mėgstu kurti video, fotografuoti ar piešti.", t: "C" }, { q: "Originalumas man svarbiau už taisykles.", t: "C" },
  { q: "Mėgstu keisti savo aplinkos dizainą.", t: "C" }, { q: "Mada, kinas ir menas mane įkvepia.", t: "C" },
  { q: "Man svarbu, kad rezultatas būtų estetiškas.", t: "C" }, { q: "Mano idėjos kitiems kartais atrodo keistos.", t: "C" },
  { q: "Norėčiau sukurti savo prekinį ženklą.", t: "C" }, { q: "Mėgstu gaminti ar meistrauti rankomis.", t: "C" },
  { q: "Mėgstu derėtis ir gauti geriausią kainą.", t: "D" }, { q: "Konkurencija mane motyvuoja stengtis labiau.", t: "D" },
  { q: "Galiu priimti sprendimus spaudimo metu.", t: "D" }, { q: "Finansinė sėkmė man yra svarbus rodiklis.", t: "D" },
  { q: "Visada turiu planą B ir C.", t: "D" }, { q: "Nebijau finansinės rizikos, jei matau galimybę.", t: "D" },
  { q: "Mėgstu vadovauti grupiniams projektams.", t: "D" }, { q: "Galiu įtikinti kitus savo tiesa.", t: "D" },
  { q: "Svajoju turėti savo verslą ar įmonę.", t: "D" }, { q: "Statusas ir pripažinimas man svarbu.", t: "D" },
  { q: "Mėgstu klasifikuoti ir rūšiuoti informaciją.", t: "E" }, { q: "Visada pastebiu rašybos ar faktines klaidas.", t: "E" },
  { q: "Gamtos mokslai (biologija, chemija) man patinka.", t: "E" }, { q: "Aiškios instrukcijos ir rutina manęs negąsdina.", t: "E" },
  { q: "Mėgstu atlikti tikslius eksperimentus.", t: "E" }, { q: "Sveikata ir ekologija man prioritetas.", t: "E" },
  { q: "Galiu ilgai dirbti susikaupęs prie detalių.", t: "E" }, { q: "Saugumo taisyklių laikymasis yra būtinas.", t: "E" },
  { q: "Visada skaitau instrukcijas iki galo.", t: "E" }, { q: "Disciplina ir tvarka man padeda gyventi.", t: "E" }
] as const;

// --- COMPONENTS ---

// Profession Details Modal
function ProfessionModal({ profession, onClose }: { profession: Profession | null, onClose: () => void }) {
  if (!profession) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h3 className="text-2xl font-bold pr-8">{profession.title}</h3>
          <div className="mt-2 inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg backdrop-blur-md">
            <span className="font-semibold">{profession.salary}</span>
            <span className="text-xs opacity-90">/mėn. (Bruto)</span>
          </div>
        </div>

        <div className="p-8">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">Apie profesiją</h4>
          <p className="text-slate-700 text-lg leading-relaxed">
            {profession.description}
          </p>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              Uždaryti
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Results View Component
function ResultsView({ result, onRestart }: { result: ResultData, onRestart: () => void }) {
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);

  return (
    <motion.div 
      key="result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto max-h-[85vh] md:max-h-[800px] scrollbar-thin scrollbar-thumb-slate-300"
    >
      {/* Modal for Profession Details */}
      <AnimatePresence>
        {selectedProfession && (
          <ProfessionModal profession={selectedProfession} onClose={() => setSelectedProfession(null)} />
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-8 md:p-12 text-center border-b border-slate-100">
        <span className="inline-block py-1.5 px-4 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
          Tavo Karjeros Tipas
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          {result.title}
        </h2>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          {result.summary}
        </p>
      </div>

      <div className="p-6 md:p-10 space-y-12 bg-white">
        
        {/* Strengths / Weaknesses Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-emerald-50/60 p-8 rounded-3xl border border-emerald-100 shadow-sm">
            <h3 className="text-emerald-800 font-bold mb-6 flex items-center gap-3 text-xl">
              <span className="text-3xl">💪</span> Stipriosios savybės
            </h3>
            <div className="flex flex-wrap gap-3">
              {result.positives.map((item, i) => (
                <span key={i} className="px-4 py-2 bg-white text-emerald-900 text-base font-semibold rounded-xl border border-emerald-200 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-rose-50/60 p-8 rounded-3xl border border-rose-100 shadow-sm">
            <h3 className="text-rose-800 font-bold mb-6 flex items-center gap-3 text-xl">
              <span className="text-3xl">🚧</span> Augimo zonos
            </h3>
            <div className="flex flex-wrap gap-3">
              {result.negatives.map((item, i) => (
                <span key={i} className="px-4 py-2 bg-white text-rose-900 text-base font-semibold rounded-xl border border-rose-200 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Famous People (Hall of Fame) */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /> Panašūs į tave žmonės
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {result.famousPeople.map((person, i) => (
                  <div key={i} className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {person.name.charAt(0)}
                    </div>
                    <div className="font-bold text-lg">{person.name}</div>
                    <div className="text-sm text-slate-300 mt-1">{person.role}</div>
                  </div>
                ))}
              </div>
           </div>
           {/* Decorative bg elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Communication Card */}
          <div className="md:col-span-3 bg-gradient-to-r from-slate-50 to-white p-8 rounded-3xl border border-slate-200 relative shadow-sm">
             <div className="absolute top-6 right-6 p-4 opacity-[0.03]">
               <Briefcase size={140} />
             </div>
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-3 text-xl relative z-10">
               <span className="text-3xl">🤝</span> Bendravimo stilius
             </h3>
             <p className="text-slate-700 text-lg leading-relaxed relative z-10 max-w-4xl">{result.communication}</p>
          </div>

          {/* Exams Column */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <BookOpen className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-xl">Egzaminai</h4>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed flex-1 mb-8">{result.exams}</p>
            
            <div className="mt-auto bg-slate-900 rounded-2xl p-6 text-white text-center shadow-xl relative overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1">
              <p className="text-xs font-bold text-blue-300 mb-2 uppercase tracking-wide">Nori geriausio rezultato?</p>
              <a href="https://tiksliukai.lt" target="_blank" rel="noopener noreferrer" className="text-2xl font-black flex items-center justify-center gap-2">
                TIKSLIUKAI.LT <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
{/* Universities Column */}
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                    <GraduationCap className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-xl">Studijų kryptys</h4>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Lietuvoje
                </h5>
                <ul className="space-y-3">
                  {result.uniLt.map((uni, i) => (
                    <li key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                       <span className="text-slate-700 font-medium truncate mr-2">{uni.name}</span>
                       <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded ml-2 whitespace-nowrap">{uni.score}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col">
                <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span> Europoje
                </h5>
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex-1">
                   <p className="text-slate-700 font-medium leading-relaxed break-words">
                      {result.uniEu}
                   </p>
                </div>
              </div>
            </div>
          </div>

        {/* Professions Section */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3 pb-4 border-b border-slate-100">
            <Building2 className="w-8 h-8 text-blue-500" /> Tau tinkančios profesijos
            <span className="text-sm font-normal text-slate-500 ml-auto flex items-center gap-1">
              <Info className="w-4 h-4" /> Paspausk kortelę informacijai
            </span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {result.professions.map((prof, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => setSelectedProfession(prof)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between h-full"
              >
                <div>
                   <h4 className="font-bold text-lg text-slate-800 group-hover:text-blue-700 transition-colors mb-2">
                     {prof.title}
                   </h4>
                </div>
                <div className="mt-4 flex items-center justify-between">
                   <span className="text-xs font-extrabold bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                     {prof.salary}
                   </span>
                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="pt-12 text-center pb-8 border-t border-slate-100 mt-12">
          <button 
            onClick={onRestart}
            className="inline-flex items-center gap-3 text-slate-500 font-bold hover:text-blue-600 transition-colors px-8 py-4 rounded-xl hover:bg-slate-50 text-lg"
          >
            <RefreshCcw className="w-5 h-5" /> Pradėti testą iš naujo
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN COMPONENT ---

export default function CareerQuiz() {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'result'>('intro');
  const [questions, setQuestions] = useState([...RAW_QUESTIONS]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ A: 0, B: 0, C: 0, D: 0, E: 0 });
  const [history, setHistory] = useState<{ type: string; isYes: boolean }[]>([]);

  const startGame = () => {
    setQuestions([...RAW_QUESTIONS].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setScores({ A: 0, B: 0, C: 0, D: 0, E: 0 });
    setHistory([]);
    setGameState('playing');
  };

  const handleAnswer = (isYes: boolean) => {
    const type = questions[currentIdx].t;
    if (isYes) {
      setScores(prev => ({ ...prev, [type]: prev[type] + 1 }));
    }
    
    // Save to history
    setHistory(prev => [...prev, { type, isYes }]);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setGameState('result');
    }
  };

  const handleBack = () => {
    if (currentIdx === 0) return;

    const lastEntry = history[history.length - 1];
    if (lastEntry.isYes) {
      setScores(prev => ({ ...prev, [lastEntry.type]: prev[lastEntry.type] - 1 }));
    }

    setHistory(prev => prev.slice(0, -1));
    setCurrentIdx(prev => prev - 1);
  };

  const getWinner = () => {
    return Object.keys(scores).reduce((a, b) => 
      scores[a] > scores[b] ? a : b
    ) as CareerType;
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[700px] flex flex-col relative">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-blue-400" />
            <span className="font-bold tracking-wider text-xl">TIKSLIUKAI.LT</span>
          </div>
          {gameState === 'playing' && (
            <span className="text-sm font-medium text-slate-300 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
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
                className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-10"
              >
                <div className="bg-blue-50 p-8 rounded-full inline-block shadow-inner ring-8 ring-blue-50/50">
                  <span className="text-7xl">🧭</span>
                </div>
                <div className="max-w-2xl">
                  <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                    Atrask Savo <span className="text-blue-600">Profesinį Kelią</span>
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    Tai ne šiaip testas. Tai tavo asmenybės žemėlapis. Sužinok, kur tavo stiprybės atneš didžiausią sėkmę, kokios studijos tau tinka ir kokio atlyginimo gali tikėtis.
                  </p>
                </div>
                <button 
                  onClick={startGame}
                  className="group bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-5 px-16 rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-blue-600/30 flex items-center gap-3"
                >
                  Pradėti <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {/* QUIZ VIEW */}
            {gameState === 'playing' && (
              <motion.div 
                key="quiz"
                className="flex flex-col flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 justify-center"
              >
                {/* Back Button and Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <button 
                          onClick={handleBack}
                          disabled={currentIdx === 0}
                          className={`flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors ${currentIdx === 0 ? 'invisible' : 'visible'}`}
                        >
                          <ArrowLeft className="w-4 h-4" /> Buvęs klausimas
                        </button>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                        />
                    </div>
                </div>

                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex items-center justify-center min-h-[200px] mb-12"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 leading-tight">
                    {questions[currentIdx].q}
                  </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
                  <button 
                    onClick={() => handleAnswer(true)}
                    className="flex items-center justify-center gap-4 p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all group shadow-sm hover:shadow-xl"
                  >
                    <CheckCircle2 className="w-8 h-8 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    <span className="font-bold text-xl text-slate-600 group-hover:text-emerald-700">Taip, tai aš</span>
                  </button>
                  <button 
                    onClick={() => handleAnswer(false)}
                    className="flex items-center justify-center gap-4 p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-rose-500 hover:bg-rose-50 transition-all group shadow-sm hover:shadow-xl"
                  >
                    <XCircle className="w-8 h-8 text-slate-300 group-hover:text-rose-500 transition-colors" />
                    <span className="font-bold text-xl text-slate-600 group-hover:text-rose-700">Ne, nelabai</span>
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
