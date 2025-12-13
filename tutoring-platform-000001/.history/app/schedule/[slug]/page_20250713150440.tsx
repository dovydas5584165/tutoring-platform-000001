"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Lesson = { id: string; name: string; slug: string };
type Tutor = { id: string; name: string };
type Slot = { id: string; start_time: string; end_time: string };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Schedule() {
  const params = useSearchParams();
  const router = useRouter();
  const lessonSlug = params.get("lesson") ?? "";

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [slots, setSlots] = useState<Record<string, Slot[]>>({});
  const [loading, setLoading] = useState(true);

  /** 1) Load lesson & tutors */
  useEffect(() => {
    if (!lessonSlug) return;

    const load = async () => {
      setLoading(true);

      // fetch lesson by slug
      const { data: lessonData, error: lessonErr } = await supabase
        .from("lessons")
        .select("*")
        .eq("slug", lessonSlug)
        .single();

      if (lessonErr || !lessonData) {
        setLesson(null);
        setTutors([]);
        setLoading(false);
        return;
      }
      setLesson(lessonData as Lesson);

      // fetch tutors teaching this lesson
      const { data: tutorData } = await supabase.rpc("get_tutors_by_lesson", {
        p_lesson_id: lessonData.id,
      });
      // ^ Better: implement a Postgres function; fallback below:
      // const { data: tutorData } = await supabase
      //   .from("users")
      //   .select("id, name")
      //   .in(
      //     "id",
      //     supabase
      //       .from("users_lessons")
      //       .select("user_id", { head: true })
      //       .eq("lesson_id", lessonData.id)
      //   )
      setTutors((tutorData || []) as Tutor[]);

      // fetch availability for each tutor
      const slotMap: Record<string, Slot[]> = {};
      for (const tutor of tutorData || []) {
        const { data: av } = await supabase
          .from("availability")
          .select("id, start_time, end_time")
          .eq("user_id", tutor.id)
          .eq("is_booked", false)
          .gt("start_time", new Date().toISOString())
          .order("start_time");
        slotMap[tutor.id] = (av || []) as Slot[];
      }
      setSlots(slotMap);
      setLoading(false);
    };

    load();
  }, [lessonSlug]);

  /* handle slot click (no booking yet) */
  const selectSlot = (tutor: Tutor, slot: Slot) => {
    alert(
      `Pasirinkta: ${tutor.name}\n${new Date(
        slot.start_time
      ).toLocaleString()} – ${new Date(slot.end_time).toLocaleTimeString()}`
    );
  };

  /* UI */
  if (!lessonSlug) {
    return (
      <div className="p-6">
        <p>Nenurodytas pamokos parametras.</p>
        <button onClick={() => router.push("/")} className="text-blue-600">
          ← Grįžti
        </button>
      </div>
    );
  }

  if (loading) return <div className="p-6">Kraunama...</div>;

  if (!lesson)
    return (
      <div className="p-6">
        Pamoka “{lessonSlug}” nerasta.&nbsp;
        <button onClick={() => router.push("/")} className="text-blue-600">
          Grįžti
        </button>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="text-blue-600 mb-4">
        ← Atgal
      </button>

      <h1 className="text-3xl font-bold mb-6">{lesson.name} — Mokytojų grafikas</h1>

      {tutors.length === 0 && <p>Nėra mokytojų šiai pamokai.</p>}

      {tutors.map((t) => (
        <div key={t.id} className="mb-6 border rounded p-4 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-3">{t.name}</h2>
          {slots[t.id]?.length ? (
            <div className="flex flex-wrap gap-2">
              {slots[t.id].map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSlot(t, s)}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  {new Date(s.start_time).toLocaleString("lt-LT", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nėra laisvų laikų.</p>
          )}
        </div>
      ))}
    </div>
  );
}
