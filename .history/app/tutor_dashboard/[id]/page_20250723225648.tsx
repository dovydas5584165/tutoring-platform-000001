"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import WeeklyAvailabilitySelector from "@/components/WeeklyAvailabilitySelector";

type Lesson = {
  id: number;
  date: string;
  topic: string;
  student: string;
};

type AvailabilitySlot = {
  id: number;
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
  const [id, setId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setId(user.id);

      const [lessonRes, availRes, notifRes] = await Promise.all([
        supabase.from("lessons").select("*").eq("tutor", user.id),
        supabase.from("availability").select("*").eq("user_id", user.id),
        supabase.from("notifications").select("*").eq("user_id", user.id).eq("is_read", false)
      ]);

      if (lessonRes.data) setLessons(lessonRes.data);
      if (availRes.data) setAvailabilitySlots(availRes.data);
      if (notifRes.data) setNotifications(notifRes.data);
    };

    fetchData();
  }, []);

  const handleSave = async (slots: AvailabilitySlot[]) => {
    if (!id) return;

    for (const slot of slots) {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("user_id", id)
        .eq("start_time", slot.start_time)
        .eq("end_time", slot.end_time);

      if (!data || data.length === 0) {
        await supabase.from("availability").insert({
          user_id: id,
          start_time: slot.start_time,
          end_time: slot.end_time,
        });
      }
    }

    const { data } = await supabase.from("availability").select("*").eq("user_id", id);
    setAvailabilitySlots(data || []);
  };

  const handleAccept = async (notif: Notification) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
    setNotifications(notifications.filter(n => n.id !== notif.id));
  };

  const handleReject = async (notif: Notification) => {
    if (notif.related_slot_id) {
      await supabase
        .from("availability")
        .update({ is_booked: false })
        .eq("id", notif.related_slot_id);
    }

    await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
    setNotifications(notifications.filter(n => n.id !== notif.id));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold">Tinklaraščio valdymas</h1>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* 🔔 Notifications */}
        {notifications.length > 0 && (
          <section className="bg-yellow-50 border-l-4 border-yellow-400 rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Naujos pamokų užklausos</h2>
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

        {/* 📚 Lessons */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Visos pamokos</h2>
          <ul className="space-y-3">
            {lessons.map(lesson => (
              <li key={lesson.id} className="border-b border-gray-200 pb-2">
                <div><strong>Tema:</strong> {lesson.topic}</div>
                <div><strong>Studentas:</strong> {lesson.student}</div>
                <div><strong>Data:</strong> {new Date(lesson.date).toLocaleString("lt-LT")}</div>
              </li>
            ))}
          </ul>
        </section>

        {/* ⏰ Availability */}
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pasirinkite savo prieinamumą</h2>
          <WeeklyAvailabilitySelector
            savedSlots={availabilitySlots}
            onSave={handleSave}
            userId={id ?? ""}
          />
        </section>
      </main>

      <footer className="bg-white shadow p-4 text-center text-sm text-gray-500">
        &copy; 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
