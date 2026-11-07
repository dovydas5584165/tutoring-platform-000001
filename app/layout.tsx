import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DESCRIPTION =
  "Individualios nuotolinės matematikos, fizikos, chemijos, biologijos, IT ir anglų kalbos pamokos 1–12 klasių mokiniams. 25 € už 45 min.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tiksliukai.lt – korepetitoriai 1–12 klasių mokiniams",
    template: "%s | Tiksliukai.lt",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "lt_LT",
    siteName: SITE_NAME,
    title: "Tiksliukai.lt – korepetitoriai, kurie visada padės",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiksliukai.lt – korepetitoriai, kurie visada padės",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#3B65CE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        {/* Google Analytics, Tag Manager and the Meta Pixel load only after consent */}
        <CookieConsent />
      </body>
    </html>
  );
}
