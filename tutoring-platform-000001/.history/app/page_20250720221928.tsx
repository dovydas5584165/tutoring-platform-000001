"use client";

import { useRouter } from "next/navigation";

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

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm">
        <div className="text-xl font-semibold tracking-tight">Tiksliukai.lt</div>
        <nav className="space-x-4">
          <button
            onClick={() => router.push("/auth/log-in")}
            className="px-4 py-2 bg-blue-600 rounded-xl text-white font-bold"
          >
            Log In
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="px-4 py-2 bg-blue-600 rounded-xl text-white font-bold"
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Main */}
      <main className="flex flex-col flex-1 justify-center items-center px-4 text-center">
        <h1 className="text-2xl font-semibold mb-8">Pasirinkite pamoką:</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-xl">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.slug} name={lesson.name} slug={lesson.slug} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}

function LessonCard({ name, slug }: { name: string; slug: string }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/schedule/${slug}`)}
      className="px-8 py-4 bg-blue-600 rounded-xl text-white font-bold text-lg hover:bg-blue-700 transition"
    >
      {name}
    </button>
  );
}
