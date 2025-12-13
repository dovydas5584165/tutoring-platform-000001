"use client";

import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yabbhnnhnrainsakhuio.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "REPLACE_ME";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function InvoiceGenerator() {
  /* Invoice number (localStorage) */
  const [invoiceNumber, setInvoiceNumber] = useState<number>(1000);
  useEffect(() => {
    const saved = localStorage.getItem("invoiceNumber");
    if (saved) setInvoiceNumber(parseInt(saved, 10));
  }, []);
  useEffect(() => {
    localStorage.setItem("invoiceNumber", invoiceNumber.toString());
  }, [invoiceNumber]);

  /* Form fields */
  const [individualNr, setIndividualNr] = useState("123123");
  const [vardas, setVardas] = useState("Dovydas");
  const [pavarde, setPavarde] = useState("Zilinskas");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [suma, setSuma] = useState("50");
  const [klientas, setKlientas] = useState("Domas Jokubauskas");

  const [invoices, setInvoices] = useState<any[]>([]);
  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`; // YYYY-MM
  });

  const invoiceRef = useRef<HTMLDivElement | null>(null);

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

  /* Generate PDF, upload, insert metadata */
  const generatePDF = async () => {
    if (!invoiceRef.current) {
      alert("Invoice reference is missing");
      return;
    }

    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfH = (imgProps.height * pdfW) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);

      const blob = pdf.output("blob");

      const fileName = `Saskaita_${formatInvoiceNumber(invoiceNumber)}_${formattedDate.replace(/\./g, "-")}.pdf`;

      // Upload file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(`invoices/${fileName}`, blob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "application/pdf",
        });

      if (uploadError) {
        alert("Nepavyko įkelti sąskaitos į serverį: " + uploadError.message);
        return;
      }

      // Insert invoice metadata into DB
      const { error: insertError } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        invoice_date: data,
        file_path: `invoices/${fileName}`,
        amount: parseFloat(suma),
      });

      if (insertError) {
        alert("Nepavyko įrašyti sąskaitos duomenų: " + insertError.message);
        return;
      }

      // Save and download
      pdf.save(fileName);
      setInvoiceNumber((prev) => prev + 1);
      alert("Sąskaita sėkmingai sukurta ir įkelta!");
      fetchInvoicesByMonth(filterMonth); // Refresh list
    } catch (e) {
      alert("Įvyko klaida generuojant sąskaitą.");
      console.error(e);
    }
  };

  /* Fetch invoices filtered by month YYYY-MM */
  const fetchInvoicesByMonth = async (month: string) => {
    // month format: 'YYYY-MM'
    const startDate = `${month}-01`;
    const endDateObj = new Date(startDate);
    endDateObj.setMonth(endDateObj.getMonth() + 1);
    const endDate = endDateObj.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .gte("invoice_date", startDate)
      .lt("invoice_date", endDate)
      .order("invoice_date", { ascending: false });

    if (error) {
      alert("Nepavyko užkrauti sąskaitų: " + error.message);
      return;
    }

    setInvoices(data ?? []);
  };

  useEffect(() => {
    fetchInvoicesByMonth(filterMonth);
  }, [filterMonth]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">Automatinė sąskaitos faktūra</h1>

      {/* Filter by month */}
      <label className="mb-4">
        Filtruoti sąskaitas pagal mėnesį:{" "}
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border rounded p-1"
        />
      </label>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          generatePDF();
        }}
        className="max-w-md space-y-4 bg-white p-6 rounded shadow mx-auto mb-8"
      >
        {/* Form inputs omitted for brevity (same as your previous form) */}
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

      {/* Invoice list */}
      <h2 className="text-xl font-semibold mb-4">Sąskaitų sąrašas ({filterMonth})</h2>
      <table className="w-full max-w-3xl border-collapse border border-gray-300 mb-12">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-1 text-left">Nr.</th>
            <th className="border border-gray-300 px-3 py-1 text-left">Data</th>
            <th className="border border-gray-300 px-3 py-1 text-left">Suma (€)</th>
            <th className="border border-gray-300 px-3 py-1 text-left">Failo kelias</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-4 text-gray-500">
                Sąskaitų nerasta.
              </td>
            </tr>
          ) : (
            invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="border border-gray-300 px-3 py-1">{inv.invoice_number}</td>
                <td className="border border-gray-300 px-3 py-1">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                <td className="border border-gray-300 px-3 py-1">{parseFloat(inv.amount).toFixed(2)}</td>
                <td className="border border-gray-300 px-3 py-1">{inv.file_path}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Hidden invoice for PDF generation */}
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
        {/* ...invoice layout same as your previous code... */}
        {/* Header */}
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ textAlign: "center" }}>SĄSKAITA FAKTŪRA</h2>
          <div style={{ textAlign: "center", marginTop: "5px" }}>
            Nr. {formatInvoiceNumber(invoiceNumber)}<br />
            Data: {formattedDate}
          </div>
        </div>
        {/* Seller info */}
        <div>
          <p><strong>Pardavėjas:</strong></p>
          <p>Individuali veikla, {vardas} {pavarde}</p>
          <p>Individualios veiklos nr.: {individualNr}</p>
        </div>
        {/* Buyer info */}
        <div style={{ marginTop: "20px" }}>
          <p><strong>Pirkėjas:</strong></p>
          <p>{klientas}</p>
        </div>
        {/* Invoice details */}
        <div style={{ marginTop: "30px" }}>
          <table width="100%" border={1} cellPadding={4} style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Prekės pavadinimas</th>
                <th>Kiekis</th>
                <th>Vieneto kaina (€)</th>
                <th>Suma (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Paslauga / prekė</td>
                <td>1</td>
                <td>{parseFloat(suma).toFixed(2)}</td>
                <td>{parseFloat(suma).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Total */}
        <div style={{ marginTop: "20px", textAlign: "right", fontWeight: "bold" }}>
          Iš viso: {parseFloat(suma).toFixed(2)} €
        </div>
      </div>
    </div>
  );
}
