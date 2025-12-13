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
  type: "success" | "error";
  message: string;
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

// Notification banner component
function NotificationBanner({ notification, onClose }: { notification: Notification | null; onClose: () => void }) {
  if (!notification) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white z-50 max-w-lg w-full flex items-center justify-between ${
        notification.type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
      role="alert"
    >
      <span>{notification.message}</span>
      <button onClick={onClose} aria-label="Close notification" className="ml-4 font-bold hover:opacity-75">
        ×
      </button>
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
  const [notification, setNotification] = useState<Notification | null>(null);

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
          setNotification({ type: "error", message: "Nepavyko patikrinti sutarties." });
          return;
        }

        if (!data.signed) setShowTerms(true);
        setUserFlags(data);
      } catch (err) {
        console.error("Error checking agreement:", err);
        setNotification({ type: "error", message: "Klaida tikrinant sutartį." });
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
        setNotification({ type: "error", message: "Nepavyko gauti prieinamumo duomenų." });
        return;
      }

      setAvailabilitySlots(data || []);
    };

    fetchAvailability();
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
      setNotification({ type: "error", message: "Nepavyko atnaujinti prieinamumo." });
      return;
    }

    setAvailabilitySlots(data || []);
    setNotification({ type: "success", message: "Prieinamumas sėkmingai atnaujintas." });
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
      setNotification({ type: "success", message: "Sutartis sėkmingai priimta." });
    } catch (err) {
      alert("Klaida priimant sutartį.");
      console.error(err);
      setNotification({ type: "error", message: "Klaida priimant sutartį." });
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
      else setNotification({ type: "error", message: "Klaida atsijungiant." });
    } catch {
      setNotification({ type: "error", message: "Klaida atsijungiant." });
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
      {/* Notification banner */}
      <NotificationBanner notification={notification} onClose={() => setNotification(null)} />

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
