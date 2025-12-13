"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "tutor" | "client";

export default function Registration() {
  const [email, setEmail] = useState("");
  const [slaptazodis, setSlaptazodis] = useState("");
  const [pakartotiSlaptazodi, setPakartotiSlaptazodi] = useState("");
  const [vardas, setVardas] = useState("");
  const [pavarde, setPavarde] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [vaikoVardas, setVaikoVardas] = useState("");
  const [pamokos, setPamokos] = useState<string[]>([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handlePamokosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setPamokos((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // Trim inputs for safety
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedVardas = vardas.trim();
    const trimmedPavarde = pavarde.trim();
    const trimmedVaikoVardas = vaikoVardas.trim();

    if (!role) {
      setErrorMessage("Pasirinkite rolę");
      return;
    }

    if (role === "client" && trimmedVaikoVardas === "") {
      setErrorMessage("Vaiko vardas yra privalomas klientui");
      return;
    }

    if (slaptazodis !== pakartotiSlaptazodi) {
      setErrorMessage("Slaptažodžiai nesutampa");
      return;
    }

    if (pamokos.length === 0) {
      setErrorMessage("Pasirinkite bent vieną pamoką");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vardas: trimmedVardas,
          pavarde: trimmedPavarde,
          pamokos,
          role,
          email: trimmedEmail,
          slaptazodis,
          // match backend key exactly
          ...(role === "client" && { vaikovardas: trimmedVaikoVardas }),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || "Registracija sėkminga");
        setErrorMessage("");
        // Redirect after short delay for UX
        setTimeout(() => {
          if (data.role === "client") {
            router.push(`/client/${data.userId}`);
          } else {
            router.push(`/tutor/${data.userId}`);
          }
        }, 2000);
      } else {
        setErrorMessage(data.message || "Klaida registruojantis");
        setSuccessMessage("");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Serverio klaida");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <div>
        <label htmlFor="email">El. paštas:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="vardas">Vardas:</label>
        <input
          id="vardas"
          type="text"
          value={vardas}
          onChange={(e) => setVardas(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="pavarde">Pavardė:</label>
        <input
          id="pavarde"
          type="text"
          value={pavarde}
          onChange={(e) => setPavarde(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <fieldset>
        <legend>Rolė:</legend>
        <label>
          <input
            type="radio"
            name="role"
            value="tutor"
            checked={role === "tutor"}
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={loading}
          />
          Mokytojas
        </label>
        <label>
          <input
            type="radio"
            name="role"
            value="client"
            checked={role === "client"}
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={loading}
          />
          Klientas
        </label>
      </fieldset>

      {role === "client" && (
        <div>
          <label htmlFor="vaikoVardas">Vaiko vardas:</label>
          <input
            id="vaikoVardas"
            type="text"
            value={vaikoVardas}
            onChange={(e) => setVaikoVardas(e.target.value)}
            required={role === "client"}
            disabled={loading}
          />
        </div>
      )}

      <fieldset>
        <legend>Pasirinkite pamokas:</legend>
        {["Matematika", "Fizika", "Chemija"].map((lesson) => (
          <label key={lesson}>
            <input
              type="checkbox"
              name="pamokos"
              value={lesson}
              checked={pamokos.includes(lesson)}
              onChange={handlePamokosChange}
              disabled={loading}
            />
            {lesson}
          </label>
        ))}
      </fieldset>

      <div>
        <label htmlFor="slaptazodis">Slaptažodis:</label>
        <input
          id="slaptazodis"
          type="password"
          value={slaptazodis}
          onChange={(e) => setSlaptazodis(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />
      </div>

      <div>
        <label htmlFor="pakartotiSlaptazodi">Pakartoti slaptažodį:</label>
        <input
          id="pakartotiSlaptazodi"
          type="password"
          value={pakartotiSlaptazodi}
          onChange={(e) => setPakartotiSlaptazodi(e.target.value)}
          required
          disabled={loading}
          minLength={6}
        />
      </div>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Registracija..." : "Registruotis"}
      </button>
    </form>
  );
}
