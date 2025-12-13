"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const lessons = [
  { name: "IT", slug: "it" },
  { name: "Matematika", slug: "matematika" },
  { name: "Fizika", slug: "fizika" },
  { name: "Biologija", slug: "biologija" },
  { name: "Chemija", slug: "chemija" },
  { name: "Anglų k.", slug: "anglu-k" },
];

// Helper hook for fade-in on scroll
function useFadeInOnScroll() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // If you want to animate only once, unobserve after visible
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.3, // trigger when 30% visible
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function Home() {
  const router = useRouter();

  // Use fade hooks for new sections
  const missionFade = useFadeInOnScroll();
  const aboutFade = useFadeInOnScroll();

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
      {/* Header: fixed height */}
      <header
        className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm sticky top-0 bg-white z-50"
        style={{ height: 64 }}
      >
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

      {/* Scroll container fills remaining height, scroll snaps on children */}
      <main className="flex flex-col flex-grow overflow-y-auto scroll-smooth snap-y snap-mandatory">
        {/* Section 1: Pasirinkite pamoką */}
        <section
          className="w-full max-w-4xl px-4 text-center snap-start flex flex-col justify-center items-center mx-auto"
          style={{ height: "100vh" }}
        >
          <h1 className="text-4xl font-extrabold mb-10">Pasirinkite pamoką</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {lessons.map((lesson) => (
              <button
                key={lesson.slug}
                onClick={() => router.push(`/schedule/${lesson.slug}`)}
                className="px-8 py-6 bg-blue-600 rounded-2xl text-white text-xl font-semibold hover:bg-blue-700 shadow-xl transition-all duration-200"
              >
                {lesson.name}
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: Kaip tai veikia */}
        <section
          className="w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-white snap-start px-6"
          style={{ height: "100vh" }}
        >
          <h2 className="text-5xl font-extrabold mb-8">Kaip tai veikia?</h2>
          <p className="max-w-2xl text-xl text-gray-700 leading-relaxed">
            Pasirinkite pamoką, raskite jums tinkamą laiką, rezervuokite ir gaukite nuorodą į Google Meet.
            <br />
            Viskas paprasta, greita ir be jokių ilgų susirašinėjimų.
          </p>
        </section>

        {/* Section 3: Mūsų Mokytojai */}
        <section
          className="w-full flex flex-col justify-center items-center bg-white snap-start px-6"
          style={{ height: "100vh" }}
        >
          <h2 className="text-5xl font-extrabold mb-12">Mūsų Mokytojai</h2>
          <div className="flex gap-8 justify-center flex-wrap max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-72 bg-blue-50 rounded-2xl shadow-xl p-6 hover:scale-105 transition-all"
              >
                <div className="h-40 w-40 mx-auto bg-gray-300 rounded-full mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Mokytojas {i}</h3>
                <p className="text-gray-600 text-sm">
                  Specializacija: Matematika, Fizika <br /> Patirtis: 5 metai
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Mūsų Misija (fade-in) */}
        <section
          ref={missionFade.ref}
          className={`w-full flex flex-col justify-center items-center bg-gradient-to-tr from-green-100 to-white snap-start px-6 transition-opacity duration-700 ease-in-out ${
            missionFade.visible ? "opacity-100" : "opacity-0"
          }`}
          style={{ height: "100vh" }}
        >
          <h2 className="text-5xl font-extrabold mb-8">Mūsų Misija</h2>
          <p className="max-w-3xl text-lg text-gray-700 leading-relaxed">
            Mes siekiame, kad kiekvienas mokinys rastų savo potencialą ir įgytų pasitikėjimą žiniomis.
            <br />
            Inovatyvios pamokos, profesionalūs mokytojai ir patogi sistema – viskas vienoje vietoje.
          </p>
        </section>

        {/* Section 5: Apie Mus (fade-in) */}
        <section
          ref={aboutFade.ref}
          className={`w-full flex flex-col justify-center items-center bg-gradient-to-bl from-purple-100 to-white snap-start px-6 transition-opacity duration-700 ease-in-out ${
            aboutFade.visible ? "opacity-100" : "opacity-0"
          }`}
          style={{ height: "100vh" }}
        >
          <h2 className="text-5xl font-extrabold mb-8">Apie Mus</h2>
          <p className="max-w-3xl text-lg text-gray-700 leading-relaxed">
            Tiksliukai.lt – tai jūsų patikimas partneris siekiant geresnių mokymosi rezultatų.
            <br />
            Prisijunkite prie mūsų bendruomenės ir atraskite naujas galimybes!
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
