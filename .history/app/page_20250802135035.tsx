"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const lessons = [
  { name: "IT", slug: "it" },
  { name: "Matematika", slug: "matematika" },
  { name: "Fizika", slug: "fizika" },
  { name: "Biologija", slug: "biologija" },
  { name: "Chemija", slug: "chemija" },
  { name: "Anglų k.", slug: "anglu-k" },
];

export default function Home() {
  const router = useRouter();
  const teacherRef = useRef<HTMLDivElement>(null);

  const scrollToTeachers = () => {
    teacherRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Video state to toggle between first and second video
  const [showFirstVideo, setShowFirstVideo] = useState(true);
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);

  const onFirstVideoEnded = () => {
    setShowFirstVideo(false);
    // Play second video manually (some browsers require user interaction or explicit play)
    secondVideoRef.current?.play();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm sticky top-0 bg-white z-50">
        <div className="text-2xl font-extrabold tracking-tight">Tiksliukai.lt</div>
        <nav className="space-x-4">
          <button
            onClick={() => router.push("/auth/log-in")}
            className="px-5 py-2 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 transition"
          >
            Log In
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="px-5 py-2 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 transition"
          >
            Sign In
          </button>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl">
            {lessons.map((lesson) => (
              <button
                key={lesson.slug}
                onClick={() => router.push(`/schedule/${lesson.slug}`)}
                className="w-full px-8 py-6 bg-blue-600 rounded-2xl text-white text-2xl font-semibold hover:bg-blue-700 shadow-xl transition-all duration-300"
              >
                {lesson.name}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Section 2: Video seamless autoplay */}
        <motion.section
          className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-white px-6 py-20 snap-start"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <AnimatePresence mode="wait">
            {showFirstVideo ? (
              <motion.video
                key="first-video"
                ref={firstVideoRef}
                className="w-full max-w-6xl rounded-none"
                src="https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/videos/60d7accd-ab26-4a57-b66a-462e1f6d0e0b.mov"
                autoPlay
                muted
                playsInline
                onEnded={onFirstVideoEnded}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8 }}
                controls={false}
              />
            ) : (
              <motion.video
                key="second-video"
                ref={secondVideoRef}
                className="w-full max-w-6xl rounded-none"
                src="https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/videos/fe4fa1d0-a4a6-464c-a058-af48d73ffd71.mp4"
                autoPlay
                muted
                playsInline
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.8 }}
                controls={false}
              />
            )}
          </AnimatePresence>

          <button
            onClick={scrollToTeachers}
            className="mt-10 px-6 py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
          >
            Mūsų mokytojai
          </button>
        </motion.section>

        {/* Section 3: Kam man registruotis? */}
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

        {/* Section 5: Mūsų misija ir vizija */}
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
            <div className="flex flex-col items-center">
              <div className="text-7xl mb-4 select-none">📚</div>
              <div className="text-5xl font-extrabold text-blue-600 select-none">1000+</div>
              <div className="mt-2 text-xl text-gray-700 text-center">pravestų pamokų</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-7xl mb-4 select-none">😊</div>
              <div className="text-5xl font-extrabold text-blue-600 select-none">100+</div>
              <div className="mt-2 text-xl text-gray-700 text-center">laimingų klientų</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-7xl mb-4 select-none">🔟</div>
              <div className="text-5xl font-extrabold text-blue-600 select-none">10+</div>
              <div className="mt-2 text-xl text-gray-700 text-center">gerų pažymių lietus</div>
            </div>
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
