import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tiksliukai.lt",
  description: "Aiškiau. Tiksliau. Suprantamiau",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Tiksliukai.lt",
    description: "Aiškiau. Tiksliau. Suprantamiau",
    url: "https://tiksliukai.lt",
    images: [
      {
        url: "/favicon.ico", // your logo in /public
        width: 512,
        height: 512,
      },
    ],
    siteName: "Tiksliukai.lt",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiksliukai.lt",
    description: "Aiškiau. Tiksliau. Suprantamiau",
    images: ["/favicon.ico"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lt">
      <head>
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-CP50RV65SV"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-CP50RV65SV');
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
