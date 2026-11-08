/**
 * /dienynas – page for schools: a modern e-diary with free analytics for teachers, administration
 * and parents. Showreel video, an interactive demo with fictional data, how the numbers are
 * calculated, FAQ and "Užsakyti demonstraciją" (opens an email to us).
 */

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, BookMarked, BookOpenCheck, CalendarCheck, CalendarDays, Check, ChevronDown, FileChartColumn, HeartHandshake,
  ListChecks, Lock, Mail, MessagesSquare, NotebookPen, Scale, School, ShieldCheck, Smartphone, Target,
} from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import Showreel from "@/components/dienynas/Showreel";
import DemoApp from "@/components/dienynas/DemoApp";
import BookDemo from "@/components/dienynas/BookDemo";
import { CONTACT_EMAIL } from "@/lib/site";

const NAV = [
  { href: "#demo", label: "Demo" },
  { href: "#kam", label: "Kam naudinga" },
  { href: "#metodika", label: "Kaip skaičiuojame" },
  { href: "#duk", label: "DUK" },
];

const AUDIENCES = [
  {
    id: "mokytojams",
    title: "Mokytojams",
    Icon: BookOpenCheck,
    points: [
      "Pusmečio pažymio prognozė kiekvienam mokiniui – su intervalu.",
      "Įspėjimas, kai mokinio pažymiai pradeda kristi, o ne pusmečio pabaigoje.",
      "Temos, kurių trūksta visai klasei, ir ką verta pakartoti.",
      "Kontrolinio užduočių analizė: per sunkios ir neaiškiai suformuluotos užduotys.",
    ],
  },
  {
    id: "administracijai",
    title: "Administracijai",
    Icon: School,
    points: [
      "Ar mokytojų rašomi pažymiai atitinka mokinių pasiekimus.",
      "Tos pačios temos testų sudėtingumas paraleliose klasėse.",
      "Klasių ir dalykų vidurkių žemėlapis – visa mokykla viename ekrane.",
      "Rizikos grupės ir lankomumas be rankinio skaičiavimo.",
    ],
  },
  {
    id: "tevams",
    title: "Tėvams",
    Icon: HeartHandshake,
    points: [
      "Įžvalgos paprasta kalba: kas gerėja, kas krenta ir kodėl.",
      "Tikėtinas pusmečio pažymys kiekvienam dalykui.",
      "Skaičiuoklė „Ko reikia norint gauti 8?“.",
      "Artimiausi kontroliniai ir neatlikti namų darbai.",
    ],
  },
] as const;

const FEATURES = [
  { Icon: BookMarked, title: "Pažymiai ir komentarai", text: "Pažymiai, įskaitos ir komentarai prie kiekvieno darbo." },
  { Icon: CalendarCheck, title: "Lankomumas", text: "Praleistos pamokos, vėlavimai ir pateisinimai vienoje vietoje." },
  { Icon: NotebookPen, title: "Namų darbai", text: "Užduotys su terminais, kurias mato mokiniai ir tėvai." },
  { Icon: CalendarDays, title: "Tvarkaraštis", text: "Pamokos, atsiskaitymai ir pavadavimai viename kalendoriuje." },
  { Icon: MessagesSquare, title: "Žinutės", text: "Susirašinėjimas tarp mokytojų, tėvų ir administracijos." },
  { Icon: FileChartColumn, title: "Ataskaitos", text: "Pusmečio ir metų suvestinės vienu paspaudimu." },
  { Icon: Smartphone, title: "Telefone ir kompiuteryje", text: "Patogu naudoti bet kuriame įrenginyje." },
  { Icon: Lock, title: "Prieigos teisės", text: "Kiekvienas mato tik tai, ką jam reikia matyti." },
];

const METHODS = [
  {
    Icon: Target,
    title: "Pažymio prognozė",
    text: "Imame visus mokinio pažymius: naujesni sveria daugiau, įvertiname kryptį – kyla ar krenta. Rodome intervalą, o ne vieną skaičių, nes ateitis nėra tiksli. Galutinį pažymį visada rašo mokytojas.",
  },
  {
    Icon: Scale,
    title: "Testų sudėtingumas",
    text: "Testo vidurkį lyginame su tuo, ko tikėtumėmės iš tų pačių mokinių pagal jų kitų dalykų ir NMPP rezultatus. Taip stipresnė klasė neatrodo kaip „lengvesni testai“, o silpnesnė – kaip „griežtas mokytojas“.",
  },
  {
    Icon: ListChecks,
    title: "Užduočių analizė",
    text: "Kiekvienai kontrolinio užduočiai skaičiuojame, kiek taškų surinkta ir ar ji atskiria stipresnius mokinius nuo silpnesnių (skiriamoji geba). Taip išryškėja per sunkios ir neaiškiai suformuluotos užduotys.",
  },
];

