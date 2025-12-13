"use client";

import React, { useState } from "react";

export default function GradeForm() {
  const [studentName, setStudentName] = useState("");
  const [subject, setSubject] = useState("Matematika");
  const [grade, setGrade] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Pateikti duomenys:", {
      studentName,
      subject,
      grade,
    });
    // TODO: Submit to Supabase or elsewhere
    alert("Pažymys pateiktas!");
    setStudentName("");
    setGrade("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 space-y-4 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">Įrašyti pažymį</h2>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Studento vardas</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Įveskite vardą"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Dalykas</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
          >
            <option value="Matematika">Matematika</option>
            <option value="Statistika">Statistika</option>
            <option value="Ekonomika">Ekonomika</option>
            <option value="Excel">Excel</option>
            <option value="R">R</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">Pažymys</label>
          <input
            type="number"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
            min="1"
            max="10"
            step="1"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Įveskite pažymį (1–10)"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
        >
          Pateikti
        </button>
      </form>
    </div>
  );
}
