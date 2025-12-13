"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Calendar, { CalendarProps } from "react-calendar";
import 'react-calendar/dist/Calendar.css';

type UserFlags = {
  signed: boolean;
  signed_at: string | null;
};

export default function TutorDashboard() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTimeInput, setStartTimeInput] = useState("");
  const [endTimeInput, setEndTimeInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [userFlags, setUserFlags] = useState<UserFlags | null>(null);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const checkAgreement = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("signed, signed_at")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Klaida tikrinant sutikimą:", error.message);
        return;
      }

      if (!data.signed) setShowTerms(true);
      setUserFlags(data);
    };

    checkAgreement();
  }, []);

  const acceptTerms = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("users")
      .update({
        signed: true,
        signed_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      alert("Nepavyko įrašyti sutikimo: " + error.message);
      return;
    }

    setUserFlags({ signed: true, signed_at: new Date().toISOString() });
    setShowTerms(false);
  };

  const handleDateChange: CalendarProps["onChange"] = (v) => {
    const date = Array.isArray(v) ? v[0] : v;
    if (date instanceof Date) setSelectedDate(date);
  };

  const handleAddAvailability = async () => {
    if (!startTimeInput || !endTimeInput) {
      alert("Įveskite pradžios ir pabaigos laiką.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Naudotojas nerastas.");
      return;
    }

    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    const [sh, sm] = startTimeInput.split(":").map(Number);
    const [eh, em] = endTimeInput.split(":").map(Number);

    start.setHours(sh, sm, 0, 0);
    end.setHours(eh, em, 0, 0);

    if (end <= start) {
      alert("Pabaigos laikas turi būti po pradžios laiko.");
      return;
    }

    setAdding(true);

    const { error } = await supabase.from("availability").insert([
      {
        user_id: user.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        is_booked: false,
      },
    ]);

    setAdding(false);

    if (error) {
      alert("Klaida įrašant prieinamumą: " + error.message);
    } else {
      alert("Prieinamumas įrašytas sėkmingai.");
      setStartTimeInput("");
      setEndTimeInput("");
    }
  };

  const selectedDateStr = selectedDate.toLocaleDateString("lt-LT");

  if (showTerms) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Paslaugų teikimo sutartis</h2>
          <div className="text-sm text-gray-700 mb-6 whitespace-pre-line">
            <p>1. Korepetitorius įsipareigoja teikti kokybiškas pamokas.</p>
            <p>2. Pamokų laikas ir apmokėjimas nustatomas sutartinai.</p>
            <p>3. Ginčai sprendžiami LR teisės nustatyta tvarka.</p>
          </div>
          <label className="flex items-center space-x-2 mb-6">
            <input
              type="checkbox"
              onChange={() => setUserFlags((p) => ({ ...p!, signed: true }))}
              className="w-5 h-5"
            />
            <span>Sutinku su paslaugų teikimo sąlygomis</span>
          </label>
          <div className="flex justify-end">
            <button
              onClick={acceptTerms}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sutinku
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Korepetitoriaus Skydelis</h1>
          {userFlags?.signed_at && (
            <p className="text-xs text-gray-500">Sutartis pasirašyta: {new Date(userFlags.signed_at).toLocaleDateString("lt-LT")}</p>
          )}
        </div>
        <button
          onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (!error) router.push("/auth/log-in");
          }}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
        >
          Atsijungti
        </button>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Kalendorius</h2>
            <Calendar onChange={handleDateChange} value={selectedDate} locale="lt-LT" />
          </section>

          <section className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pridėti prieinamumą</h2>
            <p className="mb-2 text-sm">Pasirinkta diena: <strong>{selectedDateStr}</strong></p>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col">
                Pradžios laikas:
                <input
                  type="time"
                  value={startTimeInput}
                  onChange={(e) => setStartTimeInput(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
              </label>
              <label className="flex flex-col">
                Pabaigos laikas:
                <input
                  type="time"
                  value={endTimeInput}
                  onChange={(e) => setEndTimeInput(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
              </label>
              <button
                onClick={handleAddAvailability}
                disabled={adding}
                className={`px-4 py-2 text-white rounded ${
                  adding ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {adding ? "Išsaugoma..." : "Pridėti prieinamumą"}
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
