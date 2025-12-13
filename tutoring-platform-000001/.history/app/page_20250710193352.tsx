"use client"; // make sure this is client component to use hooks

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm">
        <div className="text-xl font-semibold tracking-tight">Tiksliukai.lt</div>
        <div className="space-x-4">
          <button
            onClick={() => router.push("/auth/log-in")}
            className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:bg-blue-800 text-white font-bold"
          >
            Log In
          </button>
          <button
            onClick={() => router.push("/auth")}
            className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:bg-blue-800 text-white font-bold"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-col flex-1 justify-center items-center">
        <h1 className="text-2xl font-semibold mb-8">Pasirinkite pamoką:</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <button className="px-8 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:bg-blue-800 text-white font-bold text-lg">
            IT
          </button>
          <button className="px-8 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:bg-blue-800 text-white font-bold text-lg">
            Matematika
          </button>
          <button className="px-8 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:bg-blue-800 text-white font-bold text-lg">
            Fizika
          </button>
          <button className="px-8 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:bg-blue-800 text-white font-bold text-lg">
            Biologija
          </button>
          <button className="px-8 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:bg-blue-800 text-white font-bold text-lg">
            Chemija
          </button>
          <button className="px-8 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:bg-blue-800 text-white font-bold text-lg">
            Anglų k.
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
