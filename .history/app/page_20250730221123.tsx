"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type Lesson = {
  name: string;
  slug: string;
};

export default function Home() {
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  const lessons: Lesson[] = [
    { name: "IT", slug: "it" },
    { name: "Matematika", slug: "matematika" },
    { name: "Fizika", slug: "fizika" },
    { name: "Biologija", slug: "biologija" },
    { name: "Chemija", slug: "chemija" },
    { name: "Anglų k.", slug: "anglu-k" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm">
        <div className="text-xl font-semibold tracking-tight">Tiksliukai.lt</div>
        <nav className="space-x-4">
          <button
            onClick={() => router.push("/auth/log-in")}
            className="px-4 py-2 bg-blue-600 rounded-xl text-white font-bold"
          >
            Log In
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="px-4 py-2 bg-blue-600 rounded-xl text-white font-bold"
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Main */}
      <main className="flex flex-col items-center px-4 text-center">
        <h1 className="text-2xl font-semibold my-8">Pasirinkite pamoką:</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-xl">
          {lessons.map((lesson) => (
            <button
              key={lesson.slug}
              onClick={() => router.push(`/schedule/${lesson.slug}`)}
              className="px-8 py-4 bg-blue-600 rounded-xl text-white font-bold text-lg hover:bg-blue-700 transition"
            >
              {lesson.name}
            </button>
          ))}
        </div>

        {/* Slide Section: Kaip tai veikia */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: scrollY > 50 ? 1 : 0, y: scrollY > 50 ? 0 : 50 }}
          transition={{ duration: 0.6 }}
          className="mt-32 max-w-2xl text-left"
        >
          <h2 className="text-2xl font-bold mb-4">Kaip tai veikia?</h2>
          <p className="text-gray-700 mb-6">
            Pasirinkite pamoką, raskite laisvą mokytojo laiką ir rezervuokite susitikimą internetu.
            Viskas vyksta per „Google Meet“ – jums nieko papildomai daryti nereikia!
          </p>

          <h2 className="text-2xl font-bold mb-4">Pirmas susitikimas visada be įsipareigojimų</h2>
          <p className="text-gray-700">
            Jei jums patiks mokytojas – galėsite įsigyti planą ar susitarti dėl reguliarių pamokų.
            Jei ne – bandykite su kitu, jokio spaudimo.
          </p>
        </motion.section>

        {/* Carousel Section: Mūsų mokytojai */}
        <motion.section
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: scrollY > 150 ? 1 : 0, y: scrollY > 150 ? 0 : 100 }}
          transition={{ duration: 0.6 }}
          className="mt-24 w-full"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Mūsų mokytojai</h2>
          <div className="flex space-x-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory">
            {[1, 2, 3, 4].map((id) => (
              <div
                key={id}
                className="snap-start flex-shrink-0 bg-white border border-gray-300 rounded-xl shadow-md p-4 w-64"
              >
                <div className="h-32 w-full bg-gray-200 rounded mb-4" />
                <h3 className="font-semibold text-lg mb-1">Mokytojas {id}</h3>
                <p className="text-sm text-gray-600">Patirtis: 5 metai</p>
                <p className="text-sm text-gray-600">Specializacija: Matematika</p>
              </div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200 mt-12">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
