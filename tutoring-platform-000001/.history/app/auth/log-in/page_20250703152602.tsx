"use client";

import { useState, useEffect } from "react";
import { signIn, useSession }  from "next-auth/react";
import { useRouter }           from "next/navigation";

export default function LoginPage() {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [errorMsg, setErrorMsg]     = useState("");

  const router                      = useRouter();
  const { data: session, status }   = useSession();   // live session

  /* ─── redirect AFTER session becomes authenticated ─── */
  useEffect(() => {
    if (status !== "authenticated") return;

    const { id, role } = session!.user;

    if (role === "tutor")   router.replace(`/tutor_dashboard/${id}`);
    else if (role === "client") router.replace(`/student_dashboard/${id}`);
    else                     router.replace("/");
  }, [status, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) setErrorMsg("Neteisingi prisijungimo duomenys");
  }

  /* --- UI ---------------------------------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow p-6 rounded-xl space-y-4"
      >
        <h1 className="text-xl font-bold text-center">PRISIJUNGIMAS</h1>

        <input
          type="email"
          placeholder="El. paštas"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded p-2 w-full"
        />

        <input
          type="password"
          placeholder="Slaptažodis"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded p-2 w-full"
        />

        {errorMsg && <p className="text-red-600 text-center">{errorMsg}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
        >
          Prisijungti
        </button>

        <p className="text-sm text-center">
          Neturite paskyros?{" "}
          <a className="text-blue-600 underline" href="/auth">
            Registracija
          </a>
        </p>
      </form>
    </div>
  );
}
