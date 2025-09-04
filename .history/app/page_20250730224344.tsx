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

// Hook for fade-in on scroll
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
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// Reusable Section component
function Section({
  children,
  bgClass = "bg-white",
  fadeRef,
  className = "",
}: {
  children: React.ReactNode;
  bgClass?: string;
  fadeRef: ReturnType<typeof useFadeInOnScroll>;
  className?: string;
}) {
  const sectionStyle = {
    height: "100vh",
    paddingTop: "7rem",
    paddingBottom: "7rem",
  };

  return (
    <section
      ref={fadeRef.ref}
      className={`w-full snap-start px-6 flex flex-col justify-center items-center transition-opacity duration-700 ease-in-out ${bgClass} ${className} ${
        fadeRef.visible ? "opacity-100" : "opacity-0"
      }`}
      style={sectionStyle}
    >
      {children}
    </section>
  );
}

// Typewriter effect hook for “Apie Mus”
function useTypewriter(text: string, speed = 50) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[index]);
      index++;
      if (index >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}

export default function Home() {
  const router = useRouter();

  const fadeRefs = [
    useFadeInOnScroll(),
    useFadeInOnScroll(),
    useFadeInOnScroll(),
    useFadeInOnScroll(),
    useFadeInOnScroll(),
  ];

  const aboutText = `Tiksliukai.lt – tai jūsų patikimas partneris siekiant geresnių mokymosi rezultatų. 
Prisijunkite prie mūsų bendruomenės ir atraskite naujas galimybes!`;
  const typedAboutText = useTypewriter(aboutText, 30);

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
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

      <main className="flex flex-col flex-grow overflow-y-auto scroll-smooth snap-y snap-mandatory">
        {/* 1: Pasirinkite pamoką */}
        <Section fadeRef={fadeRefs[0]} bgClass="bg-white max-w-4xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-10">Pasirinkite pamoką</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {lessons.map(({ name, slug }) => (
              <button
                key={slug}
                onClick={() => router.push(`/schedule/${slug}`)}
                className="px-8 py-6 bg-blue-600 rounded-2xl text-white text-xl font-semibold hover:bg-blue-700 shadow-xl transition-transform duration-300 hover:scale-110 active:scale-95"
                aria-label={`Pasirinkite pamoką ${name}`}
              >
                {name}
              </button>
            ))}
          </div>
        </Section>

        {/* 2: Kaip tai veikia? */}
        <Section fadeRef={fadeRefs[1]} bgClass="bg-gradient-to-br from-blue-100 to-white">
          <h2 className="text-5xl font-extrabold mb-8 relative">
            Kaip tai veikia?
            <span className="ml-4 inline-block animate-pulse text-blue-600">✔️</span>
          </h2>
          <p className="max-w-3xl text-xl text-gray-700 leading-relaxed">
            Pasirinkite pamoką, raskite jums tinkamą laiką, rezervuokite ir gaukite nuorodą į Google Meet.
            <br />
            Viskas paprasta, greita ir be jokių ilgų susirašinėjimų.
          </p>
        </Section>

        {/* 3: Mūsų Mokytojai */}
        <Section fadeRef={fadeRefs[2]} bgClass="bg-white">
          <h2 className="text-5xl font-extrabold mb-12">Mūsų Mokytojai</h2>
          <div className="flex gap-8 justify-center flex-wrap max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-72 bg-blue-50 rounded-2xl shadow-xl p-6 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300"
                tabIndex={0}
                aria-label={`Mokytojas ${i}, Specializacija: Matematika, Fizika, Patirtis: 5 metai`}
              >
                <div className="h-40 w-40 mx-auto bg-gray-300 rounded-full mb-4"></div>
                <h3 className="text-xl font-bold mb-2">Mokytojas {i}</h3>
                <p className="text-gray-600 text-sm">
                  Specializacija: Matematika, Fizika <br /> Patirtis: 5 metai
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* 4: Mūsų Misija */}
        <Section
          fadeRef={fadeRefs[3]}
          bgClass="bg-gradient-to-tr from-green-100 to-white"
          className="relative"
        >
          <h2 className="text-5xl font-extrabold mb-8 underline decoration-green-500 decoration-4 animate-pulse">
            Mūsų Misija
          </h2>
          <p className="max-w-3xl text-lg text-gray-700 leading-relaxed text-center px-4">
            Mes siekiame, kad kiekvienas mokinys rastų savo potencialą ir įgytų pasitikėjimą žiniomis.
            <br />
            Inovatyvios pamokos, profesionalūs mokytojai ir patogi sistema – viskas vienoje vietoje.
          </p>
        </Section>

        {/* 5: Apie Mus */}
        <Section fadeRef={fadeRefs[4]} bgClass="bg-gradient-to-bl from-purple-100 to-white">
          <h2 className="text-5xl font-extrabold mb-8">Apie Mus</h2>
          <p className="max-w-3xl text-lg text-gray-700 leading-relaxed whitespace-pre-line px-6 text-center">
            {typedAboutText}
            <span className="blinking-cursor">|</span>
          </p>
        </Section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>

      {/* Extra CSS */}
      <style jsx>{`
        .blinking-cursor {
          animation: blink 1s step-start 0s infinite;
          font-weight: 900;
          color: #4a5568; /* Tailwind gray-700 */
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
