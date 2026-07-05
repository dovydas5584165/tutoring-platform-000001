"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1. Listen for Supabase automatically parsing the #access_token from the URL.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });

    // 2. Fallback: Check if the session was already established before the component mounted.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
      }
      
      // 3. Fallback for PKCE flow (if you ever switch to query parameters instead of hash fragments)
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("Nuoroda nebegalioja arba jau panaudota.");
        } else {
          setReady(true);
        }
      }
    };

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("Klaida: " + error.message);
    } else {
      setStatus("Slaptažodis sėkmingai atnaujintas! Dabar galite prisijungti.");
    }
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Sukurkite naują slaptažodį</h2>
      {ready ? (
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
      ) : (
        !status && <p>Tikrinama nuoroda...</p>
      )}
      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
    </div>
  );
}
