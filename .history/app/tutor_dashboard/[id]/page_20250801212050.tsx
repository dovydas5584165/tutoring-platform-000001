"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Notification = {
  id: number;
  user_id: string;
  message: string;
  is_read: boolean;
};

export default function NotificationsList() {
  const currentUserId = "your-user-id"; // Replace with actual user ID (e.g., from auth)

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Fetch unread notifications
  const fetchUnreadNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", currentUserId)
      .eq("is_read", false);

    if (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (id: number) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      alert("Klaida žymint pranešimą kaip perskaitytą.");
      console.error(error);
    } else {
      // Remove notification from list after marking read
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
    setUpdatingId(null);
  };

  if (loading) return <p>Kraunama pranešimai...</p>;

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Nauji pranešimai</h2>

      {notifications.length === 0 ? (
        <p>Jokių naujų pranešimų nėra.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <span>{notification.message}</span>
              <button
                disabled={updatingId === notification.id}
                onClick={() => markAsRead(notification.id)}
                className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {updatingId === notification.id ? "Žymima..." : "Perskaityta"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
