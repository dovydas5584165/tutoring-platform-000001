// app/api/redeem-code/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

const SESSION_SECONDS = 60 * 60 * 4; // same as a paid session

export async function POST(req: Request) {
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
  response.cookies.set({
    name: 'test_session_token',
    value: `code:${code}`,
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    // Never let the session outlive the code itself
    maxAge: Math.min(SESSION_SECONDS, secondsLeft),
    path: '/',
  });
  return response;
}
