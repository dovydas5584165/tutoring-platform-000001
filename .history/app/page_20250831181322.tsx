"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, animate } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { Button } from "@/components/ui/button"; // <-- Import your Button component

const lessons = [
  { name: "IT", slug: "it" },
  { name: "Matematika", slug: "matematika" },
  { name: "Fizika", slug: "fizika" },
  { name: "Biologija", slug: "biologija" },
  { name: "Chemija", slug: "chemija" },
  { name: "Anglų k.", slug: "anglu-k" },
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

  return (
    <div className="text-5xl font-extrabold text-blue-600 select-none">{count}+</div>
  );
}

export default function Home() {
  const router = useRouter();
  const teacherRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (user && !error) {
          setUser(user);

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role, vardas, pavarde')
            .eq('id', user.id)
            .single();

          if (!userError && userData) {
            setUserRole(userData.role);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToTeachers = () => {
    teacherRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
  };

  const stats = [
    { icon: "📚", number: 1000, label: "pravestų pamokų" },
    { icon: "😊", number: 100, label: "laimingų klientų" },
    { icon: "🔟", number: 10, label: "gerų pažymių lietus" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
<header className="flex justify-between items-center px-4 sm:px-8 py-4 border-b border-gray-200 shadow-sm sticky top-0 bg-white z-50">
  <div className="text-2xl font-extrabold tracking-tight">Tiksliukai.lt</div>
  <nav>
    {loading ? (
      <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
    ) : user ? (
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2">
        <span className="text-sm text-gray-600">Hello, {user.email}</span>
        {userRole === 'tutor' && (
          <Button
            onClick={() => router.push('/tutor_dashboard')}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            Tutor Dashboard
          </Button>
        )}
        {userRole === 'client' && (
          <Button
            onClick={() => router.push('/student_dashboard')}
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
          >
            Student Dashboard
          </Button>
        )}
        <Button
          onClick={handleLogout}
          className="bg-gray-200 text-gray-700 hover:bg-gray-300 w-full sm:w-auto"
        >
          Logout
        </Button>
      </div>
    ) : (
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={() => router.push("/auth/log-in")}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          Log In
        </Button>
        <Button
          onClick={() => router.push("/auth")}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          Sign Up
        </Button>
      </div>
    )}
  </nav>
</header>


      {/* Main content */}
      <main className="flex flex-col flex-grow overflow-y-auto scroll-smooth snap-y snap-mandatory">
        {/* Section 1: Pasirink pamoką */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full min-h-screen flex flex-col justify-center items-center snap-start px-4 bg-white"
        >
          <h1 className="text-5xl font-extrabold mb-10 text-center">Pasirinkite pamoką</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {lessons.map((lesson) => (
              <Button
                key={lesson.slug}
                className="w-full min-w-0 px-6 py-4 text-xl font-semibold rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-shadow duration-300 shadow-md"
                onClick={() => router.push(`/schedule/${lesson.slug}`)}
                >
                {lesson.name}
              </Button>

            ))}
          </div>
        </motion.section>

        {/* Section 2: Hero video */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-white snap-start px-6 py-20"
        >
          <video
            className="w-full max-w-6xl rounded-none"
            autoPlay
            muted
            playsInline
            src="https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/videos/60d7accd-ab26-4a57-b66a-462e1f6d0e0b.mov"
          />
          <Button onClick={scrollToTeachers} className="mt-10 px-6 py-3 text-lg">
            Mūsų mokytojai
          </Button>
        </motion.section>

        <motion.section
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-white snap-start px-6 py-20"
>
  <h2 className="text-5xl font-extrabold mb-8 text-center">
    Tobulėk čia ir dabar
  </h2>
  <p className="max-w-2xl text-xl text-gray-700 leading-relaxed text-center">
    Pasirink pamoką, rezervuok ją apmokėdamas, gauk nuorodą į pamoką.
  </p>
</motion.section>


        {/* Additional sections remain unchanged, only headers, text, and layout preserved */}

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
            Užsiregistravę galėsite stebėti vaiko progresą ir matyti, ką jis mokosi.
          </p>
        </motion.section>

        {/* Section 4: Apie mus */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full min-h-screen flex flex-col justify-center items-center bg-white snap-start px-6 py-20"
        >
          <h2 className="text-5xl font-extrabold mb-8 text-center">Apie mus</h2>
          <p className="max-w-3xl text-xl text-gray-700 leading-relaxed text-center">
            Tiksliukai.lt – tai platforma, sukurta padėti mokiniams rasti aukštos kokybės korepetitorius.
            Dirbame tam, kad mokymasis būtų lengvesnis, efektyvesnis ir patogesnis kiekvienam mokiniui Lietuvoje.
          </p>
        </motion.section>

        {/* Section 5: Misija ir vizija */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full min-h-screen flex flex-col justify-center items-center bg-blue-50 snap-start px-6 py-20"
        >
          <h2 className="text-5xl font-extrabold mb-8 text-center">Mūsų misija ir vizija</h2>
          <p className="max-w-3xl text-xl text-gray-800 leading-relaxed text-center">
            <strong>Mūsų misija</strong> – suteikti kiekvienam vaikui galimybę mokytis iš geriausių mokytojų, nepriklausomai nuo jų gyvenamos vietos ar galimybių.
            <br />
            <strong>Vizija</strong> – būti Nr. 1 korepetitorių platforma Baltijos šalyse.
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
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-72 bg-blue-50 rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className="h-40 w-40 mx-auto bg-gray-300 rounded-full mb-4" />
                <h3 className="text-xl font-bold mb-2 text-center">Mokytojas {i}</h3>
                <p className="text-gray-600 text-sm text-center">
                  Specializacija: Matematika, Fizika <br /> Patirtis: 5 metai
                </p>
              </div>
            ))}
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
