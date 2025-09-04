"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

const lessons = [
  { name: "IT", slug: "it" },
  { name: "Matematika", slug: "matematika" },
  { name: "Fizika", slug: "fizika" },
  { name: "Biologija", slug: "biologija" },
  { name: "Chemija", slug: "chemija" },
  { name: "Anglų k.", slug: "anglu-k" },
];

const sections = ["lesson", "how", "teachers"] as const;
type Section = typeof sections[number];

export default function Home() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<Section>("lesson");
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle wheel scroll to change sections (debounced)
  const onWheel = useCallback(
    (e: WheelEvent) => {
      if (isAnimating) return;
      if (e.deltaY > 30) {
        // Scroll down
        setIsAnimating(true);
        setCurrentSection((prev) => {
          const currentIndex = sections.indexOf(prev);
          if (currentIndex < sections.length - 1) return sections[currentIndex + 1];
          return prev;
        });
      } else if (e.deltaY < -30) {
        // Scroll up
        setIsAnimating(true);
        setCurrentSection((prev) => {
          const currentIndex = sections.indexOf(prev);
          if (currentIndex > 0) return sections[currentIndex - 1];
          return prev;
        });
      }
    },
    [isAnimating]
  );

  // Reset animation lock after animation duration
  useEffect(() => {
    if (isAnimating) {
      const timeout = setTimeout(() => setIsAnimating(false), 700); // match animation duration
      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);

  // Keyboard arrow navigation
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isAnimating) return;
      if (e.key === "ArrowDown") {
        setIsAnimating(true);
        setCurrentSection((prev) => {
          const currentIndex = sections.indexOf(prev);
          if (currentIndex < sections.length - 1) return sections[currentIndex + 1];
          return prev;
        });
      } else if (e.key === "ArrowUp") {
        setIsAnimating(true);
        setCurrentSection((prev) => {
          const currentIndex = sections.indexOf(prev);
          if (currentIndex > 0) return sections[currentIndex - 1];
          return prev;
        });
      }
    },
    [isAnimating]
  );

  useEffect(() => {
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onWheel, onKeyDown]);

  // Common section classes
  const baseSectionClass =
    "absolute top-0 left-0 w-full flex flex-col justify-center items-center px-6 max-w-6xl mx-auto";

  // Animation classes for fade + slide up/down
  const getSectionClass = (section: Section) => {
    if (section === currentSection)
      return baseSectionClass + " opacity-100 translate-y-0 z-20 pointer-events-auto transition-all duration-700 ease-in-out";

    // For sections before current - slide up + fade out
    const currentIndex = sections.indexOf(currentSection);
    const thisIndex = sections.indexOf(section);
    if (thisIndex < currentIndex)
      return baseSectionClass + " opacity-0 -translate-y-12 z-10 pointer-events-none transition-all duration-700 ease-in-out";
    // For sections after current - slide down + fade out
    if (thisIndex > currentIndex)
      return baseSectionClass + " opacity-0 translate-y-12 z-10 pointer-events-none transition-all duration-700 ease-in-out";

    return baseSectionClass + " opacity-0 pointer-events-none transition-all duration-700 ease-in-out";
  };

  // The fixed header and footer remain visible always
  return (
    <div className="relative h-screen bg-white text-gray-900 font-sans overflow-hidden">
      {/* Header */}
      <header
        className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 bg-white z-50"
        style={{ height: 64 }}
      >
        <div className="text-2xl font-extrabold tracking-tight select-none">Tiksliukai.lt</div>
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

      {/* Sections container with height matching "Our Teachers" approx 640px + some padding */}
      <main className="relative h-[640px] mt-[64px] mb-16 mx-auto w-full max-w-6xl select-none">
        {/* Section 1: Choose lesson */}
        <section
          aria-hidden={currentSection !== "lesson"}
          className={getSectionClass("lesson")}
          style={{ height: "640px" }}
        >
          <h1 className="text-5xl font-extrabold mb-12 select-text">Pasirinkite pamoką</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
            {lessons.map((lesson) => (
              <button
                key={lesson.slug}
                onClick={() => router.push(`/schedule/${lesson.slug}`)}
                className="px-10 py-8 bg-blue-600 rounded-3xl text-white text-2xl font-semibold hover:bg-blue-700 shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400"
              >
                {lesson.name}
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: How it works */}
        <section
          aria-hidden={currentSection !== "how"}
          className={getSectionClass("how")}
          style={{ height: "640px" }}
        >
          <h2 className="text-5xl font-extrabold mb-8 select-text">Kaip tai veikia?</h2>
          <p className="max-w-3xl text-xl text-gray-700 leading-relaxed select-text">
            Pasirinkite pamoką, raskite jums tinkamą laiką, rezervuokite ir gaukite nuorodą į Google Meet.
            <br />
            Viskas paprasta, greita ir be jokių ilgų susirašinėjimų.
          </p>
        </section>

        {/* Section 3: Our teachers */}
        <section
          aria-hidden={currentSection !== "teachers"}
          className={getSectionClass("teachers")}
          style={{ height: "640px" }}
        >
          <h2 className="text-5xl font-extrabold mb-12 select-text">Mūsų Mokytojai</h2>
          <div className="flex gap-10 justify-center flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-72 bg-blue-50 rounded-3xl shadow-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-default select-none"
              >
                <div className="h-40 w-40 mx-auto bg-gray-300 rounded-full mb-6"></div>
                <h3 className="text-2xl font-bold mb-3">Mokytojas {i}</h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  Specializacija: Matematika, Fizika <br /> Patirtis: 5 metai
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 text-center py-5 text-sm text-gray-500 border-t border-gray-200 bg-white z-50 select-none">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
