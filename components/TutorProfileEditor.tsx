"use client";

/**
 * Tutor dashboard panel: edit your own card shown on the website.
 */

import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import TeacherProfileForm, { EMPTY_TEACHER, type TeacherFormValues } from "./TeacherProfileForm";

type Profile = TeacherFormValues & { id: string; visible: boolean };

/** Bearer token of the logged-in tutor for API calls. */
async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Tutor dashboard panel: the tutor edits their own card shown on the website. */
export default function TutorProfileEditor() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [suggestedName, setSuggestedName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teachers/me", { headers: await authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Nepavyko užkrauti profilio");
        setProfile(data.teacher);
        setSuggestedName(data.suggestedName || "");
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async (v: TeacherFormValues) => {
    const res = await fetch("/api/teachers/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify(v),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Nepavyko išsaugoti");
    setProfile(data.teacher);
    setEditing(false);
    setFlash("Išsaugota!");
    setTimeout(() => setFlash(""), 3000);
  };

  return (
    <section className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold mb-6 border-b pb-3 flex items-center justify-between">
        Mano profilis svetainėje
        {profile && !editing && (
          <button onClick={() => setEditing(true)} className="text-sm font-semibold text-blue-600 flex items-center gap-1">
            <Pencil size={14} /> Redaguoti
          </button>
        )}
      </h2>

      {loading ? (
        <p className="text-slate-400 flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Kraunama...</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : editing || !profile ? (
        <>
          {!profile && !editing && (
            <p className="text-slate-600 mb-4">
              Jūsų kortelės svetainėje dar nėra. Užpildykite ją – po peržiūros administratorius ją paskelbs.
            </p>
          )}
          <TeacherProfileForm
            initial={profile ?? { ...EMPTY_TEACHER, name: suggestedName }}
            getHeaders={authHeaders}
            onSave={save}
            onCancel={profile ? () => setEditing(false) : undefined}
            saveLabel={profile ? "Išsaugoti" : "Sukurti profilį"}
          />
        </>
      ) : (
        <div className="flex items-start gap-5">
          {profile.img ? (
            <img src={profile.img} alt="" className="w-20 h-20 rounded-full object-cover bg-slate-100" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><UserRound size={32} /></div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-lg">{profile.name}</p>
            <p className="text-sm text-[#3B65CE] font-medium">{profile.subject}</p>
            <p className="text-xs text-slate-500 mb-2">Patirtis: {profile.experience || "–"}</p>
            <p className="text-sm text-slate-600 whitespace-pre-line">{profile.description}</p>
            <p className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${profile.visible ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
              {profile.visible ? <><Eye size={12} /> Rodoma svetainėje</> : <><EyeOff size={12} /> Laukia administratoriaus patvirtinimo</>}
            </p>
            {flash && <p className="text-sm text-green-600 mt-2">{flash}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
