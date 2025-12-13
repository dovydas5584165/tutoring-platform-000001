"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import WeeklyAvailabilitySelector from "@/components/WeeklyAvailabilitySelector";

type UserFlags = {
  signed: boolean;
  signed_at: string | null;
};

type AvailabilitySlot = {
  id?: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
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
        <div className="text-sm text-gray-700 mb-6 whitespace-pre-line space-y-2">
          <p>Korepetitorius patvirtina, kad sutinka laikytis šių paslaugų teikimo sąlygų:</p>
          <p>1. Teikti kokybiškas ir laiku vykdomas mokymo paslaugas.</p>
          <p>2. Paslaugų apimtis, trukmė ir kaina yra sutartinai nustatytos.</p>
          <p>3. Ginčai sprendžiami LR teisės aktų nustatyta tvarka.</p>
          <p>4. Korepetitorius patvirtina, kad yra susipažinęs su visomis sąlygomis ir jas priima.</p>
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
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const checkAgreement = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserId(user.id);

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
  };

  const loadAvailability = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .eq("_id", userId);

    if (error) {
      console.error("Klaida kraunant laisvumą:", error.message);
      return;
    }

    setAvailability(data || []);
  };

  useEffect(() => {
    checkAgreement();
  }, []);

  useEffect(() => {
    if (userId) loadAvailability();
  }, [userId]);

  const acceptTerms = async () => {
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
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push("/auth/log-in");
  };

  const goTo = (path: string) => {
    if (id) router.push(`/tutor_dashboard/${id}/${path}`);
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
          <button onClick={() => goTo("sf_form")} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Išrašyti sąskaitą</button>
          <button onClick={() => goTo("add_lesson")} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Pridėti pamoką</button>
          <button onClick={() => goTo("grades")} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Pridėti pažymį</button>
          <a
            href="https://drive.google.com/drive/folders/1uBSRCUxunwWaXNIIeAWP8keY1O5wlzm7?usp=share_link"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 inline-block text-center"
          >
            Resursai
          </a>
          <button onClick={handleLogout} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700">Atsijungti</button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-8 py-8 grid grid-cols-1">
        <section className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Mano savaitinis prieinamumas</h2>
          <WeeklyAvailabilitySelector
            savedSlots={availability}
            onSave={loadAvailability}
          />
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 text-center py-4 text-sm text-gray-500">
        © 2025 Tiksliukai.lt
      </footer>
    </div>
  );
}
