/**
 * Career-test access codes: admin password check and random code generation.
 */

import { NextRequest } from "next/server";

/** Admin endpoints are protected by a shared password in the ADMIN_SECRET env var. */
export function isAdmin(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  return !!secret && req.headers.get("x-admin-secret") === secret;
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
