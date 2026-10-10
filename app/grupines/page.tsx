"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Globe2,
  MessageCircle,
  BookOpen,
  Languages,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  Loader2,
  BellRing,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Importuojame jūsų Supabase klientą
import { supabase } from "../../lib/supabaseClient";

// ---------- VALIDATION HELPERS ----------

const ALLOWED_SUBJECTS = ["Prancūzų kalba", "Vokiečių kalba"];

// Groups shown in the registration form. Add more here (e.g. Vokiečių kalba) when they open.
const SUBJECT_OPTIONS = [
  { value: "Prancūzų kalba", hint: "Grupė renkama", icon: MessageCircle },
  // { value: "Vokiečių kalba", hint: "Grupė renkama", icon: BookOpen },
];

const CONFIRM_PHRASE = "suprantu, kad kaina yra nuo 22 eur";

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

// ---------- SMALL UI PIECES ----------

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-start gap-1.5 text-sm text-red-600 mt-2 overflow-hidden"
          role="alert"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{message}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// Daugkartinis kainų komponentas kortelėms
function PricingBlock() {
  return (
    <div className="mb-6 space-y-2 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 w-full">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <span className="text-gray-600">Didesnė grupė:</span>
        <span className="font-bold text-gray-900">22 € / pam</span>
      </div>
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <span className="text-gray-600">Maža grupė:</span>
        <span className="font-bold text-gray-900">25 € / pam</span>
      </div>
      <div className="flex justify-between items-center pt-1">
        <span className="text-gray-600">Individualiai:</span>
        <span className="font-bold text-gray-900">40 € / pam</span>
      </div>
    </div>
  );
}

