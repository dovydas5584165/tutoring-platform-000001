"use client";

/**
 * Edit form for one tutor card with photo upload and live preview.
 */

import React, { useRef, useState } from "react";
import { Camera, Loader2, Trash2, UserRound } from "lucide-react";

export type TeacherFormValues = {
  name: string;
  subject: string;
  experience: string;
  description: string;
  img: string | null;
};

export const EMPTY_TEACHER: TeacherFormValues = { name: "", subject: "", experience: "", description: "", img: null };

/** Shrinks a photo in the browser (phone photos are often 5–10 MB) to a square-ish webp ≤ 800px. */
async function shrinkImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Nepavyko apdoroti nuotraukos"))), "image/webp", 0.85)
  );
}

type Props = {
  initial: TeacherFormValues;
  /** Headers for the photo upload request (admin secret or tutor bearer token). */
  getHeaders: () => Promise<Record<string, string>>;
  onSave: (values: TeacherFormValues) => Promise<void>;
  onCancel?: () => void;
  saveLabel?: string;
};

/** Edit form for one tutor card, with a live preview of how it looks on the site. */
export default function TeacherProfileForm({ initial, getHeaders, onSave, onCancel, saveLabel = "Išsaugoti" }: Props) {
  const [v, setV] = useState<TeacherFormValues>(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof TeacherFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((x) => ({ ...x, [k]: e.target.value }));

  const upload = async (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) return setError("Pasirinkite nuotrauką (JPG, PNG, WEBP).");
    setUploading(true);
    try {
      const blob = await shrinkImage(file).catch(() => file);
      const form = new FormData();
      form.append("file", blob, "photo.webp");
      const res = await fetch("/api/teachers/photo", { method: "POST", headers: await getHeaders(), body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Nepavyko įkelti nuotraukos");
      setV((x) => ({ ...x, img: data.url }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.name.trim()) return setError("Įveskite vardą ir pavardę.");
    setSaving(true);
    setError("");
    try {
      await onSave(v);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const input = "mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form onSubmit={submit} className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {v.img ? (
            <img src={v.img} alt="" className="w-24 h-24 rounded-full object-cover bg-slate-100" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><UserRound size={40} /></div>
          )}
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-semibold disabled:opacity-50">
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              {uploading ? "Įkeliama..." : v.img ? "Pakeisti nuotrauką" : "Įkelti nuotrauką"}
            </button>
            {v.img && (
              <button type="button" onClick={() => setV((x) => ({ ...x, img: null }))}
                className="flex items-center gap-2 text-sm text-red-600 hover:underline">
                <Trash2 size={14} /> Pašalinti nuotrauką
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </div>
        </div>

        <label className="block text-sm font-semibold text-slate-700">
          Vardas ir pavardė
          <input value={v.name} onChange={set("name")} className={input} placeholder="Vardenis Pavardenis" required />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Dalykai
            <input value={v.subject} onChange={set("subject")} className={input} placeholder="Matematika, fizika" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Patirtis
            <input value={v.experience} onChange={set("experience")} className={input} placeholder="3 metai" />
          </label>
        </div>
        <label className="block text-sm font-semibold text-slate-700">
          Aprašymas
          <textarea value={v.description} onChange={set("description")} rows={5} maxLength={1500} className={input}
            placeholder="Keli sakiniai apie save: ką studijuojate, kaip mokote..." />
          <span className="text-xs font-normal text-slate-400">{v.description.length}/1500</span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button disabled={saving || uploading} className="bg-blue-600 text-white rounded-lg px-5 py-2 font-semibold disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 size={16} className="animate-spin" />} {saveLabel}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Atšaukti</button>
          )}
        </div>
      </div>

      {/* Live preview, same look as the home page card */}
      <div>
        <p className="text-xs uppercase tracking-wide font-semibold text-slate-400 mb-2">Taip atrodys svetainėje</p>
        <article className="rounded-2xl border border-slate-200 p-5 bg-white">
          <div className="flex items-center gap-4 mb-3">
            {v.img ? (
              <img src={v.img} alt="" className="w-16 h-16 rounded-full object-cover bg-slate-100" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100" />
            )}
            <div className="min-w-0">
              <p className="font-bold leading-tight">{v.name || "Vardas Pavardė"}</p>
              <p className="text-sm text-[#3B65CE] font-medium">{v.subject || "Dalykai"}</p>
              <p className="text-xs text-slate-500">Patirtis: {v.experience || "–"}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{v.description || "Aprašymas..."}</p>
        </article>
      </div>
    </form>
  );
}
