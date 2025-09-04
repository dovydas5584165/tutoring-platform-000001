"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  addDays,
  isSameDay,
  setHours,
  setMinutes,
  startOfToday,
  formatISO,
} from "date-fns";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 to 19
const MINUTES = [0, 45];

type Slot = {
  date: Date; // date only (e.g. 2025-08-03)
  hour: number;
  minute: number;
};

function slotKey({ date, hour, minute }: Slot) {
  return `${date.toDateString()}-${hour}-${minute}`;
}

export default function TwoWeekAvailabilityCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  const today = startOfToday();
  const twoWeeksLater = addDays(today, 13);

  const toggleSlot = (slot: Slot) => {
    const key = slotKey(slot);
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const handleSubmit = () => {
    const all: string[] = [];

    selectedSlots.forEach((key) => {
      const [dateStr, hourStr, minStr] = key.split("-");
      const date = new Date(dateStr);
      const hour = parseInt(hourStr);
      const minute = parseInt(minStr);
      const fullDate = setMinutes(setHours(date, hour), minute);
      all.push(formatISO(fullDate)); // ISO UTC string
    });

    console.log("Selected slots (ISO):", all);
    // await supabase.from("availability").insert(all.map(t => ({ start_time: t })));
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Pasirinkite datas ir laikus</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          fromDate={today}
          toDate={twoWeeksLater}
          weekStartsOn={1}
          locale={undefined} // use "lt" if you add locale support
        />

        <div>
          {selectedDate ? (
            <>
              <h3 className="text-md font-semibold mb-2">
                {selectedDate.toLocaleDateString("lt-LT", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {HOURS.map((hour) =>
                  MINUTES.map((minute) => {
                    const key = slotKey({ date: selectedDate, hour, minute });
                    const selected = selectedSlots.has(key);
                    const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          toggleSlot({ date: selectedDate, hour, minute })
                        }
                        className={`px-3 py-2 rounded text-sm font-medium transition ${
                          selected
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Pasirinkite dieną kalendoriuje</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Išsaugoti pasirinkimus
        </button>
      </div>
    </div>
  );
}
