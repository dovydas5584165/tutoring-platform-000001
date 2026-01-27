import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '../../../lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const payment = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (payment.status !== 'succeeded') {
      return NextResponse.json({ error: 'Mokėjimas nebaigtas' }, { status: 403 });
    }

    // 1. Log to Database
    await supabase.from('purchases').upsert({ 
      payment_intent_id: paymentIntentId,
      amount: payment.amount,
      status: 'paid'
    }, { onConflict: 'payment_intent_id' });

    // 2. CREATE RESPONSE OBJECT FIRST
    const response = NextResponse.json({ success: true });

    // 3. FORCE COOKIE ONTO THE RESPONSE
    // This bypasses 'cookies()' helper issues by writing directly to headers
    response.cookies.set({
      name: 'test_session_token',
      value: paymentIntentId,
      httpOnly: false, // JavaScript can see it (vital for your debugging)
      secure: true,    // HTTPS only
      sameSite: 'lax', // vital for redirects
      maxAge: 60 * 60 * 4,
      path: '/',
    });

    // 4. Return the specific response with the cookie attached
    return response;

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
