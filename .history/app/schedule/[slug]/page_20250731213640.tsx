"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { addDays, format, isSameDay, parseISO } from "date-fns";
import { lt } from "date-fns/locale";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type Availability = {
  id: number;
  user_id: string;
  start_time: string;
  is_booked: boolean;
};

type Teacher = {
  id: string;
  vardas: string;
  pavarde: string;
  hourly_wage: number;
};

export default function ScheduleLanding() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("id, vardas, pavarde, hourly_wage")
        .eq("role", "tutor");

      if (error) {
        console.error("Klaida gaunant mokytojus:", error.message);
        setTeachers([]);
      } else {
        setTeachers(data || []);
      }
      setLoading(false);
    };
    fetchTeachers();
  }, [slug]);

  useEffect(() => {
    if (!selectedTeacher) return;

    const fetchAvailability = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("availability")
        .select("id, user_id, start_time, is_booked")
        .gt("start_time", new Date().toISOString())
        .eq("user_id", selectedTeacher.id)
        .eq("is_booked", false);

      if (error) {
        console.error("Klaida gaunant laikus:", error.message);
        setSlots([]);
      } else {
        setSlots(data || []);
      }
      setLoading(false);
    };

    fetchAvailability();
  }, [selectedTeacher]);

  const handleBookingConfirm = async (slot: Availability) => {
    setBookingLoading(true);
    const { error: updateError } = await supabase
      .from("availability")
      .update({ is_booked: true })
      .eq("id", slot.id);

    if (updateError) {
      alert("Nepavyko užsakyti pamokos. Bandykite dar kartą.");
      setBookingLoading(false);
      return;
    }

    await supabase.from("notifications").insert({
      user_id: slot.user_id,
      message: `Ar sutinki vesti ${slug} pamoką ${format(
        parseISO(slot.start_time),
        "yyyy-MM-dd HH:mm"
      )}?`,
      is_read: false,
    });

    setSlots((prev) => prev.filter((s) => s.id !== slot.id));
    setSelectedSlotId(null);
    setBookingLoading(false);
  };

  const filteredSlots = slots.filter(
    (slot) =>
      selectedDate &&
      isSameDay(parseISO(slot.start_time), selectedDate)
  );

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans px-6 py-10 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4 capitalize">Pamokos: {slug}</h1>

        {/* Teacher dropdown */}
        {teachers.length > 0 && (
          <div className="mb-8">
            <label className="block mb-2 text-sm font-medium">Pasirinkite mokytoją:</label>
            <select
              className="w-full border rounded px-4 py-2"
              value={selectedTeacher?.id || ""}
              onChange={(e) =>
                setSelectedTeacher(
                  teachers.find((t) => t.id === e.target.value) || null
                )
              }
            >
              <option value="" disabled>
                -- Pasirinkite --
              </option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.vardas} {t.pavarde} – €{t.hourly_wage}/val.
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Calendar */}
      {selectedTeacher && (
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          fromDate={new Date()}
          toDate={addDays(new Date(), 31)}
          locale={lt}
          modifiersClassNames={{
            selected: "bg-blue-600 text-white rounded",
            today: "underline",
          }}
          styles={{
            caption: { textAlign: "center" },
            head_row: { borderBottom: "1px solid #ddd" },
          }}
        />
      )}

      {/* Time slots */}
      {selectedTeacher && (
        <div className="mt-8">
          {loading ? (
            <p>Kraunama laikai...</p>
          ) : filteredSlots.length === 0 ? (
            <p>Nėra laisvų laikų šiai dienai.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredSlots.map((slot) => {
                const time = parseISO(slot.start_time);
                const formatted = format(time, "HH:mm");
                const isSelected = selectedSlotId === slot.id;

                return (
                  <div
                    key={slot.id}
                    className={`relative p-4 border rounded-lg shadow-sm cursor-pointer text-center ${
                      isSelected ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedSlotId(isSelected ? null : slot.id)}
                  >
                    <p className="font-medium text-lg">{formatted}</p>

                    {isSelected && (
                      <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg p-4 z-20 w-full border">
                        <p className="text-sm text-center mb-3 font-medium">
                          Užsakyti laiką:<br />
                          <span className="font-bold">{formatted}</span>
                        </p>
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => setSelectedSlotId(null)}
                            disabled={bookingLoading}
                            className="px-3 py-1 border rounded hover:bg-gray-100"
                          >
                            Ne
                          </button>
                          <button
                            onClick={() => handleBookingConfirm(slot)}
                            disabled={bookingLoading}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {bookingLoading ? "Užsakoma..." : "Taip"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
