"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import WeeklyAvailabilitySelector, { AvailabilitySlot } from "@/components/WeeklyAvailabilitySelector";

type Lesson = {
  id: number;
  date: string;
  topic: string;
  student: string;
};

type UserFlags = {
  signed: boolean;
  signed_at: string | null;
};

type Notification = {
  id: number;
  user_id: string | null;
  message: string;
  is_read: boolean | null;
  related_slot_id: number | null;
  created_at: string | null;
};

function TermsPopup({ onAccept }: { onAccept: () => void }) {
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    if (!agreed) {
      alert("Prašome sutikti su paslaugų teikimo sutartimi.");
      return;
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Paslaugų teikimo sutartis</h2>

        <div className="text-sm text-gray-700 mb-6 whitespace-pre-line">
          <p>Korepetitorius patvirtina, kad sutinka laikytis šių paslaugų teikimo sąlygų:</p>
          <p>1. Korepetitorius įsipareigoja teikti kokybiškas ir laiku vykdomas mokymo paslaugas.</p>
          <p>2. Paslaugų apimtis, trukmė ir kaina yra sutartinai nustatytos.</p>
          <p>3. Ginčų atveju šalys sieks susitarti derybų būdu. Nepavykus, ginčas sprendžiamas Lietuvos Respublikos teisės aktų nustatyta tvarka.</p>
          <p>4. Korepetitorius patvirtina, kad yra susipažinęs su visomis sąlygomis ir jas priima.</p>
          <p>(Sutarties tekstas gali būti papildytas ir koreguojamas pagal poreikį.)</p>
        </div>

        <label className="flex items-center space-x-2 mb-6">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="w-5 h-5"
          />
          <span>Sutinku su paslaugų teikimo sutartimi</span>
        </label>

        <div className="flex justify-end">
          <button
            onClick={handleAgree}
            disabled={!agreed}
            className={`px-4 py-2 rounded text-white ${
              agreed ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Sutinku
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TutorDashboard() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [showTerms, setShowTerms] = useState(false);
  const [userFlags, setUserFlags] = useState<UserFlags | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Check if user agreed to terms and fetch user flags
  useEffect(() => {
    const checkAgreement = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/log-in");
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("signed, signed_at")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Klaida tikrinant sutikimą:", error.message);
          return;
        }

        if (!data.signed) setShowTerms(true);
        setUserFlags(data);
      } catch (err) {
        console.error("Error checking agreement:", err);
      }
    };

    checkAgreement();
  }, [router]);

  // Load availability slots from Supabase
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("user_id", id);

      if (error) {
        console.error("Klaida gaunant prieinamumą:", error.message);
        return;
      }

      setAvailabilitySlots(data || []);
    };

    fetchAvailability();
  }, [id]);

  // Load notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Klaida gaunant pranešimus:", error.message);
        return;
      }

      setNotifications(data || []);
    };

    fetchNotifications();
  }, [id]);

  // Handler to reload availability after save
  const handleSave = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .eq("user_id", id);

    if (error) {
      console.error("Klaida atnaujinant prieinamumą:", error.message);
      return;
    }

    setAvailabilitySlots(data || []);
  };

  // Handle notification Yes / No buttons
  const handleNotificationResponse = async (notification: Notification, isYes: boolean) => {
    if (!id) return;

    if (!isYes) {
      // If No clicked, reset availability slot to 0 (assuming "status" field means booked=1/free=0)
      if (notification.related_slot_id) {
        const { error } = await supabase
          .from("availability")
          .update({ status: 0 })
          .eq("id", notification.related_slot_id)
          .eq("user_id", id);

        if (error) {
          alert("Klaida atnaujinant prieinamumą: " + error.message);
          return;
        }

        // Refresh availability slots to update UI if needed
        await handleSave();
      }
    }

    // Remove notification from UI
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

    // Optionally, mark notification as read or delete from DB here
    // await supabase.from("notifications").delete().eq("id", notification.id);
  };

  const acceptTerms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("users")
        .update({
          signed: true,
          signed_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        alert("Nepavyko įrašyti sutikimo: " + error.message);
        return;
      }

      setUserFlags({ signed: true, signed_at: new Date().toISOString() });
      setShowTerms(false);
    } catch (err) {
      alert("Klaida priimant sutartį.");
      console.error(err);
    }
  };

  const lessons: Lesson[] = [
    { id: 1, date: "2025-07-01", topic: "Įvadas į R ir RStudio", student: "Dovydas" },
    { id: 2, date: "2025-07-03", topic: "Statistikos pagrindai", student: "Gabija" },
    { id: 3, date: "2025-07-05", topic: "Excel duomenų analizė", student: "Tomas" },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) router.push("/auth/log-in");
      else alert("Klaida atsijungiant.");
    } catch {
      alert("Klaida atsijungiant.");
    }
  };

  const goTo = (path: string) => {
    if (!id) {
      alert("Neidentifikuotas mokytojo ID");
      return;
    }
    router.push(`/tutor_dashboard/${id}/${path}`);
  };

  if (showTerms) {
    return <TermsPopup onAccept={acceptTerms} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sveiki, mokytojau!</h1>
          {userFlags?.signed_at && (
            <p className="text-xs text-gray-500">
              Sutartis pasirašyta: {new Date(userFlags.signed_at).toLocaleDateString("lt-LT")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => goTo("sf_form")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Įrašyti sąskaitą</button>
          <button onClick={() => goTo("add_lesson")} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Pridėti pamoką</button>
          <button onClick={() => goTo("grades")} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Pridėti pažymį</button>
          <button onClick={() => goTo("resources")} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Resursai</button>
          <button onClick={handleLogout} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700">Atsijungti</button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 space-y-8">
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Visos pamokos</h2>
          <ul className="space-y-3">
            {lessons.map(lesson => (
              <li key={lesson.id} className="border-b border-gray-200 pb-2">
                <div><strong>Tema:</strong> {lesson.topic}</div>
                <div><strong>Studentas:</strong> {lesson.student}</div>
                <div><strong>Data:</strong> {new Date(lesson.date).toLocaleDateString("lt-LT")}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pranešimai</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-600">Nėra naujų pranešimų.</p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {notifications.map((note) => (
                <li
                  key={note.id}
                  className={`p-3 rounded ${
                    note.is_read ? "bg-gray-100 text-gray-700" : "bg-blue-100 text-blue-900 font-semibold"
                  } flex justify-between items-center`}
                >
                  <div>
                    {note.message}
                    <div className="text-xs text-gray-500 mt-1">
                      {note.created_at ? new Date(note.created_at).toLocaleString("lt-LT") : ""}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={() => handleNotificationResponse(note, true)}
                    >
                      Yes
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => handleNotificationResponse(note, false)}
                    >
                      No
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pasirinkite savo prieinamumą</h2>
          <WeeklyAvailabilitySelector
            savedSlots={availabilitySlots}
            onSave={handleSave}
            userId={id ?? ""}
          />
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
