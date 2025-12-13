"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import WeeklyAvailabilitySelector from "@/components/WeeklyAvailabilitySelector";

type AvailabilitySlot = {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: number;
};

type Lesson = {
  id: string;
  name: string;
  slug: string;
};

type Booking = {
  id: string;
  student_name: string;
  student_email: string;
  topic?: string;
  total_price: number;
  lesson_slug: string;
  created_at: string;
};

type UserFlags = {
  signed: boolean;
  signed_at: string | null;
};

type Notification = {
  id: string;
  user_id: string | null;
  message: string;
  is_read: boolean | null;
  related_slot_id: string | null;
  created_at: string | null;
};

function TermsPopup({ onAccept }: { onAccept: () => void }) {
  const [agreed, setAgreed] = useState(false);

  const handleAgree = () => {
    if (!agreed) {
      alert("Prašome sutikti su paslaugų teikimo sutartimi.");
      return;
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 max-h-[80vh] overflow-y-auto">
        <h2 className="text-3xl font-extrabold mb-6 text-center">Paslaugų teikimo sutartis</h2>

        <div className="text-md text-gray-700 mb-8 whitespace-pre-line leading-relaxed space-y-3">
          <p>Korepetitorius patvirtina, kad sutinka laikytis šių paslaugų teikimo sąlygų:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Korepetitorius įsipareigoja teikti kokybiškas ir laiku vykdomas mokymo paslaugas.</li>
            <li>Paslaugų apimtis, trukmė ir kaina yra sutartinai nustatytos.</li>
            <li>Ginčų atveju šalys sieks susitarti derybų būdu. Nepavykus, ginčas sprendžiamas Lietuvos Respublikos teisės aktų nustatyta tvarka.</li>
            <li>Korepetitorius patvirtina, kad yra susipažinęs su visomis sąlygomis ir jas priima.</li>
          </ol>
          <p className="italic">(Sutarties tekstas gali būti papildytas ir koreguojamas pagal poreikį.)</p>
        </div>

        <label className="flex items-center space-x-3 mb-8 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="w-6 h-6 rounded border-gray-300 focus:ring-2 focus:ring-blue-600"
          />
          <span className="text-lg font-medium text-gray-800">Sutinku su paslaugų teikimo sutartimi</span>
        </label>

        <div className="flex justify-center">
          <button
            onClick={handleAgree}
            disabled={!agreed}
            className={`px-8 py-3 rounded-xl text-white font-semibold transition ${
              agreed ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Sutinku
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TutorDashboard() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  const [showTerms, setShowTerms] = useState(false);
  const [userFlags, setUserFlags] = useState<UserFlags | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Check user agreement on mount
  useEffect(() => {
    const checkAgreement = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/auth/log-in");
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("signed, signed_at")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Klaida tikrinant sutikimą:", error.message);
          return;
        }

        if (!data?.signed) setShowTerms(true);
        setUserFlags(data);
      } catch (err) {
        console.error("Error checking agreement:", err);
      }
    };

    checkAgreement();
  }, [router]);

  // Load availability slots
  useEffect(() => {
    if (!id) return;
    supabase
      .from("availability")
      .select("*")
      .eq("user_id", id)
      .then(({ data, error }) => {
        if (error) {
          console.error("Klaida gaunant prieinamumą:", error.message);
          return;
        }
        setAvailabilitySlots(data || []);
      });
  }, [id]);

  // Load unread notifications
  useEffect(() => {
    if (!id) return;
    setNotifLoading(true);
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", id)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Klaida gaunant pranešimus:", error.message);
          setNotifLoading(false);
          return;
        }
        setNotifications(data || []);
        setNotifLoading(false);
      });
  }, [id]);

  // Load lessons of tutor
  useEffect(() => {
    if (!id) return;
    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from("user_lessons")
        .select(`lessons(id, name, slug)`)
        .eq("user_id", id);

      if (error) {
        console.error("Klaida gaunant pamokas:", error.message);
        return;
      }

      const lessonsArr: Lesson[] = (data ?? []).map((row) => row.lessons).filter(Boolean);
      setLessons(lessonsArr);
    };
    fetchLessons();
  }, [id]);

  // Function to fetch bookings for this tutor's lessons (called only after notification acceptance)
  const fetchBookings = async () => {
    if (lessons.length === 0) return;
    setBookingsLoading(true);

    const lessonSlugs = lessons.map((l) => l.slug);

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .in("lesson_slug", lessonSlugs)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Klaida gaunant užsakymus:", error.message);
      setBookings([]);
    } else {
      setBookings(data ?? []);
    }

    setBookingsLoading(false);
  };

  // Save availability slots reload
  const handleSave = async () => {
    if (!id) return;

    const { data, error } = await supabase.from("availability").select("*").eq("user_id", id);

    if (error) {
      console.error("Klaida atnaujinant prieinamumą:", error.message);
      return;
    }

    setAvailabilitySlots(data || []);
  };

  // Handle notification response with optimistic UI and update is_read
  const handleNotificationResponse = async (notification: Notification, isYes: boolean) => {
    if (!id) return;

    // Optimistic UI: remove notification immediately
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

    try {
      // Mark notification as read
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notification.id);

      if (updateError) throw updateError;

      if (!isYes && notification.related_slot_id) {
        // Reset availability slot status if declined
        const { error } = await supabase
          .from("availability")
          .update({ status: 0 })
          .eq("id", notification.related_slot_id)
          .eq("user_id", id);

        if (error) throw error;

        await handleSave();
      }

      if (isYes && notification.related_slot_id) {
        // Add lesson linked to this slot to user_lessons table
        const { data: slotData, error: slotError } = await supabase
          .from("availability")
          .select("lesson_id")
          .eq("id", notification.related_slot_id)
          .single();

        if (slotError || !slotData?.lesson_id) {
          console.error("Neįmanoma gauti pamokos ID iš prieinamumo:", slotError?.message);
          return;
        }

        // Insert into user_lessons (upsert to avoid duplicates)
        const { error: insertError } = await supabase
          .from("user_lessons")
          .upsert({ user_id: id, lesson_id: slotData.lesson_id, created_at: new Date().toISOString() });

        if (insertError) {
          console.error("Klaida pridedant pamoką:", insertError.message);
          return;
        }

        // Reload lessons to show new one
        const { data, error } = await supabase
          .from("user_lessons")
          .select(`lessons(id, name, slug)`)
          .eq("user_id", id);

        if (!error && data) {
          const lessonsArr: Lesson[] = data.map((row) => row.lessons).filter(Boolean);
          setLessons(lessonsArr);
        }

        // Now fetch bookings for updated lessons
        await fetchBookings();
      }

      // Simulate sending emails
      console.log(`Send email to tutor (${id}): Notification response '${isYes ? "Yes" : "No"}'`);
      console.log(`Send email to student linked to slot ${notification.related_slot_id}`);
    } catch (err) {
      alert("Klaida apdorojant pranešimą.");
      console.error(err);
    }
  };

  const acceptTerms = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("users")
        .update({
          signed: true,
          signed_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        alert("Nepavyko įrašyti sutikimo: " + error.message);
        return;
      }

      setUserFlags({ signed: true, signed_at: new Date().toISOString() });
      setShowTerms(false);
    } catch (err) {
      alert("Klaida priimant sutartį.");
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) router.push("/auth/log-in");
      else alert("Klaida atsijungiant.");
    } catch {
      alert("Klaida atsijungiant.");
    }
  };

  const goTo = (path: string) => {
    if (!id) {
      alert("Neidentifikuotas mokytojo ID");
      return;
    }
    router.push(`/tutor_dashboard/${id}/${path}`);
  };

  if (showTerms) {
    return <TermsPopup onAccept={acceptTerms} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white shadow-md border-b border-gray-300 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide">Sveiki, mokytojau!</h1>
          {userFlags?.signed_at && (
            <p className="text-xs text-gray-500 mt-1">
              Sutartis pasirašyta: {new Date(userFlags.signed_at).toLocaleDateString("lt-LT")}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => goTo("sf_form")}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Įrašyti sąskaitą
          </button>
          <button
            onClick={() => goTo("add_lesson")}
            className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Pridėti pamoką
          </button>
          <button
            onClick={() => goTo("grades")}
            className="px-5 py-2 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition"
          >
            Pridėti pažymį
          </button>
          <button
            onClick={() => goTo("resources")}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
          >
            Resursai
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-gray-700"
          >
            Atsijungti
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 sm:px-10 py-10 space-y-10 max-w-7xl">
        {/* Visos pamokos section - shows bookings grouped by lesson_slug */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Visos pamokos</h2>

          {bookingsLoading ? (
            <p className="italic text-gray-500">Kraunama užsakymų informacija...</p>
          ) : bookings.length === 0 ? (
            <p className="text-gray-600 italic">Nėra užsakymų.</p>
          ) : (
            <ul className="space-y-4 max-h-[400px] overflow-y-auto">
              {Object.entries(
                bookings.reduce((acc, booking) => {
                  acc[booking.lesson_slug] = acc[booking.lesson_slug] || [];
                  acc[booking.lesson_slug].push(booking);
                  return acc;
                }, {} as Record<string, Booking[]>)
              ).map(([lessonSlug, lessonBookings]) => (
                <li
                  key={lessonSlug}
                  className="border rounded-md p-4 hover:shadow-md transition"
                >
                  <p className="font-semibold text-lg mb-3 capitalize">{lessonSlug.replace(/-/g, " ")}</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    {lessonBookings.map((b) => (
                      <li key={b.id} className="border-t pt-2">
                        <p>
                          <strong>Studentas:</strong> {b.student_name} ({b.student_email})
                        </p>
                        {b.topic && <p><strong>Tema:</strong> {b.topic}</p>}
                        <p><strong>Kaina:</strong> {b.total_price} €</p>
                        <p className="text-xs text-gray-500">
                          Užsakyta: {new Date(b.created_at).toLocaleString("lt-LT")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3 flex items-center justify-between">
            Pranešimai
            {notifLoading && <span className="text-gray-400 italic text-sm">Kraunama...</span>}
          </h2>
          {notifications.length === 0 ? (
            <p className="text-gray-600 italic">Nėra naujų pranešimų.</p>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.map((note) => (
                <li
                  key={note.id}
                  className="p-4 rounded-lg flex justify-between items-center shadow-sm bg-blue-100 text-blue-900 font-semibold"
                >
                  <div className="flex-1">
                    <p>{note.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {note.created_at ? new Date(note.created_at).toLocaleString("lt-LT") : ""}
                    </p>
                  </div>
                  <div className="flex space-x-3 ml-6">
                    <button
                      onClick={() => handleNotificationResponse(note, true)}
                      className="px-4 py-2 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 transition"
                    >
                      Taip
                    </button>
                    <button
                      onClick={() => handleNotificationResponse(note, false)}
                      className="px-4 py-2 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 transition"
                    >
                      Ne
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-3">Prieinamumas</h2>
          <WeeklyAvailabilitySelector
            initialSlots={availabilitySlots}
            onSave={handleSave}
            userId={id}
          />
        </section>
      </main>
    </div>
  );
}
