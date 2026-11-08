"use client";

/**
 * Showreel video in a browser-style frame. Plays muted on a loop while it is on screen (not for
 * visitors who prefer reduced motion), with play/pause and full-screen buttons.
 */

import { useEffect, useRef, useState } from "react";
import { Maximize2, Pause, Play } from "lucide-react";

export default function Showreel({ src, poster, title, address }: { src: string; poster: string; title: string; address: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [showPlay, setShowPlay] = useState(false);
  const [failed, setFailed] = useState(false); // video missing or unsupported: the poster stays

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShowPlay(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !userPaused.current) v.play().catch(() => setShowPlay(true));
        else if (!e.isIntersecting) v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    // native controls only while full screen (there the frame's buttons are gone)
    const onFs = () => { v.controls = document.fullscreenElement === v; };
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      io.disconnect();
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      userPaused.current = false;
      v.play().catch(() => setShowPlay(true));
    } else {
      userPaused.current = true;
      v.pause();
      setShowPlay(true);
    }
  };

  const fullscreen = () => {
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (typeof v.requestFullscreen === "function") v.requestFullscreen().catch(() => {});
    else v.webkitEnterFullscreen?.(); // iPhone Safari
  };

  return (
    <figure className="overflow-hidden rounded-2xl bg-slate-900 shadow-2xl shadow-slate-900/30 ring-1 ring-slate-900/10 sm:rounded-3xl">
      <div className="flex items-center gap-3 bg-slate-800 px-3 py-2 sm:px-4">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
        </span>
        <span className="mx-auto min-w-0 truncate rounded-md bg-slate-900/70 px-3 py-0.5 text-xs text-slate-400">{address}</span>
        {!failed && (
          <>
            <button type="button" onClick={toggle} className="rounded-md p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white" aria-label={playing ? "Pristabdyti vaizdo įrašą" : "Paleisti vaizdo įrašą"}>
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button type="button" onClick={fullscreen} className="rounded-md p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white" aria-label="Visas ekranas">
              <Maximize2 size={16} />
            </button>
          </>
        )}
      </div>
      <div className="relative aspect-video bg-slate-100">
        <video
          ref={video}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={title}
          onPlay={() => { setPlaying(true); setShowPlay(false); }}
          onPause={() => setPlaying(false)}
        >
          <source src={src} type="video/mp4" onError={() => { setFailed(true); setPlaying(false); }} />
        </video>
        {showPlay && !playing && !failed && (
          <button type="button" onClick={toggle} className="group absolute inset-0 flex items-center justify-center bg-slate-900/10" aria-label="Paleisti vaizdo įrašą">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand shadow-xl transition-transform group-hover:scale-105 sm:h-20 sm:w-20">
              <Play size={30} className="translate-x-0.5" fill="currentColor" />
            </span>
          </button>
        )}
      </div>
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}
