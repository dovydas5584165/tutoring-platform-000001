"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { format, isSameDay, parseISO, addDays } from "date-fns";
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

  // Fetch teachers once
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

  // Fetch all available slots (unfiltered)
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("availability")
        .select("id, user_id, start_time, is_booked")
        .gt("start_time", new Date().toISOString())
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
  }, []);

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

  // Filter slots by selected date and optionally by teacher
  const filteredSlots = slots.filter((slot) => {
    const dateMatch = selectedDate
      ? isSameDay(parseISO(slot.start_time), selectedDate)
      : true;
    const teacherMatch = selectedTeacher
      ? slot.user_id === selectedTeacher.id
      : true;
    return dateMatch && teacherMatch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans px-6 py-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4 capitalize">Pamokos: {slug}</h1>

        {/* Teacher dropdown */}
        {teachers.length > 0 && (
          <div className="mb-8 max-w-md">
            <label className="block mb-2 text-sm font-medium">
              Pasirinkite mokytoją:
            </label>
            <select
              className="w-full border rounded px-4 py-2"
              value={selectedTeacher?.id || ""}
              onChange={(e) =>
                setSelectedTeacher(
                  teachers.find((t) => t.id === e.target.value) || null
                )
              }
            >
              <option value="">-- Rodyti visus --</option>
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
      <div className="border rounded-lg p-4 shadow-lg">
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
            day: { padding: "1.5rem 1rem", minHeight: "4rem" }, // taller days
          }}
          className="react-day-picker-custom"
        />
      </div>

      {/* Time slots */}
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

              // Find teacher for slot to display name + rate
              const teacher = teachers.find((t) => t.id === slot.user_id);

              return (
                <div
                  key={slot.id}
                  className={`relative p-4 border rounded-lg shadow-sm cursor-pointer text-center ${
                    isSelected ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedSlotId(isSelected ? null : slot.id)}
                >
                  <p className="font-medium text-lg">{formatted}</p>
                  {teacher && (
                    <p className="text-xs mt-1 text-gray-600">
                      {teacher.vardas} {teacher.pavarde} – €{teacher.hourly_wage}/val.
                    </p>
                  )}

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

      <style>{`
        /* Make days taller in react-day-picker */
        .react-day-picker-custom .rdp-day {
          padding: 1.5rem 1rem !important;
          min-height: 4.5rem !important;
          font-weight: 600;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
