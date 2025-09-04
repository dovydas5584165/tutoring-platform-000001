"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format, utcToZonedTime } from "date-fns-tz";

type Tutor = {
  id: string;
  full_name: string;
};

type Availability = {
  id: number;
  user_id: string;
  start_time: string; // in UTC
};

export default function ScheduleLanding() {
  const [tutors, setTutors] = useState<{ tutor: Tutor; slots: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);

      const { data: mathTutors, error: tutorErr } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("subject", "math");

      if (tutorErr) {
        console.error("Error fetching tutors:", tutorErr.message);
        setLoading(false);
        return;
      }

      const tutorIds = mathTutors.map((tutor) => tutor.id);

      const { data: slots, error: slotErr } = await supabase
        .from("availability")
        .select("user_id, start_time")
        .in("user_id", tutorIds);

      if (slotErr) {
        console.error("Error fetching availability:", slotErr.message);
        setLoading(false);
        return;
      }

      const grouped: { [key: string]: string[] } = {};

      slots.forEach(({ user_id, start_time }) => {
        const timeVilnius = utcToZonedTime(start_time, "Europe/Vilnius");
        const formatted = format(timeVilnius, "yyyy-MM-dd HH:mm");
        if (!grouped[user_id]) grouped[user_id] = [];
        grouped[user_id].push(formatted);
      });

      const combined = mathTutors.map((tutor) => ({
        tutor,
        slots: grouped[tutor.id] || [],
      }));

      setTutors(combined);
      setLoading(false);
    };

    fetchAvailability();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm">
        <div className="text-xl font-semibold tracking-tight">Tiksliukai.lt</div>
      </header>

      {/* Main */}
      <main className="flex flex-col flex-1 px-8 py-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Tvarkaraštis</h1>

        {loading ? (
          <p className="text-center text-gray-600">Kraunama...</p>
        ) : tutors.length === 0 ? (
          <p className="text-center text-gray-600">Nėra matematikos mokytojų.</p>
        ) : (
          <div className="space-y-8">
            {tutors.map(({ tutor, slots }) => (
              <div key={tutor.id} className="border rounded-xl p-4 shadow-sm">
                <h2 className="text-xl font-semibold mb-2">{tutor.full_name}</h2>
                {slots.length === 0 ? (
                  <p className="text-gray-500">Nėra laisvų laikų.</p>
                ) : (
                  <ul className="list-disc list-inside text-gray-800">
                    {slots.map((slot, idx) => (
                      <li key={idx}>{slot}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
