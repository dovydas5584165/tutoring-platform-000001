"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, animate } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/button";

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
          <div className="text-2xl font-extrabold tracking-tight">Tiksliukai.lt</div>
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
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push("/auth/log-in")}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm"
                >
                  Log In
                </Button>
                <Button
                  onClick={() => router.push("/auth")}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>
        {/* Section 1: Lessons */}
        {/* Main content */}
      <main className="flex flex-col flex-grow scroll-smooth snap-y snap-mandatory">
        {/* Section 1: Lessons */}
        <section className="w-full min-h-screen flex flex-col justify-center items-center snap-start px-4 bg-white relative">
          <div className="h-24"></div> {/* spacer for header */}

          {/* === Reviews Section (above pasirinkite pamoką) === */}
          {/* === Reviews Section (Above "Pasirinkite pamoką") === */}
{/* === Reviews Section (Above "Pasirinkite pamoką") === */}
<div className="w-full py-6 mb-12 bg-white overflow-hidden">
  <motion.div
    className="flex gap-6"
    animate={{ x: ["0%", "-100%"] }}
    transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
  >
    {[...reviews, ...reviews].map((review, i) => (
      <div
        key={i}
        className="min-w-[280px] max-w-xs sm:min-w-[300px] sm:max-w-sm p-4 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
      >
        <p className="text-gray-700 text-base italic text-center">“{review}”</p>
      </div>
    ))}
  </motion.div>
</div>



          <h1 className="text-5xl font-extrabold mb-10 text-center">
            Pasirinkite pamoką
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
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

          {/* Educational project text */}
          <p className="mt-8 text-center text-gray-600 text-lg max-w-xl">
            Studentų edukacinis projektas, skirtas skatinti jaunimą mokytis
            tiksliųjų mokslų.
          </p>

        </section>

        <motion.section
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="w-full min-h-screen flex flex-col justify-center items-center bg-white snap-start px-6 py-20"
>
  <h2 className="text-5xl font-extrabold mb-8 text-center">
    Kaip veikia sistema?🚀
  </h2>
  <p className="max-w-2xl text-xl text-gray-700 leading-relaxed text-center">
    Tobulėk čia ir dabar: pasirink mokytoją, rezervuok pamoką apmokėdamas ir gauk nuorodą į ją el. paštu.
    Greita, efektyvu, patikima.
  </p>
</motion.section>

        

        {/* Section 4: Apie mus */}
        <motion.section
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="w-full min-h-screen flex flex-col justify-center items-center bg-blue-50 snap-start px-6 py-20"
>
  <h2 className="text-5xl font-extrabold mb-8 text-center">Apie mus</h2>
  <p className="max-w-3xl text-xl text-gray-700 leading-relaxed text-center mb-6">
    Tiksliukai.lt – tai platforma, sukurta padėti mokiniams rasti aukštos kokybės korepetitorius.
    Dirbame tam, kad mokymasis būtų lengvesnis, efektyvesnis ir patogesnis kiekvienam mokiniui Lietuvoje.
  </p>

  {/* Social links */}
  <div className="flex gap-6">
    <a
      href="https://www.instagram.com/tiksliukai.lt/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-pink-500 hover:text-pink-600 text-2xl font-bold transition-colors"
    >
      Instagram
    </a>
    <a
      href="https://www.facebook.com/tiksliukai"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-700 text-2xl font-bold transition-colors"
    >
      Facebook
    </a>
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
        subject: "Matematika, anglų kalba",
        experience: "2 metai",
        description: "Esu Justė, politikos mokslų studentė iš Vilniaus. Ne visada mylėjau matematiką ir prisiekinėjau sau, jog nieko bendro su tuo neturėsiu ateityje. Tačiau ilgainiui, su daug sunkaus darbo, pamilau matematiką ir net vienus savo gyvenimo metus ją studijavau! Tas, manau, ir yra unikalu apie mane - žinau, kaip paaiškinti užduotis, taip, kad net visiškai žalias suprastų:) ",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/IMG_5420.jpeg",
      },
      {
        name: "Aleksandras Šileika",
        subject: "Matematika",
        experience: "1 metai",
        description: "Esu matematikos korepetitorius, studijuojantis matematiką Bonos universitete (Vokietijoje). Iš matematikos VBE gavau 100 balų. Puikiai suprantu atnaujintą bendrąją ugdymo programą ir žinau, kokie iššūkiai laukia mokinių ruošiantis kontroliniams, NMPP, PUPP ar VBE.",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/E0Tsj4D9OTOfOSOhS6zfFxwscH4sVtb8INL9xPp4.jpg",
      },
      {
        name: "Darija Stanislavovaitė",
        subject: "IT",
        experience: "1 metai",
        description: "Draugiška mokytoja, kuri moko per praktinius pavyzdžius. Darija yra VGTU studentė ir informatikos korepetitorė.",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/da.jpg",
      },
      {
        name: "Nomeda Sabienė",
        subject: "Chemija, biologija, fizika",
        experience: "15 metų",
        description: "Esu aplinkos chemijos ir ekologijos mokslų daktarė, gamtos mokslus suprantu kaip vientisą nedalomą/holistinę visumą. Galiu paaiškinti įvairius chemijos, fizikos, biologijos klausimus iš visų šių mokslų pozicijų. Ilgametė pedagoginė patirtis leidžia suteikti pagrindus sunkiau besimokantiems, ruošti moksleivius olimpiadoms ir VBE. Mano moto: kartu lengviau! ",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/20200624_203645-1.jpg",
      },
      {
        name: "Kajus Tutor",
        subject: "Matematika, fizika",
        experience: "2 metai",
        description: "Esu Kajus, mokau matematiką ir fiziką. Mėgstu paaiškinti sudėtingas temas paprastai ir suprantamai, kad kiekvienas mokinys galėtų jas įsisavinti.",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/anon.avif",
      },
      {
        name: "Kristina Balnytė",
        subject: "Matematika, anglų kalba",
        experience: "2 metai",
        description: "Esu matematikos ir lietuvių kalbos korepetitorė. Padedu pasiruošti atsiskaitymams, kontroliniams darbams, atlikti namų darbus ar pagilinti žinias. Kiekvienam mokiniui taikau individualią mokymo strategiją, nes žinau, kad vieno „stebuklingo“ metodo nėra. Mano tikslas - ne tik geresni pažymiai, bet ir augantis pasitikėjimas savimi. Jei ieškote korepetitoriaus, kuris aiškiai paaiškina, palaiko ir motyvuoja, mielai padėsiu jūsų vaikui žengti pirmyn.",
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
        <h3 className="text-xl font-bold mb-2 text-center">{teacher.name}</h3>
        <p className="text-gray-600 text-sm text-center mb-2">
          Specializacija: {teacher.subject} <br /> Patirtis: {teacher.experience}
        </p>
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
          className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-white snap-start px-6 py-20"
        >
          <h2 className="text-5xl font-extrabold mb-8 text-center">Kam man registruotis?</h2>
          <p className="max-w-2xl text-xl text-gray-700 leading-relaxed text-center">
            Užsiregistravę galėsite stebėti vaiko progresą ir matyti, ką jis mokosi. 📈
          </p>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
