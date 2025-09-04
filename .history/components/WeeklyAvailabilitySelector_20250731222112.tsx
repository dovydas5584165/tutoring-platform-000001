"use client";

import { useEffect, useState } from "react";
import { startOfWeek, addMinutes, addHours, addDays } from "date-fns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { zonedTimeToUtc, toZonedTime } from "date-fns-tz";


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
  weeksToShow?: number; // optional, default 1
}

function localVilniusToUtc(date: Date): Date {
  return zonedTimeToUtc(date, TIMEZONE);
}

export default function WeeklyAvailabilitySelector({
  savedSlots,
  onSave,
  userId,
  weeksToShow = 1,
}: WeeklyAvailabilitySelectorProps) {
  const supabase = createClientComponentClient();

  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  // Set Monday start of current week LOCAL time
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });

  useEffect(() => {
    if (!savedSlots) return;

    const newSaved = new Set<string>();
    const newBooked = new Set<string>();

    savedSlots.forEach(({ start_time, is_booked }) => {
      const utcDate = new Date(start_time);
      // Convert UTC -> Vilnius local time for display
      const localDate = toZonedTime(utcDate, TIMEZONE);

      // Calculate day index from Monday (0-6)
      const dayIdx = localDate.getDay() === 0 ? 6 : localDate.getDay() - 1;

      // To support multiple weeks, calculate week offset
      const diffDays = Math.floor((localDate.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24));
      const weekOffset = Math.floor(diffDays / 7);

      const key = `${weekOffset}-${dayIdx}-${localDate.getHours()}-${localDate.getMinutes()}`;

      if (is_booked) newBooked.add(key);
      else newSaved.add(key);
    });

    setSavedSet(newSaved);
    setBookedSlots(newBooked);
    setSelectedSlots(newSaved);
  }, [savedSlots, monday]);

  const toggleSlot = (
    weekOffset: number,
    dayIdx: number,
    hour: number,
    minute: number
  ) => {
    const key = `${weekOffset}-${dayIdx}-${hour}-${minute}`;
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

    // INSERT new slots only if they don't exist
    for (const slot of toInsert) {
      const [weekOffset, dayIdx, hour, minute] = slot.split("-").map(Number);

      let startLocal = addDays(monday, weekOffset * 7 + dayIdx);
      startLocal.setHours(hour, minute, 0, 0);

      const startUtcISOString = localVilniusToUtc(startLocal).toISOString();

      // Check if slot already exists
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

      if (existingSlots && existingSlots.length > 0) {
        // Slot already exists, skip insert
        continue;
      }

      // Calculate end time +45 minutes local, then convert to UTC
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
        console.error("Klaida įrašant:", error.message);
        return;
      }
    }

    // DELETE removed slots
    for (const slot of toDelete) {
      const [weekOffset, dayIdx, hour, minute] = slot.split("-").map(Number);

      let startLocal = addDays(monday, weekOffset * 7 + dayIdx);
      startLocal.setHours(hour, minute, 0, 0);

      const startUtcISOString = localVilniusToUtc(startLocal).toISOString();

      const { error } = await supabase
        .from("availability")
        .delete()
        .eq("user_id", userId)
        .eq("start_time", startUtcISOString);

      if (error) {
        console.error("Klaida trinant:", error.message);
        return;
      }
    }

    setSavedSet(new Set(selectedSlots));

    if (onSave) {
      await onSave();
    }
  };

  return (
    <div className="p-4 overflow-auto">
      <table className="table-auto border-collapse w-full">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100">Laikas</th>
            {Array.from({ length: weeksToShow }).map((_, w) => (
              <th
                key={w}
                colSpan={7}
                className="border p-2 bg-gray-200 text-center font-semibold"
              >
                {w === 0 ? "Ši savaitė" : `Savaitė +${w}`}
              </th>
            ))}
          </tr>
          <tr>
            <th className="border p-2 bg-gray-100"></th>
            {Array.from({ length: weeksToShow }).map((_, w) =>
              days.map((day, i) => (
                <th key={`${w}-${i}`} className="border p-2 bg-gray-100">
                  {day}
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(({ label, hour, minute }) => (
            <tr key={`${hour}-${minute}`}>
              <td className="border p-2">{label}</td>
              {Array.from({ length: weeksToShow }).map((_, w) =>
                days.map((_, dIdx) => {
                  const key = `${w}-${dIdx}-${hour}-${minute}`;
                  const selected = selectedSlots.has(key);
                  const booked = bookedSlots.has(key);
                  const saved = savedSet.has(key);

                  return (
                    <td
                      key={key}
                      onClick={() => toggleSlot(w, dIdx, hour, minute)}
                      className={`border p-2 text-center cursor-pointer transition-all duration-150
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
                          ? "Išsaugotas"
                          : "Spauskite pasirinkti"
                      }
                    >
                      {booked ? "🚫" : saved ? "⚪" : selected ? "✔️" : ""}
                    </td>
                  );
                })
              )}
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
