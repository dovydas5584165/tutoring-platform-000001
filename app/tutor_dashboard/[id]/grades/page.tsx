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

  useEffect(() => {
    // Fetch users with role 'client'
    async function fetchUsers() {
      console.log("Fetching users...");
      const { data, error } = await supabase
        .from("users")
        .select("id, email, role, vardas, pavarde")
        .eq("role", "client")
        .order("email", { ascending: true });

      if (error) {
        console.error("Error fetching users:", error.message);
        return;
      }

      if (data && data.length > 0) {
        setUsers(data);
        setSelectedUserId(data[0].id); // select first by default
      } else {
        setUsers([]);
        setSelectedUserId("");
      }
    }

    // Fetch lessons
    async function fetchLessons() {
      console.log("Fetching lessons...");
      const { data, error } = await supabase
        .from("lessons")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching lessons:", error.message);
        return;
      }

      if (data && data.length > 0) {
        setLessons(data);
        setSelectedLessonId(data[0].id); // select first by default
      } else {
        setLessons([]);
        setSelectedLessonId("");
      }
    }

    fetchUsers();
    fetchLessons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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

    console.log("Submitting grade:", {
      student_id: selectedUserId,
      lesson_id: selectedLessonId,
      grade: numericGrade,
    });

    const { error } = await supabase.from("grades").insert({
      student_id: selectedUserId,
      lesson_id: selectedLessonId,
      grade: numericGrade,
    });

    if (error) {
      alert("Klaida siunčiant pažymį: " + error.message);
      console.error("Insert error:", error);
      return;
    }

    alert("Pažymys pateiktas sėkmingai!");
    setGrade("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md space-y-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Įrašyti pažymį</h2>

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
          Pateikti
        </button>
      </form>
    </div>
  );
}
