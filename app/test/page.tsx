// ============================================================================
// 1) ADD THESE IMPORTS to the top of your quiz file
//    (merge Lock / ChevronDown / ChevronUp into your existing lucide-react import)
// ============================================================================
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Lock, ChevronDown, ChevronUp } from "lucide-react";
// also make sure your React import includes useRef:  import { useState, useEffect, useRef } from "react";
import CheckoutForm from "../../components/CheckoutForm"; // <- adjust path to where this page lives

// ============================================================================
// 2) ADD THESE CONSTANTS (below your data/types)
// ============================================================================
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const CONSULTATION_PRICE = 65; // must match /api/create-payment-intent for 'career_test'
const CONTACT_EMAIL = "info.tiksliukai@gmail.com";
const BRAND_BLUE = "#5170FF";
// Where Stripe sends the user after paying (the landing page shows the "Ačiū, konsultacija apmokėta" banner).
// NOTE: the quiz state lives in memory, so returning to the quiz page would lose the results.
const CONSULTATION_RETURN_PATH = "/"; // <- set to your landing page path

// ============================================================================
// 3) ADD THESE COMPONENTS (above ResultsView)
// ============================================================================

function PaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen && !clientSecret) {
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_type: "career_test" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setClientSecret(data.clientSecret);
        })
        .catch((err) => {
          console.error(err);
          setError("Nepavyko inicijuoti mokėjimo. Bandykite vėliau.");
        });
    }
  }, [isOpen, clientSecret]);

  if (!isOpen) return null;

  const appearance = {
    theme: "stripe" as const,
    variables: { colorPrimary: BRAND_BLUE, borderRadius: "8px", fontSizeBase: "15px", fontFamily: "ui-sans-serif, system-ui, sans-serif" },
  };

  const returnUrl =
    typeof window !== "undefined" ? `${window.location.origin}${CONSULTATION_RETURN_PATH}?paid=consultation` : "";

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4 no-print">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-4xl rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-200">
        <button onClick={onClose} className="md:hidden absolute top-4 right-4 z-20 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200" aria-label="Uždaryti">
          <X size={18} />
        </button>

        {/* LEFT: summary */}
        <div className="bg-slate-900 text-white md:w-2/5 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="p-6 md:p-8 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-semibold tracking-wide text-slate-200 mb-2 md:mb-6">Užsakymo suvestinė</h3>
              <div className="flex justify-between items-end mb-4 md:hidden">
                <span className="text-slate-400 font-medium text-sm">Suma:</span>
                <span className="text-2xl font-semibold">{CONSULTATION_PRICE.toFixed(2)} €</span>
              </div>
              <button onClick={() => setShowDetails(!showDetails)} className="flex items-center gap-1 text-slate-300 text-xs font-semibold uppercase tracking-wider md:hidden mb-4">
                {showDetails ? "Slėpti detales" : "Kas įeina"}
                {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <div className={`${showDetails ? "block" : "hidden"} md:block bg-slate-800/80 p-5 rounded-xl border border-slate-700/60`}>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: BRAND_BLUE }}>Asmeninė konsultacija</span>
                <p className="font-semibold text-base leading-snug mt-1">Karjeros testo rezultatų aptarimas</p>
                <ul className="mt-4 space-y-2.5 text-xs text-slate-300 leading-relaxed">
                  <li className="pl-3 border-l-2 border-slate-700">Pokalbis su karjeros konsultantu.</li>
                  <li className="pl-3 border-l-2 border-slate-700">Pilnas 10+ geriausiai tinkančių krypčių sąrašas su paaiškinimais.</li>
                  <li className="pl-3 border-l-2 border-slate-700">Individualus VBE ir studijų planas.</li>
                  <li className="pl-3 font-medium text-slate-200" style={{ borderLeft: `2px solid ${BRAND_BLUE}` }}>
                    Atsakymai į jūsų klausimus apie specialybes ir stojimą.
                  </li>
                </ul>
              </div>
              <div className="mt-5 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-white">Po apmokėjimo:</span> parašykite el. paštu{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2" style={{ color: BRAND_BLUE }}>{CONTACT_EMAIL}</a>{" "}
                ir suderinsime jums tinkamą susitikimo laiką.
              </div>
            </div>
            <div className="hidden md:block mt-6 pt-6 border-t border-slate-800">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 text-sm font-medium">Iš viso:</span>
                <span className="text-3xl font-semibold">{CONSULTATION_PRICE.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Stripe */}
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
          <button onClick={onClose} className="hidden md:block absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full z-10" aria-label="Uždaryti">
            <X size={18} />
          </button>
          <div className="overflow-y-auto p-6 md:p-8 h-full pb-20 md:pb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Apmokėjimas</h2>
            <p className="text-slate-500 text-xs mb-6">Saugus atsiskaitymas. Patvirtinimą gausite iškart po apmokėjimo.</p>
            {!clientSecret && !error && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2" style={{ borderBottomColor: BRAND_BLUE }} />
              </div>
            )}
            {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-4 text-xs">{error}</div>}
            {clientSecret && (
              <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                <CheckoutForm returnUrl={returnUrl} />
              </Elements>
            )}
            <div className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              256-bit SSL šifruotas mokėjimas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Blurs its children and shows an unlock overlay on top.
// If someone removes the blur (e.g. via devtools), onHack fires.
function LockedBlock({ onUnlock, onHack, label = "Atrakinti su konsultacija", children }: { onUnlock: () => void; onHack: () => void; label?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new MutationObserver(() => {
      if (getComputedStyle(el).filter === "none") {
        onHack();
        obs.disconnect();
      }
    });
    obs.observe(el, { attributes: true, attributeFilter: ["class", "style"] });
    return () => obs.disconnect();
  }, [onHack]);

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div ref={ref} className="blur-md select-none pointer-events-none opacity-80" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/40 no-print">
        <div className="p-3 bg-slate-900 text-white rounded-full shadow-lg"><Lock className="w-5 h-5" /></div>
        <button
          onClick={onUnlock}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: BRAND_BLUE }}
        >
          {label}
        </button>
      </div>
    </div>
  );
}

function EasterEggPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="text-5xl mb-4">💻</div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Šaunuolis, tau tikrai programavimas!
        </h3>
        <p className="text-slate-600 text-sm mb-6">Radai paslaptį. Dabar aptarkime, kaip paversti šį talentą karjera.</p>
        <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-white font-bold" style={{ backgroundColor: BRAND_BLUE }}>
          Gerai 😎
        </button>
      </div>
    </div>
  );
}

function ConsultationCard({ onBook }: { onBook: () => void }) {
  return (
    <div className="bg-white rounded-2xl border-2 p-6 md:p-8 no-print" style={{ borderColor: BRAND_BLUE }}>
      <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: BRAND_BLUE }}>Po testo</div>
      <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-2" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        Testas parodo kryptis. Konsultacija padeda pasirinkti.
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-6">
        Atrakinkite pilną ataskaitą: studijų kryptis, VBE reikalavimus ir visas jums tinkančias profesijas.
      </p>

      <div className="flex items-end justify-between border-b border-slate-100 pb-5 mb-5">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">Asmeninė konsultacija</h4>
          <p className="text-slate-500 text-xs mt-1">Vienkartinis mokėjimas</p>
        </div>
        <div className="text-3xl font-bold text-slate-900">{CONSULTATION_PRICE} €</div>
      </div>

      <ul className="space-y-3 mb-6">
        {[
          "Rezultatų aptarimas su karjeros konsultantu",
          "Pilnas 10+ geriausiai tinkančių krypčių sąrašas su paaiškinimais",
          "Individualus VBE ir studijų planas",
          "Atsakymai į jūsų klausimus apie specialybes ir stojimą",
        ].map((item, i) => (
          <li key={i} className="pl-3 text-slate-700 text-sm leading-relaxed border-l-2 border-slate-200">{item}</li>
        ))}
      </ul>

      <button onClick={onBook} className="w-full text-white px-8 py-4 rounded-xl font-medium text-base hover:opacity-90 transition-opacity" style={{ backgroundColor: BRAND_BLUE }}>
        Užsakyti konsultaciją ({CONSULTATION_PRICE} €)
      </button>
    </div>
  );
}

