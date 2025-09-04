"use client";

import { useEffect, useState } from "react";
import { startOfWeek, addMinutes, addDays } from "date-fns";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toZonedTime } from "date-fns-tz";

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
  weeksToShow?: number; // default 1
};

function localVilniusToUtc(date: Date): Date {
  // same manual conversion as before
  const tz = TIMEZONE;

  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
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

  const localISO = `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;
  const localDate = new Date(localISO);
  const offset = date.getTime() - localDate.getTime();
  return new Date(date.getTime() + offset);
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

  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });

  useEffect(() => {
    if (!savedSlots) return;

    const newSaved = new Set<string>();
    const newBooked = new Set<string>();

    savedSlots.forEach(({ start_time, is_booked }) => {
      const utcDate = new Date(start_time);
      const localDate = toZonedTime(utcDate, TIMEZONE);
      const dayIdx = localDate.getDay() === 0 ? 6 : localDate.getDay() - 1;
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

  const toggleSlot = (weekOffset: number, dayIdx: number, hour: number, minute: number) => {
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

    for (const slot of toInsert) {
      const [weekOffset, dayIdx, hour, minute] = slot.split("-").map(Number);

      let startLocal = addDays(monday, weekOffset * 7 + dayIdx);
      startLocal.setHours(hour, minute, 0, 0);

      const startUtcISOString = localVilniusToUtc(startLocal).toISOString();

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
        console.error("Klaida įrašant:", error.message);
        return;
      }
    }

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
    <div className="max-w-full overflow-x-auto p-4">
      {Array.from({ length: weeksToShow }).map((_, w) => (
        <section key={w} className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-center">
            {w === 0 ? "Ši savaitė" : `Savaitė +${w}`}
          </h2>

          <div className="grid grid-cols-[repeat(7,4rem)] gap-2 justify-center overflow-x-auto">
            {/* Days header */}
            {days.map((day) => (
              <div
                key={`header-${w}-${day}`}
                className="font-medium text-center border-b pb-1 select-none"
              >
                {day}
              </div>
            ))}

            {/* Slots for each day */}
            {timeSlots.map(({ label, hour, minute }) =>
              days.map((_, dIdx) => {
                const key = `${w}-${dIdx}-${hour}-${minute}`;
                const selected = selectedSlots.has(key);
                const booked = bookedSlots.has(key);
                const saved = savedSet.has(key);

                let bgClass = "bg-white";
                let cursorClass = "cursor-pointer";
                let textClass = "text-gray-700";

                if (booked) {
                  bgClass = "bg-red-100";
                  cursorClass = "cursor-not-allowed";
                  textClass = "text-red-700";
                } else if (saved) {
                  bgClass = "bg-gray-400";
                  cursorClass = "cursor-not-allowed";
                  textClass = "text-white";
                } else if (selected) {
                  bgClass = "bg-green-500";
                  cursorClass = "cursor-pointer";
                  textClass = "text-white";
                }

                return (
                  <button
                    key={key}
                    onClick={() => toggleSlot(w, dIdx, hour, minute)}
                    disabled={booked || saved}
                    aria-pressed={selected}
                    title={
                      booked
                        ? "Užimtas"
                        : saved
                        ? "Išsaugotas"
                        : "Spauskite pasirinkti"
                    }
                    className={`${bgClass} ${cursorClass} ${textClass} 
                      rounded-md h-12 flex items-center justify-center
                      transition-colors duration-200
                      hover:brightness-110
                      focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400`}
                  >
                    {selected ? label : booked ? "🚫" : saved ? "✔" : ""}
                  </button>
                );
              })
            )}
          </div>

          {/* Time labels on side (optional) */}
          <div className="mt-2 flex justify-center space-x-3 text-sm text-gray-600">
            {timeSlots.map(({ label }) => (
              <span key={`time-label-${label}`} className="w-16 text-center">
                {label}
              </span>
            ))}
          </div>
        </section>
      ))}

      <div className="text-center">
        <button
          onClick={saveAvailability}
          className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Pasirinkti
        </button>
      </div>
    </div>
  );
}
