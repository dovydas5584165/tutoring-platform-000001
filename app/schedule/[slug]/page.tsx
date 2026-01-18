"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { format, isSameDay, parseISO, addDays } from "date-fns";
import { lt } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { motion } from "framer-motion";

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

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Atšaukti
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Išsaugoma..." : `Patvirtinti (€${totalPrice.toFixed(2)})`}
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<Availability[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [lessonPrice, setLessonPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("price")
      .select("amount")
      .single()
      .then(({ data }) => data && setLessonPrice(Number(data.amount)));
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      const { data: lesson } = await supabase
        .from("lessons")
        .select("id")
        .eq("name", slug)
        .single();

      if (!lesson) return setLoading(false);

      const { data: ul } = await supabase
        .from("user_lessons")
        .select("user_id")
        .eq("lesson_id", lesson.id);

      const ids = ul?.map((x) => x.user_id) || [];

      if (!ids.length) return setLoading(false);

      const { data: tutors } = await supabase
        .from("users")
        .select("id, vardas, pavarde, hourly_wage")
        .in("id", ids)
        .eq("role", "tutor");

      setTeachers(tutors || []);
      setLoading(false);
    };

    fetchTeachers();
  }, [slug]);

  useEffect(() => {
    if (!teachers.length) return;

    const fetchAvailability = async () => {
      setLoading(true);

      let query = supabase
        .from("availability")
        .select("id, user_id, start_time, is_booked")
        .gt("start_time", new Date().toISOString())
        .eq("is_booked", false);

      if (selectedTeacher) {
        query = query.eq("user_id", selectedTeacher.id);
      } else {
        query = query.in(
          "user_id",
          teachers.map((t) => t.id)
        );
      }

      const { data } = await query;
      setAvailabilities(data || []);
      setLoading(false);
    };

    fetchAvailability();
  }, [selectedTeacher, teachers]);

  const handleBookingConfirmAll = () => {
    if (bookingSubmitting) return;

    if (!selectedSlots.length) {
      alert("Pasirinkite bent vieną pamoką.");
      return;
    }

    const tutorIds = [...new Set(selectedSlots.map((s) => s.user_id))];
    if (tutorIds.length > 1) {
      alert("Negalite užsisakyti pas skirtingus mokytojus.");
      return;
    }

    const saved = localStorage.getItem("bookingInfo");
    if (saved) {
      handleBookingInfoSubmit(JSON.parse(saved));
    } else {
      setShowBookingModal(true);
    }
  };

  const handleBookingInfoSubmit = async (info: BookingInfo) => {
    if (bookingSubmitting) return;

    setBookingSubmitting(true);

    try {
      localStorage.setItem("bookingInfo", JSON.stringify(info));

      const { data: booking } = await supabase
        .from("bookings")
        .insert({
          student_name: info.name,
          student_email: info.email.trim(),
          student_phone: info.phone || null,
          topic: info.topic || null,
          slot_ids: selectedSlots.map((s) => s.id),
          total_price: selectedSlots.length * (lessonPrice ?? 25),
          lesson_slug: slug,
          tutor_id: selectedSlots[0].user_id,
          payment_status: "pending",
        })
        .select()
        .single();

      await supabase.from("notifications").insert(
        selectedSlots.map((slot) => ({
          user_id: slot.user_id,
          booking_id: booking.id,
          is_read: false,
          message: `Ar sutinki vesti pamoką ${slug} ${format(
            parseISO(slot.start_time),
            "yyyy-MM-dd HH:mm"
          )}?`,
        }))
      );

      router.push(`/payment?booking_id=${booking.id}`);
    } catch {
      alert("Klaida užsakant pamoką.");
    } finally {
      setBookingSubmitting(false);
      setShowBookingModal(false);
      setSelectedSlots([]);
    }
  };

  const totalPrice = selectedSlots.length * (lessonPrice ?? 25);

  return (
    <>
      {/* UI unchanged */}
      {/* Button fix */}
      <button
        onClick={handleBookingConfirmAll}
        disabled={bookingSubmitting || !selectedSlots.length}
        className="px-6 py-3 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {bookingSubmitting ? "Užsakoma..." : "Užsakyti visas pamokas"}
      </button>

      {showBookingModal && (
        <BookingInfoModal
          slots={selectedSlots}
          totalPrice={totalPrice}
          onSubmit={handleBookingInfoSubmit}
          onCancel={() => setShowBookingModal(false)}
          loading={bookingSubmitting}
        />
      )}
    </>
  );
}
