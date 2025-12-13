"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
        {/* Section 1: Choose a lesson */}
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

        {/* Section 2: First video */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full min-h-screen flex items-center justify-center bg-white snap-start px-0 py-0"
        >
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            src="https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/videos/60d7accd-ab26-4a57-b66a-462e1f6d0e0b.mov"
          />
        </motion.section>

        {/* Section 3: Second video */}
        <motion.section
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full min-h-screen flex items-center justify-center bg-white snap-start px-0 py-0"
        >
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            src="https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/videos/fe4fa1d0-a4a6-464c-a058-af48d73ffd71.mp4"
          />
        </motion.section>

        {/* Section 4: Mūsų mokytojai */}
        <motion.section
          ref={teacherRef}
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200 snap-start px-6 py-20"
        >
          <h2 className="text-4xl font-extrabold mb-10 text-center">Mūsų mokytojai</h2>
          <p className="text-lg text-gray-600 max-w-2xl text-center">
            Mokytojai bus čia.
          </p>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
