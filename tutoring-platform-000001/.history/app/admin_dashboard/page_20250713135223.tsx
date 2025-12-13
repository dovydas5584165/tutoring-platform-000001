"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";

type CategoryRow = { id: number; category: string; amount: number };

export default function FinanceDashboard() {
  /* --- Tutor data (hard‑coded demo) --- */
  const tutors = [
    { id: 1, name: "Jonas Jonaitis", lessonsTaught: 20, hourlyWage: 15 },
    { id: 2, name: "Asta Petrauskienė", lessonsTaught: 15, hourlyWage: 18 },
    { id: 3, name: "Povilas Kazlauskas", lessonsTaught: 25, hourlyWage: 14.5 },
  ];
  const tutorPayments = tutors.map((t) => ({
    ...t,
    totalPayment: t.lessonsTaught * t.hourlyWage,
  }));
  const totalTutorExpenses = tutorPayments.reduce((s, t) => s + t.totalPayment, 0);

  /* --- Pajamos (income) – stateful & editable --- */
  const [incomeRows, setIncomeRows] = useState<CategoryRow[]>([
    { id: 1, category: "Privatūs klientai", amount: 3000 },
    { id: 2, category: "Įmonių užsakymai", amount: 1500 },
    { id: 3, category: "Partnerystės", amount: 500 },
  ]);

  /* --- Išlaidos (other expenses) – stateful & editable --- */
  const [expenseRows, setExpenseRows] = useState<CategoryRow[]>([
    { id: 1, category: "Administracija", amount: 600 },
    { id: 2, category: "Marketingas", amount: 400 },
  ]);

  /* --- Helpers to edit rows --- */
  const handleEdit =
    (setter: React.Dispatch<React.SetStateAction<CategoryRow[]>>) =>
    (id: number, field: "category" | "amount", value: string) => {
      setter((rows) =>
        rows.map((r) =>
          r.id === id
            ? { ...r, [field]: field === "amount" ? parseFloat(value) || 0 : value }
            : r
        )
      );
    };

  const handleDelete =
    (setter: React.Dispatch<React.SetStateAction<CategoryRow[]>>) =>
    (id: number) =>
      setter((rows) => rows.filter((r) => r.id !== id));

  const handleAdd =
    (setter: React.Dispatch<React.SetStateAction<CategoryRow[]>>) =>
    () =>
      setter((rows) => [
        ...rows,
        { id: Date.now(), category: "Nauja eilutė", amount: 0 },
      ]);

  /* --- Totals --- */
  const totalIncome = incomeRows.reduce((s, r) => s + r.amount, 0);
  const totalOtherExpenses = expenseRows.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = totalTutorExpenses + totalOtherExpenses;
  const totalProfit = totalIncome - totalExpenses;

  /* --- Reusable editable cell --- */
  const EditableCell = ({
    value,
    onChange,
    align = "left",
  }: {
    value: string | number;
    onChange: (val: string) => void;
    align?: "left" | "right";
  }) => (
    <td
      suppressContentEditableWarning
      contentEditable
      onBlur={(e) => onChange(e.currentTarget.textContent ?? "")}
      className={`border border-gray-300 px-3 py-1 outline-none text-${align}`}
    >
      {value}
    </td>
  );

  const renderTable = (
    rows: CategoryRow[],
    setter: React.Dispatch<React.SetStateAction<CategoryRow[]>>,
    title: string,
    total: number
  ) => (
    <section className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
        {title}
        <button
          onClick={handleAdd(setter)}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          + Pridėti
        </button>
      </h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="border-b border-gray-300 pb-2">Kategorija</th>
            <th className="border-b border-gray-300 pb-2 text-right">Suma (€)</th>
            <th className="border-b border-gray-300 pb-2 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="even:bg-gray-50">
              <EditableCell
                value={r.category}
                onChange={(val) => handleEdit(setter)(r.id, "category", val)}
              />
              <EditableCell
                value={r.amount.toFixed(2)}
                onChange={(val) => handleEdit(setter)(r.id, "amount", val)}
                align="right"
              />
              <td className="text-center">
                <button
                  onClick={() => handleDelete(setter)(r.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
          <tr className="font-bold border-t border-gray-400">
            <td className="py-2">Iš viso</td>
            <td className="py-2 text-right">{total.toFixed(2)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      <h1 className="text-3xl font-bold mb-8">Finansų ataskaita</h1>

      {/* Mokytojai */}
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

      {/* Pajamos / Išlaidos / Pelnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {renderTable(incomeRows, setIncomeRows, "Pajamos", totalIncome)}
        {renderTable(expenseRows, setExpenseRows, "Išlaidos", totalOtherExpenses)}

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
