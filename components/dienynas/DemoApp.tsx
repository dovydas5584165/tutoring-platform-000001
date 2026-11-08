"use client";

/**
 * Interactive /dienynas demo: pick a role (teacher, administration, parents) and explore that view
 * inside an app-like window. Links like /dienynas#demo-tevams open a role directly.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Bell, BookOpenCheck, HeartHandshake, School } from "lucide-react";
import { DEMO, TEACHER } from "@/lib/dienynasDemo";
import TeacherView from "./TeacherView";
import AdminView from "./AdminView";
import ParentView from "./ParentView";

export const ROLES = [
  { id: "mokytojams", label: "Mokytojams", title: "Prognozės ir spragų analizė", Icon: BookOpenCheck },
  { id: "administracijai", label: "Administracijai", title: "Ar visi vertina vienodai", Icon: School },
  { id: "tevams", label: "Tėvams", title: "Įžvalgos ir pažymių prognozė", Icon: HeartHandshake },
] as const;
type Role = (typeof ROLES)[number]["id"];

const CONTEXT: Record<Role, { who: string; where: string; initials: string }> = {
  mokytojams: { who: TEACHER.name, where: `${TEACHER.className} · ${TEACHER.subject} · ${TEACHER.period}`, initials: "RP" },
  administracijai: { who: "Direktoriaus pavaduotoja ugdymui", where: "Visa mokykla · 2026–2027 m. m. · I pusmetis", initials: "DP" },
  tevams: { who: "Tėvų paskyra", where: `${DEMO.parent.child.name} · ${DEMO.parent.child.className} klasė`, initials: "MP" },
};

export default function DemoApp() {
  const [role, setRole] = useState<Role>("mokytojams");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // #demo-tevams etc. opens that role and scrolls to the demo
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.replace(/^#demo-/, "");
      if (ROLES.some((r) => r.id === id)) {
        setRole(id as Role);
        document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const j = (next + ROLES.length) % ROLES.length;
    setRole(ROLES[j].id);
    tabs.current[j]?.focus();
  };

  const ctx = CONTEXT[role];
  return (
    <div id="demo-app" className="rounded-[1.75rem] border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10 sm:p-3">
      <div role="tablist" aria-label="Kieno akimis žiūrėti" className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {ROLES.map((r, i) => {
          const sel = role === r.id;
          return (
            <button
              key={r.id}
              ref={(el) => { tabs.current[i] = el; }}
              type="button"
              role="tab"
              id={`tab-${r.id}`}
              data-role={r.id}
              aria-selected={sel}
              aria-controls="demo-panel"
              tabIndex={sel ? 0 : -1}
              onClick={() => setRole(r.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`flex items-center gap-3 rounded-2xl p-2.5 text-left transition-colors sm:p-3.5 ${sel ? "bg-brand text-white" : "text-slate-700 hover:bg-slate-100"}`}
            >
              <span className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex ${sel ? "bg-white/15" : "bg-brand-soft text-brand"}`}>
                <r.Icon size={20} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold sm:text-base">{r.label}</span>
                <span className={`hidden text-sm leading-snug md:block ${sel ? "text-blue-100" : "text-slate-500"}`}>{r.title}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50 sm:mt-3">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-4">
          <Image src="/logo-removebg-preview.png" alt="" width={26} height={26} />
          <span className="font-extrabold text-slate-900">Dienynas</span>
          <span className="hidden h-5 w-px bg-slate-200 sm:block" aria-hidden />
          <span className="hidden min-w-0 truncate text-sm text-slate-500 sm:block">{ctx.where}</span>
          <span className="ml-auto flex items-center gap-2">
            <span className="relative rounded-full p-1.5 text-slate-500" aria-hidden>
              <Bell size={18} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
            </span>
            <span className="hidden text-right text-xs leading-tight text-slate-500 lg:block">{ctx.who}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white" aria-hidden>{ctx.initials}</span>
          </span>
        </div>
        <p className="border-b border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 sm:hidden">{ctx.where}</p>

        <div id="demo-panel" role="tabpanel" aria-labelledby={`tab-${role}`} className="p-2 sm:p-4">
          {role === "mokytojams" ? <TeacherView /> : role === "administracijai" ? <AdminView /> : <ParentView />}
        </div>
      </div>
    </div>
  );
}
