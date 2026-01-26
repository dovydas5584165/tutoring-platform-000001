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
  Zap,
  Star,
  ShieldCheck
} from 'lucide-react';

export default function KarjerosPristatymas() {
  return (
    <div className="bg-white text-slate-900 font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-slate-50 py-20 lg:py-32">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Zap size={16} className="text-blue-600" /> Naujiena: Tiksliausias 2026-ųjų karjeros testas
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
              Tavo ateitis — ne <span className="text-blue-600">atsitiktinumas.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              Gauk profesionalią asmenybės analizę, tinkančių profesijų sąrašą ir studijų planą. 
              <span className="block mt-2 font-semibold text-slate-800">Investicija į tavo karjerą – tik 30 €.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://www.tiksliukai.lt/test" 
                className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-200 group"
              >
                <span>Įsigyti ir atlikti testą (30 €)</span> 
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
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
          <p className="text-slate-500">Tai ne šiaip testas, o išsami 100 klausimų analizė, kuri sutaupys tau mėnesius blaškymosi.</p>
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
                            <p className="text-blue-300 text-sm">Egzaminų paruošimo centras</p>
                        </div>
                    </div>
                    <p className="text-slate-300 italic mb-6">
                        „Mūsų tikslas – ne tik padėti išlaikyti egzaminus, bet ir įstoti į svajonių studijas, kurias atradote atlikę testą.“
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
          <a 
            href="https://www.tiksliukai.lt/test" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-2xl font-extrabold text-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            Pradėti testą <ArrowRight />
          </a>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Tiksliukai.lt Karjeros Testas. Visos teisės saugomos.</p>
      </footer>
    </div>
  );
}
