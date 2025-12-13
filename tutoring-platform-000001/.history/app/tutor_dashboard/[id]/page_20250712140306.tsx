"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";

/* ---------- Types ---------- */
type Lesson = {
  id: number;
  date: string;
  topic: string;
  student: string;
};

/* ---------- Sutarties pop‑up ---------- */
function TermsPopup({ onAccept }: { onAccept: () => void }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Paslaugų teikimo sutartis</h2>

        <div className="text-sm text-gray-700 mb-6 whitespace-pre-line">
          {`
Korepetitorius patvirtina, kad sutinka laikytis šių paslaugų teikimo sąlygų:

1. Korepetitorius įsipareigoja teikti kokybiškas ir laiku vykdomas mokymo paslaugas.
2. Paslaugų apimtis, trukmė ir kaina yra sutartinai nustatytos.
3. Ginčų atveju šalys sieks susitarti derybų būdu. Nepavykus – ginčas sprendžiamas LR teisme.
4. Korepetitorius patvirtina, kad yra susipažinęs su visomis sąlygomis ir jas priima.
`}
        </div>

        <label className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="w-5 h-5"
          />
          <span>Sutinku su paslaugų teikimo sutartimi</span>
        </label>

        <button
          onClick={() => agreed && onAccept()}
          disabled={!agreed}
          className={`px-4 py-2 rounded text-white ${
            agreed
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          Sutinku
        </button>
      </div>
    </div>
  );
}

/* ---------- Pagrindinis komponentas ---------- */
export default function TutorDashboard() {
  const router         = useRouter();
  const params         = useParams();
  const tutorId        = params?.id as string | undefined;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading]           = useState(true);
  const [showTerms, setShowTerms]       = useState(false);

  /* Demo pamokos */
  const lessons: Lesson[] = [
    { id: 1, date: "2025-07-01", topic: "Įvadas į R ir RStudio", student: "Dovydas" },
    { id: 2, date: "2025-07-03", topic: "Statistikos pagrindai", student: "Gabija" },
    { id: 3, date: "2025-07-05", topic: "Excel duomenų analizė", student: "Tomas" },
  ];

  /* -------- Patikriname signed būseną -------- */
  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr || !user) {
        router.push("/auth/log-in");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("signed")
        .eq("id", user.id)
        .single();

      if (error) console.error("DB error:", error.message);
      setShowTerms(!data?.signed);
      setLoading(false);
    })();
  }, [router]);

  /* -------- Sutarties patvirtinimas -------- */
  const acceptTerms = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({ signed: true })
      .eq("id", user.id);

    if (error) {
      alert("Nepavyko įrašyti sutikimo: " + error.message);
      return;
    }
    setShowTerms(false);
  };

  /* -------- Pagalbinės -------- */
  const handleDateChange: CalendarProps["onChange"] = (v) =>
    setSelectedDate(v instanceof Date ? v : v[0] ?? new Date());

  const dateLT         = (d: string) => new Date(d).toLocaleDateString("lt-LT");
  const currentDateStr = selectedDate.toLocaleDateString("lt-LT");
  const lessonsToday   = lessons.filter((l) => dateLT(l.date) === currentDateStr);

  const goto = (path: string) => tutorId && router.push(`/tutor_dashboard/${tutorId}/${path}`);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/auth/log-in");
  };

  /* -------- Render -------- */
  if (loading)   return <div className="p-8">Įkeliama…</div>;
  if (showTerms) return <TermsPopup onAccept={acceptTerms} />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Sveiki, mokytojau!</h1>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => goto("sf_form")}   className="px-4 py-2 bg-blue-600  text-white rounded hover:bg-blue-700">Įrašyti sąskaitą</button>
          <button onClick={() => goto("add_lesson")} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Pridėti pamoką</button>
          <button onClick={() => goto("grades")}     className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Pridėti pažymį</button>
          <button onClick={() => goto("resources")}  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Resursai</button>
          <button onClick={logout} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">Atsijungti</button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Kalendorius</h2>
          <Calendar value={selectedDate} onChange={handleDateChange} locale="lt-LT" />
        </section>

        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pamokos {currentDateStr}</h2>
          {lessonsToday.length === 0 ? (
            <p className="text-gray-600">Nėra suplanuotų pamokų šiai dienai.</p>
          ) : (
            <ul className="space-y-3">
              {lessonsToday.map((l) => (
                <li key={l.id} className="border-b border-gray-200 pb-2">
                  <div><strong>Tema:</strong> {l.topic}</div>
                  <div><strong>Studentas:</strong> {l.student}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
