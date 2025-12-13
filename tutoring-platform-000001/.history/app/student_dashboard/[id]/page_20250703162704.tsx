"use client";

import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient'; // Adjust path as needed

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StudentDashboard() {
  const router = useRouter();

  const upcomingLessons = [
    { id: 1, title: "Įvadas į R ir RStudio", date: "2025-07-01" },
    { id: 2, title: "Statistikos pagrindai", date: "2025-07-05" },
    { id: 3, title: "Excel duomenų analizė", date: "2025-07-10" },
  ];

  const assignmentsDue = [
    { id: 1, title: "R programavimo namų darbai", dueDate: "2025-07-03" },
    { id: 2, title: "Matlab užduočių rinkinys", dueDate: "2025-07-07" },
  ];

  const months = ['Kovas', 'Balandis', 'Gegužė', 'Birželis', 'Liepa', 'Rugpjūtis'];
  const grades = [7.8, 8.5, 9.0, 8.7, 9.2, 9.5];

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Pažymiai',
        data: grades,
        fill: false,
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Studento pažymių grafikas' },
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: { stepSize: 1 },
        title: { display: true, text: 'Pažymys' },
      },
      x: {
        title: { display: true, text: 'Mėnuo' },
      },
    },
  };

  // **Logout function using Supabase**
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      // Optionally, show an error notification here
      return;
    }
    // After logout, redirect to login page (or homepage)
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sveikas, studentai!</h1>
        <nav className="space-x-4 text-sm sm:text-base">
          <a href="/student_dashboard" className="font-semibold hover:underline">Pradžia</a>
          <a href="/student_dashboard/resources" className="font-semibold hover:underline">Resursai</a>
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
        {/* Artimiausios pamokos ir darbai */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Artimiausios pamokos</h2>
          <ul className="space-y-3 text-gray-700">
            {upcomingLessons.map((lesson) => (
              <li key={lesson.id} className="border-b border-gray-200 pb-2">
               
