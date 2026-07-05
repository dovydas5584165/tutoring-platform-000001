"use client";

import { useState } from "react";
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
  ShieldCheck,
  ClipboardList,
  Radar as RadarIcon,
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

// ============================================================================
// DATA & TYPES
// ============================================================================

const RESULTS = {
  A: {
    title: "Sistemų Architektas (Inžinerinis-Techninis)",
    summary:
      "Tu esi strategas, kuris mato pasaulį per logikos ir struktūros prizmę. Tavo smegenys geriausiai veikia sprendžiant sudėtingas technines mįsles, optimizuojant procesus ir kuriant ateities inovacijas.",
    positives: ["Loginis mąstymas", "Preciziškumas", "Algoritminis mąstymas", "Savarankiškumas"],
    negatives: ["Socialinis nuovargis", "Per didelis kritiškumas", "Perfekcionizmas"],
    communication:
      "Draugai tave vertina už tavo objektyvumą. Tu nemėgsti tuščių kalbų, kalbi faktais ir vertini intelektualų ryšį.",
    exams: "Matematika (valstybinis), Fizika, Informacinės Technologijos, Anglų kalba.",
    uniLt: [
      { name: "KTU Informatikos fak.", score: "KB: >8.2" },
      { name: "VU Matematikos ir informatikos fak.", score: "KB: >8.8" },
      { name: "VILNIUS TECH", score: "KB: >7.5" },
    ],
    uniEu: "TU Delft (Olandija), ETH Zurich (Šveicarija), Miuncheno technikos universitetas",
    famousPeople: [
      { name: "Elon Musk", role: "Tesla & SpaceX įkūrėjas" },
      { name: "Bill Gates", role: "Microsoft įkūrėjas" },
      { name: "Margaret Hamilton", role: "NASA programuotoja" },
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
      { title: "Elektronikos inžinierius", salary: "1600-3500€", description: "Kuria elektronines grandines ir prietaisus – nuo išmaniųjų telefonų komponentų iki medicininės įrangos." },
    ],
  },
  B: {
    title: "Žmonių Ugdytojas (Socialinis-Emocinis)",
    summary:
      "Tavo stiprybė – empatija ir komunikacija. Tu jauti kitų emocijas, gebi juos motyvuoti, suprasti ir nukreipti teisinga linkme. Tau svarbu darbas, turintis prasmę.",
    positives: ["Empatija", "Klausymo įgūdžiai", "Diplomatija", "Kantrybė"],
    negatives: ["Sunkumas brėžti ribas", "Emocinis jautrumas kitiems", "Kritikos baimė"],
    communication:
      "Esi draugų būrio patarėjas. Moki išklausyti, suprasti be žodžių ir visada rasti tinkamą paguodos ar palaikymo frazę.",
    exams: "Lietuvių kalba, Anglų kalba, Biologija (psichologijai) arba Istorija.",
    uniLt: [
      { name: "VU Psichologijos fak.", score: "KB: >9.0" },
      { name: "LSMU (Sveikatos psichologija)", score: "KB: >8.5" },
      { name: "VDU Socialinių mokslų fak.", score: "KB: >7.0" },
    ],
    uniEu: "Amsterdamo universitetas (Olandija), KU Leuven (Belgija), Kopenhagos universitetas",
    famousPeople: [
      { name: "Oprah Winfrey", role: "TV laidų vedėja, filantropė" },
      { name: "Michelle Obama", role: "Advokatė, rašytoja" },
      { name: "Princess Diana", role: "Humanitarė" },
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
      { title: "Specialusis pedagogas", salary: "1300-2200€", description: "Dirba su vaikais, turinčiais specialiųjų poreikių, padėdamas jiems integruotis ir mokytis." },
    ],
  },
  C: {
    title: "Vizijų Kūrėjas (Kūrybinis-Meninis)",
    summary:
      "Tu esi idėjų generatorius, kuriam reikia laisvės. Pasaulį matai ne tokį, koks jis yra, o tokį, koks galėtų būti. Rutina tave žudo, o laisvė – įkvepia.",
    positives: ["Kūrybiškumas", "Originalumas", "Vizualinis mąstymas", "Intuicija"],
    negatives: ["Chaotiškumas", "Rutinos netoleravimas", "Nepastovumas"],
    communication:
      "Esi charizmatiškas. Draugai tave vertina už kitokį požiūrį į gyvenimą, estetiką ir gebėjimą nustebinti.",
    exams: "Lietuvių kalba, Anglų kalba, Dailės/Architektūros stojamieji, Istorija.",
    uniLt: [
      { name: "Vilniaus Dailės Akademija (VDA)", score: "KB: Portfelis + Egz." },
      { name: "LMTA (Muzikos ir teatro)", score: "KB: Stojamasis" },
      { name: "VU Kūrybinės industrijos", score: "KB: >6.5" },
    ],
    uniEu: "UAL Londonas (JK), Dizaino akademija Eindhoven (Olandija), Aalto universitetas (Suomija)",
    famousPeople: [
      { name: "Steve Jobs", role: "Apple įkūrėjas" },
      { name: "Coco Chanel", role: "Dizainerė" },
      { name: "Walt Disney", role: "Animacijos pionierius" },
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
      { title: "Copywriter (Tekstų kūrėjas)", salary: "1300-2800€", description: "Rašo įtraukiančius tekstus reklamoms, svetainėms ir straipsniams." },
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
    exams: "Matematika (valstybinis), Anglų kalba, Geografija arba Istorija.",
    uniLt: [
      { name: "ISM Vadybos ir ekonomikos univ.", score: "KB: >7.0" },
      { name: "VU Verslo mokykla", score: "KB: >7.5" },
      { name: "KTU Ekonomikos ir verslo fak.", score: "KB: >6.5" },
    ],
    uniEu: "SSE Stokholmas (Švedija), IE verslo mokykla (Ispanija), HEC Paryžius (Prancūzija)",
    famousPeople: [
      { name: "Jeff Bezos", role: "Amazon įkūrėjas" },
      { name: "Richard Branson", role: "Virgin Group įkūrėjas" },
      { name: "Sheryl Sandberg", role: "Facebook COO" },
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
      { title: "Finansų direktorius (CFO)", salary: "3000-7000€", description: "Atsako už visus įmonės finansus, biudžeto planavimą ir finansines ataskaitas." },
    ],
  },
  E: {
    title: "Saugotojas & Tyrėjas (Mokslo-Struktūrinis)",
    summary:
      "Tu vertini faktus, tvarką ir preciziškumą. Esi patikimas, kruopštus žmogus. Mokslo, medicinos ar teisės sritys tau tinka, nes ten klaidos kaina yra didelė.",
    positives: ["Atsakomybė", "Atidumas detalėms", "Sąžiningumas", "Metodiškumas"],
    negatives: ["Baimė keisti planus", "Perfekcionizmas detalėse", "Sunkus prisitaikymas"],
    communication:
      "Komunikuoji ramiai, logiškai. Nemėgsti pagražinimų, vertini punktualumą ir konkretumą. Tavo žodis yra šventas.",
    exams: "Biologija, Chemija, Matematika, Lietuvių kalba.",
    uniLt: [
      { name: "LSMU (Medicina)", score: "KB: >9.5" },
      { name: "VU Medicinos fak.", score: "KB: >9.2" },
      { name: "VU Gyvybės mokslų centras", score: "KB: >8.5" },
    ],
    uniEu: "Heidelbergo universitetas (Vokietija), Karolinska Institutet (Švedija), Sorbona (Prancūzija)",
    famousPeople: [
      { name: "Marie Curie", role: "Mokslininkė" },
      { name: "Angela Merkel", role: "Politikė, fizikė" },
      { name: "Dr. House (Personažas)", role: "Diagnostikas" },
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
      { title: "Odontologas", salary: "2500-6000€", description: "Rūpinasi pacientų burnos sveikata, gydo dantis ir atlieka estetines procedūras." },
    ],
  },
};

// Personality / self-report items (~60 items, ~8-10s each => ~9 minutes)
const RAW_QUESTIONS = [
  { q: "Mėgstu spręsti loginius galvosūkius ir mįsles.", t: "A" }, { q: "Man įdomu, kaip veikia algoritmai ir kodas.", t: "A" },
  { q: "Galiu ilgai sėdėti prie vienos techninės problemos.", t: "A" }, { q: "Man patinka aiški struktūra ir skaičiai.", t: "A" },
  { q: "Greitai pastebiu sistemos klaidas ar neefektyvumą.", t: "A" }, { q: "Mėgstu automatizuoti pasikartojančius darbus.", t: "A" },
  { q: "Man įdomu ardyti prietaisus ir suprasti jų veikimą.", t: "A" }, { q: "Suprantu kompiuterių tinklų logiką.", t: "A" },
  { q: "Analizuoju statistiką ir grafikus savo malonumui.", t: "A" }, { q: "Mane domina duomenų saugumas ir privatumas.", t: "A" },
  { q: "Man patinka kurti ir tobulinti sistemas ar procesus.", t: "A" }, { q: "Greitai išmokstu naujas programas ar technologijas.", t: "A" },
  { q: "Moku išklausyti žmogų jo nepertraukdamas.", t: "B" }, { q: "Socialinės problemos ir nelygybė man rūpi.", t: "B" },
  { q: "Galiu lengvai paaiškinti sudėtingą dalyką vaikui.", t: "B" }, { q: "Jaučiu prasmę padėdamas kitiems tobulėti.", t: "B" },
  { q: "Gera atmosfera komandoje man svarbiau už rezultatą.", t: "B" }, { q: "Domiuosi psichologija ir žmonių elgsena.", t: "B" },
  { q: "Nuoširdžiai džiaugiuosi kitų sėkme.", t: "B" }, { q: "Moku motyvuoti nusivylusį žmogų.", t: "B" },
  { q: "Darbas be prasmės man būtų kančia.", t: "B" }, { q: "Mėgstu pažinti skirtingas kultūras.", t: "B" },
  { q: "Man patinka padėti draugams susitvarkyti su sunkumais.", t: "B" }, { q: "Jaučiu, kada žmogui reikia palaikymo, net jei jis nesako.", t: "B" },
  { q: "Pastebiu, kai spalvos ar formos nedera tarpusavyje.", t: "C" }, { q: "Daug laiko praleidžiu svajodamas apie idėjas.", t: "C" },
  { q: "Mėgstu kurti video, fotografuoti ar piešti.", t: "C" }, { q: "Originalumas man svarbiau už taisykles.", t: "C" },
  { q: "Mėgstu keisti savo aplinkos dizainą.", t: "C" }, { q: "Mada, kinas ir menas mane įkvepia.", t: "C" },
  { q: "Man svarbu, kad rezultatas būtų estetiškas.", t: "C" }, { q: "Mano idėjos kitiems kartais atrodo keistos.", t: "C" },
  { q: "Norėčiau sukurti savo prekinį ženklą.", t: "C" }, { q: "Mėgstu gaminti ar meistrauti rankomis.", t: "C" },
  { q: "Mėgstu improvizuoti ir eksperimentuoti su naujomis idėjomis.", t: "C" }, { q: "Man patinka rašyti istorijas, dainų tekstus ar scenarijus.", t: "C" },
  { q: "Mėgstu derėtis ir gauti geriausią kainą.", t: "D" }, { q: "Konkurencija mane motyvuoja stengtis labiau.", t: "D" },
  { q: "Galiu priimti sprendimus spaudimo metu.", t: "D" }, { q: "Finansinė sėkmė man yra svarbus rodiklis.", t: "D" },
  { q: "Visada turiu planą B ir C.", t: "D" }, { q: "Nebijau finansinės rizikos, jei matau galimybę.", t: "D" },
  { q: "Mėgstu vadovauti grupiniams projektams.", t: "D" }, { q: "Galiu įtikinti kitus savo tiesa.", t: "D" },
  { q: "Svajoju turėti savo verslą ar įmonę.", t: "D" }, { q: "Statusas ir pripažinimas man svarbu.", t: "D" },
  { q: "Man patinka kelti tikslus ir sekti, kaip juos pasiekiu.", t: "D" }, { q: "Noriu, kad mano darbas turėtų aiškų poveikį rezultatams.", t: "D" },
  { q: "Mėgstu klasifikuoti ir rūšiuoti informaciją.", t: "E" }, { q: "Visada pastebiu rašybos ar faktines klaidas.", t: "E" },
  { q: "Gamtos mokslai (biologija, chemija) man patinka.", t: "E" }, { q: "Aiškios instrukcijos ir rutina manęs negąsdina.", t: "E" },
  { q: "Mėgstu atlikti tikslius eksperimentus.", t: "E" }, { q: "Sveikata ir ekologija man prioritetas.", t: "E" },
  { q: "Galiu ilgai dirbti susikaupęs prie detalių.", t: "E" }, { q: "Saugumo taisyklių laikymasis yra būtinas.", t: "E" },
  { q: "Visada skaitau instrukcijas iki galo.", t: "E" }, { q: "Disciplina ir tvarka man padeda gyventi.", t: "E" },
  { q: "Man patinka tikrinti faktus prieš juos patikint.", t: "E" }, { q: "Jaučiuosi ramiau, kai turiu aiškų veiksmų planą.", t: "E" },
];

// Aptitude items: numerical, logical, and verbal reasoning (~15 items, ~40-45s each => ~10 minutes)
const APTITUDE_QUESTIONS = [
  { q: "Kokia sekos tąsa: 2, 5, 8, 11, 14, ...?", options: ["15", "16", "17", "18"], correct: 2, cat: "numerine" },
  { q: "Prekės kaina 80 €, jai taikoma 25% nuolaida. Kokia kaina po nuolaidos?", options: ["55 €", "60 €", "65 €", "70 €"], correct: 1, cat: "numerine" },
  { q: "Klasėje yra 30 mokinių, 60% jų – mergaitės. Kiek klasėje berniukų?", options: ["10", "12", "15", "18"], correct: 1, cat: "numerine" },
  { q: "Automobilis 3 valandas važiavo 90 km/h greičiu. Kiek kilometrų jis nuvažiavo?", options: ["240 km", "270 km", "300 km", "330 km"], correct: 1, cat: "numerine" },
  { q: "3 pieštukai kainuoja 1,50 €. Kiek kainuos 7 tokie pieštukai?", options: ["3,00 €", "3,50 €", "4,00 €", "4,50 €"], correct: 1, cat: "numerine" },
  { q: "Kuris skaičius nedera prie kitų: 16, 25, 30, 36?", options: ["16", "25", "30", "36"], correct: 2, cat: "logine" },
  { q: "Visi katinai yra gyvūnai. Kai kurie gyvūnai yra žali. Ką galima teigti apie katinus?", options: ["Visi katinai yra žali", "Kai kurie katinai yra žali", "Joks katinas nėra žalias", "Iš duotų teiginių negalima nustatyti"], correct: 3, cat: "logine" },
  { q: "Kokia raidė seka toliau: A, C, E, G, ...?", options: ["H", "I", "J", "K"], correct: 1, cat: "logine" },
  { q: "Jei šiandien trečiadienis, kokia diena bus po 10 dienų?", options: ["Penktadienis", "Šeštadienis", "Sekmadienis", "Pirmadienis"], correct: 1, cat: "logine" },
  { q: "Kuri figūra nedera prie kitų: trikampis, kvadratas, apskritimas, kubas?", options: ["Trikampis", "Kvadratas", "Apskritimas", "Kubas"], correct: 3, cat: "logine" },
  { q: "Knyga santykiauja su skaitytoju taip, kaip maistas santykiauja su...?", options: ["Restoranu", "Valgytoju", "Virtuve", "Lėkšte"], correct: 1, cat: "verbaline" },
  { q: "Kuris žodis reiškia tą pačią mintį, kaip „kruopštus“?", options: ["Greitas", "Atidus", "Tingus", "Garsus"], correct: 1, cat: "verbaline" },
  { q: "Kuris žodis yra priešingos reikšmės žodžiui „optimistiškas“?", options: ["Realistiškas", "Pesimistiškas", "Ramus", "Drąsus"], correct: 1, cat: "verbaline" },
  { q: "Gydytojas santykiauja su ligonine taip, kaip mokytojas santykiauja su...?", options: ["Klase", "Knyga", "Mokykla", "Egzaminu"], correct: 2, cat: "verbaline" },
  { q: "Kuris žodis nedera prie kitų: obuolys, bananas, morka, kriaušė?", options: ["Obuolys", "Bananas", "Morka", "Kriaušė"], correct: 2, cat: "verbaline" },
];

const CAT_LABELS = {
  numerine: "Skaičiavimo gebėjimai",
  logine: "Loginis mąstymas",
  verbaline: "Žodinis / kalbinis mąstymas",
};

// Short labels for the five personality dimensions, used in the radar diagram.
// Max score per dimension = number of RAW_QUESTIONS tagged with that letter (12 each).
const DIMENSION_SHORT = {
  A: "Techninis-inžinerinis",
  B: "Socialinis-emocinis",
  C: "Kūrybinis-meninis",
  D: "Verslo-vadybinis",
  E: "Mokslinis-struktūrinis",
};

function getAptitudeBand(pct) {
  if (pct >= 75) {
    return {
      label: "Aukštas",
      color: "#166534",
      text:
        "Atsakymai į loginio ir matematinio mąstymo užduotis rodo stiprius analitinius gebėjimus. Toks rezultatas dažnai siejamas su gebėjimu greitai apdoroti informaciją, pastebėti dėsningumus ir priimti pagrįstus sprendimus – tai naudinga bet kurioje srityje, tačiau ypač reikšminga tiksliuosiuose ir gamtos moksluose, inžinerijoje ar analitikoje.",
    };
  }
  if (pct >= 45) {
    return {
      label: "Vidutinis",
      color: "#92400e",
      text:
        "Atsakymai rodo vidutinį analitinio mąstymo lygį – dalis užduočių atliktos tiksliai, o kai kurios parodė, kad tam tikrose srityse (skaičiavimo, loginio ar žodinio mąstymo) būtų naudinga papildoma praktika. Tai visiškai normalu – šis gebėjimas gerai lavėja sprendžiant panašaus tipo užduotis reguliariai.",
    };
  }
  return {
    label: "Pradinis",
    color: "#7f1d1d",
    text:
      "Šio testo užduotys šįkart pasirodė sudėtingesnės nei tikėtasi. Tai nebūtinai atspindi tikrąjį potencialą, nes tokio tipo užduotims reikia pratybos. Rekomenduojama neskubant pasitreniruoti su panašiomis matematinės ir loginės logikos užduotimis – rezultatas paprastai greitai pagerėja.",
  };
}

function buildTraitNarrative(result) {
  const pos = result.positives.join(", ");
  const neg = result.negatives.join(", ");
  return `Atsakymai į savęs pažinimo klausimyną atskleidžia, kad ryškiausios savybės yra: ${pos}. Šios stiprybės paaiškina, kodėl šis profilis natūraliai dera su kryptimi „${result.title}“. Kartu vertėtų sąmoningai stebėti sritis, kurios ateityje gali tapti iššūkiu: ${neg}. Tai nėra trūkumai – tai tiesiog kryptys, kurias ugdant galima dar labiau atskleisti savo potencialą.`;
}

// ============================================================================
// COMPONENTS
// ============================================================================

function ProfessionModal({ profession, onClose }) {
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
          <h3 className="text-2xl font-bold pr-8">{profession.title}</h3>
          <div className="mt-2 inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-lg backdrop-blur-md">
            <span className="font-semibold">{profession.salary}</span>
            <span className="text-xs opacity-90">/mėn. (Bruto)</span>
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

function ReportSection({ icon, title, children }) {
  return (
    <div className="report-section mb-10 break-inside-avoid">
      <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4 flex items-center gap-3 pb-3 border-b-2 border-slate-800" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function ResultsView({ result, resultKey, scores, maxPerDimension, aptitude, respondentName, dateStr, onRestart }) {
  const [selectedProfession, setSelectedProfession] = useState(null);

  const overallPct = Math.round((aptitude.correctTotal / APTITUDE_QUESTIONS.length) * 100);
  const band = getAptitudeBand(overallPct);

  const radarData = Object.keys(DIMENSION_SHORT).map((key) => ({
    subject: DIMENSION_SHORT[key],
    key,
    score: scores[key],
    fullMark: maxPerDimension[key],
  }));
  const radarMax = Math.max(...Object.values(maxPerDimension));

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 overflow-y-auto max-h-[85vh] md:max-h-[800px] report-scroll bg-white"
    >
      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .report-scroll { max-height: none !important; overflow: visible !important; }
          .report-page { box-shadow: none !important; border: none !important; border-radius: 0 !important; }
          .break-inside-avoid { break-inside: avoid; }
        }
      `}</style>

      <AnimatePresence>
        {selectedProfession && <ProfessionModal profession={selectedProfession} onClose={() => setSelectedProfession(null)} />}
      </AnimatePresence>

      {/* COVER / REPORT HEADER */}
      <div className="p-8 md:p-12 border-b border-slate-200">
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

      <div className="p-6 md:p-12 space-y-2">
        {/* SUMMARY */}
        <ReportSection icon={<Compass className="w-5 h-5 text-slate-700" />} title="Rezultatų santrauka">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 md:p-8">
            <span className="inline-block py-1 px-3 rounded-full bg-slate-800 text-white text-xs font-bold tracking-widest uppercase mb-4">
              Tavo karjeros tipas
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">{result.title}</h2>
            <p className="text-slate-700 text-base md:text-lg leading-relaxed">{result.summary}</p>
          </div>
        </ReportSection>

        {/* TRAITS NARRATIVE */}
        <ReportSection icon={<Star className="w-5 h-5 text-slate-700" />} title="Asmenybės bruožai">
          <p className="text-slate-700 text-base leading-relaxed mb-6">{buildTraitNarrative(result)}</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
              <h4 className="text-emerald-800 font-bold mb-3 text-sm uppercase tracking-wide">Stipriosios savybės</h4>
              <div className="flex flex-wrap gap-2">
                {result.positives.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white text-emerald-900 text-sm font-semibold rounded-lg border border-emerald-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-100">
              <h4 className="text-rose-800 font-bold mb-3 text-sm uppercase tracking-wide">Augimo zonos</h4>
              <div className="flex flex-wrap gap-2">
                {result.negatives.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white text-rose-900 text-sm font-semibold rounded-lg border border-rose-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ReportSection>

        {/* RADAR DIAGRAM OF ALL FIVE DIMENSIONS */}
        <ReportSection icon={<RadarIcon className="w-5 h-5 text-slate-700" />} title="Asmenybės profilis (visos penkios kryptys)">
          <p className="text-slate-700 text-sm leading-relaxed mb-4">
            Nors testas nustato vieną dominuojantį profilį, kiekvienas žmogus atsakymuose atspindi visų penkių krypčių
            elementus skirtingu laipsniu. Toliau pateikta diagrama parodo, kiek kiekviena kryptis buvo išreikšta atsakymuose –
            ryškiausia (didžiausia) kryptis atitinka ataskaitoje aprašytą karjeros tipą.
          </p>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4" style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, radarMax]} tick={{ fill: "#94a3b8", fontSize: 10 }} tickCount={5} />
                <Radar
                  name="Rezultatas"
                  dataKey="score"
                  stroke="#1e293b"
                  fill="#1e293b"
                  fillOpacity={0.35}
                  isAnimationActive={false}
                />
                <Tooltip formatter={(value, name, props) => [`${value} / ${props.payload.fullMark}`, props.payload.subject]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {radarData.map((d) => (
              <div
                key={d.key}
                className={`text-center p-2.5 rounded-xl border ${d.key === resultKey ? "bg-slate-800 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-600"}`}
              >
                <div className="text-xs font-semibold leading-tight">{d.subject}</div>
                <div className={`text-lg font-extrabold ${d.key === resultKey ? "text-white" : "text-slate-800"}`}>
                  {d.score}/{d.fullMark}
                </div>
              </div>
            ))}
          </div>
        </ReportSection>

        {/* COMMUNICATION */}
        <ReportSection icon={<Briefcase className="w-5 h-5 text-slate-700" />} title="Bendravimo stilius">
          <p className="text-slate-700 text-base leading-relaxed">{result.communication}</p>
        </ReportSection>

        {/* APTITUDE / ANALYTICAL SKILLS */}
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

            {Object.keys(CAT_LABELS).map((cat) => {
              const pct = aptitude.byCategoryPct[cat];
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">{CAT_LABELS[cat]}</span>
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

        {/* STUDIES */}
        <ReportSection icon={<GraduationCap className="w-5 h-5 text-slate-700" />} title="Studijų kryptys ir egzaminai">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                <BookOpen className="w-4 h-4" /> Rekomenduojami egzaminai
              </h5>
              <p className="text-slate-700 text-sm leading-relaxed">{result.exams}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <h5 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Universitetai Lietuvoje</h5>
              <ul className="space-y-2">
                {result.uniLt.map((uni, i) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">{uni.name}</span>
                    <span className="text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded ml-2 whitespace-nowrap">{uni.score}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
              <h5 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Universitetai Europoje</h5>
              <ul className="space-y-2">
                {result.uniEu.split(",").map((uni, i) => (
                  <li key={i} className="text-sm text-slate-700">{uni.trim()}</li>
                ))}
              </ul>
            </div>
          </div>
        </ReportSection>

        {/* PROFESSIONS */}
        <ReportSection
          icon={<Building2 className="w-5 h-5 text-slate-700" />}
          title="Tau tinkančios profesijos"
        >
          <p className="text-xs text-slate-500 mb-4 flex items-center gap-1 no-print">
            <Info className="w-3.5 h-3.5" /> Paspausk kortelę informacijai
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.professions.map((prof, i) => (
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
        </ReportSection>

        {/* FOOTER */}
        <div className="pt-6 border-t border-slate-200 text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Šis dokumentas yra konfidencialus ir skirtas naudoti tik respondento, jo tėvų ar mokyklos karjeros konsultanto. ©
          {" "}{new Date().getFullYear()} tiksliukai.lt
        </div>

        <div className="pt-8 flex flex-wrap justify-center gap-4 no-print">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Download className="w-5 h-5" /> Atsisiųsti ataskaitą (PDF)
          </button>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors px-6 py-3 rounded-xl hover:bg-slate-50"
          >
            <RefreshCcw className="w-5 h-5" /> Pradėti testą iš naujo
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CareerQuiz() {
  const [gameState, setGameState] = useState("intro"); // intro | personality | aptitude | result
  const [respondentName, setRespondentName] = useState("");
  const [questions, setQuestions] = useState([...RAW_QUESTIONS]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState({ A: 0, B: 0, C: 0, D: 0, E: 0 });
  const [history, setHistory] = useState([]);

  const [aptIdx, setAptIdx] = useState(0);
  const [aptAnswers, setAptAnswers] = useState(Array(APTITUDE_QUESTIONS.length).fill(null));

  const dateStr = new Date().toLocaleDateString("lt-LT", { year: "numeric", month: "long", day: "numeric" });

  const startGame = () => {
    setQuestions([...RAW_QUESTIONS].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
    setScores({ A: 0, B: 0, C: 0, D: 0, E: 0 });
    setHistory([]);
    setAptIdx(0);
    setAptAnswers(Array(APTITUDE_QUESTIONS.length).fill(null));
    setGameState("personality");
  };

  const handleAnswer = (isYes) => {
    const type = questions[currentIdx].t;
    if (isYes) {
      setScores((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    }
    setHistory((prev) => [...prev, { type, isYes }]);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setGameState("aptitude");
    }
  };

  const handleBack = () => {
    if (currentIdx === 0) return;
    const lastEntry = history[history.length - 1];
    if (lastEntry.isYes) {
      setScores((prev) => ({ ...prev, [lastEntry.type]: prev[lastEntry.type] - 1 }));
    }
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIdx((prev) => prev - 1);
  };

  const handleAptitudeAnswer = (optionIdx) => {
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

  const getWinner = () => {
    return Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
  };

  // Max possible score per dimension = how many RAW_QUESTIONS carry that letter tag.
  // Computed from the data instead of hard-coded, so it stays correct if questions are edited.
  const maxPerDimension = Object.keys(scores).reduce((acc, key) => {
    acc[key] = RAW_QUESTIONS.filter((q) => q.t === key).length;
    return acc;
  }, {});

  const getAptitudeSummary = () => {
    let correctTotal = 0;
    const byCategoryCorrect = { numerine: 0, logine: 0, verbaline: 0 };
    const byCategoryTotal = { numerine: 0, logine: 0, verbaline: 0 };

    APTITUDE_QUESTIONS.forEach((question, i) => {
      byCategoryTotal[question.cat] += 1;
      if (aptAnswers[i] === question.correct) {
        correctTotal += 1;
        byCategoryCorrect[question.cat] += 1;
      }
    });

    const byCategoryPct = {};
    Object.keys(byCategoryTotal).forEach((cat) => {
      byCategoryPct[cat] = Math.round((byCategoryCorrect[cat] / byCategoryTotal[cat]) * 100);
    });

    return { correctTotal, byCategoryPct };
  };

  const totalQuestions = RAW_QUESTIONS.length + APTITUDE_QUESTIONS.length;
  const stepNumber =
    gameState === "personality" ? currentIdx + 1 : gameState === "aptitude" ? RAW_QUESTIONS.length + aptIdx + 1 : totalQuestions;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[700px] flex flex-col relative report-page">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center z-10 no-print">
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-slate-300" />
            <span className="font-bold tracking-wider text-xl">TIKSLIUKAI.LT</span>
          </div>
          {(gameState === "personality" || gameState === "aptitude") && (
            <span className="text-sm font-medium text-slate-300 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
              Klausimas {stepNumber} / {totalQuestions}
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col relative">
          <AnimatePresence mode="wait">
            {gameState === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-8"
              >
                <div className="bg-slate-100 p-8 rounded-full inline-block shadow-inner ring-8 ring-slate-50">
                  <span className="text-7xl">🧭</span>
                </div>
                <div className="max-w-2xl">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                    Atrask Savo <span className="text-slate-600">Profesinį Kelią</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
                    Šis testas trunka apie 20 minučių ir susideda iš dviejų dalių: savęs pažinimo klausimyno ir trumpos
                    analitinių (matematinio ir loginio mąstymo) gebėjimų užduoties. Rezultatas – asmeninė, atsisiunčiama
                    ataskaita apie tavo stiprybes, tinkamas studijų kryptis ir profesijas.
                  </p>
                </div>
                <div className="w-full max-w-sm">
                  <label className="block text-sm font-bold text-slate-500 mb-2 text-left">Tavo vardas (ataskaitai)</label>
                  <input
                    type="text"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder="Pvz. Dovydas"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-500 focus:outline-none text-lg text-center"
                  />
                </div>
                <button
                  onClick={startGame}
                  className="group bg-slate-900 hover:bg-slate-800 text-white text-xl font-bold py-5 px-16 rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-slate-900/20 flex items-center gap-3"
                >
                  Pradėti <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {gameState === "personality" && (
              <motion.div key="quiz" className="flex flex-col flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 justify-center">
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={handleBack}
                      disabled={currentIdx === 0}
                      className={`flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors ${currentIdx === 0 ? "invisible" : "visible"}`}
                    >
                      <ArrowLeft className="w-4 h-4" /> Buvęs klausimas
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dalis 1 / 2 · Savęs pažinimas</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentIdx / questions.length) * 100}%` }}
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
                  className="flex-1 flex items-center justify-center min-h-[180px] mb-10"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 leading-tight">{questions[currentIdx].q}</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
                  <button
                    onClick={() => handleAnswer(true)}
                    className="flex items-center justify-center gap-4 p-7 rounded-3xl border-2 border-slate-100 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all group shadow-sm hover:shadow-xl"
                  >
                    <CheckCircle2 className="w-7 h-7 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    <span className="font-bold text-lg text-slate-600 group-hover:text-emerald-700">Taip, tai aš</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(false)}
                    className="flex items-center justify-center gap-4 p-7 rounded-3xl border-2 border-slate-100 bg-white hover:border-rose-500 hover:bg-rose-50 transition-all group shadow-sm hover:shadow-xl"
                  >
                    <XCircle className="w-7 h-7 text-slate-300 group-hover:text-rose-500 transition-colors" />
                    <span className="font-bold text-lg text-slate-600 group-hover:text-rose-700">Ne, nelabai</span>
                  </button>
                </div>
              </motion.div>
            )}

            {gameState === "aptitude" && (
              <motion.div key="aptitude" className="flex flex-col flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 justify-center">
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={handleAptBack}
                      disabled={aptIdx === 0}
                      className={`flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors ${aptIdx === 0 ? "invisible" : "visible"}`}
                    >
                      <ArrowLeft className="w-4 h-4" /> Buvęs klausimas
                    </button>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <ClipboardList className="w-3.5 h-3.5" /> Dalis 2 / 2 · Analitiniai gebėjimai
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(aptIdx / APTITUDE_QUESTIONS.length) * 100}%` }}
                      className="h-full bg-slate-800 rounded-full"
                    />
                  </div>
                </div>

                <motion.div
                  key={aptIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex items-center justify-center min-h-[140px] mb-8"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 leading-tight">
                    {APTITUDE_QUESTIONS[aptIdx].q}
                  </h2>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                  {APTITUDE_QUESTIONS[aptIdx].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAptitudeAnswer(i)}
                      className="flex items-center justify-center p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-500 hover:bg-slate-50 transition-all shadow-sm hover:shadow-lg"
                    >
                      <span className="font-bold text-base text-slate-700">{option}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {gameState === "result" && (
              <ResultsView
                result={RESULTS[getWinner()]}
                resultKey={getWinner()}
                scores={scores}
                maxPerDimension={maxPerDimension}
                aptitude={getAptitudeSummary()}
                respondentName={respondentName}
                dateStr={dateStr}
                onRestart={startGame}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
