"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;      // uuid primary key
  email: string;
  role: string;
  vardas: string;
  pavarde: string;
};

type Lesson = {
  id: string;     // assume uuid primary key
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

      console.log("Users fetched:", data);
      if (data && data.length > 0) {
        setUsers(data);
        setSelectedUserId(data[0].id);
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

      console.log("Lessons fetched:", data);
      if (data && data.length > 0) {
        setLessons(data);
        setSelectedLessonId(data[0].id);
      }
    }

    fetchUsers();
    fetchLessons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !selectedLessonId || !grade) {
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
        className="bg-white p-6 rounded shadow-md space-y-4 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-center mb-4">Įrašyti pažymį</h2>

        <div>
          <label className="block font-medium mb-1">Kliento el. paštas</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            {users.map(({ id, email, vardas, pavarde }) => (
              <option key={id} value={id}>
                {email} ({vardas} {pavarde})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Pamoka</label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            {lessons.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Pažymys</label>
          <input
            type="number"
            min={1}
            max={10}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Pateikti
        </button>
      </form>
    </div>
  );
}
