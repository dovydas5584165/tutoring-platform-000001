"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type Lesson = {
  id: string;
  name: string;
};

export default function GradeForm() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");

  useEffect(() => {
    const fetchLessons = async () => {
      console.log("[DEBUG] Starting fetchLessons...");

      try {
        const { data, error } = await supabase
          .from("lessons")
          .select("id, name")
          .order("name", { ascending: true });

        console.log("[DEBUG] Supabase response received.");
        if (error) {
          console.error("[ERROR] Supabase error fetching lessons:", error);
          return;
        }

        console.log("[DEBUG] Data fetched from lessons table:", data);

        if (!data || data.length === 0) {
          console.warn("[WARN] No lessons found in the database.");
          setLessons([]);
          setSelectedLesson("");
          return;
        }

        setLessons(data);
        setSelectedLesson(data[0].id);

        console.log(`[DEBUG] Set lessons state with ${data.length} lessons.`);
        console.log(`[DEBUG] Default selectedLesson set to id: ${data[0].id}`);
      } catch (err) {
        console.error("[ERROR] Exception during fetchLessons:", err);
      }
    };

    fetchLessons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[DEBUG] handleSubmit called");
    console.log(`[DEBUG] studentName: ${studentName}, selectedLesson: ${selectedLesson}, grade: ${grade}`);

    if (!studentName || !selectedLesson || !grade) {
      console.warn("[WARN] One or more required fields are empty.");
      alert("Please fill in all fields before submitting.");
      return;
    }

    try {
      const { error } = await supabase.from("grades").insert({
        student_name: studentName,
        lesson_id: selectedLesson,
        grade: Number(grade),
      });

      if (error) {
        console.error("[ERROR] Supabase insert error:", error);
        alert("Error submitting grade: " + error.message);
        return;
      }

      console.log("[DEBUG] Grade submitted successfully.");
      alert("Grade submitted successfully!");
      setStudentName("");
      setGrade("");
      setSelectedLesson(lessons.length > 0 ? lessons[0].id : "");
    } catch (err) {
      console.error("[ERROR] Exception during grade submission:", err);
      alert("Unexpected error submitting grade.");
    }
  };

  console.log("[DEBUG] Render with lessons:", lessons);

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
              <option value="" disabled>
                Nėra pamokų (lessons)
              </option>
            )}

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
