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

// Fade-in hook
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

function Section({
  children,
  fadeRef,
  className = "",
}: {
  children: React.ReactNode;
  fadeRef: ReturnType<typeof useFadeInOnScroll>;
  className?: string;
}) {
  return (
    <section
      ref={fadeRef.ref}
      className={`w-full snap-start px-10 flex flex-col justify-center items-center transition-opacity duration-700 ease-in-out bg-white ${className} ${
        fadeRef.visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ height: "100vh", maxWidth: 960, margin: "0 auto" }}
    >
      {children}
    </section>
  );
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

  return (
    <div className="flex flex-col h-screen bg-white text-blue-900 font-sans">
      {/* Header */}
      <header
        className="flex justify-between items-center px-10 py-4 border-b border-blue-200 sticky top-0 bg-white z-50 shadow-sm"
        style={{ height: 64 }}
      >
        <div className="text-2xl font-extrabold tracking-tight cursor-default select-none">
          Tiksliukai.lt
        </div>
        <nav className="space-x-4">
          <button
            onClick={() => router.push("/auth/log-in")}
            className="px-6 py-2 border border-blue-900 text-blue-900 rounded-md font-medium hover:bg-blue-100 transition"
          >
            Log In
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="px-6 py-2 bg-blue-900 text-white rounded-md font-medium hover:bg-blue-800 transition"
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Main scroll container */}
      <main className="flex flex-col flex-grow overflow-y-auto scroll-smooth snap-y snap-mandatory bg-white">
        {/* Section 1 - Choose lesson */}
        <Section fadeRef={fadeRefs[0]}>
          <h1 className="text-5xl font-extrabold mb-16 tracking-tight">
            Pasirinkite pamoką
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl">
            {lessons.map(({ name, slug }) => (
              <button
                key={slug}
                onClick={() => router.push(`/schedule/${slug}`)}
                className="py-6 rounded-xl bg-blue-900 text-white text-xl font-semibold hover:bg-blue-800 transition"
                aria-label={`Pasirinkite pamoką ${name}`}
              >
                {name}
              </button>
            ))}
          </div>
        </Section>

        {/* Section 2 - How it works */}
        <Section
          fadeRef={fadeRefs[1]}
          className="bg-blue-50 text-blue-900"
        >
          <h2 className="text-5xl font-extrabold mb-8 tracking-tight">
            Kaip tai veikia?
          </h2>
          <p className="max-w-3xl text-xl leading-relaxed text-center">
            Pasirinkite pamoką, raskite jums tinkamą laiką, rezervuokite ir gaukite nuorodą į Google Meet.
            <br />
            Viskas paprasta, greita ir be jokių ilgų susirašinėjimų.
          </p>
        </Section>

        {/* Section 3 - Our teachers */}
        <Section fadeRef={fadeRefs[2]}>
          <h2 className="text-5xl font-extrabold mb-12 tracking-tight">Mūsų Mokytojai</h2>
          <div className="flex gap-12 justify-center flex-wrap max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-64 bg-blue-100 rounded-xl shadow-md p-6 cursor-default transition hover:shadow-lg"
                tabIndex={0}
                aria-label={`Mokytojas ${i}, Specializacija: Matematika, Fizika, Patirtis: 5 metai`}
              >
                <div className="h-36 w-36 mx-auto bg-blue-300 rounded-full mb-6"></div>
                <h3 className="text-2xl font-semibold mb-2 text-center">Mokytojas {i}</h3>
                <p className="text-center text-blue-800 text-sm">
                  Specializacija: Matematika, Fizika <br /> Patirtis: 5 metai
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 4 - Our mission */}
        <Section
          fadeRef={fadeRefs[3]}
          className="bg-blue-50 text-blue-900"
        >
          <h2 className="text-5xl font-extrabold mb-8 tracking-tight">Mūsų Misija</h2>
          <p className="max-w-3xl text-lg leading-relaxed text-center">
            Mes siekiame, kad kiekvienas mokinys rastų savo potencialą ir įgytų pasitikėjimą žiniomis.
            <br />
            Inovatyvios pamokos, profesionalūs mokytojai ir patogi sistema – viskas vienoje vietoje.
          </p>
        </Section>

        {/* Section 5 - About us */}
        <Section fadeRef={fadeRefs[4]}>
          <h2 className="text-5xl font-extrabold mb-8 tracking-tight">Apie Mus</h2>
          <p className="max-w-3xl text-lg leading-relaxed text-center">
            Tiksliukai.lt – tai jūsų patikimas partneris siekiant geresnių mokymosi rezultatų.
            <br />
            Prisijunkite prie mūsų bendruomenės ir atraskite naujas galimybes!
          </p>
        </Section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-blue-700 border-t border-blue-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
