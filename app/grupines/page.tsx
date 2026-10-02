"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Users, CheckCircle2, Globe2, MessageCircle, BookOpen, Languages, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

// Importuojame jūsų Supabase klientą
import { supabase } from "../../lib/supabaseClient"; 

// ---------- VALIDATION HELPERS ----------

const ALLOWED_SUBJECTS = ["Prancūzų kalba", "Vokiečių kalba"];

// Only these email providers are accepted. Add more here if needed.
const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "inbox.lt",
  "takas.lt",
  "zebra.lt",
  "one.lt",
  "mail.com",
];

const EMAIL_REGEX = /^[a-z0-9]+([._+-][a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)+$/;

function validateEmail(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (!value) return "Įveskite el. pašto adresą.";
  if (value.length > 100) return "El. pašto adresas per ilgas.";
  if (!EMAIL_REGEX.test(value)) return "Neteisingas el. pašto formatas.";

  const [local, domain] = value.split("@");

  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return "Naudokite populiarų el. paštą (pvz. @gmail.com, @outlook.com, @yahoo.com, @icloud.com, @inbox.lt).";
  }
  if (local.length < 3) return "El. pašto pavadinimas per trumpas.";
  if (/^(.)\1+$/.test(local)) return "Atrodo, kad el. paštas netikras.";
  if (/^(test|asdf|qwerty|abc|aaa|xxx|fake|none|no)\d*$/.test(local)) {
    return "Prašome įvesti tikrą el. pašto adresą.";
  }
  return null;
}

// Converts Lithuanian mobile formats to +3706XXXXXXX. Returns null if invalid.
function normalizeLtPhone(raw: string): string | null {
  let digits = raw.replace(/[\s\-()]/g, "");

  if (digits.startsWith("00370")) digits = "+370" + digits.slice(5);
  else if (digits.startsWith("370") && digits.length === 11) digits = "+" + digits;
  else if (digits.startsWith("86") && digits.length === 9) digits = "+370" + digits.slice(1);

  return /^\+3706\d{7}$/.test(digits) ? digits : null;
}

function validatePhone(raw: string): string | null {
  const value = raw.trim();
  if (!value) return "Įveskite telefono numerį.";
  if (!/^[+\d\s\-()]+$/.test(value)) return "Telefono numeryje gali būti tik skaitmenys.";

  const normalized = normalizeLtPhone(value);
  if (!normalized) {
    return "Įveskite Lietuvos mobilųjį numerį, pvz. +370 600 00000 arba 8 600 00000.";
  }

  const subscriber = normalized.slice(5); // 7 digits after +3706
  if (/^(\d)\1+$/.test(subscriber)) return "Atrodo, kad numeris netikras.";
  if ("01234567890".includes(subscriber) || "98765432109".includes(subscriber)) {
    return "Atrodo, kad numeris netikras.";
  }
  return null;
}

type FormErrors = { subject?: string; email?: string; phone?: string };

