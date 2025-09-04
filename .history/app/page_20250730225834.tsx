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
      { threshold: 0.6 }
    );

    sections.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const getSectionClass = (id: string) =>
    clsx(
      "absolute top-0 left-0 w-full h-full px-6 text-center transition-opacity duration-700 ease-in-out",
      currentSection === id ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans bg-white text-gray-900">
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-4 border-b shadow sticky top-0 bg-white z-50">
        <h1 className="text-2xl font-bold">Tiksliukai.lt</h1>
        <div className="space-x-4">
          <button onClick={() => router.push("/auth/log-in")} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700">
            Log In
          </button>
          <button onClick={() => router.push("/auth")} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700">
            Sign Up
          </button>
        </div>
      </header>

      {/* MAIN SECTIONS */}
      <main className="relative flex-grow h-full">
        {/* LESSONS */}
        <section
          ref={(el) => (sectionRefs.current["lesson"] = el)}
          data-section-id="lesson"
          className={getSectionClass("lesson")}
        >
          <div className="pt-24">
            <h2 className="text-4xl font-extrabold mb-10">Pasirinkite pamoką</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {lessons.map((lesson) => (
                <button
                  key={lesson.slug}
                  onClick={() => router.push(`/schedule/${lesson.slug}`)}
                  className="bg-blue-600 text-white py-6 rounded-2xl text-xl font-semibold hover:bg-blue-700 shadow transition-all"
                >
                  {lesson.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* HOW */}
        <section
          ref={(el) => (sectionRefs.current["how"] = el)}
          data-section-id="how"
          className={getSectionClass("how")}
        >
          <div className="pt-24 max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold mb-8">Kaip tai veikia?</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Pasirinkite pamoką, rezervuokite laiką, gaukite Google Meet nuorodą. Viskas per kelias minutes.
            </p>
          </div>
        </section>

        {/* ABOUT */}
        <section
          ref={(el) => (sectionRefs.current["about"] = el)}
          data-section-id="about"
          className={getSectionClass("about")}
        >
          <div className="pt-24 max-w-3xl mx-auto">
            <h2 className="text-4xl font-extrabold mb-8">Apie mus</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Tiksliukai.lt yra moderni korepetitorių platforma. Mes padedame vaikams augti ne tik pažymiais, bet ir pasitikėjimu.
            </p>
          </div>
        </section>

        {/* TEACHERS */}
        <section
          ref={(el) => (sectionRefs.current["teachers"] = el)}
          data-section-id="teachers"
          className={getSectionClass("teachers")}
        >
          <div className="pt-24 max-w-5xl mx-auto">
            <h2 className="text-4xl font-extrabold mb-12">Mūsų Mokytojai</h2>
            <div className="flex flex-wrap gap-8 justify-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-blue-50 rounded-xl p-6 shadow w-72 hover:scale-105 transition">
                  <div className="bg-gray-300 h-40 w-40 mx-auto rounded-full mb-4"></div>
                  <h3 className="text-xl font-bold">Mokytojas {i}</h3>
                  <p className="text-sm text-gray-600">Specializacija: Matematika<br />Patirtis: 5 metai</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
