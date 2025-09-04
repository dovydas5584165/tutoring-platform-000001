"use client";

import React, { useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function InvoiceGenerator() {
  // Load last invoice number from localStorage or start at 1000
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    const saved = localStorage.getItem("invoiceNumber");
    return saved ? parseInt(saved, 10) : 1000;
  });

  const [individualNr, setIndividualNr] = useState("123123");
  const [vardas, setVardas] = useState("Dovydas");
  const [pavarde, setPavarde] = useState("Zilinskas");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [suma, setSuma] = useState("50");
  const [klientas, setKlientas] = useState("Domas Jokubauskas");

  const invoiceRef = useRef<HTMLDivElement>(null);

  // Format date for display (e.g. 12.07.2025)
  const formattedDate = new Date(data).toLocaleDateString("lt-LT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Format invoice number with prefix and padded serial number
  const formatInvoiceNumber = (num: number) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const serial = num.toString().padStart(4, "0");
    return `INV-${year}-${month}-${serial}`;
  };

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

    // Increment invoice number and save to localStorage
    const nextInvoiceNum = invoiceNumber + 1;
    setInvoiceNumber(nextInvoiceNum);
    localStorage.setItem("invoiceNumber", nextInvoiceNum.toString());
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
              required
            />
          </label>

          <label className="block">
            Vardas
            <input
              type="text"
              value={vardas}
              onChange={(e) => setVardas(e.target.value)}
              className="w-full border rounded p-2 mt-1"
              required
            />
          </label>

          <label className="block">
            Pavardė
            <input
              type="text"
              value={pavarde}
              onChange={(e) => setPavarde(e.target.value)}
              className="w-full border rounded p-2 mt-1"
              required
            />
          </label>

          <label className="block">
            Data
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full border rounded p-2 mt-1"
              required
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
              required
              min="0"
            />
          </label>

          <label className="block">
            Kliento vardas ir pavardė
            <input
              type="text"
              value={klientas}
              onChange={(e) => setKlientas(e.target.value)}
              className="w-full border rounded p-2 mt-1"
              required
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
            width: "595px", // A4 width in pt (210mm)
            minHeight: "842px", // A4 height in pt (297mm)
            padding: "40px",
            backgroundColor: "white",
            color: "#000",
            fontFamily: "'Helvetica', 'Arial', sans-serif",
            fontSize: "12pt",
            position: "absolute",
            left: "-9999px",
            boxSizing: "border-box",
            border: "1px solid #ddd",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
            <div>
              <h1 style={{ fontSize: "24pt", margin: 0, color: "#003366", fontWeight: "bold" }}>
                tiksliukai.lt
              </h1>
              <p style={{ margin: "6px 0", fontSize: "10pt", lineHeight: "1.3" }}>
                Gedimino pr. 1, Vilnius<br />
                Tel.: +370 612 34567<br />
                el. paštas: info@tiksliukai.lt
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>Sąskaita faktūra</h2>
              <p style={{ margin: "2px 0" }}>
                <strong>Nr.:</strong> {formatInvoiceNumber(invoiceNumber)}
              </p>
              <p style={{ margin: "2px 0" }}>
                <strong>Data:</strong> {formattedDate}
              </p>
            </div>
          </div>

          {/* Client & Payer Info */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
            <div style={{ width: "48%" }}>
              <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: "4px", marginBottom: "8px" }}>
                Klientas
              </h3>
              <p style={{ margin: 0 }}>{klientas}</p>
            </div>
            <div style={{ width: "48%" }}>
              <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: "4px", marginBottom: "8px" }}>
                Pardavėjas
              </h3>
              <p style={{ margin: 0 }}>
                Vardas: {vardas} {pavarde}<br />
                Individualios veiklos Nr.: {individualNr}
              </p>
            </div>
          </div>

          {/* Invoice Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "40px",
              fontSize: "11pt",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2", borderBottom: "2px solid #003366" }}>
                <th
                  style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left" }}
                >
                  Aprašymas
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "right",
                    width: "80px",
                  }}
                >
                  Kiekis
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "right",
                    width: "100px",
                  }}
                >
                  Vnt. kaina (€)
                </th>
                <th
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "right",
                    width: "120px",
                  }}
                >
                  Suma (€)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Mokymo paslaugos (tutoring services)
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "right" }}>
                  1
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "right" }}>
                  {parseFloat(suma).toFixed(2)}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "right" }}>
                  {parseFloat(suma).toFixed(2)}
                </td>
              </tr>
              <tr style={{ fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                <td
                  colSpan={3}
                  style={{ border: "1px solid #ccc", padding: "8px", textAlign: "right" }}
                >
                  Iš viso:
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "right" }}>
                  {parseFloat(suma).toFixed(2)} €
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div
            style={{
              borderTop: "1px solid #ccc",
              paddingTop: "20px",
              fontSize: "10pt",
              color: "#666",
              textAlign: "center",
            }}
          >
            <p>Mokėjimo sąlygos: per 14 dienų nuo sąskaitos gavimo.</p>
            <p>Ačiū, kad pasirinkote tiksliukai.lt!</p>
            <p>www.tiksliukai.lt</p>
          </div>
        </div>
      </div>
    </div>
  );
}
