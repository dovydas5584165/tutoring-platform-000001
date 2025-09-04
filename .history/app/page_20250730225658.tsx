"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const lessons = [
  { name: "IT", slug: "it" },
  { name: "Matematika", slug: "matematika" },
  { name: "Fizika", slug: "fizika" },
  { name: "Biologija", slug: "biologija" },
  { name: "Chemija", slug: "chemija" },
  { name: "Anglų k.", slug: "anglu-k" },
];

const HEADER_HEIGHT = 64;
const sections = ["lesson", "how", "about", "teachers"] as const;

export default function Home() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState<typeof sections[number]>("lesson");

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          const id = visible.target.getAttribute("data-section-id") as typeof sections[number];
          if (id) setCurrentSection(id);
        }
      },
      {
        root: null,
        threshold: 0.5,
      }
    );

    sections.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const getSectionClass = (id: string) =>
    clsx(
      "absolute w-full transition-opacity duration-700 ease-in-out px-6 text-center",
      currentSection === id ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    );

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans relative overflow-hidden">
      {/* Header */}
      <header
        className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm sticky top-0 bg-white z-50"
        style={{ height: HEADER_HEIGHT }}
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

      {/* Sections Container */}
      <main className="flex-grow relative h-full">
        {/* Lesson Selection */}
        <section
          ref={(el) => (sectionRefs.current["lesson"] = el)}
          data-section-id="lesson"
          className={getSectionClass("lesson")}
          style={{ top: 0, height: "100vh", paddingTop: HEADER_HEIGHT }}
        >
          <h1 className="text-4xl font-extrabold mb-10 select-text">Pasirinkite pamoką</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
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

        {/* How it works */}
        <section
          ref={(el) => (sectionRefs.current["how"] = el)}
          data-section-id="how"
          className={getSectionClass("how")}
          style={{ top: 0, height: "100vh", paddingTop: HEADER_HEIGHT }}
        >
          <h2 className="text-5xl font-extrabold mb-8 select-text">Kaip tai veikia?</h2>
          <p className="max-w-2xl text-xl text-gray-700 leading-relaxed mx-auto select-text">
            Pasirinkite pamoką, raskite jums tinkamą laiką, rezervuokite ir gaukite nuorodą į Google Meet.
            <br />
            Viskas paprasta, greita ir be jokių ilgų susirašinėjimų.
          </p>
        </section>

        {/* About Us */}
        <section
          ref={(el) => (sectionRefs.current["about"] = el)}
          data-section-id="about"
          className={getSectionClass("about")}
          style={{ top: 0, height: "100vh", paddingTop: HEADER_HEIGHT }}
        >
          <h2 className="text-5xl font-extrabold mb-8 select-text">Apie mus</h2>
          <p className="max-w-3xl text-xl text-gray-700 leading-relaxed mx-auto select-text">
            Tiksliukai.lt — tai šiuolaikiška korepetitorių platforma, sukurta tam, kad kiekvienas vaikas rastų sau tinkamiausią mokytoją be streso ir gaišaties.
            Mūsų tikslas — padėti moksleiviams pasiekti savo potencialą, mokantis paprastai, efektyviai ir iš bet kurios vietos.
            <br /><br />
            Mūsų komandoje dirba tik atrinkti, patyrę ir empatiški mokytojai, kurie ne tik perteikia žinias, bet ir įkvepia pasitikėjimo. Mūsų misija — auginti ne tik pažymius, bet ir pasitikėjimą savimi.
          </p>
        </section>

        {/* Teachers */}
        <section
          ref={(el) => (sectionRefs.current["teachers"] = el)}
          data-section-id="teachers"
          className={getSectionClass("teachers")}
          style={{ top: 0, height: "100vh", paddingTop: HEADER_HEIGHT, marginTop: "6rem" }}
        >
          <h2 className="text-5xl font-extrabold mb-12 select-text">Mūsų Mokytojai</h2>
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
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
