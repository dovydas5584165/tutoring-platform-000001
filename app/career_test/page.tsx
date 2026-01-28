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
  ChevronUp
} from 'lucide-react';

// --- IMPORT CHECKOUT FORM (Up 2 levels) ---
import CheckoutForm from '../../components/CheckoutForm'; 

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- MOBILE OPTIMIZED PAYMENT MODAL COMPONENT ---
function PaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState('');
  // New state to toggle details on mobile
  const [showDetails, setShowDetails] = useState(false); 

  useEffect(() => {
    if (isOpen && !clientSecret) {
      // 1. Ask API for a payment intent
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
      {/* Dark Background Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Window - Full screen on mobile, Rounded on desktop */}
      <div className="relative bg-white w-full h-[95vh] md:h-auto md:max-h-[90vh] md:max-w-4xl rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all transform">
        
        {/* CLOSE BUTTON (Mobile: Top Right) */}
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
                <Lock className="w-5 h-5 text-blue-600" /> Užsakymas
              </h3>
              
              {/* Mobile Only: Price Header */}
              <div className="flex justify-between items-end mb-4 md:hidden">
                 <span className="text-slate-500 font-medium text-sm">Mokėti:</span>
                 <span className="text-3xl font-black text-slate-900">30.00 €</span>
              </div>

              {/* Mobile Toggle for Details */}
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-blue-600 text-sm font-bold md:hidden mb-4"
              >
                {showDetails ? 'Slėpti informaciją' : 'Ką aš perku?'}
                {showDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
              </button>

              {/* Product Details Box - Hidden on Mobile unless toggled */}
              <div className={`${showDetails ? 'block' : 'hidden'} md:block bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all`}>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Produktas</span>
                <p className="font-bold text-slate-900 text-lg leading-tight mt-1">Karjeros analizė 2026</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-500">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> 
                    <span>10 profesijų, kurios geriausiai tinka tau.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> 
                    <span>Profesionali ataskaita.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5"/> 
                    <span>Studijų ir egzaminų planas.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Desktop Only: Price Footer */}
            <div className="hidden md:block mt-6 pt-6 border-t border-slate-200">
              <div className="flex justify-between items-end">
                <span className="text-slate-500 font-medium">Iš viso:</span>
                <span className="text-3xl font-black text-slate-900">30.00 €</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE (STRIPE FORM) --- */}
        <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
          {/* Desktop Close Button */}
          <button 
            onClick={onClose}
            className="hidden md:block absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Scrollable Form Area */}
          <div className="overflow-y-auto p-6 md:p-8 h-full pb-20 md:pb-8">
            <h2 className="text-2xl font-bold mb-2">Apmokėjimas</h2>
            <p className="text-slate-500 text-sm mb-6">Saugus atsiskaitymas kortele per Stripe.</p>

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

  // Function to open the modal instead of following a link
  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCheckoutOpen(true);
  };

  return (
    <div className="bg-white text-slate-900 font-sans">
      
      {/* 1. RENDER THE MODAL (Initially Hidden) */}
      <PaymentModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-32">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Zap size={16} className="text-blue-600" /> Naujiena: Tiksliausias 2026-ųjų karjeros testas
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
              Tavo ateitis- ne <span className="text-blue-600">atsitiktinumas.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              Gauk profesionalią asmenybės analizę, tinkančių profesijų sąrašą ir studijų planą. 
              <span className="block mt-2 font-semibold text-slate-800">Investicija į tavo karjerą – tik 30 €.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 2. UPDATED BUTTON: NOW OPENS MODAL */}
              <button 
                onClick={handleBuyClick}
                className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-200 group"
              >
                <span>Įsigyti ir atlikti testą (30 €)</span> 
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <Link href="#kaip-veikia" className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-blue-600 text-slate-700 px-8 py-5 rounded-2xl font-bold text-lg transition-all">
                Ką aš gausiu?
              </Link>
            </div>
            
            <p className="mt-4 text-xs text-slate-400 font-medium flex items-center gap-1">
              <ShieldCheck size={14} /> Saugus apmokėjimas · Rezultatai iškart po testo
            </p>
          </div>
        </div>
        
        {/* Dekoratyvinis elementas */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 clip-path-slant hidden lg:block" />
      </section>

      {/* --- REZULTATŲ VERTĖ (Ką gausi už 30 EUR?) --- */}
      <section id="kaip-veikia" className="py-24 container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Kodėl verta investuoti 30 €?</h2>
          <p className="text-slate-500">Tai ne šiaip testas, o išsami 50 klausimų analizė, kuri sutaupys tau mėnesius blaškymosi.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              icon: <Target className="text-blue-600" />, 
              title: "Profesionalus profilis", 
              desc: "Gausi detalų psichologinį savo stiprybių ir silpnybių aprašymą." 
            },
            { 
              icon: <LineChart className="text-blue-600" />, 
              title: "Karjeros kryptys", 
              desc: "10 konkrečių profesijų, kurios labiausiai atitinka tavo duomenis." 
            },
            { 
              icon: <GraduationCap className="text-blue-600" />, 
              title: "Studijų žemėlapis", 
              desc: "Rekomendacijos, kur stoti Lietuvoje ir Europoje bei kokių egzaminų reikės." 
            },
            { 
              icon: <Users className="text-blue-600" />, 
              title: "Komunikacijos gidas", 
              desc: "Patarimai, kaip tavo asmenybės tipui geriausia bendrauti ir dirbti komandoje." 
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                {item.icon}
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- TIKSLIUKAI.LT INTEGRACIJA --- */}
      <section className="bg-slate-900 py-24 text-white overflow-hidden relative">
        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 relative z-10">
            <h2 className="text-3xl lg:text-5xl font-black mb-6 leading-tight">
              Sužinoti kryptį — tik pradžia. <br/>
              <span className="text-blue-400">Pasiekti ją padėsime mes.</span>
            </h2>
            
            <p className="text-blue-100/70 text-lg mb-8 leading-relaxed">
              Testas parodys, kokių egzaminų tau reikia norimai specialybei. 
              Tiksliukai.lt komanda padės jiems pasiruošti per individualias nuotolines pamokas.
            </p>

            <ul className="space-y-4 mb-10">
              {["Geriausi matematikos, fizikos ir IT korepetitoriai", "Individualus mokymosi planas", "Fokusas į maksimalų VBE rezultatą"].map((point, i) => (
                <li key={i} className="flex items-center gap-3 font-semibold text-blue-100">
                  <CheckCircle2 className="text-blue-400 shrink-0" /> {point}
                </li>
              ))}
            </ul>
            
            <a href="https://tiksliukai.lt" target="_blank" className="inline-block bg-white hover:bg-blue-50 text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg transition-transform hover:scale-105 shadow-xl">
              Rasti korepetitorių
            </a>
          </div>
          
          <div className="lg:w-1/2 flex justify-center">
             <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full"></div>
                <div className="bg-slate-800/80 backdrop-blur border border-slate-700 p-8 rounded-3xl max-w-md w-full relative z-10 shadow-2xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                            T
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Tiksliukai.lt</h4>
                            <p className="text-blue-300 text-sm">Korepetitorių platforma</p>
                        </div>
                    </div>
                    <p className="text-slate-300 italic mb-6">
                        „Mūsų tikslas- ne tik padėti išlaikyti egzaminus, bet ir įstoti į svajonių studijas, kurias atradote atlikę testą.“
                    </p>
                    <div className="flex items-center gap-1 text-yellow-400">
                        <Star fill="currentColor" size={16} />
                        <Star fill="currentColor" size={16} />
                        <Star fill="currentColor" size={16} />
                        <Star fill="currentColor" size={16} />
                        <Star fill="currentColor" size={16} />
                        <span className="text-slate-400 text-xs ml-2">(500+ mokinių)</span>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER / FINAL CTA --- */}
      <section className="py-24 text-center container mx-auto px-6">
        <div className="bg-blue-50 rounded-[40px] py-16 px-6 border border-blue-100">
          <h2 className="text-4xl font-black text-slate-900 mb-6">Tavo ateitis verta daugiau nei 30 €</h2>
          <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
            Tai investicija, kuri atsipirks jau pirmą studijų dieną. Užpildyk testą dabar ir gauk rezultatus akimirksniu.
          </p>
          {/* 3. UPDATED FOOTER BUTTON */}
          <button 
            onClick={handleBuyClick}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-2xl font-extrabold text-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Pradėti testą <ArrowRight />
          </button>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Tiksliukai.lt Karjeros Testas. Visos teisės saugomos.</p>
      </footer>
    </div>
  );
}
