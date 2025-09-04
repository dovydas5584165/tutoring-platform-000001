"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";

type Row = { id: number; category: string; amount: number };

export default function FinanceDashboard() {
  /* ---------- statinė mokytojų analizė ---------- */
  const tutors = [
    { id: 1, name: "Jonas Jonaitis", lessonsTaught: 20, hourlyWage: 15 },
    { id: 2, name: "Asta Petrauskienė", lessonsTaught: 15, hourlyWage: 18 },
    { id: 3, name: "Povilas Kazlauskas", lessonsTaught: 25, hourlyWage: 14.5 },
  ];
  const totalTutorExpenses = tutors.reduce(
    (s, t) => s + t.lessonsTaught * t.hourlyWage,
    0
  );

  /* ---------- pajamos ir kitos išlaidos – redaguojamos ---------- */
  const [incomeRows, setIncomeRows] = useState<Row[]>([
    { id: 1, category: "Privatūs klientai", amount: 3000 },
    { id: 2, category: "Įmonių užsakymai", amount: 1500 },
  ]);

  const [expenseRows, setExpenseRows] = useState<Row[]>([
    { id: -1, category: "Mokytojai", amount: totalTutorExpenses }, // fiksuota eilutė
    { id: 1, category: "Administracija", amount: 600 },
    { id: 2, category: "Marketingas", amount: 400 },
  ]);

  /* ---------- redagavimo utilai (leidžiame keisti tik CUSTOM eilutes) ---------- */
  const editable = (row: Row) => row.id !== -1; // mokytojų eilutė nekeičiama

  const onEdit = (id: number, field: "category" | "amount", val: string) =>
    setExpenseRows((rows) =>
      rows.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]:
                field === "amount" ? parseFloat(val) || 0 : val,
            }
          : r
      )
    );

  const onDelete = (id: number) =>
    setExpenseRows((rows) => rows.filter((r) => r.id !== id));

  const addExpense = () =>
    setExpenseRows((rows) => [
      ...rows,
      { id: Date.now(), category: "Nauja eilutė", amount: 0 },
    ]);

  /* ---------- sumos ---------- */
  const totalIncome = incomeRows.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenseRows.reduce((s, r) => s + r.amount, 0);
  const totalProfit = totalIncome - totalExpenses;

  /* ---------- UI helper ---------- */
  const Cell = ({
    row,
    field,
    align = "left",
  }: {
    row: Row;
    field: "category" | "amount";
    align?: "left" | "right";
  }) => (
    <td
      contentEditable={editable(row)}
      suppressContentEditableWarning
      onBlur={(e) => editable(row) && onEdit(row.id, field, e.currentTarget.textContent ?? "")}
      className={`border border-gray-300 px-3 py-1 text-${align} ${
        editable(row) ? "outline-none cursor-text" : "bg-gray-100"
      }`}
    >
      {field === "amount" ? row.amount.toFixed(2) : row.category}
    </td>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      <h1 className="text-3xl font-bold mb-8">Finansų ataskaita</h1>

      {/* Pajamos / Išlaidos / Pelnas */}
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
                  <Cell row={r} field="category" />
                  <Cell row={r} field="amount" align="right" />
                  <td className="text-center">
                    <button
                      onClick={() =>
                        setIncomeRows((rows) =>
                          rows.filter((x) => x.id !== r.id)
                        )
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

        {/* Išlaidos (su mokytojais) */}
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
                  <Cell row={r} field="category" />
                  <Cell row={r} field="amount" align="right" />
                  <td className="text-center">
                    {editable(r) && (
                      <button
                        onClick={() => onDelete(r.id)}
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
