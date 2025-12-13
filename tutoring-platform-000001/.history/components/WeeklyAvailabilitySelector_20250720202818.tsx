"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type AvailabilitySlot = {
  id?: number;
  day: string;
  time: string;
  is_booked: boolean;
};

type Props = {
  savedSlots: AvailabilitySlot[];
  onSave: () => void;
};

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeslots = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
];

export default function WeeklyAvailabilitySelector({ savedSlots, onSave }: Props) {
  const [selectedSlots, setSelectedSlots] = useState<{ day: string; time: string }[]>([]);

  // Check if slot is already saved (and locked)
  const isSlotSaved = (day: string, time: string) => {
    return savedSlots.some(slot => slot.day === day && slot.time === time);
  };

  // Check if slot is currently selected (not saved yet)
  const isSlotSelected = (day: string, time: string) => {
    return selectedSlots.some(slot => slot.day === day && slot.time === time);
  };

  // Toggle selection on click (only if not saved)
  const toggleSlot = (day: string, time: string) => {
    if (isSlotSaved(day, time)) return; // ignore saved slots

    if (isSlotSelected(day, time)) {
      setSelectedSlots(selectedSlots.filter(slot => !(slot.day === day && slot.time === time)));
    } else {
      setSelectedSlots([...selectedSlots, { day, time }]);
    }
  };

  // Save selected slots to Supabase
  const saveSlots = async () => {
    if (selectedSlots.length === 0) {
      alert("Pasirinkite bent vieną laiką išsaugoti.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Nesate prisijungę.");
      return;
    }

    // Prepare insert array
    const inserts = selectedSlots.map(slot => ({
      tutor_id: user.id,
      day: slot.day,
      time: slot.time,
      is_booked: false,
    }));

    // Upsert to avoid duplicates (requires unique constraint on (tutor_id, day, time))
    const { error } = await supabase
      .from("availability")
      .upsert(inserts, { onConflict: ["tutor_id", "day", "time"] });

    if (error) {
      alert("Nepavyko išsaugoti: " + error.message);
      return;
    }

    alert("Prieinamumas sėkmingai išsaugotas.");
    setSelectedSlots([]);
    onSave(); // refresh saved slots from parent
  };

  return (
    <div>
      <div className="grid grid-cols-8 gap-2 text-center mb-4">
        <div></div>
        {daysOfWeek.map(day => (
          <div key={day} className="font-semibold">
            {day}
          </div>
        ))}
      </div>

      {timeslots.map(time => (
        <div key={time} className="grid grid-cols-8 gap-2 items-center mb-2">
          <div className="font-mono">{time}</div>
          {daysOfWeek.map(day => {
            const saved = isSlotSaved(day, time);
            const selected = isSlotSelected(day, time);
            return (
              <button
                key={`${day}-${time}`}
                disabled={saved}
                onClick={() => toggleSlot(day, time)}
                className={`rounded py-1 ${
                  saved
                    ? "bg-gray-400 cursor-not-allowed text-gray-700"
                    : selected
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-blue-200"
                }`}
                title={saved ? "Šis laikas jau išsaugotas" : undefined}
              >
                {saved ? "Užimta" : "Laisva"}
              </button>
            );
          })}
        </div>
      ))}

      <button
        onClick={saveSlots}
        className="mt-4 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Išsaugoti prieinamumą
      </button>
    </div>
  );
}
