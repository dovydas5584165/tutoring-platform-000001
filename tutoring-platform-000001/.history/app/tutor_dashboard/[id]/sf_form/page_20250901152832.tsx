"use client";

import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { createClient } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

/* ─── Supabase ──────────────────────────────────────────────────────────────── */
const supabaseUrl = "https://yabbhnnhnrainsakhuio.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "REPLACE_ME";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ─── Komponentas ──────────────────────────────────────────────────────────── */
export default function InvoiceGenerator() {
  const pathname = usePathname();

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
  const [individualNr, setIndividualNr] = useState("");
  const [vardas, setVardas] = useState("");
  const [pavarde, setPavarde] = useState("");
  const [hourlyWage, setHourlyWage] = useState(0);
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [suma, setSuma] = useState("0");
  const [klientas, setKlientas] = useState("Dovydas Žilinskas");
  const [tutorId, setTutorId] = useState<string | null>(null);

  const invoiceRef = useRef<HTMLDivElement | null>(null);

  /* --------- Get tutorId from URL --------- */
  useEffect(() => {
    const parts = pathname.split("/");
    const idFromUrl = parts[2]; // /tutor_dashboard/[tutorId]/sf_form
    if (idFromUrl) setTutorId(idFromUrl);
  }, [pathname]);

  /* --------- Fetch tutor info by tutorId --------- */
  useEffect(() => {
    if (!tutorId) return;

    const fetchTutor = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, vardas, pavarde, hourly_wage, iv_nr")
        .eq("id", tutorId)
        .single();

      if (error) {
        console.error("Error fetching tutor:", error.message);
        return;
      }

      if (data) {
        setVardas(data.vardas);
        setPavarde(data.pavarde);
        setHourlyWage(parseFloat(data.hourly_wage) || 0);

        // Autofill IV_NR if present
        if (data.iv_nr) setIndividualNr(data.iv_nr.toString());
      }
    };

    fetchTutor();
  }, [tutorId]);

  /* --------- Fetch sum from confirmed bookings --------- */
  useEffect(() => {
  if (!tutorId) return;

  const fetchTutorWage = async () => {
    // 1. Count confirmed & not cancelled bookings
    const { count, error: bookingsError } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("tutor_id", tutorId)
      .eq("confirmed_by_tutor", true)
      .is("cancelled_at", null);

    if (bookingsError) {
      console.error("Error fetching bookings count:", bookingsError.message);
      return;
    }

    const confirmedOrders = count ?? 0;

    // 2. Fetch tutor hourly wage
    const { data: tutorData, error: tutorError } = await supabase
      .from("tutors")
      .select("hourly_wage")
      .eq("id", tutorId)
      .single();

    if (tutorError) {
      console.error("Error fetching tutor hourly wage:", tutorError.message);
      return;
    }

    const hourlyWage = tutorData?.hourly_wage ?? 0;

    // 3. Calculate total wage
    const wage = confirmedOrders * hourlyWage;

    setSuma(wage.toFixed(2)); // save total wage
  };

  fetchTutorWage();
}, [tutorId]);


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

  /* --------- PDF generation + save IV_NR --------- */
  const generatePDF = async () => {
    if (!invoiceRef.current || !tutorId) {
      alert("Invoice reference or tutor ID is missing");
      return;
    }

    try {
      // Save IV_NR to DB if it's empty
      const { data: tutorData, error: fetchError } = await supabase
        .from("users")
        .select("iv_nr")
        .eq("id", tutorId)
        .single();

      if (fetchError) throw fetchError;

      if (!tutorData.iv_nr && individualNr) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ iv_nr: individualNr })
          .eq("id", tutorId);

        if (updateError) throw updateError;
      }

      // Generate PDF
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfH = (imgProps.height * pdfW) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH);

      const blob = pdf.output("blob");

      const invoiceDate = new Date(data);
      const folder = `${invoiceDate.getFullYear()}-${(invoiceDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const fileName = `${formatInvoiceNumber(invoiceNumber)}_${formattedDate.replace(/\./g, "-")}.pdf`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(filePath, blob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "application/pdf",
        });

      if (uploadError) throw uploadError;

      pdf.save(fileName);
      setInvoiceNumber((prev) => prev + 1);
      alert("Sąskaita sėkmingai sukurta ir įkelta!");
    } catch (err: any) {
      console.error("Error generating PDF:", err.message || err);
      alert("Įvyko klaida generuojant sąskaitą: " + (err.message || err));
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
            <input className="w-full border rounded p-2 mt-1" required value={vardas} readOnly />
          </label>
          <label className="block">
            Pavardė
            <input className="w-full border rounded p-2 mt-1" required value={pavarde} readOnly />
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
              readOnly
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

        {/* Hidden invoice div for PDF */}
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
                el. paštas: info.tiksliukai@gmail.com
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
              <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>Klientas</h3>
              <p style={{ margin: 0 }}>{klientas}</p>
            </div>
            <div style={{ width: "48%" }}>
              <h3 style={{ borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 8 }}>Pardavėjas</h3>
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
                <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right"}}>1</td>
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
