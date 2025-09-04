"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
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

interface Lesson {
  id: number;
  title: string;
  date: string;
}

interface Assignment {
  id: number;
  title: string;
  dueDate: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id || "";

  const upcomingLessons: Lesson[] = [
    { id: 1, title: "Įvadas į R ir RStudio", date: "2025-07-01" },
    { id: 2, title: "Statistikos pagrindai", date: "2025-07-05" },
    { id: 3, title: "Excel duomenų analizė", date: "2025-07-10" },
  ];

  const assignmentsDue: Assignment[] = [
    { id: 1, title: "R programavimo namų darbai", dueDate: "2025-07-03" },
    { id: 2, title: "Matlab užduočių rinkinys", dueDate: "2025-07-07" },
  ];

  const months = ["Kovas", "Balandis", "Gegužė", "Birželis", "Liepa", "Rugpjūtis"];
  const grades = [7.8, 8.5, 9.0, 8.7, 9.2, 9.5];

  const data: ChartData<"line", number[], string> = {
    labels: months,
    datasets: [
      {
        label: "Pažymiai",
        data: grades,
        fill: false,
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Studento pažymių grafikas" },
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
      },
    },
  };

  const handleLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      return;
    }
    router.push("/auth/log-in");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sveikas, mokini!</h1>
        <nav className="space-x-4 text-sm sm:text-base">
          <a href={`/student_dashboard/${id}`} className="font-semibold hover:underline">
            Pradžia
          </a>
          <a href="/student_dashboard/resources" className="font-semibold hover:underline">
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

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Lessons & Assignments */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Artimiausios pamokos</h2>
          <ul className="space-y-3 text-gray-700">
            {upcomingLessons.map((lesson) => (
              <li key={lesson.id} className="border-b border-gray-200 pb-2">
                <div className="font-semibold">{lesson.title}</div>
                <div className="text-sm text-gray-500">Data: {lesson.date}</div>
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-4">Artimiausi darbai</h2>
          <ul className="space-y-3 text-gray-700">
            {assignmentsDue.map((assignment) => (
              <li key={assignment.id} className="border-b border-gray-200 pb-2">
                <div className="font-semibold">{assignment.title}</div>
                <div className="text-sm text-red-600">Terminas: {assignment.dueDate}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* Grades Chart */}
        <section className="bg-white rounded shadow p-6 md:col-span-2">
          <Line data={data} options={options} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
