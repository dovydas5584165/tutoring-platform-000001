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
    <div className="flex flex-col h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header
        className="flex justify-between items-center px-10 py-4 border-b border-gray-200 shadow-sm sticky top-0 bg-white z-50"
        style={{ height: 64 }}
      >
        <div className="text-3xl font-extrabold tracking-tight select-none cursor-default text-blue-700">
          Tiksliukai.lt
        </div>
        <nav className="space-x-5">
          <button
            onClick={() => router.push("/auth/log-in")}
            className="px-6 py-2 border-2 border-blue-700 text-blue-700 font-semibold rounded-lg hover:bg-blue-700 hover:text-white transition-colors duration-300 ease-in-out"
          >
            Log In
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="px-6 py-2 bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 transition-colors duration-300 ease-in-out"
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Main */}
      <main
        className="flex flex-col flex-grow overflow-y-auto scroll-smooth snap-y snap-mandatory"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {/* Section 1: Choose lesson */}
        <section
          className="w-full max-w-4xl px-6 text-center snap-start flex flex-col justify-center items-center mx-auto"
          style={{ height: "100vh" }}
        >
          <h1 className="text-5xl font-extrabold mb-16 tracking-tight text-blue-700">
            Pasirinkite pamoką
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 w-full">
            {lessons.map(({ name, slug }) => (
              <button
                key={slug}
                onClick={() => router.push(`/schedule/${slug}`)}
                className="py-6 rounded-xl bg-blue-700 text-white text-xl font-semibold shadow-lg hover:bg-blue-800 transform hover:scale-105 transition duration-300 ease-in-out"
                aria-label={`Pasirinkite pamoką ${name}`}
              >
                {name}
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: How it works */}
        <section
          className="w-full flex flex-col justify-center items-center bg-white snap-start px-6 max-w-4xl mx-auto"
          style={{ height: "100vh" }}
        >
          <h2 className="text-5xl font-extrabold mb-10 tracking-tight text-blue-700">
            Kaip tai veikia?
          </h2>
          <p className="max-w-3xl text-xl leading-relaxed text-gray-700">
            Pasirinkite pamoką, raskite jums tinkamą laiką, rezervuokite ir gaukite nuorodą į Google Meet.
            <br />
            Viskas paprasta, greita ir be jokių ilgų susirašinėjimų.
          </p>
        </section>

        {/* Section 3: Our teachers */}
        <section
          className="w-full flex flex-col justify-center items-center bg-white snap-start px-6 max-w-6xl mx-auto"
          style={{ height: "100vh" }}
        >
          <h2 className="text-5xl font-extrabold mb-12 tracking-tight text-blue-700">
            Mūsų Mokytojai
          </h2>
          <div className="flex gap-10 justify-center flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-72 bg-blue-50 rounded-2xl shadow-lg p-6 cursor-default transition-transform duration-300 ease-in-out hover:scale-[1.05]"
                tabIndex={0}
                aria-label={`Mokytojas ${i}, Specializacija: Matematika, Fizika, Patirtis: 5 metai`}
              >
                <div className="h-40 w-40 mx-auto bg-blue-200 rounded-full mb-6"></div>
                <h3 className="text-xl font-semibold mb-2 text-center text-blue-800">
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
      <footer className="text-center py-6 text-sm text-blue-700 border-t border-blue-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
