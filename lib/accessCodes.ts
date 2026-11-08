/**
 * Career-test access codes: admin password check and random code generation.
 */

import { NextRequest } from "next/server";
import { clientIp, rateLimit, safeEqual, underLimit } from "./security";

/** Shorter admin passwords are refused outright: they can be brute-forced. */
const MIN_ADMIN_SECRET_LENGTH = 16;

/**
 * Admin endpoints are protected by a shared password in the ADMIN_SECRET env var (16+ characters).
 * Constant-time compare; an IP that gets it wrong 10 times in 15 minutes is locked out for that window.
 */
export function isAdmin(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < MIN_ADMIN_SECRET_LENGTH) {
    if (secret) console.error(`ADMIN_SECRET is too short (min ${MIN_ADMIN_SECRET_LENGTH} chars); admin access disabled.`);
    return false;
  }
  const given = req.headers.get("x-admin-secret");
  if (!given) return false;
  const key = `admin-fail:${clientIp(req)}`;
  if (!underLimit(key, 10, 15 * 60_000)) return false;
  if (safeEqual(given, secret)) return true;
  rateLimit(key, 10, 15 * 60_000); // count the failure
  return false;
}

export type AccessCodeRow = {
  code: string;
  company: string;
  created_at: string;
  expires_at: string;
  active: boolean;
  uses: number;
};

/** Readable random code, e.g. "imone-7k3m9q" */
export function generateCode(company: string) {
  const prefix = company
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 10) || "kodas";
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const suffix = Array.from(bytes, (b) => chars[b % chars.length]).join("");
  return `${prefix}-${suffix}`;
}
