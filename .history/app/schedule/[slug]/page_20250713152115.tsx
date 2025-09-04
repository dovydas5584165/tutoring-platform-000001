export default function ScheduleLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm">
        <div className="text-xl font-semibold tracking-tight">Tiksliukai.lt</div>
      </header>

      {/* Main */}
      <main className="flex flex-col flex-1 justify-center items-center px-8">
        <h1 className="text-3xl font-bold mb-6">Tvarkaraštis</h1>
        <p className="text-gray-700 text-center max-w-lg mb-8">
          Pasirinkite pamoką pagrindiniame puslapyje, kad pamatytumėte tvarkaraštį.
        </p>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
