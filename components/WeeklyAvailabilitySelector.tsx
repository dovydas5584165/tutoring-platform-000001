"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  addDays,
  setHours,
  setMinutes,
  startOfToday,
  formatISO,
  addHours,
} from "date-fns";
import { supabase } from "@/lib/supabaseClient";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08 to 22
const MINUTES = [0]; // hourly slots

type Slot = {
  date: Date;
  hour: number;
  minute: number;
};

function slotKey({ date, hour, minute }: Slot) {
  return `${date.toDateString()}-${hour}-${minute}`;
}

export default function TwoWeekHourlyCalendar({ userId }: { userId: string }) {
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
      const end = addHours(start, 1);

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
    <div className="p-6 bg-white rounded-[50px] shadow-lg max-w-4xl mx-auto relative">
      <h2 className="text-xl font-semibold mb-4 text-center">Pasirinkite datas ir laikus</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="w-full md:w-auto rounded-[50px] overflow-hidden">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            fromDate={today}
            toDate={twoWeeksLater}
            weekStartsOn={1}
          />
        </div>

        {/* Time Slots */}
        <div>
          {selectedDate ? (
            <>
              <h3 className="text-md font-semibold mb-2 text-center">
                {selectedDate.toLocaleDateString("lt-LT", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-2">
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
                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          selected
                            ? "bg-blue-500 text-white shadow-md scale-105"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
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
            <p className="text-gray-500 text-center mt-2">Pasirinkite dieną kalendoriuje</p>
          )}
        </div>
      </div>

      {selectedSlots.size > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={selectedSlots.size === 0}
            className="px-6 py-3 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 transition-all"
          >
            Išsaugoti pasirinkimus
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[50px] max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-3">Ar tikrai norite pasirinkti visus šiuos laikus?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pažymėtus laikus atsiradus užsakymui turėsite pamoką pravesti.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
              >
                Atšaukti
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all"
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
