 "use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Calendar, { CalendarProps } from "react-calendar";
import 'react-calendar/dist/Calendar.css';

type Lesson = {
  id: number;
  date: string;
  topic: string;
  student: string;
};

type UserFlags = {
  signed: boolean;
  signed_at: string | null;
};

function TermsPopup({ onAccept }: { onAccept: () => void }) {
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    if (!agreed) {
      alert("Prašome sutikti su paslaugų teikimo sutartimi.");
      return;
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Paslaugų teikimo sutartis</h2>

        <div className="text-sm text-gray-700 mb-6 whitespace-pre-line">
          <p>Korepetitorius patvirtina, kad sutinka laikytis šių paslaugų teikimo sąlygų:</p>
          <p>1. Korepetitorius įsipareigoja teikti kokybiškas ir laiku vykdomas mokymo paslaugas.</p>
          <p>2. Paslaugų apimtis, trukmė ir kaina yra sutartinai nustatytos.</p>
          <p>3. Ginčų atveju šalys sieks susitarti derybų būdu. Nepavykus, ginčas sprendžiamas Lietuvos Respublikos teisės aktų nustatyta tvarka.</p>
          <p>4. Korepetitorius patvirtina, kad yra susipažinęs su visomis sąlygomis ir jas priima.</p>
          <p>(Sutarties tekstas gali būti papildytas ir koreguojamas pagal poreikį.)</p>
        </div>

        <label className="flex items-center space-x-2 mb-6">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="w-5 h-5"
          />
          <span>Sutinku su paslaugų teikimo sutartimi</span>
        </label>

        <div className="flex justify-end">
          <button
            onClick={handleAgree}
            disabled={!agreed}
            className={`px-4 py-2 rounded text-white ${
              agreed ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Sutinku
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TutorDashboard() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showTerms, setShowTerms] = useState(false);
  const [userFlags, setUserFlags] = useState<UserFlags | null>(null);

  const checkAgreement = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("users")
      .select("signed, signed_at")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Klaida tikrinant sutikimą:", error.message);
      return;
    }

    if (!data.signed) setShowTerms(true);
    setUserFlags(data);
  };

  useEffect(() => {
    checkAgreement();
  }, []);

  const acceptTerms = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({
        signed: true,
        signed_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      alert("Nepavyko įrašyti sutikimo: " + error.message);
      return;
    }

    setUserFlags({ signed: true, signed_at: new Date().toISOString() });
    setShowTerms(false);
  };

  const lessons: Lesson[] = [
    { id: 1, date: "2025-07-01", topic: "Įvadas į R ir RStudio", student: "Dovydas" },
    { id: 2, date: "2025-07-03", topic: "Statistikos pagrindai", student: "Gabija" },
    { id: 3, date: "2025-07-05", topic: "Excel duomenų analizė", student: "Tomas" },
  ];

  const handleDateChange: CalendarProps["onChange"] = (v) => {
    const date = Array.isArray(v) ? v[0] : v;
    if (date instanceof Date) setSelectedDate(date);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("lt-LT");

  const selectedDateStr = selectedDate.toLocaleDateString("lt-LT");

  const lessonsOnSelectedDate = lessons.filter(
    lesson => formatDate(lesson.date) === selectedDateStr
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/auth/log-in");
  };

  const goTo = (path: string) => {
    if (id) router.push(`/tutor_dashboard/${id}/${path}`);
  };

  if (showTerms) {
    return <TermsPopup onAccept={acceptTerms} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sveiki, mokytojau!</h1>
          {userFlags?.signed_at && (
            <p className="text-xs text-gray-500">
              Sutartis pasirašyta: {new Date(userFlags.signed_at).toLocaleDateString("lt-LT")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => goTo("sf_form")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Išrašyti sąskaitą</button>
          <button onClick={() => goTo("add_lesson")} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Pridėti pamoką</button>
          <button onClick={() => goTo("grades")} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Pridėti pažymį</button>
          <a
            href="https://drive.google.com/drive/folders/1uBSRCUxunwWaXNIIeAWP8keY1O5wlzm7?usp=share_link"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 inline-block text-center"
          >
            Resursai
          </a>
          <button onClick={handleLogout} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700">Atsijungti</button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Kalendorius</h2>
          <Calendar onChange={handleDateChange} value={selectedDate} locale="lt-LT" />
        </section>

        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pamokos {selectedDateStr}</h2>
          {lessonsOnSelectedDate.length === 0 ? (
            <p className="text-gray-600">Nėra suplanuotų pamokų šiai dienai.</p>
          ) : (
            <ul className="space-y-3">
              {lessonsOnSelectedDate.map(lesson => (
                <li key={lesson.id} className="border-b border-gray-200 pb-2">
                  <div><strong>Tema:</strong> {lesson.topic}</div>
                  <div><strong>Studentas:</strong> {lesson.student}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
