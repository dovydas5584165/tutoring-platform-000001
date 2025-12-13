"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";

type Row = { id: number; category: string; amount: number };

export default function FinanceDashboard() {
  /* ---------- Mokytojai (detailed table stays) ---------- */
  const tutors = [
    { id: 1, name: "Jonas Jonaitis", lessonsTaught: 20, hourlyWage: 15 },
    { id: 2, name: "Asta Petrauskienė", lessonsTaught: 15, hourlyWage: 18 },
    { id: 3, name: "Povilas Kazlauskas", lessonsTaught: 25, hourlyWage: 14.5 },
  ];
  const tutorPayments = tutors.map((t) => ({
    ...t,
    totalPayment: t.lessonsTaught * t.hourlyWage,
  }));
  const totalTutorExpenses = tutorPayments.reduce(
    (s, p) => s + p.totalPayment,
    0
  );

  /* ---------- Pajamos & kitos išlaidos (stateful) ---------- */
  const [incomeRows, setIncomeRows] = useState<Row[]>([
    { id: 1, category: "Privatūs klientai", amount: 3000 },
    { id: 2, category: "Įmonių užsakymai", amount: 1500 },
  ]);

  const [expenseRows, setExpenseRows] = useState<Row[]>([
    // id = -1 → fixed “Mokytojams” row (non‑editable)
    { id: -1, category: "Mokytojams", amount: totalTutorExpenses },
    { id: 1, category: "Administracija", amount: 600 },
    { id: 2, category: "Marketingas", amount: 400 },
  ]);

  /* ---------- helpers ---------- */
  const isEditable = (row: Row) => row.id !== -1;

  const editRow = (id: number, field: "category" | "amount", value: string) =>
    setExpenseRows((rows) =>
      rows.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]:
                field === "amount" ? parseFloat(value) || 0 : value,
            }
          : r
      )
    );

  const deleteRow = (id: number) =>
    setExpenseRows((rows) => rows.filter((r) => r.id !== id));

  const addExpense = () =>
    setExpenseRows((rows) => [
      ...rows,
      { id: Date.now(), category: "Nauja eilutė", amount: 0 },
    ]);

  const totalIncome = incomeRows.reduce((s, r) => s + r.amount, 0);
  const totalOtherExpenses = expenseRows
    .filter((r) => r.id !== -1)
    .reduce((s, r) => s + r.amount, 0);
  const totalExpenses = totalTutorExpenses + totalOtherExpenses;
  const totalProfit = totalIncome - totalExpenses;

  const Editable = ({
    row,
    field,
    align,
  }: {
    row: Row;
    field: "category" | "amount";
    align?: "left" | "right";
  }) => (
    <td
      contentEditable={isEditable(row)}
      suppressContentEditableWarning
      onBlur={(e) =>
        isEditable(row) && editRow(row.id, field, e.currentTarget.textContent || "")
      }
      className={`border border-gray-300 px-3 py-1 text-${align ?? "left"} ${
        isEditable(row) ? "cursor-text outline-none" : "bg-gray-100"
      }`}
    >
      {field === "amount" ? row.amount.toFixed(2) : row.category}
    </td>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      <h1 className="text-3xl font-bold mb-8">Finansų ataskaita</h1>

      {/* ------------- MOKYTOJAI TABLE (unchanged) ------------- */}
      <section className="bg-white shadow rounded p-6 mb-8 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Mokytojai</h2>
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
                <td className="border border-gray-300 px-3 py-1 text-right">
                  {t.lessonsTaught}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-right">
                  {t.hourlyWage.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-right font-semibold">
                  {t.totalPayment.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="font-bold border-t border-gray-400">
              <td className="border border-gray-300 px-3 py-1" colSpan={3}>
                Iš viso mokytojams
              </td>
              <td className="border border-gray-300 px-3 py-1 text-right">
                {totalTutorExpenses.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ------------- INCOME / EXPENSE / PROFIT ------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Pajamos */}
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4 flex justify-between">
            Pajamos
            <button
              onClick={() =>
                setIncomeRows((r) => [
                  ...r,
                  { id: Date.now(), category: "Nauja eilutė", amount: 0 },
                ])
              }
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              + Pridėti
            </button>
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b border-gray-300 pb-2">Kategorija</th>
                <th className="border-b border-gray-300 pb-2 text-right">
                  Suma (€)
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {incomeRows.map((r) => (
                <tr key={r.id} className="even:bg-gray-50">
                  <Editable row={r} field="category" />
                  <Editable row={r} field="amount" align="right" />
                  <td className="text-center">
                    <button
                      onClick={() =>
                        setIncomeRows((rows) => rows.filter((x) => x.id !== r.id))
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="font-bold border-t border-gray-400">
                <td>Iš viso</td>
                <td className="text-right">{totalIncome.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Išlaidos */}
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4 flex justify-between">
            Išlaidos
            <button
              onClick={addExpense}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              + Pridėti
            </button>
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b border-gray-300 pb-2">Kategorija</th>
                <th className="border-b border-gray-300 pb-2 text-right">
                  Suma (€)
                </th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {expenseRows.map((r) => (
                <tr key={r.id} className="even:bg-gray-50">
                  <Editable row={r} field="category" />
                  <Editable row={r} field="amount" align="right" />
                  <td className="text-center">
                    {isEditable(r) && (
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
                <td className="text-right">{totalExpenses.toFixed(2)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Pelnas */}
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
