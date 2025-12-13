"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Adjust path if needed

type Lesson = {
  id: string; // or number if your id is numeric
  name: string;
};

export default function GradeForm() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      console.log("Fetching lessons from Supabase...");
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
        setSelectedLesson(String(data[0].id)); // default to first lesson id as string
      } else {
        console.log("No lessons found in database.");
      }
    };

    fetchLessons();
  }, []);

  // Debug states every render
  console.log("Current lessons state:", lessons);
  console.log("Selected lesson:", selectedLesson);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim()) {
      alert("Įveskite studento vardą");
      return;
    }
    if (!selectedLesson) {
      alert("Pasirinkite pamoką");
      return;
    }
    if (!grade || isNaN(Number(grade))) {
      alert("Įveskite pažymį (skaicių)");
      return;
    }

    const { error } = await supabase.from("grades").insert({
      student_name: studentName,
      lesson_id: selectedLesson,
      grade: Number(grade),
    });

    if (error) {
      alert("Klaida siunčiant pažymį: " + error.message);
      console.error("Insert error:", error);
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
            {lessons.length === 0 && (
              <option disabled value="">
                Loading lessons...
              </option>
            )}
            {lessons.map(({ id, name }) => (
              <option key={id} value={String(id)}>
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
