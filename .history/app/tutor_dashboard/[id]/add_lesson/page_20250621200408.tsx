"use client";

export default function PridetiPamoka() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pridėti pamoką</h1>
        <nav className="space-x-4 text-sm sm:text-base">
          <a href="/tutor_dashboard" className="font-semibold hover:underline">Atgal į valdymo skydelį</a>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100">Atsijungti</button>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8">
        <form className="bg-white rounded shadow p-6 space-y-6 max-w-xl mx-auto">
          <div>
            <label className="block text-gray-700 mb-2 font-semibold">Pamokos tema</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Įveskite temą"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-semibold">Data</label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-semibold">Studentas</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Studento vardas"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-semibold">Pamokos trukmė (val.)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Pvz: 1.5"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Išsaugoti pamoką
          </button>
        </form>
      </main>

      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
