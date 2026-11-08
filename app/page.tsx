"use client";

/**
 * Landing page: subject picker, featured offers, how it works, tutors, reviews, FAQ.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Atom, Calculator, Check, ChevronDown, Compass, Copy, FlaskConical,
  Languages, Laptop, Leaf, Menu, Siren, TrendingUp, Users, X,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";
import { useTeachers } from "@/lib/useTeachers";
import { SUBJECTS } from "@/lib/subjects";
import SiteFooter from "@/components/SiteFooter";

/* ---------- content ---------- */

const ICONS = { matematika: Calculator, fizika: Atom, chemija: FlaskConical, biologija: Leaf, it: Laptop, "anglu-k": Languages } as const;
const LESSONS = SUBJECTS.map((s) => ({ ...s, Icon: ICONS[s.slug] }));

const STEPS = [
  { title: "Pasirinkite dalyką", text: "Paspauskite norimą pamoką puslapio viršuje." },
  { title: "Pažymėkite bent 5 laikus", text: "Kalendoriuje pažymėkite, kada mokiniui patogu mokytis." },
  { title: "Mokytojas susisiekia", text: "Mokytojas pasirenka laiką ir atsiunčia pamokos nuorodą el. paštu." },
];

/** Real messages from parents and students, saved from the Instagram "Atsiliepimai" highlight. */
const REVIEWS = [
  { src: "/reviews/atsiliepimas-1.webp", w: 880, h: 1000, alt: "TAMO dienyno ekrano nuotrauka su matematikos pažymiu 9 ir žinute: „Geriausia savaitgalio pradžia ever.“" },
  { src: "/reviews/atsiliepimas-3.webp", w: 860, h: 660, alt: "„Labai patiko, sakė, kad labai gerai išaiškinote.“ ir „Sveiki, sūnaus draugas Jus rekomendavo. Kai paklausiau, ką geriausiai paaiškina, sako viską!!“" },
  { src: "/reviews/atsiliepimas-2.webp", w: 880, h: 280, alt: "„Laba diena, labai dėkoju už operatyvumą ir nuostabaus mokytojo priskyrimą.“" },
  { src: "/reviews/atsiliepimas-5.webp", w: 880, h: 270, alt: "„Beje, konsultavosi gal su 3 korepetitoriais, Kajus liko pirmoje vietoje.“" },
  { src: "/reviews/atsiliepimas-4.webp", w: 880, h: 270, alt: "„Na panelė mano labai patenkinta pamoka. Susirašiau su jos mokytoju, atsiųs man kontrolinį darbą.“" },
];

const INSTAGRAM = "https://www.instagram.com/tiksliukai.lt/";


const FAQ = [
  { q: "Kiek kainuoja pamoka?", a: "Viena individuali pamoka trunka 45 minutes ir kainuoja 25 €." },
  { q: "Kaip užsisakyti pamoką?", a: "Pasirinkite dalyką ir kalendoriuje pažymėkite bent 5 jums tinkamus laikus. Mokytojas pasirinks vieną iš jų ir el. paštu atsiųs savo kontaktus." },
  { q: "Kaip vyksta pamokos?", a: "Nuotoliu per Google Meet. Pamokos nuorodą mokytojas atsiųs el. paštu." },
  { q: "Kokių klasių mokiniams?", a: "1–12 klasių mokiniams, taip pat ruošiantis NMPP, PUPP ir VBE." },
  { q: "Ar yra grupinių pamokų?", a: "Taip. Puslapyje „Grupinės pamokos“ galite užsiregistruoti į jus dominančią grupę." },
  { q: "Kaip atsiskaityti?", a: "Bankiniu pavedimu. Rekvizitus rasite skiltyje „Pastoviems klientams“ šio puslapio apačioje." },
  { q: "Kas, jei mokytojas negali pravesti pamokos?", a: "Mokytojas praneš el. paštu ir pasiūlys naujų laikų. Jei tinkamo laiko nerasite, pamoką perduosime kitam mokytojui." },
  { q: "Kas, jei vėluosiu?", a: "Mokytojas palauks iki 10 minučių. Jei vėlavimas ilgesnis, pamoka atšaukiama, o pinigai negrąžinami." },
];

/** Featured offers: shown in the top bar, the mobile menu and right under the hero. */
const FEATURED = [
  { href: "/grupines", title: "Grupinės pamokos", text: "Mokykitės kartu su kitais – užsiregistruokite į grupę.", Icon: Users },
  { href: "/career_test", title: "Karjeros testas", text: "Sužinokite, kurie egzaminai ir studijos jums tinka.", Icon: Compass },
];

const GAMES = [
  { href: "/akciju_birza", title: "Akcijų biržos žaidimas", text: "Sudėtinės palūkanos žaidžiant", Icon: TrendingUp },
  { href: "/games/games_2", title: "Night Run", text: "Lenktynių žaidimas", Icon: Siren },
];

