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
  addMinutes,
} from "date-fns";
import { supabase } from "@/lib/supabaseClient";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08 to 19
const MINUTES = [0, 45];

type Slot = {
  date: Date;
  hour: number;
  minute: number;
};

function slotKey({ date, hour, minute }: Slot) {
  return `${date.toDateString()}-${hour}-${minute}`;
}

export default function TwoWeekAvailabilityCalendar({ userId }: { userId: string }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    setSubmitting(true);
    const rows = Array.from(selectedSlots).map((key) => {
      const [dateStr, hourStr, minStr] = key.split("-");
      const date = new Date(dateStr);
      const hour = parseInt(hourStr);
      const minute = parseInt(minStr);
      const start = setMinutes(setHours(date, hour), minute);
      const end = addMinutes(start, 45);

      return {
        user_id: userId,
        start_time: formatISO(start),
        end_time: formatISO(end),
      };
    });

    const { error } = await supabase.from("availability").insert(rows);
    if (error) alert("Nepavyko išsaugoti: " + error.message);
    else {
      alert("Laikai išsaugoti!");
      setSelectedSlots(new Set());
    }
    setSubmitting(false);
    setShowConfirm(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto relative">
      <h2 className="text-xl font-semibold mb-4">Pasirinkite datas ir laikus</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          fromDate={today}
          toDate={twoWeeksLater}
          weekStartsOn={1}
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
                    const label = `${String(hour).padStart(2, "0")}:${String(
                      minute
                    ).padStart(2, "0")}`;
                    return (
                      <button
                        key={key}
                        onClick={() => toggleSlot({ date: selectedDate, hour, minute })}
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
          onClick={() => setShowConfirm(true)}
          disabled={selectedSlots.size === 0}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
        >
          Išsaugoti pasirinkimus
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-3">
              Ar tikrai norite pasirinkti visus šiuos laikus?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Pažymėtus laikus atsiradus užsakymui turėsite pamoką pravesti.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Atšaukti
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                {submitting ? "Išsaugoma..." : "Patvirtinti"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
