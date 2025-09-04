"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

type Availability = {
  user_id: string;
  start_time: string;
};

export default function ScheduleLanding() {
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("availability")
        .select("user_id, start_time")
        .eq("subject", "Matematika")
        .gt("start_time", new Date().toISOString());

      if (error) {
        console.error("Klaida gaunant laikus:", error.message);
      } else {
        setSlots(data || []);
      }

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
      <main className="flex flex-col flex-1 items-center px-8 py-12">
        <h1 className="text-3xl font-bold mb-6">Matematikos pamokų laikai</h1>

        {loading ? (
          <p className="text-gray-600">Kraunama...</p>
        ) : slots.length === 0 ? (
          <p className="text-gray-600">Nėra galimų laikų.</p>
        ) : (
          <ul className="space-y-2 w-full max-w-md">
            {slots.map((slot, index) => {
              const formatted = format(new Date(slot.start_time), "yyyy-MM-dd HH:mm");
              return (
                <li key={index} className="p-3 border rounded-md shadow-sm hover:bg-gray-100">
                  {formatted}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
