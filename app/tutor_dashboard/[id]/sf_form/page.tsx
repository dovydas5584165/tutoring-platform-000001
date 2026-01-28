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

/* ─── Types ─────────────────────────────────────────────────────────────────── */
interface StudentLine {
  id: string;
  name: string;
  lessonCount: string;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
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
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [klientas, setKlientas] = useState("Dovydas Žilinskas");
  const [tutorId, setTutorId] = useState<string | null>(null);

  /* --------- Pricing & Students --------- */
  // Price per lesson is fetched but hidden from UI input
  const [pricePerLesson, setPricePerLesson] = useState<string>("0");
  
  const [students, setStudents] = useState<StudentLine[]>([
    { id: "1", name: "", lessonCount: "" },
  ]);
  
  // Editable Total Sum
  const [totalSum, setTotalSum] = useState<string>("0.00");

  const invoiceRef = useRef<HTMLDivElement | null>(null);

  /* --------- Get tutorId from URL --------- */
  useEffect(() => {
    if (!pathname) return;
    const parts = pathname.split("/");
    const idFromUrl = parts[2];
    if (idFromUrl) setTutorId(idFromUrl);
  }, [pathname]);

  /* --------- Fetch Tutor Info & Hourly Wage --------- */
  useEffect(() => {
    if (!tutorId) return;

    const fetchTutor = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, vardas, pavarde, iv_nr, hourly_wage")
        .eq("id", tutorId)
        .single();

      if (error) {
        console.error("Error fetching tutor:", error.message);
        return;
      }

      if (data) {
        setVardas(data.vardas);
        setPavarde(data.pavarde);
        if (data.iv_nr) setIndividualNr(data.iv_nr.toString());
        if (data.hourly_wage) {
          setPricePerLesson(data.hourly_wage.toString());
        }
      }
    };

    fetchTutor();
  }, [tutorId]);

  /* --------- Auto-Calculate Total Effect --------- */
  // Updates total automatically based on DB price, but user can overwrite it later
  useEffect(() => {
    const price = parseFloat(pricePerLesson) || 0;
    const calculated = students.reduce((acc, curr) => {
      const count = parseFloat(curr.lessonCount) || 0;
      return acc + count * price;
    }, 0);
    setTotalSum(calculated.toFixed(2));
  }, [students, pricePerLesson]);

  /* --------- Student List Handlers --------- */
  const addStudent = () => {
    setStudents((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", lessonCount: "" },
    ]);
  };

  const removeStudent = (id: string) => {
    if (students.length > 1) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } else {
      setStudents([{ id: crypto.randomUUID(), name: "", lessonCount: "" }]);
    }
  };

  const updateStudent = (id: string, field: "name" | "lessonCount", value: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  /* --------- Formatters --------- */
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

  /* --------- PDF Generation --------- */
  const generatePDF = async () => {
    if (!invoiceRef.current || !tutorId) {
      alert("Invoice reference or tutor ID is missing");
      return;
    }

    try {
      const { data: tutorData, error: fetchError } = await supabase
        .from("users")
        .select("iv_nr")
        .eq("id", tutorId)
        .single();

      if (fetchError) throw fetchError;

      if (!tutorData?.iv_nr && individualNr) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ iv_nr: individualNr })
          .eq("id", tutorId);
        if (updateError) throw updateError;
      }

      const canvas = await renderNodeInIsolatedIframe(invoiceRef.current);
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

  const renderNodeInIsolatedIframe = async (node: HTMLElement) => {
    return new Promise<HTMLCanvasElement>(async (resolve, reject) => {
      try {
        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.left = "-9999px";
        iframe.style.top = "0";
        iframe.style.width = "800px";
        iframe.style.height = "1120px";
        iframe.setAttribute("aria-hidden", "true");
        document.body.appendChild(iframe);

        const idoc = iframe.contentDocument;
        if (!idoc) throw new Error("Nepavyko atidaryti iframe dokumento");

        idoc.open();
        idoc.write(`
          <!doctype html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width,initial-scale=1" />
              <style>
                html,body { margin:0; padding:0; background: #ffffff; }
                * { box-sizing: border-box; }
              </style>
            </head>
            <body></body>
          </html>
        `);
        idoc.close();

        const clone = node.cloneNode(true) as HTMLElement;
        clone.style.width = "595px";
        clone.style.minHeight = "842px";
        clone.style.position = "relative";
        const all = clone.querySelectorAll("*");
        all.forEach((el) => ((el as HTMLElement).className = ""));
        idoc.body.appendChild(clone);

        await new Promise((r) => setTimeout(r, 50));
        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          windowWidth: iframe.clientWidth,
          windowHeight: iframe.clientHeight,
        });

        setTimeout(() => document.body.removeChild(iframe), 0);
        resolve(canvas);
      } catch (err) {
        reject(err);
      }
    });
  };

  /* ─── JSX ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen p-8 font-sans flex justify-center items-start" style={{ backgroundColor: "#f9fafb" }}>
      <div>
        <h1 className="text-3xl font-bold mb-6 text-center">Automatinė sąskaitos faktūra</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            generatePDF();
          }}
          className="max-w-md space-y-4 p-6 rounded shadow mx-auto"
          style={{ backgroundColor: "#ffffff" }}
        >
          {/* Static Fields */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Vardas</span>
              <input className="w-full border rounded p-2 mt-1 bg-gray-50" required value={vardas} readOnly />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Pavardė</span>
              <input className="w-full border rounded p-2 mt-1 bg-gray-50" required value={pavarde} readOnly />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Individualios veiklos Nr.</span>
            <input className="w-full border rounded p-2 mt-1" required value={individualNr} onChange={(e) => setIndividualNr(e.target.value)} />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Data</span>
            <input type="date" className="w-full border rounded p-2 mt-1" required value={data} onChange={(e) => setData(e.target.value)} />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Klientas (Mokėtojas)</span>
            <input className="w-full border rounded p-2 mt-1" required value={klientas} onChange={(e) => setKlientas(e.target.value)} />
          </label>

          <hr className="my-4 border-gray-200" />

          {/* Note: Price Input is removed per request, but logic remains in background */}

          {/* Dynamic Student List */}
          <div>
            <label className="block text-sm font-medium mb-2">Mokiniai ir pamokų kiekis:</label>
            {students.map((student) => (
              <div key={student.id} className="flex gap-2 mb-2 items-end">
                <div className="flex-1">
                  <input
                    placeholder="Mokinio vardas"
                    className="w-full border rounded p-2"
                    required
                    value={student.name}
                    onChange={(e) => updateStudent(student.id, "name", e.target.value)}
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    min="1"
                    placeholder="Kiekis"
                    className="w-full border rounded p-2 text-center"
                    required
                    value={student.lessonCount}
                    onChange={(e) => updateStudent(student.id, "lessonCount", e.target.value)}
                  />
                </div>
                {students.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStudent(student.id)}
                    className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 font-bold"
                    title="Pašalinti"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addStudent}
              className="text-sm text-blue-600 font-medium hover:underline mt-1"
            >
              + Pridėti mokinį
            </button>
          </div>

          {/* EDITABLE TOTAL SUM with Note */}
          <div className="pt-2 text-right">
            <label className="inline-block text-lg font-bold mr-2">Iš viso (€):</label>
            <input 
              type="number"
              step="0.01"
              className="border rounded p-2 w-32 text-right font-bold text-lg"
              value={totalSum}
              onChange={(e) => setTotalSum(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-2 leading-tight max-w-xs ml-auto">
              Jei pamokos trukmė buvo nestandartinė ir su administracija buvo susitarta dėl kitokios pamokos kainos, sumą galite pakeisti.
            </p>
          </div>

          <button
            type="submit"
            className="w-full font-bold py-3 mt-4 rounded transition shadow-lg"
            style={{ backgroundColor: "#2563eb", color: "#ffffff", border: "none" }}
          >
            Generuoti PDF
          </button>
        </form>

        {/* ─── HIDDEN INVOICE TEMPLATE ─────────────────────────────────────── */}
        <div
          ref={invoiceRef}
          style={{
            width: "595px",
            minHeight: "842px",
            padding: "40px",
            backgroundColor: "#ffffff",
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
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
              <div>
                <h1 style={{ fontSize: "24pt", margin: 0, color: "#003366", fontWeight: "bold" }}>tiksliukai.lt</h1>
                <p style={{ margin: "6px 0", fontSize: "10pt", lineHeight: 1.3 }}>
                  Saulėtekio al. 4, Vilnius<br />
                  Tel.: +370 603 95532<br />
                  el. paštas: info.tiksliukai@gmail.com
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <h2 style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>Sąskaita faktūra</h2>
                <p style={{ margin: 0 }}><strong>Nr.:</strong> {formatInvoiceNumber(invoiceNumber)}</p>
                <p style={{ margin: 0 }}><strong>Data:</strong> {formattedDate}</p>
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
                <p style={{ margin: 0 }}>Vardas: {vardas} {pavarde}<br />IV Nr.: {individualNr}</p>
              </div>
            </div>

            {/* Dynamic Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 40, fontSize: "11pt" }}>
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2", borderBottom: "2px solid #003366" }}>
                  <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Aprašymas</th>
                  <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right", width: 80 }}>Kiekis</th>
                  <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right", width: 100 }}>Vnt. kaina</th>
                  <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "right", width: 120 }}>Suma (€)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const qty = parseFloat(student.lessonCount) || 0;
                  const price = parseFloat(pricePerLesson) || 0;
                  const lineTotal = qty * price;

                  return (
                    <tr key={student.id}>
                      <td style={{ border: "1px solid #ccc", padding: 8 }}>
                        Mokymo paslaugos ({student.name})
                      </td>
                      <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                        {qty}
                      </td>
                      <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                        {price.toFixed(2)}
                      </td>
                      <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                        {lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}

                {/* Total Row uses the totalSum State (which is editable) */}
                <tr style={{ fontWeight: "bold", backgroundColor: "#f9f9f9" }}>
                  <td colSpan={3} style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>Iš viso:</td>
                  <td style={{ border: "1px solid #ccc", padding: 8, textAlign: "right" }}>
                    {parseFloat(totalSum || "0").toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ fontSize: "10pt", color: "#666", marginTop: "auto" }}>
            Sąskaita faktūra išrašyta pagal Lietuvos Respublikos įstatymus.
          </div>
        </div>
      </div>
    </div>
  );
}
