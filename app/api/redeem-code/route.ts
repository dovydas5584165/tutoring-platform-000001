// app/api/redeem-code/route.ts
import { NextResponse } from 'next/server';

const ACCESS_CODE = 'gruzdziai';
const TEST_URL = '/test-start?payment_intent=pi_3SuJh43JaNQeVNtM0AgvnIeI';

export async function POST(req: Request) {
  let code = '';
  try {
    const body = await req.json();
    code = String(body?.code ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  if (code !== ACCESS_CODE) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
  }

  return NextResponse.json({ url: TEST_URL });
}
