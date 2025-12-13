"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  email: string;
  vardas: string;
  pavarde: string;
};

export default function TutorForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [vardas, setVardas] = useState("");
  const [pavarde, setPavarde] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch users on mount
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, vardas, pavarde")
        .eq("role", "client") // optional filter
        .order("email", { ascending: true });

      if (error) {
        console.error("Error fetching users:", error.message);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setUsers(data);
        setSelectedUserId(data[0].id); // select first user by default
      } else {
        setUsers([]);
        setSelectedUserId("");
      }
      setLoading(false);
    }

    fetchUsers();
  }, []);

  // Update vardas and pavarde when selectedUserId changes
  useEffect(() => {
    if (!selectedUserId) {
      setVardas("");
      setPavarde("");
      return;
    }

    const user = users.find((u) => u.id === selectedUserId);
    if (user) {
      setVardas(user.vardas);
      setPavarde(user.pavarde);
    }
  }, [selectedUserId, users]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-4 font-bold">Pasirinkite vartotoją</h2>

      <label className="block mb-4">
        Kliento el. paštas:
        <select
          className="w-full border rounded p-2 mt-1"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          {users.length === 0 && <option disabled>Nėra klientų</option>}
          {users.map(({ id, email, vardas, pavarde }) => (
            <option key={id} value={id}>
              {email} ({vardas} {pavarde})
            </option>
          ))}
        </select>
      </label>

      <label className="block mb-4">
        Vardas:
        <input
          type="text"
          value={vardas}
          onChange={(e) => setVardas(e.target.value)}
          className="w-full border rounded p-2 mt-1"
        />
      </label>

      <label className="block mb-4">
        Pavardė:
        <input
          type="text"
          value={pavarde}
          onChange={(e) => setPavarde(e.target.value)}
          className="w-full border rounded p-2 mt-1"
        />
      </label>
    </div>
  );
}
