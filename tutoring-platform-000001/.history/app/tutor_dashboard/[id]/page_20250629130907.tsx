"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Calendar, { CalendarProps } from "react-calendar";
import 'react-calendar/dist/Calendar.css';

type Lesson = {
  id: number;
  date: string; // format: YYYY-MM-DD
  topic: string;
  student: string;
};

export default function TutorDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const router = useRouter();
  const supabase = createClientComponentClient();

  const lessons: Lesson[] = [
    { id: 1, date: "2025-07-01", topic: "Įvadas į R ir RStudio", student: "Dovydas" },
    { id: 2, date: "2025-07-03", topic: "Statistikos pagrindai", student: "Gabija" },
    { id: 3, date: "2025-07-05", topic: "Excel duomenų analizė", student: "Tomas" },
  ];

  const handleDateChange: CalendarProps["onChange"] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value)) {
      setSelectedDate(value[0] ?? new Date());
    } else {
      setSelectedDate(new Date());
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("lt-LT");

  const selectedDateStr = selectedDate.toLocaleDateString("lt-LT");

  const lessonsOnSelectedDate = lessons.filter(
    lesson => formatDate(lesson.date) === selectedDateStr
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Sveiki, mokytojau!</h1>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Įrašyti sąskaitą
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Pridėti pamoką
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            Resursai
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Atsijungti
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Calendar */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Kalendorius</h2>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            locale="lt-LT"
          />
        </section>

        {/* Lessons */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Pamokos {selectedDateStr}
          </h2>
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
