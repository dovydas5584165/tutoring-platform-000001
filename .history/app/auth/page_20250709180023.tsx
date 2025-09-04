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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-black">
        <h1 className="text-center font-bold mb-6 text-2xl">REGISTRACIJA:</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <select
            className="border rounded p-2"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Pasirinkite rolę</option>
            <option value="tutor">Mokytojas</option>
            <option value="client">Klientas</option>
          </select>

          {role === "client" && (
            <input
              className="border rounded p-2"
              type="text"
              placeholder="Vaiko vardas"
              value={vaikoVardas}
              onChange={(e) => setVaikoVardas(e.target.value)}
              required
            />
          )}

          <input
            className="border rounded p-2"
            type="text"
            placeholder="Vardas"
            value={vardas}
            onChange={(e) => setVardas(e.target.value)}
            required
          />
          <input
            className="border rounded p-2"
            type="text"
            placeholder="Pavardė"
            value={pavarde}
            onChange={(e) => setPavarde(e.target.value)}
            required
          />

          <fieldset className="border rounded p-2 mb-1">
            <legend className="font-bold">Pasirinkite pamokas:</legend>
            {["Matematika", "Anglų kalba", "Programavimas", "Fizika"].map(
              (lesson) => (
                <label key={lesson} className="block cursor-pointer">
                  <input
                    type="checkbox"
                    value={lesson}
                    checked={pamokos.includes(lesson)}
                    onChange={handlePamokosChange}
                    className="mr-2"
                  />
                  {lesson}
                </label>
              )
            )}
          </fieldset>

          <input
            className="border rounded p-2"
            type="email"
            placeholder="El. paštas"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="border rounded p-2"
            type="password"
            placeholder="Slaptažodis"
            value={slaptazodis}
            onChange={(e) => setSlaptazodis(e.target.value)}
            required
          />
          <input
            className="border rounded p-2"
            type="password"
            placeholder="Pakartokite slaptažodį"
            value={repeatSlaptazodis}
            onChange={(e) => setRepeatSlaptazodis(e.target.value)}
            required
          />

          <button
            type="submit"
            className="mt-2 p-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
          >
            Užsiregistruoti
          </button>
        </form>

        {errorMsg && (
          <p className="text-center text-red-600 mt-3">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="text-center text-green-600 mt-3">{successMsg}</p>
        )}

        <p className="text-center text-sm mt-5">
          Jau turite paskyrą?{" "}
          <a href="/auth/log-in" className="text-blue-600 underline">
            Prisijunkite
          </a>
        </p>
      </div>
    </div>
  );
}
