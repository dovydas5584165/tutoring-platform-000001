"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Compass,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Building2,
  Briefcase,
  GraduationCap,
  Star,
  X,
  Info,
  Download,
  Calculator,
  ClipboardList,
  Radar as RadarIcon,
  HelpCircle,
  Clock,
  CheckSquare,
  Users,
  ShieldCheck,
  AlertTriangle,
  Layers,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// --- CONFIGURATION ---
// Math is treated as "lacking" when the numerical-aptitude category is at or below this % (3 questions: 0 or 1 correct)
const LOW_MATH_THRESHOLD = 33;
const NUMERIC_QUESTION_COUNT = 3;

// ============================================================================
// DATA & TYPES
// ============================================================================

// A Technologijos | B Socialinė pagalba | C Dizainas ir architektūra | D Verslas | E Sveikata
// F Mokslas | G Gamta ir aplinka | H Teisė ir viešieji reikalai | I Komunikacija ir žiniasklaida | J Menas ir vaizdo kūryba
type TypeKey = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";
const TYPES: TypeKey[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

type EuUni = { name: string; program: string };
type AltItem = { name: string; programs: string };
type Profession = { title: string; salary: string; description: string };
type ResultData = {
  title: string;
  summary: string;
  positives: string[];
  negatives: string[];
  communication: string;
  exams: string;
  uniLt: { name: string; score: string }[];
  uniEu: EuUni[];
  famousPeople: { name: string; role: string }[];
  professions: Profession[];
};

const p = (title: string, salary: string, description: string): Profession => ({ title, salary, description });

const LAMA_BPO_GENERAL_INFO = {
  mandatoryNotice: "Stojant į Lietuvos aukštąsias mokyklas (VF ir VNF su stipendija) PRIVALOMA būti išlaikius Matematikos VBE, Lietuvių k. ir literatūros VBE bei 3-ią pasirinktą VBE.",
  minCriteria: [
    "Ne mažiau 3 valstybiniai brandos egzaminai (VBE): Lietuvių k., Matematika + 1 pasirinktinis VBE.",
    "Minimali VBE išlaikymo ribinė reikšmė: pasiekta pagrindinio pasiekimų lygio riba (≥25 balų).",
    "Minimalus konkursinis balas (KB): paprastai ≥ 5.4 universitetuose ir ≥ 3.3 kolegijose (tikslina kiekviena aukštoji mokykla).",
  ]
};

// Dimensions where weak maths is a real obstacle. Others get a softer "check your programme" note.
const MATH_HIGH: Record<TypeKey, boolean> = {
  A: true, B: false, C: false, D: true, E: false, F: true, G: false, H: false, I: false, J: false,
};

const RESULTS: Record<TypeKey, ResultData> = {
  A: {
    title: "Sistemų Architektas (Technologijų-Inžinerinis)",
    summary:
      "Tu esi strategas, kuris mato pasaulį per logikos ir struktūros prizmę. Tavo smegenys geriausiai veikia sprendžiant sudėtingas technines mįsles, optimizuojant procesus ir kuriant ateities inovacijas.",
    positives: ["Loginis mąstymas", "Preciziškumas", "Algoritminis mąstymas", "Savarankiškumas"],
    negatives: ["Socialinis nuovargis", "Per didelis kritiškumas", "Perfekcionizmas"],
    communication:
      "Draugai tave vertina už tavo objektyvumą. Tu nemėgsti tuščių kalbų, kalbi faktais ir vertini intelektualų ryšį.",
    exams: "Matematika (VBE - Privalomas), Fizika / Informacinės Technologijos (VBE), Lietuvių k. (VBE), Anglų k. (VBE).",
    uniLt: [
      { name: "KTU Informatikos fak.", score: "KB: >8.2" },
      { name: "VU Matematikos ir informatikos fak.", score: "KB: >8.8" },
      { name: "VILNIUS TECH", score: "KB: >7.5" },
    ],
    uniEu: [
      { name: "TU Delft (Olandija)", program: "BSc: Aerospace Engineering, Computer Science & Engineering, Nanobiology, Applied Earth Sciences (anglų k.)" },
      { name: "Eindhoveno technologijos universitetas, TU/e (Olandija)", program: "Inžinerijos bakalauro programos, daugumos dėstomos anglų k. (patikrinkite konkrečią programą)" },
      { name: "Twente universitetas (Olandija)", program: "BSc Electrical Engineering, Technical Computer Science (anglų k.)" },
      { name: "Danijos technikos universitetas, DTU (Danija)", program: "BSc General Engineering (vienintelė pilnai anglų k. bakalauro programa)" },
    ],
    famousPeople: [
      { name: "Elon Musk", role: "Tesla & SpaceX įkūrėjas" },
      { name: "Bill Gates", role: "Microsoft įkūrėjas" },
      { name: "Margaret Hamilton", role: "NASA programuotoja" },
    ],
    professions: [
      p("Programinės įrangos inžinierius", "2000-5500€", "Kuria, testuoja ir diegia kompiuterines programas. Rašo kodą, kuris valdo viską – nuo mobiliųjų programėlių iki kosminių laivų sistemų."),
      p("Duomenų mokslininkas", "2500-5000€", "Analizuoja didžiulius duomenų kiekius naudodamas statistiką ir mašininį mokymąsi, kad padėtų įmonėms priimti pagrįstus sprendimus."),
      p("Kibernetinio saugumo analitikas", "2200-4800€", "Apsaugo organizacijų tinklus ir duomenis nuo programišių atakų."),
      p("Dirbtinio intelekto kūrėjas", "3000-6500€", "Kuria algoritmus, kurie leidžia kompiuteriams mokytis ir priimti sprendimus."),
      p("Debesijos architektas", "2800-5800€", "Projektuoja serverių infrastruktūrą 'debesyse' (AWS, Azure), kad sistemos veiktų greitai ir patikimai."),
      p("Robotikos inžinierius", "1800-4000€", "Projektuoja ir konstruoja robotus bei automatizuotas sistemas."),
      p("DevOps inžinierius", "2500-5200€", "Sujungia programavimą ir sistemų administravimą, automatizuodamas programinės įrangos diegimą."),
      p("Elektronikos inžinierius", "1600-3500€", "Kuria elektronines grandines ir prietaisus – nuo telefonų komponentų iki medicininės įrangos."),
      p("QA inžinierius (testuotojas)", "1500-3500€", "Testuoja programinę įrangą ir užtikrina jos kokybę prieš pasiekiant vartotojus."),
      p("Tinklų inžinierius", "2000-4500€", "Kuria, diegia ir prižiūri kompiuterinių tinklų infrastruktūrą."),
    ],
  },
  B: {
    title: "Empatas (Socialinis-Emocinis)",
    summary:
      "Tavo stiprybė – empatija ir gebėjimas būti šalia. Tu jauti kitų emocijas, gebi išklausyti, palaikyti ir padėti rasti kelią sunkiu metu. Tau svarbu darbas, turintis prasmę.",
    positives: ["Empatija", "Klausymo įgūdžiai", "Diplomatija", "Kantrybė"],
    negatives: ["Sunkumas brėžti ribas", "Emocinis jautrumas kitiems", "Kritikos baimė"],
    communication:
      "Esi draugų būrio patarėjas. Moki išklausyti, suprasti be žodžių ir visada rasti tinkamą paguodos ar palaikymo frazę.",
    exams: "Matematika (VBE - Privalomas), Lietuvių k. (VBE), Anglų k. (VBE), Biologija arba Istorija.",
    uniLt: [
      { name: "VU Psichologijos fak.", score: "KB: >9.0" },
      { name: "LSMU (Sveikatos psichologija)", score: "KB: >8.5" },
      { name: "VDU Socialinių mokslų fak.", score: "KB: >7.0" },
    ],
    uniEu: [
      { name: "Amsterdamo universitetas (Olandija)", program: "BSc Psychology (anglų k.; patikrinkite uva.nl)" },
      { name: "Groningeno universitetas (Olandija)", program: "BSc Psychology (anglų k.)" },
      { name: "Mastrichto universitetas (Olandija)", program: "BSc Psychology (anglų k.)" },
    ],
    famousPeople: [
      { name: "Oprah Winfrey", role: "TV laidų vedėja, filantropė" },
      { name: "Princess Diana", role: "Humanitarė" },
      { name: "Motina Teresė", role: "Vienuolė, vargstančiųjų globėja" },
    ],
    professions: [
      p("Klinikinis psichologas", "1500-3000€", "Diagnozuoja ir gydo emocinius bei psichinius sutrikimus, padeda žmonėms įveikti krizes."),
      p("Karjeros konsultantas", "1200-2500€", "Padeda žmonėms atrasti savo profesinį kelią ir pasiruošti darbo pokalbiams."),
      p("Socialinis darbuotojas", "1100-2000€", "Teikia pagalbą pažeidžiamoms visuomenės grupėms, vaikams ar senjorams."),
      p("Mediatorius (taikytojas)", "1500-3200€", "Nešališkas asmuo, padedantis spręsti konfliktus tarp dviejų šalių."),
      p("Ergoterapeutas", "1300-2400€", "Padeda žmonėms po traumų ar ligų susigrąžinti kasdienius įgūdžius ir savarankiškumą."),
      p("Šeimos terapeutas", "1500-3500€", "Konsultuoja šeimas, padeda joms įveikti krizes ir gerinti santykius."),
      p("Specialusis pedagogas", "1300-2200€", "Dirba su vaikais, turinčiais specialiųjų poreikių, padėdamas jiems mokytis."),
      p("Bendruomenės lyderis", "1200-2800€", "Buria ir atstovauja bendruomenes, inicijuoja socialinius projektus."),
      p("Vaiko teisių apsaugos specialistas", "1400-2500€", "Gina vaikų interesus ir sprendžia sudėtingas šeimų problemas."),
      p("Priklausomybių konsultantas", "1300-2600€", "Padeda asmenims įveikti priklausomybes per terapiją ir palaikymą."),
    ],
  },
  C: {
    title: "Dizaineris & Projektuotojas (Dizaino-Architektūrinis)",
    summary:
      "Tau patinka kurti daiktus, erdves ir sąsajas, kurios yra ir gražios, ir naudingos. Matai, kaip viskas turi atrodyti bei veikti, ir mėgsti paversti idėją konkrečiu projektu.",
    positives: ["Estetinis jausmas", "Erdvinis mąstymas", "Kūrybiškumas", "Dėmesys detalėms"],
    negatives: ["Perfekcionizmas", "Sunkumas priimti kritiką", "Per ilgas detalių derinimas"],
    communication:
      "Mąstai vaizdais, todėl geriausiai paaiškini eskizais ir pavyzdžiais. Draugai vertina tavo skonį ir gebėjimą pastebėti tai, ko kiti nemato.",
    exams: "Matematika (VBE - Privalomas), Lietuvių k. (VBE), Anglų k. (VBE), Dailės / architektūros stojamasis egzaminas ar portfelis (architektūrai ir dizainui).",
    uniLt: [
      { name: "VILNIUS TECH Architektūros fak.", score: "KB: >7.5 + egz." },
      { name: "Vilniaus Dailės Akademija (VDA) – dizainas", score: "Portfelis + egz." },
      { name: "KTU Architektūros ir statybos inst.", score: "KB: >7.0" },
    ],
    uniEu: [
      { name: "UAL Londonas (JK)", program: "Dizaino bakalauro programos anglų k." },
      { name: "Dizaino akademija Eindhoven (Olandija)", program: "BA Design, 4 metai (anglų k.)" },
      { name: "Hanze taikomųjų mokslų universitetas (Olandija)", program: "BA Design (anglų k.)" },
      { name: "Politecnico di Milano (Italija)", program: "Design ir Architecture programos (dalis anglų k.)" },
    ],
    famousPeople: [
      { name: "Zaha Hadid", role: "Architektė" },
      { name: "Coco Chanel", role: "Dizainerė" },
      { name: "Dieter Rams", role: "Pramonės dizaineris" },
    ],
    professions: [
      p("UX/UI dizaineris", "1800-4200€", "Kuria patogias ir estetiškas svetainių bei programėlių sąsajas, rūpinasi vartotojo patirtimi."),
      p("Architektas", "1600-4000€", "Projektuoja pastatus ir erdves, derindamas inžineriją, funkcionalumą ir estetiką."),
      p("Meno vadovas (Art Director)", "2500-5000€", "Vadovauja kūrybinei komandai, atsako už bendrą vizualinį stilių."),
      p("Žaidimų dizaineris", "1800-4500€", "Kuria vaizdo žaidimų koncepcijas, taisykles, lygius ir istorijas."),
      p("Interjero dizaineris", "1500-3500€", "Planuoja ir dekoruoja vidaus erdves, parinkdamas baldus, spalvas ir apšvietimą."),
      p("3D modeliuotojas", "1600-3800€", "Kuria trimačius objektus žaidimams, filmams arba produktų vizualizacijoms."),
      p("Mados dizaineris", "1200-4000€", "Kuria drabužių ir aksesuarų kolekcijas, seka mados tendencijas."),
      p("Pramonės dizaineris", "1600-4000€", "Kuria masinės gamybos produktų formą, funkcijas ir ergonomiką."),
      p("Grafikos dizaineris", "1200-3000€", "Kuria logotipus, maketus, plakatus ir prekių ženklų vizualinį stilių."),
      p("Kraštovaizdžio architektas", "1500-3200€", "Projektuoja parkus, sodus ir viešąsias erdves."),
    ],
  },
  D: {
    title: "Strategas & Lyderis (Verslo-Vadybinis)",
    summary:
      "Esi ambicingas žmogus, orientuotas į rezultatą, galią ir sėkmę. Gebi matyti didįjį paveikslą, nebijai rizikos ir moki vesti komandas į priekį.",
    positives: ["Lyderystė", "Ryžtingumas", "Strategija", "Derybiniai įgūdžiai"],
    negatives: ["Nekantrumas", "Poilsio ignoravimas", "Polinkis dominuoti"],
    communication:
      "Esi organizatorius. Kalbi užtikrintai, argumentuotai, motyvuoji kitus veikti. Mėgsti laimėti diskusijas.",
    exams: "Matematika (VBE - Privalomas), Anglų kalba (VBE), Lietuvių k. (VBE), Geografija arba Istorija.",
    uniLt: [
      { name: "ISM Vadybos ir ekonomikos univ.", score: "KB: >7.0" },
      { name: "VU Verslo mokykla", score: "KB: >7.5" },
      { name: "KTU Ekonomikos ir verslo fak.", score: "KB: >6.5" },
    ],
    uniEu: [
      { name: "SSE Stokholmas (Švedija)", program: "BSc Business & Economics, BSc Retail Management (anglų k.)" },
      { name: "IE verslo mokykla (Ispanija)", program: "Bachelor in Business Administration (anglų k.)" },
      { name: "Roterdamo vadybos mokykla RSM (Olandija)", program: "BSc International Business Administration (anglų k.)" },
      { name: "Kopenhagos verslo mokykla CBS (Danija)", program: "BSc International Business ir kitos anglų k. programos" },
    ],
    famousPeople: [
      { name: "Jeff Bezos", role: "Amazon įkūrėjas" },
      { name: "Richard Branson", role: "Virgin Group įkūrėjas" },
      { name: "Sheryl Sandberg", role: "Facebook COO" },
    ],
    professions: [
      p("Verslininkas (antrepreneris)", "Neribota", "Kuria savo verslą nuo idėjos iki realizavimo, prisiima riziką ir valdo procesus."),
      p("Investicijų valdytojas", "3000-8000€", "Valdo dideles pinigų sumas, investuoja į akcijas, fondus ar nekilnojamąjį turtą."),
      p("Projektų vadovas (PM)", "2000-4500€", "Planuoja, vykdo ir užbaigia projektus, koordinuoja komandą ir biudžetą."),
      p("Pardavimų direktorius", "2500-6000€", "Vadovauja pardavimų komandai, kuria strategijas pajamoms didinti."),
      p("Verslo konsultantas", "2200-5500€", "Analizuoja kitų įmonių problemas ir teikia rekomendacijas veiklai gerinti."),
      p("Produkto vadovas (Product Owner)", "2400-5000€", "Atsako už produkto viziją, vystymą ir sėkmę rinkoje."),
      p("Finansų direktorius (CFO)", "3000-7000€", "Atsako už įmonės finansus, biudžeto planavimą ir ataskaitas."),
      p("Personalo vadovas (HR)", "1800-3800€", "Rūpinasi darbuotojų atranka, motyvacija ir įmonės kultūra."),
      p("Logistikos vadovas", "1800-3500€", "Organizuoja prekių judėjimą tarptautiniu mastu, optimizuoja tiekimo grandines."),
      p("Auditorius", "1500-3200€", "Tikrina įmonių finansines ataskaitas ir užtikrina, kad jos būtų tikslios."),
    ],
  },
  E: {
    title: "Gydytojas & Globėjas (Sveikatos-Medicinos)",
    summary:
      "Tau svarbi žmonių ir gyvūnų sveikata. Esi atsakingas, ramus kritinėse situacijose ir mėgsti mokytis tikslių žinių, kurios gali padėti išgelbėti gyvybę.",
    positives: ["Atsakomybė", "Atidumas detalėms", "Stresui atsparumas", "Metodiškumas"],
    negatives: ["Perfekcionizmas", "Sunkus atsitraukimas nuo darbo", "Emocinis nuovargis"],
    communication:
      "Komunikuoji ramiai, logiškai ir aiškiai. Nemėgsti pagražinimų, vertini punktualumą ir konkretumą. Tavo žodis yra šventas.",
    exams: "Matematika (VBE - Privalomas), Biologija (VBE), Chemija (VBE), Lietuvių k. (VBE).",
    uniLt: [
      { name: "LSMU (Medicina)", score: "KB: >9.5" },
      { name: "VU Medicinos fak.", score: "KB: >9.2" },
      { name: "LSMU Veterinarijos akademija", score: "KB: >8.0" },
    ],
    uniEu: [
      { name: "Varšuvos medicinos universitetas (Lenkija)", program: "6 m. Medicina (MD), anglų k. skyrius" },
      { name: "Karolio universitetas, Praha (Čekija)", program: "General Medicine (anglų k., mokama)" },
      { name: "Semmelweiso universitetas (Vengrija)", program: "General Medicine, Dentistry, Pharmacy (anglų k.)" },
    ],
    famousPeople: [
      { name: "Florence Nightingale", role: "Šiuolaikinės slaugos pradininkė" },
      { name: "Christiaan Barnard", role: "Pirmosios širdies transplantacijos chirurgas" },
      { name: "Dr. House (personažas)", role: "Medicininės diagnostikos genijus" },
    ],
    professions: [
      p("Gydytojas / Chirurgas", "2500-7000€", "Diagnozuoja ligas, atlieka operacijas ir skiria gydymą. Reikalauja ilgų studijų ir atsakomybės."),
      p("Odontologas", "2500-6000€", "Rūpinasi burnos sveikata, gydo dantis ir atlieka estetines procedūras."),
      p("Farmacininkas", "1500-2800€", "Išduoda vaistus ir konsultuoja pacientus dėl vartojimo ir sąveikos."),
      p("Veterinaras", "1500-3500€", "Diagnozuoja ir gydo gyvūnų ligas, atlieka operacijas."),
      p("Slaugytojas", "1300-2500€", "Rūpinasi pacientų fizine ir emocine gerove sveikatos priežiūros įstaigose."),
      p("Kineziterapeutas", "1300-2600€", "Padeda atsigauti po traumų ir operacijų per judesio terapiją."),
      p("Paramedikas", "1300-2500€", "Teikia skubią medicinos pagalbą įvykio vietoje ir greitosios pagalbos automobiliuose."),
      p("Radiologijos technologas", "1400-2800€", "Atlieka rentgeno, KT ir MRT tyrimus diagnostikai."),
      p("Dietologas", "1300-2500€", "Sudaro mitybos planus sergantiems ir sveikiems žmonėms."),
      p("Šeimos gydytojas", "2500-5000€", "Pirmasis pacientų kontaktas sveikatos sistemoje, prižiūri jų sveikatą ilgą laiką."),
    ],
  },
  F: {
    title: "Tyrėjas & Atradėjas (Mokslinis-Tiriamasis)",
    summary:
      "Tave traukia klausimai, į kuriuos dar niekas neturi atsakymo. Mėgsti eksperimentus, teorijas ir gilų nagrinėjimą, o atradimas tau svarbesnis už greitą rezultatą.",
    positives: ["Smalsumas", "Analitinis mąstymas", "Atkaklumas", "Kruopštumas"],
    negatives: ["Užsisklendimas teorijoje", "Nekantrumas dėl lėtų rezultatų", "Sunku pristatyti idėjas paprastai"],
    communication:
      "Kalbi tiksliai ir argumentuotai, mėgsti gilias diskusijas apie idėjas. Nemėgsti paviršutiniškų pokalbių, bet atsiveri su žmonėmis, kurie dalijasi tavo smalsumu.",
    exams: "Matematika (VBE - Privalomas), Fizika arba Chemija (VBE), Lietuvių k. (VBE), Anglų k. (VBE).",
    uniLt: [
      { name: "VU Fizikos fak.", score: "KB: >7.5" },
      { name: "VU Chemijos ir geomokslų fak.", score: "KB: >7.0" },
      { name: "VU Matematikos ir informatikos fak. (matematika)", score: "KB: >7.5" },
      { name: "KTU Cheminės technologijos fak.", score: "KB: >6.5" },
    ],
    uniEu: [
      { name: "Groningeno universitetas (Olandija)", program: "BSc Physics, Mathematics, Chemistry, Astronomy (anglų k.)" },
      { name: "Twente universitetas (Olandija)", program: "BSc Applied Physics, Applied Mathematics (anglų k.)" },
      { name: "Trinity College Dublin (Airija)", program: "Natural Sciences (anglų k.)" },
    ],
    famousPeople: [
      { name: "Albert Einstein", role: "Fizikas, reliatyvumo teorijos autorius" },
      { name: "Marie Curie", role: "Mokslininkė, Nobelio premijos laurentė" },
      { name: "Stephen Hawking", role: "Teorinis fizikas ir kosmologas" },
    ],
    professions: [
      p("Fizikas", "1800-4000€", "Tiria materijos, energijos ir erdvės dėsnius, kuria teorijas ir eksperimentus."),
      p("Chemikas", "1500-3200€", "Tiria medžiagų savybes ir kuria naujas medžiagas, vaistus ar technologijas."),
      p("Matematikas / aktuaras", "2000-4500€", "Kuria matematinius modelius finansams, draudimui ir mokslui."),
      p("Biotechnologas", "1600-3500€", "Naudoja gyvus organizmus kurdamas vaistus, maisto produktus ar medžiagas."),
      p("Genetikos technologas", "1800-3500€", "Atlieka DNR tyrimus, paveldimų ligų ir genetinę analizę."),
      p("Epidemiologas", "1700-4000€", "Tiria ligų plitimą populiacijoje ir ieško būdų jas suvaldyti."),
      p("Laboratorijos vedėjas", "1600-3200€", "Vadovauja moksliniams tyrimams ir užtikrina tyrimų tikslumą."),
      p("Teismo medicinos ekspertas", "1600-3000€", "Tiria įkalčius mokslo metodais tiesai nustatyti."),
      p("Astrofizikas", "1800-4000€", "Tiria žvaigždes, galaktikas ir visatos sandarą."),
      p("Medžiagų mokslininkas", "1800-4000€", "Kuria ir tiria naujas medžiagas – nuo baterijų iki lengvų lydinių."),
    ],
  },
  G: {
    title: "Gamtos Tyrinėtojas & Saugotojas (Gamtos-Aplinkos)",
    summary:
      "Tau geriausia ten, kur gyva gamta – prie jūros, miške ar lauke. Tave domina gyvi organizmai, ekosistemos ir planetos ateitis, o darbas turi jungti mokslą su gamta.",
    positives: ["Stebėjimo gebėjimas", "Ištvermė", "Atsakomybė gamtai", "Praktiškumas"],
    negatives: ["Nepatogumas biuro rutinoje", "Idealizmas", "Nuovargis dėl lėtų pokyčių"],
    communication:
      "Esi nuoširdus ir tiesus, labiau vertini darbus nei žodžius. Mėgsti dalytis stebėjimais ir istorijomis iš gamtos.",
    exams: "Matematika (VBE - Privalomas), Biologija arba Geografija (VBE), Chemija (kai kuriose programose), Lietuvių k. (VBE).",
    uniLt: [
      { name: "Klaipėdos universitetas (jūrų ir gamtos mokslai)", score: "KB: >6.0" },
      { name: "VU Gyvybės mokslų centras", score: "KB: >8.5" },
      { name: "VU Chemijos ir geomokslų fak. (geologija)", score: "KB: >6.5" },
      { name: "VDU Žemės ūkio akademija", score: "KB: >5.5" },
    ],
    uniEu: [
      { name: "Wageningeno universitetas (Olandija)", program: "BSc Biology, International Land and Water Management (anglų k.)" },
      { name: "Aberdeeno universitetas (JK)", program: "BSc Marine Biology, Zoology, Ecology (anglų k.)" },
      { name: "Sauthamptono universitetas (JK)", program: "BSc Marine Biology, Oceanography (anglų k.)" },
    ],
    famousPeople: [
      { name: "Jane Goodall", role: "Primatologė" },
      { name: "David Attenborough", role: "Gamtininkas, dokumentikos kūrėjas" },
      { name: "Sylvia Earle", role: "Okeanografė ir jūrų biologė" },
    ],
    professions: [
      p("Jūrų biologas", "1300-2800€", "Tiria jūros organizmus ir ekosistemas, dirba laboratorijoje, laive ir lauke."),
      p("Ekologas", "1300-2800€", "Tiria, kaip organizmai sąveikauja su aplinka, ir siūlo, kaip ją saugoti."),
      p("Miškininkas", "1300-2500€", "Prižiūri miškus, planuoja jų priežiūrą ir naudojimą tvariai."),
      p("Agronomas", "1300-3000€", "Konsultuoja dėl augalų auginimo, dirvožemio ir derliaus."),
      p("Geologas", "1500-3500€", "Tiria Žemės sandarą, uolienas ir naudingąsias iškasenas."),
      p("Klimato mokslininkas", "1800-3800€", "Tiria klimato kaitą ir modeliuoja jos pasekmes."),
      p("Gamtosaugos specialistas", "1200-2500€", "Saugo nykstančias rūšis ir saugomas teritorijas."),
      p("Okeanografas", "1600-3500€", "Tiria vandenynų srovės, temperatūrą ir cheminę sudėtį."),
      p("Aplinkos inžinierius", "1600-3500€", "Kuria taršos mažinimo ir atliekų tvarkymo sprendimus."),
      p("Saugomų teritorijų specialistas (rangeris)", "1100-2000€", "Prižiūri nacionalinius parkus ir reservatus, dirba su lankytojais ir gamta."),
    ],
  },
  H: {
    title: "Teisingumo Gynėjas & Diplomatas (Teisinis-Viešasis)",
    summary:
      "Tu jautriai reaguoji į teisingumą ir mėgsti argumentuoti. Gebi matyti abi ginčo puses, analizuoti sudėtingus tekstus ir ginti poziciją faktais bei logika.",
    positives: ["Argumentavimas", "Teisingumo jausmas", "Analitinis skaitymas", "Ramumas ginče"],
    negatives: ["Polinkis ginčytis", "Perdėtas formalumas", "Sunkumas pripažinti klaidas"],
    communication:
      "Kalbi struktūruotai ir įtikinamai. Mėgsti diskusijas ir debatus, o draugai tave kviečia kaip „teisėją“ ginčuose.",
    exams: "Lietuvių k. (VBE), Matematika (VBE - Privalomas), Istorija arba Anglų k. (VBE).",
    uniLt: [
      { name: "VU Teisės fak.", score: "KB: >8.0" },
      { name: "MRU Teisės mokykla", score: "KB: >8.0" },
      { name: "VU Tarptautinių santykių ir politikos mokslų inst.", score: "KB: >8.5" },
      { name: "VDU Teisės fak.", score: "KB: >7.5" },
    ],
    uniEu: [
      { name: "Mastrichto universitetas (Olandija)", program: "LLB European Law School (anglų k.)" },
      { name: "Tilburgo universitetas (Olandija)", program: "Global Law (anglų k.)" },
      { name: "Leideno universitetas (Olandija)", program: "BA International Studies, BSc Political Science (anglų k.)" },
    ],
    famousPeople: [
      { name: "Ruth Bader Ginsburg", role: "JAV Aukščiausiojo Teismo teisėja" },
      { name: "Nelson Mandela", role: "Teisininkas ir Pietų Afrikos prezidentas" },
      { name: "Michelle Obama", role: "Advokatė, rašytoja" },
    ],
    professions: [
      p("Advokatas", "2000-6000€", "Gina klientų interesus teisme ir konsultuoja teisės klausimais."),
      p("Prokuroras", "2500-5000€", "Vadovauja ikiteisminiam tyrimui ir palaiko valstybinį kaltinimą teisme."),
      p("Teisėjas", "3500-6500€", "Nagrinėja bylas ir priima nešališkus sprendimus."),
      p("Notaras", "3000-7000€", "Tvirtina sandorius ir dokumentus, užtikrindamas jų teisėtumą."),
      p("Teisės patarėjas", "2000-5000€", "Teikia teisines konsultacijas įmonėms, rengia sutartis ir dokumentus."),
      p("Diplomatas", "2000-4500€", "Atstovauja valstybei užsienyje ir veda derybas."),
      p("Politikos analitikas", "1600-3500€", "Analizuoja politinius procesus ir rengia rekomendacijas sprendimų priėmėjams."),
      p("Viešojo administravimo specialistas", "1400-2800€", "Dirba valstybės ar savivaldybės institucijose, įgyvendina viešąją politiką."),
      p("Kriminalistas / pareigūnas", "1500-2800€", "Tiria nusikaltimus ir užtikrina viešąją tvarką."),
      p("Žmogaus teisių specialistas", "1400-3000€", "Dirba nevyriausybinėse ar tarptautinėse organizacijose, ginančiose žmogaus teises."),
    ],
  },
  I: {
    title: "Pasakotojas & Komunikatorius (Komunikacinis-Medijų)",
    summary:
      "Tavo galia – žodis. Gebi aiškiai paaiškinti, įtikinti ir papasakoti istoriją taip, kad ją norėtųsi išgirsti. Tave traukia kalbos, žiniasklaida ir žmonių įtaka.",
    positives: ["Iškalba", "Rašymo gebėjimas", "Socialumas", "Greitas prisitaikymas"],
    negatives: ["Paviršutiniškumas", "Polinkis kalbėti, o ne klausytis", "Nuovargis dėl nuolatinio viešumo"],
    communication:
      "Esi socialus ir lengvai užmezgi pokalbį. Moki papasakoti istoriją, todėl tave mielai klausosi.",
    exams: "Lietuvių k. (VBE), Anglų k. (VBE), Matematika (VBE - Privalomas), Istorija (kai kuriose programose).",
    uniLt: [
      { name: "VU Komunikacijos fak.", score: "KB: >6.0" },
      { name: "KTU Socialinių, humanitarinių mokslų ir menų fak.", score: "KB: >5" },
      { name: "MRU Komunikacijos ir vadybos programos", score: "KB: >5.0" },
      { name: "VDU Humanitarinių mokslų fak.", score: "KB: >5.5" },
    ],
    uniEu: [
      { name: "Amsterdamo universitetas (Olandija)", program: "BA Communication Science (anglų k.)" },
      { name: "Twente universitetas (Olandija)", program: "BSc Communication Science (anglų k.)" },
      { name: "Erasmus universitetas, Roterdamas (Olandija)", program: "BA Media & Communication (anglų k.)" },
    ],
    famousPeople: [
      { name: "Christiane Amanpour", role: "Tarptautinė žurnalistė" },
      { name: "Ernest Hemingway", role: "Rašytojas ir žurnalistas" },
      { name: "Trevor Noah", role: "Komikas, TV laidų vedėjas" },
    ],
    professions: [
      p("Žurnalistas", "1200-3000€", "Renka informaciją, tikrina faktus ir rašo ar pasakoja naujienas."),
      p("Komunikacijos / PR specialistas", "1400-3500€", "Formuoja organizacijos ar asmens įvaizdį viešojoje erdvėje, bendrauja su žiniasklaida."),
      p("Rinkodaros vadovas", "2000-5000€", "Kuria prekės ženklo strategiją ir reklamines kampanijas."),
      p("Copywriter (tekstų kūrėjas)", "1300-2800€", "Rašo įtraukiančius tekstus reklamoms, svetainėms ir straipsniams."),
      p("Vertėjas", "1200-3500€", "Verčia tekstus ir kalbą iš vienos kalbos į kitą išlaikydamas prasmę."),
      p("Turinio kūrėjas", "1000-5000€+", "Kuria tekstinį, vaizdinį ar video turinį socialiniams tinklams ir prekių ženklams."),
      p("Redaktorius", "1300-2800€", "Tikrina, taiso ir tobulina tekstus prieš juos paskelbiant."),
      p("Socialinių tinklų vadybininkas", "1200-2800€", "Valdo organizacijos paskyras ir kuria turinį auditorijai."),
      p("Renginių organizatorius", "1200-3000€", "Planuoja ir koordinuoja šventes, konferencijas ar festivalius."),
      p("Radijo / podcast vedėjas", "1200-3500€", "Veda laidas, kalbina svečius ir kuria garso turinį."),
    ],
  },
  J: {
    title: "Vaizdo & Meno Kūrėjas (Meninis-Vizualinis)",
    summary:
      "Tu mąstai vaizdais, garsais ir emocijomis. Tave traukia fotografija, kinas, vaizdo kūryba, tapyba ir scena – bet kas, kuo gali išreikšti save ir sukelti jausmus.",
    positives: ["Vizualinis mąstymas", "Originalumas", "Emocinis jautrumas", "Intuicija"],
    negatives: ["Chaotiškumas", "Rutinos netoleravimas", "Jautrumas kritikai"],
    communication:
      "Esi charizmatiškas ir ekspresyvus. Draugai vertina tavo kitokį požiūrį į gyvenimą, estetiką ir gebėjimą nustebinti.",
    exams: "Lietuvių k. (VBE), Anglų k. (VBE), Dailės / kūrybinis stojamasis egzaminas ar portfelis. (Matematikos VBE privalomas stojant į valstybės finansuojamas vietas, išskyrus grynųjų menų studijas.)",
    uniLt: [
      { name: "Vilniaus Dailės Akademija (VDA)", score: "Portfelis + egz." },
      { name: "LMTA (muzika, teatras, kinas)", score: "Stojamasis" },
      { name: "VU Komunikacijos fak. (medijų kryptys)", score: "KB: >7.0" },
    ],
    uniEu: [
      { name: "UAL Londonas (JK)", program: "BA Photography, Film & TV, Animation, Fine Art (anglų k.)" },
      { name: "Karališkoji meno akademija KABK, Haga (Olandija)", program: "BA Photography, Fine Arts, Graphic Design (anglų k.)" },
      { name: "Gerrit Rietveld Academie (Olandija)", program: "Bakalauro programa (dėstoma anglų k.)" },
    ],
    famousPeople: [
      { name: "Steven Spielberg", role: "Kino režisierius" },
      { name: "Annie Leibovitz", role: "Fotografė" },
      { name: "Frida Kahlo", role: "Dailininkė" },
    ],
    professions: [
      p("Fotografas", "1000-3000€", "Fotografuoja renginius, žmones, produktus ar meninius projektus."),
      p("Videografas", "1400-3500€", "Filmuoja ir prodiusuoja vaizdo turinį asmeniniams ar verslo projektams."),
      p("Vaizdo montuotojas", "1400-3200€", "Montuoja filmuotą medžiagą filmams, reklamoms ar YouTube kanalams."),
      p("Režisierius", "1500-4500€", "Vadovauja filmo ar spektaklio kūrimui ir atsako už kūrybinę viziją."),
      p("Animatorius", "1500-3500€", "Kuria judančius vaizdus filmams, žaidimams ar reklamoms."),
      p("Iliustratorius", "1200-3000€", "Kuria vizualinius piešinius ir meną knygoms, žurnalams ar skaitmeninei žiniasklaidai."),
      p("Dailininkas", "1000-3000€", "Kuria tapybos, skulptūros ar kitus meno kūrinius parodoms ir užsakymams."),
      p("Operatorius", "1500-3500€", "Atsako už kadrų kompoziciją, šviesą ir kameros judesį filme."),
      p("Scenografas", "1300-3000€", "Kuria vizualią aplinką ir dekoracijas teatrui, televizijai ar kinui."),
      p("Garso režisierius / kompozitorius", "1000-3500€", "Kuria muziką ir garso takelį filmams, žaidimams ar laidoms."),
    ],
  },
};

// Shown when the numerical-aptitude result is low. Programme lists change (several colleges were merged in 2024),
// so the report tells students to re-check on AIKOS / LAMA BPO. A: B: C: D: E: were verified earlier; F-J are broader
// and should be re-verified before launch.
const ALT_PATHS: Record<TypeKey, { colleges: AltItem[]; vocationalSchools: AltItem[] }> = {
  A: {
    colleges: [
      { name: "Lietuvos inžinerijos kolegija (anksčiau Kauno technikos kolegija)", programs: "Inžinerijos, elektronikos ir IT studijų programos" },
      { name: "Vilniaus kolegija", programs: "Elektronikos, informatikos ir technologijų programos (2024 m. perėmė Vilniaus technologijų ir dizaino kolegiją)" },
      { name: "Klaipėdos valstybinė kolegija", programs: "Technologijų ir informacinių technologijų programos" },
    ],
    vocationalSchools: [
      { name: "Kauno informacinių technologijų mokykla (KITM)", programs: "Žiniatinklio programuotojas, kompiuterių tinklų derintojas, multimedijos paslaugų teikėjas, mobiliosios elektronikos taisytojas" },
      { name: "Klaipėdos technologijų mokymo centras", programs: "Jaunesnysis programuotojas (Java, JavaScript, C#, Python), jaunesnysis testuotojas" },
      { name: "Panevėžio mokymo centras", programs: "Multimedijos technikas, .NET programuotojas, IT aptarnavimo technikas" },
    ],
  },
  B: {
    colleges: [
      { name: "Kauno kolegija", programs: "Sveikatos, socialinio darbo ir pedagogikos programos" },
      { name: "Vilniaus kolegija", programs: "Sveikatos priežiūros, socialinio darbo ir pedagogikos programos" },
      { name: "Panevėžio kolegija", programs: "Slaugos, socialinio darbo ir ugdymo programos" },
    ],
    vocationalSchools: [
      { name: "Karaliaus Mindaugo profesinio mokymo centras (Kaunas)", programs: "Slaugytojo padėjėjas, socialinio darbuotojo padėjėjas, masažuotojas, paramedikas" },
      { name: "Klaipėdos Ernesto Galvanausko profesinio mokymo centras", programs: "Slaugytojo padėjėjas, masažuotojas, paramedikas" },
    ],
  },
  C: {
    colleges: [
      { name: "Vilniaus kolegija", programs: "Dizaino ir technologijų programos (perėmė Vilniaus technologijų ir dizaino kolegiją)" },
      { name: "Kauno kolegija", programs: "Dizaino, menų ir ugdymo programos (patikrinkite aktualią pasiūlą AIKOS)" },
    ],
    vocationalSchools: [
      { name: "Kauno taikomosios dailės mokykla", programs: "Interjero apipavidalintojas, floristinis dekoravimas, elektroninės leidybos maketuotojas, meninių amatų specialybės" },
    ],
  },
  D: {
    colleges: [
      { name: "Vilniaus kolegija", programs: "Verslo vadyba, rinkodara, logistika" },
      { name: "Kauno kolegija", programs: "Verslo vadyba, turizmas, logistika" },
      { name: "Klaipėdos valstybinė kolegija", programs: "Verslo, logistikos ir rinkodaros programos" },
      { name: "Panevėžio kolegija", programs: "Verslo ir vadybos programos" },
    ],
    vocationalSchools: [
      { name: "Profesinio mokymo centras „Žirmūnai“ (Vilnius)", programs: "Turizmo, apgyvendinimo ir maitinimo paslaugų programos; logistas" },
      { name: "Panevėžio mokymo centras", programs: "Pardavėjas konsultantas, e. pardavėjas-konsultantas, apskaitininkas" },
      { name: "Kauno informacinių technologijų mokykla (KITM)", programs: "Apskaitininkas ir kasininkas, bankinių operacijų tvarkytojas" },
    ],
  },
  E: {
    colleges: [
      { name: "Kauno kolegija", programs: "Sveikatos ir biomedicinos srities programos (slauga, kineziterapija ir kt.)" },
      { name: "Vilniaus kolegija", programs: "Sveikatos priežiūros programos" },
      { name: "Panevėžio kolegija", programs: "Slaugos programos" },
    ],
    vocationalSchools: [
      { name: "Karaliaus Mindaugo profesinio mokymo centras (Kaunas)", programs: "Slaugytojo padėjėjas, paramedikas, gyvūnų prižiūrėtojas" },
      { name: "Klaipėdos Ernesto Galvanausko profesinio mokymo centras", programs: "Paramedikas, slaugytojo padėjėjas, masažuotojas" },
    ],
  },
  F: {
    colleges: [
      { name: "Kauno kolegija", programs: "Biomedicinos ir laboratorinių tyrimų programos" },
      { name: "Vilniaus kolegija", programs: "Technologijų, chemijos ir maisto technologijų krypčių programos" },
      { name: "Klaipėdos valstybinė kolegija", programs: "Technologijų srities programos" },
    ],
    vocationalSchools: [],
  },
  G: {
    colleges: [
      { name: "Kauno miškų ir aplinkos inžinerijos kolegija", programs: "Miškininkystės, aplinkos inžinerijos ir kraštovaizdžio programos" },
      { name: "Marijampolės kolegija", programs: "Agrarinių mokslų ir verslo programos" },
    ],
    vocationalSchools: [
      { name: "Klaipėdos jūrininkystės mokykla", programs: "Jūrų ir laivybos srities specialybės" },
      { name: "Joniškio žemės ūkio mokykla", programs: "Žemės ūkio ir agrarinės specialybės" },
    ],
  },
  H: {
    colleges: [
      { name: "Kauno kolegija", programs: "Teisės, viešojo administravimo ir verslo teisės programos" },
      { name: "Vilniaus kolegija", programs: "Verslo, teisės ir administravimo programos" },
    ],
    vocationalSchools: [],
  },
  I: {
    colleges: [
      { name: "Vilniaus kolegija", programs: "Komunikacijos, rinkodaros ir leidybos programos" },
      { name: "Kauno kolegija", programs: "Verslo komunikacijos, vertimo ir rinkodaros programos" },
    ],
    vocationalSchools: [],
  },
  J: {
    colleges: [
      { name: "Vilniaus kolegija", programs: "Dizaino, fotografijos ir vizualinių komunikacijų programos (perėmė Vilniaus technologijų ir dizaino kolegiją)" },
      { name: "Kauno kolegija", programs: "Dizaino ir menų programos (patikrinkite aktualią pasiūlą AIKOS)" },
    ],
    vocationalSchools: [
      { name: "Kauno taikomosios dailės mokykla", programs: "Meninių amatų, dekoravimo ir maketavimo specialybės" },
      { name: "Kauno informacinių technologijų mokykla (KITM)", programs: "Multimedijos paslaugų teikėjas" },
    ],
  },
};

// ---------------- BASE QUESTIONS ----------------
// Choice / multiselect questions are written as one option per dimension, so no dimension is favoured.
const mkOptions = (o: Record<TypeKey, string>) => TYPES.map((t) => ({ text: o[t], t }));

const BASE_CHOICE = {
  project: mkOptions({
    A: "Struktūruoti užduotis, planuoti logiką ar programuoti",
    B: "Padėti komandos nariams susikalbėti ir spręsti konfliktus",
    C: "Kurti dizainą, maketą ar erdvės sprendimą",
    D: "Dalinti užduotis, sekti biudžetą ir prisiimti atsakomybę",
    E: "Pasirūpinti, kad komanda nepervargtų, ir suteikti pirmąją pagalbą, jei prireiktų",
    F: "Kelti hipotezes, atlikti bandymus ir tikrinti, ar jos pasitvirtina",
    G: "Tyrinėti gamtą ar aplinką – rinkti mėginius, stebėti, fiksuoti",
    H: "Sudaryti taisykles, ginti komandos poziciją ir argumentuoti",
    I: "Rašyti tekstus, kalbėti prieš auditoriją ir pristatyti projektą",
    J: "Filmuoti, fotografuoti ar sukurti vaizdo / meninį turinį",
  }),
  value: mkOptions({
    A: "Inovacijos, technologiniai iššūkiai ir nuolatinis tobulėjimas",
    B: "Prasmė, pagalba kitiems ir emocinė parama",
    C: "Galimybė kurti funkcionalius ir gražius dalykus, dizainą",
    D: "Aukštas atlyginimas, finansinis nepriklausomumas ir lyderystė",
    E: "Žmonių sveikata ir gyvybė, atsakinga ir gerbiama profesija",
    F: "Naujų žinių atradimas ir galimybė suprasti, kaip veikia pasaulis",
    G: "Gamtos išsaugojimas ir darbas gryname ore, ne tik kabinete",
    H: "Teisingumas, tiesos paieška ir visuomenės taisyklių gynimas",
    I: "Galimybė savo žodžiu daryti poveikį žmonių nuomonei",
    J: "Saviraiška, kūrybinė laisvė ir galimybė kurti meną",
  }),
  environment: mkOptions({
    A: "Atviros erdvės su moderniomis technologijomis ir ekranais",
    B: "Jauki aplinka, kurioje galima bendrauti ir tiesiogiai padėti kitiems",
    C: "Dizaino studija ar architektūros biuras su maketais ir eskizais",
    D: "Dinamiškas biuras, kuriame nuolat sprendžiami verslo reikalai",
    E: "Ligoninė, klinika ar vaistinė",
    F: "Tyli laboratorija ar universiteto tyrimų centras",
    G: "Lauke: miškas, jūra, upė ar tyrimų ekspedicija",
    H: "Teismo salė, advokatų kontora ar valstybės institucija",
    I: "Redakcija ar komunikacijos agentūra, kur nuolat gimsta naujienos",
    J: "Foto ar video studija, filmavimo aikštelė, dirbtuvės",
  }),
  motivation: mkOptions({
    A: "Galimybė spręsti sudėtingiausias technines problemas",
    B: "Jausmas, kad mano darbas keičia kitų žmonių gyvenimus",
    C: "Matyti, kaip mano sukurtas dizainas ar projektas naudojamas kasdien",
    D: "Finansinis atlygis ir karjeros galimybės",
    E: "Galimybė išgelbėti ar pagerinti žmogaus sveikatą",
    F: "Atradimas, kurio dar niekas nežinojo",
    G: "Žinojimas, kad padedu apsaugoti gamtą ir gyvūnus",
    H: "Laimėta byla ar teisingai išspręstas ginčas",
    I: "Kai mano žodžiai ar istorija pasiekia daug žmonių",
    J: "Galimybė realizuoti savo kūrybines vizijas be apribojimų",
  }),
  decision: mkOptions({
    A: "Pasikliaudamas logika, efektyvumu ir sisteminiu požiūriu",
    B: "Svarstydamas, kaip mano sprendimas paveiks kitų žmonių jausmus",
    C: "Ieškodamas sprendimo, kuris būtų ir naudingas, ir gražus",
    D: "Vertindamas potencialią naudą, riziką ir konkurenciją",
    E: "Laikydamasis įrodymais pagrįstų taisyklių, saugodamas žmonių sveikatą",
    F: "Keldamas hipotezes ir tikrindamas jas duomenimis",
    G: "Galvodamas apie ilgalaikį poveikį gamtai",
    H: "Remdamasis teisingumo principais ir svarstydamas argumentus už ir prieš",
    I: "Aptardamas su kitais ir pasirinkdamas tai, ką galiu įtikinamai paaiškinti",
    J: "Pasikliaudamas intuicija ir ieškodamas originalaus, emocijas keliančio kampo",
  }),
};

const BASE_MULTI = {
  activities: mkOptions({
    A: "Duomenų bazių, sistemų ar robotų programavimas",
    B: "Pagalba sunkumus išgyvenantiems žmonėms",
    C: "Grafinis, produktų ar interjero dizainas",
    D: "Derybos, pardavimai ir verslo strategijos",
    E: "Žmogaus kūnas, ligos ir gydymas",
    F: "Fizikos, chemijos ar matematikos uždaviniai",
    G: "Gyvūnų, augalų ir jūros gyvūnų stebėjimas",
    H: "Teisinių bylų ir teismų procesų nagrinėjimas",
    I: "Straipsnių, scenarijų ar tinklaraščių rašymas",
    J: "Fotografavimas, filmavimas ir vaizdo montavimas",
  }),
  topics: mkOptions({
    A: "Dirbtinis intelektas ir kosmoso technologijos",
    B: "Žmogaus psichologija ir santykiai",
    C: "Architektūra, produktų dizainas ir mada",
    D: "Investavimas, ekonomika ir lyderystė",
    E: "Medicina ir žmogaus organizmas",
    F: "Fizika, kosmologija ir matematikos paslaptys",
    G: "Vandenynai, miškai ir klimato kaita",
    H: "Žmogaus teisės, teismų procesai ir politika",
    I: "Žiniasklaida, kalba ir viešoji nuomonė",
    J: "Kinas, fotografija ir šiuolaikinis menas",
  }),
};

// 3 "base" likert statements per dimension (30 total)
const LIKERT_BASE: Record<TypeKey, string[]> = {
  A: [
    "Man patinka ardyti prietaisus, suprasti, kaip viskas veikia, arba spręsti loginius galvosūkius.",
    "Galiu ilgai koncentruotis į vieną techninę ar matematinę problemą, kol randu išeitį.",
    "Mėgstu automatizuoti pasikartojančius darbus ir ieškoti efektyviausio sprendimo būdo.",
  ],
  B: [
    "Draugai dažnai kreipiasi į mane patarimo, nes moku nuoširdžiai išklausyti.",
    "Man svarbu, kad mano darbas teiktų tiesioginę pagalbą ar naudą žmonėms.",
    "Galiu lengvai suprasti, kaip jaučiasi kitas žmogus, net jei jis to nesako žodžiais.",
  ],
  C: [
    "Man patinka planuoti, kaip turėtų atrodyti ir veikti pastatas, daiktas ar erdvė.",
    "Kai matau patogų daiktą ar gražų pastatą, noriu suprasti, kaip jis suprojektuotas.",
    "Man be galo svarbu, kad tai, ką sukuriu, atrodytų estetiškai ir turėtų vizualinę vertę.",
  ],
  D: [
    "Mėgstu imtis lyderio vaidmens ir nebijau priimti sprendimų už visą grupę.",
    "Konkurencija mane motyvuoja pasiekti dar geresnių rezultatų.",
    "Nebijau rizikuoti ir išeiti iš komforto zonos, jei matau galimybę pasiekti sėkmę.",
  ],
  E: [
    "Esu atidus (-i) detalėms ir suprantu, kad klaida gali kainuoti žmogaus sveikatą.",
    "Nebijau kraujo, žaizdų ar ligoninės aplinkos.",
    "Domiuosi, kaip veikia žmogaus organizmas ir kaip jį gydyti.",
  ],
  F: [
    "Man patinka kelti klausimą „kodėl?“ ir ieškoti jo atsakymo, net kai tai užtrunka.",
    "Moksliniai metodai ir tikslūs eksperimentai man atrodo patikimiausias būdas rasti tiesą.",
    "Man patinka mokytis sudėtingų teorijų, net kai nematau tiesioginės naudos.",
  ],
  G: [
    "Geriausiai jaučiuosi gamtoje – miške, prie jūros ar ežero.",
    "Man rūpi gamtos apsauga ir gyvūnų gerovė.",
    "Neprieštaraučiau dirbti lauke bet kokiu oru, jei darbas susijęs su gamta.",
  ],
  H: [
    "Mėgstu ginčytis argumentais ir ieškoti, kas teisinga, o kas ne.",
    "Mane piktina neteisybė ir noriu, kad taisyklės galiotų visiems vienodai.",
    "Mėgstu skaityti sudėtingus tekstus ir ieškoti jų prieštaravimų.",
  ],
  I: [
    "Man lengva aiškiai išsakyti mintis žodžiu ir raštu.",
    "Mėgstu rašyti tekstus, pasakojimus ar straipsnius.",
    "Domiuosi kalbomis ir mėgstu rasti tikslų žodį.",
  ],
  J: [
    "Mane labai vargina griežtos taisyklės ir rutina – man reikia erdvės improvizacijai.",
    "Dažnai svajoju ir galvoju apie originalias, netradicines idėjas.",
    "Man patinka fotografuoti ar filmuoti ir ieškoti išraiškingo kadro.",
  ],
};

// ---- 100 industry-specific "day in the life" questions (10 per type) ----
interface LikertQuestion {
  type: "likert";
  q: string;
  t: TypeKey;
}

const RAW: Record<TypeKey, string[]> = {
  A: [
    "Man patiktų kelias valandas ieškoti klaidos kode, kol ji pagaliau randama.",
    "Atrodo įdomu projektuoti serverių sistemą, kuri turi atlaikyti milijoną vartotojų vienu metu.",
    "Galėčiau visą dieną dirbti prie ekrano, beveik be pokalbių.",
    "Pamatęs neefektyvų procesą, iškart noriu parašyti skriptą, kuris jį automatizuotų.",
    "Patiktų jungti grandines ir bandyti prototipą, kol jis pradės veikti.",
    "Man malonu mokytis naujos technologijos kas kelis mėnesius, nes ši sritis nuolat keičiasi.",
    "Patiktų įsilaužti į įvairias informacines sistemas.",
    "Įdomu, kaip veikia dirbtinis intelektas, ir norėčiau išmokyti modelį atpažinti paveikslėlius.",
    "Patiktų projektuoti roboto ranką, kuri tiksliai paima trapų daiktą.",
    "Mielai dalyvaučiau hakatone ir per parą sukurčiau veikiantį prototipą.",
  ],
  B: [
    "Jei kolegė verktų dėl asmeninių problemų, iškart norėčiau nutraukti savo darbą ir ją išklausyti.",
    "Patiktų visą dieną kalbėtis su skirtingais žmonėmis apie jų rūpesčius.",
    "Galėčiau ramiai padėti žmogui, kuris yra išsigandęs ir nenori bendradarbiauti.",
    "Jei du žmonės pyktųsi, mielai tapčiau tarpininku ir padėčiau jiems susitaikyti.",
    "Patiktų lydėti žmogų per sunkų gyvenimo etapą (liga, skyrybos, netektis), nors tai emociškai alina.",
    "Po darbo dienos man svarbu žinoti, kad kam nors tikrai padėjau, net jei atlyginimas nedidelis.",
    "Patiktų dirbti su vaikais, turinčiais mokymosi sunkumų, ir džiaugtis net mažu jų progresu.",
    "Galėčiau valandą klausyti besiskundžiančio žmogaus ir nepalūžti kantrybės.",
    "Patiktų rašyti ataskaitas apie šeimų situaciją ir siūlyti, kokios pagalbos joms reikia.",
    "Net kai darbas emociškai sunkus, man svarbiau jausti prasmę nei turėti ramią dieną.",
  ],
  C: [
    "Galėčiau valandų valandas derinti šriftus, spalvas ir tarpus, kol kompozicija atrodys „teisingai“.",
    "Patiktų projektuoti kavinės interjerą ir parinkti kiekvieną detalę.",
    "Įdomu, kodėl vienos programėlės patogios, o kitos erzina, ir norėčiau tai pagerinti.",
    "Patiktų kurti vaizdo žaidimo personažą, jo pasaulį ir lygius.",
    "Mėgčiau kurti mados kolekciją, rinktis audinius ir stebėti, kaip piešinys virsta drabužiu.",
    "Patiktų sukurti įmonės prekės ženklo vizualinį stilių nuo logotipo iki svetainės.",
    "Mane domintų architektūros maketai ir trimačiai modeliai.",
    "Jei klientas paprašytų pakeisti mano dizainą, stengčiausi suprasti jo poreikį, o ne įsižeisčiau.",
    "Patiktų projektuoti daiktą (kėdę, telefoną ar įrankį), kad jis būtų patogus ir gražus.",
    "Galėčiau pristatyti savo dizaino idėją komandai ir paaiškinti sprendimus.",
  ],
  D: [
    "Patiktų derėtis su tiekėju ir iškovoti geresnes sutarties sąlygas.",
    "Galėčiau vesti susitikimą su dešimčia žmonių ir priimti galutinį sprendimą, kai nuomonės išsiskiria.",
    "Mielai pristatyčiau startuolio idėją investuotojams ir atsakinėčiau į aštrius klausimus.",
    "Patiktų planuoti projekto biudžetą ir stebėti, ar neviršijama sąmata.",
    "Jei komandoje vėluotų terminai, iškart perskirstyčiau užduotis ir atsakomybes.",
    "Įdomu, kaip padidinti įmonės pardavimus 20 % per metus.",
    "Patiktų analizuoti konkurentus ir ieškoti rinkos nišos.",
    "Galėčiau priimti sprendimą, kai informacijos nepakanka, ir prisiimti už jį atsakomybę.",
    "Galėčiau rizikuoti savo pinigais pradėdamas verslą, jei matyčiau gerą galimybę.",
    "Man patinka stebėti verslo rodiklius (pajamas, maržą, augimą) ir iš jų spręsti, ką daryti toliau.",
  ],
  E: [
    "Patiktų dirbti ligoninėje ir greitai, bet kruopščiai nustatinėti diagnozes pagal simptomus.",
    "Galėčiau ramiai dirbti, kai žmogaus sveikata priklauso nuo mano sprendimo.",
    "Patiktų paaiškinti pacientui vaisto vartojimo taisykles ir sąveiką su kitais vaistais.",
    "Mielai dirbčiau pagal griežtus medicininius protokolus, nes jie užtikrina saugumą.",
    "Patiktų gydyti gyvūnus ir aiškintis, kas jiems negerai, nors jie negali papasakoti.",
    "Nebijau ilgai mokytis (6 metus ar daugiau), kad tapčiau gydytoju ar odontologu.",
    "Galėčiau budėti naktį, jei reikėtų padėti sergančiam žmogui.",
    "Patiktų padėti žmogui po traumos vėl išmokti vaikščioti ar rašyti.",
    "Jei ligoninėje pacientui reikėtų specialaus maitinimo, pasirūpinčiau, kad jis gautų būtent tai, kas jam tinka.",
    "Man įdomu, kaip vaistai veikia organizmą ir kodėl žmonės suserga.",
  ],
  F: [
    "Galėčiau kelis kartus kartoti tą patį laboratorinį tyrimą, kad būčiau tikras dėl rezultato.",
    "Mielai dirbčiau su mikroskopu ar DNR sekoskaita ir dokumentuočiau kiekvieną žingsnį.",
    "Man įdomu spręsti teorinius uždavinius, kurie neturi greito praktinio pritaikymo.",
    "Patiktų tirti, kaip plinta liga ar vyksta cheminė reakcija, ir analizuoti duomenis ieškant priežasčių.",
    "Galėčiau savaitę planuoti vieną eksperimentą ir, jei rezultatas netikėtas, jį išanalizuoti.",
    "Patiktų skaityti mokslinius straipsnius apie naujus atradimus.",
    "Domina fizika: nuo žvaigždžių iki elementariųjų dalelių.",
    "Mėgčiau dirbti universitete: tyrinėti ir pristatyti rezultatus konferencijose.",
    "Patiktų kurti matematinius modelius, aprašančius pasaulio reiškinius.",
    "Neprieštarauju daug metų mokytis (magistras, doktorantūra), kad galėčiau tyrinėti.",
  ],
  G: [
    "Patiktų plaukti tyrimų laivu ir stebėti jūros gyvūnus.",
    "Galėčiau savaitę gyventi ekspedicijoje be patogumų, jei tyrinėčiau gamtą.",
    "Patiktų skaičiuoti paukščius ar rinkti vandens mėginius upėje, kad suprasčiau ekosistemą.",
    "Mane domintų nardyti, jūros dugno ekosistemos ir koralų rifai.",
    "Patiktų dirbti miškininku ir rūpintis miško sveikata.",
    "Mielai kovočiau už nykstančių rūšių apsaugą ir dalyvaučiau gamtosaugos projektuose.",
    "Patiktų tirti dirvožemį, augalus ar klimatą ir siūlyti, kaip auginti derlių tvariai.",
    "Galėčiau dirbti lauke lietuje ar šaltyje, jei darbas susijęs su gamta.",
    "Domina geologija: uolienos, vulkanai, fosilijos.",
    "Man įdomu, kaip klimato kaita keičia gyvūnų gyvenimą.",
  ],
  H: [
    "Patiktų skaityti sutartis ir įstatymus ir ieškoti punktų, galinčių sukelti riziką.",
    "Galėčiau ginti kitą žmogų ginče, remdamasis faktais ir argumentais.",
    "Patiktų ruošti dokumentus teismui ir tikrinti kiekvieną faktą.",
    "Domina, kaip veikia valstybė: Seimas, teismai ir tarptautinės organizacijos.",
    "Patiktų vesti derybas tarp valstybių ar organizacijų kaip diplomatas.",
    "Mielai dalyvaučiau debatuose ir ginčyčiausi dėl visuomenei svarbių temų.",
    "Galėčiau ištirti nusikaltimo aplinkybes ir sudėlioti faktus į logišką bylą.",
    "Man svarbu, kad žmogus gautų teisingą sprendimą, net kai tai sudėtinga.",
    "Patiktų dirbti prokuroru ar teisėju ir priimti atsakingus sprendimus.",
    "Galėčiau kelias valandas iš eilės skaityti ir analizuoti sudėtingus tekstus.",
  ],
  I: [
    "Patiktų rašyti straipsnį apie aktualią naujieną ir greitai patikrinti faktus.",
    "Mielai imčiau interviu iš žinomo žmogaus ar eksperto.",
    "Patiktų kurti viešųjų ryšių kampaniją organizacijai.",
    "Galėčiau parašyti reklaminį šūkį ir dešimt kartų jį perrašyti, kol skambės puikiai.",
    "Patiktų išversti tekstą iš vienos kalbos į kitą ir išlaikyti jo prasmę.",
    "Mielai vesčiau radijo ar podcast laidą.",
    "Patiktų valdyti organizacijos socialinius tinklus ir kurti jų turinį.",
    "Galėčiau viešai kalbėti prieš didelę auditoriją.",
    "Patiktų redaguoti kitų žmonių tekstus, kad jie būtų aiškūs.",
    "Domina, kaip kalba ir žiniasklaida formuoja žmonių nuomonę.",
  ],
  J: [
    "Patiktų gauti tuščią lapą ir kūrybinį užsakymą be jokių apribojimų.",
    "Patiktų kurti vaizdo klipą: nuo idėjos ir scenarijaus iki montažo.",
    "Patiktų fotografuoti renginius ar produktus ir retušuoti nuotraukas.",
    "Mielai režisuočiau trumpametražį filmą ir vadovaučiau filmavimo komandai.",
    "Mėgčiau animuoti trumpą filmuką, kuriame kiekvienas kadras kruopščiai apgalvotas.",
    "Patiktų kurti muziką ar garso takelį filmui ar žaidimui.",
    "Mielai dirbčiau chaotišku grafiku, jei darbas leistų išreikšti save.",
    "Galėčiau ištisas valandas piešti ar tapyti, kad pagaučiau tinkamą vaibą.",
    "Eiti į muziejus ir galerijas ieškoti idėjų darbui man būtų malonus darbo dienos dalis.",
    "Man svarbu, kad tai, ką sukuriu, sukeltų žmonėms emociją.",
  ],
};

// Interleave A,B,C,... so the quiz doesn't ask many questions of one type in a row.
const interleave = (src: Record<TypeKey, string[]>): LikertQuestion[] => {
  const out: LikertQuestion[] = [];
  const n = Math.max(...TYPES.map((t) => src[t].length));
  for (let i = 0; i < n; i++) {
    TYPES.forEach((t) => {
      if (src[t][i]) out.push({ type: "likert", q: src[t][i], t });
    });
  }
  return out;
};

const likertSet = (idx: number): LikertQuestion[] =>
  TYPES.map((t) => ({ type: "likert" as const, q: LIKERT_BASE[t][idx], t }));

const INDUSTRY_QUESTIONS = interleave(RAW);

const DYNAMIC_QUESTIONS: any[] = [
  { type: "choice", q: "Kokia veikla komandiniame projekte tau atrodytų patraukliausia?", options: BASE_CHOICE.project },
  { type: "choice", q: "Kuri darbo vertybė tau yra pati svarbiausia ieškant svajonių karjeros?", options: BASE_CHOICE.value },
  { type: "choice", q: "Kokia tavo idealios darbo aplinkos vizija?", options: BASE_CHOICE.environment },
  { type: "multiselect", q: "Pažymėk visas veiklas, kurios tau skamba įdomiai (gali rinktis kelias):", options: BASE_MULTI.activities },
  ...likertSet(0),
  { type: "choice", q: "Kas tave labiausiai motyvuoja pasiekti geriausių rezultatų darbe?", options: BASE_CHOICE.motivation },
  { type: "choice", q: "Kaip dažniausiai priimi svarbius sprendimus?", options: BASE_CHOICE.decision },
  { type: "multiselect", q: "Apie kokias temas mieliausiai skaitytum straipsnį ar žiūrėtum dokumentiką? (gali rinktis kelias)", options: BASE_MULTI.topics },
  ...likertSet(1),
  ...likertSet(2),
  ...INDUSTRY_QUESTIONS,
];

// Options are rotated deterministically per question so the same dimension isn't always listed first.
function rotateOptions<T>(arr: T[], qIdx: number): T[] {
  const k = (qIdx * 3) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

const APTITUDE_QUESTIONS = [
  { q: "Kokia sekos tąsa: 2, 5, 8, 11, 14, ...?", options: ["15", "17", "16", "18"], correct: 1, cat: "numerine" },
  { q: "Prekės kaina 80 €, jai taikoma 25% nuolaida. Kokia kaina po nuolaidos?", options: ["65 €", "70 €", "55 €", "60 €"], correct: 3, cat: "numerine" },
  { q: "Klasėje yra 30 mokinių, 60% jų – mergaitės. Kiek klasėje berniukų?", options: ["12", "15", "18", "10"], correct: 0, cat: "numerine" },
  { q: "Kuris skaičius nedera prie kitų: 16, 25, 30, 36?", options: ["16", "36", "30", "25"], correct: 2, cat: "logine" },
  { q: "Visi katinai yra gyvūnai. Kai kurie gyvūnai yra žali. Ką galima teigti apie katinus?", options: ["Visi katinai yra žali", "Joks katinas nėra žalias", "Iš duotų teiginių negalima nustatyti", "Kai kurie katinai yra žali"], correct: 2, cat: "logine" },
  { q: "Kokia raidė seka toliau: A, C, E, G, ...?", options: ["H", "J", "K", "I"], correct: 3, cat: "logine" },
  { q: "Jei šiandien trečiadienis, kokia diena bus po 10 dienų?", options: ["Penktadienis", "Šeštadienis", "Pirmadienis", "Sekmadienis"], correct: 1, cat: "logine" },
  { q: "Knyga yra skaitytojui tas pats, kas maistas yra...", options: ["Lėkštei", "Valgytojui", "Restoranui", "Virtuvei"], correct: 1, cat: "verbaline" },
  { q: "Kuris žodis reiškia tą pačią mintį, kaip „kruopštus“?", options: ["Garsus", "Greitas", "Atidus", "Tingus"], correct: 2, cat: "verbaline" },
  { q: "Kuris žodis yra priešingos reikšmės žodžiui „optimistiškas“?", options: ["Pesimistiškas", "Realistiškas", "Ramus", "Drąsus"], correct: 0, cat: "verbaline" },
];

const CAT_LABELS = {
  numerine: "Skaičiavimo gebėjimai",
  logine: "Loginis mąstymas",
  verbaline: "Žodinis / kalbinis mąstymas",
};

// Short labels for the radar chart (10 axes need to fit on mobile)
const DIMENSION_SHORT: Record<TypeKey, string> = {
  A: "Technologijos",
  B: "Socialinė pagalba",
  C: "Dizainas",
  D: "Verslas",
  E: "Sveikata",
  F: "Mokslas",
  G: "Gamta",
  H: "Teisė",
  I: "Komunikacija",
  J: "Menas ir media",
};

const MAX_PER_DIMENSION: Record<TypeKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0, J: 0 };
DYNAMIC_QUESTIONS.forEach((q) => {
  if (q.type === 'likert') {
    MAX_PER_DIMENSION[q.t as TypeKey] += 2;
  } else if (q.type === 'choice') {
    const seen = new Set<string>();
    q.options.forEach((opt: any) => {
      if (!seen.has(opt.t)) {
        MAX_PER_DIMENSION[opt.t as TypeKey] += 1;
        seen.add(opt.t);
      }
    });
  } else if (q.type === 'multiselect') {
    q.options.forEach((opt: any) => {
      MAX_PER_DIMENSION[opt.t as TypeKey] += 1;
    });
  }
});

// Dimensions have different maximums, so we rank by % of the maximum, not by raw points.
function getRanking(scores: Record<TypeKey, number>) {
  return TYPES.map((k) => ({
    key: k,
    pct: MAX_PER_DIMENSION[k] ? Math.round((scores[k] / MAX_PER_DIMENSION[k]) * 100) : 0,
  })).sort((a, b) => b.pct - a.pct || TYPES.indexOf(a.key) - TYPES.indexOf(b.key));
}

function getAptitudeBand(pct: number) {
  if (pct >= 75) return { label: "Aukštas", color: "#166534", text: "Stiprūs analitiniai gebėjimai. Puikiai tvarkotės su logika ir skaičiais." };
  if (pct >= 45) return { label: "Vidutinis", color: "#92400e", text: "Vidutiniai analitiniai gebėjimai. Dalis užduočių įveikta sėkmingai, tačiau loginėms grandinėms gali reikėti daugiau praktikos." };
  return { label: "Pradinis", color: "#7f1d1d", text: "Šįkart užduotys pasirodė sudėtingesnės. Tai puiki proga pasipraktikuoti loginio mąstymo ir matematikos sferoje." };
}

function buildTraitNarrative(result: ResultData, secondary?: ResultData) {
  const pos = result.positives.join(", ");
  const neg = result.negatives.join(", ");
  const sec = secondary
    ? ` Antrinis tavo profilis – „${secondary.title}“, todėl tau gali tikti ir kryptys, jungiančios abu šiuos polinkius.`
    : "";
  return `Atsakymai į savęs pažinimo klausimyną atskleidžia, kad ryškiausios savybės yra: ${pos}. Šios stiprybės paaiškina, kodėl šis profilis natūraliai dera su kryptimi „${result.title}“.${sec} Kartu vertėtų sąmoningai stebėti sritis, kurios ateityje gali tapti iššūkiu: ${neg}. Tai nėra trūkumai – tai tiesiog kryptys, kurias ugdant galima dar labiau atskleisti savo potencialą.`;
}

// ============================================================================
// COMPONENTS
// ============================================================================

function ProfessionModal({ profession, onClose }: { profession: Profession | null, onClose: () => void }) {
  if (!profession) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
          <X className="w-5 h-5 text-slate-500" />
        </button>
        <div className="bg-slate-800 p-6 text-white">
          <h3 className="text-2xl font-bold pr-8" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{profession.title}</h3>
          <div className="mt-2 inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg backdrop-blur-md">
            <span className="font-semibold">{profession.salary}</span>
            <span className="text-xs opacity-90">/mėn. (Bruto, orientacinis)</span>
          </div>
        </div>
        <div className="p-8">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">Apie profesiją</h4>
          <p className="text-slate-700 text-lg leading-relaxed">{profession.description}</p>
          <div className="mt-8 flex justify-end">
            <button onClick={onClose} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors">
              Uždaryti
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ReportSection({ icon, title, children }: { icon: any, title: string, children: React.ReactNode }) {
  return (
    <div className="report-section mb-10 break-inside-avoid">
      <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4 flex items-center gap-3 pb-3 border-b-2 border-slate-800" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

// VBE + Lithuanian + European universities for one profile
function StudyBlock({ data, heading }: { data: ResultData; heading?: string }) {
  return (
    <div className={heading ? "mt-8" : ""}>
      {heading && <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">{heading}</h4>}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
            <BookOpen className="w-4 h-4" /> Šios krypties VBE
          </h5>
          <p className="text-slate-700 text-sm leading-relaxed">{data.exams}</p>
        </div>
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <h5 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Universitetai Lietuvoje</h5>
          <ul className="space-y-2">
            {data.uniLt.map((uni, i) => (
              <li key={i} className="flex justify-between items-center text-sm">
                <span className="text-slate-700">{uni.name}</span>
                <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded ml-2 whitespace-nowrap">{uni.score}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-400 mt-3 leading-snug">
            Konkursinių balų reikšmės orientacinės; tikslius duomenis žiūrėk LAMA BPO.
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <h5 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Universitetai Europoje (programos anglų k.)</h5>
          <ul className="space-y-3">
            {data.uniEu.map((uni, i) => (
              <li key={i}>
                <div className="text-sm font-semibold text-slate-800">{uni.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">{uni.program}</div>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-400 mt-3 leading-snug">
            Programų kalbą ir stojimo sąlygas visada patikrink universiteto svetainėje.
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultsView({ result, secondary, resultKey, secondaryKey, ranking, aptitude, respondentName, dateStr, onRestart }: any) {
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);

  // --- PDF export ---
  const reportRef = useRef<HTMLDivElement>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const downloadPdf = async () => {
    if (!reportRef.current || pdfBusy) return;
    setPdfBusy(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const gap = 5;
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;

      // Each block (header + every report section) is rendered separately,
      // so page breaks fall between sections instead of cutting through text.
      const blocks = Array.from(
        reportRef.current.querySelectorAll<HTMLElement>("[data-pdf-header], .report-section")
      );

      let y = margin;
      for (const block of blocks) {
        const canvas = await html2canvas(block, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          windowWidth: 1100, // render at desktop width, even on phones
          ignoreElements: (el) => el.classList?.contains("no-print"),
        });
        if (!canvas.width || !canvas.height) continue;

        const blockH = (canvas.height * contentW) / canvas.width;

        if (blockH <= contentH) {
          if (y + blockH > pageH - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", margin, y, contentW, blockH);
          y += blockH + gap;
        } else {
          // Block taller than one page: slice it across pages
          if (y > margin) {
            pdf.addPage();
            y = margin;
          }
          const sliceHpx = Math.floor((contentH * canvas.width) / contentW);
          let sy = 0;
          while (sy < canvas.height) {
            const h = Math.min(sliceHpx, canvas.height - sy);
            const slice = document.createElement("canvas");
            slice.width = canvas.width;
            slice.height = h;
            const ctx = slice.getContext("2d");
            if (!ctx) break;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, slice.width, slice.height);
            ctx.drawImage(canvas, 0, sy, canvas.width, h, 0, 0, canvas.width, h);
            const sliceH = (h * contentW) / canvas.width;
            pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", margin, margin, contentW, sliceH);
            sy += h;
            if (sy < canvas.height) {
              pdf.addPage();
            } else {
              y = margin + sliceH + gap;
            }
          }
        }
      }

      const safeName = (respondentName || "ataskaita").trim().replace(/\s+/g, "-");
      pdf.save(`karjeros-ataskaita-${safeName}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Nepavyko sugeneruoti PDF. Bandyk dar kartą.");
    } finally {
      setPdfBusy(false);
    }
  };

  const primary: ResultData = result;
  const second: ResultData = secondary;

  const overallPct = Math.round((aptitude.correctTotal / APTITUDE_QUESTIONS.length) * 100);
  const band = getAptitudeBand(overallPct);

  // Math level check (numerical-aptitude category)
  const numericPct: number = aptitude.byCategoryPct?.numerine ?? 100;
  const numericCorrect = Math.round((numericPct / 100) * NUMERIC_QUESTION_COUNT);
  const lowMath = numericPct <= LOW_MATH_THRESHOLD;
  // Maths matters a lot if either of the two profiles is maths-heavy
  const mathHigh = MATH_HIGH[resultKey as TypeKey] || MATH_HIGH[secondaryKey as TypeKey];
  const altKey: TypeKey = MATH_HIGH[resultKey as TypeKey] ? resultKey : MATH_HIGH[secondaryKey as TypeKey] ? secondaryKey : resultKey;
  const altPaths = ALT_PATHS[altKey];

  const radarData = ranking.map((r: { key: TypeKey; pct: number }) => ({
    subject: DIMENSION_SHORT[r.key],
    key: r.key,
    score: r.pct,
  }));
  // Keep a fixed axis order (A..J) for the chart itself
  const radarOrdered = TYPES.map((k) => radarData.find((d: any) => d.key === k));

  const altLists = (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      <div className="bg-white rounded-2xl border border-amber-200 p-5">
        <h5 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Kolegijos</h5>
        <ul className="space-y-3">
          {altPaths.colleges.map((c, i) => (
            <li key={i}>
              <div className="text-sm font-semibold text-slate-800">{c.name}</div>
              <div className="text-xs text-slate-600 mt-0.5">{c.programs}</div>
            </li>
          ))}
        </ul>
      </div>
      {altPaths.vocationalSchools.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 p-5">
          <h5 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Profesinės mokyklos</h5>
          <ul className="space-y-3">
            {altPaths.vocationalSchools.map((s, i) => (
              <li key={i}>
                <div className="text-sm font-semibold text-slate-800">{s.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">{s.programs}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const altDisclaimer = (
    <p className="text-xs text-amber-800 leading-relaxed mt-4">
      Kolegijų ir profesinių mokyklų programų pasiūla bei stojimo reikalavimai keičiasi (2024 m. kai kurios kolegijos buvo sujungtos),
      todėl aktualią informaciją būtinai pasitikrink LAMA BPO ir AIKOS (aikos.smm.lt) svetainėse.
    </p>
  );

  // Grid of clickable profession cards (used for both the primary and the secondary profile)
  const professionGrid = (list: Profession[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {list.map((prof, i) => (
        <div
          key={i}
          onClick={() => setSelectedProfession(prof)}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-full"
        >
          <h4 className="font-bold text-base text-slate-800 mb-2">{prof.title}</h4>
          <span className="text-xs font-extrabold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 self-start">
            {prof.salary}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto report-scroll bg-white"
    >
      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .report-scroll { overflow: visible !important; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}</style>

      <AnimatePresence>
        {selectedProfession && <ProfessionModal profession={selectedProfession} onClose={() => setSelectedProfession(null)} />}
      </AnimatePresence>

      <div ref={reportRef}>
      <div data-pdf-header className="p-6 md:p-12 border-b border-slate-200 bg-white">
        <div className="flex justify-between items-start flex-wrap gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 rounded-lg text-white">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Konfidenciali ataskaita</p>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Karjeros krypties įvertinimo ataskaita
              </h1>
            </div>
          </div>
          <div className="text-sm text-slate-600 text-right leading-relaxed">
            <p><span className="font-semibold text-slate-800">Respondentas:</span> {respondentName || "Nenurodyta"}</p>
            <p><span className="font-semibold text-slate-800">Vertinimo data:</span> {dateStr}</p>
            <p><span className="font-semibold text-slate-800">Norminė grupė:</span> Mokiniai, 9–12 kl.</p>
          </div>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed max-w-3xl border-l-4 border-slate-200 pl-4">
          Ši ataskaita parengta pagal atsakymus, kuriuos respondentas pateikė savęs pažinimo klausimyne, bei trumpos analitinių
          gebėjimų užduoties rezultatus. Rezultatai atspindi tai, kaip pats mokinys šiuo metu vertina savo pomėgius ir stiprybes –
          jie yra prielaidos, o ne galutinis sprendimas apie tinkamą karjeros kelią. Kadangi interesai ir gebėjimai keičiasi laikui
          bėgant, ataskaitos aktualumas paprastai trunka apie 12 mėnesių, po to rekomenduojama pakartoti testą.
        </p>
      </div>

      <div className="p-6 md:p-12 space-y-2 bg-white">
        {/* ---------- LOW MATH ---------- */}
        {lowMath && mathHigh && (
          <div className="report-section mb-10 break-inside-avoid rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 md:p-8">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-lg md:text-xl font-bold text-amber-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  Dėmesio: matematikos lygis kol kas nepakankamas
                </h3>
                <p className="text-sm text-amber-900 leading-relaxed mt-2">
                  Skaičiavimo užduotyse teisingai atsakei į <span className="font-bold">{numericCorrect} iš {NUMERIC_QUESTION_COUNT}</span> klausimų.
                  Tai trumpas testas, todėl tai ne nuosprendis, bet aiškus signalas. Tavo rezultatų profilis siejamas su kryptimis, kuriose matematika yra svarbi,
                  o stojant į universitetus (VF ir VNF su stipendija) Matematikos VBE yra privalomas.
                </p>
                <p className="text-sm text-amber-900 leading-relaxed mt-2 font-semibold">
                  Jei tikslas – universitetas, pradėk sistemingai mokytis matematikos jau dabar (pagrindai, procentai, sekos, lygtys, VBE užduočių praktika).
                  Jei matematika nėra tavo kelias, žemiau rasi kolegijų ir profesinių mokyklų, kuriose matematikos krūvis dažnai mažesnis.
                </p>
              </div>
            </div>
            {altLists}
            {altDisclaimer}
          </div>
        )}

        {lowMath && !mathHigh && (
          <div className="report-section mb-10 break-inside-avoid rounded-2xl border border-slate-300 bg-slate-50 p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                Skaičiavimo užduotyse teisingai atsakei į <span className="font-bold">{numericCorrect} iš {NUMERIC_QUESTION_COUNT}</span> klausimų.
                Tavo profilio kryptyse matematika nėra pagrindinis dalykas, tačiau Matematikos VBE vis tiek reikalingas stojant į valstybės finansuojamas vietas
                daugelyje programų. Pasitikrink pasirinktos programos reikalavimus LAMA BPO ir AIKOS ir, jei reikia, skirk laiko pasiruošimui.
                Alternatyvos – kolegijos ir profesinės mokyklos – pateikiamos žemiau.
              </p>
            </div>
            <div className="mt-2">{altLists}</div>
            {altDisclaimer}
          </div>
        )}

        <ReportSection icon={<Compass className="w-5 h-5 text-slate-700" />} title="Rezultatų santrauka">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 md:p-8">
            <span className="inline-block py-1 px-3 rounded-full bg-slate-800 text-white text-xs font-bold tracking-widest uppercase mb-4">
              Tavo pagrindinis karjeros tipas
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">{primary.title}</h2>
            <p className="text-slate-700 text-base md:text-lg leading-relaxed">{primary.summary}</p>
          </div>
          {second && (
            <div className="mt-4 bg-white rounded-2xl border border-slate-300 p-6">
              <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-slate-200 text-slate-700 text-xs font-bold tracking-widest uppercase mb-3">
                <Layers className="w-3.5 h-3.5" /> Antrinis profilis
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{second.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{second.summary}</p>
            </div>
          )}
        </ReportSection>

        <ReportSection icon={<Star className="w-5 h-5 text-slate-700" />} title="Asmenybės bruožai">
          <p className="text-slate-700 text-base leading-relaxed mb-6">{buildTraitNarrative(primary, second)}</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
              <h4 className="text-emerald-800 font-bold mb-3 text-sm uppercase tracking-wide">Stipriosios savybės</h4>
              <div className="flex flex-wrap gap-2">
                {primary.positives.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white text-emerald-900 text-sm font-semibold rounded-lg border border-emerald-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-100">
              <h4 className="text-rose-800 font-bold mb-3 text-sm uppercase tracking-wide">Augimo zonos</h4>
              <div className="flex flex-wrap gap-2">
                {primary.negatives.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white text-rose-900 text-sm font-semibold rounded-lg border border-rose-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ReportSection>

        <ReportSection icon={<Users className="w-5 h-5 text-slate-700" />} title="Žymios asmenybės (Šio tipo atstovai)">
          <p className="text-slate-700 text-sm leading-relaxed mb-4">
            Žemiau pateikiami žinomi lyderiai, mokslininkai ar kūrėjai, kurių veiklos stilius ir pasiekimai atspindi šį asmenybės tipą:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {primary.famousPeople.map((person, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 text-base">{person.name}</h5>
                  <p className="text-xs text-slate-500 font-medium mt-1">{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection icon={<RadarIcon className="w-5 h-5 text-slate-700" />} title="Asmenybės profilis (visos dešimt krypčių)">
          <p className="text-slate-700 text-sm leading-relaxed mb-4">
            Nors testas nustato pagrindinį ir antrinį profilį, kiekvienas žmogus atsakymuose atspindi visų krypčių
            elementus skirtingu laipsniu. Diagrama rodo, kokią dalį galimų taškų surinkai kiekvienoje kryptyje (procentais) –
            ryškiausios dvi kryptys sudaro tavo pagrindinį ir antrinį profilį.
          </p>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4" style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarOrdered} outerRadius="65%">
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} tickCount={5} />
                <Radar name="Rezultatas" dataKey="score" stroke="#1e293b" fill="#1e293b" fillOpacity={0.35} isAnimationActive={false} />
                <Tooltip formatter={(value: any, _name: any, props: any) => [`${value}%`, props.payload.subject]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {ranking.map((r: { key: TypeKey; pct: number }) => {
              const isPrimary = r.key === resultKey;
              const isSecondary = r.key === secondaryKey;
              return (
                <div
                  key={r.key}
                  className={`text-center p-2.5 rounded-xl border ${isPrimary ? "bg-slate-800 border-slate-800 text-white" : isSecondary ? "bg-white border-slate-800 border-2 text-slate-700" : "bg-white border-slate-200 text-slate-600"}`}
                >
                  <div className="text-xs font-semibold leading-tight">{DIMENSION_SHORT[r.key]}</div>
                  <div className={`text-lg font-extrabold ${isPrimary ? "text-white" : "text-slate-800"}`}>{r.pct}%</div>
                  {(isPrimary || isSecondary) && (
                    <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">{isPrimary ? "Pagrindinis" : "Antrinis"}</div>
                  )}
                </div>
              );
            })}
          </div>
        </ReportSection>

        <ReportSection icon={<Briefcase className="w-5 h-5 text-slate-700" />} title="Bendravimo stilius">
          <p className="text-slate-700 text-base leading-relaxed">{primary.communication}</p>
        </ReportSection>

        <ReportSection icon={<Calculator className="w-5 h-5 text-slate-700" />} title="Analitiniai gebėjimai">
          <p className="text-slate-700 text-base leading-relaxed mb-6">{band.text}</p>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Bendras rezultatas</span>
              <span className="text-sm font-bold" style={{ color: band.color }}>{band.label} · {overallPct}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full" style={{ width: `${overallPct}%`, backgroundColor: band.color }} />
            </div>

            {aptitude.byCategoryPct && Object.keys(CAT_LABELS).map((cat) => {
              const pct = aptitude.byCategoryPct[cat] || 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">{CAT_LABELS[cat as keyof typeof CAT_LABELS]}</span>
                    <span className="text-sm font-semibold text-slate-700">{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-700 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ReportSection>

        <ReportSection icon={<GraduationCap className="w-5 h-5 text-slate-700" />} title="Studijų kryptys, Egzaminai ir LAMA BPO kriterijai">
          {/* LAMA BPO Rule Box */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <h5 className="font-bold text-amber-900 text-sm uppercase tracking-wide mb-1">
                  LAMA BPO bendrieji stojimo reikalavimai
                </h5>
                <p className="text-amber-800 text-xs font-semibold mb-3">
                  {LAMA_BPO_GENERAL_INFO.mandatoryNotice}
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-800">
                  {LAMA_BPO_GENERAL_INFO.minCriteria.map((crit, idx) => (
                    <li key={idx}>{crit}</li>
                  ))}
                </ul>
                {lowMath && (
                  <p className="text-xs text-amber-900 font-bold mt-3">
                    Atsižvelgiant į tavo skaičiavimo rezultatą: universitetams reikalingam Matematikos VBE šiuo metu trūksta pasirengimo –
                    pradėk mokytis iš anksto arba apsvarstyk ataskaitoje pateiktas kolegijas ir profesines mokyklas.
                  </p>
                )}
              </div>
            </div>
          </div>

          <StudyBlock data={primary} />
          {second && <StudyBlock data={second} heading={`Antrinis profilis: ${second.title}`} />}
        </ReportSection>

        <ReportSection icon={<Building2 className="w-5 h-5 text-slate-700" />} title="Stipendijos ir finansavimo galimybės">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-slate-800 text-base font-semibold">Aptariama konsultacijos metu.</p>
            <p className="text-slate-600 text-sm leading-relaxed mt-2">
              Stipendijos ir finansavimo galimybės yra labai individualios, todėl jas peržiūrime kartu pagal tavo situaciją.
            </p>
          </div>
        </ReportSection>

        <ReportSection icon={<Building2 className="w-5 h-5 text-slate-700" />} title="Tau tinkančios profesijos">
          <p className="text-xs text-slate-500 mb-4 flex items-center gap-1 no-print">
            <Info className="w-3.5 h-3.5" /> Paspausk kortelę informacijai
          </p>
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">{primary.title}</h4>
          {professionGrid(primary.professions)}
          {second && (
            <>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mt-8 mb-3">
                Antrinis profilis: {second.title}
              </h4>
              {professionGrid(second.professions)}
            </>
          )}
        </ReportSection>

        <div className="pt-8 flex flex-wrap justify-center gap-4 no-print">
          <button
            onClick={downloadPdf}
            disabled={pdfBusy}
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60"
          >
            <Download className="w-5 h-5" /> {pdfBusy ? "Ruošiama..." : "Atsisiųsti ataskaitą"}
          </button>
          <button onClick={onRestart} className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors px-6 py-3 rounded-xl hover:bg-slate-50">
            <RefreshCcw className="w-5 h-5" /> Pradėti iš naujo
          </button>
        </div>
      </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EMPTY_SCORES: Record<TypeKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, I: 0, J: 0 };

export default function CareerQuiz() {
  const [gameState, setGameState] = useState("intro");
  const [respondentName, setRespondentName] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<TypeKey, number>>({ ...EMPTY_SCORES });
  const [history, setHistory] = useState<any[]>([]);

  const [selectedMulti, setSelectedMulti] = useState<any[]>([]);

  const [aptIdx, setAptIdx] = useState(0);
  const [aptAnswers, setAptAnswers] = useState(Array(APTITUDE_QUESTIONS.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(20);

  const dateStr = new Date().toLocaleDateString("lt-LT", { year: "numeric", month: "long", day: "numeric" });

  const startGame = () => {
    setCurrentIdx(0);
    setScores({ ...EMPTY_SCORES });
    setHistory([]);
    setSelectedMulti([]);
    setAptIdx(0);
    setAptAnswers(Array(APTITUDE_QUESTIONS.length).fill(null));
    setGameState("personality");
  };

  const handleDynamicAnswer = (answerObj: any) => {
    setHistory((prev) => [...prev, answerObj]);
    setScores((prev) => {
      const newScores = { ...prev };
      if (Array.isArray(answerObj)) {
        answerObj.forEach((item) => { newScores[item.type as TypeKey] += item.score; });
      } else {
        newScores[answerObj.type as TypeKey] += answerObj.score;
      }
      return newScores;
    });

    if (currentIdx + 1 < DYNAMIC_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedMulti([]);
    } else {
      setGameState("aptitude");
    }
  };

  const handleBack = () => {
    if (currentIdx === 0) return;
    const lastEntry = history[history.length - 1];
    setScores((prev) => {
      const newScores = { ...prev };
      if (Array.isArray(lastEntry)) {
        lastEntry.forEach((item) => { newScores[item.type as TypeKey] -= item.score; });
      } else {
        newScores[lastEntry.type as TypeKey] -= lastEntry.score;
      }
      return newScores;
    });
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIdx((prev) => prev - 1);
    setSelectedMulti([]);
  };

  const toggleMulti = (option: any) => {
    setSelectedMulti((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const submitMulti = () => {
    const answerArr = selectedMulti.map((opt) => ({ type: opt.t, score: 1 }));
    handleDynamicAnswer(answerArr);
  };

  useEffect(() => {
    if (gameState === "aptitude") {
      setTimeLeft(20);
    }
  }, [gameState, aptIdx]);

  useEffect(() => {
    if (gameState !== "aptitude") return;
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      handleAptitudeAnswer(-1);
    }
  }, [timeLeft, gameState]);

  const handleAptitudeAnswer = (optionIdx: number) => {
    const updated = [...aptAnswers];
    updated[aptIdx] = optionIdx;
    setAptAnswers(updated);

    if (aptIdx + 1 < APTITUDE_QUESTIONS.length) {
      setAptIdx((prev) => prev + 1);
    } else {
      setGameState("result");
    }
  };

  const handleAptBack = () => {
    if (aptIdx === 0) return;
    setAptIdx((prev) => prev - 1);
  };

  const getAptitudeSummary = () => {
    let correctTotal = 0;
    const catTotal: Record<string, number> = { numerine: 0, logine: 0, verbaline: 0 };
    const catCorrect: Record<string, number> = { numerine: 0, logine: 0, verbaline: 0 };

    APTITUDE_QUESTIONS.forEach((q, i) => {
      catTotal[q.cat] = (catTotal[q.cat] || 0) + 1;
      if (aptAnswers[i] === q.correct) {
        correctTotal += 1;
        catCorrect[q.cat] = (catCorrect[q.cat] || 0) + 1;
      }
    });

    const byCategoryPct: Record<string, number> = {};
    Object.keys(catTotal).forEach((cat) => {
      byCategoryPct[cat] = Math.round((catCorrect[cat] / catTotal[cat]) * 100);
    });

    return { correctTotal, byCategoryPct };
  };

  const totalQuestions = DYNAMIC_QUESTIONS.length + APTITUDE_QUESTIONS.length;
  const stepNumber = gameState === "personality" ? currentIdx + 1 : gameState === "aptitude" ? DYNAMIC_QUESTIONS.length + aptIdx + 1 : totalQuestions;

  const currentQ = gameState === "personality" ? DYNAMIC_QUESTIONS[currentIdx] : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col w-full h-full relative">
      <div className="bg-slate-900 px-4 py-4 md:px-8 text-white flex justify-between items-center z-10 shadow-md no-print sticky top-0">
        <div className="flex items-center">
          <span className="font-bold tracking-widest text-lg md:text-xl" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            TIKSLIUKAI.LT
          </span>
        </div>
        {(gameState === "personality" || gameState === "aptitude") && (
          <span className="text-xs md:text-sm font-medium text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            {stepNumber} / {totalQuestions}
          </span>
        )}
      </div>

      <div className="flex-1 w-full flex flex-col relative">
        <AnimatePresence mode="wait">
          {gameState === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center flex-1 p-6 md:p-8 text-center space-y-10 max-w-4xl mx-auto w-full"
            >
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  Atrask Savo <span className="text-slate-600">Profesinį Kelią</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                  Pasiruošk išsamiai savęs pažinimo kelionei. Testas sudarytas iš dinamiškų situacijų ir trumpos loginės dalies.
                </p>
              </div>
              <div className="w-full max-w-sm">
                <label className="block text-sm font-bold text-slate-500 mb-2 text-left">Tavo vardas (ataskaitai)</label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="Pvz. Dovydas"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-500 focus:outline-none text-lg text-center bg-white"
                />
              </div>
              <button
                onClick={startGame}
                className="group bg-slate-900 hover:bg-slate-800 text-white text-xl font-bold py-5 px-12 md:px-16 rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-slate-900/20 flex items-center gap-3 w-full sm:w-auto justify-center"
              >
                Pradėti <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {gameState === "personality" && currentQ && (
            <motion.div key="quiz" className="flex flex-col flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:p-12 justify-start">
              <div className="mb-6 md:mb-10 w-full">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBack}
                    disabled={currentIdx === 0}
                    className={`flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors p-2 -ml-2 ${currentIdx === 0 ? "invisible" : "visible"}`}
                  >
                    <ArrowLeft className="w-4 h-4" /> Atgal
                  </button>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">Dalis 1 / 2 · Savęs pažinimas</span>
                </div>
                <div className="w-full h-2 md:h-3 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentIdx / DYNAMIC_QUESTIONS.length) * 100}%` }}
                    className="h-full bg-slate-800 rounded-full"
                  />
                </div>
              </div>

              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-center gap-8 md:gap-12 pb-12"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {currentQ.q}
                </h2>

                <div className="w-full max-w-2xl mx-auto">
                  {/* LIKERT TYPE */}
                  {currentQ.type === "likert" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button onClick={() => handleDynamicAnswer({ type: currentQ.t, score: 2 })} className="p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-slate-600 hover:text-emerald-700 shadow-sm flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Visiškai sutinku
                      </button>
                      <button onClick={() => handleDynamicAnswer({ type: currentQ.t, score: 1 })} className="p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-amber-500 hover:bg-amber-50 transition-all font-bold text-slate-600 hover:text-amber-700 shadow-sm flex items-center justify-center gap-2">
                        <HelpCircle className="w-5 h-5 text-amber-500" /> Iš dalies
                      </button>
                      <button onClick={() => handleDynamicAnswer({ type: currentQ.t, score: 0 })} className="p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-rose-500 hover:bg-rose-50 transition-all font-bold text-slate-600 hover:text-rose-700 shadow-sm flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5 text-rose-500" /> Nesutinku
                      </button>
                    </div>
                  )}

                  {/* CHOICE TYPE */}
                  {currentQ.type === "choice" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rotateOptions<any>(currentQ.options, currentIdx).map((opt: any, i: number) => (
                        <button key={i} onClick={() => handleDynamicAnswer({ type: opt.t, score: 1 })} className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-slate-500 hover:bg-slate-50 transition-all font-semibold text-slate-700 text-left text-sm md:text-base shadow-sm">
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* MULTISELECT TYPE */}
                  {currentQ.type === "multiselect" && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                        {rotateOptions<any>(currentQ.options, currentIdx).map((opt: any, i: number) => {
                          const isSelected = selectedMulti.includes(opt);
                          return (
                            <button key={i} onClick={() => toggleMulti(opt)} className={`p-4 rounded-xl border-2 transition-all flex items-start gap-3 text-left ${isSelected ? "border-slate-800 bg-slate-800 text-white shadow-md" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
                              <div className={`mt-0.5 rounded flex items-center justify-center shrink-0 w-5 h-5 border ${isSelected ? "border-white bg-white/20" : "border-slate-300"}`}>
                                {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                              </div>
                              <span className="font-medium text-sm md:text-base leading-snug">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={submitMulti} disabled={selectedMulti.length === 0} className="w-full p-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                        Patvirtinti ir tęsti <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === "aptitude" && (
            <motion.div key="aptitude" className="flex flex-col flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:p-12 justify-start">
              <div className="mb-6 md:mb-10 w-full">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleAptBack}
                    disabled={aptIdx === 0}
                    className={`flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors p-2 -ml-2 ${aptIdx === 0 ? "invisible" : "visible"}`}
                  >
                    <ArrowLeft className="w-4 h-4" /> Atgal
                  </button>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ClipboardList className="w-3.5 h-3.5" /> Dalis 2 / 2
                  </span>
                </div>

                {/* Timer Bar */}
                <div className="flex items-center gap-4 mb-2">
                  <Clock className={`w-5 h-5 ${timeLeft <= 5 ? "text-rose-500 animate-pulse" : "text-slate-500"}`} />
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? "bg-rose-500" : "bg-slate-800"}`} style={{ width: `${(timeLeft / 20) * 100}%` }} />
                  </div>
                  <span className={`font-bold text-sm w-8 text-right ${timeLeft <= 5 ? "text-rose-500" : "text-slate-600"}`}>{timeLeft}s</span>
                </div>
              </div>

              <motion.div
                key={aptIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-center gap-8 md:gap-12 pb-12"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                  {APTITUDE_QUESTIONS[aptIdx].q}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
                  {APTITUDE_QUESTIONS[aptIdx].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAptitudeAnswer(i)}
                      className="flex items-center justify-center p-5 md:p-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-slate-500 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
                    >
                      <span className="font-bold text-base md:text-lg text-slate-700">{option}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === "result" && (() => {
            const ranking = getRanking(scores);
            const primaryKey = ranking[0].key;
            const secondaryKey = ranking[1].key;
            return (
              <ResultsView
                result={RESULTS[primaryKey]}
                secondary={RESULTS[secondaryKey]}
                resultKey={primaryKey}
                secondaryKey={secondaryKey}
                ranking={ranking}
                aptitude={getAptitudeSummary()}
                respondentName={respondentName}
                dateStr={dateStr}
                onRestart={startGame}
              />
            );
          })()}
        </AnimatePresence>
      </div>
    </main>
  );
}
