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
  user_id: string; // tutor id
  start_time: string;
  is_booked: boolean;
};

type Teacher = {
  id: string;
  vardas: string;
  pavarde: string;
  hourly_wage: number;
};

type BookingInfo = {
  name: string;
  email: string;
  phone?: string;
  topic?: string;
};

function BookingInfoModal({
  slots,
  totalPrice,
  onSubmit,
  onCancel,
  loading,
}: {
  slots: Availability[];
  totalPrice: number;
  onSubmit: (info: BookingInfo) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) {
      alert("Prašome įvesti vardą ir el. paštą.");
      return;
    }
    onSubmit({ name, email, phone, topic });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-bold">Įveskite savo kontaktinę informaciją</h2>

        <input
          type="text"
          placeholder="Vardas, Pavardė"
          className="w-full border rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <input
          type="email"
          placeholder="El. paštas"
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          type="tel"
          placeholder="Telefonas (neprivaloma)"
          className="w-full border rounded p-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
        />

        <textarea
          placeholder="Tema (neprivaloma)"
          className="w-full border rounded p-2 resize-none"
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={loading}
        />

        <div className="flex justify-between items-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
            disabled={loading}
          >
            Atšaukti
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Išsaugoma..." : `Patvirtinti užsakymą (€${totalPrice.toFixed(2)})`}
          </button>
        </div>
      </div>
    </div>
  );
}

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

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeachersByLesson = async () => {
      setLoading(true);
      try {
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

  const availableDays = Array.from(
    new Set(availabilities.map((a) => a.start_time.slice(0, 10)).filter(Boolean))
  ).map((day) => parseISO(day));

  const filteredSlots = availabilities.filter((slot) =>
    selectedDate ? isSameDay(parseISO(slot.start_time), selectedDate) : true
  );

  const toggleSlotSelection = (slot: Availability) => {
    const exists = selectedSlots.find((s) => s.id === slot.id);
    if (exists) {
      setSelectedSlots((prev) => prev.filter((s) => s.id !== slot.id));
    } else {
      setSelectedSlots((prev) => [...prev, slot]);
    }
  };

  // Price calculation: 20 EUR per lesson
  const totalPrice = selectedSlots.length * 20;

  const handleBookingConfirmAll = () => {
    if (selectedSlots.length === 0) {
      alert("Pasirinkite bent vieną pamoką prieš užsakant.");
      return;
    }
    setShowBookingModal(true);
  };

  const handleBookingInfoSubmit = async (info: BookingInfo) => {
    setBookingSubmitting(true);

    try {
      const slotIds = selectedSlots.map((slot) => slot.id);

      // Extract tutor ID from first selected slot
      const tutorId = selectedSlots.length > 0 ? selectedSlots[0].user_id : null;

      // Insert booking and get inserted booking id
      const { data: bookingData, error } = await supabase
        .from("bookings")
        .insert({
          student_name: info.name,
          student_email: info.email,
          student_phone: info.phone || null,
          topic: info.topic || null,
          slot_ids: slotIds,
          total_price: totalPrice,
          created_at: new Date().toISOString(),
          lesson_slug: slug,
          tutor_id: tutorId, // <-- added tutor id here
        })
        .select()
        .single();

      if (error || !bookingData) throw error || new Error("Nepavyko sukurti užsakymo");

      for (const slot of selectedSlots) {
        const { error: updateError } = await supabase
          .from("availability")
          .update({ is_booked: true })
          .eq("id", slot.id);

        if (updateError) throw updateError;

        const notificationMessage = `Ar sutinki vesti ${slug} pamoką ${format(
          parseISO(slot.start_time),
          "yyyy-MM-dd HH:mm"
        )}?${info.topic ? ` Tema: "${info.topic}"` : ""}`;

        // Insert notification with booking_id linked
        await supabase.from("notifications").insert({
          user_id: slot.user_id,
          message: notificationMessage,
          is_read: false,
          booking_id: bookingData.id,
        });
      }

      alert("Pamokos sėkmingai užsakytos!");

      setShowBookingModal(false);
      setSelectedSlots([]);
      setAvailabilities((prev) => prev.filter((s) => !selectedSlots.some(sel => sel.id === s.id)));

      router.push("/payment");
    } catch (err) {
      alert("Klaida užsakant pamokas. Bandykite dar kartą.");
      console.error(err);
    } finally {
      setBookingSubmitting(false);
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
                  {t.vardas} {t.pavarde} – €20/val.
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
          disabled={(day) =>
            !availableDays.some((availableDay) => isSameDay(availableDay, day))
          }
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

              return (
                <div
                  key={slot.id}
                  className={`relative p-4 border rounded-lg shadow-sm cursor-pointer text-center select-none ${
                    isSelected ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleSlotSelection(slot)}
                >
                  <p className="font-medium text-lg">{formatted}</p>
                  <p className="text-xs mt-1 text-gray-600">€20/val.</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12 border-t pt-6 max-w-md">
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
                  <div className="font-semibold text-blue-700">€20.00</div>
                </li>
              ))}
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

      {showBookingModal && (
        <BookingInfoModal
          slots={selectedSlots}
          totalPrice={totalPrice}
          onSubmit={handleBookingInfoSubmit}
          onCancel={() => setShowBookingModal(false)}
          loading={bookingSubmitting}
        />
      )}

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
