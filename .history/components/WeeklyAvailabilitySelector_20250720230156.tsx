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
  savedSlots?: AvailabilitySlot[];
  onSave?: () => Promise<void>;
  userId?: string;
}

function toLocalISOString(date: Date) {
  const tzo = -date.getTimezoneOffset(),
    dif = tzo >= 0 ? "+" : "-",
    pad = (num: number) => String(num).padStart(2, "0");

  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes()) +
    ":" +
    pad(date.getSeconds()) +
    dif +
    pad(Math.floor(Math.abs(tzo) / 60)) +
    ":" +
    pad(Math.abs(tzo) % 60)
  );
}

export default function WeeklyAvailabilitySelector({
  savedSlots,
  onSave,
  userId,
}: WeeklyAvailabilitySelectorProps) {
  const supabase = createClientComponentClient();

  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });

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
    setSelectedSlots(newSaved);
  }, [savedSlots]);

  const toggleSlot = (dayIdx: number, hour: number, minute: number) => {
    const key = `${dayIdx}-${hour}-${minute}`;
    if (bookedSlots.has(key)) return;

    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const saveAvailability = async () => {
    if (!userId) return;

    const savedArr = Array.from(savedSet);
    const selectedArr = Array.from(selectedSlots);

    const toInsert = selectedArr.filter((slot) => !savedSet.has(slot));
    const toDelete = savedArr.filter((slot) => !selectedSlots.has(slot));

    const insertPayload = toInsert.map((slot) => {
      const [dayIdx, hour, minute] = slot.split("-").map(Number);
      const start = new Date(monday);
      start.setDate(start.getDate() + dayIdx);
      start.setHours(hour, minute, 0, 0);
      const end = addMinutes(start, 45);

      return {
        user_id: userId,
        start_time: toLocalISOString(start),
        end_time: toLocalISOString(end),
        is_booked: false,
      };
    });

    const toDeleteTimes = toDelete.map((slot) => {
      const [dayIdx, hour, minute] = slot.split("-").map(Number);
      const start = new Date(monday);
      start.setDate(start.getDate() + dayIdx);
      start.setHours(hour, minute, 0, 0);
      return toLocalISOString(start);
    });

    try {
      if (toDeleteTimes.length > 0) {
        const { error: deleteError } = await supabase
          .from("availability")
          .delete()
          .eq("user_id", userId)
          .in("start_time", toDeleteTimes);

        if (deleteError) {
          console.error("Klaida trinant:", deleteError.message);
          return;
        }
      }

      if (insertPayload.length > 0) {
        const { error: insertError } = await supabase
          .from("availability")
          .upsert(insertPayload, { onConflict: "user_id,start_time" });

        if (insertError) {
          console.error("Klaida įrašant:", insertError.message);
          return;
        }
      }

      if (onSave) {
        await onSave();
      }
    } catch (e) {
      console.error("Klaida saugant:", e);
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
                    className={`border p-2 text-center cursor-pointer transition-all duration-150
                      ${
                        booked
                          ? "bg-red-100 text-red-800 cursor-not-allowed"
                          : saved
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : selected
                          ? "bg-green-500 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    title={booked ? "Užimtas" : saved ? "Išsaugotas" : "Spauskite pasirinkti"}
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
        Pasirinkti
      </button>
    </div>
  );
}
