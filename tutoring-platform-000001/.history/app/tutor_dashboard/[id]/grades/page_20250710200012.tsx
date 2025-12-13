"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // adjust if needed

type Lesson = {
  id: string;      // or number → change to number if the column is integer
  name: string;
};

export default function GradeForm() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>(""); // holds id
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");

  /* ─ Fetch lessons once ─ */
  useEffect(() => {
    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Klaida gaunant pamokas:", error.message);
        return;
      }

      if (data?.length) {
        setLessons(data);
        setSelectedLesson(String(data[0].id)); // default first id
      }
    };

    fetchLessons();
  }, []);

  /* ─ Submit grade ─ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("grades").insert({
      student_name: studentName,
      lesson_id: selectedLesson,  // now references `lessons.id`
      grade: Number(grade),
    });

    if (error) {
      alert("Klaida siunčiant pažymį: " + error.message);
      return;
    }

    alert("Pažymys pateiktas!");
    setStudentName("");
    setGrade("");
  };

  /* ─ UI ─ */
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md space-y-4 w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-center">Įrašyti pažymį</h2>

        <div>
          <label className="block font-medium">Studento vardas</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Pamoka</label>
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
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
          <label className="block font-medium">Pažymys</label>
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
