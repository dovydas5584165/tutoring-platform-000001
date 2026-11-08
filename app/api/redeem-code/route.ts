/**
 * Career test: redeems a company access code and sets the `test_session_token` cookie.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { signTestSession, testCookieOptions, TEST_SESSION_SECONDS as SESSION_SECONDS } from '../../../lib/testSession';
import { clientIp, rateLimit, tooMany } from '../../../lib/security';

/** Body: { code }. Sets the test session cookie if the code exists, is active and hasn't expired. */
export async function POST(req: Request) {
  // Codes are guessable words, so limit guesses per IP
  if (!rateLimit(`redeem:${clientIp(req)}`, 10, 15 * 60_000)) return tooMany();
  let code = '';
  try {
    const body = await req.json();
    code = String(body?.code ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  if (!code) return NextResponse.json({ error: 'Neteisingas kodas.' }, { status: 401 });

  const { data: row, error } = await supabaseAdmin
    .from('access_codes')
    .select('code, expires_at, active, uses')
    .eq('code', code)
    .maybeSingle();

  if (error) {
    console.error('access_codes lookup failed:', error);
    return NextResponse.json({ error: 'Nepavyko patikrinti kodo.' }, { status: 500 });
  }
  if (!row || !row.active) {
    return NextResponse.json({ error: 'Neteisingas kodas.' }, { status: 401 });
  }

  const secondsLeft = Math.floor((new Date(row.expires_at).getTime() - Date.now()) / 1000);
  if (secondsLeft <= 0) {
    return NextResponse.json(
      { error: 'Šio kodo galiojimas baigėsi. Susisiekite su mumis dėl prenumeratos pratęsimo.' },
      { status: 403 }
    );
  }

  // Usage counter (best effort, not critical)
  await supabaseAdmin.from('access_codes').update({ uses: (row.uses ?? 0) + 1 }).eq('code', code);

  const response = NextResponse.json({ url: '/test' });
  // Never let the session outlive the code itself
  const maxAge = Math.min(SESSION_SECONDS, secondsLeft);
  response.cookies.set({ ...testCookieOptions(maxAge), value: await signTestSession(`code:${code}`, maxAge) });
  return response;
}
