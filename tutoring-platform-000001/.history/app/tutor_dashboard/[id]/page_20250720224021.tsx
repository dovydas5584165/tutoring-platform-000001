"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const days = ["Pirm", "Antr", "Treč", "Ketv", "Penkt", "Šešt", "Sekm"];
const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

type Slot = {
  day: number;   // 0 = Monday, 6 = Sunday
  hour: number;  // 8 to 20
};

export default function WeeklyAvailabilitySelector() {
  const supabase = createClientComponentClient();

  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Vartotojas neprisijungęs.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("weekly_availability")
        .select("day, hour")
        .eq("user_id", user.id);

      if (error) {
        setError("Klaida gaunant duomenis: " + error.message);
      } else if (data) {
        setSelectedSlots(data.map((d) => ({ day: d.day, hour: d.hour })));
      }

      setLoading(false);
    };

    fetchAvailability();
  }, [supabase]);

  function toggleSlot(day: number, hour: number) {
    const exists = selectedSlots.some((s) => s.day === day && s.hour === hour);
    if (exists) {
      setSelectedSlots((prev) => prev.filter((s) => !(s.day === day && s.hour === hour)));
    } else {
      setSelectedSlots((prev) => [...prev, { day, hour }]);
    }
  }

  async function saveAvailability() {
    setSaving(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Vartotojas neprisijungęs.");
      setSaving(false);
      return;
    }

    // Delete old availability
    const { error: deleteError } = await supabase
      .from("weekly_availability")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      setError("Klaida trinant senus duomenis: " + deleteError.message);
      setSaving(false);
      return;
    }

    if (selectedSlots.length > 0) {
      const inserts = selectedSlots.map((slot) => ({
        user_id: user.id,
        day: slot.day,
        hour: slot.hour,
        available: true,
      }));

      const { error: insertError } = await supabase
        .from("weekly_availability")
        .insert(inserts);

      if (insertError) {
        setError("Klaida saugant duomenis: " + insertError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    alert("Darbo laikas išsaugotas!");
  }

  if (loading) return <p>Įkeliama jūsų prieinamumas...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Pasirinkite savo prieinamą laiką per savaitę</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          Klaida: {error}
        </div>
      )}

      <div className="overflow-auto border rounded shadow">
        <table className="w-full table-fixed border-collapse border border-gray-300 text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 w-16">Laikas</th>
              {days.map((day, i) => (
                <th key={i} className="border border-gray-300 w-14">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="border border-gray-300 font-mono">{hour}:00</td>
                {days.map((_, dayIndex) => {
                  const selected = selectedSlots.some(
                    (s) => s.day === dayIndex && s.hour === hour
                  );
                  return (
                    <td
                      key={dayIndex}
                      onClick={() => toggleSlot(dayIndex, hour)}
                      className={`border border-gray-300 cursor-pointer select-none transition-colors ${
                        selected
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-white hover:bg-blue-200"
                      }`}
                      title={selected ? "Pasirinkta" : "Nepasirinkta"}
                    >
                      &nbsp;
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={saveAvailability}
        disabled={saving}
        className={`mt-4 px-6 py-2 rounded text-white transition ${
          saving
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {saving ? "Saugoma..." : "Išsaugoti prieinamumą"}
      </button>
    </div>
  );
}
