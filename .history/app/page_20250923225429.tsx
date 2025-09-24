"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, animate } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import Image from "next/image";




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
      "Galite atsisakityti Apple Pay, Google Pay ar kortele",
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
  </div>

  {/* Mobile Hamburger Icon */}
  <div className="sm:hidden flex items-center">
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="text-gray-700 hover:text-green-600 p-2 rounded-md"
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
  </div>
</div>

            )}
          </nav>
        </div>
      </header>
        {/* Main content */}
      <main className="flex flex-col flex-grow scroll-smooth snap-y snap-mandatory">


        
{/* === Hero/Landing Section: Percent Puzzle Game === */}
<section className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-400 to-blue-800 text-white snap-start px-6">
  {/* Puzzle Card */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 1 }}
    className="max-w-md w-full bg-white text-gray-900 rounded-3xl shadow-2xl p-8 mb-10 text-center relative overflow-hidden"
  >
    <p className="text-2xl mb-6 text-gray-800">
       Kas didesnis: 20% nuo 50 ar 50% nuo 20?
    </p>

    {/* input answer */}
    <div className="flex flex-col gap-4 mb-6">
      <Button
        onClick={() => setSelected("20% nuo 50")}
        className="w-full bg-gray-300 hover:bg-blue-700 text-black"
      >
        parašykite atsakymą...
      </Button>
    </div>

    {/* Reveal Animation */}
    {selected && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-lg text-gray-700 font-semibold mb-2"
      >
        👉 Abiejais atvejais atsakymas yra —{" "}
        <span className="text-blue-600 font-bold">10</span> 🎉
      </motion.div>
    )}

    {selected && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-4 text-gray-600 text-sm"
      >
        Tai yra pirmasis 10-ukas, kurį pamatėte su mumis, bet tikrai ne paskutinis!
      </motion.p>
    )}
    </motion.div>
  {/* Single CTA */}
  <Button
    onClick={scrollToLessons}
    className="px-8 py-4 text-lg font-semibold rounded-full bg-yellow-400 text-black hover:bg-yellow-500 transition-transform transform hover:scale-105 shadow-lg"
  >
    Atrask pamokas 
  </Button>
</section>


       {/* Section 1: Lessons */}
<section
  ref={lessonsRef}
  className="w-full min-h-screen flex flex-col justify-center items-center snap-start px-4 bg-white relative"
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
        className="w-full min-w-0 px-4 py-3 text-lg font-semibold rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-shadow duration-300 shadow-md"
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
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="w-full min-h-screen flex flex-col justify-center items-center bg-blue-600 snap-start px-6 py-20"
>
  <h2 className="text-5xl text-white font-extrabold mb-8 text-center">
    Kaip veikia sistema? 
  </h2>

  <p className="max-w-2xl text-xl text-gray-700 leading-relaxed text-center mb-10">
    Tobulėk čia ir dabar:
  </p>

  {/* Step List */}
  <div className="max-w-xl space-y-6 mb-8">
    {[
      { num: 1, text: "Pasirink mokytoją iš mūsų patikrintos komandos." },
      { num: 2, text: "Rezervuok pamoką patogiu laiku." },
      { num: 3, text: "Apmokėk saugiai per mūsų sistemą." },
      { num: 4, text: "Gauk nuorodą el. paštu ir junkis prie pamokos!" },
    ].map((step, i) => (
      <div key={i} className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-400 text-black flex items-center justify-center font-bold text-lg shadow-md">
          {step.num}
        </div>
        <p className="text-lg text-gray-800 leading-relaxed">
          <strong>{step.text.split(" ")[0]}</strong>{" "}
          {step.text.split(" ").slice(1).join(" ")}
        </p>
      </div>
    ))}
  </div>

  {/* Tip Box */}
  <div className="max-w-xl bg-blue-50 border-l-4 border-blue-400 text-gray-800 p-4 rounded-lg shadow-sm">
    <p className="text-base">
      <strong>Ar žinojote?:</strong> Galite rezervuoti visas mėnesio pamokas iškart.
    </p>
  </div>
</motion.section>



        

        {/* Section 4: Apie mus */}
        <motion.section
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full flex flex-col items-center bg-blue-50 px-6 py-20"
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
  initial={{ opacity: 0, y: 20 }}       // reduce y to make the slide subtle
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }} // trigger when 30% of section is visible
  transition={{ duration: 0.5, ease: "easeOut" }} // shorter duration, smoother easing
  className="w-full min-h-screen flex flex-col justify-center items-center bg-blue-600 snap-start px-6 py-20"
>
  <h2 className="text-5xl font-extrabold mb-8 text-center text-white">
    Mūsų misija ir vizija ⭐
  </h2>
  <p className="max-w-3xl text-xl text-white leading-relaxed text-center">
    <span className="font-bold text-yellow-600">Mūsų misija</span> – suteikti kiekvienam vaikui galimybę mokytis iš geriausių mokytojų, nepriklausomai nuo jų gyvenamos vietos ar galimybių.
    <br />
    <span className="font-bold text-yellow-600">Vizija</span> – būti Nr. 1 korepetitorių platforma Baltijos šalyse.
  </p>
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
    ].map((teacher, i) => (
      <div
        key={i}
        className="w-72 bg-blue-50 rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform duration-300 flex flex-col items-center"
      >
        <img
          src={teacher.img}
          alt={teacher.name}
          className="h-40 w-40 object-cover rounded-full mb-4"
        />
        <h3 className="text-xl font-bold mb-3 text-center">{teacher.name}</h3>

        {/* Highlighted tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
            {teacher.subject}
          </span>
          <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-xs font-medium">
            Patirtis: {teacher.experience}
          </span>
          <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-xs font-medium">
            Kalbos, kuriomis galimos pamokos: {teacher.languages}
          </span>
        </div>

        <p className="text-gray-700 text-sm text-center">{teacher.description}</p>
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
  className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-white snap-start px-4 py-16 sm:px-6 lg:px-20"
>
  <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-8 sm:p-12 flex flex-col items-center gap-6">
    <h2 className="text-3xl sm:text-5xl font-extrabold text-center mb-4">Kam man registruotis?</h2>
    <p className="text-base sm:text-lg text-gray-700 text-center max-w-2xl">
      Užsiregistravę galėsite stebėti vaiko progresą, pamokų rezultatus ir mokymosi tendencijas.
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
