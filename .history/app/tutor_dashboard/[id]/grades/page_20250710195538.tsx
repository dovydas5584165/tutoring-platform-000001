"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // adjust path if needed

type Lesson = {
  uuid: string;
  name: string;
};

export default function GradeForm() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("uuid, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Klaida gaunant pamokas:", error.message);
        return;
      }

      if (data && data.length > 0) {
        setLessons(data);
        setSelectedLesson(data[0].uuid); // default select first
      }
    };

    fetchLessons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("grades").insert({
      student_name: studentName,
      lesson_id: selectedLesson,
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
            {lessons.map(({ uuid, name }) => (
              <option key={uuid} value={uuid}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Pažymys</label>
          <input
            type="number"
            value={grade}
            min={1}
            max={10}
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
