"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Atom, Calculator, CalendarCheck, Check, ChevronDown, Compass, Copy, FlaskConical,
  Languages, Laptop, Leaf, Mail, Menu, MousePointerClick, Siren, Star, TrendingUp, Users, X,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { TEACHERS } from "@/lib/teachers";
import { SUBJECTS } from "@/lib/subjects";
import SiteFooter from "@/components/SiteFooter";

/* ---------- content ---------- */

const ICONS = { matematika: Calculator, fizika: Atom, chemija: FlaskConical, biologija: Leaf, it: Laptop, "anglu-k": Languages } as const;
const LESSONS = SUBJECTS.map((s) => ({ ...s, Icon: ICONS[s.slug] }));

const STEPS = [
  { Icon: MousePointerClick, title: "Pasirinkite dalyką", text: "Paspauskite norimą pamoką aukščiau." },
  { Icon: CalendarCheck, title: "Pažymėkite bent 5 laikus", text: "Kalendoriuje pažymėkite, kada mokiniui patogu mokytis." },
  { Icon: Mail, title: "Mokytojas susisiekia", text: "Mokytojas pasirenka laiką ir atsiunčia pamokos nuorodą el. paštu." },
];

const REVIEWS = [
  { text: "Vaiko pažymiai pagerėjo nuo 7 iki 9.", who: "mama Inga" },
  { text: "Sūnus gavo 90 iš matematikos VBE.", who: "tėtis Darius" },
  { text: "Matematikos baimė dingo po kelių pamokų.", who: "mokinys Lukas" },
  { text: "Mokytoja labai kantri ir motyvuojanti.", who: "mama Lina" },
  { text: "Chemija tapo suprantama.", who: "mokinė Emilija" },
  { text: "Vaikas pats noriai jungiasi į pamokas.", who: "mama Jolanta" },
];

const FAQ = [
  { q: "Kiek kainuoja pamoka?", a: "Viena individuali pamoka trunka 45 minutes ir kainuoja 25 €." },
  { q: "Kaip užsisakyti pamoką?", a: "Pasirinkite dalyką ir kalendoriuje pažymėkite bent 5 jums tinkamus laikus. Mokytojas pasirinks vieną iš jų ir el. paštu atsiųs savo kontaktus." },
  { q: "Kaip vyksta pamokos?", a: "Nuotoliu per Google Meet. Pamokos nuorodą mokytojas atsiųs el. paštu." },
  { q: "Kokių klasių mokiniams?", a: "1–12 klasių mokiniams, taip pat ruošiantis NMPP, PUPP ir VBE." },
  { q: "Kaip atsiskaityti?", a: "Bankiniu pavedimu. Rekvizitus rasite skiltyje „Pastoviems klientams“ šio puslapio apačioje." },
  { q: "Kas, jei mokytojas negali pravesti pamokos?", a: "Mokytojas praneš el. paštu ir pasiūlys naujų laikų. Jei tinkamo laiko nerasite, pamoką perduosime kitam mokytojui." },
  { q: "Kas, jei vėluosiu?", a: "Mokytojas palauks iki 10 minučių. Jei vėlavimas ilgesnis, pamoka atšaukiama, o pinigai negrąžinami." },
];

const EXTRAS = [
  { href: "/career_test", title: "Karjeros testas", text: "Padės pasirinkti egzaminus", Icon: Compass, badge: "Naujiena" },
  { href: "/grupines", title: "Grupinės pamokos", text: "Mokykitės kartu su kitais", Icon: Users },
  { href: "/akciju_birza", title: "Akcijų biržos žaidimas", text: "Sudėtinės palūkanos žaidžiant", Icon: TrendingUp },
  { href: "/games/games_2", title: "Night Run", text: "Lenktynių žaidimas", Icon: Siren },
];

const NAV = [
  { href: "#pamokos", label: "Pamokos" },
  { href: "#kaip", label: "Kaip tai veikia" },
  { href: "#apie-mus", label: "Apie mus" },
  { href: "#duk", label: "DUK" },
];

