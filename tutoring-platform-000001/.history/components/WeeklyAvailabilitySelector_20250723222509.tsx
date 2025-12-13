"use client";

import { useEffect, useState, useMemo } from "react";
import { startOfWeek, addMinutes } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const days = ["Pirm", "Antr", "Treč", "Ketv", "Penkt", "Šešt", "Sekm"];
const TIMEZONE = "Europe/Vilnius";

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

// Convert Vilnius local time Date to UTC Date precisely
function localVilniusToUtc(date: Date): Date {
  // Get date components in Vilnius timezone as strings
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = dtf.formatToParts(date);
  const map: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    map[type] = value;
  });

  // Construct ISO-like local datetime string without timezone offset
  const localISO = `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;
  const localDate = new Date(localISO);

  // Calculate offset (ms) between input date (assumed local) and localDate (interpreted as UTC)
  const offset = date.getTime() - localDate.getTime();

  return new Date(date.getTime() + offset);
}

export default function WeeklyAvailabilitySelector({
  savedSlots,
  onSave,
  userId,
}: WeeklyAvailabilitySelectorProps) {
  const supabase = createClientComponentClient();

  // Monday of current week, fixed on initial render with useMemo
  const monday = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);

  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!savedSlots) return;

    const newSaved = new Set<string>();
    const newBooked = new Set<string>();

    for (const { start_time, is_booked } of savedSlots) {
      const utcDate = new Date(start_time);
      const localDate = toZonedTime(utcDate, TIMEZONE);

      // Round minutes down to nearest 15 or 45 as per your slots (here 45)
      const roundedMinute = Math.floor(localDate.getMinutes() / 45) * 45;
      const dayIdx = localDate.getDay() === 0 ? 6 : localDate.getDay() - 1;
      const key = `${dayIdx}-${localDate.getHours()}-${roundedMinute}`;

      if (is_booked) newBooked.add(key);
      else newSaved.add(key);
    }

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

    try {
      // Insert new slots, only if they don't exist already
      for (const slot of toInsert) {
        const [dayIdx, hour, minute] = slot.split("-").map(Number);

        const startLocal = new Date(monday);
        startLocal.setDate(startLocal.getDate() + dayIdx);
        startLocal.setHours(hour, minute, 0, 0);

        const startUtcISOString = localVilniusToUtc(startLocal).toISOString();

        // Check if exists
        const { data: existingSlots, error: fetchError } = await supabase
          .from("availability")
          .select("id")
          .eq("user_id", userId)
          .eq("start_time", startUtcISOString)
          .limit(1);

        if (fetchError) {
          console.error("Error checking existing slot:", fetchError.message);
          return;
        }
        if (existingSlots && existingSlots.length > 0) continue;

        const endLocal = addMinutes(startLocal, 45);
        const endUtcISOString = localVilniusToUtc(endLocal).toISOString();

        const { error } = await supabase
          .from("availability")
          .insert({
            user_id: userId,
            start_time: startUtcISOString,
            end_time: endUtcISOString,
            is_booked: false,
          });
        if (error) {
          console.error("Error inserting slot:", error.message);
          return;
        }
      }

      // Delete removed slots
      for (const slot of toDelete) {
        const [dayIdx, hour, minute] = slot.split("-").map(Number);

        const startLocal = new Date(monday);
        startLocal.setDate(startLocal.getDate() + dayIdx);
        startLocal.setHours(hour, minute, 0, 0);

        const startUtcISOString = localVilniusToUtc(startLocal).toISOString();

        const { error } = await supabase
          .from("availability")
          .delete()
          .eq("user_id", userId)
          .eq("start_time", startUtcISOString);
        if (error) {
          console.error("Error deleting slot:", error.message);
          return;
        }
      }

      setSavedSet(new Set(selectedSlots));

      if (onSave) await onSave();
    } catch (err) {
      console.error("Save availability failed:", err);
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
                      ${booked
                        ? "bg-red-100 text-red-800 cursor-not-allowed"
                        : saved
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : selected
                        ? "bg-green-500 text-white"
                        : "hover:bg-gray-100"}
                    `}
                    title={
                      booked
                        ? "Užimtas"
                        : saved
                        ? "Išsaugotas"
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
        Pasirinkti
      </button>
    </div>
  );
}
