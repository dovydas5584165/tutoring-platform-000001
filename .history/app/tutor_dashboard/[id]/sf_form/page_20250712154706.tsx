"use client";

import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createClient } from "@supabase/supabase-js";

/* ─── Supabase ──────────────────────────────────────────────────────────────── */
const supabaseUrl = "https://yabbhnnhnrainsakhuio.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "REPLACE_ME";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ─── Komponentas ──────────────────────────────────────────────────────────── */
export default function InvoiceGenerator() {
  /* --------- Invoice number (localStorage) --------- */
  const [invoiceNumber, setInvoiceNumber] = useState<number>(1000);
  useEffect(() => {
    const saved = localStorage.getItem("invoiceNumber");
    if (saved) setInvoiceNumber(parseInt(saved, 10));
  }, []);
  useEffect(() => {
    localStorage.setItem("invoiceNumber", invoiceNumber.toString());
  }, [invoiceNumber]);

  /* --------- Form fields --------- */
  const [individualNr, setIndividualNr] = useState("123123");
  const [vardas, setVardas] = useState("Dovydas");
  const [pavarde, setPavarde] = useState("Zilinskas");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [suma, setSuma] = useState("50");
  const [klientas, setKlientas] = useState("Domas Jokubauskas");

  const invoiceRef = useRef<HTMLDivElement | null>(null);

  /* --------- Helper functions --------- */
  const formattedDate = new Date(data).toLocaleDateString("lt-LT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formatInvoiceNumber = (n: number) => {
    const now = new Date();
    const yr = now.getFullYear();
    const mo = (now.getMonth() + 1).toString().padStart(2, "0");
    const serial = n.toString().padStart(4, "0");
    return `INV-${yr}-${mo}-${serial}`;
  };

  /* --------- PDF generation + upload --------- */
  const generatePDF = async () => {
    if (!invoiceRef.current) {
      alert("Invoice reference is missing");
      return;
    }

    try {
      /* DOM → Canvas */
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      /* Canvas → PDF */
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfH = (imgProps.height * pdfW) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);

      /* PDF to Blob */
      const blob = pdf.output("blob");
      console.log("Blob type:", blob.type, "Is Blob?", blob instanceof Blob);

      /* Extract year and month for folder */
      const invoiceDate = new Date(data);
      const folder = `${invoiceDate.getFullYear()}-${(invoiceDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      /* Create unique filename WITHOUT tutorId */
      const fileName = `${formatInvoiceNumber(invoiceNumber)}_${formattedDate.replace(/\./g, "-")}.pdf`;

      /* Upload path with folder */
      const filePath = `${folder}/${fileName}`;

      /* Upload to Supabase Storage - monthly folder */
      const { data: uploadData, error } = await supabase.storage
        .from("invoices")
        .upload(filePath, blob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "application/pdf",
        });

      if (error) {
        console.error("Upload error:", error.message);
        alert("Nepavyko įkelti sąskaitos į serverį: " + error.message);
        return;
      }

      console.log("Upload success:", uploadData);

      /* Local download */
      pdf.save(fileName);

      /* Increase invoice number */
      setInvoiceNumber((prev) => prev + 1);
      alert("Sąskaita sėkmingai sukurta ir įkelta!");
    } catch (e) {
      console.error("PDF generation error:", e);
      alert("Įvyko klaida generuojant sąskaitą.");
    }
  };

  /* ─── JSX ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans flex justify-center items-start">
      <div>
        <h1 className="text-3xl font-bold mb-6 text-center">Automatinė sąskaitos faktūra</h1>

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
              className="w-full border rounded p-2 mt-1"
              required
              value={individualNr}
              onChange={(e) => setIndividualNr(e.target.value)}
            />
          </label>
          <label className="block">
            Vardas
            <input
              className="w-full border rounded p-2 mt-1"
              required
              value={vardas}
              onChange={(e) => setVardas(e.target.value)}
            />
          </label>
          <label className="block">
            Pavardė
            <input
              className="w-full border rounded p-2 mt-1"
              required
              value={pavarde}
              onChange={(e) => setPavarde(e.target.value)}
            />
          </label>
          <label className="block">
            Data
            <input
              type="date"
              className="w-full border rounded p-2 mt-1"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </label>
          <label className="block">
            Suma (€)
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full border rounded p-2 mt-1"
              required
              value={suma}
              onChange={(e) => setSuma(e.target.value)}
            />
          </label>
          <label className="block">
            Kliento vardas ir pavardė
            <input
              className="w-full border rounded p-2 mt-1"
              required
              value={klientas}
              onChange={(e) => setKlientas(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
          >
            Generuoti PDF
          </button>
        </form>

        <div
          ref={invoiceRef}
          style={{
            width: "595px",
            minHeight: "842px",
            padding: "40px",
            backgroundColor: "white",
            fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: "12pt",
            position: "absolute",
            left: "-9999px",
            border: "1px solid #ddd",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
            <div>
              <h1 style={{ fontSize: "24pt", margin: 0, color: "#003366", fontWeight: "bold" }}>
                tiksliukai.lt
              </h1>
              <p style={{ margin: "6px 0", fontSize: "10pt", lineHeight: 1.3 }}>
                Saulėtekio al. 4, Vilnius
                <br />
                Tel.: +370 603 95532
                <br />
                el. paštas: info@tiksliukai.lt
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>Sąskaita faktūra</h2>
              <p style={{ margin: 0 }}>
                <strong>Nr.:</strong> {formatInvoiceNumber(invoiceNumber)}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Data:</strong> {formattedDate}
              </p>
            </div>
          </div>

          {/* Client & Seller */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
            <div style={{ width: "48%" }}>
              <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>
                Klientas
              </h3>
              <p style={{ margin: 0 }}>{klientas}</p>
            </div>
            <div style={{ width: "48%" }}>
              <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>
                Pardavėjas
              </h3>
              <p style={{ margin: 0 }}>
                Vardas: {vardas} {pavarde}
                <br />
                Individualios veiklos Nr.: {individualNr}
              </p>
            </div>
          </div>

          {/* Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 40,
              fontSize: "11pt",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2", borderBottom: "2px solid #003366" }}>
                <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Aprašymas</th>
                <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right", width: 80 }}>Kiekis</th>
                <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right", width: 100 }}>Vnt. kaina (€)</th>
                <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right", width: 120 }}>Suma (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>Mokymo paslaugos (tutoring services)</td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>1</td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>{parseFloat(suma).toFixed(2)}</td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>{parseFloat(suma).toFixed(2)}</td>
              </tr>
              <tr style={{ fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                <td colSpan={3} style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                  Iš viso:
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>{parseFloat(suma).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div style={{ fontSize: "10pt", color: "#666" }}>
            Sąskaita faktūra išrašyta pagal Lietuvos Respublikos įstatymus.
          </div>
        </div>
      </div>
    </div>
  );
}
