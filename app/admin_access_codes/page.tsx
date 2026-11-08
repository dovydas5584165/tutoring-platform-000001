"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Copy, Check, KeyRound, Plus, RefreshCw } from "lucide-react";

type AccessCode = {
  code: string;
  company: string;
  created_at: string;
  expires_at: string;
  active: boolean;
  uses: number;
};

const STORAGE_KEY = "admin_secret";
const fmt = (d: string) => new Date(d).toLocaleDateString("lt-LT");

export default function AccessCodesAdmin() {
  const [secret, setSecret] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [company, setCompany] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [months, setMonths] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");

  const api = useCallback(
    async (method: string, body?: unknown, key = secret) => {
      const res = await fetch("/api/access-codes", {
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
        const data = await api("GET", undefined, key);
        setCodes(data.codes);
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

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { code } = await api("POST", { company, months, code: customCode || undefined });
      setCompany("");
      setCustomCode("");
      setCodes((c) => [code, ...c]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const patch = async (body: Record<string, unknown>) => {
    setError("");
    try {
      const { code } = await api("PATCH", body);
      setCodes((c) => c.map((x) => (x.code === code.code ? code : x)));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const copy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 1500);
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          className="bg-white p-8 rounded-2xl shadow w-full max-w-sm space-y-4"
        >
          <h1 className="text-xl font-bold flex items-center gap-2"><KeyRound size={20} /> Prieigos kodai</h1>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Administratoriaus slaptažodis"
            className="w-full border rounded-lg px-3 py-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full bg-slate-900 text-white rounded-lg py-2 font-semibold">Prisijungti</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Karjeros testo prieigos kodai</h1>
          <button onClick={() => load()} className="text-slate-600 flex items-center gap-1 text-sm">
            <RefreshCw size={14} /> Atnaujinti
          </button>
        </div>

        <form onSubmit={create} className="bg-white rounded-2xl shadow p-6 grid gap-3 md:grid-cols-[2fr_1.5fr_1fr_auto] items-end">
          <label className="text-sm font-semibold text-slate-700">
            Įmonė
            <input value={company} onChange={(e) => setCompany(e.target.value)} required
              className="mt-1 w-full border rounded-lg px-3 py-2 font-normal" placeholder="UAB Pavyzdys" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Kodas (nebūtina)
            <input value={customCode} onChange={(e) => setCustomCode(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 font-normal" placeholder="sugeneruos automatiškai" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Galioja
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))}
              className="mt-1 w-full border rounded-lg px-3 py-2 font-normal">
              {[1, 2, 3, 6, 12].map((m) => <option key={m} value={m}>{m} mėn.</option>)}
            </select>
          </label>
          <button disabled={busy} className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold flex items-center gap-1 disabled:opacity-50">
            <Plus size={16} /> Sukurti
          </button>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-3">Kodas</th><th className="p-3">Įmonė</th><th className="p-3">Galioja iki</th>
                <th className="p-3">Būsena</th><th className="p-3">Panaudota</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => {
                const expired = new Date(c.expires_at).getTime() <= Date.now();
                const status = !c.active ? "Išjungtas" : expired ? "Pasibaigęs" : "Aktyvus";
                const color = status === "Aktyvus" ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50";
                return (
                  <tr key={c.code} className="border-t">
                    <td className="p-3 font-mono">
                      <button onClick={() => copy(c.code)} className="flex items-center gap-1 hover:text-blue-600">
                        {c.code} {copied === c.code ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </td>
                    <td className="p-3">{c.company}</td>
                    <td className="p-3">{fmt(c.expires_at)}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{status}</span></td>
                    <td className="p-3">{c.uses}</td>
                    <td className="p-3 whitespace-nowrap space-x-3 text-right">
                      <button onClick={() => patch({ code: c.code, extendMonths: 1 })} className="text-blue-600 font-semibold">+1 mėn.</button>
                      <button onClick={() => patch({ code: c.code, active: !c.active })} className="text-slate-600">
                        {c.active ? "Išjungti" : "Įjungti"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {codes.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">Kodų dar nėra</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
