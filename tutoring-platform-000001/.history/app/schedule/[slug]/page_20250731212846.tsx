"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { format, parseISO } from "date-fns";

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
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const params = useParams();
  const slug = decodeURIComponent(params.slug as string); // subject name

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
    const fetchAvailability = async () => {
      if (!selectedTeacher) return;
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

  const handleSlotClick = (id: number) => {
    setSelectedSlotId(id === selectedSlotId ? null : id);
  };

  const handleBookingConfirm = async (slot: Availability) => {
    setBookingLoading(true);

    const { error: updateError } = await supabase
      .from("availability")
      .update({ is_booked: true })
      .eq("id", slot.id);

    if (updateError) {
      alert("Nepavyko užsakyti pamokos. Bandykite dar kartą.");
      console.error(updateError);
      setBookingLoading(false);
      return;
    }

    const formattedTime = format(parseISO(slot.start_time), "yyyy-MM-dd HH:mm");

    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: slot.user_id,
      message: `Ar sutinki vesti ${slug} pamoką ${formattedTime}?`,
      is_read: false,
    });

    if (notifError) {
      console.error("Nepavyko siųsti pranešimo mokytojui:", notifError.message);
    }

    setSlots((prev) => prev.filter((s) => s.id !== slot.id));
    setSelectedSlotId(null);
    setBookingLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm">
        <div className="text-xl font-semibold tracking-tight">Tiksliukai.lt</div>
      </header>

      <main className="flex flex-col flex-1 items-center px-8 py-12 w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 capitalize">{slug} pamokos</h1>

        {/* Teacher select */}
        {teachers.length > 0 && (
          <div className="w-full mb-8">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Pasirinkite mokytoją:
            </label>
            <select
              value={selectedTeacher?.id || ""}
              onChange={(e) =>
                setSelectedTeacher(
                  teachers.find((t) => t.id === e.target.value) || null
                )
              }
              className="w-full border rounded px-4 py-2"
            >
              <option value="" disabled>
                -- Pasirinkite --
              </option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.vardas} {teacher.pavarde} – €{teacher.hourly_wage}/val
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Calendar Grid */}
        {selectedTeacher && (
          <div className="w-full">
            {loading ? (
              <p className="text-gray-600">Kraunama laikai...</p>
            ) : slots.length === 0 ? (
              <p className="text-gray-600">Nėra galimų laikų.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {slots.map((slot) => {
                  const time = new Date(slot.start_time);
                  const formatted = format(time, "EEE, MMM d HH:mm");
                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <div
                      key={slot.id}
                      className={`relative p-4 border rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-100 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSlotClick(slot.id)}
                    >
                      <p className="text-center font-medium">{formatted}</p>

                      {isSelected && (
                        <div className="absolute top-full left-0 mt-2 bg-white shadow-lg rounded-lg p-4 z-20 w-full border">
                          <p className="text-sm text-center mb-3 font-medium">
                            Užsakyti laiką: <br />
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
      </main>

      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
