"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { format, isSameDay, parseISO, addDays } from "date-fns";
import { lt } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Mail,
  Phone,
  ShieldCheck,
  AlertCircle,
  Loader2,
  BellRing,
  Check,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------- TYPES ----------

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

type FormErrors = {
  fullName?: string;
  grade?: string;
  subject?: string;
  average?: string;
  email?: string;
  phone?: string;
};

// ---------- VALIDATION HELPERS ----------

const CONFIRM_PHRASE = "suprantu, kad pamokos kaina yra 25 eur";

const normalizePhrase = (s: string) =>
  s.toLowerCase().replace(/,/g, "").replace(/\s+/g, " ").trim();

const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "inbox.lt",
  "takas.lt",
  "zebra.lt",
  "one.lt",
  "mail.com",
];

const EMAIL_REGEX = /^[a-z0-9]+([._+-][a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)+$/;

function validateEmail(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (!value) return "Įveskite el. pašto adresą.";
  if (value.length > 100) return "El. pašto adresas per ilgas.";
  if (!EMAIL_REGEX.test(value)) return "Neteisingas el. pašto formatas.";

  const [local, domain] = value.split("@");

  if (!ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return "Naudokite populiarų el. paštą (pvz. @gmail.com, @outlook.com, @yahoo.com, @icloud.com, @inbox.lt).";
  }
  if (local.length < 3) return "El. pašto pavadinimas per trumpas.";
  if (/^(.)\1+$/.test(local)) return "Atrodo, kad el. paštas netikras.";
  if (/^(test|asdf|qwerty|abc|aaa|xxx|fake|none|no)\d*$/.test(local)) {
    return "Prašome įvesti tikrą el. pašto adresą.";
  }
  return null;
}

function normalizeLtPhone(raw: string): string | null {
  let digits = raw.replace(/[\s\-()]/g, "");

  if (digits.startsWith("00370")) digits = "+370" + digits.slice(5);
  else if (digits.startsWith("370") && digits.length === 11) digits = "+" + digits;
  else if (digits.startsWith("86") && digits.length === 9) digits = "+370" + digits.slice(1);

  return /^\+3706\d{7}$/.test(digits) ? digits : null;
}

function validatePhone(raw: string): string | null {
  const value = raw.trim();
  if (!value) return "Įveskite telefono numerį.";
  if (!/^[+\d\s\-()]+$/.test(value)) return "Telefono numeryje gali būti tik skaitmenys.";

  const normalized = normalizeLtPhone(value);
  if (!normalized) {
    return "Įveskite Lietuvos mobilųjį numerį, pvz. +370 600 00000 arba 8 600 00000.";
  }

  const subscriber = normalized.slice(5);
  if (/^(\d)\1+$/.test(subscriber)) return "Atrodo, kad numeris netikras.";
  if ("01234567890".includes(subscriber) || "98765432109".includes(subscriber)) {
    return "Atrodo, kad numeris netikras.";
  }
  return null;
}

function validateFullName(raw: string): string | null {
  const value = raw.trim();
  if (!value) return "Įveskite savo vardą ir pavardę.";
  if (value.length < 3) return "Vardas ir pavardė per trumpi.";
  return null;
}

function validateGrade(raw: string): string | null {
  if (!raw.trim()) return "Pasirinkite arba įrašykite klasę.";
  return null;
}

function validateSubject(raw: string): string | null {
  if (!raw.trim()) return "Įrašykite norimą mokytis dalyką.";
  return null;
}

function validateAverage(raw: string): string | null {
  const value = raw.trim().replace(",", ".");
  if (!value) return "Įveskite dabartinį vidurkį.";
  const num = Number(value);
  if (isNaN(num) || num < 1 || num > 10) {
    return "Įveskite teisingą vidurkį (nuo 1 iki 10).";
  }
  return null;
}

// ---------- SMALL UI PIECES ----------

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-start gap-1.5 text-sm text-red-600 mt-2 overflow-hidden"
          role="alert"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{message}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

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

// ---------- MAIN PAGE COMPONENT ----------

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

  // --- REGISTRATION FORM STATE ---
  const [regFullName, setRegFullName] = useState("");
  const [regGrade, setRegGrade] = useState("");
  const [regSubject, setRegSubject] = useState(slug || "");
  const [regAverage, setRegAverage] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [phrase, setPhrase] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [regErrors, setRegErrors] = useState<FormErrors>({});
  const [regStatus, setRegStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  const phraseOk = normalizePhrase(phrase) === normalizePhrase(CONFIRM_PHRASE);
  const isRegLoading = regStatus === "loading";

  const clearRegError = (field: keyof FormErrors) => {
    setRegErrors((prev) => ({ ...prev, [field]: undefined }));
    if (regStatus === "error" || regStatus === "duplicate") setRegStatus("idle");
  };

  useEffect(() => {
    if (slug && !regSubject) {
      setRegSubject(slug);
    }
  }, [slug]);

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

  const totalPrice = selectedSlots.length * (lessonPrice ?? 25);

  const handleBookingConfirmAll = () => {
    if (selectedSlots.length === 0) {
      alert("Pasirinkite bent vieną pamoką prieš užsakant.");
      return;
    }

    const tutorIds = [...new Set(selectedSlots.map((slot) => slot.user_id))];
    if (tutorIds.length > 1) {
      alert("Negalite užsisakyti pamokų iš skirtingų mokytojų vienu užsakymu.");
      return;
    }

    const savedInfo = localStorage.getItem("bookingInfo");
    if (savedInfo) {
      handleBookingInfoSubmit(JSON.parse(savedInfo));
    } else {
      setShowBookingModal(true);
    }
  };

  const handleBookingInfoSubmit = async (info: BookingInfo) => {
    const emailTrimmed = (info.email || "").trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed);
    if (!isValidEmail) {
      alert("Prašome įvesti galiojantį el. paštą.");
      return;
    }

    setBookingSubmitting(true);

    try {
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
          payment_status: "pending",
        })
        .select()
        .single();

      if (error || !bookingData) throw error || new Error("Nepavyko sukurti užsakymo");

      const notificationsData = selectedSlots.map((slot) => ({
        user_id: slot.user_id,
        message: `Ar sutinki vesti pamoką ${slug} ${format(
          parseISO(slot.start_time),
          "yyyy-MM-dd HH:mm"
        )}?${info.topic ? ` Tema: "${info.topic}"` : ""}`,
        is_read: false,
        booking_id: bookingData.id,
      }));

      const { error: notifError } = await supabase.from("notifications").insert(notificationsData);

      if (notifError) {
        console.error("Notification insert failed:", notifError);
      }

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

  // --- REGISTRATION HANDLER ---
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      setRegStatus("success");
      return;
    }

    if (!phraseOk) return;

    const newErrors: FormErrors = {};
    const nameError = validateFullName(regFullName);
    if (nameError) newErrors.fullName = nameError;

    const gradeError = validateGrade(regGrade);
    if (gradeError) newErrors.grade = gradeError;

    const subjectError = validateSubject(regSubject);
    if (subjectError) newErrors.subject = subjectError;

    const averageError = validateAverage(regAverage);
    if (averageError) newErrors.average = averageError;

    const emailError = validateEmail(regEmail);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(regPhone);
    if (phoneError) newErrors.phone = phoneError;

    setRegErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const cleanName = regFullName.trim();
    const cleanGrade = regGrade.trim();
    const cleanSubject = regSubject.trim();
    const cleanAverage = Number(regAverage.trim().replace(",", "."));
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPhone = normalizeLtPhone(regPhone) as string;

    setRegStatus("loading");

    try {
      const { error } = await supabase.from("lesson_registrations").insert([
        {
          full_name: cleanName,
          grade: cleanGrade,
          subject: cleanSubject,
          current_average: cleanAverage,
          email: cleanEmail,
          phone: cleanPhone,
        },
      ]);

      if (error) throw error;

      setRegStatus("success");
      setRegFullName("");
      setRegGrade("");
      setRegAverage("");
      setRegEmail("");
      setRegPhone("");
      setPhrase("");
      setRegErrors({});
    } catch (error) {
      if ((error as { code?: string })?.code === "23505") {
        setRegStatus("duplicate");
        return;
      }
      console.error("Klaida išsaugant registraciją:", error);
      setRegStatus("error");
    }
  };

  const inputBase =
    "w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 text-slate-900 text-base placeholder:text-slate-400 " +
    "border border-slate-200 outline-none transition-all " +
    "hover:border-slate-300 focus:bg-white focus:border-[#3B65CE] focus:ring-4 focus:ring-[#3B65CE]/15 " +
    "disabled:opacity-60 disabled:cursor-not-allowed";
  const inputBad = "!border-red-400 !bg-red-50/40 focus:!ring-red-200";

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
            {[
              {
                name: "Aleksandras Šileika",
                subject: "Matematika",
                experience: "1 metai",
                description:
                  "Esu matematikos korepetitorius, studijuojantis matematiką Bonos universitete (Vokietijoje). Iš matematikos VBE gavau 100 balų. Puikiai suprantu atnaujintą bendrąją ugdymo programą ir žinau, kokie iššūkiai laukia mokinių ruošiantis kontroliniams, NMPP, PUPP ar VBE.",
                img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/E0Tsj4D9OTOfOSOhS6zfFxwscH4sVtb8INL9xPp4.jpg",
              },
              {
                name: "Katia",
                subject: "Prancūzų",
                experience: "3 metai",
                description:
                  "Currently pursuing a Master’s degree in Didactics of French as a Foreign Language (FLE) and holding a Bachelor’s degree in Language Sciences and French Literature, I offer tailored French lessons for all learning levels. Backed by a full year of classroom teaching experience alongside hands-on work with international university students and adult learners, my teaching focus is built on communicative and practical methods. Through custom-designed, interactive learning materials, I provide personalized instruction aimed at building your speaking confidence, improving reading and writing skills, and achieving your language goals at your own pace",
                img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/katia.jpg",
              },
              {
                name: "Kajus Tutor",
                subject: "Matematika, fizika",
                experience: "2 metai",
                description:
                  "Esu Kajus, mokau matematiką ir fiziką. Mėgstu paaiškinti sudėtingas temas paprastai ir suprantamai, kad kiekvienas mokinys galėtų jas įsisavinti.",
                img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/anon.avif",
              },
              {
                name: "Dovydas Žilinskas",
                subject: "Matematika, IT",
                experience: "2 metai",
                description:
                  "Esu kiekybinės ekonomikos alumnas ir studijavau Prancūzijoje šiuo metu dirbu rizikų analitiku.",
                img: "https://yabbhnnhnrainsakhuio.supabase.co/storage/v1/object/public/teacher%20photos/1701519636194.jpeg",
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

        <h1 className="text-3xl font-bold mb-4 capitalize">Pamokos: {slug}</h1>

        <div className="mb-8 max-w-md relative">
          <select
            id="teacher-select"
            className="appearance-none w-full border border-gray-300 bg-white py-3 px-4 pr-10 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 cursor-pointer transition"
            value={selectedTeacher?.id || ""}
            onChange={(e) =>
              setSelectedTeacher(teachers.find((t) => t.id === e.target.value) || null)
            }
            disabled={loading}
          >
            <option value="">Pasirinkite mokytoją:</option>
            {teachers.length > 0 ? (
              teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.vardas} {t.pavarde} - €{lessonPrice ?? 25}/45min
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

      {/* --- IMPROVED SPLIT-VIEW SCHEDULING SECTION --- */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[500px] mb-8">
        {/* LEFT COLUMN: Calendar Sidebar */}
        <div className="p-6 md:p-8 md:w-[400px] bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col items-center">
          <h3 className="text-lg font-bold text-gray-700 mb-4 w-full text-left">Pasirinkite datą</h3>
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
              selected: "bg-blue-600 text-white hover:bg-blue-600 rounded-full",
              today: "text-blue-600 font-bold",
              disabled: "text-gray-300 opacity-50 cursor-not-allowed",
            }}
            className="p-0 m-0"
            classNames={{
              day: "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-200 rounded-full transition-colors",
              head_cell: "text-gray-500 rounded-md w-10 font-normal text-[0.8rem]",
              caption: "flex justify-center pt-1 relative items-center mb-4",
            }}
          />
        </div>

        {/* RIGHT COLUMN: Time Slots */}
        <div className="flex-1 p-6 md:p-8 bg-white">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {selectedDate
                ? format(selectedDate, "yyyy 'm.' MMMM d 'd.'", { locale: lt })
                : "Pasirinkite datą"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedDate
                ? `${filteredSlots.length} laisvi laikai`
                : "Kairėje pasirinkite dieną, kad matytumėte laikus"}
            </p>
          </div>

          <div>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredSlots.length === 0 ? (
              <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p>Nėra laisvų laikų šiai dienai.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {filteredSlots.map((slot) => {
                  const time = parseISO(slot.start_time);
                  const formatted = format(time, "HH:mm");
                  const isSelected = selectedSlots.some((s) => s.id === slot.id);
                  const slotTutor = teachers.find((t) => t.id === slot.user_id);
                  const showTutorName = !selectedTeacher && teachers.length > 1;

                  return (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={slot.id}
                      onClick={() => toggleSlotSelection(slot)}
                      className={`
                        relative p-4 rounded-xl border-2 cursor-pointer text-center select-none transition-all duration-200
                        ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md"
                            : "border-gray-100 bg-white text-gray-700 hover:border-blue-300 hover:shadow-sm"
                        }
                      `}
                    >
                      <p className="font-bold text-xl">{formatted}</p>
                      {showTutorName && slotTutor && (
                        <p className="text-xs mt-2 text-gray-500 font-medium truncate">
                          {slotTutor.vardas}
                        </p>
                      )}
                      <p
                        className={`text-xs mt-1 font-medium ${
                          isSelected ? "text-blue-600" : "text-gray-400"
                        }`}
                      >
                        €{lessonPrice ?? 25}
                      </p>

                      {isSelected && (
                        <div className="absolute top-2 right-2 text-blue-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Lessons Summary */}
      <div className="mt-4 pt-6 max-w-md bg-white rounded-2xl shadow-md p-6 ml-auto mb-16">
        <h2 className="text-2xl font-semibold mb-4">Jūsų pasirinktos pamokos</h2>
        {selectedSlots.length === 0 ? (
          <p>Jūs dar nepasirinkote pamokų. Jei kyla neaiškumų, galite rašyti info.tiksliukai@gmail.com</p>
        ) : (
          <>
            <ul className="mb-4 space-y-2">
              {selectedSlots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex justify-between rounded-2xl p-3 shadow-md bg-white border border-gray-100"
                >
                  <div>
                    <p className="font-medium">
                      {format(parseISO(slot.start_time), "yyyy-MM-dd HH:mm")}
                    </p>
                  </div>
                  <div className="font-semibold text-blue-700">
                    €{(lessonPrice ?? 25).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="text-right font-bold text-lg mb-4">
              Iš viso: €{totalPrice.toFixed(2)}
            </div>
            <button
              onClick={handleBookingConfirmAll}
              disabled={bookingLoading || selectedSlots.length === 0 || teachers.length === 0}
              className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg"
            >
              {bookingLoading ? "Užsakoma..." : "Užsakyti visas pamokas"}
            </button>
          </>
        )}
      </div>

      {/* --- NEW REGISTRATION SECTION (REUSED FROM GRUPINES PAMOKOS) --- */}
      <motion.section
        id="registracija"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 rounded-[2rem] overflow-hidden bg-white shadow-2xl ring-1 ring-black/5 mb-12"
      >
        {/* LEFT: Context Panel */}
        <div className="relative lg:col-span-2 bg-[#3B65CE] text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur mb-6">
              <BellRing size={24} className="text-yellow-300" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
              Nerandate tinkamo laiko? Užsiregistruokite!
            </h2>
            <p className="text-blue-100 leading-relaxed">
              Palikite savo duomenis ir mes parinksime jums tinkamiausią mokytoją bei suderinsime individualų pamokų laiką.
            </p>
          </div>

          <ul className="relative mt-10 space-y-4 text-sm">
            {[
              "Registracija nemokama ir jokių įsipareigojimų nekelia",
              "Informaciją perduosime atitinkamos srities mokytojams",
              "Pamokos kaina: 25 € už pamoką",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-blue-50">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-slate-900">
                  <Check size={12} strokeWidth={3} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT: Form / Success */}
        <div className="lg:col-span-3 p-6 sm:p-10">
          <AnimatePresence mode="wait">
            {regStatus === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[360px] flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6"
                >
                  <CheckCircle2 size={44} />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Sėkmingai užregistruota!</h3>
                <p className="text-slate-600 max-w-sm">
                  Informaciją perduosime atitinkamos srities mokytojams. Netrukus su jumis susisieksime!
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleRegistration}
                noValidate
                className="flex flex-col gap-5"
              >
                {/* Honeypot: hidden from real users */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                />

                {/* Vardas, Pavardė */}
                <div>
                  <label htmlFor="reg-fullname" className="block text-sm font-semibold text-slate-800 mb-2">
                    Vardas, Pavardė
                  </label>
                  <div className="relative">
                    <User
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="reg-fullname"
                      type="text"
                      autoComplete="name"
                      maxLength={80}
                      placeholder="Vardenis Pavardenis"
                      value={regFullName}
                      onChange={(e) => {
                        setRegFullName(e.target.value);
                        clearRegError("fullName");
                      }}
                      onBlur={() => {
                        if (regFullName)
                          setRegErrors((prev) => ({
                            ...prev,
                            fullName: validateFullName(regFullName) ?? undefined,
                          }));
                      }}
                      disabled={isRegLoading}
                      aria-invalid={!!regErrors.fullName}
                      className={`${inputBase} ${regErrors.fullName ? inputBad : ""}`}
                    />
                  </div>
                  <FieldError message={regErrors.fullName} />
                </div>

                {/* Klasė & Dabartinis vidurkis (2 columns on desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-grade" className="block text-sm font-semibold text-slate-800 mb-2">
                      Klasė
                    </label>
                    <div className="relative">
                      <GraduationCap
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <select
                        id="reg-grade"
                        value={regGrade}
                        onChange={(e) => {
                          setRegGrade(e.target.value);
                          clearRegError("grade");
                        }}
                        disabled={isRegLoading}
                        aria-invalid={!!regErrors.grade}
                        className={`${inputBase} appearance-none cursor-pointer ${
                          regErrors.grade ? inputBad : ""
                        }`}
                      >
                        <option value="">Pasirinkite klasę...</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                          <option key={g} value={`${g} klasė`}>
                            {g} klasė
                          </option>
                        ))}
                        <option value="Studentas / Suaugęs">Studentas / Suaugęs</option>
                      </select>
                    </div>
                    <FieldError message={regErrors.grade} />
                  </div>

                  <div>
                    <label htmlFor="reg-average" className="block text-sm font-semibold text-slate-800 mb-2">
                      Dabartinis vidurkis
                    </label>
                    <div className="relative">
                      <TrendingUp
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="reg-average"
                        type="text"
                        inputMode="decimal"
                        placeholder="Pvz.: 7.5"
                        value={regAverage}
                        onChange={(e) => {
                          setRegAverage(e.target.value);
                          clearRegError("average");
                        }}
                        onBlur={() => {
                          if (regAverage)
                            setRegErrors((prev) => ({
                              ...prev,
                              average: validateAverage(regAverage) ?? undefined,
                            }));
                        }}
                        disabled={isRegLoading}
                        aria-invalid={!!regErrors.average}
                        className={`${inputBase} ${regErrors.average ? inputBad : ""}`}
                      />
                    </div>
                    <FieldError message={regErrors.average} />
                  </div>
                </div>

                {/* Norimas mokytis dalykas */}
                <div>
                  <label htmlFor="reg-subject" className="block text-sm font-semibold text-slate-800 mb-2">
                    Norimas mokytis dalykas
                  </label>
                  <div className="relative">
                    <BookOpen
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <input
                      id="reg-subject"
                      type="text"
                      maxLength={80}
                      placeholder="Pvz.: Matematika, Fizika..."
                      value={regSubject}
                      onChange={(e) => {
                        setRegSubject(e.target.value);
                        clearRegError("subject");
                      }}
                      onBlur={() => {
                        if (regSubject)
                          setRegErrors((prev) => ({
                            ...prev,
                            subject: validateSubject(regSubject) ?? undefined,
                          }));
                      }}
                      disabled={isRegLoading}
                      aria-invalid={!!regErrors.subject}
                      className={`${inputBase} ${regErrors.subject ? inputBad : ""}`}
                    />
                  </div>
                  <FieldError message={regErrors.subject} />
                </div>

                {/* El. paštas & Telefonas (2 columns on desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-800 mb-2">
                      El. pašto adresas
                    </label>
                    <div className="relative">
                      <Mail
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="reg-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        maxLength={100}
                        placeholder="vardas@gmail.com"
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          clearRegError("email");
                        }}
                        onBlur={() => {
                          if (regEmail)
                            setRegErrors((prev) => ({
                              ...prev,
                              email: validateEmail(regEmail) ?? undefined,
                            }));
                        }}
                        disabled={isRegLoading}
                        aria-invalid={!!regErrors.email}
                        className={`${inputBase} ${regErrors.email ? inputBad : ""}`}
                      />
                    </div>
                    <FieldError message={regErrors.email} />
                  </div>

                  <div>
                    <label htmlFor="reg-phone" className="block text-sm font-semibold text-slate-800 mb-2">
                      Telefono numeris
                    </label>
                    <div className="relative">
                      <Phone
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                      <input
                        id="reg-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        maxLength={20}
                        placeholder="+370 600 00000"
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(e.target.value);
                          clearRegError("phone");
                        }}
                        onBlur={() => {
                          if (regPhone)
                            setRegErrors((prev) => ({
                              ...prev,
                              phone: validatePhone(regPhone) ?? undefined,
                            }));
                        }}
                        disabled={isRegLoading}
                        aria-invalid={!!regErrors.phone}
                        className={`${inputBase} ${regErrors.phone ? inputBad : ""}`}
                      />
                    </div>
                    <FieldError message={regErrors.phone} />
                  </div>
                </div>

                {/* Apsaugos frazė */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <label htmlFor="reg-phrase" className="block text-sm text-slate-600 mb-3">
                    Apsaugai nuo šlamšto, prašome tiksliai įvesti šią frazę:
                    <span className="block mt-1.5 font-semibold text-slate-900 select-all">
                      {CONFIRM_PHRASE}
                    </span>
                  </label>
                  <div className="relative">
                    <ShieldCheck
                      size={20}
                      className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                        phraseOk ? "text-emerald-500" : "text-slate-400"
                      }`}
                    />
                    <input
                      id="reg-phrase"
                      type="text"
                      autoComplete="off"
                      value={phrase}
                      onChange={(e) => setPhrase(e.target.value)}
                      placeholder="Įveskite patvirtinimo frazę..."
                      disabled={isRegLoading}
                      className={`${inputBase} bg-white pr-12 ${
                        phraseOk ? "!border-emerald-400 focus:!ring-emerald-200" : ""
                      }`}
                    />
                    <AnimatePresence>
                      {phraseOk && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white"
                        >
                          <Check size={14} strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Būsenos pranešimai */}
                <AnimatePresence>
                  {regStatus === "duplicate" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      role="alert"
                      className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3"
                    >
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <span>Šis el. paštas jau užregistruotas šiam dalykui.</span>
                    </motion.div>
                  )}
                  {regStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      role="alert"
                      className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm p-3"
                    >
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <span>Įvyko klaida duomenų bazėje. Prašome pabandyti vėliau.</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={isRegLoading || !phraseOk}
                  className="w-full h-14 rounded-2xl bg-[#3B65CE] hover:bg-[#2f54b3] text-white text-base font-bold shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
                >
                  {isRegLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={20} className="animate-spin" />
                      Siunčiama...
                    </span>
                  ) : (
                    "Registruotis pamokai"
                  )}
                </Button>

                {!phraseOk && (
                  <p className="text-center text-xs text-slate-400 -mt-3">
                    Mygtukas taps aktyvus, kai įvesite patvirtinimo frazę.
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {showBookingModal && (
        <BookingInfoModal
          slots={selectedSlots}
          totalPrice={totalPrice}
          onSubmit={handleBookingInfoSubmit}
          onCancel={() => setShowBookingModal(false)}
          loading={bookingSubmitting}
        />
      )}
    </div>
  );
}
