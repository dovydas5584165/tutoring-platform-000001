'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { 
  Target, 
  GraduationCap, 
  LineChart, 
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
  AlertTriangle
} from 'lucide-react';

// --- IMPORT CHECKOUT FORM (Up 2 levels) ---
import CheckoutForm from '../../components/CheckoutForm'; 

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- CONFIGURATION ---
const PRODUCT_PRICE = 14;

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
    variables: { colorPrimary: '#2563eb', borderRadius: '12px', fontSizeBase: '16px' },
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-4xl rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all transform">
        
        <button 
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 z-20 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
        >
          <X size={20} />
        </button>

        {/* --- LEFT SIDE (SUMMARY) --- */}
        <div className="bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 md:w-2/5 flex-shrink-0">
          <div className="p-6 md:p-8 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 md:mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" /> Tavo investicija
              </h3>
              
              <div className="flex justify-between items-end mb-4 md:hidden">
                 <span className="text-slate-500 font-medium text-sm">Mokėti:</span>
                 <span className="text-3xl font-black text-slate-900">{PRODUCT_PRICE.toFixed(2)} €</span>
              </div>

              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-blue-600 text-sm font-bold md:hidden mb-4"
              >
                {showDetails ? 'Slėpti informaciją' : 'Kas sudaro ataskaitą?'}
                {showDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </button>

              <div className={`${showDetails ? 'block' : 'hidden'} md:block bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all`}>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Patikima metodika</span>
                <p className="font-bold text-slate-900 text-lg leading-tight mt-1">Karjeros ir asmenybės profilis 2026</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-500">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> 
                    <span>Detali psichologinė ataskaita pagal 7 elgsenos dimensijas.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> 
                    <span>Top 10 profesijų, kuriose tu natūraliai dominuosi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> 
                    <span>Konkretus egzaminų (VBE) ir studijų planas tavo tikslui.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="hidden md:block mt-6 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-end">
                <span className="text-slate-500 font-medium">Iš viso:</span>
                <span className="text-3xl font-black text-slate-900">{PRODUCT_PRICE.toFixed(2)} €</span>
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
            <X size={20} />
          </button>

          <div className="overflow-y-auto p-6 md:p-8 h-full pb-20 md:pb-8">
            <h2 className="text-2xl font-bold mb-2">Apmokėjimas</h2>
            <p className="text-slate-500 text-sm mb-6">Saugus atsiskaitymas kortele. Rezultatus gausi iškart po testo.</p>

            {!clientSecret && !error && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-4 text-sm">
                {error}
              </div>
            )}
            
            {clientSecret && (
              <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                <CheckoutForm returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/test-start`} />
              </Elements>
            )}
            
            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={14} /> 100% Saugus SSL Apmokėjimas
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

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCheckoutOpen(true);
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans">
      
      <PaymentModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28 border-b border-slate-100">
        <div className="container mx-auto px-6 relative z-10">
          
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-8 shadow-sm">
              <Zap size={16} className="text-blue-600" /> Sukurta specialiai moksleiviams ir abiturientams
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Nežinai, ką studijuoti? <br/> <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">Nesirink iš lempos.</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Daugiau nei 30% studentų meta studijas po pirmo kurso, nes pasirinko aklai. Išvenk šios klaidos. Atlik profesionalų asmenybės testą ir sužinok 10 profesijų, kurioms esi sutvertas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <button 
                onClick={handleBuyClick}
                className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-200 hover:-translate-y-1 group"
              >
                <span>Noriu sužinoti savo kelią ({PRODUCT_PRICE} €)</span> 
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <Link href="#verte" className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-blue-600 hover:bg-slate-50 text-slate-700 px-8 py-5 rounded-2xl font-bold text-lg transition-all">
                Kaip tai veikia?
              </Link>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1"><ShieldCheck size={16} className="text-green-500"/> Saugus apmokėjimas</span>
              <span className="hidden sm:inline-block text-slate-300">•</span>
              <span className="flex items-center gap-1"><Zap size={16} className="text-yellow-500"/> Rezultatai per 15 minučių</span>
            </div>

          </div>
        </div>
      </section>

      {/* --- PROBLEM/SOLUTION SECTION (Student Focus) --- */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-red-400 font-bold mb-4 uppercase tracking-wider text-sm">
                <AlertTriangle size={18} /> Realybė
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-6">Metai netinkamose studijose kainuoja brangiai.</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Vidutinė studijų kaina ir pragyvenimas per metus siekia ~3000-5000 €. Negana to - tai prarastas tavo laikas, stresas ir nusivylimas. 
              </p>
              <p className="text-slate-300 text-lg leading-relaxed font-semibold">
                Sutaupyk šiuos pinigus ir nervus investuodamas vos {PRODUCT_PRICE} € į mokslu pagrįstą savo elgsenos ir potencialo analizę.
              </p>
            </div>
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl relative">
              <div className="absolute -top-4 -right-4 bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg transform rotate-3">
                Geriausia investicija
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Ką gausi atlikęs testą?</h3>
              <ul className="space-y-4">
                {[
                  "Aiškų atsakymą, kas tau iš tikrųjų tinka.",
                  "Jokio spaudimo iš tėvų ar mokytojų - tik objektyvūs duomenys.",
                  "Ramybę dėl savo ateities pasirinkimų.",
                  "Konkretų planą, ką daryti toliau (kokius VBE rinktis)."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-blue-400 shrink-0 mt-1" size={20} />
                    <span className="text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE SECTION (Translated dimensions to student benefits) --- */}
      <section id="verte" className="py-24 container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-6 text-slate-900">Tai ne eilinė mokyklos anketa.</h2>
          <p className="text-lg text-slate-500">
            Naudojame 7 dimensijų asmenybės vertinimo metodiką, kurią naudoja didžiausios įmonės atsirinkdamos darbuotojus. Dabar ji pritaikyta padėti tau išsirinkti studijas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              icon: <BrainCircuit className="text-blue-600" />, 
              title: "Tavo supergalios", 
              desc: "Išsiaiškinsime tavo stiprybes: ar esi lyderis, analitikas, kūrėjas, o gal komandos siela?" 
            },
            { 
              icon: <Target className="text-blue-600" />, 
              title: "Top 10 profesijų", 
              desc: "Jokių spėliojimų. Gausi konkretų 10 specialybių sąrašą, kuriose tavo asmenybė natūraliai atneš sėkmę." 
            },
            { 
              icon: <Compass className="text-blue-600" />, 
              title: "Egzaminų žemėlapis", 
              desc: "Parodysime, kokių tiksliai valstybinių brandos egzaminų reikės norint įstoti į tavo idealiausias profesijas." 
            },
            { 
              icon: <Users className="text-blue-600" />, 
              title: "Mokymosi stilius", 
              desc: "Sužinosi, kaip geriausiai įsimeni informaciją ir kaip valdyti stresą artėjant egzaminams." 
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 relative overflow-hidden group">
              <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-600 transition-colors rounded-2xl flex items-center justify-center mb-6">
                {React.cloneElement(item.icon, { className: "group-hover:text-white transition-colors" })}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- TIKSLIUKAI.LT INTEGRACIJA --- */}
      <section className="bg-blue-600 py-24 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-100 px-4 py-2 rounded-full text-sm font-bold mb-6 backdrop-blur-sm border border-blue-500">
              <GraduationCap size={16} /> Nuo testo iki įstojimo
            </div>
            <h2 className="text-3xl lg:text-5xl font-black mb-6 leading-tight">
              Padėsime ne tik sužinoti, <br/>
              <span className="text-blue-200">bet ir įstoti.</span>
            </h2>
            
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Kai žinosi, kokią kryptį pasirinkti ir kokius egzaminus laikyti, „Tiksliukai.lt“ komanda bus tavo užnugaris. Mes jungiame geriausius korepetitorius, kurie padės užpildyti spragas ir pasiruošti VBE aukščiausiu balu.
            </p>
            
            <a href="https://tiksliukai.lt" target="_blank" className="inline-block bg-white hover:bg-slate-100 text-blue-700 px-10 py-4 rounded-2xl font-bold text-lg transition-transform hover:scale-105 shadow-xl">
              Ieškoti korepetitoriaus
            </a>
          </div>
          
          <div className="lg:w-1/2 flex justify-center w-full">
              <div className="bg-white text-slate-900 p-8 rounded-3xl max-w-md w-full shadow-2xl transform rotate-1 hover:rotate-0 transition-transform">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                          T
                      </div>
                      <div>
                          <h4 className="font-bold text-lg leading-tight">Tiksliukai.lt mokytojai</h4>
                          <p className="text-slate-500 text-sm">Pasiruošimas VBE ir mokyklos kursui</p>
                      </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Matematika</span>
                      <span className="text-green-500 font-bold text-sm bg-green-50 px-2 py-1 rounded-md">100 balų sistema</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Fizika</span>
                      <span className="text-blue-500 font-bold text-sm bg-blue-50 px-2 py-1 rounded-md">Patyrę dėstytojai</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">IT</span>
                      <span className="text-purple-500 font-bold text-sm bg-purple-50 px-2 py-1 rounded-md">Programavimo pagrindai</span>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-yellow-400">
                          <Star fill="currentColor" size={16} />
                          <Star fill="currentColor" size={16} />
                          <Star fill="currentColor" size={16} />
                          <Star fill="currentColor" size={16} />
                          <Star fill="currentColor" size={16} />
                      </div>
                      <span className="text-slate-400 text-sm font-medium">500+ laimingų mokinių</span>
                  </div>
              </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER / FINAL CTA --- */}
      <section className="py-24 text-center container mx-auto px-6">
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-[40px] py-20 px-6 border border-blue-100 shadow-sm max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Pradėk planuoti savo sėkmę šiandien</h2>
          <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
            Atsakyk į 50 klausimų ir gauk pilną savo asmenybės ataskaitą per kelias minutes. Tai protingiausi {PRODUCT_PRICE} €, kuriuos išleisi savo ateičiai.
          </p>
          <button 
            onClick={handleBuyClick}
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-2xl font-extrabold text-xl transition-all shadow-2xl shadow-blue-300 hover:-translate-y-2 animate-pulse hover:animate-none"
          >
            Atlikti testą dabar <ArrowRight size={24}/>
          </button>
          <p className="mt-6 text-sm text-slate-400">Jokių paslėptų mokesčių. Vienkartinis mokėjimas.</p>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-200 text-center bg-white">
        <div className="container mx-auto px-6 text-slate-400 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Tiksliukai.lt Karjeros Tyrimas. Visos teisės saugomos.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-blue-600 transition-colors">Naudojimo taisyklės</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Privatumo politika</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
