"use client";

import React, { useState } from "react";

const studentEmails = [
  "dovydas@example.com",
  "gabija@example.com",
  "tomas@example.com",
];

const subjects = [
  "Matematika",
  "Ekonomika",
  "Statistika",
  "Programavimas",
];

export default function SimpleFormWithDropdowns() {
  const [email, setEmail] = useState(studentEmails[0]);
  const [subject, setSubject] = useState(subjects[0]);
  const [grade, setGrade] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, subject, grade, date });
    alert(`Pateikta:\nEl. paštas: ${email}\nDalykas: ${subject}\nPažymys: ${grade}\nData: ${date}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow max-w-md w-full space-y-4 font-sans"
      >
        <h1 className="text-2xl font-bold text-center mb-4">Pažymių forma</h1>

        <label className="block">
          Studento el. paštas
          <select
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          >
            {studentEmails.map((email) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          Dalykas
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          >
            {subjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          Pažymys
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            placeholder="Įveskite pažymį"
            required
          />
        </label>

        <label className="block">
          Data
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Pateikti
        </button>
      </form>
    </div>
  );
}
