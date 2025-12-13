"use client";

import { useState } from "react";

export default function IsrasytiSaskaitosFaktura() {
  const [data, setData] = useState("");
  const [suma, setSuma] = useState("");
  const [klientas, setKlientas] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !suma || !klientas) {
      alert("Prašome užpildyti visus laukus.");
      return;
    }

    // Čia gali siųsti duomenis į backend ar API
    alert(`Sąskaita įrašyta:\nData: ${data}\nSuma: ${suma}\nKlientas: ${klientas}`);

    // Išvalyti formą
    setData("");
    setSuma("");
    setKlientas("");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Įrašyti sąskaitos faktūrą</h1>
        <nav className="space-x-4 text-sm sm:text-base">
          <a href="/tutor_dashboard" className="font-semibold hover:underline">Grįžti atgal</a>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 max-w-md">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
          <div>
            <label htmlFor="data" className="block mb-1 font-semibold">Data</label>
            <input
              type="date"
              id="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="suma" className="block mb-1 font-semibold">Suma (€)</label>
            <input
              type="number"
              step="0.01"
              id="suma"
              value={suma}
              onChange={(e) => setSuma(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Įveskite sumą eurais"
            />
          </div>

          <div>
            <label htmlFor="klientas" className="block mb-1 font-semibold">Klientas</label>
            <input
              type="text"
              id="klientas"
              value={klientas}
              onChange={(e) => setKlientas(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Įveskite kliento vardą"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
          >
            Įrašyti
          </button>
        </form>
      </main>

      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
