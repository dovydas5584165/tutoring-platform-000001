"use client";

import { useEffect, useState } from "react";
import { startOfWeek, addDays, addMinutes } from "date-fns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const days = ["Pirm", "Antr", "Treč", "Ketv", "Penkt", "Šešt", "Sekm"];

const generateTimeSlots = (
  startHour: number,
  endHour: number,
  intervalMinutes: number
) => {
  const slots: { label: string; hour: number; minute: number }[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      slots.push({
        label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        hour,
        minute,
      });
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots(8, 20, 45);

export type AvailabilitySlot = {
  id?: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

interface WeeklyAvailabilitySelectorProps {
  savedSlots?: AvailabilitySlot[];  // optionally passed saved slots
  onSave?: () => Promise<void>;     // optional save callback
  userId?: string;                  // optionally pass userId (recommended)
}

export default function WeeklyAvailabilitySelector({
  savedSlots,
  onSave,
  userId,
}: WeeklyAvailabilitySelectorProps) {
  const supabase = createClientComponentClient();

  // Convert savedSlots prop (AvailabilitySlot[]) to Set<string> keys for internal logic
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });

  // Sync savedSlots prop changes into savedSet for UI
  useEffect(() => {
    if (!savedSlots) return;

    const newSaved = new Set<string>();
    const newBooked = new Set<string>();

    savedSlots.forEach(({ start_time, is_booked }) => {
      const date = new Date(start_time);
      const dayIdx = date.getDay() === 0 ? 6 : date.getDay() - 1;
      const key = `${dayIdx}-${date.getHours()}-${date.getMinutes()}`;
      if (is_booked) newBooked.add(key);
      else newSaved.add(key);
    });

    setSavedSet(newSaved);
    setBookedSlots(newBooked);
  }, [savedSlots]);

  // Internal fetch if no savedSlots prop and userId provided
  useEffect(() => {
    if (savedSlots || !userId) return;

    const fetchAvailability = async () => {
      const start = monday.toISOString();
      const end = addDays(monday, 7).toISOString();

      const { data, error } = await supabase
        .from("availability")
        .select("start_time, is_booked")
        .eq("user_id", userId)
        .gte("start_time", start)
        .lt("start_time", end);

      if (error) {
        console.error("Klaida gaunant duomenis:", error.message);
      } else {
        const newSaved = new Set<string>();
        const newBooked = new Set<string>();

        data.forEach(({ start_time, is_booked }) => {
          const date = new Date(start_time);
          const dayIdx = date.getDay() === 0 ? 6 : date.getDay() - 1;
          const key = `${dayIdx}-${date.getHours()}-${date.getMinutes()}`;
          if (is_booked) newBooked.add(key);
          else newSaved.add(key);
        });

        setSavedSet(newSaved);
        setBookedSlots(newBooked);
      }
    };

    fetchAvailability();
  }, [savedSlots, supabase, userId, monday]);

  const toggleSlot = (dayIdx: number, hour: number, minute: number) => {
    const key = `${dayIdx}-${hour}-${minute}`;
    if (bookedSlots.has(key) || savedSet.has(key)) return;

    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Internal saveAvailability logic if onSave not provided
  const saveAvailability = async () => {
    if (onSave) {
      await onSave();
      setSelectedSlots(new Set());
      return;
    }

    if (!userId) return;

    const payload = Array.from(selectedSlots).map((slot) => {
      const [dayIdx, hour, minute] = slot.split("-").map(Number);
      const start = new Date(monday);
      start.setDate(start.getDate() + dayIdx);
      start.setHours(hour, minute, 0, 0);
      const end = addMinutes(start, 45);

      return {
        user_id: userId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        is_booked: false,
      };
    });

    const { error } = await supabase
      .from("availability")
      .upsert(payload, { onConflict: "user_id,start_time" });

    if (error) {
      console.error("Nepavyko išsaugoti:", error.message);
    } else {
      // Update savedSet with newly saved slots
      setSavedSet((prev) => {
        const next = new Set(prev);
        payload.forEach(({ start_time }) => {
          const date = new Date(start_time);
          const key = `${date.getDay() === 0 ? 6 : date.getDay() - 1}-${date.getHours()}-${date.getMinutes()}`;
          next.add(key);
        });
        return next;
      });
      setSelectedSlots(new Set());
    }
  };

  return (
    <div className="p-4 overflow-auto">
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100">Laikas</th>
            {days.map((day, i) => (
              <th key={i} className="border p-2 bg-gray-100">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(({ label, hour, minute }) => (
            <tr key={`${hour}-${minute}`}>
              <td className="border p-2">{label}</td>
              {days.map((_, dIdx) => {
                const key = `${dIdx}-${hour}-${minute}`;
                const selected = selectedSlots.has(key);
                const booked = bookedSlots.has(key);
                const saved = savedSet.has(key);

                return (
                  <td
                    key={key}
                    onClick={() => toggleSlot(dIdx, hour, minute)}
                    className={`border p-2 cursor-pointer transition-all duration-150 text-center
                      ${booked
                        ? "bg-red-100 text-red-800 cursor-not-allowed"
                        : saved
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : selected
                        ? "bg-green-500 text-white"
                        : "hover:bg-gray-100"
                      }`}
                    title={
                      booked
                        ? "Užimtas"
                        : saved
                        ? "Išsaugotas laikas"
                        : "Spauskite pasirinkti"
                    }
                  >
                    {booked ? "🚫" : saved ? "⚪" : selected ? "✔️" : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={saveAvailability}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
      >
        Išsaugoti laisvumą
      </button>
    </div>
  );
}
