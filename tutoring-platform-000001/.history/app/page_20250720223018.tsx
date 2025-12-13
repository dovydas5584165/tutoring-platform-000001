"use client";

import { useRouter } from "next/navigation";
import WeeklyAvailabilitySelector from "../components/WeeklyAvailabilitySelector";

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

  // Example userId (replace with actual user id from auth or context)
  const userId = "user-uuid-example";

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm">
        <div className="text-xl font-semibold tracking-tight">Tiksliukai.lt</div>
        <nav className="space-x-4">
          <button
            onClick={() => router.push("/auth/log-in")}
            className="px-4 py-2 bg-blue-600 rounded-xl text-white font-bold"
            aria-label="Log In"
            tabIndex={0}
          >
            Log In
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="px-4 py-2 bg-blue-600 rounded-xl text-white font-bold"
            aria-label="Sign In"
            tabIndex={0}
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Main */}
      <main className="flex flex-col flex-1 justify-center items-center px-4 text-center space-y-12">
        <h1 className="text-2xl font-semibold mb-8">Pasirinkite pamoką:</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-xl">
          {lessons.map((lesson) => (
            <button
              key={lesson.slug}
              onClick={() => router.push(`/schedule/${lesson.slug}`)}
              className="px-8 py-4 bg-blue-600 rounded-xl text-white font-bold text-lg hover:bg-blue-700 transition"
              aria-label={`Eiti į ${lesson.name} pamokos tvarkaraštį`}
              tabIndex={0}
            >
              {lesson.name}
            </button>
          ))}
        </div>

        {/* Insert the WeeklyAvailabilitySelector component here */}
        <section className="w-full max-w-5xl mx-auto p-4 border rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Pasirinkite savaitinį prieinamumą</h2>
          <WeeklyAvailabilitySelector userId={userId} />
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
