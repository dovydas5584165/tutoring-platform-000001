"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Code, GraduationCap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// PRIDĖTA: Importuojame jūsų Supabase klientą. 
// Jei failas yra "app/grupines/page.tsx", kelias greičiausiai bus "../../lib/supabaseClient".
// Jei naudojate "@", galite pakeisti į "@/lib/supabaseClient".
import { supabase } from "../../lib/supabaseClient"; 

export default function GrupinesPamokos() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      // TIKRA SUPABASE UŽKLAUSA:
      // Įrašome el. paštą į "group_registrations" lentelę
      const { error } = await supabase
        .from('group_registrations')
        .insert([{ email: email }]);

      if (error) {
        throw error;
      }
      
      // Jei viskas pavyko, parodome sėkmės žinutę
      setStatus("success");
      setEmail("");
      
    } catch (error) {
      console.error("Klaida išsaugant el. paštą:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-4 sm:px-8 py-3 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
            <Image
              src="/logo-removebg-preview.png"
              alt="Tiksliukai Logo"
              width={60}
              height={60}
              className="rounded-lg"
            />
          </Link>
          <nav>
            <Link
              href="/"
              className="flex items-center gap-2 text-[#3B65CE] font-semibold hover:text-blue-800 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Grįžti į pagrindinį</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-6 text-[#3B65CE]">
            <Users size={32} />
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#3B65CE] mb-6">
            Grupinės Pamokos
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Mokykitės kartu su bendraamžiais, dalinkitės žiniomis ir siekite geriausių rezultatų. 
            Grupinės pamokos – tai puikus būdas gauti aukščiausios kokybės žinias už prieinamesnę kainą.
          </p>
        </motion.div>

        {/* GROUPS INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
          {/* Python Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border-t-8 border-yellow-400 relative overflow-hidden group hover:shadow-2xl transition-shadow"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Code size={120} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 relative z-10">Python Programavimas</h2>
            <p className="text-gray-600 mb-6 relative z-10">
              Nuo pagrindų iki sudėtingų algoritmų. Išmokite vieną populiariausių programavimo kalbų pasaulyje.
            </p>
            <div className="bg-blue-50 rounded-2xl p-4 inline-block relative z-10">
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Grupė formuojama</p>
              <p className="text-2xl font-black text-[#3B65CE]">Kas 3 savaites</p>
            </div>
          </motion.div>

          {/* Egzaminai Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-[2rem] shadow-xl p-8 sm:p-10 border-t-8 border-red-500 relative overflow-hidden group hover:shadow-2xl transition-shadow"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <GraduationCap size={120} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 relative z-10">PUPP, VBE ir NMPP</h2>
            <p className="text-gray-600 mb-6 relative z-10">
              Kryptingas pasiruošimas egzaminams ir patikrinimams. Sprendžiame praėjusių metų užduotis ir mokomės strategijų.
            </p>
            <div className="bg-red-50 rounded-2xl p-4 inline-block relative z-10">
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Grupės formuojamos</p>
              <p className="text-2xl font-black text-red-600">Kas 2 savaites</p>
            </div>
          </motion.div>
        </div>

        {/* REGISTRATION FORM SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-[#3B65CE] rounded-[3rem] p-8 sm:p-16 text-center text-white max-w-4xl mx-auto shadow-2xl relative overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-yellow-400 opacity-10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-6">Prisijunkite prie laukiančiųjų sąrašo</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Įveskite savo el. paštą ir mes susisieksime su jumis iškart, kai tik prasidės naujos grupės formavimas!
            </p>

            {status === "success" ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center border border-white/20"
              >
                <CheckCircle2 size={64} className="text-yellow-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Sėkmingai užregistruota!</h3>
                <p className="text-blue-100">Laukite laiško su tolimesnėmis instrukcijomis.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRegistration} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Jūsų el. pašto adresas"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  className="flex-1 px-6 py-4 rounded-2xl text-gray-900 text-lg focus:ring-4 focus:ring-yellow-400/50 outline-none transition-all shadow-inner disabled:opacity-70"
                />
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-8 py-4 h-auto rounded-2xl font-bold text-lg transition-transform hover:-translate-y-1 shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {status === "loading" ? "Siunčiama..." : "Registruotis"}
                </Button>
              </form>
            )}
            
            {status === "error" && (
              <p className="text-red-300 mt-4 font-medium">Įvyko klaida. Prašome pabandyti dar kartą vėliau.</p>
            )}
          </div>
        </motion.div>

      </main>

      {/* FOOTER */}
      <footer className="text-center py-8 text-sm text-gray-500 border-t border-gray-200 bg-white">
        © {new Date().getFullYear()} Tiksliukai.lt. Visos teisės saugomos.
      </footer>
    </div>
  );
}
