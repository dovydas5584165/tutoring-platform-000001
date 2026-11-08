"use client";

/**
 * Admin page for adding, editing, ordering and linking tutor cards (password protected).
 */

import React, { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, KeyRound, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import TeacherProfileForm, { EMPTY_TEACHER, type TeacherFormValues } from "@/components/TeacherProfileForm";

type Teacher = TeacherFormValues & { id: string; user_id: string | null; sort_order: number; visible: boolean };
type TutorAccount = { id: string; vardas: string | null; pavarde: string | null; email: string };

const STORAGE_KEY = "admin_secret"; // shared with /admin_access_codes

/** Asks for the admin password, then manages the tutor cards. */
export default function TutorsAdmin() {
  const [secret, setSecret] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [accounts, setAccounts] = useState<TutorAccount[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [error, setError] = useState("");

  const api = useCallback(
    async (method: string, body?: unknown, path = "/api/teachers", key = secret) => {
      const res = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json", "x-admin-secret": key },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Klaida");
      return data;
    },
    [secret]
  );

  const load = useCallback(
    async (key = secret) => {
      setError("");
      try {
        const [t, a] = await Promise.all([
          api("GET", undefined, "/api/teachers?all=1", key),
          api("GET", undefined, "/api/teachers/tutor-accounts", key),
        ]);
        setTeachers(t.teachers);
        setAccounts(a.tutors);
        setLoggedIn(true);
        try { sessionStorage.setItem(STORAGE_KEY, key); } catch {}
      } catch (e) {
        setLoggedIn(false);
        setError((e as Error).message);
      }
    },
    [api, secret]
  );

  useEffect(() => {
    let saved = "";
    try { saved = sessionStorage.getItem(STORAGE_KEY) || ""; } catch {}
    if (saved) { setSecret(saved); load(saved); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const replace = (t: Teacher) => setTeachers((list) => list.map((x) => (x.id === t.id ? t : x)));

  const patch = async (body: Record<string, unknown>) => {
    setError("");
    try {
      const { teacher } = await api("PATCH", body);
      replace(teacher);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (t: Teacher) => {
    if (!confirm(`Ištrinti ${t.name} kortelę? To atšaukti nebus galima.`)) return;
    setError("");
    try {
      await api("DELETE", { id: t.id });
      setTeachers((list) => list.filter((x) => x.id !== t.id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // Swap with neighbour, then renumber the whole list 1..n (saving only cards whose number changed)
  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= teachers.length) return;
    const list = [...teachers];
    [list[i], list[j]] = [list[j], list[i]];
    const changed = list.filter((t, k) => t.sort_order !== k + 1).map((t) => ({ id: t.id, sort_order: list.indexOf(t) + 1 }));
    setTeachers(list.map((t, k) => ({ ...t, sort_order: k + 1 })));
    await Promise.all(changed.map((c) => patch(c)));
  };

  const headers = async () => ({ "x-admin-secret": secret });

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <form onSubmit={(e) => { e.preventDefault(); load(); }} className="bg-white p-8 rounded-2xl shadow w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold flex items-center gap-2"><KeyRound size={20} /> Mokytojų kortelės</h1>
          <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)}
            placeholder="Administratoriaus slaptažodis" className="w-full border rounded-lg px-3 py-2" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full bg-slate-900 text-white rounded-lg py-2 font-semibold">Prisijungti</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Mokytojų kortelės</h1>
            <p className="text-sm text-slate-500">Tai, ką mato lankytojai pradiniame puslapyje ir pamokų puslapiuose.</p>
          </div>
          {editing !== "new" && (
            <button onClick={() => setEditing("new")} className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold flex items-center gap-1">
              <Plus size={16} /> Pridėti mokytoją
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {editing === "new" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-bold text-lg mb-4">Naujas mokytojas</h2>
            <TeacherProfileForm
              initial={EMPTY_TEACHER}
              getHeaders={headers}
              saveLabel="Pridėti"
              onCancel={() => setEditing(null)}
              onSave={async (v) => {
                const { teacher } = await api("POST", v);
                setTeachers((list) => [...list, teacher]);
                setEditing(null);
              }}
            />
          </div>
        )}

        <div className="space-y-3">
          {teachers.map((t, i) => (
            <div key={t.id} className={`bg-white rounded-2xl shadow p-5 ${t.visible ? "" : "opacity-75"}`}>
              {editing === t.id ? (
                <TeacherProfileForm
                  initial={t}
                  getHeaders={headers}
                  onCancel={() => setEditing(null)}
                  onSave={async (v) => {
                    const { teacher } = await api("PATCH", { id: t.id, ...v });
                    replace(teacher);
                    setEditing(null);
                  }}
                />
              ) : (
                <div className="flex flex-wrap md:flex-nowrap items-center gap-4">
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20" title="Aukštyn"><ArrowUp size={16} /></button>
                    <button onClick={() => move(i, 1)} disabled={i === teachers.length - 1} className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20" title="Žemyn"><ArrowDown size={16} /></button>
                  </div>
                  {t.img ? (
                    <img src={t.img} alt="" className="w-14 h-14 rounded-full object-cover bg-slate-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><UserRound size={24} /></div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-[#3B65CE]">{t.subject} {t.experience && <span className="text-slate-500">· {t.experience}</span>}</p>
                    <label className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      Gali redaguoti:
                      <select value={t.user_id ?? ""} onChange={(e) => patch({ id: t.id, user_id: e.target.value || null })}
                        className="border rounded px-1 py-0.5 text-xs">
                        <option value="">— niekas (tik administratorius) —</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.id}>{[a.vardas, a.pavarde].filter(Boolean).join(" ") || a.email}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => patch({ id: t.id, visible: !t.visible })}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold ${t.visible ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
                      title={t.visible ? "Paslėpti iš svetainės" : "Rodyti svetainėje"}>
                      {t.visible ? <><Eye size={14} /> Rodoma</> : <><EyeOff size={14} /> Paslėpta</>}
                    </button>
                    <button onClick={() => setEditing(t.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-slate-50">
                      <Pencil size={14} /> Redaguoti
                    </button>
                    <button onClick={() => remove(t)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50">
                      <Trash2 size={14} /> Ištrinti
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {teachers.length === 0 && <p className="text-center text-slate-500 py-8">Kortelių dar nėra</p>}
        </div>
      </div>
    </div>
  );
}
