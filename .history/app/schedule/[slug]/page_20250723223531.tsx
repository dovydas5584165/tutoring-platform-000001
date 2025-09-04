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

export default function ScheduleLanding() {
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Availability | null>(null);
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

  const handleSlotClick = (slot: Availability) => {
    setSelectedSlot(slot);
  };

  const closeModal = () => {
    if (!bookingLoading) {
      setSelectedSlot(null);
    }
  };

  const handleBookingConfirm = async () => {
    if (!selectedSlot) return;
    setBookingLoading(true);

    const { error } = await supabase
      .from("availability")
      .update({ is_booked: true })
      .eq("id", selectedSlot.id);

    if (error) {
      console.error("Klaida užsakant pamoką:", error.message);
      alert("Nepavyko užsakyti pamokos. Bandykite dar kartą.");
      setBookingLoading(false);
      return;
    }

    // Update UI after booking
    setSlots((prev) => prev.filter((s) => s.id !== selectedSlot.id));
    setSelectedSlot(null);
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
              return (
                <li
                  key={slot.id}
                  className="p-3 border rounded-md shadow-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSlotClick(slot)}
                >
                  {formatted} — Tutor ID: {slot.user_id}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <footer className="text-center py-4 text-sm text-gray-500 border-t border-gray-200">
        © 2025 Tiksliukai.lt
      </footer>

      {/* Modal Overlay */}
      {selectedSlot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">
              Ar norite užsisakyti {slug} pamoką {format(new Date(selectedSlot.start_time), "yyyy-MM-dd HH:mm")}?
            </h2>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                disabled={bookingLoading}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                Ne
              </button>

              <button
                onClick={handleBookingConfirm}
                disabled={bookingLoading}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {bookingLoading ? "Užsakoma..." : "Taip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
