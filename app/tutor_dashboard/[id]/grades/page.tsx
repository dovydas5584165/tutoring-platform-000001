"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  email: string;
  role: string;
  vardas: string;
  pavarde: string;
};

type Lesson = {
  id: string;
  name: string;
};

export default function GradeForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [grade, setGrade] = useState<string>("");

  // pastabos independent
  const [pastabos, setPastabos] = useState<string>("");

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, role, vardas, pavarde")
        .eq("role", "client")
        .order("email", { ascending: true });

      if (!error && data && data.length > 0) {
        setUsers(data);
        setSelectedUserId(data[0].id);
      }
    }

    async function fetchLessons() {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, name")
        .order("name", { ascending: true });

      if (!error && data && data.length > 0) {
        setLessons(data);
        setSelectedLessonId(data[0].id);
      }
    }

    fetchUsers();
    fetchLessons();
  }, []);

  // Handle grade submission
  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !selectedLessonId || !grade.trim()) {
      alert("Prašome užpildyti visus laukus.");
      return;
    }

    const numericGrade = Number(grade);
    if (isNaN(numericGrade) || numericGrade < 1 || numericGrade > 10) {
      alert("Pažymys turi būti skaičius nuo 1 iki 10.");
      return;
    }

    const { error } = await supabase.from("grades").insert({
      student_id: selectedUserId,
      lesson_id: selectedLessonId,
      grade: numericGrade,
    });

    if (error) {
      alert("Klaida siunčiant pažymį: " + error.message);
      return;
    }

    alert("Pažymys pateiktas sėkmingai!");
    setGrade("");
  };

  // Handle pastabos submission independently
  const handlePastabosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !pastabos.trim()) {
      alert("Pasirinkite klientą ir įveskite pastabas.");
      return;
    }

    const { error } = await supabase.from("notes").insert({
      student_id: selectedUserId,
      pastabos,
    });

    if (error) {
      alert("Klaida siunčiant pastabas: " + error.message);
      return;
    }

    alert("Pastabos pateiktos sėkmingai!");
    setPastabos("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col gap-8 items-center justify-center">
      {/* Grade Form */}
      <form
        onSubmit={handleGradeSubmit}
        className="bg-white p-6 rounded shadow-md space-y-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Įrašyti pažymį</h2>

        {/* User select */}
        <div>
          <label htmlFor="user-select" className="block font-medium mb-1">
            Kliento el. paštas
          </label>
          <select
            id="user-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            {users.length === 0 ? (
              <option disabled>Nėra klientų</option>
            ) : (
              users.map(({ id, email, vardas, pavarde }) => (
                <option key={id} value={id}>
                  {email} ({vardas} {pavarde})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Lesson select */}
        <div>
          <label htmlFor="lesson-select" className="block font-medium mb-1">
            Pamoka
          </label>
          <select
            id="lesson-select"
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            {lessons.length === 0 ? (
              <option disabled>Nėra pamokų</option>
            ) : (
              lessons.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Grade input */}
        <div>
          <label htmlFor="grade-input" className="block font-medium mb-1">
            Pažymys (1-10)
          </label>
          <input
            id="grade-input"
            type="number"
            min={1}
            max={10}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
            placeholder="Įveskite pažymį"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition-colors"
        >
          Pateikti pažymį
        </button>
      </form>

      {/* Pastabos Form */}
      <form
        onSubmit={handlePastabosSubmit}
        className="bg-white p-6 rounded shadow-md space-y-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Įrašyti pastabas</h2>

        {/* User select */}
        <div>
          <label htmlFor="user-select-pastabos" className="block font-medium mb-1">
            Kliento el. paštas
          </label>
          <select
            id="user-select-pastabos"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            {users.length === 0 ? (
              <option disabled>Nėra klientų</option>
            ) : (
              users.map(({ id, email, vardas, pavarde }) => (
                <option key={id} value={id}>
                  {email} ({vardas} {pavarde})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Pastabos textarea */}
        <div>
          <label htmlFor="pastabos-input" className="block font-medium mb-1">
            Pastabos
          </label>
          <textarea
            id="pastabos-input"
            value={pastabos}
            onChange={(e) => setPastabos(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Įveskite pastabas"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition-colors"
        >
          Pateikti pastabas
        </button>
      </form>
    </div>
  );
}
