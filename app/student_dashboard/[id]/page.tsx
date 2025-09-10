"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LT_MONTHS = [
  "",
  "Sausis",
  "Vasaris",
  "Kovas",
  "Balandis",
  "Gegužė",
  "Birželis",
  "Liepa",
  "Rugpjūtis",
  "Rugsėjis",
  "Spalis",
  "Lapkritis",
  "Gruodis",
];

interface Lesson {
  id: string;
  title: string;
  date: string;
}
interface Note {
  id: string;
  pastabos: string;
  created_at: string;
}

export default function StudentDashboard() {
  const router = useRouter();

  const [months, setMonths] = useState<number[]>([]);
  const [grades, setGrades] = useState<number[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr || !user) {
        console.error("Auth error:", authErr?.message);
        return;
      }

      // ---- Fetch grades ----
      const { data: gradeData, error: gradeErr } = await supabase
        .from("grades")
        .select("grade, created_at")
        .eq("student_id", user.id);

      if (gradeErr) {
        console.error("Grade fetch:", gradeErr.message);
      } else {
        const m: number[] = [];
        const g: number[] = [];

        (gradeData as { grade: number; created_at: string }[]).forEach(
          ({ grade, created_at }) => {
            m.push(new Date(created_at).getMonth() + 1);
            g.push(grade);
          }
        );

        if (m.length === 1) {
          m.push(m[0] + 0.2);
          g.push(g[0]);
        }

        setMonths(m);
        setGrades(g);
      }

      // ---- Fetch bookings (lessons) ----
      const { data: bookingData, error: bookingErr } = await supabase
        .from("bookings")
        .select("id, topic, created_at, lesson_slug")
        .eq("student_email", user.email) // match student by email (since bookings table does not store student_id)
        .is("cancelled_at", null)
        .order("created_at", { ascending: true });

      if (bookingErr) {
        console.error("Bookings fetch:", bookingErr.message);
      } else {
        const mappedLessons: Lesson[] = (bookingData ?? []).map((b) => ({
          id: b.id,
          title: b.topic || b.lesson_slug || "Pamoka",
          date: new Date(b.created_at).toLocaleDateString("lt-LT"),
        }));
        setLessons(mappedLessons);
      }

      // ---- Fetch notes ----
      const { data: noteData, error: noteErr } = await supabase
        .from("notes")
        .select("id, pastabos, created_at")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (noteErr) {
        console.error("Notes fetch:", noteErr.message);
      } else {
        setNotes(noteData ?? []);
      }
    })();
  }, []);

  const chartData: ChartData<"line", number[], number> = {
    labels: months,
    datasets: [
      {
        label: "Pažymiai",
        data: grades,
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        clip: false,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Mėnesio pažymiai" },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: { stepSize: 1 },
        title: { display: true, text: "Pažymys" },
      },
      x: {
        title: { display: true, text: "Mėnuo" },
        ticks: {
          callback(value) {
            // @ts-ignore
            const raw = this.getLabelForValue(value);
            const monthNum = Math.round(Number(raw));
            if (monthNum < 1 || monthNum > 12) return "";
            return LT_MONTHS[monthNum];
          },
        },
      },
    },
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      return;
    }
    router.push("/auth/log-in");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sveikas, mokini!</h1>
        <nav className="space-x-4 text-sm sm:text-base">
          <a href="/student_dashboard" className="font-semibold hover:underline">
            Pradžia
          </a>
          <a
            href="/student_dashboard/resources"
            className="font-semibold hover:underline"
          >
            Resursai
          </a>
          <button
            onClick={handleLogout}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
          >
            Atsijungti
          </button>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Artimiausios pamokos</h2>
          <ul className="space-y-3 text-gray-700">
            {lessons.length > 0 ? (
              lessons.map((lesson) => (
                <li key={lesson.id} className="border-b border-gray-200 pb-2">
                  <div className="font-semibold">{lesson.title}</div>
                  <div className="text-sm text-gray-500">Data: {lesson.date}</div>
                </li>
              ))
            ) : (
              <li className="text-gray-500">Nėra suplanuotų pamokų.</li>
            )}
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Pastabos</h2>
          <ul className="space-y-3 text-gray-700">
            {notes.length > 0 ? (
              notes.map((note) => (
                <li key={note.id} className="border-b border-gray-200 pb-2">
                  <div className="text-sm">{note.pastabos}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(note.created_at).toLocaleDateString("lt-LT")}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-gray-500">Nėra pastabų.</li>
            )}
          </ul>
        </section>

        <section className="bg-white rounded shadow p-6 md:col-span-2">
          <Line data={chartData} options={chartOptions} />
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