const IBAN = "LT077300010164121505";

/* ---------- page ---------- */

export default function Home() {
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

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {NAV.map((n) => <a key={n.href} href={n.href} className="hover:text-[#3B65CE]">{n.label}</a>)}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-24 rounded-lg bg-slate-100 animate-pulse" />
            ) : user ? (
              <>
                {dashboard && (
                  <Link href={dashboard} className="text-sm font-semibold px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                    Mano paskyra
                  </Link>
                )}
                <button onClick={logout} className="hidden sm:block text-sm px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100">
                  Atsijungti
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/log-in" className="hidden md:block text-sm px-3 py-2 text-slate-600 hover:text-[#3B65CE]">Prisijungti</Link>
                <a href="#pamokos" className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#3B65CE] text-white hover:bg-[#2f54b3]">
                  Užsisakyti
                </a>
              </>
            )}
            <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 -mr-2 text-slate-700" aria-label="Meniu">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu: full-screen sheet with big tap targets */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden">
          <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100">
            <span className="font-extrabold text-lg">Meniu</span>
            <button onClick={() => setMenuOpen(false)} className="p-2 -mr-2" aria-label="Uždaryti"><X size={24} /></button>
          </div>
          <nav className="flex flex-col px-4 py-4 text-lg font-semibold" onClick={() => setMenuOpen(false)}>
            {[...NAV, { href: "#daugiau", label: "Testai ir žaidimai" }, { href: "#bank-info", label: "Pastoviems klientams" }].map((n) => (
              <a key={n.href} href={n.href} className="py-4 border-b border-slate-100 flex justify-between items-center">
                {n.label} <ArrowRight size={18} className="text-slate-300" />
              </a>
            ))}
          </nav>
          <div className="mt-auto p-4 grid grid-cols-2 gap-3">
            {user ? (
              <>
                {dashboard && <Link href={dashboard} className="py-3 rounded-xl bg-[#3B65CE] text-white text-center font-semibold">Mano paskyra</Link>}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="py-3 rounded-xl border border-slate-200 font-semibold">Atsijungti</button>
              </>
            ) : (
              <>
                <Link href="/auth/log-in" className="py-3 rounded-xl border border-slate-200 text-center font-semibold">Prisijungti</Link>
                <Link href="/auth" className="py-3 rounded-xl bg-[#3B65CE] text-white text-center font-semibold">Registruotis</Link>
              </>
            )}
          </div>
        </div>
      )}

      <main>
        {/* ================= Hero ================= */}
        <section className="relative overflow-hidden bg-[#3B65CE] text-white">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 grid lg:grid-cols-2 gap-10 items-center relative">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-sm mb-5">
                <Star size={14} className="text-yellow-300 fill-yellow-300" />
                <span><b className="text-yellow-300">100+</b> pagerintų vidurkių</span>
              </div>
              <h1 className="text-[2.1rem] leading-[1.15] sm:text-5xl lg:text-6xl font-extrabold">
                Korepetitoriai, kurie{" "}
                <span className="inline-block bg-white text-[#3B65CE] px-3 rounded-xl -rotate-2">visada padės</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-blue-50/90 max-w-lg leading-relaxed">
                Individualios nuotolinės pamokos 1–12 klasių mokiniams. Pasirinkite dalyką ir laikus, o mokytojas susisieks pats.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <a href="#pamokos" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white text-[#3B65CE] text-lg font-bold shadow-lg hover:bg-blue-50">
                  Pasirinkti pamoką <ChevronDown size={20} />
                </a>
                <a href="#kaip" className="inline-flex items-center justify-center px-7 py-4 rounded-2xl border border-white/40 font-semibold hover:bg-white/10">
                  Kaip tai veikia?
                </a>
              </div>

              <ul className="mt-8 grid grid-cols-3 gap-2 text-center text-sm">
                {[["25 €", "už 45 min."], ["Google Meet", "nuotoliu"], ["1–12", "klasės"]].map(([a, b]) => (
                  <li key={a} className="rounded-xl bg-white/10 py-3 px-1">
                    <b className="block text-base sm:text-lg">{a}</b>
                    <span className="text-blue-100 text-xs sm:text-sm">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Photo only on large screens, so phones get straight to the point */}
            <div className="hidden lg:flex justify-end">
              <div className="relative w-full max-w-md aspect-[4/5] rounded-[2.5rem] overflow-hidden border-4 border-white/20 shadow-2xl rotate-2">
                <img
                  src="https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/Gemini_Generated_Image_kl5nq3kl5nq3kl5n.png"
                  alt="Mokinys mokosi"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-white p-4 rounded-2xl shadow-lg text-slate-900 flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full"><TrendingUp className="text-emerald-600 w-5 h-5" /></div>
                  <div>
                    <p className="font-bold text-sm">Vidurkis pakilo</p>
                    <p className="text-slate-500 text-xs">nuo 6,2 iki 9,4</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= Lessons ================= */}
        <section id="pamokos" className="scroll-mt-16 max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <SectionTitle kicker="Pamokos" title="Ką norite mokytis?" text="Paspauskite dalyką ir pasirinkite jums tinkamus laikus." />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {LESSONS.map(({ name, slug, note, Icon }) => (
              <Link
                key={slug}
                href={`/schedule/${slug}`}
                className="group rounded-2xl border border-slate-200 p-4 sm:p-6 hover:border-[#3B65CE] hover:shadow-lg active:scale-[0.98] transition"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#3B65CE] flex items-center justify-center mb-3 group-hover:bg-[#3B65CE] group-hover:text-white transition">
                  <Icon size={22} />
                </div>
                <p className="font-bold text-lg leading-tight">{name}</p>
                <p className="text-sm text-slate-500 mt-0.5">{note}</p>
                <p className="mt-3 text-sm font-semibold text-[#3B65CE] flex items-center gap-1">
                  Pasirinkti <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </p>
              </Link>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">Visos pamokos – <b className="text-slate-700">25 € už 45 min.</b></p>
        </section>

        {/* ================= How it works ================= */}
        <section id="kaip" className="scroll-mt-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <SectionTitle kicker="Kaip tai veikia" title="Trys paprasti žingsniai" />
            <ol className="grid md:grid-cols-3 gap-3 sm:gap-6">
              {STEPS.map(({ Icon, title, text }, i) => (
                <li key={title} className="flex md:flex-col gap-4 bg-white rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="relative shrink-0 w-12 h-12 rounded-full bg-[#3B65CE] text-white flex items-center justify-center">
                    <Icon size={22} />
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 text-slate-900 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{title}</p>
                    <p className="text-slate-600 mt-1">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ================= About + teachers ================= */}
        <section id="apie-mus" className="scroll-mt-16 max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <SectionTitle
            kicker="Apie mus"
            title="Mokytojai, kurie prisitaiko prie mokinio"
            text="Tiksliukai.lt – edukacinis projektas, kuriuo siekiame, kad kiekvienas mokinys Lietuvoje galėtų mokytis iš gerų mokytojų, nesvarbu, kur gyvena."
          />

          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto mb-10 text-center">
            {[["1000+", "pravestų pamokų"], ["100+", "laimingų šeimų"], [`${TEACHERS.length}`, "mokytojai"]].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-blue-50 py-4">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#3B65CE]">{n}</p>
                <p className="text-xs sm:text-sm text-slate-600">{l}</p>
              </div>
            ))}
          </div>

          <h3 id="korepetitoriai" className="scroll-mt-20 font-bold text-xl mb-4">Mūsų mokytojai</h3>
          {/* Swipe on phones, grid on desktop */}
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
            {TEACHERS.map((t) => (
              <article key={t.name} className="snap-start shrink-0 w-[80%] sm:w-auto rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center gap-4 mb-3">
                  <img src={t.img} alt={t.name} className="w-16 h-16 rounded-full object-cover bg-slate-100" loading="lazy" />
                  <div className="min-w-0">
                    <p className="font-bold leading-tight">{t.name}</p>
                    <p className="text-sm text-[#3B65CE] font-medium">{t.subject}</p>
                    <p className="text-xs text-slate-500">Patirtis: {t.experience}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{t.description}</p>
              </article>
            ))}
          </div>
          <p className="sm:hidden text-xs text-slate-400 mt-2 text-center">← Braukite, kad pamatytumėte daugiau →</p>
        </section>

        {/* ================= Reviews ================= */}
        <section className="bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
            <SectionTitle kicker="Atsiliepimai" title="Ką sako šeimos" />
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
              {REVIEWS.map((r) => (
                <figure key={r.text} className="snap-start shrink-0 w-[75%] sm:w-auto bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <blockquote className="text-slate-800">„{r.text}“</blockquote>
                  <figcaption className="text-sm text-slate-500 mt-2">– {r.who}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section id="duk" className="scroll-mt-16 max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <SectionTitle kicker="DUK" title="Dažniausi klausimai" />
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {FAQ.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.q}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-4 py-4 text-left font-semibold"
                  >
                    {f.q}
                    <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && <p className="pb-4 -mt-1 text-slate-600 leading-relaxed">{f.a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= Closing CTA ================= */}
        <section className="px-4 sm:px-6 pb-14">
          <div className="max-w-4xl mx-auto rounded-3xl bg-[#3B65CE] text-white text-center px-6 py-10 sm:py-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold">Pasiruošę pirmai pamokai?</h2>
            <p className="mt-2 text-blue-100">Užklausa nemokama ir neįpareigoja.</p>
            <a href="#pamokos" className="mt-6 inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white text-[#3B65CE] font-bold text-lg hover:bg-blue-50">
              Pasirinkti pamoką <ArrowRight size={20} />
            </a>
          </div>
        </section>

        {/* ================= Extras (kept small) ================= */}
        <section id="daugiau" className="scroll-mt-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-bold text-xl mb-4">Testai ir žaidimai</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {EXTRAS.map(({ href, title, text, Icon, badge }) => (
                <Link key={href} href={href} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-slate-200 hover:border-[#3B65CE]">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-[#3B65CE] flex items-center justify-center"><Icon size={20} /></div>
                  <div className="min-w-0">
                    <p className="font-semibold leading-tight flex items-center gap-2">
                      {title}
                      {badge && <span className="text-[10px] uppercase font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{badge}</span>}
                    </p>
                    <p className="text-sm text-slate-500">{text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ================= Regular clients: bank details ================= */}
        <section id="bank-info" className="scroll-mt-16 max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid md:grid-cols-2 gap-6 items-center rounded-3xl border border-slate-200 p-6 sm:p-8">
            <div>
              <h2 className="font-bold text-xl">Pastoviems klientams</h2>
              <p className="text-slate-600 mt-2">
                Jei turite pastovius pamokų laikus, galite iš anksto pervesti už susitartą pamokų skaičių (25 € už pamoką).
              </p>
            </div>
            <dl className="rounded-2xl bg-slate-50 p-5 text-sm space-y-2">
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Gavėjas</dt><dd className="font-semibold">Dovydas Žilinskas</dd></div>
              <div className="flex justify-between gap-3 items-center">
                <dt className="text-slate-500">IBAN</dt>
                <dd className="font-semibold flex items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm">{IBAN}</span>
                  <button onClick={copyIban} className="p-1.5 rounded-lg hover:bg-white" aria-label="Kopijuoti IBAN">
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
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

function SectionTitle({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
      <p className="text-sm font-bold uppercase tracking-widest text-[#3B65CE]">{kicker}</p>
      <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold leading-tight">{title}</h2>
      {text && <p className="mt-3 text-slate-600 leading-relaxed">{text}</p>}
    </div>
  );
}
