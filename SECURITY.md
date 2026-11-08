# Security checklist

How each common web-app vulnerability is handled in this project. "Code" = fixed in the repo,
"Dashboard" = a setting you must turn on yourself.

| # | Vulnerability | Status |
|---|---|---|
| 1 | Next.js header | Code: `poweredByHeader: false` (no `X-Powered-By`). Next 16 is not affected by the `x-middleware-subrequest` bypass (CVE-2025-29927); keep `next` updated. |
| 2 | `.git` folder | Code: middleware returns 404 for `/.git/*` and `/.env*`. Vercel never deploys `.git` anyway. |
| 3 | Supabase storage | `supabase/storage_privacy.sql`: `invoices` private; `teacher photos` public on purpose. Photo uploads go through the API with server-chosen file names. |
| 4 | Price from the browser | Code: all Stripe amounts come from the server. Bookings are only marked paid if the PaymentIntent was created *for that booking* and covers its `total_price` (`paymentCoversBooking`). Career test requires a `career_test` PaymentIntent for the full price. |
| 5 | Credential stuffing | Code: rate limits on registration, admin password, access codes; min password 8. **Dashboard:** Supabase → Auth → enable CAPTCHA (Turnstile) and "Leaked password protection"; keep Auth rate limits on. |
| 6 | Open database | Code: browser no longer writes `bookings` / `purchases`; server uses the service-role key. **Run `supabase/security_hardening.sql`** and drop any permissive write policy it lists. |
| 7 | Polyfill.io | Not used. Only third-party script is Google Analytics, loaded after cookie consent. |
| 8 | SMS pumping | Not applicable (no SMS sent). Email-sending forms are rate limited. |
| 9 | Prompt injection | Not applicable (no LLM features). |
| 10 | Weak JWT secret | Supabase signs JWTs (managed). `ADMIN_SECRET` must be 16+ chars (shorter = admin disabled), compared in constant time, 10 wrong tries / 15 min per IP. Test-session cookie is HMAC-signed with `TEST_SESSION_SECRET`. |
| 11 | Race condition | Lesson claim is atomic (`update … where status='open'`). SQL adds unique indexes for webhook payment records and open lesson requests. Booking notifications already unique. |
| 12 | Account pre-hijacking | Code: registration creates an *unconfirmed* user and emails a confirmation link; the account works only after the mailbox owner clicks it. |
| 13 | Subdomain takeover | DNS, not code: delete any CNAME (e.g. old Vercel/GitHub Pages/Netlify) that points to a service you no longer use. |
| 14 | SSRF | Server never fetches user-supplied URLs; tutor photo URLs must point to our Supabase storage. |
| 15 | Path traversal | Upload paths are built on the server from ids + timestamps, never from user input. |
| 16 | Reset poisoning | Reset link `redirectTo` is hard-coded to `https://tiksliukai.lt/...`, not taken from the Host header. **Dashboard:** keep Supabase Auth → URL Configuration → Redirect URLs limited to your domains. |
| 17 | Source maps | Code: `productionBrowserSourceMaps: false`. |
| 18 | Clickjacking | Code: `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`. |
| 19 | Open redirect | No user-controlled redirects (all `router.push` targets are fixed paths or own ids). |
| 20 | User enumeration | Code: registration and forgot-password give the same answer whether or not the email exists; login says only "wrong credentials". |

## Required environment variables (new / changed)

- `TEST_SESSION_SECRET` – random 32+ chars, signs the career-test cookie (falls back to `ADMIN_SECRET`).
- `ADMIN_SECRET` – must be **at least 16 characters** now.

Generate one with: `openssl rand -hex 32`

## Supabase dashboard

- Auth → Providers → Email: **Confirm email = ON** (registration relies on it).
- Auth → URL Configuration → Redirect URLs: include `https://www.tiksliukai.lt/auth/log-in` and `https://tiksliukai.lt/atnaujinti_slaptazodi`.
- Auth → Attack protection: CAPTCHA + leaked password protection.

## Limits

The in-memory rate limiter (`lib/security.ts`) is per server instance. For hard limits add Vercel Firewall
rate-limit rules for `/api/registration`, `/api/redeem-code`, `/api/lesson-requests`, `/api/withdrawal`.
