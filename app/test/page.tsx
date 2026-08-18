Štai atnaujintas `page.tsx` kodas, kuriame įgyvendinau visus tavo prašymus:

1. **Pilno ekrano režimas (Full-screen)**: Panaikinau rėmelius ir apribojimus. Dabar aplikacija išnaudoja visą ekraną, todėl mobiliajame telefone naudotis bus kur kas patogiau.
2. **Klausimų dinamika**: Pakeičiau senus „Taip/Ne“ klausimus į dinamišką formatą. Dabar yra 3 tipų klausimai: vieno pasirinkimo iš kelių variantų, kelių atsakymų žymėjimo (angl. *multiselect*) ir stiprumo vertinimo („Visiškai sutinku“, „Iš dalies“, „Nesutinku“).
3. **Analitinės dalies laikmatis**: Pridėtas aiškus 30 sekundžių laikmatis loginės dalies užduotims. Laikui pasibaigus, automatiškai pereinama prie kito klausimo.
4. **Vienodi šriftai**: Klausimų tekstuose pritaikytas tas pats „Georgia“ / serif šriftas, kuris naudojamas ir ataskaitos antraštėse.
5. **Daugiau profesijų**: Prie kiekvieno karjeros tipo pridėjau po 5 papildomas profesijas su aprašymais (iš viso dabar po 15 profesijų kiekvienai krypčiai).

Pakeisk savo `page.tsx` failo turinį šiuo kodu:

