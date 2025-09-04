"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { format, parseISO } from "date-fns";
import { lt } from "date-fns/locale";

type Availability = {
  id: number;
  user_id: string; // tutor id
  start_time: string;
  is_booked: boolean;
};

type Teacher = {
  id: string;
  vardas: string;
  pavarde: string;
  hourly_wage: number;
};

export default function PaymentPage() {
  const router = useRouter();
  const [bookedSlots, setBookedSlots] = useState<Availability[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Get current user from Supabase auth
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Jūs turite prisijungti, kad tęstumėte mokėjimą.");
        router.push("/login"); // Redirect to login page if no user
        return;
      }

      try {
        // Fetch all tutors
        const { data: teacherData, error: teacherError } = await supabase
          .from("users")
          .select("id, vardas, pavarde, hourly_wage")
          .eq("role", "tutor");

        if (teacherError) {
          console.error("Klaida gaunant mokytojus:", teacherError.message);
          setTeachers([]);
        } else {
          setTeachers(teacherData || []);
        }

        // Fetch all availability slots booked by the current user (assuming you save booking user id somewhere)
        // Here I assume availability table has a "booked_by" column with user.id who booked the slot.
        const { data: bookedData, error: bookedError } = await supabase
          .from("availability")
          .select("id, user_id, start_time, is_booked")
          .eq("is_booked", true)
          .eq("booked_by", user.id) // adjust this if your schema differs
          .order("start_time", { ascending: true });

        if (bookedError) {
          console.error("Klaida gaunant užsakytas pamokas:", bookedError.message);
          setBookedSlots([]);
        } else {
          setBookedSlots(bookedData || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const totalPrice = bookedSlots.reduce((total, slot) => {
    const teacher = teachers.find((t) => t.id === slot.user_id);
    if (!teacher) return total;
    return total + teacher.hourly_wage * 0.75; // 45min lesson
  }, 0);

  const handlePay = () => {
    setPaymentLoading(true);

    // TODO: Integrate payment provider here (Stripe, Apple Pay, etc)

    setTimeout(() => {
      alert("Mokėjimas sėkmingai atliktas! Ačiū.");
      setPaymentLoading(false);
      router.push("/"); // redirect home or to thank you page
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-center">Apmokėjimas</h1>

      {loading ? (
        <p className="text-center text-gray-600">Kraunama jūsų pamokos...</p>
      ) : bookedSlots.length === 0 ? (
        <p className="text-center text-gray-600">
          Neturite užsakytų pamokų mokėjimui.
        </p>
      ) : (
        <>
          <ul className="mb-6 space-y-4">
            {bookedSlots.map((slot) => {
              const teacher = teachers.find((t) => t.id === slot.user_id);
              return (
                <li
                  key={slot.id}
                  className="flex justify-between border rounded p-4 shadow"
                >
                  <div>
                    <p className="font-semibold">
                      {format(parseISO(slot.start_time), "yyyy-MM-dd HH:mm", {
                        locale: lt,
                      })}
                    </p>
                    <p className="text-gray-600">
                      {teacher?.vardas} {teacher?.pavarde}
                    </p>
                  </div>
                  <div className="font-bold text-blue-700">
                    €
                    {teacher ? (teacher.hourly_wage * 0.75).toFixed(2) : "0.00"}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="text-right font-bold text-xl mb-8">
            Iš viso: €{totalPrice.toFixed(2)}
          </div>

          <button
            onClick={handlePay}
            disabled={paymentLoading}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {paymentLoading ? "Apdorojama..." : "Apmokėti"}
          </button>

          <button
            onClick={() => router.push("/")}
            disabled={paymentLoading}
            className="mt-4 w-full border border-gray-400 rounded py-2 hover:bg-gray-100"
          >
            Grįžti į pamokų pasirinkimą
          </button>
        </>
      )}
    </div>
  );
}
