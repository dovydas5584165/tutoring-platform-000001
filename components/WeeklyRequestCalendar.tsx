"use client";

import { useEffect, useRef, useState } from "react";
import { addDays, addWeeks, format, isSameDay, startOfWeek } from "date-fns";
import { lt } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  FIRST_HOUR, LAST_HOUR, MAX_DAYS_AHEAD, MAX_SLOTS, MIN_NOTICE_HOURS, MIN_SLOTS,
} from "@/lib/lessonRequestRules";

const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i);
const MAX_WEEK = Math.floor(MAX_DAYS_AHEAD / 7);

/**
 * Week grid (Mon–Sun × hours). The client taps, or drags across, every hour they could attend.
 * `value` holds ISO timestamps of the chosen start times.
 */
export default function WeeklyRequestCalendar({
  value,
  onChange,
  disabled = false,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
}) {
  const [week, setWeek] = useState(0);
  const [now, setNow] = useState<number | null>(null);
  const drag = useRef<null | "add" | "remove">(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  // "now" only on the client, so server and browser render the same markup
  useEffect(() => {
    setNow(Date.now());
    const stop = () => (drag.current = null);
    window.addEventListener("pointerup", stop);
    return () => window.removeEventListener("pointerup", stop);
  }, []);

  const monday = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), week);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const chosen = new Set(value.map((v) => new Date(v).getTime()));

  const at = (day: Date, hour: number) => {
    const d = new Date(day);
    d.setHours(hour, 0, 0, 0);
    return d;
  };
  const blocked = (d: Date) =>
    now === null ||
    d.getTime() < now + MIN_NOTICE_HOURS * 3600_000 ||
    d.getTime() > now + MAX_DAYS_AHEAD * 86400_000;

  const apply = (d: Date, mode: "add" | "remove") => {
    const t = d.getTime();
    const cur = valueRef.current;
    const has = cur.some((v) => new Date(v).getTime() === t);
    if (mode === "add" && !has && cur.length < MAX_SLOTS) {
      onChange([...cur, d.toISOString()].sort());
    } else if (mode === "remove" && has) {
      onChange(cur.filter((v) => new Date(v).getTime() !== t));
    }
  };

  const inWeek = value.filter((v) => {
    const t = new Date(v).getTime();
    return t >= monday.getTime() && t < addDays(monday, 7).getTime();
  }).length;
  const enough = value.length >= MIN_SLOTS;

  return (
    <div className="select-none">
      <div className="flex items-center justify-between gap-3 mb-3">
        <button
          type="button"
          onClick={() => setWeek((w) => Math.max(0, w - 1))}
          disabled={week === 0}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
          aria-label="Ankstesnė savaitė"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-bold text-slate-900">
            {format(days[0], "MMMM d", { locale: lt })} – {format(days[6], "MMMM d", { locale: lt })}
          </div>
          <div className="text-xs text-slate-500">
            {week === 0 ? "Ši savaitė" : week === 1 ? "Kita savaitė" : `Po ${week} sav.`}
            {inWeek > 0 && ` · pažymėta ${inWeek}`}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setWeek((w) => Math.min(MAX_WEEK, w + 1))}
          disabled={week === MAX_WEEK}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30"
          aria-label="Kita savaitė"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div>
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: "36px repeat(7, minmax(0, 1fr))", touchAction: "pan-y" }}
        >
          <div />
          {days.map((d) => (
            <div
              key={d.toISOString()}
              className={`text-center text-[11px] leading-tight pb-1 ${isSameDay(d, new Date()) ? "text-[#3B65CE] font-bold" : "text-slate-500"}`}
            >
              <div className="uppercase">{format(d, "EEE", { locale: lt })}</div>
              <div className="text-sm font-semibold text-slate-800">{format(d, "d")}</div>
            </div>
          ))}

          {HOURS.map((h) => (
            <div key={h} className="contents">
              <div className="text-[11px] text-slate-400 text-right pr-1 pt-1.5">{`${h}:00`}</div>
              {days.map((day) => {
                const d = at(day, h);
                const off = disabled || blocked(d);
                const on = chosen.has(d.getTime());
                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    disabled={off}
                    aria-pressed={on}
                    aria-label={format(d, "EEEE d MMMM, HH:mm", { locale: lt })}
                    onPointerDown={(e) => {
                      if (off) return;
                      if (e.pointerType === "mouse") e.preventDefault();
                      drag.current = on ? "remove" : "add";
                      apply(d, drag.current);
                    }}
                    onPointerEnter={() => {
                      if (!off && drag.current) apply(d, drag.current);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        apply(d, on ? "remove" : "add");
                      }
                    }}
                    className={`h-8 rounded-lg border text-[11px] font-semibold flex items-center justify-center transition-colors ${
                      on
                        ? "bg-[#3B65CE] border-[#3B65CE] text-white"
                        : off
                        ? "bg-slate-50 border-slate-100 cursor-not-allowed"
                        : "bg-white border-slate-200 hover:border-[#3B65CE] hover:bg-blue-50 cursor-pointer"
                    }`}
                  >
                    {on && <Check size={14} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-28 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${enough ? "bg-emerald-500" : "bg-[#3B65CE]"}`}
              style={{ width: `${Math.min(100, (value.length / MIN_SLOTS) * 100)}%` }}
            />
          </div>
          <span className={enough ? "text-emerald-700 font-semibold" : "text-slate-600"}>
            Pasirinkta {value.length} {enough ? "✓" : `/ bent ${MIN_SLOTS}`}
          </span>
        </div>
        {value.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="text-slate-500 hover:text-red-600 text-xs underline">
            Išvalyti
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-1">
        Pažymėkite visas valandas, kada galėtumėte mokytis (galima braukti pele). Kuo daugiau laikų, tuo greičiau rasime mokytoją.
      </p>
    </div>
  );
}
