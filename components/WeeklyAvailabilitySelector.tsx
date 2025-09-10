"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  addDays,
  setHours,
  setMinutes,
  startOfToday,
  formatISO,
} from "date-fns";
import { supabase } from "@/lib/supabaseClient";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08 to 22

type Slot = { date: Date; hour: number; minute: number };

function slotKey({ date, hour, minute }: Slot) {
  return `${date.toISOString().split("T")[0]}-${hour}-${minute}`;
}

export default function HourlyAvailabilityCalendar({ userId }: { userId: string }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [existingSlots, setExistingSlots] = useState<Map<string, { isBooked: boolean }>>(new Map());
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = startOfToday();
  const oneMonthLater = addDays(today, 29);

  useEffect(() => {
    const fetchAvailability = async () => {
      const { data, error } = await supabase
        .from("availability")
        .select("start_time, is_booked")
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to fetch availability:", error);
        return;
      }

      const slotMap = new Map<string, { isBooked: boolean }>();
      data.forEach((row: any) => {
        const date = new Date(row.start_time);
        const key = slotKey({ date, hour: date.getHours(), minute: date.getMinutes() });
        slotMap.set(key, { isBooked: row.is_booked });
      });

      setExistingSlots(slotMap);
      // Pre-select all existing slots visually
      setSelectedSlots(new Set(slotMap.keys()));
    };

    fetchAvailability();
  }, [userId]);

  const toggleSlot = (slot: Slot) => {
    const key = slotKey(slot);
    // Only allow toggling new hourly slots (minute=0 and not in existingSlots)
    if (existingSlots.has(key)) return;

    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    // Only insert **new hourly slots**
    const newSlots = Array.from(selectedSlots)
      .filter((key) => {
        const [dateStr, hourStr, minStr] = key.split("-");
        return parseInt(minStr) === 0 && !existingSlots.has(key);
      })
      .map((key) => {
        const [dateStr, hourStr] = key.split("-");
        const date = new Date(dateStr);
        const hour = parseInt(hourStr);
        const start = setMinutes(setHours(date, hour), 0);
        const end = setMinutes(setHours(date, hour + 1), 0);
        return { user_id: userId, start_time: formatISO(start), end_time: formatISO(end) };
      });

    if (newSlots.length === 0) {
      alert("Nėra naujų laikų, kuriuos būtų galima pridėti.");
      setSubmitting(false);
      setShowConfirm(false);
      return;
    }

    const { error } = await supabase
      .from("availability")
      .upsert(newSlots, { onConflict: ["user_id", "start_time"] });

    if (error) alert("Nepavyko išsaugoti: " + error.message);
    else alert("Laikai išsaugoti!");

    setShowConfirm(false);
    setSubmitting(false);
    // Refresh availability
    setSelectedSlots(new Set([...selectedSlots, ...newSlots.map((s) => slotKey({ date: new Date(s.start_time), hour: new Date(s.start_time).getHours(), minute: 0 }))]));
  };

  const renderSlotsForSelectedDate = () => {
    if (!selectedDate) return null;
    const dateStr = selectedDate.toISOString().split("T")[0];

    // Collect all slots for the selected day (including legacy 45-min slots)
    const slots: { key: string; hour: number; minute: number; isBooked: boolean; isNewHourly: boolean }[] = [];

    existingSlots.forEach((v, key) => {
      if (key.startsWith(dateStr)) {
        const [_, hourStr, minStr] = key.split("-");
        slots.push({
          key,
          hour: parseInt(hourStr),
          minute: parseInt(minStr),
          isBooked: v.isBooked,
          isNewHourly: false,
        });
      }
    });

    // Add hourly slots if not already in existing
    HOURS.forEach((hour) => {
      const key = `${dateStr}-${hour}-0`;
      if (!existingSlots.has(key)) {
        slots.push({ key, hour, minute: 0, isBooked: false, isNewHourly: true });
      }
    });

    // Sort slots by time
    slots.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-2">
        {slots.map((slot) => {
          const selected = selectedSlots.has(slot.key);
          return (
            <button
              key={slot.key}
              onClick={() =>
                slot.isNewHourly ? toggleSlot({ date: selectedDate, hour: slot.hour, minute: slot.minute }) : undefined
              }
              aria-pressed={selected}
              className={`px-2 py-2 md:px-3 md:py-2 rounded text-sm md:text-sm font-medium transition ${
                slot.isBooked
                  ? "bg-gray-300 cursor-not-allowed text-gray-600"
                  : selected
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {String(slot.hour).padStart(2, "0")}:{String(slot.minute).padStart(2, "0")}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center md:text-left">
        Pasirinkite datas ir laikus
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 overflow-x-auto">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            fromDate={today}
            toDate={oneMonthLater}
            weekStartsOn={1}
            className="touch-auto"
          />
        </div>

        <div className="w-full md:w-1/2">
          {selectedDate ? (
            <>
              <h3 className="text-md md:text-lg font-semibold mb-2 text-center md:text-left">
                {selectedDate.toLocaleDateString("lt-LT", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              {renderSlotsForSelectedDate()}
            </>
          ) : (
            <p className="text-gray-500 text-center md:text-left mt-2">
              Pasirinkite dieną kalendoriuje
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center md:justify-end">
        <button
          onClick={() => setShowConfirm(true)}
          disabled={selectedSlots.size === 0}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
        >
          Išsaugoti pasirinkimus
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md shadow-xl w-full">
            <h3 className="text-lg font-semibold mb-3">
              Ar tikrai norite pasirinkti visus šiuos laikus?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Pažymėtus laikus atsiradus užsakymui turėsite pamoką pravesti.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
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
