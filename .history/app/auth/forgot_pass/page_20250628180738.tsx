"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setStatus("Nepavyko išsiųsti laiško. Patikrinkite el. paštą.");
    } else {
      setStatus("Nuoroda slaptažodžio atkūrimui išsiųsta.");
    }
  };

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
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Pamiršote slaptažodį?
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="email"
            placeholder="Įveskite el. paštą"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: 10,
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />

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
            Siųsti nuorodą
          </button>
        </form>

        {status && (
          <p
            style={{
              marginTop: 12,
              textAlign: "center",
              color: status.startsWith("Nuoroda") ? "green" : "red",
            }}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
