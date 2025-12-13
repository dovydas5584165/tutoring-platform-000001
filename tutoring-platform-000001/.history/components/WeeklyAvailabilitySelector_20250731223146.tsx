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
    <div className="p-4 max-w-full overflow-auto bg-white rounded-lg shadow">
      <div className="flex gap-3 mb-4">
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => setSelectedSlots(new Set())}
        >
          Išvalyti visus
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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

      <table className="table-fixed border-collapse w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 sticky top-0 z-10"></th>
            {DAYS.map((day, dIdx) => (
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
              const timeLabel = `${String(hour).padStart(2, "0")}:${String(
                minute
              ).padStart(2, "0")}`;

              return (
                <tr key={`${hour}-${minute}`}>
                  <td className="border p-2 font-mono text-sm sticky left-0 bg-white z-10">
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
