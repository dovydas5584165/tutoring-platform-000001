"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

type Availability = {
  id: number;
  user_id: string;
  start_time: string;
  is_booked: boolean;
};

type Teacher = {
  id: string;
  full_name: string;
  hourly_rate: number;
  experience_years: number;
};

export default function ScheduleLanding() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const params = useParams();
  const slug = decodeURIComponent(params.slug as string); // subject name

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("teachers")
        .select("id, full_name, hourly_rate, experience_years, subject")
        .eq("subject", slug);

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

    const message = `Ar sutinki vesti ${slug} pamoką ${format(
      new Date(slot.start_time),
      "yyyy-MM-dd HH:mm"
    )}?`;

    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: slot.user_id,
      message,
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

      <main className="flex flex-col flex-1 items-center px-8 py-12 w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 capitalize">{slug} pamokos</h1>

        {/* Teacher dropdown */}
        {teachers.length > 0 && (
          <div className="w-full mb-6">
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
                  {teacher.full_name} – €{teacher.hourly_rate}/val – {teacher.experience_years} m. patirtis
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Timeslots */}
        {selectedTeacher && (
          <div className="w-full">
            {loading ? (
              <p className="text-gray-600">Kraunama laikai...</p>
            ) : slots.length === 0 ? (
              <p className="text-gray-600">Nėra galimų laikų.</p>
            ) : (
              <ul className="space-y-2">
                {slots.map((slot) => {
                  const formatted = format(new Date(slot.start_time), "yyyy-MM-dd HH:mm");
                  const showPopup = selectedSlotId === slot.id;

                  return (
                    <li
                      key={slot.id}
                      className="relative border rounded-md p-3 shadow-sm hover:bg-gray-100 cursor-pointer"
                    >
                      <div onClick={() => handleSlotClick(slot.id)}>{formatted}</div>

                      {showPopup && (
                        <div className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-md p-4 z-10 w-full max-w-xs">
                          <p className="mb-4 font-medium text-center">{formatted}</p>
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => setSelectedSlotId(null)}
                              disabled={bookingLoading}
                              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
                            >
                              Ne
                            </button>
                            <button
                              onClick={() => handleBookingConfirm(slot)}
                              disabled={bookingLoading}
                              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              {bookingLoading ? "Užsakoma..." : "Taip"}
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
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