const FAQ = [
  { q: "Ar analitika tikrai nemokama?", a: "Taip. Analitika mokytojams, administracijai ir tėvams – nemokama, papildomų modulių pirkti nereikia." },
  { q: "Ar prognozė gali pakeisti mokytojo vertinimą?", a: "Ne. Prognozė – tik orientyras, kuris padeda laiku pastebėti, kam reikia pagalbos. Pažymius rašo ir galutinį sprendimą priima mokytojas." },
  { q: "Kaip lyginamas mokytojų testų sudėtingumas?", a: "Lyginami to paties dalyko testai, o vidurkis vertinamas atsižvelgiant į tų pačių mokinių kitų dalykų ir NMPP rezultatus. Todėl stipresnė ar silpnesnė klasė rezultato neiškreipia. Mažai duomenų turintys mokytojai ir testai lyginimuose nerodomi." },
  { q: "Kas mato mokytojų palyginimus?", a: "Tik mokyklos administracija ir pats mokytojas – savo rodiklius. Kiti mokytojai, mokiniai ir tėvai jų nemato." },
  { q: "Ar demonstracijoje rodomi tikri duomenys?", a: "Ne. Visi vardai, pažymiai ir mokytojai šiame puslapyje išgalvoti." },
  { q: "Kaip užsisakyti demonstraciją?", a: `Užpildykite formą šio puslapio apačioje arba parašykite ${CONTACT_EMAIL}. Parodysime, kaip dienynas veiktų jūsų mokykloje, ir atsakysime į klausimus.` },
];

