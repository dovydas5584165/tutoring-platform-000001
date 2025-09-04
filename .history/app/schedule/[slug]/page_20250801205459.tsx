"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  day?: string; // optional day string if available from DB
};

type Teacher = {
  id: string;
  vardas: string;
  pavarde: string;
  hourly_wage: number;
};

export default function ScheduleLanding() {
  const router = useRouter();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<Availability[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [topic, setTopic] = useState<string>("");

  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  // Fetch tutors once
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
  }, []);

  // Fetch availability when selectedTeacher or selectedDate changes
  useEffect(() => {
    if (!selectedTeacher || !selectedDate) {
      setSlots([]); // clear slots if no teacher or no date selected
      return;
    }

    const fetchAvailability = async () => {
      setLoading(true);

      // We fetch slots for selected teacher and selected date
      // Assuming availability.start_time is ISO datetime string

      const dayStart = new Date(selectedDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(selectedDate);
      dayEnd.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("availability")
        .select("id, user_id, start_time, is_booked")
        .eq("user_id", selectedTeacher.id)
        .gte("start_time", dayStart.toISOString())
        .lte("start_time", dayEnd.toISOString())
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
  }, [selectedTeacher, selectedDate]);

  const toggleSlotSelection = (slot: Availability) => {
    const exists = selectedSlots.find((s) => s.id === slot.id);
    if (exists) {
      setSelectedSlots((prev) => prev.filter((s) => s.id !== slot.id));
    } else {
      setSelectedSlots((prev) => [...prev, slot]);
    }
  };

  const totalPrice = selectedSlots.reduce((total, slot) => {
    const teacher = teachers.find((t) => t.id === slot.user_id);
    if (!teacher) return total;
    return total + teacher.hourly_wage;
  }, 0);

  const handleBookingConfirmAll = async () => {
    if (selectedSlots.length === 0) {
      alert("Pasirinkite bent vieną pamoką prieš užsakant.");
      return;
    }
    setBookingLoading(true);

    try {
      for (const slot of selectedSlots) {
        const { error: updateError } = await supabase
          .from("availability")
          .update({ is_booked: true })
          .eq("id", slot.id);

        if (updateError) throw updateError;

        const notificationMessage = `Ar sutinki vesti ${slug} pamoką ${format(
          parseISO(slot.start_time),
          "yyyy-MM-dd HH:mm"
        )}?${topic ? ` Tema: "${topic}"` : ""}`;

        await supabase.from("notifications").insert({
          user_id: slot.user_id,
          message: notificationMessage,
          is_read: false,
        });
      }

      alert("Pamokos sėkmingai užsakytos!");
      setSlots((prev) => prev.filter((s) => !selectedSlots.some(sel => sel.id === s.id)));

      sessionStorage.setItem("selectedLessons", JSON.stringify(selectedSlots));
      sessionStorage.setItem("totalPrice", totalPrice.toFixed(2));

      setSelectedSlots([]);
      setTopic("");
      router.push("/payment");
    } catch (err) {
      alert("Klaida užsakant pamokas. Bandykite dar kartą.");
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans px-6 py-10 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4 capitalize">Pamokos: {slug}</h1>

        {teachers.length > 0 && (
          <div className="mb-8 max-w-md relative">
            <label
              htmlFor="teacher-select"
              className="block mb-2 text-sm font-semibold text-gray-700"
            >
              Pasirinkite mokytoją:
            </label>
            <div className="relative">
              <select
                id="teacher-select"
                className="appearance-none w-full border border-gray-300 bg-white py-3 px-4 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 cursor-pointer transition"
                value={selectedTeacher?.id || ""}
                onChange={(e) =>
                  setSelectedTeacher(
                    teachers.find((t) => t.id === e.target.value) || null
                  )
                }
              >
                <option value="">-- Pasirinkite mokytoją --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.vardas} {t.pavarde} – €{t.hourly_wage}/val.
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="w-5 h-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Calendar always visible */}
      <div className="border rounded-lg p-4 shadow-lg max-w-md mx-auto mb-8">
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
            day: { padding: "1.5rem 1rem", minHeight: "4rem" },
          }}
          className="react-day-picker-custom"
        />
      </div>

      <div>
        {loading ? (
          <p>Kraunama laikai...</p>
        ) : !selectedTeacher ? (
          <p>Pasirinkite mokytoją, kad pamatytumėte laisvus laikus.</p>
        ) : slots.length === 0 ? (
          <p>Nėra laisvų laikų pasirinktai datai.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {slots.map((slot) => {
              const time = parseISO(slot.start_time);
              const formatted = format(time, "HH:mm");
              const isSelected = selectedSlots.some((s) => s.id === slot.id);

              return (
                <div
                  key={slot.id}
                  className={`relative p-4 border rounded-lg shadow-sm cursor-pointer text-center select-none ${
                    isSelected ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleSlotSelection(slot)}
                >
                  <p className="font-medium text-lg">{formatted}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12 border-t pt-6 max-w-md mx-auto">
        <label
          htmlFor="topic"
          className="block mb-2 text-gray-700 font-semibold"
        >
          Kokia tema norėtumėte mokytis? <span className="text-gray-400">(neprivaloma)</span>
        </label>
        <input
          id="topic"
          type="text"
          className="w-full border border-gray-300 rounded-md p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Įrašykite temą..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <h2 className="text-2xl font-semibold mb-4">Jūsų pasirinktos pamokos</h2>
        {selectedSlots.length === 0 ? (
          <p>Jūs dar nepasirinkote pamokų.</p>
        ) : (
          <>
            <ul className="mb-4 space-y-2">
              {selectedSlots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex justify-between border rounded p-3 shadow-sm"
                >
                  <div>
                    <p className="font-medium">
                      {format(parseISO(slot.start_time), "yyyy-MM-dd HH:mm")}
                    </p>
                  </div>
                  <div className="font-semibold text-blue-700">
                    €{/* You could add hourly wage here if needed */}
                  </div>
                </li>
              ))}
            </ul>
            <div className="text-right font-bold text-lg mb-4">
              Iš viso: €{totalPrice.toFixed(2)}
            </div>
            <button
              onClick={handleBookingConfirmAll}
              disabled={bookingLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {bookingLoading ? "Užsakoma..." : "Užsakyti visas pamokas"}
            </button>
          </>
        )}
      </div>

      <style>{`
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
