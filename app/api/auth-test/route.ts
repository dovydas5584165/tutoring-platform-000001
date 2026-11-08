/**
 * Career test: verifies a succeeded Stripe payment for the career test, records it and sets the signed
 * `test_session_token` cookie.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { signTestSession, testCookieOptions, TEST_SESSION_SECONDS } from '../../../lib/testSession';
import { clientIp, rateLimit, tooMany } from '../../../lib/security';
import { getServerStripe, TEST_PRICE_CENTS } from '../../../lib/stripe';

/** Body: { paymentIntentId }. Grants a 4-hour test session cookie if the career-test payment succeeded. */
export async function POST(req: Request) {
  if (!rateLimit(`auth-test:${clientIp(req)}`, 20, 10 * 60_000)) return tooMany();
  try {
    const { paymentIntentId } = await req.json().catch(() => ({}));
    if (typeof paymentIntentId !== 'string' || !/^pi_[A-Za-z0-9]{8,64}$/.test(paymentIntentId)) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const payment = await getServerStripe().paymentIntents.retrieve(paymentIntentId);

    // Must be a paid career-test intent for the full price, not some other (cheaper) payment
    const isCareerTest =
      payment.metadata?.product_type === 'career_test' &&
      payment.currency === 'eur' &&
      payment.amount_received >= TEST_PRICE_CENTS;
    if (payment.status !== 'succeeded' || !isCareerTest) {
      return NextResponse.json({ error: 'Mokėjimas nebaigtas' }, { status: 403 });
    }

    await supabaseAdmin.from('purchases').upsert(
      { payment_intent_id: paymentIntentId, amount: payment.amount, status: 'paid' },
      { onConflict: 'payment_intent_id' }
    );

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      ...testCookieOptions(TEST_SESSION_SECONDS),
      value: await signTestSession(paymentIntentId, TEST_SESSION_SECONDS),
    });
    return response;
  } catch (error) {
    console.error('auth-test error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
