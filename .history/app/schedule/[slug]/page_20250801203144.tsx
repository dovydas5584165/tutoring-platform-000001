"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type User = {
  id: string;
  vardas: string;
  pavarde: string;
  hourly_wage: number;
};

export default function TutorSelector() {
  const { slug } = useParams(); // assuming URL is /pamokos/[slug]
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachersByLesson = async () => {
      setLoading(true);

      // 1. Get lesson ID by slug (slug is lesson name)
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

      // 2. Get tutor IDs who teach this lesson
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

      // 3. Fetch tutors' info
      const { data: tutorsData, error: tutorsError } = await supabase
        .from("users")
        .select("id, vardas, pavarde, hourly_wage")
        .eq("role", "tutor")
        .in("id", tutorIds);

      if (tutorsError) {
        console.error("❌ Klaida gaunant mokytojus:", tutorsError.message);
        setTeachers([]);
        setLoading(false);
        return;
      }

      setTeachers(tutorsData || []);
      setLoading(false);
    };

    if (slug) {
      fetchTeachersByLesson();
    }
  }, [slug]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Pasirink mokytoją</h2>
      {loading ? (
        <p>Kraunama...</p>
      ) : teachers.length === 0 ? (
        <p>Šiai pamokai nėra mokytojų.</p>
      ) : (
        <ul className="space-y-2">
          {teachers.map((tutor) => (
            <li
              key={tutor.id}
              className="border p-3 rounded-xl shadow hover:bg-gray-50"
            >
              <p>
                {tutor.vardas} {tutor.pavarde}
              </p>
              <p className="text-sm text-gray-600">
                Kaina: €{tutor.hourly_wage}/val
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
