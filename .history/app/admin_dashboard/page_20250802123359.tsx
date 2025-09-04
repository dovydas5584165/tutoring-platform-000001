"use client";

import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Tutor = {
  id: number;
  name: string;
  lessonsTaught: number;
  hourlyWage: number;
};

type Row = { id: number; category: string; amount: number };

export default function FinanceDashboard() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(true);

  // For month selector, default to current year/month
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // JS months 0-based

  // Helper: format month and year to YYYY-MM-DD for filtering
  function getMonthDateRange(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59); // last day of month
    return { start, end };
  }

  useEffect(() => {
    async function fetchData() {
      setLoadingTutors(true);
      try {
        // 1) Fetch tutors with role = 'tutor'
        const { data: tutorsData, error: tutorsError } = await supabase
          .from("users")
          .select("id, vardas, hourly_wage")
          .eq("role", "tutor");
        if (tutorsError) throw tutorsError;

        // 2) Fetch bookings count grouped by tutor (user_id) for selected month
        const { start, end } = getMonthDateRange(year, month);

        // Supabase expects ISO strings for filtering timestamps
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("user_id, count:user_id") // count grouped by user_id
          .gte("start_time", start.toISOString())
          .lte("start_time", end.toISOString())
          .eq("status", "confirmed")
          .group("user_id");

        if (bookingsError) throw bookingsError;

        // Map bookings count by user_id
        const bookingCounts = new Map<number, number>();
        bookingsData.forEach((b: any) => {
          bookingCounts.set(b.user_id, b.count);
        });

        // Merge tutors + bookings count
        const tutorsWithCounts = tutorsData.map((t: any) => ({
          id: t.id,
          name: t.vardas,
          hourlyWage: t.hourly_wage,
          lessonsTaught: bookingCounts.get(t.id) || 0,
        }));

        setTutors(tutorsWithCounts);
      } catch (error: any) {
        alert("Klaida užkraunant duomenis: " + error.message);
      } finally {
        setLoadingTutors(false);
      }
    }
    fetchData();
  }, [year, month]);

  const tutorPayments = tutors.map((t) => ({
    ...t,
    totalPayment: t.lessonsTaught * t.hourlyWage,
  }));

  const totalTutorExpenses = tutorPayments.reduce(
    (sum, t) => sum + t.totalPayment,
    0
  );

  /* ------------ Income & Expense state ------------ */
  const [incomeRows, setIncomeRows] = useState<Row[]>([
    { id: 1, category: "Privatūs klientai", amount: 3000 },
    { id: 2, category: "Įmonių užsakymai", amount: 1500 },
  ]);

  const [expenseRows, setExpenseRows] = useState<Row[]>([
    { id: -1, category: "Mokytojams", amount: totalTutorExpenses }, // fixed row
    { id: 1, category: "Administracija", amount: 600 },
    { id: 2, category: "Marketingas", amount: 400 },
  ]);

  /* ------------ Editable Cell component ------------ */
  const EditableCell = ({
    row,
    field,
    align = "left",
    onUpdate,
    readOnly,
  }: {
    row: Row;
    field: "category" | "amount";
    align?: "left" | "right";
    onUpdate: (id: number, field: "category" | "amount", val: string) => void;
    readOnly?: boolean;
  }) => (
    <td
      contentEditable={!readOnly}
      suppressContentEditableWarning
      onBlur={(e) =>
        !readOnly &&
        onUpdate(row.id, field, e.currentTarget.textContent?.trim() || "")
      }
      className={`border border-gray-300 px-3 py-1 text-${align} ${
        readOnly ? "bg-gray-100" : "outline-none cursor-text"
      }`}
    >
      {field === "amount"
        ? row.amount.toFixed(2)
        : row.category}
    </td>
  );

  /* ------------ Table builder helper ------------ */
  const makeTable = (
    title: string,
    rows: Row[],
    setRows: React.Dispatch<React.SetStateAction<Row[]>>,
    allowAdd = true,
    readOnlyPredicate: (r: Row) => boolean = () => false
  ) => {
    const addRow = () =>
      setRows((r) => [...r, { id: Date.now(), category: "Nauja eilutė", amount: 0 }]);
    const updateRow = (id: number, field: "category" | "amount", val: string) =>
      setRows((r) =>
        r.map((row) =>
          row.id === id
            ? {
                ...row,
                [field]: field === "amount" ? parseFloat(val) || 0 : val,
              }
            : row
        )
      );
    const deleteRow = (id: number) => setRows((r) => r.filter((row) => row.id !== id));

    // Update tutor expense row with latest totalTutorExpenses
    if (title === "Išlaidos") {
      const tutorRowIndex = rows.findIndex((r) => r.id === -1);
      if (tutorRowIndex !== -1 && rows[tutorRowIndex].amount !== totalTutorExpenses) {
        const updatedRows = [...rows];
        updatedRows[tutorRowIndex] = {
          ...updatedRows[tutorRowIndex],
          amount: totalTutorExpenses,
        };
        setRows(updatedRows);
      }
    }

    const total = rows.reduce((s, r) => s + r.amount, 0);

    return (
      <section className="bg-white shadow rounded p-6">
        <h2 className="text-xl font-semibold mb-4 flex justify-between">
          {title}
          {allowAdd && (
            <button
              onClick={addRow}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              + Pridėti
            </button>
          )}
        </h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b border-gray-300 pb-2">Kategorija</th>
              <th className="border-b border-gray-300 pb-2 text-right">Suma (€)</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="even:bg-gray-50">
                <EditableCell
                  row={r}
                  field="category"
                  onUpdate={updateRow}
                  readOnly={readOnlyPredicate(r)}
                />
                <EditableCell
                  row={r}
                  field="amount"
                  align="right"
                  onUpdate={updateRow}
                  readOnly={readOnlyPredicate(r)}
                />
                <td className="text-center">
                  {!readOnlyPredicate(r) && (
                    <button
                      onClick={() => deleteRow(r.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            <tr className="font-bold border-t border-gray-400">
              <td>Iš viso</td>
              <td className="text-right">{total.toFixed(2)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </section>
    );
  };

  /* ------------ Profit calculations ------------ */
  const totalIncome = incomeRows.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenseRows.reduce((s, r) => s + r.amount, 0);
  const totalProfit = totalIncome - totalExpenses;

  // Helper to generate month options for last 12 months
  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleDateString("lt-LT", { year: "numeric", month: "long" }),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      <h1 className="text-3xl font-bold mb-4">Finansų ataskaita</h1>

      {/* Month selector */}
      <div className="mb-6 flex items-center gap-4">
        <label htmlFor="month-select" className="font-semibold">
          Pasirinkite mėnesį:
        </label>
        <select
          id="month-select"
          value={`${year}-${month}`}
          onChange={(e) => {
            const [y, m] = e.target.value.split("-").map(Number);
            setYear(y);
            setMonth(m);
          }}
          className="border border-gray-300 rounded px-3 py-1"
        >
          {monthOptions.map(({ year, month, label }) => (
            <option key={`${year}-${month}`} value={`${year}-${month}`}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Tutors table */}
      <section className="bg-white shadow rounded p-6 mb-8 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Mokytojai</h2>
        {loadingTutors ? (
          <p>Kraunama...</p>
        ) : (
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-1">Vardas Pavardė</th>
                <th className="border border-gray-300 px-3 py-1 text-right">Pamokos</th>
                <th className="border border-gray-300 px-3 py-1 text-right">
                  Valandinis atlyginimas (€)
                </th>
                <th className="border border-gray-300 px-3 py-1 text-right">
                  Sumokėtina suma (€)
                </th>
              </tr>
            </thead>
            <tbody>
              {tutorPayments.map((t) => (
                <tr key={t.id} className="even:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-1">{t.name}</td>
                  <td className="border border-gray-300 px-3 py-1 text-right">{t.lessonsTaught}</td>
                  <td className="border border-gray-300 px-3 py-1 text-right">{t.hourlyWage.toFixed(2)}</td>
                  <td className="border border-gray-300 px-3 py-1 text-right font-semibold">{t.totalPayment.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="font-bold border-t border-gray-400">
                <td className="border border-gray-300 px-3 py-1" colSpan={3}>
                  Iš viso mokytojams
                </td>
                <td className="border border-gray-300 px-3 py-1 text-right">{totalTutorExpenses.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      {/* Income and Expense tables & Profit */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {makeTable("Pajamos", incomeRows, setIncomeRows)}
        {makeTable(
          "Išlaidos",
          expenseRows,
          setExpenseRows,
          true,
          (r) => r.id === -1 // "Mokytojams" row is read-only
        )}

        <section className="bg-white shadow rounded p-6 flex flex-col justify-center items-center">
          <h2 className="text-xl font-semibold mb-4">Pelnas</h2>
          <div
            className="text-5xl font-bold"
            style={{ color: totalProfit >= 0 ? "#16a34a" : "#dc2626" }}
          >
            {totalProfit.toFixed(2)} €
          </div>
        </section>
      </div>
    </div>
  );
}