export default function GrupinesPamokos() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(""); 
  const [honeypot, setHoneypot] = useState(""); // bot trap, real users never see it
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  const clearError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status === "error" || status === "duplicate") setStatus("idle");
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bots fill hidden fields: pretend success, save nothing
    if (honeypot) {
      setStatus("success");
      return;
    }

    const newErrors: FormErrors = {};
    if (!ALLOWED_SUBJECTS.includes(subject)) newErrors.subject = "Prašome pasirinkti dominančią programą.";
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    const phoneError = validatePhone(phone);
    if (phoneError) newErrors.phone = phoneError;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = normalizeLtPhone(phone) as string;

    setStatus("loading");

    try {
      const { error } = await supabase
        .from('group_registrations')
        .insert([{ email: cleanEmail, phone: cleanPhone, subject: subject }]);

      if (error) {
        throw error;
      }
      
      setStatus("success");
      setEmail("");
      setPhone("");
      setSubject("");
      setErrors({});
      
    } catch (error) {
      // 23505 = unique violation (same email already registered for this group)
      if ((error as { code?: string })?.code === "23505") {
        setStatus("duplicate");
        return;
      }
      console.error("Klaida išsaugant registraciją:", error);
      setStatus("error");
    }
  };

  const inputBase =
    "w-full px-6 py-4 rounded-2xl text-gray-900 text-lg outline-none transition-all shadow-inner disabled:opacity-70";
  const okRing = "focus:ring-4 focus:ring-yellow-400/50";
  const badRing = "ring-4 ring-red-400/70";

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
            Grupinės Pamokos
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Mokykitės kartu su bendraamžiais, dalinkitės žiniomis ir siekite geriausių rezultatų. 
            Pasirinkite užsienio kalbų grupes arba kryptingą pasiruošimą mokyklos patikrinimams bei egzaminams.
            Pamokos trukmė- valanda, pamokos mažose grupėse kainuoja 25 eur/ pam, didesnėse grupėse 22 eur/ pam, indvidualiai 40 eur
          </p>
        </motion.div>

        {/* GROUPS INFO CARDS */}
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
              <p className="text-sm font-bold text-[#3B65CE]">Grupės pilnos</p>
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
              <p className="text-sm font-bold text-emerald-600">Grupės pilnos</p>
            </div>
          </motion.div>

          {/* VBE grupė */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-[2rem] shadow-lg p-8 border-t-8 border-violet-600 relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="text-violet-600 mb-4 bg-violet-50 inline-block p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">VBE paruošimas</h2>
            <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed">
              Intensyvus ir kryptingas pasiruošimas Valstybiniams Brandos Egzaminams. Sprendžiame konspektus bei praėjusių metų užduotis.
            </p>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Statusas</p>
              <p className="text-sm font-bold text-violet-600">Grupės pilnos</p>
            </div>
          </motion.div>

          {/* PUPP grupė */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-[2rem] shadow-lg p-8 border-t-8 border-orange-500 relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="text-orange-500 mb-4 bg-orange-50 inline-block p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">PUPP paruošimas</h2>
            <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed">
              Padedame dešimtokams (II gimnazijos klasėms) pasiruošti Pagrindinio Ugdymo Pasiekimų Patikrinimui be streso.
            </p>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Statusas</p>
              <p className="text-sm font-bold text-orange-500">Grupės pilnos</p>
            </div>
          </motion.div>

          {/* NMPP grupė */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-white rounded-[2rem] shadow-lg p-8 border-t-8 border-cyan-500 relative overflow-hidden group hover:shadow-xl transition-shadow flex flex-col"
          >
            <div className="text-cyan-500 mb-4 bg-cyan-50 inline-block p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform">
              <BookOpen size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">NMPP paruošimas</h2>
            <p className="text-gray-600 mb-6 flex-grow text-sm leading-relaxed">
              Sustipriname 4-os ir 8-os klasės mokinių žinias prieš Nacionalinį Mokinių Pasiekimų Patikrinimą.
            </p>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Statusas</p>
              <p className="text-sm font-bold text-cyan-500">Grupės pilnos</p>
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
              Pasirinkite dominančią grupę, įveskite el. paštą bei telefono numerį ir mes susisieksime, kai tik bus renkama jūsų grupė!
            </p>

            {status === "success" ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center border border-white/20"
              >
                <CheckCircle2 size={64} className="text-yellow-400 mb-4" />
                <h3 className="text-2xl font-bold mb-2">Sėkmingai užregistruota!</h3>
                <p className="text-blue-100">Informaciją perduosime atitinkamos srities mokytojams. Laukite laiško!</p>
              </motion.div>
            ) : (
              <form onSubmit={handleRegistration} noValidate className="flex flex-col gap-4 max-w-2xl mx-auto">
                {/* Honeypot: hidden from real users */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                />

                {/* Dalyko pasirinkimas */}
                <div className="text-left">
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      clearError("subject");
                    }}
                    disabled={status === "loading"}
                    className={`${inputBase} bg-white cursor-pointer ${errors.subject ? badRing : okRing}`}
                  >
                    <option value="" disabled>Pasirinkite grupę...</option>
                    <optgroup label="Užsienio kalbos">
                      <option value="Prancūzų kalba">Prancūzų kalba</option>
                      {/* <option value="Vokiečių kalba">Vokiečių kalba</option> */}
                    </optgroup>
                  </select>
                  {errors.subject && (
                    <p className="text-yellow-300 text-sm font-medium mt-2 ml-2">{errors.subject}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  {/* El. pašto įvestis */}
                  <div className="flex-1 text-left">
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      maxLength={100}
                      placeholder="Jūsų el. pašto adresas"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearError("email");
                      }}
                      onBlur={() => {
                        if (email) setErrors((prev) => ({ ...prev, email: validateEmail(email) ?? undefined }));
                      }}
                      disabled={status === "loading"}
                      className={`${inputBase} ${errors.email ? badRing : okRing}`}
                    />
                    {errors.email && (
                      <p className="text-yellow-300 text-sm font-medium mt-2 ml-2">{errors.email}</p>
                    )}
                  </div>

                  {/* Telefono numerio įvestis */}
                  <div className="flex-1 text-left">
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={20}
                      placeholder="Telefono numeris (+370...)"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        clearError("phone");
                      }}
                      onBlur={() => {
                        if (phone) setErrors((prev) => ({ ...prev, phone: validatePhone(phone) ?? undefined }));
                      }}
                      disabled={status === "loading"}
                      className={`${inputBase} ${errors.phone ? badRing : okRing}`}
                    />
                    {errors.phone && (
                      <p className="text-yellow-300 text-sm font-medium mt-2 ml-2">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-8 py-4 mt-2 h-auto rounded-2xl font-bold text-lg transition-transform hover:-translate-y-1 shadow-lg disabled:opacity-70 disabled:hover:translate-y-0 w-full sm:w-auto self-center"
                >
                  {status === "loading" ? "Siunčiama..." : "Registruotis į grupę"}
                </Button>
              </form>
            )}
            
            {status === "duplicate" && (
              <p className="text-yellow-300 mt-4 font-medium">Šis el. paštas jau užregistruotas į pasirinktą grupę.</p>
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
