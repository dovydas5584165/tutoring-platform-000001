import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 08:00–20:00
const days = ["Pirmadienis", "Antradienis", "Trečiadienis", "Ketvirtadienis", "Penktadienis", "Šeštadienis", "Sekmadienis"];

type AvailabilitySlot = {
  id?: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

interface Props {
  savedSlots: AvailabilitySlot[];
  onSave: () => Promise<void>;
}

export default function WeeklyAvailabilitySelector({ savedSlots, onSave }: Props) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Extract booked slots from savedSlots prop
  useEffect(() => {
    if (!savedSlots || savedSlots.length === 0) {
      setBookedSlots(new Set());
      return;
    }

    const booked = new Set<string>();
    savedSlots.forEach(({ start_time, is_booked }) => {
      if (is_booked) {
        const date = new Date(start_time);
        const dayIdx = date.getDay() === 0 ? 6 : date.getDay() - 1;
        const hour = date.getHours();
        booked.add(`${dayIdx}-${hour}`);
      }
    });
    setBookedSlots(booked);
  }, [savedSlots]);

  // Memoize savedSet for saved but unbooked slots
  const savedSet = useMemo(() => {
    const set = new Set<string>();
    savedSlots.forEach(({ start_time, is_booked }) => {
      if (!is_booked) {
        const date = new Date(start_time);
        const dayIdx = date.getDay() === 0 ? 6 : date.getDay() - 1;
        const hour = date.getHours();
        set.add(`${dayIdx}-${hour}`);
      }
    });
    return set;
  }, [savedSlots]);

  // Get user ID once
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // Toggle slot if not booked or saved
  const toggleSlot = (dayIdx: number, hour: number) => {
    const key = `${dayIdx}-${hour}`;
    if (bookedSlots.has(key) || savedSet.has(key)) return;

    setSelectedSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Helper to get Monday of current week without mutating original date
  const getMonday = (date: Date) => {
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Adjust Sunday(0) to Monday(1)
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const saveAvailability = async () => {
    if (!userId || selectedSlots.size === 0) return;
    setSaving(true);

    const now = new Date();
    const monday = getMonday(now);

    const payload = Array.from(selectedSlots).map(slot => {
      const [dayIdx, hour] = slot.split("-").map(Number);
      const start = new Date(monday);
      start.setDate(start.getDate() + dayIdx);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      return {
        tutor_id: userId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        is_booked: false,
      };
    });

    const { error } = await supabase
      .from("availability")
      .upsert(payload, { onConflict: "tutor_id,start_time" });

    setSaving(false);

    if (error) {
      alert("❌ Nepavyko išsaugoti: " + error.message);
    } else {
      alert("✅ Laisvumas išsaugotas sėkmingai!");
      setSelectedSlots(new Set());
      await onSave();
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table-fixed border border-gray-300 w-full text-sm text-center">
        <thead>
          <tr>
            <th className="border p-2">Laikas</th>
            {days.map((d, i) => (
              <th key={i} className="border p-2">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map(hour => (
            <tr key={hour}>
              <td className="border p-2">{hour}:00–{hour + 1}:00</td>
              {days.map((_, dIdx) => {
                const key = `${dIdx}-${hour}`;
                const selected = selectedSlots.has(key);
                const booked = bookedSlots.has(key);
                const saved = savedSet.has(key);

                return (
                  <td
                    key={key}
                    onClick={() => toggleSlot(dIdx, hour)}
                    className={`border p-2 cursor-pointer transition-all duration-150
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
                        ? "Išsaugotas laikas"
                        : "Spauskite pasirinkti"
                    }
                  >
                    {booked ? "🚫" : saved ? "⚪" : selected ? "✔️" : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedSlots.size > 0 && (
        <div className="mt-4 bg-blue-50 p-4 rounded border border-blue-300">
          <h3 className="font-medium text-blue-800 mb-2">Pasirinkti laikai:</h3>
          <ul className="list-disc pl-6 space-y-1 text-sm text-blue-900">
            {Array.from(selectedSlots).map(slot => {
              const [d, h] = slot.split("-").map(Number);
              return (
                <li key={slot}>
                  {days[d]} {h}:00–{h + 1}:00
                  <button
                    onClick={() => {
                      const next = new Set(selectedSlots);
                      next.delete(slot);
                      setSelectedSlots(next);
                    }}
                    className="ml-2 text-red-600 hover:text-red-800 text-xs"
                  >
                    (Pašalinti)
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-4 text-right">
        <button
          onClick={saveAvailability}
          disabled={selectedSlots.size === 0 || saving}
          className={`px-4 py-2 rounded text-white ${
            selectedSlots.size === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {saving ? "Išsaugoma..." : "Išsaugoti laisvumą"}
        </button>
      </div>
    </div>
  );
}
