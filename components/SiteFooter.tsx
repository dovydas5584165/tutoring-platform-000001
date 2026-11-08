/**
 * Site footer: contacts, socials and legal links.
 */

import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import { CookieSettingsButton } from "./CookieConsent";
import { SELLER } from "@/lib/site";

/** Shared footer: contacts, socials and legal links. */
export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5 text-sm text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo-removebg-preview.png" alt="" width={28} height={28} />
            <span>© {new Date().getFullYear()} Tiksliukai.lt</span>
          </div>
          <a href="mailto:info.tiksliukai@gmail.com" className="hover:text-brand flex items-center gap-1.5">
            <Mail size={16} /> info.tiksliukai@gmail.com
          </a>
          <div className="flex gap-4 text-2xl">
            <a href="https://www.instagram.com/tiksliukai.lt/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-pink-500 hover:text-pink-600"><FaInstagram /></a>
            <a href="https://www.facebook.com/tiksliukai" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-blue-600 hover:text-blue-700"><FaFacebook /></a>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2 border-t border-slate-100 pt-4">
          <Link href="/privatumo-politika" className="hover:text-brand">Privatumo politika</Link>
          <Link href="/taisykles" className="hover:text-brand">Naudojimosi taisyklės</Link>
          <Link href="/sutarties-atsisakymas" className="hover:text-brand">Atsisakyti sutarties</Link>
          <CookieSettingsButton className="hover:text-brand" />
        </nav>
        <p className="text-xs text-slate-400 text-center sm:text-left">
          Paslaugas teikia {SELLER.name}, {SELLER.legalForm}{SELLER.code ? `, pažymos nr. ${SELLER.code}` : ""}
          {SELLER.vatCode ? `, PVM kodas ${SELLER.vatCode}` : ""}, {SELLER.address}.
        </p>
      </div>
    </footer>
  );
}
