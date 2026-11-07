"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";

/*
 * Cookie consent (GDPR). Google Analytics, Google Tag Manager and the Meta (Facebook) Pixel
 * load ONLY after the visitor clicks "Sutinku". Essential storage (login session, this choice) always works.
 * Anywhere on the site, call openCookieSettings() to show the banner again.
 */

const KEY = "tk-cookie-consent";
const EVENT = "tk-open-cookie-settings";
const GA_ID = "G-CP50RV65SV";
const GTM_ID = "GTM-PCFWWKBF";
const FB_PIXEL_ID = "1256062859918317";

type Choice = "granted" | "denied";

export function openCookieSettings() {
  window.dispatchEvent(new Event(EVENT));
}

function readChoice(): Choice | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v?.value === "granted" || v?.value === "denied" ? v.value : null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = readChoice();
    setChoice(c);
    setOpen(c === null);
    const reopen = () => setOpen(true);
    window.addEventListener(EVENT, reopen);
    return () => window.removeEventListener(EVENT, reopen);
  }, []);

  const save = (value: Choice) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ value, date: new Date().toISOString() }));
    } catch {}
    const withdrawing = choice === "granted" && value === "denied";
    setChoice(value);
    setOpen(false);
    // Already-loaded trackers can't be unloaded; a reload starts the page without them.
    if (withdrawing) window.location.reload();
  };

  return (
    <>
      {choice === "granted" && <Trackers />}

      {open && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Slapukų nustatymai"
          className="fixed z-[100] inset-x-0 bottom-0 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md"
        >
          <div className="m-3 sm:m-0 rounded-2xl bg-white text-slate-800 shadow-2xl ring-1 ring-black/10 p-5">
            <p className="font-bold text-slate-900 mb-1">🍪 Slapukai</p>
            <p className="text-sm leading-relaxed text-slate-600">
              Būtinieji slapukai reikalingi svetainei veikti. Jei sutiksite, naudosime ir statistikos bei rinkodaros slapukus
              (Google Analytics, Meta), kad žinotume, kaip lankytojai naudojasi svetaine.{" "}
              <Link href="/privatumo-politika#slapukai" className="underline text-[#3B65CE]">Daugiau</Link>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => save("denied")} className="py-2.5 rounded-xl border border-slate-300 font-semibold text-sm hover:bg-slate-50">
                Tik būtini
              </button>
              <button onClick={() => save("granted")} className="py-2.5 rounded-xl bg-[#3B65CE] text-white font-semibold text-sm hover:bg-[#2f54b3]">
                Sutinku
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Trackers() {
  return (
    <>
      {/* Google Analytics */}
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
        }}
      />
      {/* Google Tag Manager */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
              j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
      {/* Meta (Facebook) Pixel */}
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  );
}

/** Small link/button for footers and the privacy page. */
export function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Slapukų nustatymai
    </button>
  );
}
