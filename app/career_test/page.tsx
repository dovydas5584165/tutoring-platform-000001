'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

// --- IMPORT CHECKOUT FORM (Up 2 levels) ---
import CheckoutForm from '../../components/CheckoutForm'; 

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- CONFIGURATION ---
const PRODUCT_PRICE = 14;
const CONTACT_EMAIL = 'info.tiksliukai@gmail.com';
const BRAND_BLUE = '#5170FF';
const PAGE_TITLE = 'Tiksliukai. Karjeros testas';

// --- MOBILE OPTIMIZED PAYMENT MODAL COMPONENT ---
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
      colorPrimary: BRAND_BLUE, 
      borderRadius: '8px', 
      fontSizeBase: '15px',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif'
    },
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4">
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

        {/* --- LEFT SIDE (SUMMARY) --- */}
        <div className="bg-slate-900 text-white md:w-2/5 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="p-6 md:p-8 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-semibold tracking-wide text-slate-200 mb-2 md:mb-6">
                Užsakymo suvestinė
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

              <div className={`${showDetails ? 'block' : 'hidden'} md:block bg-slate-800/80 p-5 rounded-xl border border-slate-700/60 transition-all`}>
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: BRAND_BLUE }}>Aukščiausio lygio diagnostika</span>
                <p className="font-semibold text-white text-base leading-snug mt-1">Karjeros ir asmenybės profilis 2026</p>
                <ul className="mt-4 space-y-2.5 text-xs text-slate-300 leading-relaxed">
                  <li className="pl-3 border-l-2 border-slate-700">
                    Detali psichologinė ataskaita pagal 7 elgsenos dimensijas.
                  </li>
                  <li className="pl-3 border-l-2 border-slate-700">
                    10 geriausiai suderinamų profesinių krypčių analitika.
                  </li>
                  <li className="pl-3 border-l-2 border-slate-700">
                    Individualus VBE ir akademinių studijų planas.
                  </li>
                  <li className="pl-3 font-medium text-slate-200" style={{ borderLeft: `2px solid ${BRAND_BLUE}` }}>
                    Įskaičiuota asmeninė eksperto konsultacija.
                  </li>
                </ul>
              </div>

              <div className="mt-5 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-white">Konsultacija:</span> Po vertinimo susisiekite el. paštu{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2" style={{ color: BRAND_BLUE }}>
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

        {/* --- RIGHT SIDE (STRIPE FORM) --- */}
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
          <button 
            onClick={onClose}
            className="hidden md:block absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
          >
            <X size={18} />
          </button>

          <div className="overflow-y-auto p-6 md:p-8 h-full pb-20 md:pb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Apmokėjimas</h2>
            <p className="text-slate-500 text-xs mb-6">Saugus atsiskaitymas. Prieiga suteikiama iškart po patvirtinimo.</p>

            {!clientSecret && !error && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2" style={{ borderBottomColor: BRAND_BLUE }}></div>
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
            
            <div className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              256-bit SSL šifruotas mokėjimas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MAIN LANDING PAGE COMPONENT ---
export default function KarjerosPristatymas() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLE;
  }, []);

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCheckoutOpen(true);
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans antialiased">
      
      <PaymentModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-white py-24 lg:py-32 border-b border-slate-200/80">
        <div className="container mx-auto px-6 relative z-10">
          
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            
            <span className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: BRAND_BLUE }}>
              Moksleivių ir abiturientų karjeros diagnostika
            </span>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Tiksliukai. <span className="font-normal text-slate-500">Karjeros testas.</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto font-normal">
              Daugiau nei 30% studentų pakeičia arba nutraukia studijas dėl skubotų sprendimų. Atlikite mokslu pagrįstą asmenybės bei elgsenos tyrimą ir išsiaiškinkite 10 geriausiai jūsų potencialą atitinkančių profesinių krypčių.
            </p>

            <div className="text-sm font-medium mb-10" style={{ color: BRAND_BLUE }}>
              Įskaičiuota asmeninė ekspertinė konsultacija po vertinimo
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <button 
                onClick={handleBuyClick}
                className="flex items-center justify-center gap-3 text-white px-8 py-4 rounded-xl font-medium text-base transition-all hover:opacity-90"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                Gauti analitinę ataskaitą ({PRODUCT_PRICE} €)
              </button>
              
              <Link href="#kaip-veikia" className="flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-xl font-medium text-base transition-all">
                Vertinimo metodika
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium border-t border-slate-100 pt-8">
              <span>Saugus atsiskaitymas</span>
              <span className="hidden sm:inline-block text-slate-300">•</span>
              <span>Rezultatai per 15 minučių</span>
              <span className="hidden sm:inline-block text-slate-300">•</span>
              <span>Įskaičiuotas eksperto aptarimas</span>
            </div>

          </div>
        </div>
      </section>

      {/* --- PROBLEM/SOLUTION SECTION --- */}
      <section className="py-24 bg-slate-950 text-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-slate-400 font-semibold mb-4 uppercase tracking-widest text-xs">
                Pasirinkimo rizikos
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 tracking-tight leading-snug">
                Klaidingas akademinis kelias reikalauja didelių išteklių.
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-6">
                Vidutinės vienų metų studijų bei pragyvenimo išlaidos siekia 3,000–5,000 €. Negana to, prarandamas brangus laikas, patiriamas akademinis stresas ir neapibrėžtumas dėl ateities.
              </p>
              <p className="text-slate-200 text-base leading-relaxed font-medium">
                Sumažinkite neapibrėžtumą investuodami {PRODUCT_PRICE} € į psichologiniais tyrimais pagrįstą elgsenos bei profesinio potencialo analizę.
              </p>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 relative">
              <div className="absolute -top-3 -right-3 bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1 rounded-full">
                Diagnostinis paketas
              </div>
              <h3 className="text-xl font-semibold mb-6 text-white border-b border-slate-800 pb-4">Ką gausite atlikę vertinimą?</h3>
              <ul className="space-y-3.5">
                {[
                  "Objektyvią profesinių krypčių ir vidinio potencialo analizę.",
                  "Nepriklausomus, duomenimis pagrįstus rezultatus be išorinio spaudimo.",
                  "Aiškią struktūrą ir tikrumą dėl ateities sprendimų.",
                  "Konkretų akademinį žemėlapį ir VBE pasirinkimo rekomendacijas.",
                  "Individulų ataskaitos aptarimą su karjeros konsultantu."
                ].map((item, i) => (
                  <li key={i} className="pl-3 text-slate-300 text-sm leading-relaxed" style={{ borderLeft: `2px solid ${BRAND_BLUE}` }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE SECTION --- */}
      <section id="verte" className="py-24 container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 tracking-tight">
            Mokslu pagrįsta 7 dimensijų metodika
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Diagnostikai taikomas tarptautiniu mastu pripažintas vertinimo modelis, naudojamas organizacijų psichologijoje, pritaikytas akademiniam ir profesiniam nukreipimui.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              title: "Kompetencijų profilis", 
              desc: "Atskleidžiamos esminės asmenybės savybės: analitiniai gebėjimai, lyderystė, struktūruotas mąstymas ar kūrybinis potencialas." 
            },
            { 
              title: "10 profesinių krypčių", 
              desc: "Pateikiamas struktūruotas sąrašas specialybių, kuriose jūsų natūralūs elgsenos pavyzdžiai suteikia konkurencinį pranašumą." 
            },
            { 
              title: "Akademinis planas", 
              desc: "Tikslus valstybinių brandos egzaminų (VBE) ir akademinių reikalavimų suderinimas su pasirinktomis sritimis." 
            },
            { 
              title: "Darbo ir mokymosi stilius", 
              desc: "Informacijos įsisavinimo specifikos, streso valdymo bei efektyvumo didinimo rekomendacijos." 
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-all duration-200">
              <div className="text-xs font-bold mb-4" style={{ color: BRAND_BLUE }}>{String(idx + 1).padStart(2, '0')}</div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">{item.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS / CONSULTATION --- */}
      <section id="kaip-veikia" className="py-24 bg-white border-t border-slate-200/80">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: BRAND_BLUE }}>
              Kompleksinė paslauga
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 tracking-tight">Procesas ir eiga</h2>
            <p className="text-slate-600 text-base">
              Kiekvienas užsakymas apima skaitmeninę diagnostikos ataskaitą ir asmeninę eksperto konsultaciją rezultatų aptarimui.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 text-white rounded-lg flex items-center justify-center font-semibold text-sm mb-6" style={{ backgroundColor: BRAND_BLUE }}>01</div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Užsakymas</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Vienkartinis {PRODUCT_PRICE} € mokėjimas per saugią Stripe sistemą. Prieiga prie vertinimo suteikiama iš karto.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 text-white rounded-lg flex items-center justify-center font-semibold text-sm mb-6" style={{ backgroundColor: BRAND_BLUE }}>02</div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Diagnostika</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Klausimyno užpildymas užtrunka apie 15 minučių. Generuojama išsami analitinė ataskaita.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 text-slate-950 rounded-lg flex items-center justify-center font-bold text-sm mb-6" style={{ backgroundColor: BRAND_BLUE }}>03</div>
              <h3 className="text-lg font-semibold mb-2 text-white">Eksperto konsultacija</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                Parašykite mums el. paštu{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline underline-offset-2" style={{ color: BRAND_BLUE }}>
                  {CONTACT_EMAIL}
                </a>{' '}
                – suderinsime jums patogų konsultacijos laiką.
              </p>
              <div className="text-[11px] font-medium bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700/60" style={{ color: BRAND_BLUE }}>
                Nemokama konsultacija įskaičiuota
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TIKSLIUKAI.LT INTEGRATION --- */}
      <section className="bg-slate-900 py-24 text-white overflow-hidden relative border-t border-slate-800">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="lg:w-1/2">
            <div className="text-xs font-semibold uppercase tracking-wider mb-6" style={{ color: BRAND_BLUE }}>
              Akademinis palaikymas
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
              className="inline-flex items-center justify-center bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-xl font-medium text-base transition-all"
            >
              Susipažinti su Tiksliukai.lt
            </a>
          </div>
          
          <div className="lg:w-1/2 flex justify-center w-full">
            <div className="bg-slate-950 text-white p-8 rounded-2xl max-w-md w-full border border-slate-800">
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
              <div className="mt-8 pt-6 border-t border-slate-800">
                <span className="text-slate-400 text-xs font-medium">Aukšti VBE įvertinimai</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER / FINAL CTA --- */}
      <section className="py-24 text-center container mx-auto px-6">
        <div className="bg-white rounded-3xl py-16 px-6 border border-slate-200/80 max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Pradėkite strateginį planavimą šiandien
          </h2>
          <p className="text-base text-slate-600 mb-6 max-w-xl mx-auto leading-relaxed">
            Atsakykite į klausimyno teiginius ir gaukite asmeninę analitinę ataskaitą per kelias minutes. Tai pamatuota investicija į aiškią ateities viziją.
          </p>
          <p className="text-xs text-slate-500 font-medium mb-10 max-w-xl mx-auto">
            Atlikę vertinimą, susisiekite el. paštu{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-slate-900 underline underline-offset-2">{CONTACT_EMAIL}</a>{' '}
            dėl konsultacijos.
          </p>
          <button 
            onClick={handleBuyClick}
            className="inline-flex items-center gap-3 text-white px-10 py-4 rounded-xl font-medium text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            Atlikti vertinimą dabar
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
