/**
 * Shared layout for legal pages (privacy policy, terms, withdrawal).
 */

import Link from "next/link";
import Image from "next/image";
import SiteFooter from "./SiteFooter";

/** Simple readable layout for the privacy policy and terms. */
export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold">
            <Image src="/logo-removebg-preview.png" alt="" width={36} height={36} /> Tiksliukai.lt
          </Link>
          <Link href="/#pamokos" className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#3B65CE] text-white">Pamokos</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Atnaujinta {updated}</p>
        <div className="legal mt-8 space-y-4 text-slate-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-10 [&_h2]:mb-2 [&_h2]:scroll-mt-20 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-[#3B65CE] [&_a]:underline [&_table]:w-full [&_table]:text-sm [&_th]:text-left [&_th]:p-2 [&_th]:bg-slate-50 [&_td]:p-2 [&_td]:border-t [&_td]:border-slate-200 [&_td]:align-top">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
