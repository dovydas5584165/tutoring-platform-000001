"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import jsPDF from "jspdf";

export default function IsrasytiSaskaitosFaktura() {
  const [data, setData] = useState("");
  const [suma, setSuma] = useState("");
  const [klientas, setKlientas] = useState("");
  const [veiklosNr, setVeiklosNr] = useState("");
  const [vardas, setVardas] = useState("");
  const [pavarde, setPavarde] = useState("");

  const params = useParams();
  const id = params?.id;

  const generatePDF = () => {
    if (!data || !suma || !klientas) {
      alert("Prašome užpildyti bent datas, sumą ir kliento vardą.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Sąskaitos faktūra", 14, 20);

    doc.setFontSize(12);
    doc.text(`Individualios veiklos Nr.: ${veiklosNr || "-"}`, 14, 35);
    doc.text(`Vardas: ${vardas || "-"}`, 14, 45);
    doc.text(`Pavardė: ${pavarde || "-"}`, 14, 55);

    doc.text(`Data: ${data}`, 14, 70);
    doc.text(`Suma: €${suma}`, 14, 80);
    doc.text(`Klientas: ${klientas}`, 14, 90);

    doc.save(`Saskaita_${data}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Įrašyti sąskaitos faktūrą</h1>
        <nav className="space-x-4 text-sm sm:text-base">
          <a href={`/tutor_dashboard/${id}`} className="font-semibold text-blue-600 hover:underline">
            Grįžti atgal
          </a>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 max-w-md">
        <form className="bg-white p-6 rounded shadow space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="veiklosNr" className="block mb-1 font-semibold">Individualios veiklos Nr.</label>
            <input
              type="text"
              id="veiklosNr"
              value={veiklosNr}
              onChange={(e) => setVeiklosNr(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="vardas" className="block mb-1 font-semibold">Vardas</label>
            <input
              type="text"
              id="vardas"
              value={vardas}
              onChange={(e) => setVardas(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label htmlFor="pavarde" className="block mb-1 font-semibold">Pavardė</label>
            <input
              type="text"
              id="pavarde"
              value={pavarde}
              onChange={(e) => setPavarde(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

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
            <label htmlFor="klientas" className="block mb-1 font-semibold">Kliento vardas ir pavardė</label>
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
            type="button"
            onClick={generatePDF}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
          >
            Generuoti PDF
          </button>
        </form>
      </main>

      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
