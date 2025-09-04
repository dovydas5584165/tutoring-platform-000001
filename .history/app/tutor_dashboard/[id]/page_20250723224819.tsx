"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

type Lesson = {
  id: number;
  date: string;
  topic: string;
  student: string;
};

type Availability = {
  id: number;
  user_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

type Notification = {
  id: number;
  message: string;
  is_read: boolean;
  related_slot_id: number;
};

export default function TutorDashboard() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndData = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Klaida gaunant vartotoją:", userError?.message);
        setLoading(false);
        return;
      }

      const userId = user.id;
      setId(userId);

      const [{ data: availabilityData }, { data: notificationData }] = await Promise.all([
        supabase
          .from("availability")
          .select("*")
          .eq("user_id", userId)
          .order("start_time", { ascending: true }),

        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .eq("is_read", false)
          .order("created_at", { ascending: false }),
      ]);

      setAvailabilities(availabilityData || []);
      setNotifications(notificationData || []);
      setLoading(false);
    };

    fetchUserAndData();
  }, []);

  const handleAccept = async (notif: Notification) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notif.id);

    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  const handleReject = async (notif: Notification) => {
    if (notif.related_slot_id) {
      await supabase
        .from("availability")
        .update({ is_booked: false })
        .eq("id", notif.related_slot_id);
    }

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notif.id);

    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Tavo valdymo panelė</h1>

      {loading ? (
        <p>Kraunama...</p>
      ) : (
        <>
          {notifications.length > 0 && (
            <section className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 rounded shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Nauji pranešimai</h2>
              <ul className="space-y-4">
                {notifications.map((note) => (
                  <li key={note.id} className="border-b border-gray-200 pb-2">
                    <div className="mb-2">{note.message}</div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAccept(note)}
                        className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Taip, vesti
                      </button>
                      <button
                        onClick={() => handleReject(note)}
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Ne, atsisakyti
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Tavo galimi laikai</h2>
            {availabilities.length === 0 ? (
              <p>Nėra suplanuotų laikų.</p>
            ) : (
              <ul className="space-y-2">
                {availabilities.map((slot) => (
                  <li
                    key={slot.id}
                    className="p-3 border rounded-md shadow-sm"
                  >
                    {format(new Date(slot.start_time), "yyyy-MM-dd HH:mm")} —{" "}
                    {slot.is_booked ? "Rezervuota" : "Laisvas"}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
