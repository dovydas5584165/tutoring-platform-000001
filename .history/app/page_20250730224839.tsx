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
    <div className="flex flex-col h-screen bg-white text-black font-sans">
      {/* Header: fixed height */}
      <header
        className="flex justify-between items-center px-8 py-4 border-b border-gray-300 shadow-sm sticky top-0 bg-white z-50"
        style={{ height: 64 }}
      >
        <div className="text-2xl font-extrabold tracking-tight select-none cursor-default">
          Tiksliukai.lt
        </div>
        <nav className="space-x-4">
          <button
            onClick={() => router.push("/auth/log-in")}
            className="px-5 py-2 bg-blue-600 rounded-xl text-white font-bold 
                       hover:bg-blue-700 transition-colors duration-300 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
          >
            Log In
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="px-5 py-2 bg-blue-600 rounded-xl text-white font-bold 
                       hover:bg-blue-700 transition-colors duration-300 ease-in-out
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Scroll container fills remaining height, scroll snaps on children */}
      <main className="flex flex-col flex-grow overflow-y-auto scroll-smooth snap-y snap-mandatory">
        {/* Section 1 */}
        <section
          className="w-full max-w-4xl px-4 text-center snap-start flex flex-col justify-center items-center mx-auto"
          style={{ height: "100vh" }}
        >
          <h1 className="text-4xl font-extrabold mb-10 tracking-tight transition-colors duration-300 ease-in-out hover:text-blue-700">
            Pasirinkite pamoką
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {lessons.map((lesson) => (
              <button
                key={lesson.slug}
                onClick={() => router.push(`/schedule/${lesson.slug}`)}
                className="px-8 py-6 bg-blue-600 rounded-2xl text-white text-xl font-semibold 
                           shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:scale-105 
                           transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500"
                aria-label={`Pasirinkite pamoką ${lesson.name}`}
              >
                {lesson.name}
              </button>
            ))}
          </div>
        </section>

        {/* Section 2 */}
        <section
          className="w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 to-white snap-start px-6 max-w-4xl mx-auto"
          style={{ height: "100vh" }}
        >
          <h2 className="text-5xl font-extrabold mb-8 tracking-tight transition-colors duration-300 ease-in-out hover:text-blue-600">
            Kaip tai veikia?
          </h2>
          <p className="max-w-2xl text-xl text-gray-800 leading-relaxed">
            Pasirinkite pamoką, raskite jums tinkamą laiką, rezervuokite ir gaukite nuorodą į Google Meet.
            <br />
            Viskas paprasta, greita ir be jokių ilgų susirašinėjimų.
          </p>
        </section>

        {/* Section 3 */}
        <section
          className="w-full flex flex-col justify-center items-center bg-white snap-start px-6 max-w-6xl mx-auto"
          style={{ height: "100vh" }}
        >
          <h2 className="text-5xl font-extrabold mb-12 tracking-tight transition-colors duration-300 ease-in-out hover:text-blue-600">
            Mūsų Mokytojai
          </h2>
          <div className="flex gap-8 justify-center flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-72 bg-blue-50 rounded-2xl shadow-lg p-6 cursor-default
                           transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
                tabIndex={0}
                aria-label={`Mokytojas ${i}, Specializacija: Matematika, Fizika, Patirtis: 5 metai`}
              >
                <div className="h-40 w-40 mx-auto bg-blue-200 rounded-full mb-4"></div>
                <h3 className="text-xl font-bold mb-2 text-center text-black">
                  Mokytojas {i}
                </h3>
                <p className="text-center text-blue-700 text-sm">
                  Specializacija: Matematika, Fizika <br /> Patirtis: 5 metai
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-600 border-t border-gray-300 select-none">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
