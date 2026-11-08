"use client";

/**
 * Cookie consent banner and settings; loads analytics/marketing trackers only after consent.
 */

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";

/*
 * Cookie consent (GDPR + Lithuanian Law on Electronic Communications, Art. 61).
 * Per category: Google Analytics + Tag Manager load only with "statistics" consent,
 * the Meta (Facebook) Pixel only with "marketing" consent. Essential storage always works.
 * Anywhere on the site, call openCookieSettings() to show the banner again.
 */

const KEY = "tk-cookie-consent";
const EVENT = "tk-open-cookie-settings";
const GA_ID = "G-CP50RV65SV";
const GTM_ID = "GTM-PCFWWKBF";
const FB_PIXEL_ID = "1256062859918317";

type Choice = { analytics: boolean; marketing: boolean };

/** Re-opens the cookie settings dialog (e.g. from a footer link). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(EVENT));
}

/** Saved consent choice from localStorage, or null if the visitor hasn't chosen yet. */
function readChoice(): Choice | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!v) return null;
    // Older saved format: { value: "granted" | "denied" }
    if (v.value === "granted") return { analytics: true, marketing: true };
    if (v.value === "denied") return { analytics: false, marketing: false };
    if (typeof v.analytics === "boolean" && typeof v.marketing === "boolean") {
      return { analytics: v.analytics, marketing: v.marketing };
    }
    return null;
  } catch {
    return null;
  }
}

/** Banner + settings dialog; renders trackers only for the categories the visitor accepted. */
export default function CookieConsent() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const c = readChoice();
    setChoice(c);
    setAnalytics(c?.analytics ?? false);
    setMarketing(c?.marketing ?? false);
    setOpen(c === null);
    const reopen = () => {
      const cur = readChoice();
      setAnalytics(cur?.analytics ?? false);
      setMarketing(cur?.marketing ?? false);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(EVENT, reopen);
    return () => window.removeEventListener(EVENT, reopen);
  }, []);

  const save = (value: Choice) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...value, date: new Date().toISOString() }));
    } catch {}
    const withdrawing = (choice?.analytics && !value.analytics) || (choice?.marketing && !value.marketing);
    setChoice(value);
    setOpen(false);
    // Already-loaded trackers can't be unloaded; a reload starts the page without them.
    if (withdrawing) window.location.reload();
  };

  const btn = "py-2.5 rounded-xl font-semibold text-sm";

  return (
    <>
      {choice?.analytics && <AnalyticsTrackers />}
      {choice?.marketing && <MarketingTrackers />}

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
              Būtinieji slapukai reikalingi svetainei veikti. Jūsų sutikimu naudosime ir statistikos (Google Analytics)
              bei rinkodaros (Meta) slapukus. Sutikimą bet kada galite atšaukti.{" "}
              <Link href="/privatumo-politika#slapukai" className="underline text-[#3B65CE]">Daugiau</Link>
            </p>

            {details && (
              <div className="mt-3 space-y-2 text-sm">
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked disabled className="mt-0.5 h-4 w-4" />
                  <span><b>Būtinieji</b> – prisijungimas, jūsų pasirinkimai. Visada įjungti.</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#3B65CE]" />
                  <span><b>Statistikos</b> – lankomumo matavimas (Google Analytics, Google Tag Manager).</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#3B65CE]" />
                  <span><b>Rinkodaros</b> – reklamos efektyvumo matavimas (Meta Pixel).</span>
                </label>
              </div>
            )}

            {/* "Reject" is as easy and as visible as "Accept" */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => save({ analytics: false, marketing: false })} className={`${btn} border border-slate-300 hover:bg-slate-50`}>
                Tik būtini
              </button>
              <button onClick={() => save({ analytics: true, marketing: true })} className={`${btn} border border-slate-300 hover:bg-slate-50`}>
                Sutinku su visais
              </button>
              {details ? (
                <button onClick={() => save({ analytics, marketing })} className={`${btn} col-span-2 bg-[#3B65CE] text-white hover:bg-[#2f54b3]`}>
                  Išsaugoti pasirinkimą
                </button>
              ) : (
                <button onClick={() => setDetails(true)} className={`${btn} col-span-2 text-[#3B65CE] hover:bg-blue-50`}>
                  Pasirinkti pagal kategorijas
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Google Analytics / Tag Manager scripts. */
function AnalyticsTrackers() {
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
    </>
  );
}

/** Facebook Pixel script. */
function MarketingTrackers() {
  return (
    <>
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