export default function DienynasPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* ================= Header ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Tiksliukai.lt – pradžia">
            <Image src="/logo-removebg-preview.png" alt="" width={40} height={40} className="rounded-lg" />
            <span className="leading-tight">
              <span className="block font-extrabold">Tiksliukai.lt</span>
              <span className="block text-xs font-medium text-slate-500">Dienynas mokykloms</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            {NAV.map((n) => <a key={n.href} href={n.href} className="hover:text-brand">{n.label}</a>)}
          </nav>
          <a href="#uzsakyti" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong">
            <span className="sm:hidden">Užsakyti demo</span>
            <span className="hidden sm:inline">Užsakyti demonstraciją</span>
          </a>
        </div>
      </header>

      <main>
        {/* ================= Hero ================= */}
        <section className="bg-brand text-white">
          <div className="mx-auto max-w-4xl px-4 pt-12 pb-36 text-center sm:px-6 sm:pt-16 sm:pb-48">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-blue-50 ring-1 ring-white/20">
              <School size={16} aria-hidden /> Mokykloms
            </p>
            <h1 className="mt-5 text-[2.1rem] font-extrabold leading-[1.12] text-balance sm:text-5xl lg:text-[3.4rem]">
              Modernus elektroninis dienynas su nemokama analitika
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-blue-50 text-pretty sm:text-lg">
              Pažymiai, lankomumas, namų darbai ir žinutės – kaip įprastame dienyne. O be to mokytojai mato, ko trūksta klasei,
              administracija – ar visi vertina vienodai, o tėvai – kur vaikui reikia pagalbos ir koks bus pusmečio pažymys.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="#uzsakyti" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-lg font-bold text-brand shadow-lg hover:bg-brand-soft active:scale-[0.98] transition">
                Užsakyti demonstraciją <ArrowRight size={20} aria-hidden />
              </a>
              <a href="#demo" className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-lg font-bold text-white ring-1 ring-white/40 hover:bg-white/10 transition">
                Išbandyti demo
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-blue-50">
              {["Analitika – nemokamai", "Mokytojams, administracijai ir tėvams", "Telefone ir kompiuteryje"].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check size={16} aria-hidden /> {t}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ================= Showreel ================= */}
        <section aria-label="Vaizdo įrašas" className="mx-auto -mt-28 max-w-5xl px-4 sm:-mt-40 sm:px-6">
          <Showreel
            src="/dienynas/showreel.mp4"
            poster="/dienynas/showreel-poster.jpg"
            title="Kaip veikia dienyno analitika: mokytojo, administracijos ir tėvų vaizdai"
            address="tiksliukai.lt/dienynas"
          />
          <p className="mt-3 text-center text-sm text-slate-500">Trumpa apžvalga · be garso</p>
        </section>

        {/* ================= Interactive demo ================= */}
        <section id="demo" className="scroll-mt-16 mx-auto max-w-6xl px-3 py-14 sm:px-6 sm:py-20">
          <SectionTitle
            title="Išbandykite patys"
            text="Pasirinkite, kieno akimis žiūrėti, ir paspaudinėkite: mokinius, mokytojus, dalykus. Visi vardai ir pažymiai išgalvoti."
          />
          <DemoApp />
        </section>

        {/* ================= Who gets what ================= */}
        <section id="kam" className="scroll-mt-16 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <SectionTitle title="Kiekvienas mato tai, kas jam svarbu" />
            <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
              {AUDIENCES.map(({ id, title, Icon, points }) => (
                <article key={id} className="flex flex-col rounded-2xl bg-white p-5 sm:p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon size={24} aria-hidden /></div>
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <ul className="mt-3 flex-1 space-y-2.5 text-slate-600">
                    {points.map((p) => (
                      <li key={p} className="flex gap-2 leading-relaxed">
                        <Check size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {p}
                      </li>
                    ))}
                  </ul>
                  <a href={`#demo-${id}`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline underline-offset-4">
                    Žiūrėti demo <ArrowRight size={16} aria-hidden />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= Everyday diary features ================= */}
        <section id="galimybes" className="scroll-mt-16 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionTitle title="Viskas, ko reikia kasdien" text="Įprasto dienyno funkcijos – be papildomų mokesčių už analitiką." />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {FEATURES.map(({ Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 p-5 sm:flex-col">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon size={22} aria-hidden /></div>
                <div>
                  <p className="font-bold">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= Methodology & trust ================= */}
        <section id="metodika" className="scroll-mt-16 bg-slate-900 text-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
              <h2 className="text-2xl font-extrabold leading-tight text-balance sm:text-4xl">Skaičiai, kuriais galima pasitikėti</h2>
              <p className="mt-3 leading-relaxed text-slate-300 text-pretty">Kiekvienas rodiklis paaiškinamas paprastai, o ne slepiamas „juodojoje dėžėje“.</p>
            </div>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
              {METHODS.map(({ Icon, title, text }) => (
                <article key={title} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-6">
                  <Icon size={26} className="text-blue-300" aria-hidden />
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-300">{text}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 flex gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-6">
              <ShieldCheck size={26} className="shrink-0 text-blue-300" aria-hidden />
              <div className="leading-relaxed text-slate-300">
                <p className="font-bold text-white">Kas ką mato</p>
                <p className="mt-1">
                  Tėvai mato tik savo vaiko duomenis. Mokytojų palyginimus mato administracija ir pats mokytojas. Klasės vidurkiai rodomi be mokinių vardų.
                  Analitika skirta laiku pastebėti, kam reikia pagalbos, ir susitarti dėl vienodų vertinimo kriterijų – ne baudimui.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section id="duk" className="scroll-mt-16 mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <SectionTitle title="Dažni klausimai" />
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {FAQ.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold hover:text-brand [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown size={20} className="shrink-0 text-slate-500 transition-transform duration-300 group-open:rotate-180" aria-hidden />
                </summary>
                <p className="pb-4 leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ================= Book a demo ================= */}
        <section id="uzsakyti" className="scroll-mt-16 bg-brand-soft">
          <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-12">
            <div className="lg:pt-4">
              <h2 className="text-3xl font-extrabold leading-tight text-balance sm:text-4xl">Užsakykite demonstraciją</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600 text-pretty">
                Parodysime, kaip dienynas ir analitika veiktų jūsų mokykloje, ir atsakysime į visus klausimus. Demonstracija nemokama ir neįpareigoja.
              </p>
              <ul className="mt-6 space-y-3 text-slate-700">
                {["Mokytojo, administracijos ir tėvų vaizdai", "Kaip skaičiuojamos prognozės ir palyginimai", "Kaip pradėti naudotis jūsų mokykloje"].map((t) => (
                  <li key={t} className="flex gap-2.5"><Check size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {t}</li>
                ))}
              </ul>
              <div className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Arba rašykite tiesiogiai</p>
                <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Dienyno demonstracija")}`} className="mt-1 inline-flex items-center gap-2 text-lg font-bold text-brand hover:underline underline-offset-4">
                  <Mail size={20} aria-hidden /> {CONTACT_EMAIL}
                </a>
              </div>
            </div>
            <BookDemo />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Centered section heading with optional subtitle. */
function SectionTitle({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
      <h2 className="text-2xl font-extrabold leading-tight text-balance sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 leading-relaxed text-slate-600 text-pretty">{text}</p>}
    </div>
  );
}
