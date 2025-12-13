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
          <h2 classNa
