/**
 * Generated share preview image (Facebook, Messenger, WhatsApp, LinkedIn…). Inherited by every page.
 */

import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Tiksliukai.lt – korepetitoriai, kurie visada padės";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Renders the 1200×630 PNG with the logo and tagline. */
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/logo-removebg-preview.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          background: "#3B65CE", color: "white", padding: "64px 72px", fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", background: "white", borderRadius: 24, padding: 10 }}>
            <img src={logoSrc} width={72} height={72} alt="" />
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>Tiksliukai.lt</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1 }}>Korepetitoriai, kurie</div>
          <div style={{ display: "flex", marginTop: 12 }}>
            <div style={{ fontSize: 76, fontWeight: 800, background: "white", color: "#3B65CE", padding: "0 24px", borderRadius: 20 }}>
              visada padės
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 30 }}>
          {["25 € už 45 min.", "Google Meet", "1–12 klasės"].map((t) => (
            <div key={t} style={{ display: "flex", background: "rgba(255,255,255,0.15)", borderRadius: 16, padding: "12px 24px" }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
