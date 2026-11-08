/**
 * Records the /dienynas showreel (public/dienynas/showreel.mp4 + showreel-poster.jpg) by driving
 * the live interactive demo in headless Chromium: a drawn cursor, captions, title and end cards.
 * Re-run it after changing the demo so the video matches the page.
 *
 *   npm run dev                                  # or: npm run build && npm start
 *   node scripts/record-showreel.mjs             # BASE_URL=http://localhost:3000 by default
 *
 * Needs Playwright (with Chromium) and ffmpeg with libx264 on the machine; neither is a project
 * dependency because only this script uses them.
 */

import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const OUT_DIR = new URL("../public/dienynas/", import.meta.url).pathname;
const VIEWPORT = { width: 1280, height: 720 };
const SCALE = 1.25; // frames are 1600 × 900
const EMAIL = "info.tiksliukai@gmail.com";
const CRF = 29; // x264 quality: lower = sharper and bigger file

const frames = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- page-side helpers (overlay, cursor, captions) ---------- */

function installStage({ email }) {
  const css = document.createElement("style");
  css.textContent = `
    html, body { overflow: hidden !important; }
    body > header, nextjs-portal, [data-nextjs-toast] { display: none !important; }
    #demo-app { position: fixed !important; inset: 0 !important; z-index: 2147483000 !important; margin: 0 !important;
      border-radius: 0 !important; border: 0 !important; box-shadow: none !important; overflow-y: auto !important;
      padding: 14px 18px 120px !important; scrollbar-width: none; background: #fff !important; }
    #demo-app::-webkit-scrollbar { display: none; }
    #reel-cursor { position: fixed; z-index: 2147483647; left: 0; top: 0; width: 26px; height: 26px; pointer-events: none;
      transform: translate(-200px, -200px); filter: drop-shadow(0 2px 3px rgba(15,23,42,.35)); transition: scale .12s; }
    #reel-cursor.down { scale: .85; }
    #reel-cursor.hidden { opacity: 0; transition: opacity .3s; }
    .reel-ripple { position: fixed; z-index: 2147483646; width: 44px; height: 44px; margin: -22px 0 0 -22px; border-radius: 50%;
      background: rgba(59,101,206,.35); pointer-events: none; animation: reel-ripple .5s ease-out forwards; }
    @keyframes reel-ripple { from { transform: scale(.2); opacity: 1 } to { transform: scale(1.4); opacity: 0 } }
    #reel-caption { position: fixed; z-index: 2147483645; left: 50%; bottom: 26px; transform: translate(-50%, 12px); opacity: 0;
      transition: opacity .35s, transform .35s; background: rgba(15,23,42,.92); color: #fff; border-radius: 16px;
      padding: 12px 20px; font: 600 21px/1.3 var(--font-geist-sans), system-ui, sans-serif; box-shadow: 0 12px 32px rgba(15,23,42,.3);
      display: flex; gap: 12px; align-items: center; white-space: nowrap; pointer-events: none; }
    #reel-caption.on { opacity: 1; transform: translate(-50%, 0); }
    #reel-caption b { background: #3b65ce; border-radius: 9px; padding: 3px 10px; font-size: 16px; font-weight: 700; }
    #reel-card { position: fixed; inset: 0; z-index: 2147483644; background: #3b65ce; color: #fff; display: flex; flex-direction: column;
      align-items: center; justify-content: center; text-align: center; gap: 18px; transition: opacity .6s; font-family: var(--font-geist-sans), system-ui, sans-serif; }
    #reel-card.off { opacity: 0; pointer-events: none; }
    #reel-card .logo { width: 84px; height: 84px; border-radius: 24px; background: #fff; display: flex; align-items: center; justify-content: center; }
    #reel-card .logo img { width: 62px; height: 62px; }
    #reel-card .kicker { font-size: 22px; font-weight: 600; color: #dbe6ff; letter-spacing: .02em; }
    #reel-card h1 { font-size: 58px; line-height: 1.08; font-weight: 800; margin: 0; max-width: 980px; }
    #reel-card p { font-size: 26px; color: #e6edff; margin: 0; }
    #reel-card .pill { margin-top: 10px; background: #fff; color: #3b65ce; border-radius: 18px; padding: 14px 28px; font-size: 28px; font-weight: 800; }
  `;
  document.head.appendChild(css);

  const cursor = document.createElement("div");
  cursor.id = "reel-cursor";
  cursor.innerHTML = `<svg viewBox="0 0 26 26" width="26" height="26"><path d="M4 2.5 L4 21 L9 16.6 L12.4 24 L15.6 22.6 L12.3 15.5 L19 15.5 Z" fill="#0f172a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
  document.body.appendChild(cursor);
  addEventListener("mousemove", (e) => { cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 2}px)`; }, true);
  addEventListener("mousedown", (e) => {
    cursor.classList.add("down");
    const r = document.createElement("div");
    r.className = "reel-ripple";
    r.style.left = `${e.clientX}px`;
    r.style.top = `${e.clientY}px`;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 600);
  }, true);
  addEventListener("mouseup", () => cursor.classList.remove("down"), true);

  const cap = document.createElement("div");
  cap.id = "reel-caption";
  document.body.appendChild(cap);

  const card = document.createElement("div");
  card.id = "reel-card";
  document.body.appendChild(card);

  window.__reel = {
    caption(tag, text) {
      cap.classList.remove("on");
      setTimeout(() => {
        cap.replaceChildren();
        if (tag) { const b = document.createElement("b"); b.textContent = tag; cap.appendChild(b); }
        cap.appendChild(document.createTextNode(text));
        if (text) cap.classList.add("on");
      }, text ? 260 : 0);
    },
    card(kind) {
      card.innerHTML = kind === "title"
        ? `<div class="logo"><img src="/logo-removebg-preview.png" alt=""></div>
           <div class="kicker">Tiksliukai.lt · Dienynas mokykloms</div>
           <h1>Modernus el. dienynas su nemokama analitika</h1>
           <p>Mokytojams · Administracijai · Tėvams</p>`
        : `<div class="logo"><img src="/logo-removebg-preview.png" alt=""></div>
           <h1>Užsakykite demonstraciją</h1>
           <p>Parodysime, kaip tai veiktų jūsų mokykloje</p>
           <div class="pill">${email}</div>
           <p style="font-size:22px;color:#dbe6ff">tiksliukai.lt/dienynas</p>`;
      card.classList.remove("off");
      cursor.classList.toggle("hidden", kind === "end");
    },
    hideCard() { card.classList.add("off"); },
    /** Smoothly scroll the nearest inner scroll box (e.g. the gradebook) so `selector` is in its middle. */
    reveal(selector, ms = 700) {
      const el = document.querySelector(selector);
      let box = el && el.parentElement;
      while (box && box.id !== "demo-app" && !(box.scrollHeight > box.clientHeight && getComputedStyle(box).overflowY !== "visible")) box = box.parentElement;
      if (!el || !box || box.id === "demo-app") return Promise.resolve();
      const from = box.scrollTop;
      const to = Math.max(0, from + el.getBoundingClientRect().top - box.getBoundingClientRect().top - box.clientHeight / 2);
      const t0 = performance.now();
      return new Promise((done) => {
        const step = (now) => {
          const k = Math.min(1, (now - t0) / ms);
          box.scrollTop = from + (to - from) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
          k < 1 ? requestAnimationFrame(step) : done();
        };
        requestAnimationFrame(step);
      });
    },
    /** Smoothly scroll the demo so `selector` sits `offset` px from the top. */
    scrollTo(selector, offset = 16, ms = 1100) {
      const box = document.getElementById("demo-app");
      const el = selector ? document.querySelector(selector) : null;
      const from = box.scrollTop;
      const to = el ? from + el.getBoundingClientRect().top - offset : 0;
      const t0 = performance.now();
      return new Promise((done) => {
        const step = (now) => {
          const k = Math.min(1, (now - t0) / ms);
          const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
          box.scrollTop = from + (to - from) * e;
          k < 1 ? requestAnimationFrame(step) : done();
        };
        requestAnimationFrame(step);
      });
    },
  };
}

