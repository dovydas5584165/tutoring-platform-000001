/**
 * Custom 404 page.
 */

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SUBJECTS } from "@/lib/subjects";

export const metadata: Metadata = {
  title: "Puslapis nerastas",
  robots: { index: false, follow: true },
};

/** Shown for any unknown URL. */
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-white text-slate-900">
      <div className="max-w-lg w-full text-center">
        <Link href="/" className="inline-block mb-8" aria-label="Tiksliukai.lt">
          <Image src="/logo-removebg-preview.png" alt="Tiksliukai.lt" width={56} height={56} />
        </Link>
        <p className="text-7xl font-extrabold text-[#3B65CE]">404</p>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold">Šio puslapio nėra</h1>
        <p className="mt-3 text-slate-600">
          Gal nuoroda pasikeitė arba įsivėlė klaida. Pradėkite iš pradžių arba iškart pasirinkite pamoką.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="px-6 py-3 rounded-xl bg-[#3B65CE] text-white font-semibold hover:bg-[#2f54b3]">
            Į pradžią
          </Link>
          <Link href="/#pamokos" className="px-6 py-3 rounded-xl border border-slate-300 font-semibold hover:bg-slate-50">
            Visos pamokos
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {SUBJECTS.map((s) => (
            <Link key={s.slug} href={`/schedule/${s.slug}`} className="text-sm px-3 py-1.5 rounded-full bg-blue-50 text-[#3B65CE] font-medium hover:bg-blue-100">
              {s.name}
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-slate-500">
          Reikia pagalbos? Rašykite <a href="mailto:info.tiksliukai@gmail.com" className="underline">info.tiksliukai@gmail.com</a>
        </p>
      </div>
    </main>
  );
}
