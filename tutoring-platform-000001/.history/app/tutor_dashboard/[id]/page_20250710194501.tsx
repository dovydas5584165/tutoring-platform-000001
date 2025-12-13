"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Lesson = {
  id: number;
  date: string; // ISO date format "YYYY-MM-DD"
  topic: string;
  student: string;
};

export default function TutorDashboard() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (!id) {
      router.push("/auth/log-in");
    }
  }, [id, router]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const lessons: Lesson[] = [
    { id: 1, date: "2025-07-01", topic: "Įvadas į R ir RStudio", student: "Dovydas" },
    { id: 2, date: "2025-07-03", topic: "Statistikos pagrindai", student: "Gabija" },
    { id: 3, date: "2025-07-05", topic: "Excel duomenų analizė", student: "Tomas" },
  ];

  const handleDateChange: CalendarProps["onChange"] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value.length > 0) {
      setSelectedDate(value[0]);
    }
  };

  const formatISODate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const selectedDateStr = formatISODate(selectedDate);

  const lessonsOnSelectedDate = lessons.filter(
    (lesson) => lesson.date === selectedDateStr
  );

  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      return;
    }
    router.push("/auth/log-in");
  };

  // Navigation handlers
  const goToSfForm = () => { if (id) router.push(`/tutor_dashboard/${id}/sf_form`); };
  const goToAddLesson = () => { if (id) router.push(`/tutor_dashboard/${id}/add_lesson`); };
  const goToResources = () => { if (id) router.push(`/tutor_dashboard/${id}/resources`); };

  // **New button handler for "Pažymiai"**
  const goToPazymiai = () => {
    if (id) router.push(`/tutor_dashboard/${id}/pazymiai`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">

      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Sveiki, mokytojau!</h1>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={goToSfForm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Įrašyti sąskaitą
          </button>
          <button
            onClick={goToAddLesson}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Pridėti pamoką
          </button>
          <button
            onClick={goToResources}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Resursai
          </button>
          {/* The PAŽYMIAI BUTTON */}
          <button
            onClick={goToPazymiai}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition font-semibold"
          >
            Pažymiai
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
          >
            Atsijungti
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">

        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Kalendorius</h2>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            locale="lt-LT"
          />
        </section>

        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Pamokos {selectedDateStr}
          </h2>
          {lessonsOnSelectedDate.length === 0 ? (
            <p className="text-gray-600">Nėra suplanuotų pamokų šiai dienai.</p>
          ) : (
            <ul className="space-y-3">
              {lessonsOnSelectedDate.map((lesson) => (
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
