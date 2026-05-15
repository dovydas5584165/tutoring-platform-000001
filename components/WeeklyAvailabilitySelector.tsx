"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  addDays,
  setHours,
  setMinutes,
  startOfToday,
  formatISO,
  addHours,
  isWeekend,
} from "date-fns";
import { supabase } from "@/lib/supabaseClient";

// --- TIPAI IR KONSTANTOS ---

// Numatytųjų laikų tipas
type DefaultSlot = {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

const DAYS_OF_WEEK = [
  { id: 1, name: "Pirmadienis" },
  { id: 2, name: "Antradienis" },
  { id: 3, name: "Trečiadienis" },
  { id: 4, name: "Ketvirtadienis" },
  { id: 5, name: "Penktadienis" },
  { id: 6, name: "Šeštadienis" },
  { id: 7, name: "Sekmadienis" },
];

// Konkrečių dienų tipas ir konstantos iš jūsų kodo
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); 
const MINUTES = [0]; // hourly slots

type Slot = {
  date: Date;
  hour: number;
  minute: number;
};

function slotKey({ date, hour, minute }: Slot) {
  return `${date.toDateString()}-${hour}-${minute}`;
}

export default function WeeklyAvailabilitySelector({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<"default" | "specific">("specific");

  // ==========================================
  // STATE: NUMATYTASIS GRAFIKAS
  // ==========================================
  const [defaultSlots, setDefaultSlots] = useState<DefaultSlot[]>([]);
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  // ==========================================
  // STATE: KONKREČIOS DIENOS (Jūsų kodas)
  // ==========================================
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = startOfToday();
  const twoWeeksLater = addDays(today, 13);

  // ==========================================
  // LOGIKA: NUMATYTASIS GRAFIKAS
  // ==========================================
  useEffect(() => {
    if (userId && activeTab === "default") {
      loadDefaultSlots();
    }
  }, [userId, activeTab]);

  const loadDefaultSlots = async () => {
    setLoadingDefaults(true);
    const { data, error } = await supabase
      .from("default_availability")
      .select("*")
      .eq("user_id", userId)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) console.error("Klaida užkraunant numatytą grafiką:", error);
    else setDefaultSlots(data || []);
    setLoadingDefaults(false);
  };

  const addDefaultSlot = async (day_of_week: number) => {
    const newSlot = { user_id: userId, day_of_week, start_time: "15:00", end_time: "16:00" };
    const { data, error } = await supabase
      .from("default_availability")
      .insert([newSlot])
      .select()
      .single();

    if (error) alert("Klaida pridedant laiką.");
    else if (data) setDefaultSlots([...defaultSlots, data]);
  };

  const removeDefaultSlot = async (id: string) => {
    const { error } = await supabase.from("default_availability").delete().eq("id", id);
    if (error) alert("Klaida trinant laiką.");
    else setDefaultSlots(defaultSlots.filter(slot => slot.id !== id));
  };

  const updateDefaultSlot = async (id: string, field: "start_time" | "end_time", value: string) => {
    setDefaultSlots(slots => slots.map(slot => slot.id === id ? { ...slot, [field]: value } : slot));
    const { error } = await supabase.from("default_availability").update({ [field]: value }).eq("id", id);
    if (error) {
      alert("Klaida atnaujinant laiką.");
      loadDefaultSlots();
    }
  };

  // ==========================================
  // LOGIKA: KONKREČIOS DIENOS (Jūsų kodas)
  // ==========================================
  const toggleSlot = (slot: Slot) => {
    const key = slotKey(slot);
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const applyPreset = (predicate: (date: Date) => boolean, hoursToSelect: number[]) => {
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      for (let i = 0; i < 14; i++) {
        const currentDate = addDays(today, i);
        if (predicate(currentDate)) {
          hoursToSelect.forEach((h) => {
            const key = slotKey({ date: currentDate, hour: h, minute: 0 });
            newSet.add(key);
          });
        }
      }
      return newSet;
    });
  };

  const handlePresetWeekends = () => applyPreset(isWeekend, [11, 12, 13, 14, 15, 16]);
  const handlePresetAfterWork = () => applyPreset((date) => !isWeekend(date), [18, 19, 20]);

  const handleSelectFullDay = () => {
    if (!selectedDate) return;
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      HOURS.forEach(h => newSet.add(slotKey({ date: selectedDate, hour: h, minute: 0 })));
      return newSet;
    });
  };

  const handleClearDay = () => {
    if (!selectedDate) return;
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      HOURS.forEach(h => newSet.delete(slotKey({ date: selectedDate, hour: h, minute: 0 })));
      return newSet;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const rows = Array.from(selectedSlots).map((key) => {
      const [dateStr, hourStr, minStr] = key.split("-");
      const date = new Date(dateStr);
      const hour = parseInt(hourStr);
      const minute = parseInt(minStr);
      const start = setMinutes(setHours(date, hour), minute);
      const end = addHours(start, 1);

      return {
        user_id: userId,
        start_time: formatISO(start),
        end_time: formatISO(end),
      };
    });

    // Pakeičiau iš .insert į .upsert, kad nesulūžtų jei toks laikas jau egzistuoja
    const { error } = await supabase.from("availability").upsert(rows, { onConflict: 'user_id,start_time' });
    
    if (error) alert("Nepavyko išsaugoti: " + error.message);
    else {
      alert("Laikai išsaugoti!");
      setSelectedSlots(new Set());
    }

    setSubmitting(false);
    setShowConfirm(false);
  };

  // ==========================================
  // UI RENDER
  // ==========================================
  return (
    <div className="bg-white rounded-xl shadow-lg max-w-5xl mx-auto relative overflow-hidden">
      
      {/* TABS HEADER */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab("specific")}
          className={`flex-1 px-6 py-4 text-sm font-bold text-center transition-colors ${
            activeTab === "specific"
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          📅 Artimiausių 2 savaičių kalendorius
        </button>
        <button
          onClick={() => setActiveTab("default")}
          className={`flex-1 px-6 py-4 text-sm font-bold text-center transition-colors ${
            activeTab === "default"
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          🔄 Numatytasis savaitės grafikas
        </button>
      </div>

      <div className="p-6">
        {/* --- 1 KORTELĖ: SPECIFINĖS DIENOS (Jūsų 2 savaičių kalendorius) --- */}
        {activeTab === "specific" && (
          <div>
            {/* Quick Actions Bar */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-3">
                Greitieji pasirinkimai (visoms 2 savaitėms)
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePresetWeekends}
                  className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded shadow-sm hover:bg-blue-100 transition text-sm font-medium"
                >
                  🏢 Tik savaitgaliais (11-17h)
                </button>
                <button
                  onClick={handlePresetAfterWork}
                  className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded shadow-sm hover:bg-blue-100 transition text-sm font-medium"
                >
                  🌙 Po darbo (18-21h)
                </button>
                <button
                  onClick={() => setSelectedSlots(new Set())}
                  className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded shadow-sm hover:bg-red-50 transition text-sm font-medium ml-auto"
                >
                  🗑️ Valyti viską
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Calendar */}
              <div className="lg:col-span-5 flex justify-center lg:block">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  fromDate={today}
                  toDate={twoWeeksLater}
                  weekStartsOn={1}
                  modifiers={{
                    hasSlots: (date) => HOURS.some(h => selectedSlots.has(slotKey({ date, hour: h, minute: 0 }))),
                  }}
                  modifiersClassNames={{
                    hasSlots: "font-bold text-blue-600 underline decoration-blue-300"
                  }}
                  className="border p-4 rounded-lg shadow-sm"
                />
              </div>

              {/* Time Slots */}
              <div className="lg:col-span-7">
                {selectedDate ? (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 h-full">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="text-lg font-bold capitalize text-gray-700">
                        {selectedDate.toLocaleDateString("lt-LT", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      
                      <div className="flex gap-2 text-xs">
                        <button 
                          onClick={handleSelectFullDay}
                          className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        >
                          Žymėti visą
                        </button>
                        <span className="text-gray-300">|</span>
                        <button 
                          onClick={handleClearDay}
                          className="text-red-500 hover:text-red-700 font-medium hover:underline"
                        >
                          Atžymėti visą
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {HOURS.map((hour) =>
                        MINUTES.map((minute) => {
                          const key = slotKey({ date: selectedDate, hour, minute });
                          const selected = selectedSlots.has(key);
                          const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
                          
                          return (
                            <button
                              key={key}
                              onClick={() => toggleSlot({ date: selectedDate, hour, minute })}
                              className={`px-2 py-2 rounded text-sm font-semibold transition border ${
                                selected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })
                      )}
                    </div>
                    <p className="mt-4 text-xs text-gray-500 text-center">
                      Paspauskite ant laiko, kad pridėtumėte arba pašalintumėte.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-10">
                    <span className="text-4xl mb-2">📅</span>
                    <p>Pasirinkite dieną kalendoriuje, kad matytumėte laikus</p>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Bar */}
            <div className="mt-8 border-t pt-6 flex justify-end">
              <div className="mr-4 content-center text-sm text-gray-500">
                Pridedama laikų: <span className="font-bold text-gray-800">{selectedSlots.size}</span>
              </div>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={selectedSlots.size === 0}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md"
              >
                Išsaugoti kalendorių
              </button>
            </div>
          </div>
        )}

        {/* --- 2 KORTELĖ: NUMATYTASIS GRAFIKAS --- */}
        {activeTab === "default" && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
              <p className="text-blue-800 text-sm">
                ℹ️ Šie laikai automatiškai galios <b>kiekvieną savaitę</b>. Jei turite išimtį (pvz., atostogaujate arba dirbate ilgiau), naudokite „Artimiausių 2 savaičių kalendorių“.
              </p>
            </div>

            {loadingDefaults ? (
              <p className="italic text-gray-500 text-center py-10">Kraunama...</p>
            ) : (
              <div className="grid gap-4 max-w-3xl mx-auto">
                {DAYS_OF_WEEK.map((day) => {
                  const daySlots = defaultSlots.filter(s => s.day_of_week === day.id);

                  return (
                    <div key={day.id} className="border rounded-lg p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-start gap-4 hover:shadow-sm transition">
                      <div className="sm:w-1/4 font-semibold text-gray-800 pt-2">
                        {day.name}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        {daySlots.length === 0 ? (
                          <p className="text-sm text-gray-500 italic py-2">Nedirbama</p>
                        ) : (
                          daySlots.map(slot => (
                            <div key={slot.id} className="flex items-center gap-2">
                              <input
                                type="time"
                                value={slot.start_time.slice(0, 5)}
                                onChange={(e) => updateDefaultSlot(slot.id!, "start_time", e.target.value)}
                                className="border rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                              />
                              <span className="text-gray-500">-</span>
                              <input
                                type="time"
                                value={slot.end_time.slice(0, 5)}
                                onChange={(e) => updateDefaultSlot(slot.id!, "end_time", e.target.value)}
                                className="border rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                              />
                              <button
                                onClick={() => removeDefaultSlot(slot.id!)}
                                className="p-1.5 text-gray-400 hover:text-red-600 transition ml-2 font-bold"
                                title="Ištrinti"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                        
                        <button
                          onClick={() => addDefaultSlot(day.id)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
                        >
                          + Pridėti
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- CONFIRMATION MODAL (Jūsų kodas) --- */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-2xl transform transition-all">
            <h3 className="text-xl font-bold mb-3 text-gray-800">Patvirtinimas</h3>
            <p className="text-gray-600 mb-6">
              Ar tikrai norite išsaugoti <strong>{selectedSlots.size}</strong> pasirinktus laikus? <br/>
              <span className="text-sm text-gray-500 mt-2 block">
                Pažymėtus laikus atsiradus užsakymui turėsite pamoką pravesti.
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
              >
                Atšaukti
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium flex items-center"
              >
                {submitting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {submitting ? "Išsaugoma..." : "Patvirtinti"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
