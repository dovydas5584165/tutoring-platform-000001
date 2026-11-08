/**
 * Consumer withdrawal from a distance contract: emails the request and an acknowledgement.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "../../../lib/email";
import { CONTACT_EMAIL } from "../../../lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/**
 * Consumer withdrawal from a distance contract. The consumer must get an acknowledgement
 * on a durable medium (email) with the content, date and time of the withdrawal.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.website) return NextResponse.json({ success: true }); // bot

    const name = str(body.name, 120);
    const email = str(body.email, 120).toLowerCase();
    const service = str(body.service, 80);
    const contract = str(body.contract, 300);

    if (name.length < 3) return bad("Įveskite vardą ir pavardę.");
    if (!EMAIL_RE.test(email)) return bad("Įveskite teisingą el. paštą.");
    if (!service) return bad("Pasirinkite paslaugą.");

    const when = new Date().toLocaleString("lt-LT", { timeZone: "Europe/Vilnius", dateStyle: "long", timeStyle: "medium" });
    const details = `
      <ul>
        <li><b>Vardas, pavardė:</b> ${esc(name)}</li>
        <li><b>El. paštas:</b> ${esc(email)}</li>
        <li><b>Paslauga:</b> ${esc(service)}</li>
        ${contract ? `<li><b>Užsakymo informacija:</b> ${esc(contract)}</li>` : ""}
        <li><b>Gauta:</b> ${esc(when)} (Lietuvos laiku)</li>
      </ul>`;

    const toAdmin = await sendEmail({
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Sutarties atsisakymas: ${service} – ${name}`,
      html: `<p>Klientas atsisakė sutarties. Grąžinkite sumokėtus pinigus per 14 dienų.</p>${details}`,
    });
    if (!toAdmin.success) {
      return NextResponse.json(
        { error: `Nepavyko išsiųsti. Parašykite apie atsisakymą el. paštu ${CONTACT_EMAIL}.` },
        { status: 500 }
      );
    }

    await sendEmail({
      to: email,
      replyTo: CONTACT_EMAIL,
      subject: "Gavome jūsų sutarties atsisakymą",
      html: `<p>Sveiki,</p>
        <p>patvirtiname, kad gavome jūsų pranešimą apie sutarties atsisakymą:</p>
        ${details}
        <p>Jei už paslaugą jau sumokėjote, pinigus grąžinsime ne vėliau kaip per 14 dienų tuo pačiu būdu, kuriuo mokėjote.
        Jei klausimų turite, tiesiog atsakykite į šį laišką.</p>
        <p>Tiksliukai.lt</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("withdrawal POST error:", e);
    return NextResponse.json({ error: "Vidinė serverio klaida" }, { status: 500 });
  }
}

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });
