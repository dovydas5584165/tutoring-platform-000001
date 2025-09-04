"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Lesson = {
  id: string; // arba uuid, kaip jūsų DB
  name: string;
};

export default function GradeForm() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      console.log("[DEBUG] Pradedam kviesti lessons iš Supabase...");

      const { data, error } = await supabase
        .from("lessons")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("[DEBUG] Klaida gaunant lessons:", error.message);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.warn("[DEBUG] Gauti lessons yra tušti arba neegzistuoja.");
        setLessons([]);
        setSelectedLesson("");
        setLoading(false);
        return;
      }

      console.log("[DEBUG] Gauti lessons duomenys:", data);
      setLessons(data);
      setSelectedLesson(data[0].id);
      setLoading(false);
    };

    fetchLessons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !selectedLesson || !grade) {
      alert("Užpildykite visus laukus!");
      return;
    }

    const gradeNum = Number(grade);
    if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 10) {
      alert("Pažymys turi būti nuo 1 iki 10.");
      return;
    }

    setLoading(true);
    console.log("[DEBUG] Siunčiame pažymį į Supabase:", {
      student_name: studentName,
      lesson_id: selectedLesson,
      grade: gradeNum,
    });

    const { error } = await supabase.from("grades").insert({
      student_name: studentName,
      lesson_id: selectedLesson,
      grade: gradeNum,
    });

    setLoading(false);

    if (error) {
      console.error("[DEBUG] Klaida siunčiant pažymį:", error.message);
      alert("Klaida siunčiant pažymį: " + error.message);
      return;
    }

    alert("Pažymys pateiktas sėkmingai!");
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

        {loading && <p className="text-center text-blue-600">Kraunama...</p>}

        <div>
          <label className="block font-medium mb-1">Studento vardas</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Pamoka</label>
          <select
            value={selectedLesson}
            onChange={(e) => setSelectedLesson(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
            disabled={loading || lessons.length === 0}
          >
            {lessons.length === 0 && (
              <option value="">-- nėra pamokų --</option>
            )}
            {lessons.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Pažymys (1-10)</label>
          <input
            type="number"
            min={1}
            max={10}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Pateikti
        </button>
      </form>
    </div>
  );
}
