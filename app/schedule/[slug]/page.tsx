"use client";

/**
 * Subject page: tutor cards and the lesson request form (client picks 5+ times, a tutor picks one).
 */

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import LessonRequestForm from "@/components/LessonRequestForm";
import { useTeachers } from "@/lib/useTeachers";

// ---------- MAIN PAGE COMPONENT ----------

/** Subject page for the subject in the URL. */
export default function ScheduleLanding() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);
  const { teachers: TEACHERS } = useTeachers();

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans px-6 py-10 max-w-5xl mx-auto">
      <header className="mb-8">
        {/* Teachers Section */}
        <motion.section
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="w-full flex flex-col justify-center items-center bg-white snap-start px-6 py-16 mb-8"
>
  <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center">Mūsų Mokytojai</h2>
  
  <div className="flex gap-8 justify-center flex-wrap max-w-6xl mx-auto">
    {TEACHERS.map((teacher, i) => (
      <div
        key={i}
        className="w-72 bg-blue-50 rounded-2xl shadow-xl p-6 hover:scale-105 transition-transform duration-300 flex flex-col items-center"
      >
        <img
          src={teacher.img}
          alt={teacher.name}
          className="h-40 w-40 object-cover rounded-full mb-4"
        />
        <h3 className="text-xl font-bold mb-2 text-center">{teacher.name}</h3>
        <p className="text-gray-600 text-sm text-center mb-2">
          Specializacija: {teacher.subject} <br /> Patirtis: {teacher.experience}
        </p>
        <p className="text-gray-700 text-sm text-center">{teacher.description}</p>
      </div>
    ))}
  </div>
</motion.section>

        <h1 className="text-3xl font-bold mb-4 capitalize">Pamokos: {slug}</h1>

      </header>

      {/* Klientas pažymi bent 5 laikus, mokytojas pasirenka vieną */}
      <LessonRequestForm subject={slug} />

    </div>
  );
}
