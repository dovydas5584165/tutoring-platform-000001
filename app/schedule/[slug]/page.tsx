"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { format, isSameDay, parseISO, addDays } from "date-fns";
import { lt } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { motion } from "framer-motion";

type Availability = {
  id: number;
  user_id: string;
  start_time: string;
  is_booked: boolean;
};

type Teacher = {
  id: string;
  vardas: string;
  pavarde: string;
  hourly_wage: number;
};

type BookingInfo = {
  name: string;
  email: string;
  phone?: string;
  topic?: string;
};

function BookingInfoModal({
  slots,
  totalPrice,
  onSubmit,
  onCancel,
  loading,
}: {
  slots: Availability[];
  totalPrice: number;
  onSubmit: (info: BookingInfo) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) {
      alert("Prašome įvesti vardą ir el. paštą.");
      return;
    }
    onSubmit({ name, email, phone, topic });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-bold">Įveskite savo kontaktinę informaciją</h2>

        <input
          type="text"
          placeholder="Vardas, Pavardė"
          className="w-full border rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />

        <input
          type="email"
          placeholder="El. paštas"
          className="w-full border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          type="tel"
          placeholder="Telefonas (neprivaloma)"
          className="w-full border rounded p-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
        />

        <textarea
          placeholder="Tema (neprivaloma)"
          className="w-full border rounded p-2 resize-none"
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={loading}
        />

        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-300 rounded text-gray-800 hover:bg-gray-400 disabled:opacity-50"
            disabled={loading}
          >
            Atšaukti
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Išsaugoma..." : `Patvirtinti užsakymą (€${totalPrice.toFixed(2)})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleLanding() {
  const router = useRouter();
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<Availability[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [lessonPrice, setLessonPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
    const { data, error } = await supabase
      .from("price")
      .select("amount")
      .single();

    if (!error && data) {
      setLessonPrice(Number(data.amount));
        }
    };

  fetchPrice();
    }, []);


  useEffect(() => {
    const fetchTeachersByLesson = async () => {
      setLoading(true);
      try {
        const { data: lessonData, error: lessonError } = await supabase
          .from("lessons")
          .select("id")
          .eq("name", slug)
          .single();

        if (lessonError || !lessonData) {
          setTeachers([]);
          setLoading(false);
          return;
        }

        const lessonId = lessonData.id;

        const { data: userLessonsData, error: userLessonsError } = await supabase
          .from("user_lessons")
          .select("user_id")
          .eq("lesson_id", lessonId);

        if (userLessonsError) {
          setTeachers([]);
          setLoading(false);
          return;
        }

        const tutorIds = userLessonsData?.map((ul) => ul.user_id) || [];

        if (tutorIds.length === 0) {
          setTeachers([]);
          setLoading(false);
          return;
        }

        const { data: tutorsData, error: tutorsError } = await supabase
          .from("users")
          .select("id, vardas, pavarde, hourly_wage")
          .in("id", tutorIds)
          .eq("role", "tutor");

        if (tutorsError) {
          setTeachers([]);
          setLoading(false);
          return;
        }

        setTeachers(tutorsData || []);
      } catch (err) {
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachersByLesson();
  }, [slug]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedTeacher && teachers.length === 0) return;

      setLoading(true);
      try {
        let query = supabase
          .from("availability")
          .select("id, user_id, start_time, is_booked")
          .gt("start_time", new Date().toISOString())
          .eq("is_booked", false);

        if (selectedTeacher) {
          query = query.eq("user_id", selectedTeacher.id);
        } else {
          const tutorIds = teachers.map((t) => t.id);
          query = query.in("user_id", tutorIds);
        }

        const { data, error } = await query;

        if (error) {
          setAvailabilities([]);
        } else {
          setAvailabilities(data || []);
        }
      } catch (err) {
        setAvailabilities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedTeacher, teachers]);

  const availableDays = Array.from(
    new Set(availabilities.map((a) => a.start_time.slice(0, 10)).filter(Boolean))
  ).map((day) => parseISO(day));

  const filteredSlots = availabilities.filter((slot) =>
    selectedDate ? isSameDay(parseISO(slot.start_time), selectedDate) : true
  );

  const toggleSlotSelection = (slot: Availability) => {
    const exists = selectedSlots.find((s) => s.id === slot.id);
    if (exists) {
      setSelectedSlots((prev) => prev.filter((s) => s.id !== slot.id));
    } else {
      setSelectedSlots((prev) => [...prev, slot]);
    }
  };

  const totalPrice = selectedSlots.length * (lessonPrice ?? 25); // €25 / 45 min

  // ✅ UPDATED: skip modal for recurring users
  const handleBookingConfirmAll = () => {
    if (selectedSlots.length === 0) {
      alert("Pasirinkite bent vieną pamoką prieš užsakant.");
      return;
    }

    const tutorIds = [...new Set(selectedSlots.map(slot => slot.user_id))];
    if (tutorIds.length > 1) {
      alert("Negalite užsisakyti pamokų iš skirtingų mokytojų vienu užsakymu.");
      return;
    }

    const savedInfo = localStorage.getItem("bookingInfo");
    if (savedInfo) {
      handleBookingInfoSubmit(JSON.parse(savedInfo)); // recurring user
    } else {
      setShowBookingModal(true); // new user
    }
  };

  // ✅ UPDATED: save info + still send notifications
  const handleBookingInfoSubmit = async (info: BookingInfo) => {
    const emailTrimmed = (info.email || "").trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
    if (!isValidEmail) {
      alert("Prašome įvesti galiojantį el. paštą.");
      return;
    }

    setBookingSubmitting(true);

    try {
      // Save info so modal won’t show again
      localStorage.setItem("bookingInfo", JSON.stringify(info));

      const slotIds = selectedSlots.map((slot) => slot.id);
      const tutorId = selectedSlots.length > 0 ? selectedSlots[0].user_id : null;

      const { data: bookingData, error } = await supabase
        .from("bookings")
        .insert({
          student_name: info.name,
          student_email: emailTrimmed,
          student_phone: info.phone || null,
          topic: info.topic || null,
          slot_ids: slotIds,
          total_price: totalPrice,
          created_at: new Date().toISOString(),
          lesson_slug: slug,
          tutor_id: tutorId,
        })
        .select()
        .single();

      if (error || !bookingData) throw error || new Error("Nepavyko sukurti užsakymo");

      // Send tutor notifications
      const notificationsData = selectedSlots.map((slot) => ({
        user_id: slot.user_id,
        message: `Ar sutinki vesti pamoką ${slug} ${format(
          parseISO(slot.start_time),
          "yyyy-MM-dd HH:mm"
        )}?${info.topic ? ` Tema: "${info.topic}"` : ""}`,
        is_read: false,
        booking_id: bookingData.id,
      }));

      await supabase.from("notifications").insert(notificationsData);

      setShowBookingModal(false);
      setSelectedSlots([]);
      setAvailabilities((prev) =>
        prev.filter((s) => !selectedSlots.some((sel) => sel.id === s.id))
      );

      router.push(`/payment?booking_id=${bookingData.id}`);
    } catch (err) {
      alert("Klaida užsakant pamokas. Bandykite dar kartą.");
    } finally {
      setBookingSubmitting(false);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans px-6 py-10 max-w-5xl mx-auto">
      <header className="mb-8">
  <h1 className="text-3xl font-bold mb-4 capitalize">Pamokos: {slug}</h1>

  <div className="mb-8 max-w-md relative">
    <label htmlFor="teacher-select" className="block mb-2 text-sm font-semibold text-gray-700">
      Pasirinkite mokytoją:
    </label>
    <select
      id="teacher-select"
      className="appearance-none w-full border border-gray-300 bg-white py-3 px-4 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 cursor-pointer transition"
      value={selectedTeacher?.id || ""}
      onChange={(e) =>
        setSelectedTeacher(teachers.find((t) => t.id === e.target.value) || null)
      }
      disabled={loading} // optionally disable while loading
    >
      <option value="">-- Rodyti visus --</option>
      {teachers.length > 0 ? (
        teachers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.vardas} {t.pavarde} – €{lessonPrice ?? 25}/45min
          </option>
        ))
      ) : loading ? (
        <option disabled>Kraunama mokytojų...</option>
      ) : (
        <option disabled>Šiai pamokai šiuo metu nėra mokytojų</option>
      )}
    </select>
  </div>
