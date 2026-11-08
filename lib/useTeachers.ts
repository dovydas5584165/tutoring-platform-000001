"use client";

import { useEffect, useState } from "react";
import { FALLBACK_TEACHERS, type TeacherCard } from "./teachers";

/** Visible tutor cards from the database; falls back to the built-in list if the request fails. */
export function useTeachers() {
  const [teachers, setTeachers] = useState<TeacherCard[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/teachers")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!alive) return;
        setTeachers((d.teachers as Array<TeacherCard & { img: string | null }>).map((t) => ({ ...t, img: t.img || "" })));
      })
      .catch(() => alive && setTeachers(FALLBACK_TEACHERS));
    return () => { alive = false; };
  }, []);

  return { teachers: teachers ?? [], loading: teachers === null };
}
