"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Calendar, { CalendarProps } from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Grade = {
  id: number;
  user_id: string;
  subject: string;
  grade: number;
  date?: string;
};

export default function TutorDashboard() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loadingGrades, setLoadingGrades] = useState<boolean>(false);

  // Fetch grades from Supabase for this user on mount
  useEffect(() => {
    if (!userId) return;

    const fetchGrades = async () => {
      setLoadingGrades(true);
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to fetch grades:", error.message);
        setLoadingGrades(false);
        return;
      }
      setGrades(data ?? []);
      setLoadingGrades(false);
    };

    fetchGrades();
  }, [userId]);

  const handleDateChange: CalendarProps["onChange"] = (value) => {
    if (value instanceof Date) setSelectedDate(value);
    else if (Array.isArray(value)) setSelectedDate(value[0] ?? new Date());
    else setSelectedDate(new Date());
  };

  // Format date for display (optional use)
  const selectedDateStr = selectedDate.toLocaleDateString("lt-LT");

  // Filter grades by selected date if date column exists
  const gradesOnSelectedDate = grades.filter(grade => {
    if (!grade.date) return true; // if no date, show all
    return new Date(grade.date).toLocaleDateString("lt-LT") === selectedDateStr;
  });

  // Logout
  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      return;
    }
    router.push("/auth/log-in");
  };

  // Navigation buttons
  const goToSfForm = () => { if (userId) router.push(`/tutor_dashboard/${userId}/sf_form`); };
  const goToAddLesson = () => { if (userId) router.push(`/tutor_dashboard/${userId}/add_lesson`); };
  const goToResources = () => { if (userId) router.push(`/tutor_dashboard/${userId}/resources`); };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Sveiki, mokytojau!</h1>
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={goToSfForm} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Įrašyti sąskaitą
          </button>
          <button onClick={goToAddLesson} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Pridėti pamoką
          </button>
          <button onClick={goToResources} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
            Resursai
          </button>
          <button onClick={handleLogout} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700">
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

        {/* Grades */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Pažymiai {selectedDateStr}
          </h2>
          {loadingGrades ? (
            <p>Įkeliama...</p>
          ) : gradesOnSelectedDate.length === 0 ? (
            <p className="text-gray-600">Nėra pažymių šiai dienai.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={gradesOnSelectedDate} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="grade" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
              <ul className="mt-4 space-y-2">
                {gradesOnSelectedDate.map(({ id, subject, grade }) => (
                  <li key={id} className="border-b border-gray-200 pb-2 flex justify-between">
                    <span><strong>Dalykas:</strong> {subject}</span>
                    <span><strong>Pažymys:</strong> {grade}</span>
                  </li>
                ))}
              </ul>
            </>
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
