"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, animate } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import Image from "next/image";
import { FaTrophy } from "react-icons/fa";





export default function Home() {
  const router = useRouter();

  // === State & Refs ===
  const [showHeader, setShowHeader] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const lastScrollY = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const teacherRef = useRef<HTMLDivElement>(null);
  const lessonsRef = useRef<HTMLDivElement>(null);
  const scrollToLessons = () => lessonsRef.current?.scrollIntoView({ behavior: "smooth" });
  const [selected, setSelected] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleFAQ = (index: number) => setActiveIndex(activeIndex === index ? null : index);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);


  const faqData = [
  {
    question: "Kokia yra pamokos kaina ir trukmė?",
    answer:
      "Vienos individualios pamokos trukmė – 45 minutės, o kaina – 25 €. Tai viena geriausių kainų už individualų dėmesį.",
  },
  {
    question: "Kaip vyksta pamokos?",
    answer:
      "Pamokos vyksta nuotoliu per Google Meets platformą.",
  },
  {
    question: "Kokių klasių moksleiviams skirtos pamokos?",
    answer:
      "Pamokos skirtos 1–12 klasių moksleiviams.",
  },
  {
    question: "Kaip gausiu prisijungimą prie pamokos?",
    answer:
      "Mokytojas atsiųs Jums pamokos nuorodą apie 30 min. iki pamokos",
  },
  {
    question: "Kaip galima atsiskaityti už pamokas?",
    answer:
      "Galite atsiskaityti Apple Pay, Google Pay ar kortele",
  },
  {
    question: "Kas nutiks, jei mokytojas atšauks pamoką?",
    answer:
      "Tokiu atveju pinigai bus grąžinti automatiškai",
  },
  {
    question: "Kas nutiks, jei vėluosiu?",
    answer:
      "Mokytojas palauks Jūsų iki 10 minučių. Jei vėlavimas ilgesnis, pamokos trukmė gali būti sutrumpinta arba perkelta į kitą laiką.",
  },
];

  // === Scroll header hide/show ===
  useEffect(() => {
    const handleScroll = () => {
      setShowHeader(window.scrollY <= lastScrollY.current || window.scrollY < 10);
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // === Video auto play/pause ===
  useEffect(() => {
  const videoEl = videoRef.current;
  if (!videoEl) return;

  // Make sure video is ready to play
  videoEl.muted = true;
  videoEl.playsInline = true;
  videoEl.pause();
  videoEl.currentTime = 0;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          videoEl.play().catch(() => {
            // Autoplay might fail, ignore
          });
        } else {
          videoEl.pause();
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(videoEl);

  return () => {
    observer.disconnect();
    videoEl.pause();
  };
}, []);


  // === Auth check ===
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && !error) {
          setUser(user);
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, vardas, pavarde")
            .eq("id", user.id)
            .single();
          if (!userError && userData) setUserRole(userData.role);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        checkAuth();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToTeachers = () => teacherRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
  };

  const lessons = [
    { name: "IT", slug: "it" },
    { name: "Matematika", slug: "matematika" },
    { name: "Fizika", slug: "fizika" },
    { name: "Biologija", slug: "biologija" },
    { name: "Chemija", slug: "chemija" },
    { name: "Anglų k.", slug: "anglu-k" },
  ];

  const stats = [
    { icon: "📚", number: 1000, label: "pravestų pamokų" },
    { icon: "😊", number: 100, label: "laimingų klientų" },
    { icon: "🔟", number: 10, label: "gerų pažymių lietus" },
  ];
  const reviews = [
    "Vaiko pažymiai pagerėjo nuo 7 iki 9 – mama Inga",
    "Puikūs mokytojai padėjo pasiruošti egzaminams – tėtis Tomas",
    "Mokytis tapo įdomu ir smagu – mokinė Greta",
    "Individualus dėmesys davė puikių rezultatų – mama Asta",
    "Matematikos baimė dingo po kelių pamokų – mokinys Lukas",
    "Chemija tapo suprantama – mokinė Emilija",
    "Sūnus gavo 90 iš matematikos VBE – tėtis Darius",
    "Mokytoja labai kantri ir motyvuojanti – mama Lina",
    "Anglų kalbos žinios šoktelėjo aukštyn – mokinė Monika",
    "Pasitikėjimas savimi išaugo – mama Jurgita",
    "Fizika pradėjo patikti – mokinys Mantas",
    "Puiki platforma, paprasta naudotis – mama Rasa",
    "Matematika dabar atrodo lengva – mokinė Gabija",
    "Dukros pažymiai pagerėjo per mėnesį – tėtis Paulius",
    "Vaikas pats noriai jungiasi į pamokas – mama Jolanta",
    "Sūnus pradėjo mėgti mokslą – mama Kristina",
    "Biologija tapo mėgstamiausia pamoka – mokinė Austėja",
    "Chemijos kontroliniai nebebaisu – mokinys Karolis",
    "Labai rekomenduoju visiems tėvams – tėtis Vytautas",
    "Tikrai verta – mama Eglė",
  ];
  
  function AnimatedNumber({ value }: { value: number }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
      const controls = animate(0, value, {
        duration: 1.5,
        onUpdate(latest) {
          setCount(Math.floor(latest));
        },
      });
      return () => controls.stop();
    }, [value]);
    return <div className="text-5xl font-extrabold text-blue-600 select-none">{count}+</div>;
  }

  return (

    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm transition-transform duration-300 ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex justify-between items-center px-4 sm:px-8 py-3">
          <div className="flex items-center justify-center">
  <Image
    src="/logo-removebg-preview.png"
    alt="Tiksliukai Logo"
    width={60}
    height={60}
    className="rounded-lg"
  />
</div>
          <nav>
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Hello, {user.email}</span>
                {userRole === "tutor" && (
                  <Button
                    onClick={() => router.push("/tutor_dashboard")}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm"
                  >
                    Tutor Dashboard
                  </Button>
                )}
                {userRole === "client" && (
                  <Button
                    onClick={() => router.push("/student_dashboard")}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 text-sm"
                  >
                    Student Dashboard
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-1 text-sm"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
  {/* Log In / Sign Up buttons (desktop + mobile) */}
  <div className="hidden sm:flex gap-2">
    <button
      onClick={() => router.push("/auth/log-in")}
      className="text-black px-4 py-2 text-sm"
    >
      Log In
    </button>

    <button
      onClick={() => router.push("/auth")}
      className="text-black px-4 py-2 text-sm"
    >
      Sign Up
    </button>
    <a href="#bank-info" className="text-black px-4 py-2 text-sm">
  Pastoviems klientams
</a>
  </div>

  {/* Mobile Hamburger Icon */}
<div className="sm:hidden flex flex-col items-end relative">
  <button
    onClick={() => setMenuOpen(!menuOpen)}
    className="text-gray-700 hover:text-blue-600 p-2 rounded-md"
  >
    {menuOpen ? (
      // Close Icon
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ) : (
      // Hamburger Icon
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )}
  </button>

  {/* Mobile Menu Items */}
  {menuOpen && (
    <div className="mt-2 flex flex-col bg-white shadow-lg rounded-md w-48 py-4 absolute right-0 z-50">
      {/* X Icon Top Right */}
      <button
        onClick={() => setMenuOpen(false)}
        className="absolute top-2 right-2 text-gray-700 hover:text-red-500 p-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <a href="#bank-info" className="px-4 py-2 hover:bg-blue-100 text-gray-800">Pastoviems klientams</a>
      <a href="#apie-mus" className="px-4 py-2 hover:bg-blue-100 text-gray-800">Apie mus</a>
      <a href="#korepetitoriai" className="px-4 py-2 hover:bg-blue-100 text-gray-800">Korepetitoriai</a>
      <a href="/auth" className="px-4 py-2 hover:bg-blue-100 text-gray-800">Prisiregistruoti</a>
      <a href="/auth/log-in" className="px-4 py-2 hover:bg-blue-100 text-gray-800">Prisijungti</a>
      <a href="#pamokos" className="px-4 py-2 hover:bg-blue-100 text-gray-800">Pamokos</a>
    </div>
  )}
</div>


</div>

            )}
          </nav>
        </div>
      </header>
        {/* Main content */}
      <main className="flex flex-col flex-grow scroll-smooth snap-y snap-mandatory">


        
{/* === Hero / Landing Section === */}
  <section className="relative w-full min-h-screen bg-[#3B65CE] text-white overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

      {/* LEFT SIDE */}
      <div className="flex flex-col gap-8">

        {/* Trust */}
        <p className="text-sm text-white/90">
          <strong>100+</strong>{" "}
          <span className="opacity-80">Pagerintų vidurkių!</span>
        </p>

        {/* Headline */}
        <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
          Mes{" "}
          <span className="bg-white text-[#3B65CE] px-3 py-1 rounded-lg">
            padėsime!
          </span>
        </h1>

        {/* Subheadline */}
        <h2 className="text-xl lg:text-2xl font-medium text-white/90 max-w-xl">
          Profesionalūs korepetitoriai ir geresni pažymiai.
        </h2>

        {/* CTA */}
        <a
          href="#"
          className="inline-flex items-center gap-4 bg-[#FF8200] text-black font-semibold px-6 py-4 rounded-full w-fit hover:scale-105 transition-transform"
        >
          Atrask pamokas
          <span className="bg-white rounded-full w-11 h-11 flex items-center justify-center text-xl">
            ↗
          </span>
        </a>

      </div>

      {/* RIGHT SIDE */}
      <div className="relative flex justify-center items-center">
        <div className="w-full max-w-md aspect-[4/5] rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center">
          <span className="text-7xl select-none">📘</span>
        </div>

        {/* Floating accent */}
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[#FF8200]/80 blur-xl" />
      </div>

    </div>
  </section>

       {/* Section 1: Lessons */}
<section
  id="pamokos"
  ref={lessonsRef}
  className="w-full h-[85svh] flex flex-col items-center justify-start snap-start px-4 bg-white relative overflow-hidden" 
  style={{
    backgroundImage: `
      linear-gradient(to right, rgba(0,100,255,0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,100,255,0.1) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
  }}
>
  
  <div className="h-24"></div> {/* spacer for header */}

  {/* Section title */}
  <h1 className="text-5xl font-extrabold mb-2 text-center">
    Pasirinkite pamoką
  </h1>

  {/* Educational project text */}
  <p className="mt-1 mb-8 text-center text-gray-600 text-lg max-w-xl">
    Individualios tiksliųjų mokslų pamokos su profesionaliais mokytojais, kurie prisitaiko prie vaiko mokymosi stiliaus.
  </p>

  {/* Lessons grid */}
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
    {lessons.map((lesson) => (
      <Button
        key={lesson.slug}
        className="w-full min-w-0 px-4 py-3 text-lg font-semibold rounded-2xl bg-[#3B65CE] text-white hover:bg-[#2C4A8E] transition-shadow duration-300 shadow-md"
        onClick={() => router.push(`/schedule/${lesson.slug}`)}
      >
        {lesson.name}
      </Button>
    ))}
  </div>

  {/* Reviews carousel */}
  <div className="w-full h-24 overflow-hidden mb-12 flex items-center"> {/* slim height & vertical center */}
    <motion.div
      className="flex gap-4"
      animate={{ x: ["0%", "-50%"] }} // scroll half width for seamless loop
      transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
    >
      {[...reviews, ...reviews].map((review, i) => (
        <div
          key={i}
          className="min-w-[280px] max-w-xs sm:min-w-[300px] sm:max-w-sm p-3 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center transition-shadow duration-300"
        >
          <p className="text-gray-700 text-sm italic text-center truncate">“{review}”</p>
        </div>
      ))}
    </motion.div>
  </div>
</section>


        <motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  className="w-full min-h-[85svh] flex flex-col justify-center items-center bg-[#3B65CE] snap-start px-6 py-20"
>
  <h2 className="text-5xl text-white font-extrabold mb-8 text-center">
    Kaip veikia sistema?
  </h2>

  {/* Step List as Tip Boxes with stagger animation */}
  <motion.div
    className="max-w-xl flex flex-col gap-6 mb-8"
    variants={{
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.3, // each tip appears 0.3s after previous
        },
      },
    }}
  >
    {[
      "Pasirink mokytoją iš mūsų patikrintos komandos.",
      "Rezervuok pamoką patogiu laiku.",
      "Apmokėk saugiai per mūsų sistemą.",
      "Gauk nuorodą el. paštu ir junkis prie pamokos!",
    ].map((tip, i) => (
      <motion.div
        key={i}
        className={`p-6 rounded-xl shadow-md border-l-4 transition-transform duration-300 hover:scale-105 ${
          i % 2 === 0 ? "bg-white border-blue-800" : "bg-white border-yellow-300"
        }`}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <p className="text-gray-800 text-lg">{tip}</p>
      </motion.div>
    ))}
  </motion.div>
</motion.section>



        

        {/* Section 4: Apie mus */}
        <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full flex flex-col items-center bg-white px-6 py-20"
      id="apie-mus"
    >
      {/* Apie mus */}
      <div className="text-center max-w-3xl mb-16">
        <h2 className="text-5xl font-extrabold mb-6">Apie mus</h2>
        <p className="text-xl text-gray-800 leading-relaxed mb-6 p-6 bg-white rounded-xl shadow-md border-l-4 border-blue-400">
          Tiksliukai.lt – tai studentų edukacinis projektas. <br />
          Dirbame tam, kad mokymasis būtų lengvesnis, efektyvesnis ir
          patogesnis kiekvienam mokiniui Lietuvoje.
        </p>

        {/* Social links */}
<div className="flex justify-center gap-8 text-3xl">
  <a
    href="https://www.instagram.com/tiksliukai.lt/"
    target="_blank"
    rel="noopener noreferrer"
    className="text-pink-500 hover:text-pink-600 transition-colors"
  >
    <FaInstagram />
  </a>
  <a
    href="https://www.facebook.com/tiksliukai"
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 hover:text-blue-700 transition-colors"
  >
    <FaFacebook />
  </a>
</div>
      </div>

      {/* FAQ Accordion */}
<div className="w-full max-w-3xl space-y-4">
  <h2 className="text-5xl font-extrabold mb-6 text-center">DUK</h2>
  {faqData.map((faq, index) => (
    <div
      key={index}
      className={`faq-item bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300`}
    >
      <button
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-800 focus:outline-none"
        aria-expanded={activeIndex === index}
        onClick={() => toggleFAQ(index)}
      >
        <span>{faq.question}</span>
        <span className="text-gray-500 text-xl">
          {activeIndex === index ? "−" : "+"}
        </span>
      </button>
      {activeIndex === index && (
        <div className="faq-answer p-4 border-t border-gray-200 text-gray-700">
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  ))}
</div>

    </motion.section>


        {/* Section 5: Misija ir vizija */}
<motion.section
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  className="relative w-full min-h-screen flex flex-col justify-center items-center bg-[#3B65CE] snap-start px-6 py-20 overflow-hidden"
>
  {/* Baltic States Map Background */}
  <svg
    className="absolute inset-0 w-full h-full opacity-10"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 1000"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      d="M350 50 L420 80 L460 150 L480 250 L470 350 L430 420 L400 500 L380 600 L350 680 L300 750 L250 730 L220 650 L200 550 L210 450 L250 350 L300 250 L320 150 Z"
      fill="white"
      fillOpacity="0.15"
      stroke="white"
      strokeWidth="2"
    />
  </svg>

  {/* Content */}
  <h2 className="relative z-10 text-5xl font-extrabold mb-8 text-center text-white">
    Mūsų misija ir vizija 
  </h2>
  <p className="relative z-10 max-w-3xl text-xl text-white leading-relaxed text-center">
    <span className="font-bold text-yellow-400">Mūsų misija</span> – suteikti kiekvienam vaikui galimybę mokytis iš geriausių mokytojų, nepriklausomai nuo jų gyvenamos vietos ar galimybių.
    <br />
    <span className="font-bold text-yellow-400">Vizija</span> – būti Nr. 1 korepetitorių platforma Baltijos šalyse.
  </p>

  {/* BIG ICON BELOW */}
  <motion.div
    initial={{ scale: 0 }}
    whileInView={{ scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="relative z-10 mt-12 text-yellow-400"
  >
    <FaTrophy className="w-24 h-24 md:w-32 md:h-32" />
  </motion.div>
</motion.section>




        {/* Section 6: Statistika */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full min-h-[50vh] flex flex-col justify-center items-center bg-white snap-start px-6 py-20"
        >
          <h2 className="text-4xl font-extrabold mb-12 text-center">Statistika</h2>
          <div className="flex flex-col md:flex-row gap-16 justify-center items-center max-w-5xl w-full">
            {stats.map(({ icon, number, label }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="text-7xl mb-4 select-none">{icon}</div>
                <AnimatedNumber value={number} />
                <div className="mt-2 text-xl text-gray-700 text-center">{label}</div>
              </div>
            ))}
          </div>
        </motion.section>

       {/* Section 7: Mūsų Mokytojai */}
<motion.section
  ref={teacherRef}
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  id="korepetitoriai"
  className="w-full min-h-screen flex flex-col justify-center items-center bg-white snap-start px-6 py-32"
>
  <h2 className="text-5xl font-extrabold mb-12 text-center">Mūsų Mokytojai</h2>

  <div className="flex gap-8 justify-center flex-wrap max-w-6xl mx-auto">
    {[
      {
        name: "Justė Giedraitytė",
        subject: "Matematika, Anglų kalba",
        experience: "2 metai",
        languages: "Lietuvių, Anglų",
        description:
          "Esu Justė, politikos mokslų studentė iš Vilniaus. Ne visada mylėjau matematiką ir prisiekinėjau sau, jog nieko bendro su tuo neturėsiu ateityje. Tačiau ilgainiui, su daug sunkaus darbo, pamilau matematiką ir net vienus savo gyvenimo metus ją studijavau! Tas, manau, ir yra unikalu apie mane - žinau, kaip paaiškinti užduotis, taip, kad net visiškai žalias suprastų:)",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/IMG_5420.jpeg",
      },
      {
        name: "Aleksandras Šileika",
        subject: "Matematika",
        experience: "1 metai",
        languages: "Lietuvių, Anglų",
        description:
          "Esu matematikos korepetitorius, studijuojantis matematiką Bonos universitete (Vokietijoje). Iš matematikos VBE gavau 100 balų. Puikiai suprantu atnaujintą bendrąją ugdymo programą ir žinau, kokie iššūkiai laukia mokinių ruošiantis kontroliniams, NMPP, PUPP ar VBE.",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/E0Tsj4D9OTOfOSOhS6zfFxwscH4sVtb8INL9xPp4.jpg",
      },
      {
        name: "Darija Stanislavovaitė",
        subject: "IT",
        experience: "1 metai",
        languages: "Lietuvių, Rusų",
        description:
          "Draugiška mokytoja, kuri moko per praktinius pavyzdžius. Darija yra VGTU studentė ir informatikos korepetitorė.",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/da.jpg",
      },
      {
        name: "Nomeda Sabienė",
        subject: "Chemija, Biologija, Fizika",
        experience: "15 metų",
        languages: "Lietuvių, Anglų",
        description:
          "Esu aplinkos chemijos ir ekologijos mokslų daktarė, gamtos mokslus suprantu kaip vientisą nedalomą/holistinę visumą. Galiu paaiškinti įvairius chemijos, fizikos, biologijos klausimus iš visų šių mokslų pozicijų. Ilgametė pedagoginė patirtis leidžia suteikti pagrindus sunkiau besimokantiems, ruošti moksleivius olimpiadoms ir VBE. Mano moto: kartu lengviau!",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/20200624_203645-1.jpg",
      },
      {
        name: "Kajus Tutor",
        subject: "Matematika, Fizika",
        experience: "2 metai",
        languages: "Lietuvių, Anglų",
        description:
          "Esu Kajus, mokau matematiką ir fiziką. Mėgstu paaiškinti sudėtingas temas paprastai ir suprantamai, kad kiekvienas mokinys galėtų jas įsisavinti.",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/anon.avif",
      },
      {
        name: "Kristina Balnytė",
        subject: "Matematika, Anglų kalba",
        experience: "2 metai",
        languages: "Lietuvių, Anglų",
        description:
          "Esu matematikos ir lietuvių kalbos korepetitorė. Padedu pasiruošti atsiskaitymams, kontroliniams darbams, atlikti namų darbus ar pagilinti žinias. Kiekvienam mokiniui taikau individualią mokymo strategiją, nes žinau, kad vieno „stebuklingo“ metodo nėra. Mano tikslas - ne tik geresni pažymiai, bet ir augantis pasitikėjimas savimi. Jei ieškote korepetitoriaus, kuris aiškiai paaiškina, palaiko ir motyvuoja, mielai padėsiu jūsų vaikui žengti pirmyn.",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/kr.jpg",
      },
      {
        name: "Dovydas Žilinskas",
        subject: "Matematika, IT",
        experience: "2 metai",
        languages: "Lietuvių, Anglų",
        description:
          "Aš esu Dovydas, kiekybinės ekonomikos studentas VU. Turiu patirties ruošiant mokinius tiek matematikos, tiek IT egzaminams. Mano pamokos yra interaktyvios ir pritaikytos prie kiekvieno mokinio poreikių.",
          img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/1701519636194.jpeg",
      }
    ].map((teacher, i) => (
      <div
        key={i}
        className="w-72 bg-[#3B65CE] rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform duration-300 flex flex-col items-center"
      >
        <img
          src={teacher.img}
          alt={teacher.name}
          className="h-40 w-40 object-cover rounded-full mb-4"
        />
        <h3 className="text-xl text-white font-bold mb-3 text-center">{teacher.name}</h3>

        {/* Highlighted tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          <span className="bg-red-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {teacher.subject}
          </span>
          <span className="bg-yellow-400 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            Patirtis: {teacher.experience}
          </span>
          <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            Kalbos, kuriomis galimos pamokos: {teacher.languages}
          </span>
        </div>

        <p className="text-white text-sm text-center">{teacher.description}</p>
      </div>
    ))}
  </div>
</motion.section>



      {/* Section 3: Kam man registruotis */}
<motion.section
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="relative w-full min-h-screen flex flex-col justify-center items-center bg-[#3B65CE] snap-start px-4 py-16 sm:px-6 lg:px-20 overflow-hidden"
>
  {/* Yellow Ribbon */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="w-[250%] h-32 bg-yellow-400 rotate-[-8deg] opacity-70"></div>
  </div>

  {/* Minimalist Navigation Path */}
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    {/* Smooth red curved path */}
    <path
      d="M 0 400 Q 300 200, 600 400 T 1200 400"
      stroke="#DC2626"          
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeDasharray="10 14"
    />

    {/* Waypoints */}
    <circle cx="0" cy="400" r="6" fill="#DC2626" />
    <circle cx="600" cy="400" r="6" fill="#DC2626" />
    <circle cx="1200" cy="400" r="6" fill="#DC2626" />
  </svg>

  {/* Content Card */}
  <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 sm:p-12 flex flex-col items-center gap-6">
    <h2 className="text-3xl sm:text-5xl font-extrabold text-center mb-4">
      Kam man registruotis?
    </h2>
    <p className="text-base sm:text-lg text-gray-700 text-center max-w-2xl">
      Užsiregistravę galėsite stebėti vaiko progresą, pamokų rezultatus ir mokymosi tendencijas.
    </p>
  </div>
</motion.section>
{/* Section: Bank Details */}
<motion.section
  id="bank-info"
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="relative w-full min-h-screen flex flex-col justify-center items-center bg-[#E2E8F0] snap-start px-4 py-16 sm:px-6 lg:px-20 overflow-hidden"
>
  {/* Decorative background */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="w-[250%] h-32 bg-[#3B65CE] rotate-[-6deg] opacity-10"></div>
  </div>

  {/* Content Card */}
  <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 sm:p-12 flex flex-col items-center gap-6 text-center">
    <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 text-[#3B65CE]">
      Jei turite pastovius laikus, galite apmokėti paprasčiau.
    </h2>
    <p className="text-base sm:text-lg text-gray-700 max-w-2xl">
      Pamokos kaina yra 25eur. Galite pervesti pinigus už susitartą pamokų skaičių netikrinant naujų laikų.
    </p>

    {/* Bank Info Placeholder */}
    <div className="bg-[#F9FAFB] border border-gray-200 rounded-2xl px-6 py-4 text-left w-full max-w-md mt-4">
      <p className="font-semibold text-gray-800">Vardas, Pavardė:</p>
      <p className="text-gray-700 mb-3">Dovydas Žilinskas</p>

      <p className="font-semibold text-gray-800">IBAN:</p>
      <p className="text-gray-700 mb-3">LT077300010164121505</p>

      <p className="font-semibold text-gray-800">Bankas:</p>
      <p className="text-gray-700">SWEDBANK</p>
    </div>

    <p className="text-sm text-gray-500 mt-4">
      *Prašome patikrinti informaciją prieš atlikdami pavedimą.
    </p>
  </div>
</motion.section>



      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