/* ---------- recording ---------- */

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: SCALE, reducedMotion: "no-preference" });
  await context.addInitScript(() => localStorage.setItem("tk-cookie-consent", JSON.stringify({ analytics: false, marketing: false })));
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/dienynas`, { waitUntil: "networkidle" });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.evaluate(installStage, { email: EMAIL });
  await page.evaluate(() => window.__reel.card("title"));
  await sleep(600);

  let pos = { x: 1180, y: 660 };
  /** Glide the drawn cursor to a point with ease-in-out; takes `ms` of wall-clock time. */
  const glide = async (x, y, ms = 600) => {
    const from = { ...pos };
    const t0 = Date.now();
    for (;;) {
      const k = Math.min(1, (Date.now() - t0) / ms);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      pos = { x: from.x + (x - from.x) * e, y: from.y + (y - from.y) * e };
      await page.mouse.move(pos.x, pos.y);
      if (k >= 1) break;
      await sleep(8);
    }
  };
  const center = async (selector, dx = 0.5, dy = 0.5) => {
    const b = await page.locator(selector).first().boundingBox();
    if (!b) throw new Error(`not visible: ${selector}`);
    return { x: b.x + b.width * dx, y: b.y + b.height * dy };
  };
  const hover = async (selector, ms = 600, dx, dy) => { const p = await center(selector, dx, dy); await glide(p.x, p.y, ms); };
  const click = async (selector, ms) => { await hover(selector, ms); await page.mouse.down(); await sleep(90); await page.mouse.up(); };
  const caption = (tag, text) => page.evaluate(([a, b]) => window.__reel.caption(a, b), [tag, text]);
  const scrollTo = (selector, offset) => page.evaluate(([s, o]) => window.__reel.scrollTo(s, o, 900), [selector, offset]);
  const reveal = (selector) => page.evaluate((s) => window.__reel.reveal(s), selector);

  // start capturing
  const cdp = await context.newCDPSession(page);
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    frames.push({ data, t: metadata.timestamp });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: VIEWPORT.width * SCALE, maxHeight: VIEWPORT.height * SCALE });
  const start = Date.now();

  // 1. title card
  await sleep(2400);
  await page.evaluate(() => window.__reel.hideCard());
  await page.mouse.move(pos.x, pos.y);
  await sleep(400);

  // 2. teacher: gradebook, forecasts, the student card, risk group
  await caption("Mokytojui", "Visa klasė ir pusmečio prognozė viename ekrane");
  await hover('#demo-gradebook th:nth-child(10) [tabindex="0"]', 700);
  await sleep(1000);
  await hover('#demo-gradebook th:nth-child(12) [tabindex="0"]', 500);
  await sleep(1100);
  await reveal('#demo-gradebook tr[data-student="Matas P."]');
  await click('#demo-gradebook tr[data-student="Matas P."] td:first-child', 600);
  await sleep(400);
  await hover("#demo-student .bg-amber-50, #demo-student .bg-red-50", 600);
  await sleep(1200);
  await caption("Mokytojui", "Rizikos grupė – kol dar ne vėlu");
  await click('#demo-gradebook button[aria-pressed="false"]', 600);
  await sleep(1300);
  await click('#demo-gradebook button[aria-pressed="false"]', 400);
  await reveal('#demo-gradebook tr[data-student="Adomas N."]');

  // 3. teacher: skills + question analysis
  await caption("Mokytojui", "Ko trūksta klasei ir ką verta pakartoti");
  await scrollTo("#demo-skills", 24);
  await hover('#demo-skills [role="group"] [tabindex="0"]', 700, 0.25);
  await sleep(1300);
  await caption("Mokytojui", "Kontrolinio užduočių analizė");
  await hover('#demo-questions [role="group"] > div > div:nth-child(6) [tabindex="0"]', 600, 0.2);
  await sleep(1100);
  await hover('#demo-questions [role="group"] > div > div:nth-child(8) [tabindex="0"]', 400, 0.2);
  await sleep(1300);

  // 4. administration
  await caption("", "");
  await scrollTo(null);
  await click('[data-role="administracijai"]', 700);
  await sleep(400);
  await caption("Administracijai", "Ar visi mokytojai vertina vienodai?");
  await scrollTo("#demo-teachers", 20);
  await hover('#demo-teachers [role="group"] button[aria-label^="J. Kazlauskienė"]', 600, 0.6);
  await sleep(1100);
  await click('#demo-teachers [role="group"] button[aria-label^="T. Jankauskas"]', 700);
  await sleep(1200);
  await caption("Administracijai", "Ta pati tema – skirtingas testų sudėtingumas");
  await scrollTo("#demo-shared", 20);
  await hover('#demo-shared [role="group"] [tabindex="0"]', 600, 0.7);
  await sleep(900);
  await hover('#demo-shared [role="group"] [tabindex="0"] >> nth=1', 400, 0.6);
  await sleep(1100);
  await caption("Administracijai", "Visa mokykla: klasių ir dalykų vidurkiai");
  await hover('#demo-heatmap [role="group"] [tabindex="0"] >> nth=7', 700);
  await sleep(1000);
  await hover('#demo-heatmap [role="group"] [tabindex="0"] >> nth=46', 600);
  await sleep(1100);

  // 5. parents
  await caption("", "");
  await scrollTo(null);
  await click('[data-role="tevams"]', 700);
  await sleep(400);
  await caption("Tėvams", "Įžvalgos paprasta kalba – ne vien skaičiai");
  await hover("#demo-insights li", 700, 0.3);
  await sleep(1700);
  await caption("Tėvams", "Tikėtinas pusmečio pažymys ir „Ko reikia norint gauti 7?“");
  await scrollTo("#demo-trend", 20);
  const chart = await page.locator('#demo-trend svg[role="img"]').first().boundingBox();
  if (chart) {
    await glide(chart.x + chart.width * 0.25, chart.y + chart.height * 0.5, 600);
    await glide(chart.x + chart.width * 0.93, chart.y + chart.height * 0.55, 1400);
    await sleep(400);
  }
  await click('#demo-whatif [data-target="8"]', 700);
  await sleep(1100);
  await click('#demo-whatif [data-target="7"]', 400);
  await sleep(1300);
  await caption("", "");

  // 6. end card
  await page.evaluate(() => window.__reel.card("end"));
  await sleep(3200);
  const end = Date.now();
  await cdp.send("Page.stopScreencast");
  await browser.close();
  console.log(`recorded ${frames.length} frames over ${((end - start) / 1000).toFixed(1)} s`);
  encode((end - start) / 1000);
}

/* ---------- frames → mp4 + poster ---------- */

function encode(total) {
  const dir = mkdtempSync(join(tmpdir(), "showreel-"));
  try {
    const t0 = frames[0].t;
    let list = "";
    frames.forEach((f, i) => {
      const name = `f${String(i).padStart(5, "0")}.jpg`;
      writeFileSync(join(dir, name), Buffer.from(f.data, "base64"));
      const next = i + 1 < frames.length ? frames[i + 1].t : t0 + total;
      list += `file '${name}'\nduration ${Math.max(0.001, next - f.t).toFixed(4)}\n`;
    });
    list += `file 'f${String(frames.length - 1).padStart(5, "0")}.jpg'\n`; // concat demuxer needs the last frame twice
    writeFileSync(join(dir, "list.txt"), list);

    const mp4 = join(OUT_DIR, "showreel.mp4");
    execFileSync("ffmpeg", [
      "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(dir, "list.txt"),
      "-vf", "fps=30,scale=1600:900:flags=lanczos,format=yuv420p",
      "-c:v", "libx264", "-preset", "slow", "-crf", String(CRF), "-tune", "animation", "-profile:v", "high", "-g", "60",
      "-movflags", "+faststart", "-an", mp4,
    ], { stdio: "inherit" });
    // poster: the title card
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "1.2", "-i", mp4, "-frames:v", "1", "-q:v", "4", join(OUT_DIR, "showreel-poster.jpg")], { stdio: "inherit" });
    console.log(`wrote ${mp4} and showreel-poster.jpg`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