const NAV: { href: string; label: string; Icon?: typeof Users }[] = [
  ...FEATURED.map(({ href, title, Icon }) => ({ href, label: title, Icon })),
  { href: "#kaip", label: "Kaip tai veikia" },
  { href: "#mokytojai", label: "Mokytojai" },
  { href: "#duk", label: "DUK" },
];

const IBAN = "LT077300010164121505";

/* ---------- page ---------- */

/** Landing page component. */
export default function Home() {
  const { teachers: TEACHERS, loading: teachersLoading } = useTeachers();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error) {
          setUser(user);
          const { data } = await supabase.from("users").select("role").eq("id", user.id).single();
          if (data) setUserRole(data.role);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        checkAuth();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserRole(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
  };

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(IBAN);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const dashboard = userRole === "tutor" ? "/tutor_dashboard" : userRole === "client" ? "/student_dashboard" : null;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* ================= Header ================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Tiksliukai.lt">
            <Image src="/logo-removebg-preview.png" alt="Tiksliukai" width={44} height={44} className="rounded-lg" />
            <span className="font-extrabold text-lg hidden sm:inline">Tiksliukai.lt</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {NAV.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className={`flex items-center gap-1.5 hover:text-brand ${Icon ? "text-slate-900 font-semibold" : ""}`}>
                {Icon && <Icon size={16} className="text-brand" />}
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-24 rounded-lg bg-slate-100 animate-pulse" />
            ) : user ? (
              <>
                {dashboard && (
                  <Link href={dashboard} className="text-sm font-semibold px-3 py-2 rounded-lg bg-brand text-white hover:bg-brand-strong">
                    Mano paskyra
                  </Link>
                )}
                <button onClick={logout} className="hidden sm:block text-sm px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
                  Atsijungti
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/log-in" className="hidden lg:block text-sm px-3 py-2 text-slate-600 hover:text-brand">Prisijungti</Link>
                <a href="#pamokos" className="text-sm font-semibold px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand-strong">
                  Užsisakyti
                </a>
              </>
            )}
            <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2 -mr-2 text-slate-700" aria-label="Meniu">
              <Menu size={24} />
            </button>
          </div>
        </div>
        {/* Phones/tablets: featured offers always one tap away */}
        <nav className="lg:hidden grid grid-cols-2 border-t border-slate-100 text-sm font-semibold">
          {FEATURED.map(({ href, title, Icon }) => (
            <Link key={href} href={href} className="flex items-center justify-center gap-1.5 py-2.5 hover:text-brand active:bg-brand-soft first:border-r first:border-slate-100">
              <Icon size={16} className="text-brand" /> {title}
            </Link>
          ))}
        </nav>
      </header>

      {/* Mobile menu: full-screen sheet with big tap targets */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col lg:hidden">
          <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100">
            <span className="font-extrabold text-lg">Meniu</span>
            <button onClick={() => setMenuOpen(false)} className="p-2 -mr-2" aria-label="Uždaryti"><X size={24} /></button>
          </div>
          <nav className="flex flex-col px-4 py-4 text-lg font-semibold overflow-y-auto" onClick={() => setMenuOpen(false)}>
            {[
              { href: "#pamokos", label: "Individualios pamokos" },
              ...NAV,
              { href: "#zaidimai", label: "Žaidimai" },
              { href: "#bank-info", label: "Pastoviems klientams" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="py-4 border-b border-slate-100 flex justify-between items-center">
                {label} <ArrowRight size={18} className="text-slate-400" />
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-4 grid grid-cols-2 gap-3">
            {user ? (
              <>
                {dashboard && <Link href={dashboard} className="py-3 rounded-xl bg-brand text-white text-center font-semibold">Mano paskyra</Link>}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="py-3 rounded-xl border border-slate-200 font-semibold">Atsijungti</button>
              </>
            ) : (
              <>
                <Link href="/auth/log-in" className="py-3 rounded-xl border border-slate-200 text-center font-semibold">Prisijungti</Link>
                <Link href="/auth" className="py-3 rounded-xl bg-brand text-white text-center font-semibold">Registruotis</Link>
              </>
            )}
          </div>
        </div>
      )}

      <main>
        {/* ================= Hero: the subject picker is the product, so it sits right here ================= */}
        <section className="bg-brand text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid lg:grid-cols-[1fr_minmax(0,30rem)] gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="text-[2.1rem] leading-[1.15] sm:text-5xl lg:text-[3.4rem] font-extrabold text-balance">
                Individualios pamokos nuotoliu&nbsp;– 25&nbsp;€ už 45&nbsp;min.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-blue-50 max-w-lg leading-relaxed text-pretty">
                Matematika, fizika, chemija, biologija, IT ir anglų k. 1–12 klasių mokiniams.
                Pažymėkite patogius laikus, o mokytojas susisieks pats.
              </p>

              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-50">
                {["Google Meet", "1–12 klasės", "NMPP, PUPP ir VBE"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><Check size={16} /> {t}</li>
                ))}
              </ul>

              <a href="#kaip" className="mt-7 hidden lg:inline-flex items-center gap-1.5 text-sm font-semibold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white">
                Kaip tai veikia? <ArrowRight size={16} />
              </a>
            </div>

            {/* outer radius 24px − padding 12px = inner radius 12px */}
            <div id="pamokos" className="scroll-mt-28 lg:scroll-mt-20 rounded-3xl bg-white text-slate-900 p-3 shadow-2xl">
              <div className="flex items-baseline justify-between px-3 pt-3 pb-4">
                <h2 className="text-xl sm:text-2xl font-extrabold">Ką norite mokytis?</h2>
                <span className="text-sm text-slate-500 tabular-nums">25 € / 45 min.</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LESSONS.map(({ name, slug, note, Icon }) => (
                  <Link
                    key={slug}
                    href={`/schedule/${slug}`}
                    className="group rounded-xl bg-brand-soft p-4 hover:bg-brand hover:text-white active:scale-[0.97] transition"
                  >
                    <Icon size={22} className="text-brand group-hover:text-white transition-colors" />
                    <p className="mt-3 font-bold text-lg leading-tight flex items-center justify-between gap-1">
                      {name}
                      <ArrowRight size={16} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
                    </p>
                    <p className="text-sm text-slate-600 group-hover:text-blue-50 mt-0.5 transition-colors">{note}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= Featured: group lessons + career test ================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {FEATURED.map(({ href, title, text, Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-5 sm:p-6 hover:border-brand hover:shadow-lg active:scale-[0.99] transition"
              >
                <div className="w-12 h-12 shrink-0 rounded-xl bg-brand-soft text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                  <Icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-lg leading-tight">{title}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{text}</p>
                </div>
                <ArrowRight size={20} className="shrink-0 text-brand group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
        </section>

        {/* ================= How it works ================= */}
        <section id="kaip" className="scroll-mt-16 max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <SectionTitle title="Pamoką užsisakysite per 3 žingsnius" />
          <ol className="grid md:grid-cols-3 gap-3 sm:gap-6">
            {STEPS.map(({ title, text }, i) => (
              <li key={title} className="flex md:flex-col gap-4 bg-slate-50 rounded-2xl p-5 sm:p-6">
                <span className="shrink-0 w-11 h-11 rounded-full bg-brand text-white text-lg font-extrabold flex items-center justify-center tabular-nums">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold text-lg">{title}</p>
                  <p className="text-slate-600 mt-1">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ================= Teachers ================= */}
        <section id="mokytojai" className="scroll-mt-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <SectionTitle
              title="Pamokas veda patyrę mokytojai"
              text="Tiksliukai.lt – edukacinis projektas, kuriuo siekiame, kad kiekvienas mokinys Lietuvoje galėtų mokytis iš gerų mokytojų, nesvarbu, kur gyvena."
            />

            <dl className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto mb-10 text-center">
              {[["1000+", "pravestų pamokų"], ["100+", "laimingų šeimų"], [teachersLoading ? null : `${TEACHERS.length}`, "mokytojai"]].map(([n, l]) => (
                <div key={l} className="rounded-2xl bg-white py-4 flex flex-col-reverse items-center">
                  <dt className="text-xs sm:text-sm text-slate-600">{l}</dt>
                  <dd className="text-2xl sm:text-3xl font-extrabold text-brand tabular-nums h-9 sm:h-10 flex items-center">
                    {n ?? <span className="block w-8 h-7 rounded-md bg-slate-200 animate-pulse" />}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Swipe on phones, grid on desktop */}
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
              {teachersLoading
                ? Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="snap-start shrink-0 w-[80%] sm:w-auto rounded-2xl bg-white p-5" aria-hidden>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-2/3 rounded bg-slate-200 animate-pulse" />
                          <div className="h-3 w-1/3 rounded bg-slate-200 animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 rounded bg-slate-100 animate-pulse" />
                        <div className="h-3 rounded bg-slate-100 animate-pulse" />
                        <div className="h-3 w-4/5 rounded bg-slate-100 animate-pulse" />
                      </div>
                    </div>
                  ))
                : TEACHERS.map((t) => (
                    <article key={t.name} className="snap-start shrink-0 w-[80%] sm:w-auto rounded-2xl bg-white p-5 animate-in fade-in duration-500">
                      <div className="flex items-center gap-4 mb-3">
                        <img src={t.img} alt={t.name} className="w-16 h-16 rounded-full object-cover bg-slate-100" loading="lazy" />
                        <div className="min-w-0">
                          <p className="font-bold leading-tight">{t.name}</p>
                          <p className="text-sm text-brand font-medium">{t.subject}</p>
                          <p className="text-xs text-slate-500">Patirtis: {t.experience}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{t.description}</p>
                    </article>
                  ))}
            </div>
            <p className="sm:hidden text-xs text-slate-500 mt-2 text-center">← Braukite, kad pamatytumėte daugiau →</p>
          </div>
        </section>

        {/* ================= Reviews: real Instagram messages ================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <SectionTitle title="Ką rašo tėvai ir mokiniai" text="Tikros žinutės, kurias gavome po pamokų." />
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-start sm:block sm:columns-2 lg:columns-3 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
            {REVIEWS.map((r) => (
              <figure key={r.src} className="snap-start shrink-0 w-[80%] sm:w-auto sm:mb-4 break-inside-avoid rounded-2xl overflow-hidden bg-black">
                <Image src={r.src} alt={r.alt} width={r.w} height={r.h} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 80vw" className="w-full h-auto" />
              </figure>
            ))}
          </div>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="mt-6 mx-auto w-fit flex items-center gap-2 text-sm font-semibold text-brand hover:underline underline-offset-4">
            <FaInstagram size={18} /> Daugiau atsiliepimų mūsų Instagram <ArrowRight size={16} />
          </a>
        </section>

        {/* ================= FAQ ================= */}
        <section id="duk" className="scroll-mt-16 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <SectionTitle title="Kaina, pamokos ir atsiskaitymas" />
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {FAQ.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q}>
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="w-full flex items-center justify-between gap-4 py-4 text-left font-semibold hover:text-brand"
                    >
                      {f.q}
                      <ChevronDown size={20} className={`shrink-0 text-slate-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                    </button>
                    {/* grid-rows 0fr → 1fr animates the height smoothly */}
                    <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} inert={!open}>
                      <p className="overflow-hidden text-slate-600 leading-relaxed">
                        <span className="block pb-4">{f.a}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= Closing CTA ================= */}
        <section className="px-4 sm:px-6 py-14">
          <div className="max-w-4xl mx-auto rounded-3xl bg-brand text-white text-center px-6 py-10 sm:py-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-balance">Pirmoji užklausa nemokama ir neįpareigoja</h2>
            <p className="mt-2 text-blue-50">Pasirinkite dalyką ir pažymėkite patogius laikus.</p>
            <a href="#pamokos" className="mt-6 inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white text-brand font-bold text-lg shadow-lg hover:bg-brand-soft active:scale-[0.98] transition">
              Pasirinkti pamoką <ArrowRight size={20} />
            </a>
          </div>
        </section>

        {/* ================= Games (kept small) ================= */}
        <section id="zaidimai" className="scroll-mt-16 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <h2 className="font-bold text-xl mb-4">Žaidimai</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {GAMES.map(({ href, title, text, Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl p-4 border border-slate-200 hover:border-brand transition-colors">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-soft text-brand flex items-center justify-center"><Icon size={20} /></div>
                <div className="min-w-0">
                  <p className="font-semibold leading-tight">{title}</p>
                  <p className="text-sm text-slate-500">{text}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ================= Regular clients: bank details ================= */}
        <section id="bank-info" className="scroll-mt-16 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <div className="grid md:grid-cols-2 gap-6 items-center rounded-3xl border border-slate-200 p-6 sm:p-8">
            <div>
              <h2 className="font-bold text-xl">Pastoviems klientams</h2>
              <p className="text-slate-600 mt-2">
                Jei turite pastovius pamokų laikus, galite iš anksto pervesti už susitartą pamokų skaičių (25 € už pamoką).
              </p>
            </div>
            {/* large padding around it, so the inner radius stays small */}
            <dl className="rounded-lg bg-slate-50 p-5 text-sm space-y-2">
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Gavėjas</dt><dd className="font-semibold">Dovydas Žilinskas</dd></div>
              <div className="flex justify-between gap-3 items-center">
                <dt className="text-slate-500">IBAN</dt>
                <dd className="font-semibold flex items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm tabular-nums">{IBAN}</span>
                  <button
                    onClick={copyIban}
                    className={`p-1.5 rounded-md transition-colors ${copied ? "bg-emerald-50" : "hover:bg-white"}`}
                    aria-label="Kopijuoti IBAN"
                  >
                    {copied
                      ? <Check size={14} className="text-emerald-600 animate-in zoom-in duration-200" />
                      : <Copy size={14} />}
                  </button>
                </dd>
              </div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Bankas</dt><dd className="font-semibold">Swedbank</dd></div>
            </dl>
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
    <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
      <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight text-balance">{title}</h2>
      {text && <p className="mt-3 text-slate-600 leading-relaxed text-pretty">{text}</p>}
    </div>
  );
}
