/**
 * Signed career-test session cookie. Works in both the Edge middleware and Node API routes (Web Crypto).
 *
 * Token: `<expiresAtUnix>.<subject>.<hmacHex>` where subject is a PaymentIntent id or `code:<code>`.
 * The middleware checks the signature and expiry, so the cookie can't be forged or reused after expiry.
 */

export const TEST_COOKIE = "test_session_token";
export const TEST_SESSION_SECONDS = 60 * 60 * 4;

function secret() {
  // Dedicated secret preferred; ADMIN_SECRET is a fallback so existing deployments keep working.
  return process.env.TEST_SESSION_SECRET || process.env.ADMIN_SECRET || "";
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Creates a token valid for `seconds`. Throws if no secret is configured. */
export async function signTestSession(subject: string, seconds: number) {
  if (!secret()) throw new Error("TEST_SESSION_SECRET (or ADMIN_SECRET) is not set");
  const exp = Math.floor(Date.now() / 1000) + seconds;
  const body = `${exp}.${subject.replace(/\./g, "")}`;
  return `${body}.${await hmac(body)}`;
}

/** True if the token was signed by us and hasn't expired. */
export async function verifyTestSession(token: string | undefined) {
  if (!token || !secret()) return false;
  const i = token.lastIndexOf(".");
  if (i < 0) return false;
  const body = token.slice(0, i);
  const sig = token.slice(i + 1);
  const exp = Number(body.split(".")[0]);
  if (!Number.isFinite(exp) || exp * 1000 < Date.now()) return false;
  const expected = await hmac(body);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let k = 0; k < sig.length; k++) diff |= expected.charCodeAt(k) ^ sig.charCodeAt(k);
  return diff === 0;
}

/** Cookie options shared by the paid and the access-code flows. */
export const testCookieOptions = (maxAge: number) => ({
  name: TEST_COOKIE,
  httpOnly: true, // page JS never needs to read it
  secure: true,
  sameSite: "lax" as const,
  maxAge,
  path: "/",
});
