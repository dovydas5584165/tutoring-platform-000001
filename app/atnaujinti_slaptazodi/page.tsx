"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // This function takes the active session from the URL and updates the user
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setStatus("Klaida: " + error.message);
    } else {
      setStatus("Slaptažodis sėkmingai atnaujintas! Dabar galite prisijungti.");
    }
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Sukurkite naują slaptažodį</h2>
      <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 300, margin: "0 auto" }}>
        <input
          type="password"
          placeholder="Naujas slaptažodis"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 10 }}
        />
        <button type="submit" style={{ padding: 10, backgroundColor: "#0070f3", color: "#fff", border: "none" }}>
          Atnaujinti
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
