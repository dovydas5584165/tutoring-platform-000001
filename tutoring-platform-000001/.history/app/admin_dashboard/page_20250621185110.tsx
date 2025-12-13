"use client";

export default function FinanceDashboard() {
  const tutors = [
    { id: 1, name: 'Jonas Jonaitis', lessonsTaught: 20, hourlyWage: 15.0 },
    { id: 2, name: 'Asta Petrauskienė', lessonsTaught: 15, hourlyWage: 18.0 },
    { id: 3, name: 'Povilas Kazlauskas', lessonsTaught: 25, hourlyWage: 14.5 },
  ];

  const tutorPayments = tutors.map(t => ({
    ...t,
    totalPayment: t.lessonsTaught * t.hourlyWage,
  }));

  const incomeCategories = [
    { id: 1, category: 'Privatūs klientai', amount: 3000 },
    { id: 2, category: 'Įmonių užsakymai', amount: 1500 },
    { id: 3, category: 'Partnerystės', amount: 500 },
  ];

  const otherExpenses = [
    { id: 1, category: 'Administracija', amount: 600 },
    { id: 2, category: 'Marketingas', amount: 400 },
  ];

  const totalTutorExpenses = tutorPayments.reduce((sum, t) => sum + t.totalPayment, 0);
  const totalOtherExpenses = otherExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = totalTutorExpenses + totalOtherExpenses;
  const totalIncome = incomeCategories.reduce((sum, i) => sum + i.amount, 0);
  const totalProfit = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-900">
      <h1 className="text-3xl font-bold mb-8">Finansų ataskaita</h1>

      {/* Mokytojai viršuje */}
      <section className="bg-white shadow rounded p-6 mb-8 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Mokytojai</h2>
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-1">Vardas Pavardė</th>
              <th className="border border-gray-300 px-3 py-1 text-right">Pamokos</th>
              <th className="border border-gray-300 px-3 py-1 text-right">Valandinis atlyginimas (€)</th>
              <th className="border border-gray-300 px-3 py-1 text-right">Sumokėtina suma (€)</th>
            </tr>
          </thead>
          <tbody>
            {tutorPayments.map(t => (
              <tr key={t.id} className="even:bg-gray-50">
                <td className="border border-gray-300 px-3 py-1">{t.name}</td>
                <td className="border border-gray-300 px-3 py-1 text-right">{t.lessonsTaught}</td>
                <td className="border border-gray-300 px-3 py-1 text-right">{t.hourlyWage.toFixed(2)}</td>
                <td className="border border-gray-300 px-3 py-1 text-right font-semibold">{t.totalPayment.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="font-bold border-t border-gray-400">
              <td className="border border-gray-300 px-3 py-1" colSpan={3}>Iš viso mokytojams</td>
              <td className="border border-gray-300 px-3 py-1 text-right">{totalTutorExpenses.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Pajamos */}
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Pajamos</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b border-gray-300 pb-2">Kategorija</th>
                <th className="border-b border-gray-300 pb-2 text-right">Suma (€)</th>
              </tr>
            </thead>
            <tbody>
              {incomeCategories.map(({ id, category, amount }) => (
                <tr key={id} className="even:bg-gray-50">
                  <td className="py-2">{category}</td>
                  <td className="py-2 text-right">{amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="font-bold border-t border-gray-400">
                <td className="py-2">Iš viso</td>
                <td className="py-2 text-right">{totalIncome.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Išlaidos */}
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Išlaidos</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b border-gray-300 pb-2">Kategorija</th>
                <th className="border-b border-gray-300 pb-2 text-right">Suma (€)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="even:bg-gray-50">
                <td className="py-2">Mokytojams</td>
                <td className="py-2 text-right">{totalTutorExpenses.toFixed(2)}</td>
              </tr>
              {otherExpenses.map(({ id, category, amount }) => (
                <tr key={id} className="even:bg-gray-50">
                  <td className="py-2">{category}</td>
                  <td className="py-2 text-right">{amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="font-bold border-t border-gray-400">
                <td className="py-2">Iš viso</td>
                <td className="py-2 text-right">{totalExpenses.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Pelnas */}
        <section className="bg-white shadow rounded p-6 flex flex-col justify-center items-center">
          <h2 className="text-xl font-semibold mb-4">Pelnas</h2>
          <div
            className="text-5xl font-bold"
            style={{ color: totalProfit >= 0 ? '#16a34a' : '#dc2626' }}
          >
            {totalProfit.toFixed(2)} €
          </div>
        </section>

      </div>
    </div>
  );
}
