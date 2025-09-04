"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { format, isSameDay, parseISO, addDays } from "date-fns";
import { lt } from "date-fns/locale";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type Availability = {
  id: string;
  user_id: string;
  day: string;
  hour: string;
};

type User = {
  id: string;
  vardas: string;
  pavarde: string;
  hourly_wage: number;
};

export default function ScheduleLanding() {
  const { slug } = useParams();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Fetch tutors who teach this lesson
  useEffect(() => {
    const fetchTeachersByLesson = async () => {
      setLoading(true);

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

      const { data: userLessonsData, error: userLessonsError } = await supabase
        .from("user_lessons")
        .select("user_id")
        .eq("lesson_id", lessonId);

      if (userLessonsError || !userLessonsData) {
        console.error("❌ Klaida gaunant user_lessons:", userLessonsError?.message);
        setTeachers([]);
        setLoading(false);
        return;
      }

      const userIds = userLessonsData.map((ul) => ul.user_id);

      if (userIds.length === 0) {
        setTeachers([]);
        setLoading(false);
        return;
      }

      const { data: tutorsData, error: tutorsError } = await supabase
        .from("users")
        .select("id, vardas, pavarde, hourly_wage")
        .eq("role", "tutor")
        .in("id", userIds);

      if (tutorsError || !tutorsData) {
        console.error("❌ Klaida gaunant mokytojus:", tutorsError?.message);
        setTeachers([]);
        setLoading(false);
        return;
      }

      setTeachers(tutorsData);
      setLoading(false);
    };

    if (slug) {
      fetchTeachersByLesson();
    }
  }, [slug]);

  // Fetch availability when a tutor is selected
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedTeacher) return;

      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("user_id", selectedTeacher.id);

      if (error) {
        console.error("❌ Klaida gaunant prieinamumą:", error.message);
        setAvailabilities([]);
        return;
      }

      setAvailabilities(data || []);
    };

    fetchAvailability();
  }, [selectedTeacher]);

  // Get all unique days this tutor is available
  const availableDays = Array.from(
    new Set(availabilities.map((a) => a.day))
  ).map((day) => parseISO(day));

  // Get time slots for selected day
  const timeSlots =
    selectedDay && selectedTeacher
      ? availabilities
          .filter(
            (a) =>
              a.user_id === selectedTeacher.id &&
              isSameDay(parseISO(a.day), selectedDay)
          )
          .map((a) => a.hour)
      : [];

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 capitalize">{slug}</h2>

      {loading ? (
        <p>Kraunama...</p>
      ) : teachers.length === 0 ? (
        <p>Šiai pamokai mokytojų nerasta.</p>
      ) : (
        <>
          <label className="block mb-2 font-medium">Pasirink mokytoją:</label>
          <select
            className="mb-4 p-2 border rounded w-full"
            value={selectedTeacher?.id || ""}
            onChange={(e) => {
              const selected = teachers.find((t) => t.id === e.target.value);
              setSelectedTeacher(selected || null);
              setSelectedDay(undefined); // reset day
            }}
          >
            <option value="">-- Rodyti visus --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.vardas} {t.pavarde} – €{t.hourly_wage}/val
              </option>
            ))}
          </select>
        </>
      )}

      {selectedTeacher && (
        <>
          <label className="block mb-2 font-medium">Pasirink datą:</label>
          <DayPicker
            mode="single"
            locale={lt}
            selected={selectedDay}
            onSelect={setSelectedDay}
            fromDate={new Date()}
            toDate={addDays(new Date(), 30)}
            modifiers={{ available: availableDays }}
            modifiersClassNames={{ available: "bg-blue-100" }}
            disabled={(date) =>
              !availableDays.some((d) => isSameDay(d, date))
            }
          />
        </>
      )}

      {selectedDay && timeSlots.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Galimi laikai:</h3>
          <ul className="grid grid-cols-2 gap-2">
            {timeSlots.map((time) => (
              <li
                key={time}
                className="p-2 border rounded text-center hover:bg-gray-100 cursor-pointer"
              >
                {time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