</header>


      <div className="p-4 mb-8 bg-white rounded-3xl shadow-md">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          fromDate={new Date()}
          toDate={addDays(new Date(), 31)}
          locale={lt}
          disabled={(day) =>
            !availableDays.some((availableDay) => isSameDay(availableDay, day))
          }
          modifiersClassNames={{
            selected: "bg-blue-600 text-white rounded",
            today: "underline",
            disabled: "opacity-40 cursor-not-allowed",
          }}
        />
      </div>

      <div>
        {loading ? (
          <p>Kraunama laikai...</p>
        ) : filteredSlots.length === 0 ? (
          <p>Nėra laisvų laikų šiai dienai.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredSlots.map((slot) => {
              const time = parseISO(slot.start_time);
              const formatted = format(time, "HH:mm");
              const isSelected = selectedSlots.some((s) => s.id === slot.id);
              const slotTutor = teachers.find(t => t.id === slot.user_id);
              const showTutorName = !selectedTeacher && teachers.length > 1;

              return (
                <div
                  key={slot.id}
                  className={`relative p-4 rounded-2xl shadow-md cursor-pointer text-center select-none transition ${
                    isSelected ? "bg-blue-100" : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() => toggleSlotSelection(slot)}
                >
                  <p className="font-medium text-lg">{formatted}</p>
                  {showTutorName && slotTutor && (
                    <p className="text-xs mt-1 text-gray-700 font-medium">
                      {slotTutor.vardas} {slotTutor.pavarde}
                    </p>
                  )}
                  <p className="text-xs mt-1 text-gray-600">€{lessonPrice ?? 25}/45min</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-12 pt-6 max-w-md bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Jūsų pasirinktos pamokos</h2>
        {selectedSlots.length === 0 ? (
          <p>Jūs dar nepasirinkote pamokų. Jei kyla neaiškumų, galite skambinti +37060395532</p> // hard coded number 
        ) : (
          <>
            <ul className="mb-4 space-y-2">
              {selectedSlots.map((slot) => (
                <li key={slot.id} className="flex justify-between rounded-2xl p-3 shadow-md bg-white">
                  <div>
                    <p className="font-medium">
                      {format(parseISO(slot.start_time), "yyyy-MM-dd HH:mm")}
                    </p>
                  </div>
                  <div className="font-semibold text-blue-700">€{(lessonPrice ?? 25).toFixed(2)}</div>
                </li>
              ))}
            </ul>
            <div className="text-right font-bold text-lg mb-4">
              Iš viso: €{totalPrice.toFixed(2)}
            </div>
            <button
              onClick={handleBookingConfirmAll}
              disabled={bookingLoading || selectedSlots.length === 0 || teachers.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {bookingLoading ? "Užsakoma..." : "Užsakyti visas pamokas"}
            </button>
          </>
        )}
      </div>

      {showBookingModal && (
        <BookingInfoModal
          slots={selectedSlots}
          totalPrice={totalPrice}
          onSubmit={handleBookingInfoSubmit}
          onCancel={() => setShowBookingModal(false)}
          loading={bookingSubmitting}
        />
      )}
       {/* Section 7: Mūsų Mokytojai */}
<motion.section
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="w-full min-h-screen flex flex-col justify-center items-center bg-white snap-start px-6 py-32"
>
  <h2 className="text-5xl font-extrabold mb-12 text-center">Mūsų Mokytojai</h2>

  <div className="flex gap-8 justify-center flex-wrap max-w-6xl mx-auto">
    {[
      {
        name: "Justė Giedraitytė",
        subject: "Matematika, anglų kalba",
        experience: "2 metai",
        description: "Esu Justė, politikos mokslų studentė iš Vilniaus. Ne visada mylėjau matematiką ir prisiekinėjau sau, jog nieko bendro su tuo neturėsiu ateityje. Tačiau ilgainiui, su daug sunkaus darbo, pamilau matematiką ir net vienus savo gyvenimo metus ją studijavau! Tas, manau, ir yra unikalu apie mane - žinau, kaip paaiškinti užduotis, taip, kad net visiškai žalias suprastų:) ",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/IMG_5420.jpeg",
      },
      {
        name: "Aleksandras Šileika",
        subject: "Matematika",
        experience: "1 metai",
        description: "Esu matematikos korepetitorius, studijuojantis matematiką Bonos universitete (Vokietijoje). Iš matematikos VBE gavau 100 balų. Puikiai suprantu atnaujintą bendrąją ugdymo programą ir žinau, kokie iššūkiai laukia mokinių ruošiantis kontroliniams, NMPP, PUPP ar VBE.",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/E0Tsj4D9OTOfOSOhS6zfFxwscH4sVtb8INL9xPp4.jpg",
      },
      {
        name: "Darija Stanislavovaitė",
        subject: "IT",
        experience: "1 metai",
        description: "Draugiška mokytoja, kuri moko per praktinius pavyzdžius. Darija yra VGTU studentė ir informatikos korepetitorė.",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/da.jpg",
      },
      {
        name: "Nomeda Sabienė",
        subject: "Chemija, biologija, fizika",
        experience: "15 metų",
        description: "Esu aplinkos chemijos ir ekologijos mokslų daktarė, gamtos mokslus suprantu kaip vientisą nedalomą/holistinę visumą. Galiu paaiškinti įvairius chemijos, fizikos, biologijos klausimus iš visų šių mokslų pozicijų. Ilgametė pedagoginė patirtis leidžia suteikti pagrindus sunkiau besimokantiems, ruošti moksleivius olimpiadoms ir VBE. Mano moto: kartu lengviau! ",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/20200624_203645-1.jpg",
      },
      {
        name: "Kajus Tutor",
        subject: "Matematika, fizika",
        experience: "2 metai",
        description: "Esu Kajus, mokau matematiką ir fiziką. Mėgstu paaiškinti sudėtingas temas paprastai ir suprantamai, kad kiekvienas mokinys galėtų jas įsisavinti.",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/anon.avif",
      },
      {
        name: "Kristina Balnytė",
        subject: "Matematika, anglų kalba",
        experience: "2 metai",
        description: "Esu matematikos ir lietuvių kalbos korepetitorė. Padedu pasiruošti atsiskaitymams, kontroliniams darbams, atlikti namų darbus ar pagilinti žinias. Kiekvienam mokiniui taikau individualią mokymo strategiją, nes žinau, kad vieno „stebuklingo“ metodo nėra. Mano tikslas - ne tik geresni pažymiai, bet ir augantis pasitikėjimas savimi. Jei ieškote korepetitoriaus, kuris aiškiai paaiškina, palaiko ir motyvuoja, mielai padėsiu jūsų vaikui žengti pirmyn.",
        img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/kr.jpg",
      },
    ].map((teacher, i) => (
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
    </div>
  );
}
