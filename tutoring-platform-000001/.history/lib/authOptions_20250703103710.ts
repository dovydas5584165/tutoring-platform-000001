"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const { data: session, status } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setErrorMsg("Neteisingi prisijungimo duomenys");
    }
    // No redirect here; wait for session status update
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    const role = session?.user?.role;
    const userId = session?.user?.id;

    if (!userId) {
      setErrorMsg("Nepavyko nustatyti vartotojo ID");
      return;
    }

    if (role === "tutor") {
      router.replace(`/tutor_dashboard/${userId}`);
    } else if (role === "client") {
      router.replace(`/student_dashboard/${userId}`);
    } else {
      router.replace("/");
    }
  }, [status, session, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 400,
          width: "100%",
          backgroundColor: "#fff",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          color: "#000",
        }}
      >
        <p
          style={{
            fontWeight: "bold",
            marginBottom: 20,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          PRISIJUNGIMAS:
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="email"
            placeholder="El. paštas"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Slaptažodis"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div style={{ textAlign: "right", marginBottom: 12 }}>
            <a
              href="/auth/forgot_pass"
              style={{ color: "#0070f3", textDecoration: "underline", fontSize: 14 }}
            >
              Užmiršau slaptažodį?
            </a>
          </div>

          <button
            type="submit"
            style={{
              padding: 12,
              backgroundColor: "#0070f3",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Prisijungti
          </button>
        </form>

        {errorMsg && (
          <p style={{ color: "red", marginTop: 10, textAlign: "center" }}>
            {errorMsg}
          </p>
        )}

        <p style={{ marginTop: 15, textAlign: "center", fontSize: 14 }}>
          Neturite paskyros?{" "}
          <a
            href="/auth/"
            style={{ color: "#0070f3", textDecoration: "underline" }}
          >
            Registracija
          </a>
        </p>
      </div>
    </div>
  );
}
