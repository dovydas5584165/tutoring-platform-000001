"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// --- WeeklyAvailabilitySelector ---
const days = ["Pirmadienis", "Antradienis", "Trečiadienis", "Ketvirtadienis", "Penktadienis", "Šeštadienis", "Sekmadienis"];
const hours = Array.from({ length: 14 }, (_, i) => `${8 + i}:00`);

function WeeklyAvailabilitySelector() {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  useEffect(() => {
    const loadAvailability = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("availability")
        .select("day, hour")
        .eq("user_id", user.id)
        .order("day")
        .order("hour");

      if (data) {
        const loaded = data.map(d => `${d.day}-${d.hour}`);
        setSelectedSlots(loaded);
      }
    };
    loadAvailability();
  }, []);

  const toggleSlot = async (dayIndex: number, hour: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const key = `${dayIndex}-${hour}`;
    const updated = selectedSlots.includes(key)
      ? selectedSlots.filter(s => s !== key)
      : [...selectedSlots, key];

    setSelectedSlots(updated);

    const exists = selectedSlots.includes(key);

    const { error } = exists
      ? await supabase
          .from("availability")
          .delete()
          .eq("user_id", user.id)
          .eq("day", dayIndex)
          .eq("hour", hour)
      : await supabase
          .from("availability")
          .insert([{ user_id: user.id, day: dayIndex, hour, is_booked: false }]);

    if (error) console.error(error.message);
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <table className="table-fixed border-collapse w-full">
          <thead>
            <tr>
              <th className="border px-2 py-1 bg-gray-100 w-28">Laikas</th>
              {days.map((day, i) => (
                <th key={i} className="border px-2 py-1 bg-gray-100 text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => (
              <tr key={hour}>
                <td className="border px-2 py-1 bg-gray-50 text-sm">{hour}</td>
                {days.map((_, dayIndex) => {
                  const key = `${dayIndex}-${hour}`;
                  const selected = selectedSlots.includes(key);
                  return (
                    <td
                      key={key}
                      onClick={() => toggleSlot(dayIndex, hour)}
                      className={`border px-1 py-1 text-center cursor-pointer transition-colors duration-200
                        ${selected ? "bg-green-500 text-white" : "hover:bg-green-100"}`}
                    >
                      {selected ? "✔️" : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WeeklyAvailabilitySelector;
