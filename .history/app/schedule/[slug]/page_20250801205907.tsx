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
};

type Teacher = {
  id: string;
  vardas: string;
  pavarde: string;
  hourly_wage: number;
};

export default function ScheduleLanding() {
  const router = useRouter();
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<Availability[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [topic, setTopic] = useState<string>("");

  // Fetch teachers filtered by lesson slug via user_lessons join
  useEffect(() => {
    const fetchTeachersByLesson = async () => {
      setLoading(true);
      try {
        // 1) Get lesson id by slug
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("id")
          .eq("name", slug)
          .single();

        if (lessonError || !lessonData) {
          console.error("Klaida gaunant pamokos id:", lessonError?.message);
          setTeachers([]);
          setLoading(false);
          return;
        }

        const lessonId = lessonData.id;

        // 2) Get user_ids from user_lessons by lesson id
        const { data: userLessonsData, error: userLessonsError } = await supabase
          .from("user_lessons")
          .select("user_id")
          .eq("lesson_id", lessonId);

        if (userLessonsError) {
          console.error("Klaida gaunant user_lessons:", userLessonsError.message);
          setTeachers([]);
          setLoading(false);
          return;
        }

        const tutorIds = userLessonsData?.map((ul) => ul.user_id) || [];

        if (tutorIds.length === 0) {
          setTeachers([]);
          setLoading(false);
          return;
        }

        // 3) Get tutors info by user ids (also filter role='tutor' just in case)
        const { data: tutorsData, error: tutorsError } = await supabase
          .from("users")
          .select("id, vardas, pavarde, hourly_wage")
          .in("id", tutorIds)
          .eq("role", "tutor");

        if (tutorsError) {
          console.error("Klaida gaunant mokytojus:", tutorsError.message);
          setTeachers([]);
          setLoading(false);
          return;
        }

        setTeachers(tutorsData || []);
      } catch (err) {
        console.error("Neapdorota klaida:", err);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachersByLesson();
  }, [slug]);

  // Fetch availability slots filtered by selected teacher and date
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("availability")
          .select("id, user_id, start_time, is_booked")
          .gt("start_time", new Date().toISOString())
          .eq("is_booked", false);

        if (selectedTeacher) {
          query = query.eq("user_id", selectedTeacher.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Klaida gaunant laikus:", error.message);
          setAvailabilities([]);
        } else {
          setAvailabilities(data || []);
        }
      } catch (err) {
        console.error("Neapdorota klaida gaunant laikus:", err);
        setAvailabilities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedTeacher]);

  // Extract unique available days (strings) and filter out invalid values
  const availableDays = Array.from(
    new Set(availabilities.map((a) => a.start_time.slice(0, 10)).filter(Boolean))
  ).map((day) => parseISO(day));

  // Filter slots for the selected date
  const filteredSlots = availabilities.filter((slot) =>
    selectedDate ? isSameDay(parseISO(slot.start_time), selectedDate) : true
  );

  // Toggle slot selection
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
      setAvailabilities((prev) => prev.filter((s) => !selectedSlots.some(sel => sel.id === s.id)));

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

        {teachers.length > 0 ? (
          <div className="mb-8 max-w-md relative">
            <label
              htmlFor="teacher-select"
              className="block mb-2 text-sm font-semibold text-gray-700"
            >
              Pasirinkite mokytoją:
            </label>
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
              <option value="">-- Rodyti visus --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.vardas} {t.pavarde} – €{t.hourly_wage}/val.
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-red-600 mb-4 font-semibold">Šiai pamokai šiuo metu nėra mokytojų.</p>
        )}
      </header>

      <div className="border rounded-lg p-4 shadow-lg mb-8">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          fromDate={new Date()}
          toDate={addDays(new Date(), 31)}
          locale={lt}
          disabled={(day) => {
            // disable days not in availableDays
            return !availableDays.some((availableDay) => isSameDay(availableDay, day));
          }}
          modifiersClassNames={{
            selected: "bg-blue-600 text-white rounded",
            today: "underline",
            disabled: "opacity-40 cursor-not-allowed",
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
        ) : filteredSlots.length === 0 ? (
          <p>Nėra laisvų laikų šiai dienai.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredSlots.map((slot) => {
              const time = parseISO(slot.start_time);
              const formatted = format(time, "HH:mm");
              const isSelected = selectedSlots.some((s) => s.id === slot.id);
              const teacher = teachers.find((t) => t.id === slot.user_id);

              return (
                <div
                  key={slot.id}
                  className={`relative p-4 border rounded-lg shadow-sm cursor-pointer text-center select-none ${
                    isSelected ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleSlotSelection(slot)}
                >
                  <p className="font-medium text-lg">{formatted}</p>
                  {teacher && (
                    <p className="text-xs mt-1 text-gray-600">
                      {teacher.vardas} {teacher.pavarde} – €{teacher.hourly_wage}/val.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12 border-t pt-6 max-w-md">
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
              {selectedSlots.map((slot) => {
                const teacher = teachers.find((t) => t.id === slot.user_id);
                return (
                  <li
                    key={slot.id}
                    className="flex justify-between border rounded p-3 shadow-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {format(parseISO(slot.start_time), "yyyy-MM-dd HH:mm")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {teacher?.vardas} {teacher?.pavarde}
                      </p>
                    </div>
                    <div className="font-semibold text-blue-700">
                      €{teacher ? teacher.hourly_wage.toFixed(2) : "0.00"}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="text-right font-bold text-lg mb-4">
              Iš viso: €{totalPrice.toFixed(2)}
            </div>
            <button
              onClick={handleBookingConfirmAll}
              disabled={bookingLoading || selectedSlots.length === 0 || teachers.length === 0}
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
