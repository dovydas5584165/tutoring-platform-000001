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
  Zap,
  Building2,
  BookOpen,
  GraduationCap,
  Star,
  Info,
  X
} from "lucide-react";

// --- TIPAI IR DUOMENŲ STRUKTŪROS ---

type Dimension = 'impact' | 'structure' | 'ideas' | 'interaction' | 'momentum' | 'composure' | 'engagement';

interface Question {
  id: number;
  text: string;
  dimension: Dimension;
  positive: boolean;
}

interface Profession {
  title: string;
  salary: string;
  description: string;
}

interface University {
  name: string;
  score: string; 
}

interface FamousPerson {
  name: string;
  role: string;
}

interface ArchetypeData {
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

// Archetipų duomenys (konkrečios profesijos, universitetai ir t.t.)
const ARCHETYPES: Record<string, ArchetypeData> = {
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
    uniEu: "TU Delft (Olandija), ETH Zurich (Šveicarija), Miuncheno technikos universitetas",
    famousPeople: [
      { name: "Elon Musk", role: "Tesla & SpaceX įkūrėjas" },
      { name: "Bill Gates", role: "Microsoft įkūrėjas" },
      { name: "Margaret Hamilton", role: "NASA programuotoja" }
    ],
    professions: [
      { title: "Programinės įrangos inžinierius", salary: "2000-5500€", description: "Kuria, testuoja ir diegia kompiuterines programas. Rašo kodą, kuris valdo viską - nuo mobiliųjų programėlių iki kosminių laivų sistemų." },
      { title: "Duomenų mokslininkas", salary: "2500-5000€", description: "Analizuoja didžiulius duomenų kiekius naudodamas statistiką ir mašininį mokymąsi, kad padėtų įmonėms priimti pagrįstus sprendimus." },
      { title: "Kibernetinio saugumo analitikas", salary: "2200-4800€", description: "Apsaugo organizacijų tinklus ir duomenis nuo programišių atakų. Tai nuolatinė kova tarp gynybos ir puolimo skaitmeninėje erdvėje." },
      { title: "Dirbtinio intelekto kūrėjas", salary: "3000-6500€", description: "Kuria algoritmus, kurie leidžia kompiuteriams mokytis ir priimti sprendimus (pvz., ChatGPT, savavaldžiai automobiliai)." },
      { title: "Debesijos architektas", salary: "2800-5800€", description: "Projektuoja serverių infrastruktūrą 'debesyse' (AWS, Azure), užtikrinant, kad sistemos veiktų greitai ir patikimai." },
      { title: "Robotikos inžinierius", salary: "1800-4000€", description: "Projektuoja ir konstruoja robotus bei automatizuotas sistemas, kurios pakeičia žmogaus darbą gamyboje ar pavojingose zonose." },
      { title: "Sistemų administratorius", salary: "1500-3000€", description: "Prižiūri įmonės kompiuterių tinklus, serverius ir įrangą, užtikrindamas sklandų kasdienį darbą." },
      { title: "Elektronikos inžinierius", salary: "1600-3500€", description: "Kuria elektronines grandines ir prietaisus - nuo išmaniųjų telefonų komponentų iki medicininės įrangos." }
    ]
  },
  B: {
    title: "Žmonių Ugdytojas (Socialinis-Emocinis)",
    summary: "Tavo stiprybė - empatija ir komunikacija. Tu jauti kitų emocijas, gebi juos motyvuoti, suprasti ir nukreipti teisinga linkme. Tau svarbu darbas, turintis prasmę.",
    positives: ["Empatija", "Klausymo įgūdžiai", "Diplomatija", "Kantrybė"],
    negatives: ["Sunkumas brėžti ribas", "Emocinis jautrumas kitiems", "Kritikos baimė"],
    communication: "Esi draugų būrio patarėjas. Moki išklausyti, suprasti be žodžių ir visada rasti tinkamą paguodos ar palaikymo frazę.",
    exams: "Lietuvių kalba, Anglų kalba, Biologija (psichologijai) arba Istorija.",
    uniLt: [
      { name: "VU Psichologijos fak.", score: "KB: >9.0" },
      { name: "LSMU (Sveikatos psichologija)", score: "KB: >8.5" },
      { name: "VDU Socialinių mokslų fak.", score: "KB: >7.0" }
    ],
    uniEu: "Amsterdamo universitetas (Olandija), KU Leuven (Belgija), Kopenhagos universitetas",
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
      { title: "Specialusis pedagogas", salary: "1300-2200€", description: "Dirba su vaikais, turinčiais specialiųjų poreikių, padėdamas jiems integruotis ir mokytis." }
    ]
  },
  C: {
    title: "Vizijų Kūrėjas (Kūrybinis-Meninis)",
    summary: "Tu esi idėjų generatorius, kuriam reikia laisvės. Pasaulį matai ne tokį, koks jis yra, o tokį, koks galėtų būti. Rutina tave žudo, o laisvė - įkvepia.",
    positives: ["Kūrybiškumas", "Originalumas", "Vizualinis mąstymas", "Intuicija"],
    negatives: ["Chaotiškumas", "Rutinos netoleravimas", "Nepastovumas"],
    communication: "Esi charizmatiškas. Draugai tave vertina už kitokį požiūrį į gyvenimą, estetiką ir gebėjimą nustebinti.",
