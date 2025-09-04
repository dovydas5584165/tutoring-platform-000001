"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type User = {
  id: string;
  vardas: string;
  pavarde: string;
  hourly_wage: number;
};

export default function ScheduleLanding() {
  const { slug } = useParams();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);

      // 1. Get lesson_id from lessons table by name (slug)
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("id")
        .eq("name", slug)
        .single();

      if (lessonError || !lessonData) {
        console.error("❌ Klaida gaunant pamoką:", lessonError?.message);
        setTeachers([]);
        setLoading(false);
        return;
      }

      const lessonId = lessonData.id;

      // 2. Get user IDs from user_lessons
      const { data: userLessonsData, error: ulError } = await supabase
        .from("user_lessons")
        .select("user_id")
        .eq("lesson_id", lessonId);

      if (ulError || !userLessonsData) {
        console.error("❌ Klaida gaunant user_lessons:", ulError?.message);
        setTeachers([]);
        setLoading(false);
        return;
      }

      const tutorIds = userLessonsData.map((ul) => ul.user_id);

      if (tutorIds.length === 0) {
        setTeachers([]);
        setLoading(false);
        return;
      }

      // 3. Get all tutors
      const { data: tutorsData, error: tutorsError } = await supabase
        .from("users")
        .select("id, vardas, pavarde, hourly_wage")
        .eq("role", "tutor");

      if (tutorsError || !tutorsData) {
        console.error("❌ Klaida gaunant mokytojus:", tutorsError?.message);
        setTeachers([]);
        setLoading(false);
        return;
      }

      // 4. Filter tutors who match lesson
      const filteredTutors = tutorsData.filter((tutor) =>
        tutorIds.includes(tutor.id)
      );

      setTeachers(filteredTutors);
      setLoading(false);
    };

    if (slug) {
      fetchTutors();
    }
  }, [slug]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Pasirink mokytoją</h2>
      {loading ? (
        <p>Kraunama...</p>
      ) : teachers.length === 0 ? (
        <p>Šiai pamokai šiuo metu nėra mokytojų.</p>
      ) : (
        <ul className="grid gap-4">
          {teachers.map((tutor) => (
            <li
              key={tutor.id}
              className="border p-4 rounded-xl shadow hover:bg-gray-50 transition"
            >
              <div className="text-lg font-medium">
                {tutor.vardas} {tutor.pavarde}
              </div>
              <div className="text-gray-600 text-sm">
                Kaina: €{tutor.hourly_wage}/val
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
