"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

type Lesson = {
  name: string;
  slug: string;
};

export default function Home() {
  const router = useRouter();

  const lessons: Lesson[] = [
    { name: "IT", slug: "it" },
    { name: "Matematika", slug: "matematika" },
    { name: "Fizika", slug: "fizika" },
    { name: "Biologija", slug: "biologija" },
    { name: "Chemija", slug: "chemija" },
    { name: "Anglų k.", slug: "anglu-k" },
  ];

  // States for progressive reveal of sections
  // 0 = none shown, 1 = first shown, 2 = both shown
  const [revealedStep, setRevealedStep] = useState(0);

  const lastYRef = useRef<number | null>(null);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (lastYRef.current === null) {
        lastYRef.current = e.clientY;
        return;
      }

      const deltaY = e.clientY - lastYRef.current;

      if (deltaY > 10) {
        // Mouse moved down by more than 10px
        if (revealedStep < 2) {
          setRevealedStep((prev) => Math.min(prev + 1, 2));
        }
      } else if (deltaY < -10) {
        // Optional: mouse moved up (can hide sections or do nothing)
        // For simplicity, do nothing here
      }

      lastYRef.current = e.clientY;
    }

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [revealedStep]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6 border-b border-gray-200 shadow-md bg-white sticky top-0 z-10">
        <div className="text-2xl font-bold tracking-tight text-blue-700">Tiksliukai.lt</div>
        <nav className="space-x-4">
          <button
            onClick={() => router.push("/auth/log-in")}
            className="px-5 py-2.5 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 transition"
          >
            Prisijungti
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="px-5 py-2.5 bg-gray-100 border border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition"
          >
            Registruotis
          </button>
        </nav>
      </header>

      {/* Hero / Lesson selection */}
      <main className="flex flex-col flex-1 items-center px-6 py-16 text-center bg-gradient-to-b from-white to-blue-50">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-gray-800">
          Pasirinkite pamoką
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {lessons.map((lesson) => (
            <button
              key={lesson.slug}
              onClick={() => router.push(`/schedule/${lesson.slug}`)}
              className="px-10 py-6 bg-blue-600 rounded-2xl text-white text-xl font-semibold shadow-lg hover:bg-blue-700 transition"
            >
              {lesson.name}
            </button>
          ))}
        </div>

        {/* Section 1 - Kaip tai veikia? */}
        <section
          className={`mt-20 py-20 bg-white text-center border-t border-gray-200 max-w-5xl w-full mx-auto
          transition-all duration-700 ease-in-out overflow-hidden ${
            revealedStep >= 1 ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={revealedStep < 1}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Kaip tai veikia?</h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-600">
            Išsirenkate pamoką, pasirenkate laiką, prisijungiate prie pamokos per nuorodą ir mokotės su kvalifikuotu mokytoju. Jokio vargo – tik rezultatai.
          </p>
        </section>

        {/* Section 2 - Mūsų mokytojai */}
        <section
          className={`mt-16 py-20 bg-blue-50 text-center border-t border-gray-200 max-w-5xl w-full mx-auto
          transition-all duration-700 ease-in-out overflow-hidden ${
            revealedStep >= 2 ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0"
          }`}
          aria-hidden={revealedStep < 2}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-10">Mūsų mokytojai</h2>
          <div className="flex flex-wrap justify-center gap-10">
            {["Rūta", "Mantas", "Indrė", "Tomas"].map((name, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-md w-64 text-center border border-gray-100"
              >
                <div className="h-32 w-32 mx-auto mb-4 bg-gray-200 rounded-full" />
                <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
                <p className="text-gray-500 text-sm">Dėsto: Matematiką, IT</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200 bg-white">
        © 2025 Tiksliukai.lt – Visi mokymosi sprendimai vienoje vietoje.
      </footer>
    </div>
  );
}
