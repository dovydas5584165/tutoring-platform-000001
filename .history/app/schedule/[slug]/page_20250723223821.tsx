"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

type Availability = {
  id: number;
  user_id: string;       // Tutor id
  start_time: string;
  is_booked: boolean;
};

export default function ScheduleLanding() {
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

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
  }, [slug]);

  const handleSlotClick = (id: number) => {
    setSelectedSlotId(id === selectedSlotId ? null : id); // toggle popup for that slot
  };

  const handleBookingConfirm = async (slot: Availability) => {
    setBookingLoading(true);

    // Update availability to booked
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

    // Send notification to tutor
    const message = `Ar sutinki vesti ${slug} pamoką ${format(
      new Date(slot.start_time),
      "yyyy-MM-dd HH:mm"
    )} laiku?`;

    const { error: notifError } = await supabase.from("notifications").insert({
      user_id: slot.user_id,
      message,
      is_read: false,
    });

    if (notifError) {
      alert("Nepavyko siųsti pranešimo mokytojui.");
      console.error(notifError);
      // Not fatal - user already booked, so we can proceed
    }

    // Update UI to remove booked slot
    setSlots((prev) => prev.filter((s) => s.id !== slot.id));
    setSelectedSlotId(null);
    setBookingLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans">
      <header className="flex justify-between items-center px-8 py-4 border-b border-gray-200 shadow-sm">
        <div className="text-xl font-semibold tracking-tight">Tiksliukai.lt</div>
      </header>

      <main className="flex flex-col flex-1 items-center px-8 py-12">
        <h1 className="text-3xl font-bold mb-6">{slug} pamokų laikai</h1>

        {loading ? (
          <p className="text-gray-600">Kraunama...</p>
        ) : slots.length === 0 ? (
          <p className="text-gray-600">Nėra galimų laikų.</p>
        ) : (
          <ul className="space-y-2 w-full max-w-md">
            {slots.map((slot) => {
              const formatted = format(new Date(slot.start_time), "yyyy-MM-dd HH:mm");
              const showPopup = selectedSlotId === slot.id;

              return (
                <li key={slot.id} className="relative border rounded-md p-3 shadow-sm hover:bg-gray-100 cursor-pointer">
                  <div onClick={() => handleSlotClick(slot.id)}>
                    {formatted} — Tutor ID: {slot.user_id}
                  </div>

                  {showPopup && (
                    <div className="absolute left-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-md p-4 z-10 w-full max-w-xs">
                      <p className="mb-4">
                        Ar norite užsisakyti {slug} pamoką {formatted}?
                      </p>
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
      </main>

      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
