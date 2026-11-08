"use client";

/**
 * Two-step contract withdrawal form (fill in, then confirm).
 */

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SERVICES = ["Individualios pamokos", "Grupinės pamokos", "Karjeros testas „Pašaukimas“"];

/** Two-step withdrawal: fill in the form, then press "Patvirtinti atsisakymą". */
export default function WithdrawalForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [contract, setContract] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [step, setStep] = useState<"form" | "confirm" | "sending" | "done">("form");
  const [error, setError] = useState("");

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 3) return setError("Įveskite vardą ir pavardę.");
    if (!EMAIL_RE.test(email.trim())) return setError("Įveskite teisingą el. paštą, į kurį atsiųsime patvirtinimą.");
    if (!service) return setError("Pasirinkite paslaugą.");
    setStep("confirm");
  };

  const confirm = async () => {
    setError("");
    setStep("sending");
    try {
      const res = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, service, contract, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Nepavyko išsiųsti. Parašykite mums el. paštu.");
      setStep("done");
    } catch (err: any) {
      setError(err.message);
      setStep("confirm");
    }
  };

  const input = "w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-[#3B65CE]";

  if (step === "done") {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-emerald-900">
        <p className="font-bold">Atsisakymas gautas.</p>
        <p className="mt-1 text-sm">
          Patvirtinimą išsiuntėme į <b>{email.trim()}</b>. Jei sumokėjote, pinigus grąžinsime ne vėliau kaip per 14 dienų
          tuo pačiu būdu, kuriuo mokėjote.
        </p>
      </div>
    );
  }

  if (step === "confirm" || step === "sending") {
    return (
      <div className="rounded-2xl border border-slate-200 p-5">
        <p className="font-bold text-slate-900">Patikrinkite ir patvirtinkite</p>
        <ul className="mt-3 text-sm">
          <li><b>Vardas:</b> {name.trim()}</li>
          <li><b>El. paštas:</b> {email.trim()}</li>
          <li><b>Paslauga:</b> {service}</li>
          {contract.trim() && <li><b>Užsakymo informacija:</b> {contract.trim()}</li>}
        </ul>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button type="button" onClick={() => setStep("form")} disabled={step === "sending"}
            className="h-12 px-5 rounded-xl border border-slate-300 font-semibold">
            Taisyti
          </button>
          <button type="button" onClick={confirm} disabled={step === "sending"}
            className="h-12 px-5 rounded-xl bg-[#3B65CE] text-white font-bold disabled:opacity-60">
            {step === "sending" ? "Siunčiama..." : "Patvirtinti atsisakymą"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={next} noValidate className="rounded-2xl border border-slate-200 p-5 flex flex-col gap-3">
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <label className="text-sm font-semibold text-slate-800">
        Vardas, pavardė (užsakovo)
        <input className={`${input} mt-1 font-normal`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <label className="text-sm font-semibold text-slate-800">
        El. paštas (patvirtinimui)
        <input className={`${input} mt-1 font-normal`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </label>
      <label className="text-sm font-semibold text-slate-800">
        Paslauga
        <select className={`${input} mt-1 font-normal`} value={service} onChange={(e) => setService(e.target.value)}>
          <option value="">Pasirinkite</option>
          {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-800">
        Užsakymo data, dalykas ar mokėjimo informacija (neprivaloma)
        <input className={`${input} mt-1 font-normal`} value={contract} onChange={(e) => setContract(e.target.value)} />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="h-12 rounded-xl bg-[#3B65CE] text-white font-bold">
        Atsisakyti sutarties
      </button>
    </form>
  );
}