```tsx
"use client";

import { useState, useEffect } from "react";
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
  HelpCircle,
  Clock,
  CheckSquare
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
      { title: "QA Inžinierius (Testuotojas)", salary: "1500-3500€", description: "Testuoja programinę įrangą ir užtikrina jos kokybę prieš pasiekiant vartotojus." },
      { title: "Tinklų inžinierius", salary: "2000-4500€", description: "Kuria, diegia ir prižiūri kompiuterinių tinklų infrastruktūrą organizacijose." },
      { title: "Duomenų inžinierius", salary: "2500-5500€", description: "Rengia ir prižiūri infrastruktūrą, reikalingą dideliems duomenų kiekiams apdoroti." },
      { title: "Telekomunikacijų inžinierius", salary: "1800-4000€", description: "Kuria ir optimizuoja ryšio ir duomenų perdavimo sistemas." },
      { title: "IT palaikymo specialistas", salary: "1200-2500€", description: "Padeda išspręsti technines problemas, su kuriomis susiduria įmonės darbuotojai ar klientai." },
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
      { title: "Šeimos terapeutas", salary: "1500-3500€", description: "Konsultuoja šeimas, padeda joms įveikti krizes ir gerinti tarpusavio santykius." },
      { title: "Slaugytojas", salary: "1300-2500€", description: "Rūpinasi pacientų fizine ir emocine gerove sveikatos priežiūros įstaigose." },
      { title: "Bendruomenės lyderis", salary: "1200-2800€", description: "Buria ir atstovauja bendruomenes, inicijuoja socialinius projektus." },
      { title: "Vaiko teisių apsaugos specialistas", salary: "1400-2500€", description: "Gina vaikų interesus ir sprendžia sudėtingas šeimų problemas." },
      { title: "Priklausomybių konsultantas", salary: "1300-2600€", description: "Padeda asmenims įveikti priklausomybes per terapiją ir palaikymą." },
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
      { title: "Animatorius", salary: "1500-3500€", description: "Kuria judančius vaizdus filmams, vaizdo žaidimams ar reklamoms." },
      { title: "Iliustratorius", salary: "1200-3000€", description: "Kuria vizualinius piešinius ir meną knygoms, žurnalams ar skaitmeninei žiniasklaidai." },
      { title: "Pramonės dizaineris", salary: "1600-4000€", description: "Kuria masinės gamybos produktų formą, funkcijas ir ergonomiką." },
      { title: "Scenografas", salary: "1300-3000€", description: "Kuria vizualią aplinką ir dekoracijas teatrui, televizijai ar kinui." },
      { title: "Videografas", salary: "1400-3500€", description: "Filmuoja ir prodiusuoja vaizdo turinį asmeniniams ar verslo projektams." },
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
      { title: "Verslo analitikas", salary: "2000-4500€", description: "Analizuoja įmonės procesus, duomenis ir siūlo sprendimus efektyvumui didinti." },
      { title: "Operacijų vadovas", salary: "2500-6000€", description: "Valdo kasdienę įmonės veiklą, užtikrindamas sklandų ir pelningą procesų veikimą." },
      { title: "Startuolio įkūrėjas", salary: "Neribota", description: "Inicijuoja, augina ir pritraukia investicijas inovatyviems verslo projektams." },
      { title: "Prekės ženklo strategas", salary: "2000-4800€", description: "Kuria ilgalaikę prekės ženklo pozicionavimo, įvaizdžio ir augimo strategiją." },
      { title: "Rizikos vertintojas", salary: "2200-5000€", description: "Identifikuoja ir analizuoja galimas finansines, operacines ar verslo rizikas." },
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
      { title: "Genetikos technologas", salary: "1800-3500€", description: "Atlieka DNR tyrimus, paveldimų ligų ir genetinę analizę laboratorijose." },
      { title: "Epidemiologas", salary: "1700-4000€", description: "Tiria ligų plitimą populiacijoje, analizuoja duomenis ir ieško būdų jas suvaldyti." },
      { title: "Teisės patarėjas", salary: "2000-5000€", description: "Teikia teisines konsultacijas įmonėms ar asmenims, rengia sutartis ir dokumentus." },
      { title: "Kokybės kontrolės inspektorius", salary: "1400-2800€", description: "Užtikrina, kad gaminiai ar paslaugos atitiktų griežčiausius nustatytus standartus." },
      { title: "Veterinaras", salary: "1500-3500€", description: "Diagnozuoja ir gydo gyvūnų ligas, atlieka operacijas ir rūpinasi jų sveikata." },
    ],
  },
};

// Dynamic questions mix (choice, multiselect, likert)
const DYNAMIC_QUESTIONS = [
  {
    type: "choice",
    q: "Kokia veikla komandiniame projekte tau atrodytų patraukliausia?",
    options: [
      { text: "Struktūruoti užduotis, planuoti logiką ar programuoti", t: "A" },
      { text: "Padėti komandos nariams susikalbėti ir spręsti konfliktus", t: "B" },
      { text: "Kurti vizualinį dizainą, idėjas ar pristatymą", t: "C" },
      { text: "Dalinti užduotis, sekti biudžetą ir prisiimti atsakomybę", t: "D" },
      { text: "Tikrinti faktus, ieškoti mokslinių šaltinių ir taisyti klaidas", t: "E" },
    ]
  },
  {
    type: "choice",
    q: "Kokia tavo idealios darbo aplinkos vizija?",
    options: [
      { text: "Tyli, tvarkinga laboratorija ar asmeninis kabinetas", t: "E" },
      { text: "Atviros erdvės su moderniomis technologijomis ir ekranais", t: "A" },
      { text: "Jauki aplinka, kurioje galima bendrauti ir tiesiogiai padėti kitiems", t: "B" },
      { text: "Kūrybinė studija be griežtų taisyklių ir rutinos", t: "C" },
      { text: "Dinamiškas biuras, kuriame nuolat verda veiksmas ir sprendžiami verslo reikalai", t: "D" },
    ]
  },
  {
    type: "multiselect",
    q: "Pažymėk visas veiklas, kurios tau skamba įdomiai (gali rinktis kelias):",
    options: [
      { text: "Duomenų bazių ar sistemų analizė", t: "A" },
      { text: "Pagalba sunkumus išgyvenantiems žmonėms", t: "B" },
      { text: "Grafinis dizainas ar vizualinis menas", t: "C" },
      { text: "Derybos, pardavimai ir verslo strategijos", t: "D" },
      { text: "Teisinių dokumentų ar taisyklių nagrinėjimas", t: "E" },
      { text: "Robotų programavimas ar inžinerija", t: "A" },
      { text: "Savanorystė renginiuose", t: "B" },
      { text: "Vaizdo įrašų kūrimas ir montavimas", t: "C" },
      { text: "Savo verslo idėjos vystymas", t: "D" },
      { text: "Laboratoriniai tyrimai", t: "E" },
    ]
  },
  { type: "likert", q: "Man patinka ardyti prietaisus, suprasti, kaip viskas veikia, arba spręsti loginius galvosūkius.", t: "A" },
  { type: "likert", q: "Draugai dažnai kreipiasi į mane patarimo, nes moku nuoširdžiai išklausyti.", t: "B" },
  { type: "likert", q: "Mane labai vargina griežtos taisyklės ir rutina – man reikia erdvės improvizacijai.", t: "C" },
  { type: "likert", q: "Mėgstu imtis lyderio vaidmens ir nebijau priimti sprendimų už visą grupę.", t: "D" },
  { type: "likert", q: "Aš esu labai detalus (-i), visada laikausi instrukcijų ir pastebiu kitų klaidas.", t: "E" },
  
  {
    type: "choice",
    q: "Kaip dažniausiai priimi svarbius sprendimus?",
    options: [
      { text: "Pasikliaudamas logika, efektyvumu ir sisteminiu požiūriu", t: "A" },
      { text: "Svarstydamas, kaip mano sprendimas paveiks kitų žmonių emocijas", t: "B" },
      { text: "Kliaudamasis savo intuicija ir ieškodamas originalaus kampo", t: "C" },
      { text: "Vertindamas potencialią naudą, konkurenciją ir asmeninę sėkmę", t: "D" },
      { text: "Ilgai analizuodamas faktus, skaičius ir ieškodamas įrodymų", t: "E" },
    ]
  },
  {
    type: "multiselect",
    q: "Apie kokias temas mieliausiai skaitytum straipsnį ar žiūrėtum dokumentiką?",
    options: [
      { text: "Dirbtinis intelektas ir kosmoso technologijos", t: "A" },
      { text: "Žmogaus psichologija ir santykiai", t: "B" },
      { text: "Architektūra, mada ir šiuolaikinis menas", t: "C" },
      { text: "Investavimas, ekonomika ir lyderystė", t: "D" },
      { text: "Medicina, genetika ir gamtos mokslai", t: "E" },
    ]
  },
  { type: "likert", q: "Galiu ilgai koncentruotis į vieną techninę ar matematinę problemą, kol randu išeitį.", t: "A" },
  { type: "likert", q: "Man svarbu, kad mano darbas teiktų tiesioginę pagalbą ar naudą visuomenei.", t: "B" },
  { type: "likert", q: "Dažnai svajoju ir galvoju apie originalias, netradicines idėjas.", t: "C" },
  { type: "likert", q: "Konkurencija mane motyvuoja pasiekti dar geresnių rezultatų.", t: "D" },
  { type: "likert", q: "Moksliniai metodai ir tikslūs eksperimentai man atrodo patikimiausias būdas rasti tiesą.", t: "E" },
  
  { type: "likert", q: "Mėgstu automatizuoti pasikartojančius darbus ir ieškoti efektyviausio sprendimo būdo.", t: "A" },
  { type: "likert", q: "Galiu lengvai suprasti, kaip jaučiasi kitas žmogus, net jei jis to nesako žodžiais.", t: "B" },
  { type: "likert", q: "Man be galo svarbu, kad tai, ką sukuriu, atrodytų estetiškai ir turėtų vizualinę vertę.", t: "C" },
  { type: "likert", q: "Nebijau rizikuoti ir išeiti iš komforto zonos, jei matau galimybę pasiekti sėkmę.", t: "D" },
  { type: "likert", q: "Mėgstu klasifikuoti informaciją, palaikyti griežtą tvarką ir visada tikrinu faktus.", t: "E" },
];

const APTITUDE_QUESTIONS = [
  { q: "Kokia sekos tąsa: 2, 5, 8, 11, 14, ...?", options: ["15", "16", "17", "18"], correct: 2, cat: "numerine" },
  { q: "Prekės kaina 80 €, jai taikoma 25% nuolaida. Kokia kaina po nuolaidos?", options: ["55 €", "60 €", "65 €", "70 €"], correct: 1, cat: "numerine" },
  { q: "Klasėje yra 30 mokinių, 60% jų – mergaitės. Kiek klasėje berniukų?", options: ["10", "12", "15", "18"], correct: 1, cat: "numerine" },
  { q: "Kuris skaičius nedera prie kitų: 16, 25, 30, 36?", options: ["16", "25", "30", "36"], correct: 2, cat: "logine" },
  { q: "Visi katinai yra gyvūnai. Kai kurie gyvūnai yra žali. Ką galima teigti apie katinus?", options: ["Visi katinai yra žali", "Kai kurie katinai yra žali", "Joks katinas nėra žalias", "Iš duotų teiginių negalima nustatyti"], correct: 3, cat: "logine" },
  { q: "Kokia raidė seka toliau: A, C, E, G, ...?", options: ["H", "I", "J", "K"], correct: 1, cat: "logine" },
  { q: "Jei šiandien trečiadienis, kokia diena bus po 10 dienų?", options: ["Penktadienis", "Šeštadienis", "Sekmadienis", "Pirmadienis"], correct: 1, cat: "logine" },
  { q: "Knyga santykiauja su skaitytoju taip, kaip maistas santykiauja su...?", options: ["Restoranu", "Valgytoju", "Virtuve", "Lėkšte"], correct: 1, cat: "verbaline" },
  { q: "Kuris žodis reiškia tą pačią mintį, kaip „kruopštus“?", options: ["Greitas", "Atidus", "Tingus", "Garsus"], correct: 1, cat: "verbaline" },
  { q: "Kuris žodis yra priešingos reikšmės žodžiui „optimistiškas“?", options: ["Realistiškas", "Pesimistiškas", "Ramus", "Drąsus"], correct: 1, cat: "verbaline" },
];

const CAT_LABELS = {
  numerine: "Skaičiavimo gebėjimai",
  logine: "Loginis mąstymas",
  verbaline: "Žodinis / kalbinis mąstymas",
};

const DIMENSION_SHORT = {
  A: "Techninis-inžinerinis",
  B: "Socialinis-emocinis",
  C: "Kūrybinis-meninis",
  D: "Verslo-vadybinis",
  E: "Mokslinis-struktūrinis",
};

// Calculate max theoretical points based on dynamic structure
const MAX_PER_DIMENSION = { A: 0, B: 0, C: 0, D: 0, E: 0 };
DYNAMIC_QUESTIONS.forEach(q => {
  if (q.type === 'likert') {
    MAX_PER_DIMENSION[q.t] += 2;
  } else if (q.type === 'choice') {
    const seen = new Set();
    q.options.forEach(opt => {
      if (!seen.has(opt.t)) {
        MAX_PER_DIMENSION[opt.t] += 1;
        seen.add(opt.t);
      }
    });
  } else if (q.type === 'multiselect') {
    q.options.forEach(opt => {
      MAX_PER_DIMENSION[opt.t] += 1;
    });
  }
});

function getAptitudeBand(pct) {
  if (pct >= 75) return { label: "Aukštas", color: "#166534", text: "Stiprūs analitiniai gebėjimai. Puikiai tvarkotės su logika ir skaičiais." };
  if (pct >= 45) return { label: "Vidutinis", color: "#92400e", text: "Vidutiniai analitiniai gebėjimai. Dalis užduočių įveikta sėkmingai, tačiau loginėms grandinėms gali reikėti daugiau praktikos." };
  return { label: "Pradinis", color: "#7f1d1d", text: "Šįkart užduotys pasirodė sudėtingesnės. Tai puiki proga pasipraktikuoti loginio mąstymo ir matematikos sferoje." };
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
          <h3 className="text-2xl font-bold pr-8" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{profession.title}</h3>
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

function ResultsView({ result, resultKey, scores, aptitude, respondentName, dateStr, onRestart }) {
  const [selectedProfession, setSelectedProfession] = useState(null);
  const overallPct = Math.round((aptitude.correctTotal / APTITUDE_QUESTIONS.length) * 100);
  const band = getAptitudeBand(overallPct);

  const radarData = Object.keys(DIMENSION_SHORT).map((key) => ({
    subject: DIMENSION_SHORT[key],
    key,
    score: scores[key],
    fullMark: MAX_PER_DIMENSION[key],
  }));
  const radarMax = Math.max(...Object.values(MAX_PER_DIMENSION));

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

      <div className="p-6 md:p-12 border-b border-slate-200">
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
          </div>
        </div>
      </div>

      <div className="p-6 md:p-12 space-y-2">
        <ReportSection icon={<Compass className="w-5 h-5 text-slate-700" />} title="Rezultatų santrauka">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 md:p-8">
            <span className="inline-block py-1 px-3 rounded-full bg-slate-800 text-white text-xs font-bold tracking-widest uppercase mb-4">
              Tavo karjeros tipas
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">{result.title}</h2>
            <p className="text-slate-700 text-base md:text-lg leading-relaxed">{result.summary}</p>
          </div>
        </ReportSection>

        <ReportSection icon={<RadarIcon className="w-5 h-5 text-slate-700" />} title="Asmenybės profilis (visos penkios kryptys)">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4" style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, radarMax]} tick={{ fill: "#94a3b8", fontSize: 10 }} tickCount={5} />
                <Radar name="Rezultatas" dataKey="score" stroke="#1e293b" fill="#1e293b" fillOpacity={0.35} isAnimationActive={false} />
                <Tooltip formatter={(value, name, props) => [`${value} / ${props.payload.fullMark}`, props.payload.subject]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
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
          </div>
        </ReportSection>

        <ReportSection icon={<Building2 className="w-5 h-5 text-slate-700" />} title="Tau tinkančios profesijos">
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

        <div className="pt-8 flex flex-wrap justify-center gap-4 no-print">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors">
            <Download className="w-5 h-5" /> Atsisiųsti ataskaitą
          </button>
          <button onClick={onRestart} className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors px-6 py-3 rounded-xl hover:bg-slate-50">
            <RefreshCcw className="w-5 h-5" /> Pradėti iš naujo
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
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState({ A: 0, B: 0, C: 0, D: 0, E: 0 });
  const [history, setHistory] = useState([]);

  // For Multiselect
  const [selectedMulti, setSelectedMulti] = useState([]);

  // Aptitude state
  const [aptIdx, setAptIdx] = useState(0);
  const [aptAnswers, setAptAnswers] = useState(Array(APTITUDE_QUESTIONS.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(30);

  const dateStr = new Date().toLocaleDateString("lt-LT", { year: "numeric", month: "long", day: "numeric" });

  const startGame = () => {
    setCurrentIdx(0);
    setScores({ A: 0, B: 0, C: 0, D: 0, E: 0 });
    setHistory([]);
    setAptIdx(0);
    setAptAnswers(Array(APTITUDE_QUESTIONS.length).fill(null));
    setGameState("personality");
  };

  // -----------------------------------------------------
  // PERSONALITY LOGIC
  // -----------------------------------------------------
  const handleDynamicAnswer = (answerObj) => {
    // answerObj can be a single object {type: "A", score: 2} or an array of objects
    setHistory((prev) => [...prev, answerObj]);
    setScores((prev) => {
      const newScores = { ...prev };
      if (Array.isArray(answerObj)) {
        answerObj.forEach((item) => { newScores[item.type] += item.score; });
      } else {
        newScores[answerObj.type] += answerObj.score;
      }
      return newScores;
    });

    if (currentIdx + 1 < DYNAMIC_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedMulti([]); // Reset multiselect
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
        lastEntry.forEach((item) => { newScores[item.type] -= item.score; });
      } else {
        newScores[lastEntry.type] -= lastEntry.score;
      }
      return newScores;
    });
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIdx((prev) => prev - 1);
    setSelectedMulti([]);
  };

  const toggleMulti = (option) => {
    setSelectedMulti((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const submitMulti = () => {
    const answerArr = selectedMulti.map((opt) => ({ type: opt.t, score: 1 }));
    handleDynamicAnswer(answerArr);
  };

  // -----------------------------------------------------
  // APTITUDE LOGIC & TIMER
  // -----------------------------------------------------
  useEffect(() => {
    if (gameState === "aptitude") {
      setTimeLeft(30);
    }
  }, [gameState, aptIdx]);

  useEffect(() => {
    if (gameState !== "aptitude") return;
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      // Timeout reached
      handleAptitudeAnswer(-1);
    }
  }, [timeLeft, gameState]);

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

  // -----------------------------------------------------
  // RESULTS
  // -----------------------------------------------------
  const getWinner = () => {
    return Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
  };

  const getAptitudeSummary = () => {
    let correctTotal = 0;
    APTITUDE_QUESTIONS.forEach((q, i) => {
      if (aptAnswers[i] === q.correct) correctTotal += 1;
    });
    return { correctTotal };
  };

  const totalQuestions = DYNAMIC_QUESTIONS.length + APTITUDE_QUESTIONS.length;
  const stepNumber = gameState === "personality" ? currentIdx + 1 : gameState === "aptitude" ? DYNAMIC_QUESTIONS.length + aptIdx + 1 : totalQuestions;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col w-full h-full">
      <div className="bg-slate-900 px-4 py-4 md:px-8 text-white flex justify-between items-center z-10 sticky top-0 shadow-md no-print">
        <div className="flex items-center gap-3">
          <Compass className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
          <span className="font-bold tracking-wider text-lg md:text-xl">TIKSLIUKAI.LT</span>
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
              className="flex flex-col items-center justify-center flex-1 p-6 md:p-8 text-center space-y-8 max-w-4xl mx-auto w-full"
            >
              <div className="bg-slate-100 p-8 rounded-full inline-block shadow-inner ring-8 ring-slate-50">
                <span className="text-7xl">🧭</span>
              </div>
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-500 focus:outline-none text-lg text-center"
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

          {gameState === "personality" && (
            <motion.div key="quiz" className="flex flex-col flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:p-12 justify-center">
              <div className="mb-6 md:mb-10">
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
                <div className="w-full h-2 md:h-3 bg-slate-100 rounded-full overflow-hidden">
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
                className="flex-1 flex flex-col"
              >
                <div className="min-h-[140px] flex items-center justify-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    {DYNAMIC_QUESTIONS[currentIdx].q}
                  </h2>
                </div>

                <div className="mt-auto">
                  {/* LIKERT TYPE */}
                  {DYNAMIC_QUESTIONS[currentIdx].type === "likert" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button onClick={() => handleDynamicAnswer({ type: DYNAMIC_QUESTIONS[currentIdx].t, score: 2 })} className="p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-slate-600 hover:text-emerald-700 shadow-sm flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Visiškai sutinku
                      </button>
                      <button onClick={() => handleDynamicAnswer({ type: DYNAMIC_QUESTIONS[currentIdx].t, score: 1 })} className="p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-amber-500 hover:bg-amber-50 transition-all font-bold text-slate-600 hover:text-amber-700 shadow-sm flex items-center justify-center gap-2">
                        <HelpCircle className="w-5 h-5 text-amber-500" /> Iš dalies
                      </button>
                      <button onClick={() => handleDynamicAnswer({ type: DYNAMIC_QUESTIONS[currentIdx].t, score: 0 })} className="p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-rose-500 hover:bg-rose-50 transition-all font-bold text-slate-600 hover:text-rose-700 shadow-sm flex items-center justify-center gap-2">
                        <XCircle className="w-5 h-5 text-rose-500" /> Nesutinku
                      </button>
                    </div>
                  )}

                  {/* CHOICE TYPE */}
                  {DYNAMIC_QUESTIONS[currentIdx].type === "choice" && (
                    <div className="flex flex-col gap-3">
                      {DYNAMIC_QUESTIONS[currentIdx].options.map((opt, i) => (
                        <button key={i} onClick={() => handleDynamicAnswer({ type: opt.t, score: 1 })} className="p-4 md:p-5 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-500 hover:bg-slate-50 transition-all font-semibold text-slate-700 text-left shadow-sm">
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* MULTISELECT TYPE */}
                  {DYNAMIC_QUESTIONS[currentIdx].type === "multiselect" && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {DYNAMIC_QUESTIONS[currentIdx].options.map((opt, i) => {
                          const isSelected = selectedMulti.includes(opt);
                          return (
                            <button key={i} onClick={() => toggleMulti(opt)} className={`p-4 rounded-xl border-2 transition-all flex items-start gap-3 text-left ${isSelected ? "border-slate-800 bg-slate-800 text-white shadow-md" : "border-slate-100 bg-white text-slate-700 hover:border-slate-300"}`}>
                              <div className={`mt-0.5 rounded flex items-center justify-center shrink-0 w-5 h-5 border ${isSelected ? "border-white bg-white/20" : "border-slate-300"}`}>
                                {isSelected && <CheckSquare className="w-4 h-4 text-white" />}
                              </div>
                              <span className="font-medium text-sm md:text-base leading-snug">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                      <button onClick={submitMulti} disabled={selectedMulti.length === 0} className="w-full p-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                        Tęsti <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === "aptitude" && (
            <motion.div key="aptitude" className="flex flex-col flex-1 max-w-4xl mx-auto w-full px-4 py-6 md:p-12 justify-center">
              <div className="mb-6 md:mb-10">
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
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? "bg-rose-500" : "bg-slate-800"}`} style={{ width: `${(timeLeft / 30) * 100}%` }} />
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
                className="flex-1 flex flex-col"
              >
                <div className="min-h-[140px] flex items-center justify-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    {APTITUDE_QUESTIONS[aptIdx].q}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                  {APTITUDE_QUESTIONS[aptIdx].options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAptitudeAnswer(i)}
                      className="flex items-center justify-center p-5 md:p-6 rounded-2xl border-2 border-slate-100 bg-white hover:border-slate-500 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
                    >
                      <span className="font-bold text-base md:text-lg text-slate-700">{option}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === "result" && (
            <ResultsView
              result={RESULTS[getWinner()]}
              resultKey={getWinner()}
              scores={scores}
              aptitude={getAptitudeSummary()}
              respondentName={respondentName}
              dateStr={dateStr}
              onRestart={startGame}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

```
