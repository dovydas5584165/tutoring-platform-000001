"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Users, CheckCircle2, Globe2, MessageCircle, BookOpen, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";

// Importuojame jūsų Supabase klientą
import { supabase } from "../../lib/supabaseClient"; 

export default function GrupinesPamokos() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(""); // Naujas state dalykui
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "validation_error">("idle");

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Patikriname, ar pasirinktas dalykas
    if (!subject) {
      setStatus("validation_error");
      return;
    }
    
    if (!email) return;

    setStatus("loading");

    try {
      // Siunčiame el. paštą ir pasirinktą dalyką į duomenų bazę
      const { error } = await supabase
        .from('group_registrations')
        .insert([{ email: email, subject: subject }]);

      if (error) {
        throw error;
      }
      
      setStatus("success");
      setEmail("");
      setSubject("");
      
    } catch (error) {
      console.error("Klaida išsaugant registraciją:", error);
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
            <Languages size={32} />
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#3B65CE] mb-6">
            Užsienio Kalbų Grupės
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Mokykitės naujų kalbų kartu su bendraamžiais, laužkite kalbėjimo barjerus ir siekite geriausių rezultatų. 
            Grupinės pamokos – tai puikus būdas greičiau prabilti užsienio kalba.
          </p>
        </motion.div>

        {/* GROUPS INFO CARDS (Language Courses) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          
          {/* Anglų kalba */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-[2rem] shadow-lg p-8 border-t-8 border-blue-500 relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="text-blue-500 mb-4 bg-blue-50 inline-block p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <Globe2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Anglų kalba</h2>
            <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed">
              Tobulinkite kalbėjimo, rašymo ir supratimo įgūdžius. Nuo pradedančiųjų (A1) iki pažengusių (C1).
            </p>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Statusas</p>
              <p className="text-sm font-bold text-[#3B65CE]">Grupės renkamos</p>
            </div>
          </motion.div>

          {/* Prancūzų kalba */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-[2rem] shadow-lg p-8 border-t-8 border-red-500 relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="text-red-500 mb-4 bg-red-50 inline-block p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <MessageCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Prancūzų kalba</h2>
            <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed">
              Išmokite meilės ir diplomatijos kalbą. Praktinės užduotys, akcentas į tarimą bei laisvą bendravimą.
            </p>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Statusas</p>
              <p className="text-sm font-bold text-red-600">Grupės renkamos</p>
            </div>
          </motion.div>

          {/* Vokiečių kalba */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-[2rem] shadow-lg p-8 border-t-8 border-yellow-400 relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="text-yellow-600 mb-4 bg-yellow-50 inline-block p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <BookOpen size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Vokiečių kalba</h2>
            <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed">
              Griežta, bet logiška gramatika. Puikus pasirinkimas norintiems studijuoti ar keliauti DACH regione.
            </p>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Statusas</p>
              <p className="text-sm font-bold text-yellow-600">Grupės renkamos</p>
            </div>
          </motion.div>

          {/* Arabų kalba */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-[2rem] shadow-lg p-8 border-t-8 border-emerald-500 relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="text-emerald-500 mb-4 bg-emerald-50 inline-block p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Arabų kalba</h2>
            <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed">
              Atraskite naują pasaulį. Mokomės skaityti, rašyti ir bendrauti viena plačiausiai vartojamų kalbų.
            </p>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Statusas</p>
              <p className="text-sm font-bold text-emerald-600">Grupės renkamos</p>
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
              Pasirinkite dominančią kalbą, įveskite el. paštą ir mes susisieksime, kai tik bus renkama jūsų grupė!
            </p>

            {status === "success" ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center border border-white/20"
              >
                <CheckCircle2 size={64} className="text-yellow-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Sėkmingai užregistruota!</h3>
                <p className="text-blue-100">Informaciją perduosime atitinkamos kalbos mokytojams. Laukite laiško!</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRegistration} className="flex flex-col gap-4 max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Dalyko pasirinkimas */}
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (status === "validation_error") setStatus("idle");
                    }}
                    disabled={status === "loading"}
                    className="flex-1 px-6 py-4 rounded-2xl text-gray-900 text-lg focus:ring-4 focus:ring-yellow-400/50 outline-none transition-all shadow-inner disabled:opacity-70 bg-white cursor-pointer"
                  >
                    <option value="" disabled>Pasirinkite kalbą...</option>
                    <option value="Anglų kalba">Anglų kalba</option>
                    <option value="Prancūzų kalba">Prancūzų kalba</option>
                    <option value="Vokiečių kalba">Vokiečių kalba</option>
                    <option value="Arabų kalba">Arabų kalba</option>
                  </select>

                  {/* El. pašto įvestis */}
                  <input
                    type="email"
                    required
                    placeholder="Jūsų el. pašto adresas"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading"}
                    className="flex-[2] px-6 py-4 rounded-2xl text-gray-900 text-lg focus:ring-4 focus:ring-yellow-400/50 outline-none transition-all shadow-inner disabled:opacity-70"
                  />
                </div>

                {status === "validation_error" && (
                  <p className="text-yellow-300 text-sm font-medium text-left ml-2">Prašome pasirinkti dominančią kalbą.</p>
                )}

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-8 py-4 mt-2 h-auto rounded-2xl font-bold text-lg transition-transform hover:-translate-y-1 shadow-lg disabled:opacity-70 disabled:hover:translate-y-0 w-full sm:w-auto self-center"
                >
                  {status === "loading" ? "Siunčiama..." : "Registruotis į grupę"}
                </Button>
              </form>
            )}
            
            {status === "error" && (
              <p className="text-red-300 mt-4 font-medium">Įvyko klaida duomenų bazėje. Prašome pabandyti vėliau.</p>
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
