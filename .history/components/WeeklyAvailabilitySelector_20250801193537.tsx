"use client";

import { useState } from "react";

const DAYS = ["Pirm", "Antr", "Treč", "Ketv", "Penkt", "Šešt", "Sekm"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);
const MINUTES = [0, 45];

type SlotKey = string;

export default function WeeklyCalendar() {
  const [selectedSlots, setSelectedSlots] = useState<Set<SlotKey>>(new Set());

  const toggleSlot = (key: SlotKey) => {
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg overflow-x-auto">
      <div className="flex gap-4 mb-6">
        <button
          className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          onClick={() => setSelectedSlots(new Set())}
        >
          Išvalyti visus
        </button>
        <button
          className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          onClick={() => {
            const allSlots = new Set<string>();
            for (let d = 0; d < DAYS.length; d++) {
              for (const hour of HOURS) {
                for (const minute of MINUTES) {
                  allSlots.add(`${d}-${hour}-${minute}`);
                }
              }
            }
            setSelectedSlots(allSlots);
          }}
        >
          Pažymėti visus
        </button>
      </div>

      <table className="table-fixed border-collapse w-full min-w-[700px]">
        <thead>
          <tr>
            <th className="border bg-gray-100 p-3 sticky top-0 left-0 z-20"></th>
            {DAYS.map((day, idx) => (
              <th
                key={idx}
                className="border bg-gray-100 p-3 text-center font-semibold sticky top-0 z-10"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((hour) =>
            MINUTES.map((minute) => {
              const timeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

              return (
                <tr key={`${hour}-${minute}`}>
                  <td className="border p-3 font-mono text-sm bg-white sticky left-0 z-10 text-right pr-4">
                    {timeLabel}
                  </td>
                  {DAYS.map((_, dIdx) => {
                    const key = `${dIdx}-${hour}-${minute}`;
                    const selected = selectedSlots.has(key);
                    return (
                      <td
                        key={key}
                        onClick={() => toggleSlot(key)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleSlot(key);
                          }
                        }}
                        className={`border text-center cursor-pointer select-none transition-colors duration-150 rounded-sm
                          p-3 font-semibold text-sm
                          ${
                            selected
                              ? "bg-blue-500 text-white"
                              : "hover:bg-gray-200 bg-white"
                          }`}
                        title={selected ? "Pasirinkta" : "Spauskite pasirinkti"}
                      >
                        {selected ? "✔️" : ""}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
