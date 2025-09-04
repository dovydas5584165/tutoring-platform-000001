"use client";

import { useState } from "react";

const DAYS = ["Pirm", "Antr", "Treč", "Ketv", "Penkt", "Šešt", "Sekm"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 to 19

// Example time slot length: 45 mins in 1 row; for simplicity, each row = 45 mins block
const MINUTES = [0, 45];

type SlotKey = string; // e.g. "day-hour-minute"

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
    <div className="p-4 max-w-full overflow-auto bg-white rounded-lg shadow">
      <table className="table-fixed border-collapse w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 sticky top-0 z-10"></th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="border p-2 bg-gray-100 sticky top-0 z-10 text-center font-semibold"
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
                  {/* Time label column */}
                  <td className="border p-2 font-mono text-sm sticky left-0 bg-white z-10">
                    {timeLabel}
                  </td>

                  {/* Days cells */}
                  {DAYS.map((day, dIdx) => {
                    const key = `${dIdx}-${hour}-${minute}`;
                    const selected = selectedSlots.has(key);
                    return (
                      <td
                        key={key}
                        onClick={() => toggleSlot(key)}
                        className={`border p-2 text-center cursor-pointer select-none
                          ${
                            selected
                              ? "bg-green-500 text-white"
                              : "hover:bg-gray-200"
                          }
                          transition-colors duration-150`}
                        title={selected ? "Pasirinkta" : "Paspauskite pasirinkti"}
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
