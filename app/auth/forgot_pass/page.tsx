"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // This tells Supabase to send the user to your update page on the live site
      redirectTo: "https://tiksliukai.lt/atnaujinti-slaptazodi",
    });

    if (error) {
      setStatus({ 
        type: "error", 
        message: "Nepavyko išsiųsti laiško. " + error.message 
      });
    } else {
      setStatus({ 
        type: "success", 
        message: "Nuoroda slaptažodžio atkūrimui išsiųsta į jūsų el. paštą." 
      });
    }
    setLoading(false);
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
        <h2 style={{ textAlign: "center", marginBottom: 10 }}>
          Pamiršote slaptažodį?
        </h2>
        <p style={{ textAlign: "center", color: "#666", marginBottom: 20, fontSize: 14 }}>
          Įveskite savo el. pašto adresą ir mes atsiųsime jums nuorodą.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <input
            type="email"
            placeholder="Vardas@pavyzdys.lt"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              padding: 12,
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: 12,
              backgroundColor: loading ? "#ccc" : "#0070f3",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Siunčiama..." : "Siųsti nuorodą"}
          </button>
        </form>

        {status.message && (
          <div
            style={{
              marginTop: 16,
              padding: 10,
              borderRadius: 6,
              fontSize: 14,
              textAlign: "center",
              backgroundColor: status.type === "success" ? "#e6fffa" : "#fff5f5",
              color: status.type === "success" ? "#2c7a7b" : "#c53030",
              border: `1px solid ${status.type === "success" ? "#b2f5ea" : "#feb2b2"}`,
            }}
          >
            {status.message}
          </div>
        )}

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="/prisijungti" style={{ color: "#0070f3", fontSize: 14, textDecoration: "none" }}>
            Grįžti į prisijungimą
          </a>
        </div>
      </div>
    </div>
  );
}