// ============================================================================
// 4) REPLACE your existing ResultsView with this one
// ============================================================================
function ResultsView({ result, resultKey, scores, aptitude, respondentName, dateStr, onRestart }) {
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const openCheckout = () => setIsCheckoutOpen(true);
  const [showEgg, setShowEgg] = useState(false);
  const triggerEgg = () => setShowEgg(true);

  useEffect(() => {
    console.log("%cEi, žiūrovai 👀", "font-size:20px;font-weight:bold;color:#5170FF");
    console.log("Matau, kad domiesi, kaip viskas veikia. Pabandyk pašalinti „blur“ klasę 😉");
  }, []);

  const overallPct = Math.round((aptitude.correctTotal / APTITUDE_QUESTIONS.length) * 100);
  const band = getAptitudeBand(overallPct);

  const radarData = Object.keys(DIMENSION_SHORT).map((key) => ({
    subject: DIMENSION_SHORT[key],
    key,
    score: scores[key],
    fullMark: MAX_PER_DIMENSION[key],
  }));
  const radarMax = Math.max(...Object.values(MAX_PER_DIMENSION));

  const topProfessions = result.professions.slice(0, 3);
  const lockedProfessions = result.professions.slice(3, 9);

  return (
    <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-y-auto report-scroll bg-white">
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
      <PaymentModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      {showEgg && <EasterEggPopup onClose={() => setShowEgg(false)} />}

      {/* HEADER */}
      <div className="p-6 md:p-12 border-b border-slate-200">
        <div className="flex justify-between items-start flex-wrap gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 rounded-lg text-white"><Compass className="w-6 h-6" /></div>
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
        {/* ---------- FREE: summary ---------- */}
        <ReportSection icon={<Compass className="w-5 h-5 text-slate-700" />} title="Rezultatų santrauka">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 md:p-8">
            <span className="inline-block py-1 px-3 rounded-full bg-slate-800 text-white text-xs font-bold tracking-widest uppercase mb-4">Tavo karjeros tipas</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">{result.title}</h2>
            <p className="text-slate-700 text-base md:text-lg leading-relaxed">{result.summary}</p>
          </div>
        </ReportSection>

        {/* ---------- FREE: traits ---------- */}
        <ReportSection icon={<Star className="w-5 h-5 text-slate-700" />} title="Asmenybės bruožai">
          <p className="text-slate-700 text-base leading-relaxed mb-6">{buildTraitNarrative(result)}</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100">
              <h4 className="text-emerald-800 font-bold mb-3 text-sm uppercase tracking-wide">Stipriosios savybės</h4>
              <div className="flex flex-wrap gap-2">
                {result.positives.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white text-emerald-900 text-sm font-semibold rounded-lg border border-emerald-200">{item}</span>
                ))}
              </div>
            </div>
            <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-100">
              <h4 className="text-rose-800 font-bold mb-3 text-sm uppercase tracking-wide">Augimo zonos</h4>
              <div className="flex flex-wrap gap-2">
                {result.negatives.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white text-rose-900 text-sm font-semibold rounded-lg border border-rose-200">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </ReportSection>

        {/* ---------- FREE: top 3 professions ---------- */}
        <ReportSection icon={<Building2 className="w-5 h-5 text-slate-700" />} title="3 tau tinkančios profesijos">
          <p className="text-xs text-slate-500 mb-4 flex items-center gap-1 no-print">
            <Info className="w-3.5 h-3.5" /> Paspausk kortelę informacijai
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topProfessions.map((prof, i) => (
              <div
                key={i}
                onClick={() => setSelectedProfession(prof)}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-full"
              >
                <h4 className="font-bold text-base text-slate-800 mb-2">{prof.title}</h4>
                <span className="text-xs font-extrabold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 self-start">{prof.salary}</span>
              </div>
            ))}
          </div>

          {/* Locked: remaining professions */}
          {lockedProfessions.length > 0 && (
            <div className="mt-6">
              <LockedBlock onUnlock={openCheckout} onHack={triggerEgg} label={`Atrakinti dar ${result.professions.length - 3} profesijų`}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {lockedProfessions.map((prof, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-base text-slate-800 mb-2">{prof.title}</h4>
                      <span className="text-xs font-extrabold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">{prof.salary}</span>
                    </div>
                  ))}
                </div>
              </LockedBlock>
            </div>
          )}
        </ReportSection>

        {/* ---------- LOCKED: scholarship / studies (title visible) ---------- */}
        <ReportSection icon={<GraduationCap className="w-5 h-5 text-slate-700" />} title="Studijų kryptys, Egzaminai ir LAMA BPO kriterijai">
          <LockedBlock onUnlock={openCheckout} onHack={triggerEgg}>
            <div className="space-y-6">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
                <h5 className="font-bold text-amber-900 text-sm uppercase tracking-wide mb-1">LAMA BPO bendrieji stojimo reikalavimai</h5>
                <p className="text-amber-800 text-xs font-semibold mb-3">{LAMA_BPO_GENERAL_INFO.mandatoryNotice}</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-amber-800">
                  {LAMA_BPO_GENERAL_INFO.minCriteria.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                  <h5 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wide">Šios krypties VBE</h5>
                  <p className="text-slate-700 text-sm">{result.exams}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                  <h5 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Universitetai Lietuvoje</h5>
                  <ul className="space-y-2">
                    {result.uniLt.map((u, i) => (
                      <li key={i} className="flex justify-between text-sm"><span>{u.name}</span><span className="text-xs font-bold">{u.score}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                  <h5 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wide">Universitetai Europoje</h5>
                  <p className="text-sm text-slate-700">{result.uniEu}</p>
                </div>
              </div>
            </div>
          </LockedBlock>
        </ReportSection>

        {/* ---------- BOOK A CONSULTATION ---------- */}
        <div className="pt-6">
          <ConsultationCard onBook={openCheckout} />
        </div>

        <div className="pt-8 flex flex-wrap justify-center gap-4 no-print">
          <button onClick={onRestart} className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors px-6 py-3 rounded-xl hover:bg-slate-50">
            <RefreshCcw className="w-5 h-5" /> Pradėti iš naujo
          </button>
        </div>
      </div>
    </motion.div>
  );
}
