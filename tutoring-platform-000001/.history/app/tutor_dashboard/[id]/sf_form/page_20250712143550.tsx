"use client";

import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function InvoiceGenerator() {
  const supabase = createClientComponentClient();

  const [individualNr, setIndividualNr] = useState("");
  const [vardas, setVardas] = useState("");
  const [pavarde, setPavarde] = useState("");
  const [data, setData] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [suma, setSuma] = useState("50");
  const [klientas, setKlientas] = useState("Domas Jokubauskas");

  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: userData, error } = await supabase
        .from("users")
        .select("vardas, pavarde, iv_nr")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Klaida gaunant naudotojo duomenis:", error.message);
        return;
      }

      if (userData) {
        setVardas(userData.vardas || "");
        setPavarde(userData.pavarde || "");
        setIndividualNr(userData.iv_nr || "");
      }
    }

    fetchUserData();
  }, [supabase]);

  const formattedDate = new Date(data).toLocaleDateString("lt-LT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Saskaita_${formattedDate.replace(/\./g, "-")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans flex justify-center items-start">
      <div>
        <h1 className="text-3xl font-bold mb-6 text-center">
          Automatinė sąskaitos faktūra
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            generatePDF();
          }}
          className="max-w-md space-y-4 bg-white p-6 rounded shadow mx-auto"
        >
          <label className="block">
            Individualios veiklos Nr.
            <input
              type="text"
              value={individualNr}
              onChange={(e) => setIndividualNr(e.target.value)}
              className="w-full border rounded p-2 mt-1"
            />
          </label>

          <label className="block">
            Vardas
            <input
              type="text"
              value={vardas}
              onChange={(e) => setVardas(e.target.value)}
              className="w-full border rounded p-2 mt-1"
            />
          </label>

          <label className="block">
            Pavardė
            <input
              type="text"
              value={pavarde}
              onChange={(e) => setPavarde(e.target.value)}
              className="w-full border rounded p-2 mt-1"
            />
          </label>

          <label className="block">
            Data
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full border rounded p-2 mt-1"
            />
          </label>

          <label className="block">
            Suma (€)
            <input
              type="number"
              step="0.01"
              value={suma}
              onChange={(e) => setSuma(e.target.value)}
              className="w-full border rounded p-2 mt-1"
            />
          </label>

          <label className="block">
            Kliento vardas ir pavardė
            <input
              type="text"
              value={klientas}
              onChange={(e) => setKlientas(e.target.value)}
              className="w-full border rounded p-2 mt-1"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
          >
            Generuoti PDF
          </button>
        </form>

        {/* Hidden invoice for PDF generation */}
        <div
          ref={invoiceRef}
          style={{
            width: "595px",
            padding: "40px",
            backgroundColor: "white",
            color: "black",
            fontFamily: "'Arial', sans-serif",
            position: "absolute",
            left: "-9999px",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Sąskaitos faktūra
          </h2>
          <p>
            <strong>Individualios veiklos Nr.:</strong> {individualNr}
          </p>
          <p>
            <strong>Vardas:</strong> {vardas}
          </p>
          <p>
            <strong>Pavardė:</strong> {pavarde}
          </p>
          <p>
            <strong>Data:</strong> {formattedDate}
          </p>
          <p>
            <strong>Suma:</strong> €{parseFloat(suma).toFixed(2)}
          </p>
          <p>
            <strong>Klientas:</strong> {klientas}
          </p>
        </div>
      </div>
    </div>
  );
}