export default function GrupinesPamokos() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [phrase, setPhrase] = useState(""); // Patvirtinimo frazė
  const [honeypot, setHoneypot] = useState(""); // bot trap, real users never see it
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  const phraseOk = phrase.trim().toLowerCase() === CONFIRM_PHRASE;
  const isLoading = status === "loading";

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

    if (!phraseOk) return;

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
        .from("group_registrations")
        .insert([{ email: cleanEmail, phone: cleanPhone, subject: subject }]);

      if (error) {
        throw error;
      }

      setStatus("success");
      setEmail("");
      setPhone("");
      setSubject("");
      setPhrase("");
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
    "w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 text-slate-900 text-base placeholder:text-slate-400 " +
    "border border-slate-200 outline-none transition-all " +
    "hover:border-slate-300 focus:bg-white focus:border-[#3B65CE] focus:ring-4 focus:ring-[#3B65CE]/15 " +
    "disabled:opacity-60 disabled:cursor-not-allowed";
  const inputBad = "!border-red-400 !bg-red-50/40 focus:!ring-red-200";

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
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#3B65CE] mb-6">Grupinės Pamokos</h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Mokykitės kartu su bendraamžiais, dalinkitės žiniomis ir siekite geriausių rezultatų. Pasirinkite užsienio
            kalbų grupes arba kryptingą pasiruošimą mokyklos patikrinimams bei egzaminams. Pamokos trukmė – valanda.
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
            <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed">
              Tobulinkite kalbėjimo, rašymo ir supratimo įgūdžius. Nuo pradedančiųjų (A1) iki pažengusių (C1).
            </p>
            <PricingBlock />
            <div className="bg-gray-50 rounded-xl p-3 text-center mt-auto">
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
            <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed">
              Išmokite meilės ir diplomatijos kalbą. Praktinės užduotys, akcentas į tarimą bei laisvą bendravimą.
            </p>
            <PricingBlock />
            <div className="bg-gray-50 rounded-xl p-3 text-center mt-auto">
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
            <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed">
              Griežta, bet logiška gramatika. Puikus pasirinkimas norintiems studijuoti ar keliauti DACH regione.
            </p>
            <PricingBlock />
            <div className="bg-gray-50 rounded-xl p-3 text-center mt-auto">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Statusas</p>
              <p className="text-sm font-bold text-yellow-600">Grupės pilnos</p>
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
            <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed">
              Atraskite naują pasaulį. Mokomės skaityti, rašyti ir bendrauti viena plačiausiai vartojamų kalbų.
            </p>
            <PricingBlock />
            <div className="bg-gray-50 rounded-xl p-3 text-center mt-auto">
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
            <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed">
              Intensyvus ir kryptingas pasiruošimas Valstybiniams Brandos Egzaminams. Sprendžiame konspektus bei praėjusių
              metų užduotis.
            </p>
            <PricingBlock />
            <div className="bg-gray-50 rounded-xl p-3 text-center mt-auto">
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
            <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed">
              Padedame dešimtokams (II gimnazijos klasėms) pasiruošti Pagrindinio Ugdymo Pasiekimų Patikrinimui be streso.
            </p>
            <PricingBlock />
            <div className="bg-gray-50 rounded-xl p-3 text-center mt-auto">
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
            <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed">
              Sustipriname 4-os ir 8-os klasės mokinių žinias prieš Nacionalinį Mokinių Pasiekimų Patikrinimą.
            </p>
            <PricingBlock />
            <div className="bg-gray-50 rounded-xl p-3 text-center mt-auto">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Statusas</p>
              <p className="text-sm font-bold text-cyan-500">Grupės pilnos</p>
            </div>
          </motion.div>
        </div>

        {/* REGISTRATION SECTION: split card — context on the left, form on the right */}
        <motion.section
          id="registracija"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 rounded-[2rem] overflow-hidden bg-white shadow-2xl ring-1 ring-black/5"
        >
          {/* LEFT: context panel */}
          <div className="relative lg:col-span-2 bg-[#3B65CE] text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur mb-6">
                <BellRing size={24} className="text-yellow-300" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
                Prisijunkite prie laukiančiųjų sąrašo
              </h2>
              <p className="text-blue-100 leading-relaxed">
                Palikite savo kontaktus, o mes susisieksime, kai tik bus renkama jūsų pasirinkta grupė.
              </p>
            </div>

            <ul className="relative mt-10 space-y-4 text-sm">
              {[
                "Registracija nemokama ir jokių įsipareigojimų nekelia",
                "Informaciją perduosime atitinkamos srities mokytojams",
                "Kainos: nuo 22 € už valandos pamoką",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-blue-50">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-slate-900">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: form / success */}
          <div className="lg:col-span-3 p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[360px] flex flex-col items-center justify-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 size={44} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Sėkmingai užregistruota!</h3>
                  <p className="text-slate-600 max-w-sm">
                    Informaciją perduosime atitinkamos srities mokytojams. Laukite laiško!
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleRegistration}
                  noValidate
                  className="flex flex-col gap-6"
                >
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

                  {/* Grupės pasirinkimas */}
                  <fieldset disabled={isLoading}>
                    <legend className="text-sm font-semibold text-slate-800 mb-3">Kokia grupė jus domina?</legend>
                    <div role="radiogroup" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SUBJECT_OPTIONS.map(({ value, hint, icon: Icon }) => {
                        const selected = subject === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => {
                              setSubject(value);
                              clearError("subject");
                            }}
                            className={`flex items-center gap-3 text-left p-4 rounded-2xl border-2 transition-all outline-none focus-visible:ring-4 focus-visible:ring-[#3B65CE]/20 ${
                              selected
                                ? "border-[#3B65CE] bg-blue-50"
                                : errors.subject
                                ? "border-red-300 bg-red-50/40"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                selected ? "bg-[#3B65CE] text-white" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              <Icon size={20} />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block font-semibold text-slate-900">{value}</span>
                              <span className="block text-xs text-slate-500">{hint}</span>
                            </span>
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                selected ? "border-[#3B65CE] bg-[#3B65CE] text-white" : "border-slate-300"
                              }`}
                            >
                              {selected && <Check size={12} strokeWidth={3} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <FieldError message={errors.subject} />
                  </fieldset>

                  {/* El. paštas */}
                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-800 mb-2">
                      El. pašto adresas
                    </label>
                    <div className="relative">
                      <Mail
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="reg-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        maxLength={100}
                        placeholder="vardas@gmail.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError("email");
                        }}
                        onBlur={() => {
                          if (email) setErrors((prev) => ({ ...prev, email: validateEmail(email) ?? undefined }));
                        }}
                        disabled={isLoading}
                        aria-invalid={!!errors.email}
                        className={`${inputBase} ${errors.email ? inputBad : ""}`}
                      />
                    </div>
                    <FieldError message={errors.email} />
                  </div>

                  {/* Telefonas */}
                  <div>
                    <label htmlFor="reg-phone" className="block text-sm font-semibold text-slate-800 mb-2">
                      Telefono numeris
                    </label>
                    <div className="relative">
                      <Phone
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="reg-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        maxLength={20}
                        placeholder="+370 600 00000"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          clearError("phone");
                        }}
                        onBlur={() => {
                          if (phone) setErrors((prev) => ({ ...prev, phone: validatePhone(phone) ?? undefined }));
                        }}
                        disabled={isLoading}
                        aria-invalid={!!errors.phone}
                        className={`${inputBase} ${errors.phone ? inputBad : ""}`}
                      />
                    </div>
                    <FieldError message={errors.phone} />
                  </div>

                  {/* Apsaugos frazė */}
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <label htmlFor="reg-phrase" className="block text-sm text-slate-600 mb-3">
                      Apsaugai nuo šlamšto, prašome tiksliai įvesti šią frazę:
                      <span className="block mt-1.5 font-semibold text-slate-900 select-all">{CONFIRM_PHRASE}</span>
                    </label>
                    <div className="relative">
                      <ShieldCheck
                        size={20}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                          phraseOk ? "text-emerald-500" : "text-slate-400"
                        }`}
                      />
                      <input
                        id="reg-phrase"
                        type="text"
                        autoComplete="off"
                        value={phrase}
                        onChange={(e) => setPhrase(e.target.value)}
                        placeholder="Įveskite patvirtinimo frazę..."
                        disabled={isLoading}
                        className={`${inputBase} bg-white pr-12 ${
                          phraseOk ? "!border-emerald-400 focus:!ring-emerald-200" : ""
                        }`}
                      />
                      <AnimatePresence>
                        {phraseOk && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white"
                          >
                            <Check size={14} strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Būsenos pranešimai */}
                  <AnimatePresence>
                    {status === "duplicate" && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="alert"
                        className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3"
                      >
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>Šis el. paštas jau užregistruotas į pasirinktą grupę.</span>
                      </motion.div>
                    )}
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="alert"
                        className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-3"
                      >
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>Įvyko klaida duomenų bazėje. Prašome pabandyti vėliau.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mygtukas aktyvus TIK TADA, kai frazė teisinga */}
                  <Button
                    type="submit"
                    disabled={isLoading || !phraseOk}
                    className="w-full h-14 rounded-2xl bg-[#3B65CE] hover:bg-[#2f54b3] text-white text-base font-bold shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={20} className="animate-spin" />
                        Siunčiama...
                      </span>
                    ) : (
                      "Registruotis į grupę"
                    )}
                  </Button>

                  {!phraseOk && (
                    <p className="text-center text-xs text-slate-400 -mt-3">
                      Mygtukas taps aktyvus, kai įvesite patvirtinimo frazę.
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.section>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-8 text-sm text-gray-500 border-t border-gray-200 bg-white">
        © {new Date().getFullYear()} Tiksliukai.lt. Visos teisės saugomos.
      </footer>
    </div>
  );
}
