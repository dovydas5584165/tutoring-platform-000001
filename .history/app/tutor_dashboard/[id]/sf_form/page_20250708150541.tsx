"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function IsrasytiSaskaitosFaktura() {
  const [data, setData] = useState("");
  const [suma, setSuma] = useState("");
  const [klientas, setKlientas] = useState("");
  const [individualiosVeiklosNr, setIndividualiosVeiklosNr] = useState("");
  const [vardas, setVardas] = useState("");
  const [pavarde, setPavarde] = useState("");

  const params = useParams();
  const id = params?.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !data ||
      !suma ||
      !klientas ||
      !individualiosVeiklosNr ||
      !vardas ||
      !pavarde
    ) {
      alert("Prašome užpildyti visus laukus.");
      return;
    }

    alert(`Sąskaita įrašyta:
Individualios veiklos Nr.: ${individualiosVeiklosNr}
Vardas: ${vardas}
Pavardė: ${pavarde}
Data: ${data}
Suma: ${suma} €
Klientas: ${klientas}`);

    setData("");
    setSuma("");
    setKlientas("");
    setIndividualiosVeiklosNr("");
    setVardas("");
    setPavarde("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans flex justify-center items-start">
      <main className="w-full max-w-md">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 mb-6 rounded">
          <h1 className="text-2xl font-bold">Įrašyti sąskaitos faktūrą</h1>
          <nav className="mt-2 text-sm">
            <a
              href={`/tutor_dashboard/${id}`}
              className="font-semibold text-blue-600 hover:underline"
            >
              Grįžti atgal
            </a>
          </nav>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-6"
        >
          <div>
            <label
              htmlFor="individualiosVeiklosNr"
              className="block mb-1 font-semibold"
            >
              Individualios veiklos Nr.
            </label>
            <input
              type="text"
              id="individualiosVeiklosNr"
              value={individualiosVeiklosNr}
              onChange={(e) => setIndividualiosVeiklosNr(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Įveskite individualios veiklos numerį"
            />
          </div>

          <div>
            <label htmlFor="vardas" className="block mb-1 font-semibold">
              Vardas
            </label>
            <input
              type="text"
              id="vardas"
              value={vardas}
              onChange={(e) => setVardas(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Įveskite vardą"
            />
          </div>

          <div>
            <label htmlFor="pavarde" className="block mb-1 font-semibold">
              Pavardė
            </label>
            <input
              type="text"
              id="pavarde"
              value={pavarde}
              onChange={(e) => setPavarde(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Įveskite pavardę"
            />
          </div>

          <div>
            <label htmlFor="data" className="block mb-1 font-semibold">
              Data
            </label>
            <input
              type="date"
              id="data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="suma" className="block mb-1 font-semibold">
              Suma (€)
            </label>
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
            <label htmlFor="klientas" className="block mb-1 font-semibold">
              Klientas (vardas ir pavardė)
            </label>
            <input
              type="text"
              id="klientas"
              value={klientas}
              onChange={(e) => setKlientas(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Įveskite kliento vardą ir pavardę"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
          >
            Įrašyti
          </button>
        </form>

        <footer className="mt-8 text-center text-sm text-gray-500">
          © 2025 Tiksliukai.lt
        </footer>
      </main>
    </div>
  );
}
