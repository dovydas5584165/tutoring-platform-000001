'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { 
  Target, 
  GraduationCap, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Star, 
  ShieldCheck,
  Lock,
  X,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Compass,
  AlertTriangle,
  Mail,
  Gift,
  CreditCard,
  ClipboardCheck,
  CalendarCheck,
  Award,
  MessageSquare,
  Briefcase
} from 'lucide-react';

// IMPORT CHECKOUT FORM (Up 2 levels)
import CheckoutForm from '../../components/CheckoutForm'; 

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// CONFIGURATION
const PRODUCT_PRICE = 14;
const CONTACT_EMAIL = 'info.tiksliukai@gmail.com';

// MOBILE OPTIMIZED PAYMENT MODAL COMPONENT
function PaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false); 

  useEffect(() => {
    if (isOpen && !clientSecret) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_type: 'career_test' }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setClientSecret(data.clientSecret);
        })
        .catch((err) => {
          console.error(err);
          setError('Nepavyko inicijuoti mokėjimo. Bandykite vėliau.');
        });
    }
  }, [isOpen, clientSecret]);

  if (!isOpen) return null;

  const appearance = {
    theme: 'stripe' as const,
    variables: { 
      colorPrimary: '#0f172a', 
      borderRadius: '8px', 
      fontSizeBase: '15px',
      fontFamily: "'Aileron', 'Garet', ui-sans-serif, system-ui, sans-serif"
    },
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4" style={{ fontFamily: "'Aileron', 'Garet', sans-serif" }}>
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-4xl rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all transform border border-slate-200">
        
        <button 
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 z-20 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <X size={18} />
        </button>

        {/* LEFT SIDE (SUMMARY) */}
        <div className="bg-slate-900 text-white md:w-2/5 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="p-6 md:p-8 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-semibold tracking-wide text-slate-200 mb-2 md:mb-6 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> Užsakymo suvestinė
              </h3>
              
              <div className="flex justify-between items-end mb-4 md:hidden">
                 <span className="text-slate-400 font-medium text-sm">Suma:</span>
                 <span className="text-2xl font-semibold text-white">{PRODUCT_PRICE.toFixed(2)} €</span>
              </div>

              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-slate-300 text-xs font-semibold uppercase tracking-wider md:hidden mb-4"
              >
                {showDetails ? 'Slėpti detales' : 'Ataskaitos sudėtis'}
                {showDetails ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              </button>

              <div className={`${showDetails ? 'block' : 'hidden'} md:block bg-slate-800/80 p-5 rounded-xl border border-slate-700/60 shadow-inner transition-all`}>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Aukščiausio lygio diagnostika</span>
                <p className="font-semibold text-white text-base leading-snug mt-1">Karjeros testas: Individualizuota asmenybės analizė, tinkančių profesijų sąrašas ir ateities studijų planas.</p>
                <ul className="mt-4 space-y-3 text-xs text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5"/> 
                    <span>Profesionalus profilis: Gausite detalų psichologinį savo stiprybių ir silpnybių aprašymą.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5"/> 
                    <span>Karjeros planas: 10+ konkrečių profesijų, kurios labiausiai atitinka tavo duomenis.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5"/> 
                    <span>Studijų žemėlapis: Rekomendacijos, kur stoti Lietuvoje ir Europoje bei kokių egzaminų reikės.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Award size={15} className="text-emerald-400 shrink-0 mt-0.5"/> 
                    <span className="font-medium text-slate-200">Komunikacijos gidas: Patarimai, kaip tavo asmenybės tipui geriausia bendrauti ir dirbti komandoje.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-5 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-white">Konsultacija:</span> Po vertinimo susisiekite el. paštu{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
                  {CONTACT_EMAIL}
                </a>{' '}
                dėl individualaus susitikimo laiko suderinimo.
              </div>
            </div>

            <div className="hidden md:block mt-6 pt-6 border-t border-slate-800">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 text-sm font-medium">Iš viso:</span>
                <span className="text-3xl font-semibold text-white">{PRODUCT_PRICE.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (STRIPE FORM) */}
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
          <button 
            onClick={onClose}
            className="hidden md:block absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
          >
            <X size={18} />
          </button>

          <div className="overflow-y-auto p-6 md:p-8 h-full pb-20 md:pb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Apmokėjimas</h2>
            <p className="text-slate-500 text-xs mb-6">Saugus Atsiskaitymas. Prieiga suteikiama iškart po patvirtinimo.</p>

            {!clientSecret && !error && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-slate-900"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-4 text-xs">
                {error}
              </div>
            )}
            
            {clientSecret && (
              <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                <CheckoutForm returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/test-start`} />
              </Elements>
            )}
            
            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              <ShieldCheck size={14} className="text-slate-500" /> 256-bit SSL Šifruotas Mokėjimas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// MAIN LANDING PAGE COMPONENT
export default function KarjerosPristatymas() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCheckoutOpen(true);
  };

  return (
    <div className="bg-slate-50 text-slate-900 antialiased" style={{ fontFamily: "'Aileron', 'Garet', sans-serif" }}>
      
      <PaymentModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white py-24 lg:py-32 border-b border-slate-200/80">
        <div className="container mx-auto px-6 relative z-10">
          
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            
            <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-800 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-8">
              <Award size={14} className="text-slate-700" /> Karjeros testas
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.15]">
              Individualizuota asmenybės analizė, <br/>
              <span className="text-slate-600 font-normal">tinkančių profesijų sąrašas ir ateities studijų planas.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto font-normal">
              Daugiau nei 30% studentų pakeičia arba nutraukia studijas dėl skubotų sprendimų. Atlikite mokslu pagrįstą asmenybės bei elgsenos tyrimą ir išsiaiškinkite 10 geriausiai jūsų potencialą atitinkančių profesinių krypčių.
            </p>

            <div className="inline-flex items-center gap-2 bg-slate-900 text-slate-100 border border-slate-800 px-4 py-2 rounded-lg text-xs font-medium mb-10 shadow-sm">
              <CheckCircle2 size={14} className="text-emerald-400" /> Įskaičiuota asmeninė ekspertinė konsultacija po vertinimo
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <button 
                onClick={handleBuyClick}
                className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-medium text-base transition-all shadow-lg hover:shadow-xl group"
              >
                <span>Gauti analitinę ataskaitą ({PRODUCT_PRICE} €)</span> 
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </button>
              
              <Link href="#kaip-veikia" className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-xl font-medium text-base transition-all">
                Vertinimo metodika
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium border-t border-slate-100 pt-8">
              <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-slate-700"/> Saugus atsiskaitymas</span>
              <span className="hidden sm:inline-block text-slate-300">•</span>
              <span className="flex items-center gap-1.5"><Zap size={15} className="text-slate-700"/> Rezultatai per 15 minučių</span>
              <span className="hidden sm:inline-block text-slate-300">•</span>
              <span className="flex items-center gap-1.5"><Gift size={15} className="text-slate-700"/> Įskaičiuotas eksperto aptarimas</span>
            </div>

          </div>
        </div>
      </section>

      {/* PROBLEM/SOLUTION SECTION */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-slate-400 font-semibold mb-4 uppercase tracking-widest text-xs">
                <AlertTriangle size={15} className="text-amber-400" /> Pasirinkimo rizikos
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 tracking-tight leading-snug">
                Klaidingas akademinis kelias reikalauja didelių išteklių.
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-6">
                Vidutinės vienų metų studijų bei pragyvenimo išlaidos siekia 3,000-5,000 €. Negana to, prarandamas brangus laikas, patiriamas akademinis stresas ir neapibrėžtumas dėl ateities.
              </p>
              <p className="text-slate-200 text-base leading-relaxed font-medium">
                Sumažinkite neapibrėžtumą investuodami {PRODUCT_PRICE} € į psichologiniais tyrimais pagrįstą elgsenos bei profesinio potencialo analizę.
              </p>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl relative">
              <div className="absolute -top-3 -right-3 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                Diagnostinis paketas
              </div>
              <h3 className="text-xl font-semibold mb-6 text-white border-b border-slate-800 pb-4">Ką gausite atlikę vertinimą?</h3>
              <ul className="space-y-4">
                {[
                  "Profesionalus profilis: Gausite detalų psichologinį savo stiprybių ir silpnybių aprašymą.",
                  "Karjeros planas: 10+ konkrečių profesijų, kurios labiausiai atitinka tavo duomenis.",
                  "Studijų žemėlapis: Rekomendacijos, kur stoti Lietuvoje ir Europoje bei kokių egzaminų reikės.",
                  "Komunikacijos gidas: Patarimai, kaip tavo asmenybės tipui geriausia bendrauti ir dirbti komandoje.",
                  "Nepriklausomi, duomenimis pagrįsti rezultatai be išorinio spaudimo."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-400 shrink-0 mt-1" size={18} />
                    <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION - SLIDE MAPPING */}
      <section id="verte" className="py-24 container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 tracking-tight">
            Mokslu pagrįsta vertinimo metodika
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Individualizuota asmenybės analizė, tinkančių profesijų sąrašas ir ateities studijų planas apjungia esminius žingsnius aiškiai ateičiai.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              icon: <BrainCircuit className="text-slate-800" />, 
              title: "Profesionalus profilis", 
              desc: "Gausite detalų psichologinį savo stiprybių ir silpnybių aprašymą." 
            },
            { 
              icon: <Briefcase className="text-slate-800" />, 
              title: "Karjeros planas", 
              desc: "10+ konkrečių profesijų, kurios labiausiai atitinka tavo duomenis." 
            },
            { 
              icon: <Compass className="text-slate-800" />, 
              title: "Studijų žemėlapis", 
              desc: "Rekomendacijos, kur stoti Lietuvoje ir Europoje bei kokių egzaminų reikės." 
            },
            { 
              icon: <MessageSquare className="text-slate-800" />, 
              title: "Komunikacijos gidas", 
              desc: "Patarimai, kaip tavo asmenybės tipui geriausia bendrauti ir dirbti komandoje." 
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 border border-slate-200">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">{item.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PERSONALITY PROFILES SECTION */}
      <section className="py-24 bg-slate-50 border-t border-slate-200/80">
        <div className="container mx-auto px-6">
           <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 tracking-tight">
              Asmenybės profiliai
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Mūsų metodika išskiria penkis esminius asmenybės archetipus, padedančius tiksliai įvertinti jūsų polinkius.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { id: "A", title: "Sistemų Architektas", type: "Inžinerinis-Techninis", icon: <BrainCircuit /> },
              { id: "B", title: "Žmonių Ugdytojas", type: "Socialinis-Emocinis", icon: <Users /> },
              { id: "C", title: "Vizijų Kūrėjas", type: "Kūrybinis-Meninis", icon: <Star /> },
              { id: "D", title: "Strategas & Lyderis", type: "Verslo-Vadybinis", icon: <Target /> },
              { id: "E", title: "Saugotojas & Tyrėjas", type: "Mokslo-Struktūrinis", icon: <ShieldCheck /> }
            ].map((profile, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-all">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  {profile.icon}
                </div>
                <div className="text-slate-400 font-bold text-lg mb-2">{profile.id}</div>
                <h4 className="font-bold text-slate-900 mb-2">{profile.title}</h4>
                <p className="text-slate-500 text-xs italic">{profile.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / CONSULTATION */}
      <section id="kaip-veikia" className="py-24 bg-white border-t border-slate-200/80">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-slate-200">
              <Gift size={14} /> Kompleksinė paslauga
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 tracking-tight">Procesas ir eiga</h2>
            <p className="text-slate-600 text-base">
              Kiekvienas užsakymas apima skaitmeninę diagnostikos ataskaitą ir asmeninę eksperto konsultaciją rezultatų aptarimui.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-semibold text-sm mb-6">01</div>
              <CreditCard className="text-slate-800 mb-4" size={24} />
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Užsakymas</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Vienkartinis {PRODUCT_PRICE} € mokėjimas per saugią Stripe sistemą. Prieiga prie vertinimo suteikiama iš karto.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-semibold text-sm mb-6">02</div>
              <ClipboardCheck className="text-slate-800 mb-4" size={24} />
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Diagnostika</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Klausimyno užpildymas užtrunka apie 15 minučių. Generuojama išsami analitinė ataskaita.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-md">
              <div className="w-10 h-10 bg-emerald-500 text-slate-950 rounded-lg flex items-center justify-center font-bold text-sm mb-6">03</div>
              <Mail className="text-emerald-400 mb-4" size={24} />
              <h3 className="text-lg font-semibold mb-2 text-white">Eksperto konsultacija</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                Parašykite mums el. paštu{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-400 font-medium underline underline-offset-2">
                  {CONTACT_EMAIL}
                </a>{' '}
                - suderinsime jums patogų konsultacijos laiką.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-400 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700/60">
                <CalendarCheck size={14} /> Nemokama konsultacija įskaičiuota
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TIKSLIUKAI.LT INTEGRATION */}
      <section className="bg-slate-900 py-24 text-white overflow-hidden relative border-t border-slate-800">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 bg-slate-800 text-slate-300 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border border-slate-700">
              <GraduationCap size={15} /> Akademinis Palaikymas
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight">
              Atsakingas pasirengimas <br/>
              <span className="text-slate-400 font-normal">studijų tikslams pasiekti.</span>
            </h2>
            
            <p className="text-slate-300 text-base mb-8 leading-relaxed font-normal">
              Atskleidus tinkamiausią karjeros kryptį ir reikalingus egzaminus, „Tiksliukai.lt“ komanda padeda užtikrinti aukščiausius akademinius rezultatus. Jungiame patyrusius mentorius ir korepetitorius kryptingam VBE pasirengimui.
            </p>
            
            <a 
              href="https://tiksliukai.lt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-xl font-medium text-base transition-all shadow-lg"
            >
              Susipažinti su Tiksliukai.lt
            </a>
          </div>
          
          <div className="lg:w-1/2 flex justify-center w-full">
            <div className="bg-slate-950 text-white p-8 rounded-2xl max-w-md w-full border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-800">
                <div className="w-10 h-10 bg-white text-slate-900 rounded-lg flex items-center justify-center font-bold text-lg">
                  T
                </div>
                <div>
                  <h4 className="font-semibold text-base leading-tight">Tiksliukai.lt Akademija</h4>
                  <p className="text-slate-400 text-xs">Tikslinis VBE ir dalykinis pasirengimas</p>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/50">
                  <span className="font-medium text-slate-300">Matematika</span>
                  <span className="text-slate-400 text-xs font-mono">VBE Standartas</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/50">
                  <span className="font-medium text-slate-300">Fizika</span>
                  <span className="text-slate-400 text-xs font-mono">Ekspertiniai Mentoriai</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300">Informatika</span>
                  <span className="text-slate-400 text-xs font-mono">Programavimas</span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star fill="currentColor" size={14} />
                  <Star fill="currentColor" size={14} />
                  <Star fill="currentColor" size={14} />
                  <Star fill="currentColor" size={14} />
                  <Star fill="currentColor" size={14} />
                </div>
                <span className="text-slate-400 text-xs font-medium">Aukšti VBE įvertinimai</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER / FINAL CTA */}
      <section className="py-24 text-center container mx-auto px-6">
        <div className="bg-white rounded-3xl py-16 px-6 border border-slate-200/80 shadow-sm max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Pradėkite strateginį planavimą šiandien
          </h2>
          <p className="text-base text-slate-600 mb-6 max-w-xl mx-auto leading-relaxed">
            Atsakykite į klausimyno teiginius ir gaukite asmeninę analitinę ataskaitą per kelias minutes. Tai pamatuota investicija į aiškią ateities viziją.
          </p>
          <p className="text-xs text-slate-500 font-medium mb-10 max-w-xl mx-auto flex items-center justify-center gap-1.5">
            <Gift size={14} className="text-slate-700" /> Atlikę vertinimą, susisiekite el. paštu{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-900 underline underline-offset-2">{CONTACT_EMAIL}</a>{' '}
            dėl konsultacijos.
          </p>
          <button 
            onClick={handleBuyClick}
            className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-10 py-4 rounded-xl font-medium text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Atlikti vertinimą dabar <ArrowRight size={20}/>
          </button>
          <p className="mt-4 text-xs text-slate-400">Vienkartinis mokėjimas ({PRODUCT_PRICE} €). Jokių papildomų mokesčių.</p>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-6 text-slate-500 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Tiksliukai.lt Karjeros Tyrimas. Visos teisės saugomos.</p>
          <div className="flex gap-6">
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-slate-900 transition-colors">{CONTACT_EMAIL}</a>
            <Link href="#" className="hover:text-slate-900 transition-colors">Naudojimo taisyklės</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Privatumo politika</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
