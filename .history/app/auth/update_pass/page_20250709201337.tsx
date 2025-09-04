"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function parseHash(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  return {
    access_token: params.get("access_token") || "",
    refresh_token: params.get("refresh_token") || "",
  };
}

export default function UpdatePassPage() {
  const [status, setStatus] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const { access_token, refresh_token } = parseHash(hash);
      if (access_token) {
        supabase.auth
          .setSession({ access_token, refresh_token })
          .then(({ error }) => {
            if (error) setStatus("Session setup failed: " + error.message);
          });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setStatus("Įveskite naują slaptažodį");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      setStatus("Klaida keičiant slaptažodį: " + error.message);
    } else {
      setStatus("Slaptažodis sėkmingai pakeistas!");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Atnaujinkite slaptažodį</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Naujas slaptažodis"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
          disabled={loading}
        />
        <button type="submit" disabled={loading} style={{ padding: 10, width: "100%" }}>
          {loading ? "Pakeičiam..." : "Pakeisti slaptažodį"}
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}
