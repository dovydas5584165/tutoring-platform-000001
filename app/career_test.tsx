import React from 'react';
import Link from 'next/link';
import { 
  Target, 
  GraduationCap, 
  LineChart, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Compass,
  Zap
} from 'lucide-react';

export default function KarjerosPristatymas() {
  return (
    <div className="bg-white text-slate-900 font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-slate-50 py-20 lg:py-32">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Zap size={16} /> Naujiena: Tiksliausias 2024-ųjų karjeros testas
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
              Tavo ateitis — ne <span className="text-blue-600">atsitiktinumas.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
              Atrask savo prigimtinius talentus, sužinok tinkančias profesijas ir gauk konkretų egzaminų planą su Tiksliukai.lt ekspertų pagalba.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/testas" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-200">
                Pradėti testą nemokamai <ArrowRight />
              </Link>
              <Link href="#kaip-veikia" className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-blue-600 text-slate-700 px-10 py-5 rounded-2xl font-bold text-lg transition-all">
                Sužinoti daugiau
              </Link>
            </div>
          </div>
        </div>
        {/* Dekoratyvinis elementas */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 clip-path-slant hidden lg:block" />
      </section>

      {/* --- REZULTATŲ VERTĖ (Ką gausi?) --- */}
      <section id="kaip-veikia" className="py-24 container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Kas tavęs laukia ataskaitoje?</h2>
          <p className="text-slate-500">Mūsų testas analizuoja tavo asmenybę per 100 gilių klausimų, kad pateiktų tau pilną ateities žemėlapį.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { 
              icon: <Target className="text-blue-600" />, 
              title: "Tavo profilis", 
              desc: "Išsamus tavo asmenybės tipo aprašymas: nuo stiprybių iki silpnybių." 
            },
            { 
              icon: <LineChart className="text-blue-600" />, 
              title: "TOP Profesijos", 
              desc: "10 konkrečių karjeros krypčių su realiais atlyginimų rėžiais." 
            },
            { 
              icon: <GraduationCap className="text-blue-600" />, 
              title: "Studijų gidas", 
              desc: "Geriausi fakultetai Lietuvoje ir prestižiniai universitetai Europoje." 
            },
            { 
              icon: <Users className="text-blue-600" />, 
              title: "Komunikacija", 
              desc: "Sužinok, kaip tavo charakteris veikia tavo santykius su draugais." 
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
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
            <h2 className="text-3xl lg:text-5xl font-black mb-8 leading-tight">
              Sužinoti kryptį — tik pradžia. <br/>
              <span className="text-blue-400">Pasiekti ją padėsime mes.</span>
            </h2>
            <p className="text-blue-100/70 text-lg mb-8 leading-relaxed">
              Testas parodys, kokių egzaminų tau reikia. Tiksliukai.lt padės juos išlaikyti. Mes siūlome individualias nuotolines pamokas su geriausiais matematikos, fizikos ir IT mokytojais.
            </p>
            <ul className="space-y-4 mb-10">
              {["Individualus mokymosi tempas", "Patyrę korepetitoriai", "Fokusas į VBE rezultatus"].map((point, i) => (
                <li key={i} className="flex items-center gap-3 font-semibold text-blue-100">
                  <CheckCircle2 className="text-blue-400" /> {point}
                </li>
              ))}
            </ul>
            <a href="https://tiksliukai.lt" target="_blank" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-transform hover:scale-105 shadow-xl">
              Sužinoti apie Tiksliukai.lt
            </a>
          </div>
          <div className="lg:w-1/2 flex justify-center">
             <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full"></div>
                <Compass size={320} className="text-blue-600 opacity-20 relative animate-pulse-slow" />
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER / FINAL CTA --- */}
      <section className="py-24 text-center container mx-auto px-6">
        <div className="bg-blue-50 rounded-[40px] py-16 px-6">
          <h2 className="text-4xl font-black text-slate-900 mb-6">Pasiruošęs atrasti save?</h2>
          <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
            Testas trunka apie 10 minučių. Užbaigęs gausi pilną savo ateities profilį.
          </p>
          <Link href="/testas" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-2xl font-extrabold text-xl transition-all shadow-xl hover:shadow-2xl">
            Pradėti testą <ArrowRight />
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Tiksliukai.lt Karjeros Testas. Visos teisės saugomos.</p>
      </footer>
    </div>
  );
}
