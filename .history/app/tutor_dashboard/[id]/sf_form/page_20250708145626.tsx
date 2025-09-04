"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type UserInfo = {
  individualiosVeiklosNr: string;
  vardas: string;
  pavarde: string;
  suma?: string; // Optional default sum
};

export default function IsrasytiSaskaitosFaktura() {
  const [individualiosVeiklosNr, setIndividualiosVeiklosNr] = useState("");
  const [vardas, setVardas] = useState("");
  const [pavarde, setPavarde] = useState("");
  const [data, setData] = useState("");
  const [suma, setSuma] = useState("");
  const [klientoVardas, setKlientoVardas] = useState("");
  const [klientoPavarde, setKlientoPavarde] = useState("");
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    // Autofill date with today
    const today = new Date().toISOString().split("T")[0];
    setData(today);

    if (!id) {
      setLoading(false);
      return;
    }

    // Fetch user info from API
    async function fetchUserInfo() {
      try {
        const res = await fetch(`/api/user-info/${id}`);
        if (!res.ok) throw new Error("Failed to fetch user info");
        const userInfo: UserInfo = await res.json();

        // Autofill form fields if data present
        if (userInfo) {
          setIndividualiosVeiklosNr(userInfo.individualiosVeiklosNr || "");
          setVardas(userInfo.vardas || "");
          setPavarde(userInfo.pavarde || "");
          if (userInfo.suma) setSuma(userInfo.suma);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserInfo();
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !individualiosVeiklosNr ||
      !vardas ||
      !pavarde ||
      !data ||
      !suma ||
      !klientoVardas ||
      !klientoPavarde
    ) {
      alert("Prašome užpildyti visus laukus.");
      return;
    }

    alert(`Sąskaita įrašyta:
Individualios veiklos nr: ${individualiosVeiklosNr}
Vardas: ${vardas}
Pavardė: ${pavarde}
Data: ${data}
Suma: ${suma} €
Kliento vardas: ${klientoVardas}
Kliento pavardė: ${klientoPavarde}`);

    setIndividualiosVeiklosNr("");
    setVardas("");
    setPavarde("");
    setData("");
    setSuma("");
    setKlientoVardas("");
    setKlientoPavarde("");
  };

  if (loading) {
    return <div>Loading user info...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Įrašyti sąskaitos faktūrą</h1>
        <nav className="space-x-4 text-sm sm:text-base">
          <a
            href={`/tutor_dashboard/${id}`}
            className="font-semibold text-blue-600 hover:underline"
          >
            Grįžti atgal
          </a>
        </nav>
      </header>

      {/* Form */}
      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-6"
        >
          {/* Other input fields here like previous code */}
          <div>
            <label
              htmlFor="individualiosVeiklosNr"
              className="block mb-1 font-semibold"
            >
              Individualios veiklos nr
            </label>
            <input
              type="text"
              id="individualiosVeiklosNr"
              value={individualiosVeiklosNr}
              onChange={(e) => setIndividualiosVeiklosNr(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Įveskite veiklos numerį"
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
            <label htmlFor="klientoVardas" className="block mb-1 font-semibold">
              Kliento vardas
            </label>
            <input
              type="text"
              id="klientoVardas"
              value={klientoVardas}
              onChange={(e) => setKlientoVardas(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Įveskite kliento vardą"
            />
          </div>

          <div>
            <label htmlFor="klientoPavarde" className="block mb-1 font-semibold">
              Kliento pavardė
            </label>
            <input
              type="text"
              id="klientoPavarde"
              value={klientoPavarde}
              onChange={(e) => setKlientoPavarde(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Įveskite kliento pavardę"
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
