"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistracijaPage() {
  const [vardas, setVardas] = useState("");
  const [pavarde, setPavarde] = useState("");
  const [vaikoVardas, setVaikoVardas] = useState("");
  const [pamokos, setPamokos] = useState<string[]>([]);
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [slaptazodis, setSlaptazodis] = useState("");
  const [repeatSlaptazodis, setRepeatSlaptazodis] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const lessonsList = [
    "Matematika",
    "Anglų kalba",
    "Programavimas",
    "Fizika",
    "Biologija",
    "Chemija",
  ];

  const handlePamokosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setPamokos((prev) =>
      checked ? [...prev, value] : prev.filter((x) => x !== value)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!role) return setErrorMsg("Prašome pasirinkti rolę.");
    if (role === "client" && !vaikoVardas.trim())
      return setErrorMsg("Prašome įvesti vaiko vardą.");
    if (slaptazodis !== repeatSlaptazodis)
      return setErrorMsg("Slaptažodžiai nesutampa");
    if (pamokos.length === 0)
      return setErrorMsg("Prašome pasirinkti bent vieną pamoką.");

    const body = JSON.stringify({
      vardas,
      pavarde,
      pamokos,
      role,
      email,
      slaptazodis,
      ...(role === "client" && { vaikoVardas }),
    });

    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const data = await res.json();

      if (!res.ok) return setErrorMsg(data.message ?? "Registracijos klaida");

      setSuccessMsg("Registracija sėkminga! Nukreipiame...");
      setTimeout(() => {
        if (data.userId) {
          router.push(
            role === "tutor"
              ? `/tutor_dashboard/${data.userId}`
              : `/student_dashboard/${data.userId}`
          );
        } else {
          router.push("/auth/log-in");
        }
      }, 2000);
    } catch {
      setErrorMsg("Serverio klaida");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-xl border border-blue-300">
        <h1 className="text-center text-4xl font-extrabold mb-8 text-black tracking-wide drop-shadow-sm">
          REGISTRACIJA
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-black">
          <select
            className="border border-blue-300 rounded-lg px-4 py-3 text-lg placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="" disabled>
              Pasirinkite rolę
            </option>
            <option value="tutor">Mokytojas</option>
            <option value="client">Klientas</option>
          </select>

          {role === "client" && (
            <input
              className="border border-blue-300 rounded-lg px-4 py-3 text-lg placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              type="text"
              placeholder="Vaiko vardas"
              value={vaikoVardas}
              onChange={(e) => setVaikoVardas(e.target.value)}
              required
              autoComplete="off"
            />
          )}

          <input
            className="border border-blue-300 rounded-lg px-4 py-3 text-lg placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="text"
            placeholder="Vardas"
            value={vardas}
            onChange={(e) => setVardas(e.target.value)}
            required
            autoComplete="given-name"
          />
          <input
            className="border border-blue-300 rounded-lg px-4 py-3 text-lg placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="text"
            placeholder="Pavardė"
            value={pavarde}
            onChange={(e) => setPavarde(e.target.value)}
            required
            autoComplete="family-name"
          />

          <fieldset className="border border-blue-300 rounded-lg p-4 text-black">
            <legend className="font-semibold mb-3 select-none">
              Pasirinkite pamokas:
            </legend>
            <div className="grid grid-cols-2 gap-3">
              {lessonsList.map((lesson) => {
                const slug = slugify(lesson);
                return (
                  <label
                    key={slug}
                    className="flex items-center cursor-pointer space-x-3 hover:text-black transition"
                  >
                    <input
                      type="checkbox"
                      value={slug}
                      checked={pamokos.includes(slug)}
                      onChange={handlePamokosChange}
                      className="h-5 w-5 rounded border-blue-400 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="select-none">{lesson}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <input
            className="border border-blue-300 rounded-lg px-4 py-3 text-lg placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="email"
            placeholder="El. paštas"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="border border-blue-300 rounded-lg px-4 py-3 text-lg placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="password"
            placeholder="Slaptažodis"
            value={slaptazodis}
            onChange={(e) => setSlaptazodis(e.target.value)}
            required
            autoComplete="new-password"
          />
          <input
            className="border border-blue-300 rounded-lg px-4 py-3 text-lg placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            type="password"
            placeholder="Pakartokite slaptažodį"
            value={repeatSlaptazodis}
            onChange={(e) => setRepeatSlaptazodis(e.target.value)}
            required
            autoComplete="new-password"
          />

          <button
            type="submit"
            className="mt-4 py-3 rounded-lg bg-blue-700 text-white font-semibold text-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
          >
            Užsiregistruoti
          </button>
        </form>

        {errorMsg && (
          <p className="mt-6 text-center text-black font-semibold animate-fadeIn">
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p className="mt-6 text-center text-black font-semibold animate-fadeIn">
            {successMsg}
          </p>
        )}

        <p className="mt-8 text-center text-sm text-black">
          Jau turite paskyrą?{" "}
          <a
            href="/auth/log-in"
            className="font-semibold underline hover:text-black transition"
          >
            Prisijunkite
          </a>
        </p>
      </div>
    </div>
  );
}
