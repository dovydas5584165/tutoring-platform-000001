"use client";

import { useState, useEffect, useCallback } from "react";
import { startOfWeek, addDays, addMinutes } from "date-fns";

const DAYS = ["Pirm", "Antr", "Treč", "Ketv", "Penkt", "Šešt", "Sekm"];
const UTC_OFFSET = 3 * 60; // +3 hours in minutes

const TIME_SLOTS = Array.from({ length: (20 - 8) * 4 }, (_, i) => {
  const totalMinutes = i * 45;
  const hour = 8 + Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return { label, hour, minute };
});

// Types
export type AvailabilitySlot = {
  id?: number;
  start_time: string; // ISO UTC string
  end_time: string;
  is_booked: boolean;
};

interface WeeklyAvailabilitySelectorProps {
  savedSlots?: AvailabilitySlot[];
  onSave?: () => Promise<void>;
  userId?: string;
  weeksToShow?: number;
}

// Convert UTC Date to Lithuania local time (+3h offset)
function utcToLocal(date: Date): Date {
  return new Date(date.getTime() + UTC_OFFSET * 60000);
}

// Convert Lithuania local Date to UTC Date (-3h offset)
function localToUtc(date: Date): Date {
  return new Date(date.getTime() - UTC_OFFSET * 60000);
}

export default function WeeklyAvailabilitySelector({
  savedSlots = [],
  onSave,
  userId,
  weeksToShow = 2,
}: WeeklyAvailabilitySelectorProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());

  // Monday of current week in Lithuania local time (approx)
  // Use UTC startOfWeek then add 3 hours to approximate Lithuania local Monday start
  const mondayUtc = startOfWeek(new Date(), { weekStartsOn: 1 });
  const monday = utcToLocal(mondayUtc);

  // Load saved and booked slots into sets
  useEffect(() => {
    const newSelected = new Set<string>();
    const newBooked = new Set<string>();
    const newSaved = new Set<string>();

    savedSlots.forEach(({ start_time, is_booked }) => {
      const utcDate = new Date(start_time);
      const localDate = utcToLocal(utcDate);

      // Calculate day index from Monday (0 = Monday, 6 = Sunday)
      const dayIdx = localDate.getDay() === 0 ? 6 : localDate.getDay() - 1;

      const diffDays = Math.floor((localDate.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24));
      const weekOffset = Math.floor(diffDays / 7);

      const key = `${weekOffset}-${dayIdx}-${localDate.getHours()}-${localDate.getMinutes()}`;

      if (is_booked) newBooked.add(key);
      else {
        newSaved.add(key);
        newSelected.add(key);
      }
    });

    setSavedSet(newSaved);
    setBookedSlots(newBooked);
    setSelectedSlots(newSelected);
  }, [savedSlots, monday]);

  // Toggle slot (disable if booked)
  const toggleSlot = useCallback(
    (weekOffset: number, dayIdx: number, hour: number, minute: number) => {
      const key = `${weekOffset}-${dayIdx}-${hour}-${minute}`;
      if (bookedSlots.has(key)) return; // no toggling booked slots

      setSelectedSlots((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [bookedSlots]
  );

  // Save slots (replace with your supabase logic)
  const saveAvailability = async () => {
    if (!userId) return;

    // Here you convert local Lithuania time to UTC for saving
    // For demo: just sync savedSet with selectedSlots
    setSavedSet(new Set(selectedSlots));

    if (onSave) await onSave();
  };

  // Render table header with weeks and days
  const renderDayHeaders = () => (
    <>
      <tr>
        <th className="border p-2 bg-gray-200">Laikas</th>
        {Array.from({ length: weeksToShow }).map((_, w) => (
          <th
            key={w}
            colSpan={7}
            className="border p-2 bg-gray-300 text-center font-semibold"
          >
            {w === 0 ? "Ši savaitė" : `Savaitė +${w}`}
          </th>
        ))}
      </tr>
      <tr>
        <th className="border p-2 bg-gray-200"></th>
        {Array.from({ length: weeksToShow }).map((_, w) =>
          DAYS.map((day, i) => (
            <th key={`${w}-${i}`} className="border p-2 bg-gray-100">
              {day}
            </th>
          ))
        )}
      </tr>
    </>
  );

  const renderTimeSlotCell = (weekOffset: number, dayIdx: number, hour: number, minute: number) => {
    const key = `${weekOffset}-${dayIdx}-${hour}-${minute}`;
    const isBooked = bookedSlots.has(key);
    const isSaved = savedSet.has(key);
    const isSelected = selectedSlots.has(key);

    let bgClass = "hover:bg-gray-100 cursor-pointer";
    let text = "";

    if (isBooked) {
      bgClass = "bg-red-100 text-red-800 cursor-not-allowed";
      text = "🚫";
    } else if (isSaved) {
      bgClass = "bg-gray-400 text-white cursor-not-allowed";
      text = "⚪";
    } else if (isSelected) {
      bgClass = "bg-green-500 text-white";
      text = "✔️";
    }

    return (
      <td
        key={key}
        className={`border p-2 text-center transition-all duration-150 ${bgClass}`}
        onClick={() => toggleSlot(weekOffset, dayIdx, hour, minute)}
        title={isBooked ? "Užimtas" : isSaved ? "Išsaugotas" : "Spauskite pasirinkti"}
      >
        {text}
      </td>
    );
  };

  return (
    <div className="p-4 max-w-full overflow-auto bg-white rounded-lg shadow">
      <table className="table-auto border-collapse w-full min-w-[600px]">
        <thead>{renderDayHeaders()}</thead>
        <tbody>
          {TIME_SLOTS.map(({ label, hour, minute }) => (
            <tr key={`${hour}-${minute}`}>
              <td className="border p-2 font-mono text-sm">{label}</td>
              {Array.from({ length: weeksToShow }).map((_, w) =>
                DAYS.map((_, dIdx) => renderTimeSlotCell(w, dIdx, hour, minute))
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
